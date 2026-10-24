import type {Config, Data} from '@puckeditor/core'
import type {ReactNode} from 'react'
import {DEFAULT_DOCUMENT_RESOURCE} from '../defaults'
import {withStyle} from './styles'
import {Window, Tabs, Section, Columns, Sidebar, Titlebar} from './layout'
import {
  AccountBlock,
  AvatarBlock,
  CollaboratorsBlock,
  DirectoryBlock,
  DirectoryPageBlock,
  DiscussionsBlock,
  DocumentView,
  FeedBlock,
  FloatingFooterBlock,
  FollowBlock,
  FooterBlock,
  JoinBlock,
  resourceField,
  SearchBlock,
  SiteHeaderBlock,
  TopBarBlock,
  VersionsBlock,
} from './content'
import {freeformComponents} from './freeform'
import {primitiveComponents} from './primitives'
import {
  ActivityBlock,
  ExploreCardBlock,
  FacePileBlock,
  MembersFacepileBlock,
  NewspaperCardBlock,
  QueryResultsBlock,
} from './candidates'

const choices = (values: string[]) => values.map((value) => ({label: value, value}))
const yesNo = [
  {label: 'Yes', value: true},
  {label: 'No', value: false},
]

const components: Record<string, any> = {
  Window: {
    label: 'Window',
    fields: {
      showTitlebar: {type: 'radio', label: 'Show titlebar', options: yesNo},
      showSidebar: {type: 'radio', label: 'Show sidebar', options: yesNo},
      showRightPanel: {type: 'radio', label: 'Show right panel', options: yesNo},
      sidebarWidth: {type: 'number', label: 'Sidebar width (%)', min: 14, max: 36},
      rightPanelWidth: {type: 'number', label: 'Right panel width (%)', min: 18, max: 42},
      sidebar: {type: 'slot', allow: ['DirectoryPanel', 'Collaborators']},
      main: {type: 'slot'},
      rightPanel: {type: 'slot', allow: ['Discussions', 'Feed', 'Collaborators']},
    },
    defaultProps: {showTitlebar: true, showSidebar: true, showRightPanel: true, sidebarWidth: 22, rightPanelWidth: 28},
    render: (props: any) => <Window {...props} />,
  },
  Titlebar: {
    label: 'Titlebar',
    fields: {title: {type: 'text', label: 'Title'}},
    defaultProps: {title: 'Seed'},
    render: (props: any) => <Titlebar {...props} />,
  },
  Sidebar: {label: 'Sidebar primitives', fields: {}, defaultProps: {}, render: () => <Sidebar />},
  SiteHeader: {
    label: 'Site header',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <SiteHeaderBlock {...props} />,
  },
  DocumentView: {
    label: 'Document view',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <DocumentView {...props} />,
  },
  DirectoryPanel: {
    label: 'Directory panel',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <DirectoryBlock {...props} />,
  },
  Discussions: {
    label: 'Discussions',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <DiscussionsBlock {...props} />,
  },
  Feed: {
    label: 'Feed',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <FeedBlock {...props} />,
  },
  Collaborators: {
    label: 'Collaborators',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <CollaboratorsBlock {...props} />,
  },
  DocumentTopBar: {
    label: 'Document top bar',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <TopBarBlock {...props} />,
  },
  Footer: {
    label: 'Footer',
    fields: {label: {type: 'text', label: 'Label'}},
    defaultProps: {label: 'Status'},
    render: (props: any) => <FooterBlock {...props} />,
  },
  FloatingAccountFooter: {
    label: 'Floating account footer',
    fields: {label: {type: 'text', label: 'Label'}},
    defaultProps: {label: 'Join'},
    render: (props: any) => <FloatingFooterBlock {...props} />,
  },
  DocumentVersionsPanel: {
    label: 'Document versions',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <VersionsBlock {...props} />,
  },
  DirectoryPage: {
    label: 'Directory page',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <DirectoryPageBlock {...props} />,
  },
  Activity: {
    label: 'Activity item',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <ActivityBlock {...props} />,
  },
  ExploreDocumentCard: {
    label: 'Explore document card',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <ExploreCardBlock {...props} />,
  },
  FacePile: {
    label: 'Face pile',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <FacePileBlock {...props} />,
  },
  MembersFacepile: {
    label: 'Members facepile',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <MembersFacepileBlock {...props} />,
  },
  QueryBlockContent: {
    label: 'Query block content',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <QueryResultsBlock {...props} />,
  },
  NewspaperCard: {
    label: 'Newspaper document card',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <NewspaperCardBlock {...props} />,
  },
  AccountPage: {
    label: 'Account page',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <AccountBlock {...props} />,
  },
  AccountAvatar: {
    label: 'Account avatar',
    fields: {resource: resourceField},
    defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
    render: (props: any) => <AvatarBlock {...props} />,
  },
  SearchInput: {
    label: 'Search input',
    fields: {},
    defaultProps: {},
    render: (props: any) => <SearchBlock {...props} />,
  },
  FollowButton: {label: 'Follow button', fields: {}, defaultProps: {}, render: () => <FollowBlock />},
  JoinButton: {label: 'Join button', fields: {}, defaultProps: {}, render: () => <JoinBlock />},
  Tabs: {
    label: 'Tabs',
    fields: {
      tabs: {
        type: 'array',
        label: 'Tabs',
        arrayFields: {label: {type: 'text', label: 'Label'}},
        defaultItemProps: {label: 'Tab'},
        min: 2,
        max: 4,
      },
      tab1: {type: 'slot'},
      tab2: {type: 'slot'},
      tab3: {type: 'slot'},
      tab4: {type: 'slot'},
    },
    defaultProps: {tabs: [{label: 'Tab 1'}, {label: 'Tab 2'}], tab1: [], tab2: [], tab3: [], tab4: []},
    render: (props: any) => <Tabs {...props} />,
  },
  Section: {
    label: 'Section',
    fields: {title: {type: 'text', label: 'Title'}, content: {type: 'slot'}},
    defaultProps: {title: 'Section', content: []},
    render: (props: any) => <Section {...props} />,
  },
  Columns: {
    label: 'Columns',
    fields: {
      ratio: {type: 'select', label: 'Ratio', options: choices(['1:1', '2:1', '1:2', '1:1:1'])},
      left: {type: 'slot'},
      center: {type: 'slot'},
      right: {type: 'slot'},
    },
    defaultProps: {ratio: '1:1'},
    render: (props: any) => <Columns {...props} />,
  },
  ...primitiveComponents,
  ...freeformComponents,
}

const fullHeightComponents = new Set([
  'Window',
  'Sidebar',
  'DocumentView',
  'DirectoryPanel',
  'Discussions',
  'Feed',
  'Collaborators',
  'DocumentVersionsPanel',
  'DirectoryPage',
])

const config = {
  categories: {
    shell: {title: 'Shell', components: ['Window', 'Titlebar', 'Sidebar']},
    seed: {
      title: 'Seed UI',
      components: [
        'SiteHeader',
        'DocumentView',
        'DirectoryPanel',
        'Discussions',
        'Feed',
        'Collaborators',
        'DocumentTopBar',
        'Footer',
        'FloatingAccountFooter',
        'DocumentVersionsPanel',
        'DirectoryPage',
        'AccountPage',
        'AccountAvatar',
        'SearchInput',
        'FollowButton',
        'JoinButton',
        'Activity',
        'ExploreDocumentCard',
        'FacePile',
        'MembersFacepile',
        'QueryBlockContent',
        'NewspaperCard',
      ],
    },
    layout: {title: 'Layout', components: ['Section', 'Columns', 'Tabs']},
    primitives: {title: 'Primitives', components: ['Button', 'Badge', 'Text', 'Heading', 'Separator']},
    freeform: {title: 'Freeform', components: ['StickyNote', 'PlaceholderBox']},
  },
  components: Object.fromEntries(
    Object.entries(components).map(([name, component]) => [name, withStyle(component, fullHeightComponents.has(name))]),
  ),
  root: {render: ({children}: {children: ReactNode}) => <>{children}</>},
}

/** Puck component registry and categories for the playground. */
export const playgroundConfig = config as Config

/** Available starter board templates. */
export type TemplateName = 'Desktop document' | 'Mobile document' | 'Desktop feed' | 'Blank window'

/** Creates an initial Puck layout for a selected starter template. */
export function createTemplateData(template: TemplateName = 'Desktop document'): Data {
  const block = (type: string, id: string, props: Record<string, unknown> = {}) => ({type, props: {id, ...props}})
  if (template === 'Blank window') {
    return {
      root: {props: {}},
      content: [
        block('Window', 'window', {
          showTitlebar: true,
          showSidebar: true,
          showRightPanel: true,
          sidebar: [],
          main: [],
          rightPanel: [],
        }),
      ],
    }
  }
  const feedTemplate = template === 'Desktop feed'
  return {
    root: {props: {}},
    content: [
      block('Window', 'window', {
        showTitlebar: true,
        showSidebar: true,
        showRightPanel: true,
        sidebarWidth: 22,
        rightPanelWidth: 28,
        sidebar: [block('DirectoryPanel', 'directory', {resource: DEFAULT_DOCUMENT_RESOURCE})],
        main: [
          block('SiteHeader', 'site-header', {resource: DEFAULT_DOCUMENT_RESOURCE}),
          ...(feedTemplate
            ? [block('Feed', 'feed', {resource: DEFAULT_DOCUMENT_RESOURCE})]
            : [block('DocumentView', 'document', {resource: DEFAULT_DOCUMENT_RESOURCE})]),
        ],
        rightPanel: [
          block(feedTemplate ? 'Collaborators' : 'Discussions', 'right-panel', {resource: DEFAULT_DOCUMENT_RESOURCE}),
        ],
      }),
    ],
  }
}
