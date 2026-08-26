import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shm/ui/components/alert-dialog'
import {Badge} from '@shm/ui/components/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shm/ui/components/dialog'
import {Input} from '@shm/ui/components/input'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {Plus, Trash} from 'lucide-react'
import {useState} from 'react'
import {
  getDefaultAgentServerUrl,
  LOCAL_AGENT_SERVER_LABEL,
  useAgentServerHealth,
  useAgentServerUrl,
  useConfiguredAgentServerUrls,
  useLocalAgentServerUrl,
  useSetAgentServerUrl,
  useSetAgentServerUrls,
} from './models'

/** Manages the configured agent servers: add, remove, and pick the default. */
const styles = stylex.create({
  sd330460: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s760cfea1: {
    alignSelf: 'flex-start',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sdf62ae4e: {
    display: 'flex',
    flexShrink: '0',
    gap: 'calc(0.25rem * 2)',
  },
  s88a3565a: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
  s38dca3a9: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '700',
  },
  sb87f7413: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 3)',
  },
})
export function AgentServersSettings() {
  // Edits apply to the persisted list only. The locally spawned server is shown separately below
  // because its URL is assigned at startup and must never be written to settings.
  const servers = useConfiguredAgentServerUrls()
  const localServerUrl = useLocalAgentServerUrl()
  const defaultServer = useAgentServerUrl()
  const setServers = useSetAgentServerUrls()
  const setDefaultServer = useSetAgentServerUrl()
  const builtInDefaultUrl = getDefaultAgentServerUrl()
  const [draftUrl, setDraftUrl] = useState(builtInDefaultUrl ?? '')
  const [isAddOpen, setIsAddOpen] = useState(false)
  async function addServer() {
    try {
      const next = [...(servers.data || []), draftUrl]
      await setServers.mutateAsync(next)
      setDraftUrl(builtInDefaultUrl ?? '')
      setIsAddOpen(false)
      toast.success('Agent server added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add agent server')
    }
  }
  async function removeServer(serverUrl: string) {
    try {
      const next = (servers.data || []).filter((url) => url !== serverUrl)
      await setServers.mutateAsync(next)
      toast.success('Agent server removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove agent server')
    }
  }
  async function makeDefault(serverUrl: string) {
    try {
      await setDefaultServer.mutateAsync(serverUrl)
      toast.success('Default agent server updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update default agent server')
    }
  }
  return (
    <div className={stylex.props(styles.sd330460).className || ''}>
      <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        Connect to different AI agent servers, accessible from Agents page.
      </SizableText>
      <div className={stylex.props(styles.sfbc6e28e).className || ''}>
        {localServerUrl.data ? (
          <AgentServerSettingsRow
            key={localServerUrl.data}
            serverUrl={localServerUrl.data}
            isDefault={defaultServer.data === localServerUrl.data}
            isLocal
            onMakeDefault={() => void makeDefault(localServerUrl.data!)}
          />
        ) : null}
        {(servers.data || []).map((serverUrl) => (
          <AgentServerSettingsRow
            key={serverUrl}
            serverUrl={serverUrl}
            isDefault={defaultServer.data === serverUrl}
            onMakeDefault={() => void makeDefault(serverUrl)}
            onRemove={() => void removeServer(serverUrl)}
          />
        ))}
        {!servers.data?.length && !localServerUrl.data ? (
          <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
            No agent servers configured.
          </SizableText>
        ) : null}
      </div>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={stylex.props(styles.s760cfea1).className || ''}>
            <Plus className={stylex.props(styles.sca3de968).className || ''} />
            Add server
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add agent server</DialogTitle>
            <DialogDescription>Enter the URL of the agent server you want to connect to.</DialogDescription>
          </DialogHeader>
          <Input
            value={draftUrl}
            onChange={(event) => setDraftUrl(event.target.value)}
            placeholder={builtInDefaultUrl ?? 'https://agents.example.com'}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void addServer()
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void addServer()} disabled={setServers.isLoading || !draftUrl.trim()}>
              Add server
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
function AgentServerSettingsRow({
  serverUrl,
  isDefault,
  isLocal = false,
  onMakeDefault,
  onRemove,
}: {
  serverUrl: string
  isDefault: boolean
  /** The desktop-managed server. Always present, so it has no remove action. */
  isLocal?: boolean
  onMakeDefault: () => void
  onRemove?: () => void
}) {
  const health = useAgentServerHealth(serverUrl)
  return (
    <div className="group border-border bg-background flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className={stylex.props(styles.s86ff3e4).className || ''}>
          <SizableText size="sm" weight="bold" className={stylex.props(styles.s6e724d66).className || ''}>
            {isLocal ? LOCAL_AGENT_SERVER_LABEL : serverUrl}
          </SizableText>
          {isDefault ? <Badge variant="secondary">Default</Badge> : null}
        </div>
        <SizableText size="xs" className={health.isError ? 'text-destructive' : 'text-muted-foreground'}>
          {health.isLoading
            ? 'Checking…'
            : health.isError
              ? 'Offline or unreachable'
              : `Online · uptime ${Math.floor((health.data?.uptime || 0) / 60)}m`}
        </SizableText>
      </div>
      <div className={stylex.props(styles.sdf62ae4e).className || ''}>
        {isDefault ? null : (
          <Button
            variant="outline"
            size="sm"
            onClick={onMakeDefault}
            className="opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100"
          >
            Make default
          </Button>
        )}
        {isLocal ? null : (
          <AlertDialog>
            <Tooltip content="Remove agent server">
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash className={stylex.props(styles.sca3de968).className || ''} />
                  <span className={stylex.props(styles.s88a3565a).className || ''}>Remove</span>
                </Button>
              </AlertDialogTrigger>
            </Tooltip>
            <AlertDialogPortal>
              <AlertDialogContent className="max-w-[500px] gap-4">
                <AlertDialogTitle className={stylex.props(styles.s38dca3a9).className || ''}>
                  Remove Agent Server
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {serverUrl}? You can add it back later.
                </AlertDialogDescription>
                <div className={stylex.props(styles.sb87f7413).className || ''}>
                  <AlertDialogCancel asChild>
                    <Button variant="ghost">Cancel</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button variant="destructive" onClick={onRemove}>
                      Remove
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialogPortal>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}

/**
 * {@link AgentServersSettings} as a `useAppDialog` content component, for apps with no settings
 * window to navigate to (the web app manages servers right on the agents page).
 */
export function AgentServersDialog({}: {input: true; onClose: () => void}) {
  return (
    <div className="flex max-h-[78vh] w-full flex-col gap-1 overflow-y-auto">
      <DialogTitle>Agent Servers</DialogTitle>
      <AgentServersSettings />
    </div>
  )
}
