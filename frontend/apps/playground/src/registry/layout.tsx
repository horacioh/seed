import {HMIcon} from '@shm/ui/hm-icon'
import {MobilePanelSheet} from '@shm/ui/mobile-panel-sheet'
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@shm/ui/components/sidebar'
import {Tabs as SeedTabs, TabsContent, TabsList, TabsTrigger} from '@shm/ui/components/tabs'
import {TitleTextButton, TitlebarRow, TitlebarSection, TitlebarWrapper} from '@shm/ui/titlebar'
import useMedia from '@shm/ui/use-media'
import {hmId} from '@shm/shared'
import {X, PanelLeft, PanelRight} from 'lucide-react'
import {useEffect, useState, type ComponentType} from 'react'

/** Seed titlebar controls for a responsive window. */
export function Titlebar({
  title = 'Seed',
  onToggleSidebar,
  onToggleRight,
  showSidebar = true,
  showRightPanel = true,
}: {
  title?: string
  onToggleSidebar?: () => void
  onToggleRight?: () => void
  showSidebar?: boolean
  showRightPanel?: boolean
}) {
  return (
    <TitlebarWrapper className="bg-background border-b px-3">
      <TitlebarRow className="h-10 items-center justify-between">
        <TitlebarSection>
          <HMIcon id={hmId('z6MkuBbsB1HbSNXLvJCRCrPhimY6g7tzhr4qvcYKPuSZzhno')} size={24} />
          <span className="font-medium">{title}</span>
        </TitlebarSection>
        <TitlebarSection>
          {showSidebar && (
            <TitleTextButton aria-label="Toggle sidebar" onClick={onToggleSidebar}>
              <PanelLeft className="size-4" />
            </TitleTextButton>
          )}
          {showRightPanel && (
            <TitleTextButton aria-label="Toggle right panel" onClick={onToggleRight}>
              <PanelRight className="size-4" />
            </TitleTextButton>
          )}
        </TitlebarSection>
      </TitlebarRow>
    </TitlebarWrapper>
  )
}

/** Sidebar primitives arranged as a layout playground navigation rail. */
export function Sidebar() {
  return (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <SidebarHeader>
        <div className="text-sm font-medium">Workspace</div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>Lobby</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <span className="text-muted-foreground text-xs">Read-only preview</span>
      </SidebarFooter>
    </div>
  )
}

/** CSS-grid shell with responsive Seed sidebar and right-panel behavior. */
export function Window({
  showTitlebar = true,
  showSidebar = true,
  showRightPanel = true,
  sidebarWidth = 22,
  rightPanelWidth = 28,
  sidebar: SidebarSlot,
  main: Main,
  rightPanel: RightPanel,
}: {
  showTitlebar?: boolean
  showSidebar?: boolean
  showRightPanel?: boolean
  sidebarWidth?: number
  rightPanelWidth?: number
  sidebar?: ComponentType
  main?: ComponentType
  rightPanel?: ComponentType
}) {
  const {xs} = useMedia()
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar)
  const [rightOpen, setRightOpen] = useState(showRightPanel)
  const [mobilePanel, setMobilePanel] = useState<'sidebar' | 'right' | null>(null)
  useEffect(() => {
    setSidebarOpen(showSidebar)
    setRightOpen(showRightPanel)
    if ((mobilePanel === 'sidebar' && !showSidebar) || (mobilePanel === 'right' && !showRightPanel)) {
      setMobilePanel(null)
    }
  }, [showSidebar, showRightPanel, mobilePanel])
  const Side = SidebarSlot
  const Right = RightPanel
  const mainContent = Main ? (
    <Main />
  ) : (
    <div className="text-muted-foreground p-6 text-sm">Add content to the main region.</div>
  )
  const sideContent = Side ? <Side /> : <Sidebar />
  const rightContent = Right ? <Right /> : <div className="p-4 text-sm">Right panel</div>
  if (xs)
    return (
      <div className="bg-background text-foreground flex h-full min-h-0 flex-col">
        {showTitlebar && (
          <Titlebar
            showSidebar={showSidebar}
            showRightPanel={showRightPanel}
            onToggleSidebar={() => showSidebar && setMobilePanel('sidebar')}
            onToggleRight={() => showRightPanel && setMobilePanel('right')}
          />
        )}
        {(showSidebar || showRightPanel) && (
          <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
            {showSidebar && (
              <button
                className="hover:bg-muted rounded-md px-3 py-1.5 text-sm"
                onClick={() => setMobilePanel('sidebar')}
              >
                Directory
              </button>
            )}
            {showRightPanel && (
              <button className="hover:bg-muted rounded-md px-3 py-1.5 text-sm" onClick={() => setMobilePanel('right')}>
                Discussions
              </button>
            )}
          </div>
        )}
        <main className="min-h-0 flex-1 overflow-y-auto">{mainContent}</main>
        {(showSidebar || showRightPanel) && (
          <MobilePanelSheet
            isOpen={(mobilePanel === 'sidebar' && showSidebar) || (mobilePanel === 'right' && showRightPanel)}
            title={mobilePanel === 'sidebar' ? 'Directory' : 'Discussions'}
            onClose={() => setMobilePanel(null)}
          >
            {mobilePanel === 'sidebar' ? sideContent : rightContent}
          </MobilePanelSheet>
        )}
      </div>
    )
  const sidebarVisible = showSidebar && sidebarOpen
  const rightVisible = showRightPanel && rightOpen
  const mainWidth = 100 - (sidebarVisible ? sidebarWidth : 0) - (rightVisible ? rightPanelWidth : 0)
  const columns = [
    ...(sidebarVisible ? [`minmax(0, ${sidebarWidth}fr)`, '4px'] : []),
    `minmax(0, ${mainWidth}fr)`,
    ...(rightVisible ? ['4px', `minmax(0, ${rightPanelWidth}fr)`] : []),
  ]
  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col">
      {showTitlebar && (
        <Titlebar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onToggleRight={() => setRightOpen(!rightOpen)} />
      )}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)]" style={{gridTemplateColumns: columns.join(' ')}}>
        {sidebarVisible && (
          <>
            <div className="min-h-0 min-w-0 overflow-y-auto border-r">{sideContent}</div>
            <div className="bg-border w-1" />
          </>
        )}
        <div className="min-h-0 min-w-0 overflow-y-auto">{mainContent}</div>
        {rightVisible && (
          <>
            <div className="bg-border w-1" />
            <div className="min-h-0 min-w-0 overflow-y-auto">
              <div className="flex h-10 items-center justify-between border-b px-3 text-sm font-medium">
                <span>Panel</span>
                <button
                  aria-label="Close right panel"
                  onClick={() => setRightOpen(false)}
                  className="hover:bg-muted rounded p-1"
                >
                  <X className="size-4" />
                </button>
              </div>
              {rightContent}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Switches between up to four Puck content slots. */
export function Tabs({
  tabs = ['Tab 1', 'Tab 2'],
  tab1: Tab1,
  tab2: Tab2,
  tab3: Tab3,
  tab4: Tab4,
}: {
  tabs?: Array<string | {label: string}>
  tab1?: ComponentType
  tab2?: ComponentType
  tab3?: ComponentType
  tab4?: ComponentType
}) {
  const slots = [Tab1, Tab2, Tab3, Tab4]
  const labels = tabs.slice(0, 4).map((tab) => (typeof tab === 'string' ? tab : tab.label))
  return (
    <SeedTabs defaultValue="0">
      <TabsList>
        {labels.map((label, i) => (
          <TabsTrigger key={i} value={String(i)}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {labels.map((label, i) => {
        const Slot = slots[i]
        return (
          <TabsContent key={i} value={String(i)}>
            {Slot ? <Slot /> : <div className="text-muted-foreground p-4 text-sm">{label}</div>}
          </TabsContent>
        )
      })}
    </SeedTabs>
  )
}

/** Vertical section with a title and content slot. */
export function Section({title = 'Section', content: Content}: {title?: string; content?: ComponentType}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {Content && <Content />}
    </section>
  )
}

/** Two- or three-column layout with selectable proportions. */
export function Columns({
  left: Left,
  center: Center,
  right: Right,
  ratio = '1:1',
}: {
  left?: ComponentType
  center?: ComponentType
  right?: ComponentType
  ratio?: string
}) {
  const widths: Record<string, string> = {'1:1': '1fr 1fr', '2:1': '2fr 1fr', '1:2': '1fr 2fr', '1:1:1': '1fr 1fr 1fr'}
  return (
    <div className="grid gap-4" style={{gridTemplateColumns: widths[ratio] ?? widths['1:1']}}>
      {Left && <Left />}
      {Center && <Center />}
      {Right && <Right />}
    </div>
  )
}
