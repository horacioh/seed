use async_channel::{Receiver, Sender};
use std::time::Duration;

pub mod pb {
    pub mod docs {
        tonic::include_proto!("com.seed.documents.v3alpha");
    }
}

/// Generated client code refers to p2p types via super::super::super::p2p::v1alpha.
pub mod p2p {
    pub mod v1alpha {
        tonic::include_proto!("com.seed.p2p.v1alpha");
    }
}

use pb::docs::{
    comments_client::CommentsClient, documents_client::DocumentsClient,
    resources_client::ResourcesClient, BlockNode,
};

#[derive(Debug, Clone)]
pub struct DocCard {
    pub iri: String,
    pub uid: String,
    pub path: String,
    pub title: String,
    pub snippet: String,
    pub version: String,
    pub out_links: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct CommentCard {
    pub id: String,
    pub author: String,
    pub snippet: String,
    pub target_iri: String,
    pub reply_parent: String,
}

#[derive(Debug)]
pub enum FetchCmd {
    Doc { uid: String, path: String },
    Comments { uid: String, path: String },
    Citations { iri: String },
    Directory { uid: String },
}

#[derive(Debug)]
pub enum FetchEvent {
    Doc(DocCard),
    Comments { target_iri: String, comments: Vec<CommentCard> },
    Citations { iri: String, citing: Vec<String> },
    Directory { uid: String, docs: Vec<(String, String)> },
    Error(String),
}

/// Parse `hm://uid/path?query#frag` into (uid, path-without-leading-slash).
/// Returns None for non-hm or empty uid.
pub fn parse_hm_url(s: &str) -> Option<(String, String)> {
    let s = s.strip_prefix("hm://")?;
    let s = s.split(['?', '#']).next()?;
    let mut it = s.splitn(2, '/');
    let uid = it.next()?;
    if uid.is_empty() {
        return None;
    }
    let path = it.next().unwrap_or("").trim_matches('/');
    Some((uid.to_string(), path.to_string()))
}

/// Canonical IRI for a document: `hm://uid` (root) or `hm://uid/path`.
pub fn hm_iri(uid: &str, path: &str) -> String {
    if path.is_empty() {
        format!("hm://{uid}")
    } else {
        format!("hm://{uid}/{path}")
    }
}

fn struct_str(s: &prost_types::Struct, key: &str) -> Option<String> {
    let v = s.fields.get(key)?;
    match v.kind.as_ref()? {
        prost_types::value::Kind::StringValue(s) => Some(s.clone()),
        _ => None,
    }
}

fn walk_blocks(nodes: &[BlockNode], text: &mut String, links: &mut Vec<String>) {
    for n in nodes {
        if let Some(b) = &n.block {
            if !b.text.is_empty() {
                if !text.is_empty() {
                    text.push(' ');
                }
                text.push_str(&b.text);
            }
            if b.link.starts_with("hm://") {
                links.push(b.link.clone());
            }
            for a in &b.annotations {
                if a.link.starts_with("hm://") {
                    links.push(a.link.clone());
                }
            }
        }
        walk_blocks(&n.children, text, links);
    }
}

fn doc_to_card(uid: &str, path: &str, doc: pb::docs::Document) -> DocCard {
    let title = doc
        .metadata
        .as_ref()
        .and_then(|m| struct_str(m, "name"))
        .filter(|n| !n.is_empty())
        .unwrap_or_else(|| {
            if path.is_empty() {
                format!("{}…", &uid[..12.min(uid.len())])
            } else {
                path.to_string()
            }
        });
    let mut text = String::new();
    let mut links = Vec::new();
    walk_blocks(&doc.content, &mut text, &mut links);
    links.sort();
    links.dedup();
    let out_links = links
        .into_iter()
        .filter_map(|l| parse_hm_url(&l).map(|(u, p)| hm_iri(&u, &p)))
        .filter(|iri| iri != &hm_iri(uid, path))
        .collect();
    let snippet: String = text.chars().take(220).collect();
    DocCard {
        iri: hm_iri(uid, path),
        uid: uid.to_string(),
        path: path.to_string(),
        title,
        snippet,
        version: doc.version,
        out_links,
    }
}

fn comment_to_card(c: pb::docs::Comment) -> CommentCard {
    let mut text = String::new();
    let mut links = Vec::new();
    walk_blocks(&c.content, &mut text, &mut links);
    let snippet: String = text.chars().take(160).collect();
    CommentCard {
        id: c.id,
        author: c.author,
        snippet: if snippet.is_empty() {
            "(empty comment)".into()
        } else {
            snippet
        },
        target_iri: hm_iri(&c.target_account, c.target_path.trim_start_matches('/')),
        reply_parent: c.reply_parent,
    }
}

pub fn spawn_data_thread(addr: String) -> (Sender<FetchCmd>, Receiver<FetchEvent>) {
    let (cmd_tx, cmd_rx) = async_channel::unbounded::<FetchCmd>();
    let (ev_tx, ev_rx) = async_channel::unbounded::<FetchEvent>();
    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async move {
            let endpoint = tonic::transport::Endpoint::new(addr)
                .unwrap()
                .timeout(Duration::from_secs(30))
                .connect_timeout(Duration::from_secs(5));
            let channel = endpoint.connect_lazy();
            while let Ok(cmd) = cmd_rx.recv().await {
                let ev_tx = ev_tx.clone();
                let channel = channel.clone();
                tokio::spawn(async move {
                    if let Err(e) = handle(cmd, channel, ev_tx.clone()).await {
                        let _ = ev_tx.send(FetchEvent::Error(format!("{e:#}"))).await;
                    }
                });
            }
        });
    });
    (cmd_tx, ev_rx)
}

async fn handle(
    cmd: FetchCmd,
    channel: tonic::transport::Channel,
    ev_tx: Sender<FetchEvent>,
) -> anyhow::Result<()> {
    match cmd {
        FetchCmd::Doc { uid, path } => {
            let mut c = DocumentsClient::new(channel);
            let resp = c
                .get_document(pb::docs::GetDocumentRequest {
                    account: uid.clone(),
                    path: if path.is_empty() {
                        path.clone()
                    } else {
                        format!("/{path}")
                    },
                    version: String::new(),
                })
                .await?
                .into_inner();
            ev_tx.send(FetchEvent::Doc(doc_to_card(&uid, &path, resp))).await?;
        }
        FetchCmd::Comments { uid, path } => {
            let mut c = CommentsClient::new(channel);
            let mut comments = Vec::new();
            let mut page_token = String::new();
            for _ in 0..4 {
                let resp = c
                    .list_comments(pb::docs::ListCommentsRequest {
                        target_account: uid.clone(),
                        target_path: if path.is_empty() {
                            String::new()
                        } else {
                            format!("/{path}")
                        },
                        page_size: 150,
                        page_token: page_token.clone(),
                    })
                    .await?
                    .into_inner();
                comments.extend(resp.comments.into_iter().map(comment_to_card));
                if resp.next_page_token.is_empty() {
                    break;
                }
                page_token = resp.next_page_token;
            }
            ev_tx
                .send(FetchEvent::Comments {
                    target_iri: hm_iri(&uid, &path),
                    comments,
                })
                .await?;
        }
        FetchCmd::Citations { iri } => {
            let mut c = ResourcesClient::new(channel);
            let resp = c
                .list_citations(pb::docs::ListCitationsRequest {
                    iri: iri.clone(),
                    page_size: 50,
                    page_token: String::new(),
                    reverse_order: true,
                })
                .await?
                .into_inner();
            let mut citing: Vec<String> = resp
                .citations
                .into_iter()
                .filter_map(|c| {
                    let doc = c.source_document;
                    parse_hm_url(&doc).map(|(u, p)| hm_iri(&u, &p))
                })
                .collect();
            citing.sort();
            citing.dedup();
            ev_tx.send(FetchEvent::Citations { iri, citing }).await?;
        }
        FetchCmd::Directory { uid } => {
            let mut c = DocumentsClient::new(channel);
            let mut docs = Vec::new();
            let mut page_token = String::new();
            for _ in 0..8 {
                let resp = c
                    .list_directory(pb::docs::ListDirectoryRequest {
                        account: uid.clone(),
                        directory_path: String::new(),
                        recursive: true,
                        page_size: 200,
                        page_token: page_token.clone(),
                        ..Default::default()
                    })
                    .await?
                    .into_inner();
                docs.extend(resp.documents.into_iter().filter_map(|d| {
                    let name = d
                        .metadata
                        .as_ref()
                        .and_then(|m| struct_str(m, "name"))
                        .unwrap_or_default();
                    Some((d.path.trim_start_matches('/').to_string(), name))
                }));
                if resp.next_page_token.is_empty() {
                    break;
                }
                page_token = resp.next_page_token;
            }
            ev_tx.send(FetchEvent::Directory { uid, docs }).await?;
        }
    }
    Ok(())
}
