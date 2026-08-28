import * as stylex from '@stylexjs/stylex'
import {getUpdateStatusLabel, useUpdateStatus} from '@/components/auto-updater'
import {useConnectionSummary} from '@/models/contacts'
import {useDaemonInfo} from '@/models/daemon'
import {getAggregatedDiscoveryStream, getDiscoveryStream, getSubscriptionKeysStream} from '@/models/entities'
import {DiscoveryState} from '@seed-hypermedia/client/hm-types'
import {Task, TaskName} from '@shm/shared/client/.generated/daemon/v1alpha/daemon_pb'
import {COMMIT_HASH, VERSION} from '@shm/shared/constants'
import {useResource} from '@shm/shared/models/entity'
import {useRouteLink} from '@shm/shared/routing'
import {useStream} from '@shm/shared/use-stream'
import {unpackHmId} from '@shm/shared/utils/entity-id-url'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {Button} from '@shm/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {Progress} from '@shm/ui/components/progress'
import {FooterWrapper} from '@shm/ui/footer'
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@shm/ui/hover-card'
import {Cable} from '@shm/ui/icons'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {Binoculars, Bot, MessageCirclePlus} from 'lucide-react'
import {ReactNode} from 'react'
import {OnlineIndicator} from './indicator'
import {useNetworkDialog} from './network-dialog'

/** Renders the desktop app footer and status actions. */
const styles_6 = stylex.create({
  s323bcf6d: {
    backgroundColor: 'var(--muted-foreground)',
  },
  s460ef3a3: {
    backgroundColor: 'oklch(72.3% 0.219 149.579)',
  },
})
const styles_5 = stylex.create({
  s2c8b4ee7: {
    color: 'var(--brand)',
  },
  s5ac553fa: {
    backgroundColor: 'var(--destructive)',
  },
})
const styles_4 = stylex.create({
  s597359d5: {
    backgroundColor: 'var(--link)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--link-hover)',
      },
    },
  },
  s5ac553fa: {
    backgroundColor: 'var(--destructive)',
  },
  s43cb25fe: {
    color: 'var(--foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    minWidth: 'calc(var(--spacing) * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s67b8c9a3: {
    color: 'color-mix(in oklab, var(--muted-foreground) 70%, transparent)',
  },
  sc2089fa4: {
    color: 'color-mix(in oklab, var(--muted-foreground) 70%, transparent)',
    flexShrink: '0',
    fontSize: '10px',
  },
})
const styles_3 = stylex.create({
  s1bfab962: {
    color: 'var(--primary)',
  },
  s5ac553fa: {
    backgroundColor: 'var(--destructive)',
  },
})
const styles_2 = stylex.create({
  s7b569988: {
    display: 'flex',
    maxHeight: 'calc(0.25rem * 64)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1.5)',
    overflowY: 'auto',
  },
})
const styles = stylex.create({
  s948be48c: {
    flex: 'none',
  },
  s19022da6: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
    paddingInline: 'calc(0.25rem * 1)',
  },
  s105b9321: {
    color: 'var(--muted-foreground)',
    cursor: 'default',
    opacity: '50%',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s44343d13: {
    cursor: 'default',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  sa271fd16: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 1)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sd362335f: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s4a58805: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    flexShrink: '0',
  },
  sba46caf: {
    width: 'calc(0.25rem * 1.5)',
    height: 'calc(0.25rem * 1.5)',
    flexShrink: '0',
    borderRadius: 'calc(infinity * 1px)',
  },
  s3566be62: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s36c833: {
    width: 'calc(0.25rem * 96)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  s25987914: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1.5)',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s5cebed3: {
    height: 'calc(0.25rem * 1.5)',
  },
  s400bc241: {
    display: 'flex',
    cursor: 'default',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc7a0694e: {
    color: 'var(--muted-foreground)',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s36c80e: {
    width: 'calc(0.25rem * 80)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
})
export default function Footer({
  children,
  assistantOpen,
  onNewAssistantChat,
  onToggleAssistant,
}: {
  children?: ReactNode
  assistantOpen?: boolean
  onNewAssistantChat?: () => void
  onToggleAssistant?: () => void
}) {
  const updateStatus = useUpdateStatus()
  return (
    <FooterWrapper className={stylex.props(styles.s948be48c).className || ''}>
      <FooterNetworkingButton />
      <div className={stylex.props(styles.s19022da6).className || ''}>
        <SizableText
          size="xs"
          className={stylex.props(styles.s105b9321).className || ''}
          style={{
            fontSize: 10,
          }}
        >
          {`Seed ${VERSION} (${COMMIT_HASH.slice(0, 8)})`}
        </SizableText>
        {updateStatus && updateStatus?.type != 'idle' && (
          <SizableText
            size="xs"
            color="muted"
            className={stylex.props(styles.s44343d13).className || ''}
            style={{
              fontSize: 10,
            }}
          >
            {getUpdateStatusLabel(updateStatus)}
          </SizableText>
        )}
      </div>

      <div className={stylex.props(styles.sa271fd16).className || ''}>
        <DaemonTasksIndicator />
        <SubscriptionsPanel />
        {children}
        {onToggleAssistant && (
          <Tooltip content={assistantOpen ? 'Close assistant panel' : 'Open assistant panel'}>
            <Button
              size="xs"
              variant={'ghost'}
              className={cn(
                stylex.props(styles.s34b1ad).className || '',
                assistantOpen ? stylex.props(styles_5.s2c8b4ee7).className || '' : '',
              )}
              onClick={onToggleAssistant}
              aria-label="Toggle assistant"
            >
              <Bot className={stylex.props(styles.sca3de967).className || ''} />
            </Button>
          </Tooltip>
        )}
        {onNewAssistantChat && (
          <Tooltip content="New assistant chat">
            <Button
              size="xs"
              variant={'ghost'}
              className={stylex.props(styles.s34b1ad).className || ''}
              onClick={onNewAssistantChat}
              aria-label="New assistant chat"
            >
              <MessageCirclePlus className={stylex.props(styles.sca3de967).className || ''} />
            </Button>
          </Tooltip>
        )}
      </div>
    </FooterWrapper>
  )
}

/** Renders a footer action button with optional active styling. */
export function FooterButton({
  active,
  label,
  icon,
  onPress,
}: {
  active?: boolean
  label: string
  icon?: ReactNode
  onPress: () => void
}) {
  return (
    <Button
      size="sm"
      variant={active ? 'default' : 'ghost'}
      className={cn(
        stylex.props(styles.s34b1ad).className || '',
        stylex.props(active ? styles_4.s597359d5 : null).className || '',
      )}
      onClick={onPress}
    >
      {icon}
      {label}
    </Button>
  )
}
function FooterNetworkingButton() {
  const route = useNavRoute()
  const networkDialog = useNetworkDialog()
  const summary = useConnectionSummary()
  return (
    <div className={stylex.props(styles.s86ff3e4).className || ''}>
      <Button
        size="xs"
        className={cn(
          stylex.props(styles.s34b1ad).className || '',
          stylex.props(route.key == 'contacts' && styles_3.s1bfab962).className || '',
        )}
        onClick={() => networkDialog.open(true)}
      >
        <OnlineIndicator online={summary.online} />
        <Cable className={stylex.props(styles.sca3de967).className || ''} />
        <SizableText size="xs">{summary.connectedCount}</SizableText>
      </Button>
      {networkDialog.content}
    </div>
  )
}

/** Single subscription item showing the resolved name and its sync state. */
function SubscriptionItem({subscriptionKey}: {subscriptionKey: string}) {
  // Extract the entity ID (strip /* and :profile suffixes) for discovery state lookup
  const entityId = subscriptionKey.replace(/\/\*$/, '').replace(/:profile$/, '')
  const id = unpackHmId(entityId)
  const resource = useResource(id, {
    subscribed: false,
  })
  const discoveryState = useStream(getDiscoveryStream(entityId))
  const isProfile = subscriptionKey.endsWith(':profile')
  const isRecursive = subscriptionKey.includes('/*')
  const isAccount = id && !id.path?.length
  const linkProps = useRouteLink(
    id
      ? isProfile
        ? {
            key: 'profile',
            id,
          }
        : {
            key: 'document',
            id,
          }
      : null,
  )

  // Resolve display name from resource metadata
  const name = resource.data?.type === 'document' ? resource.data.document.metadata.name : null
  const fallbackName = id
    ? isAccount
      ? `${id.uid.slice(0, 8)}…`
      : `${id.uid.slice(0, 6)}/${id.path?.join('/')}`
    : entityId
  const suffix = isProfile ? ' (profile)' : isRecursive ? ' /*' : ''
  const syncLabel = getSyncLabel(discoveryState)
  return (
    <div className={stylex.props(styles.sd362335f).className || ''}>
      {discoveryState?.isDiscovering ? (
        <Spinner size="small" className={stylex.props(styles.s4a58805).className || ''} />
      ) : (
        <span
          className={cn(
            stylex.props(styles.sba46caf).className || '',
            discoveryState?.isTombstone
              ? stylex.props(styles_5.s5ac553fa).className || ''
              : discoveryState?.isNotFound
                ? stylex.props(styles_6.s323bcf6d).className || ''
                : stylex.props(styles_6.s460ef3a3).className || '',
          )}
        />
      )}
      <a {...linkProps} className={stylex.props(styles_4.s43cb25fe).className || ''}>
        {name || fallbackName}
        {suffix && <span className={stylex.props(styles_4.s67b8c9a3).className || ''}>{suffix}</span>}
      </a>
      <span className={stylex.props(styles_4.sc2089fa4).className || ''}>{syncLabel}</span>
    </div>
  )
}
function getSyncLabel(state: DiscoveryState | null | undefined): string {
  if (!state) return 'watching'
  if (state.isTombstone) return 'deleted'
  if (state.isNotFound) return 'not found'
  if (state.isDiscovering) {
    if (state.progress && state.progress.blobsDiscovered > 0) {
      return `${state.progress.blobsDownloaded}/${state.progress.blobsDiscovered}`
    }
    return 'syncing'
  }
  return 'synced'
}

/** Footer panel showing all active subscriptions for this window. */
function SubscriptionsPanel() {
  const subscriptionKeys = useStream(getSubscriptionKeysStream()) ?? []
  const aggregated = useStream(getAggregatedDiscoveryStream())
  const count = subscriptionKeys.length
  const isAnySyncing = (aggregated?.activeCount ?? 0) > 0
  if (count === 0) return null
  return (
    <Popover>
      <Tooltip content={`Subscribed to ${count} ${count === 1 ? 'entity' : 'entities'}`}>
        <PopoverTrigger asChild>
          <Button size="xs" variant="ghost" className={stylex.props(styles.s34b1ad).className || ''}>
            {isAnySyncing ? (
              <Spinner size="small" className={stylex.props(styles.sca3de967).className || ''} />
            ) : (
              <Binoculars className={stylex.props(styles.s3566be62).className || ''} />
            )}
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent side="top" align="end" className={stylex.props(styles.s36c833).className || ''}>
        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <SizableText size="sm" className={stylex.props(styles.s129e46b3).className || ''}>
            Watching {count} Resources
          </SizableText>
          <div className={stylex.props(styles_2.s7b569988).className || ''}>
            {subscriptionKeys.map((key) => (
              <SubscriptionItem key={key} subscriptionKey={key} />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Get human-readable label for a task name
 */
function getTaskLabel(taskName: TaskName): string {
  switch (taskName) {
    case TaskName.REINDEXING:
      return 'Reindexing Database'
    case TaskName.EMBEDDING:
      return 'Generating Embeddings'
    case TaskName.LOADING_MODEL:
      return 'Loading AI Model'
    default:
      return 'Background Task'
  }
}

/**
 * Calculate progress percentage for a task
 */
function getTaskProgress(task: Task): number {
  const total = Number(task.total)
  const completed = Number(task.completed)
  if (total <= 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Single task item in the hover card
 */
function DaemonTaskItem({task}: {task: Task}) {
  const progress = getTaskProgress(task)
  const label = getTaskLabel(task.taskName)
  const total = Number(task.total)
  const completed = Number(task.completed)
  return (
    <div className={stylex.props(styles.s25987914).className || ''}>
      <div className={stylex.props(styles.s78289774).className || ''}>
        <SizableText size="xs" className={stylex.props(styles.s129e46b3).className || ''}>
          {label}
        </SizableText>
        <SizableText size="xs" className={stylex.props(styles.sf2718385).className || ''}>
          {progress}%
        </SizableText>
      </div>
      <Progress value={progress} className={stylex.props(styles.s5cebed3).className || ''} />
      {total > 0 && (
        <SizableText size="xs" className={stylex.props(styles.sf2718385).className || ''}>
          {completed.toLocaleString()} / {total.toLocaleString()}
          {task.description && ` - ${task.description}`}
        </SizableText>
      )}
    </div>
  )
}

/**
 * Footer indicator showing background daemon tasks with progress
 */
function DaemonTasksIndicator() {
  const {data: info} = useDaemonInfo()

  // Get active tasks
  const tasks = info?.tasks ?? []

  // Don't render anything if no tasks
  if (tasks.length === 0) return null

  // Build summary text
  const taskCount = tasks.length
  const summaryText = taskCount === 1 ? getTaskLabel(tasks[0].taskName) : `${taskCount} tasks running`

  // Calculate average progress across all tasks for the inline indicator
  const avgProgress =
    tasks.length > 0
      ? Math.round(tasks.reduce((sum: number, task: Task) => sum + getTaskProgress(task), 0) / tasks.length)
      : 0
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div className={stylex.props(styles.s400bc241).className || ''}>
          <Spinner size="small" className={stylex.props(styles.sca3de967).className || ''} />
          <SizableText
            size="xs"
            className={stylex.props(styles.sc7a0694e).className || ''}
            style={{
              fontSize: 10,
            }}
          >
            {summaryText}
          </SizableText>
          {tasks.length === 1 && (
            <SizableText
              size="xs"
              className={stylex.props(styles.sc7a0694e).className || ''}
              style={{
                fontSize: 10,
              }}
            >
              ({avgProgress}%)
            </SizableText>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="end" className={stylex.props(styles.s36c80e).className || ''}>
        <div className={stylex.props(styles.sfbc6e28f).className || ''}>
          <SizableText size="sm" className={stylex.props(styles.s129e46b3).className || ''}>
            Background Tasks
          </SizableText>
          <div className={stylex.props(styles.sfbc6e28f).className || ''}>
            {tasks.map((task: Task, index: number) => (
              <DaemonTaskItem key={`${task.taskName}-${index}`} task={task} />
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
