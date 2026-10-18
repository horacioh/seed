use crate::data::{self, DocCard, FetchCmd, FetchEvent};
use async_channel::Sender;
use gpui::{
    canvas, div, point, prelude::*, px, rgb, Context, FontWeight, MouseButton,
    MouseDownEvent, MouseMoveEvent, MouseUpEvent, PathBuilder, Pixels, Point, Render,
    ScrollDelta, ScrollWheelEvent, Task, Window,
};
use std::collections::HashMap;

const DOC_W: f32 = 260.0;
const COMMENT_W: f32 = 200.0;
const DOC_H: f32 = 110.0;
const COMMENT_H: f32 = 90.0;

/// Pastel accent palette (kinopio-ish, red/green avoided for color-blindness).
const DOC_ACCENTS: [u32; 6] = [0x4A7FBF, 0x2E8B8B, 0xD97B29, 0x7C5CBF, 0xC95B9E, 0x5A8F3F];

const CANVAS_BG: u32 = 0xF5F3EE;
const COMMENT_BG: u32 = 0xFFF4C2;
const CARD_BORDER: u32 = 0xDDD8CE;
const TITLE_INK: u32 = 0x1A1A1A;
const MUTED_INK: u32 = 0x77716A;
const EDGE_LINK: u32 = 0x4A7FBF;
const EDGE_COMMENT: u32 = 0xD9A52E;
const EDGE_CITE: u32 = 0x9B8AC4;
const EDGE_HIER: u32 = 0xB8A98F;

#[derive(Clone, Copy, PartialEq)]
enum CardKind {
    Doc,
    Comment,
}

struct Card {
    key: String,
    kind: CardKind,
    title: String,
    subtitle: String,
    accent: u32,
    pos: Point<f32>, // world coords
    w: f32,
    expanded: bool,
    loading: bool,
}

impl Card {
    /// Estimated world height for edge anchoring (rendered height is text-driven).
    fn h(&self) -> f32 {
        if self.kind == CardKind::Comment {
            COMMENT_H
        } else {
            DOC_H
        }
    }

    fn center(&self) -> Point<f32> {
        point(self.pos.x + self.w / 2.0, self.pos.y + self.h() / 2.0)
    }
}

/// Tint a hex color toward white by `t` (0=original, 1=white).
fn tint(c: u32, t: f32) -> u32 {
    let r = ((c >> 16) & 0xFF) as f32;
    let g = ((c >> 8) & 0xFF) as f32;
    let b = (c & 0xFF) as f32;
    let f = |v: f32| (v + (255.0 - v) * t) as u32;
    (f(r) << 16) | (f(g) << 8) | f(b)
}

/// Shade a hex color toward black by `t`.
fn shade(c: u32, t: f32) -> u32 {
    let r = ((c >> 16) & 0xFF) as f32;
    let g = ((c >> 8) & 0xFF) as f32;
    let b = (c & 0xFF) as f32;
    let f = |v: f32| (v * (1.0 - t)) as u32;
    (f(r) << 16) | (f(g) << 8) | f(b)
}

enum DragState {
    None,
    Pan { start: Point<Pixels>, cam: Point<f32> },
    Card { key: String, grab: Point<f32>, moved: bool, start: Point<Pixels> },
}

pub struct CanvasView {
    cards: Vec<Card>,
    card_index: HashMap<String, usize>,
    /// (from_key, to_key, kind) — 0 link out, 1 comment anchor, 2 citation
    edges: Vec<(String, String, u8)>,
    camera: Point<f32>, // world coord at screen origin
    zoom: f32,
    drag: DragState,
    cmd_tx: Sender<FetchCmd>,
    /// doc iri -> out links, kept so expansion can spawn fetches
    doc_links: HashMap<String, Vec<String>>,
    /// doc iri being fetched -> parent card keys that linked to it
    pending_links: HashMap<String, Vec<String>>,
    /// parent card key -> how many child cards have been placed around it
    spawn_counts: HashMap<String, usize>,
    status: String,
    _pump: Task<()>,
}

impl CanvasView {
    pub fn new(
        root_uid: String,
        daemon_addr: String,
        cx: &mut Context<Self>,
    ) -> Self {
        let (cmd_tx, ev_rx) = data::spawn_data_thread(daemon_addr);
        let _ = cmd_tx.try_send(FetchCmd::Directory { uid: root_uid.clone() });
        let _ = cmd_tx.try_send(FetchCmd::Doc {
            uid: root_uid.clone(),
            path: String::new(),
        });

        let pump = cx.spawn(async move |this, cx| {
            while let Ok(ev) = ev_rx.recv().await {
                let _ = this.update(cx, |this, cx| this.on_event(ev, cx));
            }
        });

        Self {
            cards: Vec::new(),
            card_index: HashMap::new(),
            edges: Vec::new(),
            camera: point(-80.0, -120.0),
            zoom: 0.8,
            drag: DragState::None,
            cmd_tx,
            doc_links: HashMap::new(),
            pending_links: HashMap::new(),
            spawn_counts: HashMap::new(),
            status: format!("loading space {}", short_uid(&root_uid)),
            _pump: pump,
        }
    }

    // ---------- geometry ----------

    fn to_screen(&self, w: Point<f32>) -> Point<f32> {
        point((w.x - self.camera.x) * self.zoom, (w.y - self.camera.y) * self.zoom)
    }

    fn to_world(&self, s: Point<Pixels>) -> Point<f32> {
        point(
            f32::from(s.x) / self.zoom + self.camera.x,
            f32::from(s.y) / self.zoom + self.camera.y,
        )
    }

    // ---------- events from data layer ----------

    fn on_event(&mut self, ev: FetchEvent, cx: &mut Context<Self>) {
        match ev {
            FetchEvent::Doc(d) => self.on_doc(d, cx),
            FetchEvent::Comments { target_iri, comments } => {
                self.on_comments(target_iri, comments, cx)
            }
            FetchEvent::Citations { iri, citing } => self.on_citations(iri, citing, cx),
            FetchEvent::Directory { uid, docs } => self.on_directory(uid, docs, cx),
            FetchEvent::Error(e) => {
                self.status = format!("error: {}", e);
                cx.notify();
            }
        }
    }

    fn add_card(&mut self, card: Card) -> usize {
        if let Some(&i) = self.card_index.get(&card.key) {
            return i;
        }
        let i = self.cards.len();
        self.card_index.insert(card.key.clone(), i);
        self.cards.push(card);
        i
    }

    fn on_doc(&mut self, doc: DocCard, cx: &mut Context<Self>) {
        let iri = doc.iri.clone();
        self.doc_links.insert(iri.clone(), doc.out_links.clone());
        // place near whichever parent was waiting for it, staggered per parent
        let parents = self.pending_links.remove(&doc.iri).unwrap_or_default();
        let pos = if let Some(pk) = parents.first() {
            let pi = self.card_index[pk];
            let pp = self.cards[pi].pos;
            let k = *self.spawn_counts.get(pk).unwrap_or(&0);
            self.spawn_counts.insert(pk.clone(), k + 1);
            // alternate above/below, marching right
            let row = (k % 5) as f32;
            let col = (k / 5) as f32;
            point(
                pp.x + DOC_W + 120.0 + col * (DOC_W + 60.0),
                pp.y + (row - 2.0) * 110.0,
            )
        } else if self.cards.is_empty() {
            point(0.0, 0.0)
        } else {
            point(40.0 + self.cards.len() as f32 * 20.0, 40.0)
        };
        let accent = DOC_ACCENTS[(self.cards.len()) % DOC_ACCENTS.len()];
        let i = self.add_card(Card {
            key: doc.iri.clone(),
            kind: CardKind::Doc,
            title: doc.title.clone(),
            subtitle: if doc.path.is_empty() {
                "space root".to_string()
            } else {
                format!("/{}", doc.path)
            },
            accent,
            pos,
            w: DOC_W,
            expanded: false,
            loading: false,
        });
        if let Some(c) = self.cards.get_mut(i) {
            let base = if doc.path.is_empty() {
                "space root".to_string()
            } else {
                format!("/{}", doc.path)
            };
            c.subtitle = format!("{base} · {} links", doc.out_links.len());
        }
        for pk in &parents {
            self.edges.push((pk.clone(), doc.iri.clone(), 0));
        }
        if self.cards[i].expanded {
            // card already existed from the directory listing — expand now that links are known
            self.spawn_links(&iri);
        }
        self.status = format!("{} cards · {} edges", self.cards.len(), self.edges.len());
        cx.notify();
    }

    fn on_directory(
        &mut self,
        uid: String,
        docs: Vec<(String, String)>,
        cx: &mut Context<Self>,
    ) {
        for (k, (path, name)) in docs.into_iter().enumerate() {
            let iri = data::hm_iri(&uid, &path);
            // hierarchy edge to the parent path once both cards exist
            if let Some(cut) = path.rfind('/') {
                let parent_iri = data::hm_iri(&uid, &path[..cut]);
                self.edges.push((parent_iri, iri.clone(), 3));
            } else if !path.is_empty() {
                // top-level doc: child of the space root card
                self.edges.push((data::hm_iri(&uid, ""), iri.clone(), 3));
            }
            if self.card_index.contains_key(&iri) {
                continue;
            }
            let col = (k % 4) as f32;
            let row = (k / 4) as f32;
            // deterministic jitter so the grid reads organic, not tabular
            let jx = ((k * 37 + 11) % 41) as f32 - 20.0;
            let jy = ((k * 53 + 7) % 37) as f32 - 18.0;
            self.add_card(Card {
                key: iri,
                kind: CardKind::Doc,
                title: if name.is_empty() {
                    format!("/{path}")
                } else {
                    name
                },
                subtitle: format!("/{path}"),
                accent: DOC_ACCENTS[k % DOC_ACCENTS.len()],
                pos: point(
                    DOC_W + 180.0 + col * (DOC_W + 70.0) + jx,
                    60.0 + row * 155.0 + jy,
                ),
                w: DOC_W,
                expanded: false,
                loading: false,
            });
        }
        self.status = format!("{} cards · {} edges", self.cards.len(), self.edges.len());
        cx.notify();
    }

    fn on_comments(
        &mut self,
        target_iri: String,
        comments: Vec<data::CommentCard>,
        cx: &mut Context<Self>,
    ) {
        let Some(&ti) = self.card_index.get(&target_iri) else {
            return;
        };
        let tp = self.cards[ti].center();
        for (k, cm) in comments.into_iter().enumerate() {
            let key = format!("comment:{}", cm.id);
            if self.card_index.contains_key(&key) {
                continue;
            }
            // radial fan below the target card: rings of 9, -70..+70 deg
            let ring = (k / 9) as f32;
            let slot = (k % 9) as f32;
            let angle = (slot / 8.0 - 0.5) * 2.1 + (ring * 0.35); // radians below the card
            let r = 250.0 + ring * 175.0;
            let ci = self.add_card(Card {
                key: key.clone(),
                kind: CardKind::Comment,
                title: cm.snippet.clone(),
                subtitle: format!("@{}", &cm.author[..12.min(cm.author.len())]),
                accent: EDGE_COMMENT,
                pos: point(
                    tp.x + angle.sin() * r - COMMENT_W / 2.0,
                    tp.y + angle.cos() * r - COMMENT_H / 2.0,
                ),
                w: COMMENT_W,
                expanded: false,
                loading: false,
            });
            let _ = ci;
            self.edges.push((key, target_iri.clone(), 1));
        }
        self.status = format!("{} cards · {} edges", self.cards.len(), self.edges.len());
        cx.notify();
    }

    fn on_citations(&mut self, iri: String, citing: Vec<String>, cx: &mut Context<Self>) {
        if !self.card_index.contains_key(&iri) {
            return;
        }
        for src in citing.iter().take(6) {
            if self.card_index.contains_key(src) {
                if !self
                    .edges
                    .iter()
                    .any(|(a, b, k)| a == src && b == &iri && *k == 2)
                {
                    self.edges.push((src.clone(), iri.clone(), 2));
                }
                continue;
            }
            // fetch the citing document; it lands as a new card linked back
            if let Some((uid, path)) = data::parse_hm_url(src) {
                self.pending_links
                    .entry(src.clone())
                    .or_default()
                    .push(iri.clone());
                let _ = self.cmd_tx.try_send(FetchCmd::Doc { uid, path });
            }
        }
        self.status = format!("{} cards · {} edges", self.cards.len(), self.edges.len());
        cx.notify();
    }

    // ---------- input ----------

    fn start_pan(&mut self, ev: &MouseDownEvent) {
        self.drag = DragState::Pan {
            start: ev.position,
            cam: self.camera,
        };
    }

    fn start_card_drag(&mut self, key: String, ev: &MouseDownEvent) {
        let w = self.to_world(ev.position);
        let Some(&i) = self.card_index.get(&key) else { return };
        let cp = self.cards[i].pos;
        self.drag = DragState::Card {
            key,
            grab: point(w.x - cp.x, w.y - cp.y),
            moved: false,
            start: ev.position,
        };
    }

    fn on_mouse_move(&mut self, ev: &MouseMoveEvent, cx: &mut Context<Self>) {
        match &self.drag {
            DragState::Pan { start, cam } => {
                let dx = f32::from(ev.position.x - start.x);
                let dy = f32::from(ev.position.y - start.y);
                self.camera = point(cam.x - dx / self.zoom, cam.y - dy / self.zoom);
                cx.notify();
            }
            DragState::Card { key, grab, start, .. } => {
                let dx = f32::from(ev.position.x - start.x);
                let dy = f32::from(ev.position.y - start.y);
                if dx.abs() + dy.abs() > 8.0 {
                    let w = self.to_world(ev.position);
                    let key = key.clone();
                    let grab = *grab;
                    if let Some(&i) = self.card_index.get(&key) {
                        self.cards[i].pos = point(w.x - grab.x, w.y - grab.y);
                    }
                    if let DragState::Card { moved, .. } = &mut self.drag {
                        *moved = true;
                    }
                    cx.notify();
                }
            }
            DragState::None => {}
        }
    }

    fn on_mouse_up(&mut self, _ev: &MouseUpEvent, cx: &mut Context<Self>) {
        let drag = std::mem::replace(&mut self.drag, DragState::None);
        if let DragState::Card { key, moved, .. } = drag {
            if !moved {
                if let Some(&i) = self.card_index.get(&key) {
                    self.expand_card(i, cx);
                }
            }
        }
    }

    fn on_scroll(&mut self, ev: &ScrollWheelEvent, cx: &mut Context<Self>) {
        let dy: f32 = match ev.delta {
            ScrollDelta::Pixels(p) => f32::from(p.y),
            ScrollDelta::Lines(p) => p.y * 20.0,
        };
        let factor = (1.0 - dy * 0.0018).clamp(0.8, 1.25);
        let new_zoom = (self.zoom * factor).clamp(0.25, 2.5);
        // zoom toward cursor: keep world point under cursor fixed
        let cursor = self.to_world(ev.position);
        self.zoom = new_zoom;
        self.camera = point(
            cursor.x - f32::from(ev.position.x) / self.zoom,
            cursor.y - f32::from(ev.position.y) / self.zoom,
        );
        cx.notify();
    }

    fn expand_card(&mut self, i: usize, cx: &mut Context<Self>) {
        let card = &mut self.cards[i];
        if card.kind != CardKind::Doc || card.expanded {
            return;
        }
        card.expanded = true;
        card.loading = true;
        let key = card.key.clone();
        if let Some((uid, path)) = data::parse_hm_url(&key) {
            let _ = self.cmd_tx.try_send(FetchCmd::Doc {
                uid: uid.clone(),
                path: path.clone(),
            });
            let _ = self.cmd_tx.try_send(FetchCmd::Comments {
                uid: uid.clone(),
                path: path.clone(),
            });
            let _ = self.cmd_tx.try_send(FetchCmd::Citations { iri: key.clone() });
        }
        self.spawn_links(&key);
        self.status = format!("expanding {}…", self.cards[i].title);
        cx.notify();
    }

    /// Spawn/fetch cards for a doc's known out-links (up to 10).
    fn spawn_links(&mut self, key: &str) {
        for link in self.doc_links.get(key).cloned().unwrap_or_default().into_iter().take(10) {
            if self.card_index.contains_key(&link) {
                if !self
                    .edges
                    .iter()
                    .any(|(a, b, k)| a == key && b == &link && *k == 0)
                {
                    self.edges.push((key.to_string(), link, 0));
                }
                continue;
            }
            if let Some((u, p)) = data::parse_hm_url(&link) {
                self.pending_links
                    .entry(link)
                    .or_default()
                    .push(key.to_string());
                let _ = self.cmd_tx.try_send(FetchCmd::Doc { uid: u, path: p });
            }
        }
    }

    // ---------- render ----------

    fn render_card(&self, i: usize, cx: &mut Context<Self>) -> impl IntoElement {
        let card = &self.cards[i];
        let s = self.to_screen(card.pos);
        let z = self.zoom;
        let w = card.w * z;
        let bg = if card.kind == CardKind::Comment {
            COMMENT_BG
        } else {
            tint(card.accent, 0.86)
        };
        let border = if card.kind == CardKind::Comment {
            shade(EDGE_COMMENT, 0.15)
        } else {
            tint(card.accent, 0.35)
        };
        let key = card.key.clone();
        let title = card.title.clone();
        let subtitle = card.subtitle.clone();
        let accent = card.accent;
        div()
            .absolute()
            .left(px(s.x))
            .top(px(s.y))
            .w(px(w))
            .rounded(px(10.0 * z.max(0.6)))
            .bg(rgb(bg))
            .border_1()
            .border_color(rgb(border))
            .shadow_lg()
            .overflow_hidden()
            .cursor_grab()
            .on_mouse_down(
                MouseButton::Left,
                cx.listener(move |this, ev: &MouseDownEvent, _w, cx| {
                    this.start_card_drag(key.clone(), ev);
                    cx.stop_propagation();
                }),
            )
            .child(
                div()
                    .p(px(9.0 * z.max(0.5)))
                    .flex()
                    .flex_col()
                    .gap(px(5.0 * z))
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .items_start()
                            .gap(px(6.0 * z))
                            .child(
                                div()
                                    .mt(px(3.0 * z))
                                    .w(px(7.0 * z.max(0.6)))
                                    .h(px(7.0 * z.max(0.6)))
                                    .flex_shrink_0()
                                    .rounded_full()
                                    .bg(rgb(accent)),
                            )
                            .child(
                                div()
                                    .text_size(px(12.0 * z.max(0.6)))
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .text_color(rgb(TITLE_INK))
                                    .child(title),
                            ),
                    )
                    .child(
                        div()
                            .text_size(px(9.5 * z.max(0.6)))
                            .text_color(rgb(shade(accent, 0.35)))
                            .child(subtitle),
                    ),
            )
    }

    fn edge_segments(&self) -> Vec<(Point<f32>, Point<f32>, u8)> {
        let mut out = Vec::new();
        for (a, b, kind) in &self.edges {
            let (Some(&ia), Some(&ib)) =
                (self.card_index.get(a), self.card_index.get(b))
            else {
                continue;
            };
            let ca = &self.cards[ia];
            let cb = &self.cards[ib];
            // anchor on the card edge that faces the other endpoint
            let ac = ca.center();
            let bc = cb.center();
            let dx = bc.x - ac.x;
            let dy = bc.y - ac.y;
            let anchor = |c: &Card, sx: f32, sy: f32| -> Point<f32> {
                if sx.abs() >= sy.abs() * 0.6 {
                    point(c.pos.x + if sx > 0.0 { c.w } else { 0.0 }, c.pos.y + c.h() / 2.0)
                } else {
                    point(c.pos.x + c.w / 2.0, c.pos.y + if sy > 0.0 { c.h() } else { 0.0 })
                }
            };
            let pa = self.to_screen(anchor(ca, dx, dy));
            let pb = self.to_screen(anchor(cb, -dx, -dy));
            out.push((pa, pb, *kind));
        }
        out
    }
}

fn short_uid(uid: &str) -> String {
    format!("{}…", &uid[..10.min(uid.len())])
}

impl Render for CanvasView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let segments = self.edge_segments();
        let edges_layer = canvas(
            move |_, _, _| segments,
            move |bounds, segments, window, _| {
                let _ = bounds;
                for (i, (a, b, kind)) in segments.iter().enumerate() {
                    let color = match kind {
                        1 => EDGE_COMMENT,
                        2 => EDGE_CITE,
                        3 => EDGE_HIER,
                        _ => EDGE_LINK,
                    };
                    let mut builder = PathBuilder::stroke(px(1.8));
                    if *kind == 2 {
                        builder = builder.dash_array(&[px(6.0), px(4.0)]);
                    }
                    // cubic arc bowed perpendicular to travel — organic kinopio curve
                    let dx = b.x - a.x;
                    let dy = b.y - a.y;
                    let len = (dx * dx + dy * dy).sqrt().max(1.0);
                    let ux = dx / len;
                    let uy = dy / len;
                    let perp_x = -uy;
                    let perp_y = ux;
                    let amp = (len * 0.30).min(140.0) * (0.8 + (i % 5) as f32 * 0.09);
                    let c1 = point(
                        px(a.x + ux * len * 0.24 + perp_x * amp),
                        px(a.y + uy * len * 0.24 + perp_y * amp),
                    );
                    let c2 = point(
                        px(b.x - ux * len * 0.24 + perp_x * amp),
                        px(b.y - uy * len * 0.24 + perp_y * amp),
                    );
                    builder.move_to(point(px(a.x), px(a.y)));
                    builder.cubic_bezier_to(point(px(b.x), px(b.y)), c1, c2);
                    if let Ok(path) = builder.build() {
                        window.paint_path(path, rgb(color).alpha(0.85));
                    }
                    // endpoint dots, kinopio connector handles
                    for p in [a, b] {
                        let mut dot = PathBuilder::fill();
                        let pts: Vec<Point<Pixels>> = (0..10)
                            .map(|n| {
                                let ang = n as f32 / 10.0 * std::f32::consts::TAU;
                                point(
                                    px(p.x + 3.4 * ang.cos()),
                                    px(p.y + 3.4 * ang.sin()),
                                )
                            })
                            .collect();
                        dot.add_polygon(&pts, true);
                        if let Ok(d) = dot.build() {
                            window.paint_path(d, rgb(color));
                        }
                    }
                }
            },
        )
        .size_full();

        let mut root = div()
            .size_full()
            .bg(rgb(CANVAS_BG))
            .overflow_hidden()
            .child(edges_layer)
            .on_mouse_down(
                MouseButton::Left,
                cx.listener(|this, ev: &MouseDownEvent, _w, _cx| this.start_pan(ev)),
            )
            .on_mouse_move(cx.listener(|this, ev: &MouseMoveEvent, _w, cx| {
                this.on_mouse_move(ev, cx)
            }))
            .on_mouse_up(
                MouseButton::Left,
                cx.listener(|this, ev: &MouseUpEvent, _w, cx| this.on_mouse_up(ev, cx)),
            )
            .on_scroll_wheel(cx.listener(|this, ev: &ScrollWheelEvent, _w, cx| {
                this.on_scroll(ev, cx)
            }));

        for i in 0..self.cards.len() {
            root = root.child(self.render_card(i, cx));
        }

        // toolbar card
        let docs = self
            .cards
            .iter()
            .filter(|c| c.kind == CardKind::Doc)
            .count();
        let comments = self.cards.len() - docs;
        root.child(
            div()
                .absolute()
                .left(px(12.0))
                .top(px(12.0))
                .rounded(px(10.0))
                .bg(rgb(0xFFFFFF))
                .border_1()
                .border_color(rgb(CARD_BORDER))
                .shadow_sm()
                .p(px(10.0))
                .flex()
                .flex_col()
                .gap(px(2.0))
                .child(
                    div()
                        .text_size(px(13.0))
                        .font_weight(FontWeight::BOLD)
                        .text_color(rgb(TITLE_INK))
                        .child("Seed Canvas"),
                )
                .child(
                    div()
                        .text_size(px(10.0))
                        .text_color(rgb(MUTED_INK))
                        .child(format!("{} docs · {} comments", docs, comments)),
                )
                .child(
                    div()
                        .text_size(px(9.0))
                        .text_color(rgb(MUTED_INK))
                        .child("drag to pan · scroll to zoom · click card to expand"),
                )
                .child(
                    div()
                        .text_size(px(9.0))
                        .text_color(rgb(MUTED_INK))
                        .child(self.status.clone()),
                ),
        )
    }
}
