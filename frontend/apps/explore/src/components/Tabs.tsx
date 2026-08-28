import * as stylex from '@stylexjs/stylex';
import { UnpackedHypermediaId } from '@seed-hypermedia/client/hm-types';
import { pluralS } from '@shm/shared';
import React from 'react';

/** Supported Explore tabs for a resource page. */
const styles_4 = stylex.create({
  s6cb46866: {
    "borderBottomStyle": "solid",
    "borderBottomWidth": "2px"
  },
  s67cb944: {
    "borderColor": "oklch(54.6% 0.245 262.881)"
  }
});
const styles_3 = stylex.create({
  sd5276459: {
    "display": "inline-block"
  },
  s880858c0: {
    "flexShrink": "0"
  },
  sc5a0131: {
    "borderColor": "transparent"
  },
  s1aa15: {
    "padding": "calc(0.25rem * 2)"
  },
  sf8e652db: {
    "whiteSpace": "nowrap"
  },
  s775ae258: {
    "borderRadius": "0"
  },
  s7c401ecf: {
    "borderStyle": "solid",
    "borderWidth": "0px"
  },
  s8b977963: {
    "color": "oklch(54.6% 0.245 262.881)"
  },
  s29df1839: {
    "borderStyle": "none"
  }
});
const styles_2 = stylex.create({
  s2ffff9: {
    "display": "flex"
  },
  sa12945df: {
    "flexWrap": "nowrap"
  },
  saa841a0f: {
    "overflowX": "auto"
  },
  s34b1ad: {
    "paddingInline": "calc(0.25rem * 2)"
  },
  s65e234f5: {
    "textAlign": "center"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  s129e46b3: {
    "fontWeight": "500"
  },
  s3411ddae: {
    "@media ((min-width: 768px))": {
      "paddingInline": "calc(0.25rem * 0)"
    }
  }
});
const styles = stylex.create({
  sfbc0224e: {
    marginBottom: 'calc(0.25rem * 4)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)'
  }
});
export type TabType = 'profile' | 'document' | 'changes' | 'versions' | 'comments' | 'citations' | 'capabilities' | 'children' | 'authored-comments';
type ResourceType = 'document' | 'comment' | 'redirect' | 'not-found' | 'tombstone' | 'error' | undefined;

/** Tab metadata used to render the Explore tab bar. */
export interface TabDefinition {
  id: TabType;
  label: string;
}
interface TabCounts {
  changeCount?: number;
  versionCount?: number;
  commentCount?: number;
  citationCount?: number;
  capabilityCount?: number;
  childrenCount?: number;
  authoredCommentCount?: number;
}

/** Builds the tab list for a resource based on its resolved type and query counts. */
export function getTabs({
  id,
  resourceType,
  changeCount = 0,
  versionCount = 0,
  commentCount = 0,
  citationCount = 0,
  capabilityCount = 0,
  childrenCount = 0,
  authoredCommentCount = 0
}: {
  id: UnpackedHypermediaId;
  resourceType?: ResourceType;
} & TabCounts): TabDefinition[] {
  const isAccountRoot = !id.path?.filter(p => !!p).length;
  const tabs: TabDefinition[] = [];

  // Accounts expose a Profile view (their home document as a profile); the raw
  // Document State stays available alongside it.
  if (isAccountRoot && resourceType === 'document') {
    tabs.push({
      id: 'profile',
      label: 'Profile'
    });
  }
  tabs.push({
    id: 'document',
    label: `${resourceType === 'comment' ? 'Comment' : 'Document'} State${id.version ? ` (Exact Version)` : ''}`
  });
  if (resourceType === 'document') {
    tabs.push({
      id: 'changes',
      label: `${changeCount} ${pluralS(changeCount, 'Change')}`
    });
  }
  if (resourceType === 'comment') {
    tabs.push({
      id: 'versions',
      label: `${versionCount} ${pluralS(versionCount, 'Version')}`
    });
  }

  // On a comment this tab lists the comment's replies; on a document it lists
  // top-level comments.
  tabs.push({
    id: 'comments',
    label: resourceType === 'comment' ? `${commentCount} ${pluralS(commentCount, 'Reply', 'Replies')}` : `${commentCount} ${pluralS(commentCount, 'Comment')}`
  });
  if (resourceType === 'document' || resourceType === 'comment') {
    tabs.push({
      id: 'citations',
      label: `${citationCount} ${pluralS(citationCount, 'Citation')}`
    });
  }
  // Capabilities and children are document-only concepts; comments have neither.
  if (resourceType !== 'comment') {
    tabs.push({
      id: 'capabilities',
      label: `${capabilityCount} ${pluralS(capabilityCount, 'Capability', 'Capabilities')}`
    });
    tabs.push({
      id: 'children',
      label: `${childrenCount} ${pluralS(childrenCount, 'Child', 'Children')}`
    });
  }
  if (isAccountRoot) {
    tabs.push({
      id: 'authored-comments',
      label: `${authoredCommentCount} ${pluralS(authoredCommentCount, 'Authored Comment', 'Authored Comments')}`
    });
  }
  return tabs;
}

/** Falls back to the document tab when the requested tab is unavailable for the resource. */
export function getSafeCurrentTab(currentTab: string | null | undefined, tabs: TabDefinition[]): TabType {
  return tabs.some(tab => tab.id === currentTab) ? currentTab as TabType : 'document';
}

/** Returns updated search params while preserving the current version and other filters. */
export function getTabSearchParams(searchParams: URLSearchParams, tab: TabType) {
  const nextSearchParams = new URLSearchParams(searchParams);
  nextSearchParams.set('tab', tab);
  return nextSearchParams;
}
interface TabProps {
  id: TabType;
  label: string;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}
const Tab: React.FC<TabProps> = ({
  id,
  label,
  isActive,
  onClick
}) => {
  return <li role="presentation">
      <button className={(stylex.props(styles_3.sd5276459, styles_3.s880858c0, styles_3.sc5a0131, styles_3.s1aa15, styles_3.sf8e652db).className || "") + " " + (isActive ? (stylex.props(styles_3.s775ae258, styles_3.s7c401ecf, styles_3.s8b977963).className || "") + " " + (stylex.props(styles_4.s6cb46866, styles_4.s67cb944).className || "") : stylex.props(styles_3.s775ae258, styles_3.s29df1839).className || "")} onClick={() => onClick(id)} role="tab" aria-selected={isActive} aria-controls={`${id}-tab`}>
        {label}
      </button>
    </li>;
};
interface TabsProps {
  currentTab: TabType;
  id: UnpackedHypermediaId;
  resourceType?: ResourceType;
  onTabChange: (tab: TabType) => void;
  changeCount: number | undefined;
  versionCount: number | undefined;
  commentCount: number | undefined;
  citationCount: number | undefined;
  capabilityCount: number | undefined;
  childrenCount: number | undefined;
  authoredCommentCount: number | undefined;
}
const Tabs: React.FC<TabsProps> = ({
  id,
  currentTab,
  resourceType,
  onTabChange,
  changeCount = 0,
  versionCount = 0,
  commentCount = 0,
  citationCount = 0,
  capabilityCount = 0,
  childrenCount = 0,
  authoredCommentCount = 0
}) => {
  const tabs = getTabs({
    id,
    resourceType,
    changeCount,
    versionCount,
    commentCount,
    citationCount,
    capabilityCount,
    childrenCount,
    authoredCommentCount
  });
  return <div className={stylex.props(styles.sfbc0224e).className || ''}>
      <ul className={stylex.props(styles_2.s2ffff9, styles_2.sa12945df, styles_2.saa841a0f, styles_2.s34b1ad, styles_2.s65e234f5, styles_2.sab7cc6fa, styles_2.s129e46b3, styles_2.s3411ddae).className || ""} role="tablist">
        {tabs.map(tab => <Tab key={tab.id} id={tab.id} label={tab.label} isActive={currentTab === tab.id} onClick={onTabChange} />)}
      </ul>
    </div>;
};
export default Tabs;