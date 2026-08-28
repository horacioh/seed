import * as stylex from '@stylexjs/stylex'
import {type AgentDefinition, type AgentModelRef, type SessionModelOverride} from './client'
import {
  describeAgentServer,
  useLocalAgentServerUrl,
  useModelProviders,
  useProviderModelCatalogs,
  useUpdateAgentSession,
} from './models'
import {modelLabel} from './model-utils'
import {useSelectedAccountId} from './account'
import {useNavigate} from './navigation'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {toast} from '@shm/ui/toast'
import type {NavRoute} from '@shm/shared/routes'
import {useIsomorphicLayoutEffect} from '@shm/shared/utils/use-isomorphic-layout-effect'
import {Button} from '@shm/ui/button'
import {Badge} from '@shm/ui/components/badge'
import {OptionsDropdown, type MenuItemType} from '@shm/ui/options-dropdown'
import {PageTab} from '@shm/ui/page-tabs'
import {coerceReasoningLevel, ReasoningPie, ReasoningSlider} from './reasoning-select'
import {modelReasoningSupport, type ReasoningLevel} from '@seed-hypermedia/agents-protocol'
import {SizableText} from '@shm/ui/text'
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronsUpDown,
  GitBranch,
  MessageSquarePlus,
  MessagesSquare,
  Pencil,
  ScrollText,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import {Fragment, type ReactNode, useEffect, useMemo, useRef, useState} from 'react'
const styles_6 = stylex.create({
  sbe30147d: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 50%, transparent)',
  },
  s460ef3a3: {
    backgroundColor: 'oklch(72.3% 0.219 149.579)',
  },
})
const styles_5 = stylex.create({
  sca3de966: {
    width: 'calc(0.25rem * 2)',
    height: 'calc(0.25rem * 2)',
  },
  s948be48c: {
    flex: 'none',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s5ac553fa: {
    backgroundColor: 'var(--destructive)',
  },
})
const styles_4 = stylex.create({
  s9c668528: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
      },
    },
  },
  s2ad763c: {
    marginInline: 'calc(0.25rem * -1)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s34b1ac: {
    paddingInline: 'calc(0.25rem * 1)',
  },
  sc5dd1033: {
    paddingBlock: 'calc(0.25rem * 0.5)',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s948be48c: {
    flex: 'none',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_3 = stylex.create({
  s2e7ee7cc: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
      },
    },
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 1)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    '@media ((max-width: 639px))': {
      display: 'inline-flex',
      minHeight: 'calc(var(--spacing) * 10)',
      alignItems: 'center',
    },
  },
  sbe830cc9: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
      },
    },
    maxWidth: 'calc(var(--spacing) * 48)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 1)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    '@media ((max-width: 639px))': {
      display: 'inline-flex',
      minHeight: 'calc(var(--spacing) * 10)',
      alignItems: 'center',
    },
  },
  s87c6e2ff: {
    ':focus': {
      boxShadow: '0 0 0 2px currentcolor',
    },
    minWidth: 'calc(var(--spacing) * 0)',
    flex: '1',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'transparent',
    paddingInline: 'calc(var(--spacing) * 1)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: 'var(--text-lg)',
    lineHeight: 'var(--text-lg--line-height)',
    fontWeight: 'var(--font-weight-bold)',
    outlineStyle: 'none',
  },
  s6bbc3fe1: {
    marginInline: 'auto',
    width: '100%',
    maxWidth: 'var(--container-4xl)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBottom: 'calc(var(--spacing) * 2)',
    paddingLeft: '3.75rem',
  },
  sc33eeff9: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    columnGap: 'calc(var(--spacing) * 4)',
    rowGap: 'calc(var(--spacing) * 2)',
    '@media ((min-width: 640px))': {
      flexWrap: 'nowrap',
    },
  },
  sc89b3123: {
    ':focus': {
      boxShadow: '0 0 0 2px currentcolor',
    },
    marginInline: 'calc(var(--spacing) * -1)',
    minWidth: 'calc(var(--spacing) * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'transparent',
    paddingInline: 'calc(var(--spacing) * 1)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: 'var(--text-2xl)',
    lineHeight: 'var(--text-2xl--line-height)',
    fontWeight: 'var(--font-weight-bold)',
    outlineStyle: 'none',
  },
  s284af276: {
    '@media ((max-width: 639px))': {
      minHeight: 'calc(var(--spacing) * 10)',
    },
  },
  safce1988: {
    backgroundColor: 'color-mix(in oklab, var(--panel) 95%, transparent)',
    position: 'sticky',
    top: 'calc(var(--spacing) * 0)',
    zIndex: '10',
    marginInline: 'calc(var(--spacing) * -1)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    padding: 'calc(var(--spacing) * 1)',
    WebkitBackdropFilter: 'blur(8px)',
    backdropFilter: 'blur(8px)        ',
    '@media ((min-width: 768px))': {
      gap: 'calc(var(--spacing) * 4)',
      padding: 'calc(var(--spacing) * 2)',
    },
  },
  s1238120d: {
    pointerEvents: 'none',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    opacity: '0%',
    '@media ((min-width: 768px))': {
      gap: 'calc(var(--spacing) * 4)',
      padding: 'calc(var(--spacing) * 2)',
    },
  },
  sdfaffae2: {
    flex: 'none',
    '@media ((max-width: 639px))': {
      minHeight: 'calc(var(--spacing) * 10)',
    },
  },
  s98e15077: {
    backgroundColor: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--secondary) 80%, transparent)',
      },
    },
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'transparent',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':disabled': {
      opacity: '50%',
    },
  },
  s76a08df2: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    textAlign: 'left',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s4a244964: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    color: 'var(--muted-foreground)',
    width: '100%',
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    textAlign: 'left',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
})
const styles_2 = stylex.create({
  sddc09a9a: {
    color: 'var(--foreground)',
    maxWidth: 'calc(0.25rem * 48)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderRadius: '0.25rem',
    paddingInline: 'calc(0.25rem * 1)',
    paddingBlock: 'calc(0.25rem * 0.5)',
  },
  sb3fff8a2: {
    marginInline: 'auto',
    display: 'flex',
    height: 'calc(0.25rem * 12)',
    width: '100%',
    maxWidth: '56rem',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    paddingInline: 'calc(0.25rem * 4)',
  },
  sdf91ad18: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sb21c636e: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s64fb8207: {
    minWidth: 'calc(0.25rem * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s8565410d: {
    maxWidth: 'calc(0.25rem * 56)',
    flex: 'none',
    gap: 'calc(0.25rem * 1.5)',
  },
  sdfcaa18b: {
    maxWidth: 'calc(0.25rem * 40)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s10483f08: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
const styles = stylex.create({
  sf9dfefc3: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s13369fda: {
    backgroundColor: 'var(--card)',
    position: 'relative',
    zIndex: '10',
    width: '100%',
    flex: 'none',
    boxShadow: 'var(--shadow-sm)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s2627017b: {
    color: 'var(--muted-foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  s12583799: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s597c48d: {
    display: 'block',
  },
  sa0238738: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sef1c143e: {
    marginRight: 'calc(0.25rem * 2)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s948be48c: {
    flex: 'none',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s8a0ec2d6: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    flexShrink: '0',
    opacity: '70%',
  },
  sf6cf9d65: {
    width: 'calc(0.25rem * 72)',
    padding: 'calc(0.25rem * 1)',
  },
  s26e23c22: {
    color: 'var(--muted-foreground)',
    flexShrink: '0',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sf8eef924: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
  },
  s7239d2e5: {
    borderColor: 'var(--border)',
    marginTop: 'calc(0.25rem * 1)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
    paddingTop: 'calc(0.25rem * 2)',
    paddingBottom: 'calc(0.25rem * 1)',
  },
  se9d91b89: {
    borderColor: 'var(--border)',
    marginTop: 'calc(0.25rem * 1)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    padding: 'calc(0.25rem * 1)',
  },
})
export type AgentPageTab = 'sessions' | 'triggers' | 'memory' | 'tools' | 'prompt' | 'collaborators' | 'settings'
export type AgentHeaderInfo = {
  definition: AgentDefinition
  status: string
  /** Viewer's role on the agent; model switching from the header needs write access. */
  accessRole?: string
}
type AgentBreadcrumbItem = {
  label: string
  route?: NavRoute
}
type AgentTitleSaveState = 'idle' | 'saving' | 'saved' | 'error'
export function AgentBreadcrumb({
  serverUrl,
  agentId,
  agentName,
  items = [],
}: {
  serverUrl?: string
  agentId?: string
  agentName?: string
  items?: AgentBreadcrumbItem[]
}) {
  const navigate = useNavigate()
  const localServerUrl = useLocalAgentServerUrl()
  // The desktop-managed server is a named place, not an address: its port moves between launches,
  // so "localhost:3050" in a breadcrumb is noise at best and wrong at worst.
  const serverLabel = serverUrl ? describeAgentServer(serverUrl, localServerUrl.data) : null
  const serverIsCurrent = !!serverUrl && !agentName && !items.length
  return (
    <nav className={stylex.props(styles.sf9dfefc3).className || ''} aria-label="Agent breadcrumb">
      <button
        className={stylex.props(styles_3.s2e7ee7cc).className || ''}
        onClick={() =>
          navigate({
            key: 'agents',
          })
        }
      >
        Agents
      </button>
      {serverUrl ? (
        <>
          <span>&gt;</span>
          {serverIsCurrent ? (
            <span className={stylex.props(styles_2.sddc09a9a).className || ''}>{serverLabel}</span>
          ) : (
            <button
              className={stylex.props(styles_3.sbe830cc9).className || ''}
              onClick={() =>
                navigate({
                  key: 'agent-server',
                  serverUrl,
                })
              }
            >
              {serverLabel}
            </button>
          )}
        </>
      ) : null}
      {serverUrl && agentName ? (
        <>
          <span>&gt;</span>
          <button
            className={stylex.props(styles_3.sbe830cc9).className || ''}
            onClick={() =>
              agentId &&
              navigate({
                key: 'agent',
                agentId,
                serverUrl,
              })
            }
            disabled={!agentId}
          >
            {agentName}
          </button>
        </>
      ) : null}
      {items.map((item, index) => (
        <Fragment key={`${item.label}:${index}`}>
          <span>&gt;</span>
          {item.route ? (
            <button className={stylex.props(styles_3.sbe830cc9).className || ''} onClick={() => navigate(item.route!)}>
              {item.label}
            </button>
          ) : (
            <span className={stylex.props(styles_2.sddc09a9a).className || ''}>{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
export function AgentSubpageHeader({
  title,
  placeholder,
  onTitleChange,
  saveState = 'idle',
  disabled,
  backLabel,
  onBack,
  actions,
  children,
  subtitle,
}: {
  title: string
  placeholder: string
  onTitleChange: (title: string) => void
  /** One-line status under the title (e.g. the agent's own session description). */
  subtitle?: string
  saveState?: AgentTitleSaveState
  disabled?: boolean
  backLabel: string
  onBack: () => void
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className={stylex.props(styles.s13369fda).className || ''}>
      <div className={stylex.props(styles_2.sb3fff8a2).className || ''}>
        <Button variant="ghost" size="icon" aria-label={backLabel} onClick={onBack}>
          <ArrowLeft className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
        <div className={stylex.props(styles_2.sdf91ad18).className || ''}>
          <input
            aria-label={placeholder}
            value={title}
            placeholder={placeholder}
            onChange={(event) => onTitleChange(event.currentTarget.value)}
            className={stylex.props(styles_3.s87c6e2ff).className || ''}
            disabled={disabled}
          />
          {saveState !== 'idle' ? (
            <span
              aria-label={
                saveState === 'saving' ? 'Saving title' : saveState === 'saved' ? 'Title saved' : 'Title save failed'
              }
              className={
                (stylex.props(styles_5.sca3de966, styles_5.s948be48c, styles_5.s775755af).className || '') +
                ' ' +
                (saveState === 'saving'
                  ? stylex.props(styles_6.sbe30147d).className || ''
                  : saveState === 'saved'
                    ? stylex.props(styles_6.s460ef3a3).className || ''
                    : stylex.props(styles_5.s5ac553fa).className || '')
              }
            />
          ) : null}
        </div>
        {actions}
        {children}
      </div>
      {subtitle ? (
        <div className={stylex.props(styles_3.s6bbc3fe1).className || ''}>
          <p className={stylex.props(styles.s2627017b).className || ''} title={subtitle}>
            {subtitle}
          </p>
        </div>
      ) : null}
    </header>
  )
}
export function AgentHeader({
  agent,
  agentId,
  agentName,
  agentNameSaveState = 'idle',
  onAgentNameChange,
  onEditName,
  serverUrl,
  activeTab,
  sessionsCount,
  triggersCount,
  onCreateSession,
  creatingSession,
  onCreateTrigger,
  canCreateTrigger,
  menuItems,
  breadcrumbItems,
}: {
  agent?: AgentHeaderInfo
  agentId?: string
  agentName?: string
  agentNameSaveState?: AgentTitleSaveState
  onAgentNameChange?: (value: string) => void
  onEditName?: () => void
  serverUrl: string
  activeTab: AgentPageTab
  sessionsCount?: number
  triggersCount?: number
  onCreateSession?: () => void
  creatingSession?: boolean
  onCreateTrigger?: () => void
  canCreateTrigger?: boolean
  /** Rows for the top-right options menu; the menu renders only when at least one row is present. */
  menuItems?: (MenuItemType | null)[]
  breadcrumbItems?: AgentBreadcrumbItem[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [showLabels, setShowLabels] = useState(true)
  const tabs = [
    {
      key: 'sessions' as const,
      label: 'Sessions',
      tooltip: 'Open agent sessions',
      icon: MessagesSquare,
      count: sessionsCount || undefined,
    },
    {
      key: 'triggers' as const,
      label: 'Triggers',
      tooltip: 'Create sessions from Seed activity',
      icon: GitBranch,
      count: triggersCount || undefined,
    },
    {
      key: 'memory' as const,
      label: 'Memory',
      tooltip: "Browse and edit the agent's memory files",
      icon: Brain,
    },
    {
      key: 'tools' as const,
      label: 'Tools',
      tooltip: 'Control tools and signing identities',
      icon: Wrench,
    },
    {
      key: 'prompt' as const,
      label: 'Prompt',
      tooltip: 'Edit the system prompt',
      icon: ScrollText,
    },
    {
      key: 'collaborators' as const,
      label: 'Collaborators',
      tooltip: 'Manage who can access this agent',
      icon: Users,
    },
    {
      key: 'settings' as const,
      label: 'Settings',
      tooltip: 'Edit model settings',
      icon: Settings,
    },
  ]
  const activeTabLabel = tabs.find((tab) => tab.key === activeTab)?.label || 'Sessions'
  const currentAgentName = agentName ?? agent?.definition.name ?? 'Agent'
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current || !measureRef.current) return
    const updateLabelVisibility = () => {
      if (!containerRef.current || !measureRef.current) return
      setShowLabels(measureRef.current.offsetWidth + 20 <= containerRef.current.offsetWidth)
    }
    updateLabelVisibility()
    const resizeObserver = new ResizeObserver(updateLabelVisibility)
    resizeObserver.observe(containerRef.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [activeTab, agentId, serverUrl, sessionsCount, triggersCount])
  return (
    <>
      <AgentBreadcrumb
        serverUrl={serverUrl}
        agentId={agentId}
        agentName={currentAgentName}
        items={
          breadcrumbItems || [
            {
              label: activeTabLabel,
            },
          ]
        }
      />
      <section className={stylex.props(styles.sfbc6e28f).className || ''}>
        <div className={stylex.props(styles_3.sc33eeff9).className || ''}>
          <div className={stylex.props(styles_2.sb21c636e).className || ''}>
            {onEditName ? (
              <button
                type="button"
                aria-label="Rename agent"
                onClick={onEditName}
                className={
                  stylex.props(
                    styles_4.s9c668528,
                    styles_4.s2ad763c,
                    styles_4.s2ffff9,
                    styles_4.s3f58665f,
                    styles_4.sc6ed1702,
                    styles_4.s5d936fb,
                    styles_4.sf79988b7,
                    styles_4.s34b1ac,
                    styles_4.sc5dd1033,
                    styles_4.sbf63b0a7,
                  ).className || ''
                }
              >
                <SizableText size="2xl" weight="bold" className={stylex.props(styles_2.s64fb8207).className || ''}>
                  {currentAgentName}
                </SizableText>
                <Pencil
                  className={
                    stylex.props(
                      styles_4.sf2718385,
                      styles_4.sca3de968,
                      styles_4.s948be48c,
                      styles_4.s765a26ee,
                      styles_4.s83442393,
                    ).className || ''
                  }
                />
              </button>
            ) : onAgentNameChange ? (
              <input
                aria-label="Agent name"
                className={stylex.props(styles_3.sc89b3123).className || ''}
                value={agentName ?? agent?.definition.name ?? ''}
                placeholder="Agent"
                onChange={(event) => onAgentNameChange(event.currentTarget.value)}
              />
            ) : (
              <SizableText size="2xl" weight="bold" className={stylex.props(styles.s12583799).className || ''}>
                {agent?.definition.name || 'Agent'}
              </SizableText>
            )}
            {!agent ? (
              <SizableText color="muted" className={stylex.props(styles.s597c48d).className || ''}>
                Loading agent…
              </SizableText>
            ) : agentNameSaveState === 'saving' ? (
              <SizableText color="muted" className={stylex.props(styles.s597c48d).className || ''}>
                Saving…
              </SizableText>
            ) : agentNameSaveState === 'saved' ? (
              <SizableText color="muted" className={stylex.props(styles.s597c48d).className || ''}>
                Saved
              </SizableText>
            ) : agentNameSaveState === 'error' ? (
              <SizableText color="muted" className={stylex.props(styles.s597c48d).className || ''}>
                Save failed
              </SizableText>
            ) : null}
          </div>
          <div className={stylex.props(styles.sa0238738).className || ''}>
            {activeTab === 'sessions' && onCreateSession ? (
              <Button
                className={stylex.props(styles_3.s284af276).className || ''}
                onClick={onCreateSession}
                disabled={creatingSession}
              >
                <MessageSquarePlus className={stylex.props(styles.sef1c143e).className || ''} /> New session
              </Button>
            ) : null}
            {activeTab === 'triggers' && onCreateTrigger ? (
              <Button
                className={stylex.props(styles_3.s284af276).className || ''}
                onClick={onCreateTrigger}
                disabled={!canCreateTrigger}
              >
                <GitBranch className={stylex.props(styles.sef1c143e).className || ''} /> New trigger
              </Button>
            ) : null}
            {menuItems?.some((item) => item != null) ? (
              <OptionsDropdown menuItems={menuItems} align="end" ariaLabel="Agent options" />
            ) : null}
          </div>
        </div>

        {agentId ? (
          <div ref={containerRef} className={stylex.props(styles_3.safce1988).className || ''}>
            <div ref={measureRef} className={stylex.props(styles_3.s1238120d).className || ''} aria-hidden="true">
              {tabs.map((tab) => (
                <PageTab
                  key={tab.key}
                  active={activeTab === tab.key}
                  route={{
                    key: 'agent',
                    agentId,
                    serverUrl,
                    tab: tab.key === 'sessions' ? undefined : tab.key,
                  }}
                  label={tab.label}
                  tooltip={tab.tooltip}
                  icon={tab.icon}
                  count={tab.count}
                  showLabel
                  className={stylex.props(styles.s948be48c).className || ''}
                />
              ))}
            </div>
            {tabs.map((tab) => (
              <PageTab
                key={tab.key}
                active={activeTab === tab.key}
                route={{
                  key: 'agent',
                  agentId,
                  serverUrl,
                  tab: tab.key === 'sessions' ? undefined : tab.key,
                }}
                label={tab.label}
                tooltip={tab.tooltip}
                icon={tab.icon}
                count={tab.count}
                showLabel={showLabels}
                className={stylex.props(styles_3.sdfaffae2).className || ''}
              />
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}

/**
 * Session-header model tag: shows the model this session actually runs — its
 * override when set, otherwise the agent's model — and lets writers pick a
 * different provider/model pair (from the agent's checked list) or reasoning
 * level for this session only. Selecting the agent's own pair clears the
 * override, so the session follows the agent again.
 */
export function SessionModelBadge({
  agent,
  agentId,
  serverUrl,
  sessionId,
  modelOverride,
  canWrite,
}: {
  agent: AgentHeaderInfo | undefined
  agentId: string | undefined
  serverUrl: string
  sessionId: string
  modelOverride: SessionModelOverride | undefined
  canWrite: boolean
}) {
  const accountUid = useSelectedAccountId()
  const updateSession = useUpdateAgentSession(serverUrl, accountUid)
  const providers = useModelProviders(serverUrl, accountUid, canWrite ? agentId : undefined)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const definition = agent?.definition
  const agentPair: AgentModelRef | null = definition
    ? {
        provider: definition.modelProvider,
        model: definition.model,
      }
    : null
  const effective: AgentModelRef | null = modelOverride ?? agentPair
  const effectiveReasoning = modelOverride ? modelOverride.reasoningLevel : definition?.reasoningLevel
  const catalogProviders = useMemo(
    () =>
      Array.from(
        new Set(
          [
            effective?.provider,
            agentPair?.provider,
            ...(definition?.enabledModels ?? []).map((entry) => entry.provider),
          ].filter((name): name is string => !!name),
        ),
      ),
    [effective?.provider, agentPair?.provider, definition?.enabledModels],
  )
  const catalogs = useProviderModelCatalogs(serverUrl, accountUid, canWrite && agentId ? catalogProviders : [], agentId)
  const [pendingLevel, setPendingLevel] = useState<{
    level: ReasoningLevel | undefined
  } | null>(null)
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (commitTimer.current) clearTimeout(commitTimer.current)
    },
    [],
  )
  if (!definition || !agentPair || !effective) return null

  // Same switchable set as the agent header, seeded with the session's effective
  // pair and the agent default; entries are validated against live catalogs.
  const providerNames = providers.data ? new Set(providers.data.map((provider) => provider.name)) : undefined
  const samePair = (a: AgentModelRef, b: AgentModelRef) => a.provider === b.provider && a.model === b.model
  const options: AgentModelRef[] = [effective]
  for (const entry of [agentPair, ...(definition.enabledModels ?? [])]) {
    if (options.some((item) => samePair(item, entry))) continue
    if (providerNames && !providerNames.has(entry.provider)) continue
    const catalog = catalogs[entry.provider]
    if (catalog?.length && !catalog.some((model) => model.id === entry.model)) continue
    options.push(entry)
  }
  const spansProviders = options.some((entry) => entry.provider !== effective.provider)
  if (!canWrite || !agentId) {
    return (
      <Badge variant="secondary" className={stylex.props(styles_2.s8565410d).className || ''}>
        <span className={stylex.props(styles.s6e724d66).className || ''}>{effective.model}</span>
        {effectiveReasoning ? <ReasoningPie level={effectiveReasoning} /> : null}
      </Badge>
    )
  }
  const effectiveProviderType = providers.data?.find((provider) => provider.name === effective.provider)?.type
  const reasoningSupported = effectiveProviderType
    ? modelReasoningSupport(effectiveProviderType, effective.model)
    : null
  function commitOverride(override: SessionModelOverride | null) {
    updateSession.mutate(
      {
        sessionId,
        modelOverride: override,
      },
      {
        onSettled: () => setPendingLevel(null),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not set the session model'),
      },
    )
  }
  function handleSelect(entry: AgentModelRef) {
    setOpen(false)
    if (samePair(entry, effective!)) return
    // The agent's own pair is not pinned: clearing the override keeps the
    // session following the agent when its model changes later.
    if (samePair(entry, agentPair!)) {
      commitOverride(null)
      return
    }
    const providerType = providers.data?.find((provider) => provider.name === entry.provider)?.type
    const level = coerceReasoningLevel(providerType, entry.model, effectiveReasoning)
    commitOverride({
      provider: entry.provider,
      model: entry.model,
      ...(level
        ? {
            reasoningLevel: level,
          }
        : {}),
    })
  }
  function handleReasoningChange(level: ReasoningLevel | undefined) {
    setPendingLevel({
      level,
    })
    if (commitTimer.current) clearTimeout(commitTimer.current)
    commitTimer.current = setTimeout(() => {
      // Same pair and same level as the agent means no override is needed at all.
      if (samePair(effective!, agentPair!) && level === definition!.reasoningLevel) {
        commitOverride(null)
        return
      }
      commitOverride({
        provider: effective!.provider,
        model: effective!.model,
        ...(level
          ? {
              reasoningLevel: level,
            }
          : {}),
      })
    }, 500)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label="Set the model for this session"
        disabled={updateSession.isLoading}
        className={stylex.props(styles_3.s98e15077).className || ''}
      >
        <span className={stylex.props(styles_2.sdfcaa18b).className || ''}>{effective.model}</span>
        {reasoningSupported || effectiveReasoning ? (
          <ReasoningPie level={pendingLevel ? pendingLevel.level : effectiveReasoning} />
        ) : null}
        <ChevronsUpDown className={stylex.props(styles.s8a0ec2d6).className || ''} />
      </PopoverTrigger>
      <PopoverContent align="end" className={stylex.props(styles.sf6cf9d65).className || ''}>
        {options.map((entry) => {
          const isActive = samePair(entry, effective)
          const isAgentDefault = samePair(entry, agentPair)
          const info = catalogs[entry.provider]?.find((model) => model.id === entry.model)
          return (
            <button
              key={`${entry.provider}:${entry.model}`}
              type="button"
              className={stylex.props(styles_3.s76a08df2).className || ''}
              onClick={() => handleSelect(entry)}
            >
              <span className={stylex.props(styles_2.s10483f08).className || ''}>
                {info ? modelLabel(info) : entry.model}
              </span>
              {isAgentDefault ? (
                <span className={stylex.props(styles.s26e23c22).className || ''}>agent default</span>
              ) : null}
              {spansProviders && !isAgentDefault ? (
                <span className={stylex.props(styles.s26e23c22).className || ''}>{entry.provider}</span>
              ) : null}
              {isActive ? <Check className={stylex.props(styles.sf8eef924).className || ''} /> : null}
            </button>
          )
        })}
        {reasoningSupported ? (
          <div className={stylex.props(styles.s7239d2e5).className || ''}>
            <ReasoningSlider
              providerType={effectiveProviderType}
              model={effective.model}
              value={pendingLevel ? pendingLevel.level : effectiveReasoning}
              onChange={handleReasoningChange}
            />
          </div>
        ) : null}
        <div className={stylex.props(styles.se9d91b89).className || ''}>
          <button
            type="button"
            className={stylex.props(styles_3.s4a244964).className || ''}
            onClick={() => {
              setOpen(false)
              navigate({
                key: 'agent',
                agentId: agentId!,
                serverUrl,
                tab: 'settings',
              })
            }}
          >
            Choose models in Settings…
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
