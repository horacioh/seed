import * as stylex from '@stylexjs/stylex';
import { HMBlockNode, HMComment } from '@seed-hypermedia/client/hm-types';
import { getCommentTargetId, hmId, hmIdPathToEntityQueryPath, packHmId, useAuthoredComments, useCapabilities, useChanges, useChildrenList, useCitations, useComments, useRawResource, useResource } from '@shm/shared';
import { useCommentVersions } from '@shm/shared/models/comments';
import { MessageCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useApiHost } from '../apiHostStore';
import { exploreHref, exploreTabHref, parseHmRoutePath, tabToViewTerm, viewTermToExploreTab } from '../utils/exploreHref';
import { useHmNavigate } from '../utils/useHmNavigate';
import { CopyTextButton } from './CopyTextButton';
import { ExternalOpenButton, OpenInAppButton } from './ExternalOpenButton';
import Tabs, { getSafeCurrentTab, getTabs, TabType } from './Tabs';
import AuthoredCommentsTab from './tabs/AuthoredCommentsTab';
import CapabilitiesTab from './tabs/CapabilitiesTab';
import ChangesTab from './tabs/ChangesTab';
import { ChildrenDocsTab } from './tabs/ChildrenDocsTab';
import CitationsTab from './tabs/CitationsTab';
import CommentVersionsTab from './tabs/CommentVersionsTab';
import CommentsTab from './tabs/CommentsTab';
import DocumentTab from './tabs/DocumentTab';
import ProfileTab from './tabs/ProfileTab';
import { ResourceStatus } from './ResourceStatus';
import { Title } from './Title';

/** Resource states rendered as a status panel instead of the tabbed document view. */
const styles_2 = stylex.create({
  se7814c81: {
    "width": "100%",
    "@media ((min-width: 640px))": {
      "maxWidth": "40rem"
    },
    "@media ((min-width: 768px))": {
      "maxWidth": "48rem"
    },
    "@media ((min-width: 1024px))": {
      "maxWidth": "64rem"
    },
    "@media ((min-width: 1280px))": {
      "maxWidth": "80rem"
    },
    "@media ((min-width: 1536px))": {
      "maxWidth": "96rem"
    }
  },
  s5574c491: {
    "marginInline": "auto"
  },
  sfcf3a2ae: {
    "maxWidth": "100%"
  },
  s92852dd5: {
    "overflow": "hidden"
  },
  s1aa17: {
    "padding": "calc(0.25rem * 4)"
  },
  s3301fc: {
    "marginBottom": "calc(0.25rem * 4)"
  },
  s2ffff9: {
    "display": "flex"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  s5d936fb: {
    "gap": "calc(0.25rem * 2)"
  },
  sf799889b: {
    "borderRadius": "var(--radius)"
  },
  sad8c742c: {
    "borderStyle": "solid",
    "borderWidth": "1px"
  },
  s67caa40: {
    "borderColor": "oklch(88.2% 0.059 254.128)"
  },
  s6d484366: {
    "backgroundColor": "oklch(97% 0.014 254.604)"
  },
  s1aa16: {
    "padding": "calc(0.25rem * 3)"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  s8b977d24: {
    "color": "oklch(48.8% 0.243 264.376)"
  },
  sf7fb00e8: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  s4b3d6148: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(93.2% 0.032 255.585)"
      }
    }
  },
  s3f58665f: {
    "minWidth": "calc(0.25rem * 0)"
  },
  s6e724d66: {
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap"
  },
  s62c182b1: {
    "fontWeight": "600"
  }
});
const styles = stylex.create({
  s3301fc: {
    marginBottom: 'calc(0.25rem * 4)'
  },
  s9416e008: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0'
  },
  sb15c2b53: {
    flexShrink: '0',
    fontWeight: '500'
  }
});
const STATUS_RESOURCE_TYPES = ['redirect', 'tombstone', 'not-found', 'error'] as const;

/** Returns all descendant replies for a comment in the same order they were loaded. */
export function getReplyComments(comments: HMComment[] | undefined, commentId: string | null | undefined): HMComment[] {
  if (!Array.isArray(comments) || !commentId) {
    return [];
  }
  const descendantIds = new Set<string>();
  let foundNewReply = true;
  while (foundNewReply) {
    foundNewReply = false;
    comments.forEach(comment => {
      if (!comment.replyParent || descendantIds.has(comment.id)) {
        return;
      }
      if (comment.replyParent === commentId || descendantIds.has(comment.replyParent)) {
        descendantIds.add(comment.id);
        foundNewReply = true;
      }
    });
  }
  return comments.filter(comment => descendantIds.has(comment.id));
}
export default function HM() {
  const {
    '*': path
  } = useParams();
  const [searchParams] = useSearchParams();
  // Strip any trailing view term (e.g. /:profile, /:comments) so it doesn't
  // leak into the entity path, and remember which tab it implies. A
  // /:comments/<commentId> tail resolves `uid`/`hmPath` to the comment itself.
  const {
    uid,
    path: hmPath,
    viewTerm,
    commentId: routeCommentId
  } = parseHmRoutePath(path);
  const apiHost = useApiHost();
  const navigate = useHmNavigate();
  const id = hmId(uid, {
    path: hmPath,
    version: searchParams.get('v') ? searchParams.get('v') : undefined
  });
  // Use the redirect-preserving fetch so the explorer can display redirects,
  // tombstones, and not-found states instead of silently following them.
  const {
    data
  } = useRawResource(id);
  const resourceType = data?.type;
  // The document a comment is attached to. Non-null only when viewing a comment,
  // so the comment page can link back to what it's commenting on.
  const commentTargetId = useMemo(() => {
    if (data?.type !== 'comment') return null;
    return getCommentTargetId(data.comment) ?? null;
  }, [data]);
  const commentsTargetId = commentTargetId ?? id;
  const {
    data: commentTargetResource
  } = useResource(commentTargetId);
  const commentTargetName = commentTargetResource?.type === 'document' ? commentTargetResource.document.metadata?.name : undefined;
  const {
    data: commentsResponse
  } = useComments(commentsTargetId);
  const comments = useMemo(() => {
    if (data?.type !== 'comment') {
      return commentsResponse?.comments;
    }
    return getReplyComments(commentsResponse?.comments, data.comment.id);
  }, [commentsResponse?.comments, data]);
  const {
    data: authoredComments
  } = useAuthoredComments(id);
  const {
    data: citations
  } = useCitations(resourceType === 'document' || resourceType === 'comment' ? id : null);
  const {
    data: changes
  } = useChanges(resourceType === 'document' ? id : null);
  const commentId = data?.type === 'comment' ? data.comment.id : null;
  const {
    data: commentVersions
  } = useCommentVersions(commentId);
  const {
    data: capabilities
  } = useCapabilities(id);
  const {
    data: childrenDocs
  } = useChildrenList(id);
  const url = packHmId(id);
  const tabs = useMemo(() => getTabs({
    id,
    resourceType,
    changeCount: changes?.changes?.length,
    versionCount: commentVersions?.versions?.length,
    commentCount: comments?.length,
    citationCount: citations?.citations?.length,
    capabilityCount: capabilities?.length,
    childrenCount: childrenDocs?.length,
    authoredCommentCount: authoredComments?.comments?.length
  }), [authoredComments?.comments?.length, capabilities?.length, changes?.changes?.length, childrenDocs?.length, citations?.citations?.length, commentVersions?.versions?.length, comments?.length, id, resourceType]);

  // A view term in the path (e.g. /:comments) is the canonical tab selector;
  // `?tab=` is only consulted for explore-only tabs that have no view term.
  // When a commentId resolved the resource, :comments was the locator (not a
  // tab), so let the comment open on its default document view.
  const viewTermTab = routeCommentId ? null : viewTermToExploreTab(viewTerm);
  const currentTab = getSafeCurrentTab(viewTermTab ?? searchParams.get('tab'), tabs);

  // Function to change tabs. Always navigate via the clean base path so any
  // current view term is dropped: tabs backed by a view term encode it in the
  // path (/:comments), explore-only tabs fall back to a `?tab=` query param.
  const handleTabChange = (tab: TabType) => {
    navigate(exploreTabHref(id, tab, searchParams));
  };
  const preparedData = useMemo(() => {
    if (!data) return null;

    // Handle different resource types
    if (data.type === 'document') {
      const doc = data.document;
      const {
        metadata,
        account,
        authors,
        genesis,
        version,
        content,
        ...rest
      } = doc;
      const cleaned: Record<string, any> = {
        ...metadata,
        ...rest
      };
      if (account) {
        cleaned.account = `hm://${account}`;
      }
      if (authors) {
        cleaned.authors = authors.map((author: string) => `hm://${author}`);
      }
      if (version) {
        cleaned.version = version.split('.').map((changeCid: string) => `ipfs://${changeCid}`);
        cleaned.exactDocumentVersion = packHmId({
          ...id,
          version: version
        });
      }
      if (genesis) {
        cleaned.genesis = `ipfs://${genesis}`;
      }
      if (content) {
        cleaned.content = content.map(flattenBlockNode);
      }
      return flattenSingleItemArrays(cleaned);
    }
    if (data.type === 'comment') {
      return {
        type: 'comment',
        comment: data.comment
      };
    }

    // Redirect / tombstone / not-found / error are rendered by <ResourceStatus />.
    return null;
  }, [data, id]);

  // Render tab content based on current tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'profile':
        return <ProfileTab metadata={data?.type === 'document' ? data.document.metadata : undefined} onNavigate={navigate} />;
      case 'document':
        return <DocumentTab data={preparedData} onNavigate={navigate} />;
      case 'changes':
        return <ChangesTab changes={changes?.changes} docId={id} />;
      case 'versions':
        return <CommentVersionsTab versions={commentVersions?.versions} />;
      case 'comments':
        return <CommentsTab comments={comments} emptyMessage={resourceType === 'comment' ? 'No replies yet' : 'No comments available'} />;
      case 'citations':
        return <CitationsTab citations={citations?.citations} />;
      case 'capabilities':
        return <CapabilitiesTab capabilities={capabilities} />;
      case 'children':
        return <ChildrenDocsTab list={childrenDocs} id={id} />;
      case 'authored-comments':
        return <AuthoredCommentsTab comments={authoredComments?.comments} />;
      default:
        return null;
    }
  };
  let webUrl = `${apiHost}/hm/${id.uid}${hmIdPathToEntityQueryPath(id.path)}`;
  if (id.version) {
    webUrl += `?v=${id.version}`;
  }
  const isStatusResource = !!data && STATUS_RESOURCE_TYPES.includes(data.type as (typeof STATUS_RESOURCE_TYPES)[number]);
  return <div className={stylex.props(styles_2.se7814c81, styles_2.s5574c491, styles_2.sfcf3a2ae, styles_2.s92852dd5, styles_2.s1aa17).className || ""}>
      <Title className={stylex.props(styles.s3301fc).className || ''} buttons={<>
            <CopyTextButton text={url} />
            <ExternalOpenButton url={webUrl} />
            <OpenInAppButton url={url} />
          </>} title={url} />

      {commentTargetId && <Link to={exploreHref(commentTargetId)} className={stylex.props(styles_2.s3301fc, styles_2.s2ffff9, styles_2.sc6ed1702, styles_2.s5d936fb, styles_2.sf799889b, styles_2.sad8c742c, styles_2.s67caa40, styles_2.s6d484366, styles_2.s1aa16, styles_2.sab7cc6fa, styles_2.s8b977d24, styles_2.sf7fb00e8, styles_2.s4b3d6148).className || ""}>
          <MessageCircle className={stylex.props(styles.s9416e008).className || ''} />
          <span className={stylex.props(styles.sb15c2b53).className || ''}>Comment on</span>
          <span className={stylex.props(styles_2.s3f58665f, styles_2.s6e724d66, styles_2.s62c182b1).className || ""}>
            {commentTargetName || `${commentTargetId.uid}${hmIdPathToEntityQueryPath(commentTargetId.path)}`}
          </span>
        </Link>}

      {isStatusResource ? <ResourceStatus data={data} /> : <>
          <Tabs id={id} resourceType={resourceType} currentTab={currentTab} onTabChange={handleTabChange} changeCount={changes?.changes?.length} versionCount={commentVersions?.versions?.length} commentCount={comments?.length} citationCount={citations?.citations?.length} capabilityCount={capabilities?.length} childrenCount={childrenDocs?.length} authoredCommentCount={authoredComments?.comments?.length} />
          <div className="tab-content">{renderTabContent()}</div>
        </>}
    </div>;
}
function flattenBlockNode(node: HMBlockNode) {
  const {
    block,
    children
  } = node;
  const out: Record<string, unknown> = {
    ...block
  };
  if (children && Array.isArray(children)) {
    out.children = children.map(flattenBlockNode);
  }
  return out;
}
function flattenSingleItemArrays(obj: any): any {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      if (obj[key].length === 1) {
        obj[key] = obj[key][0];
      } else {
        obj[key] = obj[key].map(flattenSingleItemArrays);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      obj[key] = flattenSingleItemArrays(obj[key]);
    }
  }
  return obj;
}