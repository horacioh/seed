import {unpackHmId} from '@seed-hypermedia/client/hm-types'
import type {Config, Data} from '@puckeditor/core'
import {hmId, useResource} from '@shm/shared'
import {CollaboratorsPage} from '@shm/ui/collaborators-page'
import {DirectoryPanel} from '@shm/ui/directory-panel'
import {DiscussionsPageContent} from '@shm/ui/discussions-page'
import {DocumentHeader} from '@shm/ui/document-header'
import {Feed} from '@shm/ui/feed'
import {MobilePanelSheet} from '@shm/ui/mobile-panel-sheet'
import {SiteHeader} from '@shm/ui/site-header'
import useMedia from '@shm/ui/use-media'
import {ReadOnlyViewer} from '@shm/editor/readonly-viewer'
import {useMemo, useState, type ComponentType, type ReactNode} from 'react'
import {DEFAULT_DOCUMENT_RESOURCE} from '../defaults'

function useBoundResource(resource: string) {
  return useMemo(() => unpackHmId(resource.trim()), [resource])
}

function InvalidResource() {
  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 text-destructive m-4 rounded-md border p-3 text-sm"
    >
      Enter a valid hm://… or https://… document URL.
    </div>
  )
}

function DocumentView({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = useBoundResource(resource)
  const result = useResource(id)
  if (!id) return <InvalidResource />
  if (result.isInitialLoading) return <div className="text-muted-foreground p-4 text-sm">Loading document…</div>
  if (!result.data || result.data.type !== 'document') {
    return (
      <div className="text-muted-foreground p-4 text-sm">
        {result.data?.type === 'error' ? result.data.message : 'Document not found.'}
      </div>
    )
  }
  const document = result.data.document
  return (
    <article className="mx-auto w-full max-w-4xl px-5 pt-8 pb-12">
      <DocumentHeader docId={id} docMetadata={document.metadata} authors={[]} updateTime={document.updateTime} />
      <ReadOnlyViewer blocks={document.content} resourceId={id} rootChildrenType="Group" />
    </article>
  )
}

function SiteHeaderComponent({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = useBoundResource(resource)
  return id ? <SiteHeader siteHomeId={hmId(id.uid)} docId={id} /> : <InvalidResource />
}

function DirectoryComponent({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = useBoundResource(resource)
  return id ? <DirectoryPanel docId={id} /> : <InvalidResource />
}

function DiscussionsComponent({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = useBoundResource(resource)
  return id ? <DiscussionsPageContent docId={id} showOpenInPanel={false} contentMaxWidth={480} /> : <InvalidResource />
}

function FeedComponent({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = useBoundResource(resource)
  return id ? <Feed filterResource={id.id} size="sm" /> : <InvalidResource />
}

function CollaboratorsComponent({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = useBoundResource(resource)
  return id ? <CollaboratorsPage docId={id} /> : <InvalidResource />
}

type WindowProps = {
  showTitlebar?: boolean
  showSidebar?: boolean
  showRightPanel?: boolean
  sidebarWidth?: number
  rightPanelWidth?: number
  sidebar?: ComponentType
  main?: ComponentType
  rightPanel?: ComponentType
}

function WindowComponent({
  showTitlebar = true,
  showSidebar = true,
  showRightPanel = true,
  sidebarWidth = 22,
  rightPanelWidth = 28,
  sidebar: Sidebar,
  main: Main,
  rightPanel: RightPanel,
}: WindowProps) {
  const {xs} = useMedia()
  const [mobilePanel, setMobilePanel] = useState<'sidebar' | 'rightPanel' | null>(null)
  const mainContent = Main ? (
    <Main />
  ) : (
    <div className="text-muted-foreground p-6 text-sm">Add content to the main region.</div>
  )
  const sidebarContent = Sidebar ? <Sidebar /> : null
  const rightPanelContent = RightPanel ? <RightPanel /> : null

  if (xs) {
    return (
      <div className="bg-background text-foreground flex h-full min-h-0 flex-col">
        {showTitlebar && <div className="flex h-11 shrink-0 items-center border-b px-4 text-sm font-medium">Seed</div>}
        <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
          {showSidebar && (
            <button className="hover:bg-muted rounded-md px-3 py-1.5 text-sm" onClick={() => setMobilePanel('sidebar')}>
              Directory
            </button>
          )}
          {showRightPanel && (
            <button
              className="hover:bg-muted rounded-md px-3 py-1.5 text-sm"
              onClick={() => setMobilePanel('rightPanel')}
            >
              Discussions
            </button>
          )}
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto">{mainContent}</main>
        {(showSidebar || showRightPanel) && (
          <MobilePanelSheet
            isOpen={mobilePanel !== null}
            title={mobilePanel === 'sidebar' ? 'Directory' : 'Discussions'}
            onClose={() => setMobilePanel(null)}
          >
            {mobilePanel === 'sidebar' ? sidebarContent : rightPanelContent}
          </MobilePanelSheet>
        )}
      </div>
    )
  }

  const mainPanelWidth = 100 - (showSidebar ? sidebarWidth : 0) - (showRightPanel ? rightPanelWidth : 0)
  const columns = [
    ...(showSidebar ? [`minmax(0, ${sidebarWidth}fr)`, '4px'] : []),
    `minmax(0, ${mainPanelWidth}fr)`,
    ...(showRightPanel ? ['4px', `minmax(0, ${rightPanelWidth}fr)`] : []),
  ]

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col">
      {showTitlebar && <div className="flex h-11 shrink-0 items-center border-b px-4 text-sm font-medium">Seed</div>}
      <div className="grid min-h-0 flex-1" style={{gridTemplateColumns: columns.join(' ')}}>
        {showSidebar && (
          <>
            <div className="min-h-0 min-w-0 overflow-y-auto border-r">{sidebarContent}</div>
            <div aria-hidden="true" className="bg-border w-1" />
          </>
        )}
        <div className="min-h-0 min-w-0 overflow-y-auto">{mainContent}</div>
        {showRightPanel && (
          <>
            <div aria-hidden="true" className="bg-border w-1" />
            <div className="min-h-0 min-w-0 overflow-y-auto border-l">{rightPanelContent}</div>
          </>
        )}
      </div>
    </div>
  )
}

function StickyNote({text = 'Your note', color = 'butter'}: {text?: string; color?: string}) {
  const colors: Record<string, string> = {
    butter: 'bg-amber-100 text-amber-950',
    mint: 'bg-emerald-100 text-emerald-950',
    sky: 'bg-sky-100 text-sky-950',
    lilac: 'bg-violet-100 text-violet-950',
  }
  return (
    <div className={`m-4 min-h-32 rounded-md p-4 whitespace-pre-wrap shadow-sm ${colors[color] ?? colors.butter}`}>
      {text}
    </div>
  )
}

function PlaceholderBox({label = 'Placeholder', height = 240}: {label?: string; height?: number}) {
  return (
    <div
      className="bg-muted/30 text-muted-foreground m-4 flex items-center justify-center rounded-md border border-dashed text-sm"
      style={{height}}
    >
      {label}
    </div>
  )
}

const resourceField = {type: 'text' as const, label: 'Resource URL', placeholder: DEFAULT_DOCUMENT_RESOURCE}
const yesNo = [
  {label: 'Yes', value: true},
  {label: 'No', value: false},
]

export const playgroundConfig = {
  categories: {
    shell: {title: 'Shell', components: ['Window']},
    seed: {
      title: 'Seed UI',
      components: ['SiteHeader', 'DocumentView', 'DirectoryPanel', 'Discussions', 'Feed', 'Collaborators'],
    },
    freeform: {title: 'Freeform', components: ['StickyNote', 'PlaceholderBox']},
  },
  components: {
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
      defaultProps: {
        showTitlebar: true,
        showSidebar: true,
        showRightPanel: true,
        sidebarWidth: 22,
        rightPanelWidth: 28,
      },
      render: (props: WindowProps) => <WindowComponent {...props} />,
    },
    SiteHeader: {
      label: 'Site header',
      fields: {resource: resourceField},
      defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
      render: ({resource}: {resource: string}) => <SiteHeaderComponent resource={resource} />,
    },
    DocumentView: {
      label: 'Document view',
      fields: {resource: resourceField},
      defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
      render: ({resource}: {resource: string}) => <DocumentView resource={resource} />,
    },
    DirectoryPanel: {
      label: 'Directory panel',
      fields: {resource: resourceField},
      defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
      render: ({resource}: {resource: string}) => <DirectoryComponent resource={resource} />,
    },
    Discussions: {
      label: 'Discussions',
      fields: {resource: resourceField},
      defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
      render: ({resource}: {resource: string}) => <DiscussionsComponent resource={resource} />,
    },
    Feed: {
      label: 'Feed',
      fields: {resource: resourceField},
      defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
      render: ({resource}: {resource: string}) => <FeedComponent resource={resource} />,
    },
    Collaborators: {
      label: 'Collaborators',
      fields: {resource: resourceField},
      defaultProps: {resource: DEFAULT_DOCUMENT_RESOURCE},
      render: ({resource}: {resource: string}) => <CollaboratorsComponent resource={resource} />,
    },
    StickyNote: {
      label: 'Sticky note',
      fields: {
        text: {type: 'textarea', label: 'Note'},
        color: {
          type: 'select',
          label: 'Color',
          options: [
            {label: 'Butter', value: 'butter'},
            {label: 'Mint', value: 'mint'},
            {label: 'Sky', value: 'sky'},
            {label: 'Lilac', value: 'lilac'},
          ],
        },
      },
      defaultProps: {text: 'Your note', color: 'butter'},
      render: ({text, color}: {text: string; color: string}) => <StickyNote text={text} color={color} />,
    },
    PlaceholderBox: {
      label: 'Placeholder box',
      fields: {label: {type: 'text', label: 'Label'}, height: {type: 'number', label: 'Height', min: 64, max: 1200}},
      defaultProps: {label: 'Placeholder', height: 240},
      render: ({label, height}: {label: string; height: number}) => <PlaceholderBox label={label} height={height} />,
    },
  },
  root: {render: ({children}: {children: ReactNode}) => <>{children}</>},
} as unknown as Config

export function createTemplateData(): Data {
  const block = (type: string, id: string, props: Record<string, unknown> = {}) => ({type, props: {id, ...props}})
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
          block('DocumentView', 'document', {resource: DEFAULT_DOCUMENT_RESOURCE}),
        ],
        rightPanel: [block('Discussions', 'discussions', {resource: DEFAULT_DOCUMENT_RESOURCE})],
      }),
    ],
  }
}
