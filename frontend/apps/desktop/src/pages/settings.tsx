import * as stylex from '@stylexjs/stylex'
import {useAppContext, useIPC} from '@/app-context'
import {AccountWallet, WalletPage} from '@/components/payment-settings'
import {reportError} from '@/errors'
import {AgentServersSettings} from '@shm/ui/agents/server-settings'
import {useAutoUpdatePreference} from '@/models/app-settings'
import {useDaemonInfo, useDeleteKey, useExportKey, useListKeys, useSavedMnemonics} from '@/models/daemon'
import {useWriteExperiments} from '@/models/experiments'
import {
  useGatewayUrl,
  usePushOnCopy,
  usePushOnPublish,
  useSetGatewayUrl,
  useSetPushOnCopy,
  useSetPushOnPublish,
} from '@/models/gateway-settings'
import {usePeerInfo} from '@/models/networking'
import {useSystemThemeWriter, type SystemTheme} from '@/models/settings'
import {useOpenUrl} from '@/open-url'
import {client} from '@/trpc'
import {useNavigate} from '@/utils/useNavigate'
import {useUniversalAppContext} from '@shm/shared'
import {COMMIT_HASH, LIGHTNING_API_URL, SEED_HOST_URL, VERSION} from '@shm/shared/constants'
import {getMetadataName} from '@shm/shared/content'
import {useResource} from '@shm/shared/models/entity'
import {invalidateQueries} from '@shm/shared/models/query-client'
import {queryKeys} from '@shm/shared/models/query-keys'
import type {SettingsTab} from '@shm/shared/routes'
import {hmId} from '@shm/shared/utils/entity-id-url'
import {useNavRoute} from '@shm/shared/utils/navigation'
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
import {Checkbox} from '@shm/ui/components/checkbox'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@shm/ui/components/dialog'
import {Input} from '@shm/ui/components/input'
import {Label} from '@shm/ui/components/label'
import {RadioGroup, RadioGroupItem} from '@shm/ui/components/radio-group'
import {ScrollArea} from '@shm/ui/components/scroll-area'
import {TabsContent, TabsTrigger} from '@shm/ui/components/tabs'
import {Textarea} from '@shm/ui/components/textarea'
import {panelContainerStyles, windowContainerStyles} from '@shm/ui/container'
import {copyTextToClipboard} from '@shm/ui/copy-to-clipboard'
import {Field} from '@shm/ui/form-fields'
import {HMIcon} from '@shm/ui/hm-icon'
import {Copy, ExternalLink} from '@shm/ui/icons'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@shm/ui/select-dropdown'
import {Separator} from '@shm/ui/separator'
import {Spinner} from '@shm/ui/spinner'
import {InfoListHeader, InfoListItem, TableList} from '@shm/ui/table-list'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {useMutation, useQuery} from '@tanstack/react-query'
import {
  Check,
  ChevronDown,
  Code2,
  Cog,
  Download,
  Eye,
  EyeOff,
  Info,
  Pencil,
  Plus,
  RadioTower,
  Server,
  Trash,
  UserRoundPlus,
} from 'lucide-react'
import React, {useEffect, useId, useMemo, useState} from 'react'
const styles = stylex.create({
  sa368bb19: {
    display: 'flex',
    flex: '1',
    overflow: 'hidden',
  },
  sc3ed6c02: {
    display: 'flex',
    flex: '1',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s219f7f8b: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 6)',
    padding: 'calc(0.25rem * 6)',
  },
  sd94ce182: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2.5)',
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sf0fd1379: {
    backgroundColor: 'var(--border)',
    height: '1px',
  },
  sef1c143e: {
    marginRight: 'calc(0.25rem * 2)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s86ff3e6: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  sac428cea: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s86442bb7: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '700',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sb87f7413: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 3)',
  },
  s95b76734: {
    color: 'var(--muted-foreground)',
    marginBottom: 'calc(0.25rem * 2)',
    letterSpacing: '0.05em',
  },
  s87791731: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s36a9a940: {
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sd25dd2f0: {
    marginLeft: 'calc(0.25rem * 1)',
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    transitionProperty: 'transform, translate, scale, rotate',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  s93dc443a: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 2)',
    wordBreak: 'break-all',
  },
  s4468076a: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 3)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sd28bc940: {
    display: 'flex',
    flex: '1',
    gap: 'calc(0.25rem * 3)',
  },
  s486e68e8: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
  },
  s21835087: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    padding: 'calc(0.25rem * 4)',
  },
  sd83bda6c: {
    marginBottom: 'calc(0.25rem * 4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  sc91a2955: {
    display: 'flex',
    width: 'calc(0.25rem * 24)',
    justifyContent: 'center',
    paddingTop: 'calc(0.25rem * 1)',
  },
  s731a65c4: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  s788b4147: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    paddingInline: 'calc(0.25rem * 3)',
  },
  s38dca3a9: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '700',
  },
  se658ac15: {
    display: 'flex',
    gap: 'calc(0.25rem * 3)',
  },
  s56c7105c: {
    borderColor: 'var(--border)',
    flex: '1',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  sf3161146: {
    color: 'var(--muted-foreground)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s11c1d1bc: {
    color: 'var(--destructive)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  scd595190: {
    display: 'flex',
    height: '100%',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 4)',
    padding: 'calc(0.25rem * 6)',
  },
  s72a2b24b: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    width: 'calc(0.25rem * 20)',
    height: 'calc(0.25rem * 20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
  },
  s33458e: {
    marginTop: 'calc(0.25rem * 4)',
  },
  s636aae46: {
    height: 'auto',
    width: '100%',
    alignItems: 'flex-start',
  },
  s8d50829d: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  s5c0d82dc: {
    height: 'calc(0.25rem * 6)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sdef6fad4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1)',
  },
  s6ff5c0c1: {
    color: 'var(--brand)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s2c8b4ee7: {
    color: 'var(--brand)',
  },
  scdbaf625: {
    width: '100%',
  },
  sa16ea943: {
    fontWeight: '700',
  },
  s3898da93: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: 'calc(0.25rem * 4)',
    rowGap: 'calc(0.25rem * 1)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  se658ac13: {
    display: 'flex',
    gap: 'calc(0.25rem * 1)',
  },
  s8fc7e6c5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sa6bfe6cd: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: 'calc(0.25rem * 4)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  s2ca89e9a: {
    color: 'var(--brand-2)',
    cursor: 'pointer',
  },
  s8a7f4779: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
    overflow: 'hidden',
  },
  s288837e: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    padding: 'calc(0.25rem * 4)',
    paddingBottom: 'calc(0.25rem * 5)',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  s48f5532a: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 'calc(0.25rem * 3)',
  },
})
const SETTINGS_TABS = [
  'general',
  'sync',
  'app-info',
  'agent-servers',
  'advanced',
] as const satisfies readonly SettingsTab[]
type SettingsTabConfig = {
  key: SettingsTab
  icon: any
  label: string
}
const SETTINGS_TAB_CONFIG: SettingsTabConfig[] = [
  {
    key: 'general',
    icon: Cog,
    label: 'General settings',
  },
  {
    key: 'sync',
    icon: RadioTower,
    label: 'Sync options',
  },
  {
    key: 'app-info',
    icon: Info,
    label: 'App info',
  },
  {
    key: 'agent-servers',
    icon: Server,
    label: 'Agent Servers',
  },
  {
    key: 'advanced',
    icon: Code2,
    label: 'Advanced',
  },
]
export default function Settings() {
  const route = useNavRoute()
  const navigate = useNavigate('replace')
  const activeTab: SettingsTab =
    route.key === 'settings' && route.tab && SETTINGS_TABS.includes(route.tab) ? route.tab : 'general'
  const setActiveTab = (tab: SettingsTab) =>
    navigate({
      key: 'settings',
      tab,
    })
  return (
    <div className={cn(windowContainerStyles, 'h-full max-h-full min-h-0 w-full overflow-hidden pt-0')}>
      <div className={panelContainerStyles}>
        <div className={stylex.props(styles.sa368bb19).className || ''}>
          <div className={stylex.props(styles.sc3ed6c02).className || ''}>
            {/* Sidebar */}
            <div className="border-border flex w-[220px] shrink-0 flex-col gap-1 border-r p-2">
              {SETTINGS_TAB_CONFIG.map((tab) => (
                <SidebarTab
                  key={tab.key}
                  active={activeTab === tab.key}
                  icon={tab.icon}
                  label={tab.label}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>
            {/* Content */}
            <ScrollArea className={stylex.props(styles.sb42feb5d).className || ''}>
              <div className={stylex.props(styles.s219f7f8b).className || ''}>
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'sync' && <GatewaySettings />}
                {activeTab === 'app-info' && <AppSettings />}
                {activeTab === 'agent-servers' && <AgentServersSettingsPage />}
                {activeTab === 'advanced' && <AdvancedSettings />}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
function AdvancedSettings() {
  return (
    <>
      <SizableText size="2xl" weight="bold">
        Advanced
      </SizableText>
      <DeveloperSettings />
    </>
  )
}
function AgentServersSettingsPage() {
  return (
    <>
      <SizableText size="2xl" weight="bold">
        Agent Servers
      </SizableText>
      <AgentServersSettings />
    </>
  )
}
function SidebarTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: any
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        stylex.props(styles.sd94ce182).className || '',
        active ? 'bg-brand/10 text-brand-2 font-medium' : 'text-muted-foreground hover:bg-muted',
      )}
      onClick={onClick}
    >
      <Icon className={stylex.props(styles.sca3de968).className || ''} />
      {label}
    </button>
  )
}
function SettingsDivider() {
  return <div className={stylex.props(styles.sf0fd1379).className || ''} />
}
export function DeleteDraftLogs() {
  const [isConfirming, setIsConfirming] = useState(false)
  const destroyDraftLogs = useMutation({
    mutationFn: () => client.diagnosis.destroyDraftLogFolder.mutate(),
  })
  if (isConfirming) {
    return (
      <Button
        variant="destructive"
        onClick={() => {
          destroyDraftLogs.mutateAsync().then(() => {
            toast.success('Cleaned up Draft Logs')
            setIsConfirming(false)
          })
        }}
      >
        <Trash className={stylex.props(styles.sef1c143e).className || ''} />
        Confirm Delete Draft Log Folder?
      </Button>
    )
  }
  return (
    <Button
      variant="destructive"
      onClick={() => {
        setIsConfirming(true)
      }}
    >
      <Trash className={stylex.props(styles.sef1c143e).className || ''} />
      Delete All Draft Logs
    </Button>
  )
}
export function DeleteAllRecents() {
  const [isConfirming, setIsConfirming] = useState(false)
  const clearAllRecents = useMutation({
    mutationFn: () => client.recents.clearAllRecents.mutate(),
  })
  if (isConfirming) {
    return (
      <Button
        variant="destructive"
        onClick={() => {
          clearAllRecents.mutateAsync().then(() => {
            toast.success('All recent items cleared')
            setIsConfirming(false)
          })
        }}
      >
        <Trash className={stylex.props(styles.sef1c143e).className || ''} />
        Confirm Delete All Recents?
      </Button>
    )
  }
  return (
    <Button
      variant="destructive"
      onClick={() => {
        setIsConfirming(true)
      }}
    >
      <Trash className={stylex.props(styles.sef1c143e).className || ''} />
      Delete All Recent Items
    </Button>
  )
}
function GeneralSettings() {
  const [theme, setTheme, isInitialLoading] = useSystemThemeWriter()
  const serverTheme = (theme as SystemTheme | undefined) || 'system'
  const [optimisticTheme, setOptimisticTheme] = useState(serverTheme)
  useEffect(() => {
    setOptimisticTheme(serverTheme)
  }, [serverTheme])
  return (
    <>
      <SizableText size="2xl" weight="bold">
        General settings
      </SizableText>
      <SettingsCard label="APPEARANCE">
        <SettingsRow
          label="Theme"
          right={
            !isInitialLoading ? (
              <RadioGroup
                value={optimisticTheme}
                onValueChange={(value) => {
                  const next = value as SystemTheme
                  const previous = optimisticTheme
                  if (next === previous) return
                  setOptimisticTheme(next)
                  setTheme(next, {
                    onError: () => setOptimisticTheme(previous),
                  })
                }}
                className={stylex.props(styles.s86ff3e6).className || ''}
              >
                <div className={stylex.props(styles.sac428cea).className || ''}>
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className={stylex.props(styles.sab7cc6fa).className || ''}>
                    System
                  </Label>
                </div>
                <div className={stylex.props(styles.sac428cea).className || ''}>
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className={stylex.props(styles.sab7cc6fa).className || ''}>
                    Light
                  </Label>
                </div>
                <div className={stylex.props(styles.sac428cea).className || ''}>
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className={stylex.props(styles.sab7cc6fa).className || ''}>
                    Dark
                  </Label>
                </div>
              </RadioGroup>
            ) : null
          }
        />
      </SettingsCard>
      <SettingsCard label="HISTORY">
        <SettingsRow
          label="Clear all your recent document search history."
          description="This action cannot be undone."
          right={<ClearHistoryButton />}
        />
      </SettingsCard>
    </>
  )
}
type NetworkMode = 'mainnet' | 'testnet' | 'custom'
const NETWORK_MODE_LABELS: Record<NetworkMode, string> = {
  mainnet: 'Main Network',
  testnet: 'Test Network',
  custom: 'Custom Network',
}
function NetworkSettings() {
  const networkConfig = useQuery({
    queryKey: ['daemonNetworkConfig'],
    queryFn: () => client.getDaemonNetworkConfig.query(),
  })
  // While non-null, the confirmation dialog is open for switching to this mode.
  const [pendingMode, setPendingMode] = useState<NetworkMode | null>(null)
  const [pendingCustomName, setPendingCustomName] = useState('')
  const savedMode: NetworkMode = networkConfig.data?.mode ?? 'mainnet'
  const savedCustomName = networkConfig.data?.customName ?? ''
  const setNetwork = useMutation({
    mutationFn: (config: {mode: NetworkMode; customName?: string}) => client.setDaemonNetworkConfig.mutate(config),
    onSuccess: () => {
      toast.success('Network changed. Background service restarted.')
      networkConfig.refetch()
    },
    onError: (error: unknown) => {
      toast.error('Failed to change network: ' + String(error))
      reportError(error, {
        feature: 'settings',
        operation: 'set-daemon-network',
      })
    },
  })
  function requestModeChange(mode: NetworkMode) {
    setPendingMode(mode)
    setPendingCustomName(savedCustomName)
  }
  function confirmNetworkChange() {
    if (!pendingMode) return
    setNetwork.mutate(
      pendingMode === 'custom'
        ? {
            mode: pendingMode,
            customName: pendingCustomName.trim(),
          }
        : {
            mode: pendingMode,
          },
    )
    setPendingMode(null)
  }
  const canConfirm = pendingMode !== 'custom' || pendingCustomName.trim().length > 0
  // The select item for 'custom' only exists when a custom network is already saved;
  // a pending new custom network maps to the 'custom-new' item.
  const selectValue = pendingMode
    ? pendingMode === 'custom' && savedMode !== 'custom'
      ? 'custom-new'
      : pendingMode
    : savedMode
  const pendingNetworkLabel =
    pendingMode === 'custom'
      ? pendingCustomName.trim()
        ? `the custom network "${pendingCustomName.trim()}"`
        : 'a custom network'
      : pendingMode
        ? NETWORK_MODE_LABELS[pendingMode]
        : ''
  return (
    <>
      <SettingsCard label="NETWORK">
        <SettingsRow
          label="P2P Network"
          description={
            savedMode === 'custom' && savedCustomName
              ? `Connected to the custom network "${savedCustomName}". Changing this restarts the background service.`
              : 'Choose which peer-to-peer network to connect to. Changing this restarts the background service.'
          }
          right={
            <div className={stylex.props(styles.s86ff3e4).className || ''}>
              {setNetwork.isLoading ? <Spinner size="small" /> : null}
              <Select
                value={selectValue}
                onValueChange={(value) => {
                  if (value === 'custom-new') {
                    setPendingMode('custom')
                    setPendingCustomName('')
                  } else {
                    requestModeChange(value as NetworkMode)
                  }
                }}
                disabled={networkConfig.isLoading || setNetwork.isLoading}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">{NETWORK_MODE_LABELS.mainnet}</SelectItem>
                  <SelectItem value="testnet">{NETWORK_MODE_LABELS.testnet}</SelectItem>
                  {savedMode === 'custom' && savedCustomName ? (
                    <SelectItem value="custom">{savedCustomName}</SelectItem>
                  ) : null}
                  <SelectItem value="custom-new">{NETWORK_MODE_LABELS.custom}</SelectItem>
                </SelectContent>
              </Select>
              {savedMode === 'custom' ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={networkConfig.isLoading || setNetwork.isLoading}
                  onClick={() => requestModeChange('custom')}
                >
                  <Pencil className={stylex.props(styles.sca3de967).className || ''} />
                </Button>
              ) : null}
            </div>
          }
        />
      </SettingsCard>
      <AlertDialog
        open={pendingMode !== null}
        onOpenChange={(open) => {
          if (!open) setPendingMode(null)
        }}
      >
        <AlertDialogPortal>
          <AlertDialogContent className="max-w-[500px] gap-4">
            <AlertDialogTitle className={stylex.props(styles.s86442bb7).className || ''}>
              Change Network?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {`This will restart the background service connected to ${pendingNetworkLabel}. Content from other networks will be unavailable until you switch back. The app may be briefly unresponsive during restart.`}
            </AlertDialogDescription>
            {pendingMode === 'custom' ? (
              <div className={stylex.props(styles.sfbc6e28e).className || ''}>
                <Label htmlFor="custom-network-name">Network Name</Label>
                <Input
                  id="custom-network-name"
                  value={pendingCustomName}
                  onChange={(e) => setPendingCustomName(e.target.value)}
                  placeholder="network-name"
                  autoFocus
                />
                <SizableText size="xs" className={stylex.props(styles.sf2718385).className || ''}>
                  Peers only connect to each other when they use the same network name.
                </SizableText>
              </div>
            ) : null}
            <div className={stylex.props(styles.sb87f7413).className || ''}>
              <AlertDialogCancel asChild>
                <Button variant="ghost">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button disabled={!canConfirm} onClick={confirmNetworkChange}>
                  Change & Restart
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  )
}
function SettingsCard({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div>
      <SizableText size="xs" weight="bold" className={stylex.props(styles.s95b76734).className || ''}>
        {label}
      </SizableText>
      <div className="bg-muted dark:bg-background rounded-lg border">{children}</div>
    </div>
  )
}
function SettingsRow({label, description, right}: {label: string; description?: string; right?: React.ReactNode}) {
  return (
    <div className={stylex.props(styles.s87791731).className || ''}>
      <div className="flex min-w-0 flex-1 flex-col">
        <SizableText size="sm" weight="medium">
          {label}
        </SizableText>
        {description ? (
          <SizableText size="xs" className={stylex.props(styles.sf2718385).className || ''}>
            {description}
          </SizableText>
        ) : null}
      </div>
      {right ? <div className={stylex.props(styles.sf032ed6c).className || ''}>{right}</div> : null}
    </div>
  )
}
function GoBuildInfo({goBuildInfo}: {goBuildInfo: string}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={stylex.props(styles.s36a9a940).className || ''}>
      <div className={stylex.props(styles.s86ff3e5).className || ''}>
        <SizableText size="sm" weight="medium">
          Go build
        </SizableText>
        <Button
          size="sm"
          variant="outline"
          className={stylex.props(styles.sf032ed6c).className || ''}
          onClick={() => setExpanded(!expanded)}
        >
          Show details{' '}
          <ChevronDown className={cn(stylex.props(styles.sd25dd2f0).className || '', expanded && 'rotate-180')} />
        </Button>
      </div>
      {expanded ? (
        <SizableText size="xs" className={stylex.props(styles.s93dc443a).className || ''}>
          {goBuildInfo || 'Loading…'}
        </SizableText>
      ) : null}
    </div>
  )
}
function NetworkAddresses({addrs}: {addrs?: string}) {
  const [expanded, setExpanded] = useState(false)
  const firstAddr = addrs?.split('\n')[0]
  return (
    <div className={stylex.props(styles.s4468076a).className || ''}>
      <SizableText size="xs" className="text-muted-foreground min-w-0 flex-1 break-all">
        {expanded ? addrs : firstAddr ? `${firstAddr}…` : 'Loading…'}
      </SizableText>
      {addrs ? (
        <Button
          size="sm"
          variant="outline"
          className={stylex.props(styles.sf032ed6c).className || ''}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : 'Show all'}{' '}
          <ChevronDown className={cn(stylex.props(styles.sd25dd2f0).className || '', expanded && 'rotate-180')} />
        </Button>
      ) : null}
    </div>
  )
}
function ClearHistoryButton() {
  const [isConfirming, setIsConfirming] = useState(false)
  const clearAllRecents = useMutation({
    mutationFn: () => client.recents.clearAllRecents.mutate(),
  })
  if (isConfirming) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          clearAllRecents.mutateAsync().then(() => {
            toast.success('Search history cleared')
            setIsConfirming(false)
          })
        }}
      >
        Confirm?
      </Button>
    )
  }
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-destructive border-destructive hover:bg-destructive/10"
      onClick={() => setIsConfirming(true)}
    >
      Clear history
    </Button>
  )
}
export function DeveloperSettings() {
  const experiments = useUniversalAppContext().experiments
  const writeExperiments = useWriteExperiments()
  const enabledDevTools = experiments?.developerTools
  const enabledPubContentDevMenu = experiments?.pubContentDevMenu
  const enabledAdvancedCopyLinkOptions = experiments?.advancedCopyLinkOptions
  const embeddingEnabled = experiments?.embeddingEnabled
  const [showEmbeddingConfirm, setShowEmbeddingConfirm] = useState(false)
  const [pendingEmbeddingState, setPendingEmbeddingState] = useState(false)
  const restartDaemon = useMutation({
    mutationFn: (enabled: boolean) =>
      client.restartDaemonWithEmbedding.mutate({
        embeddingEnabled: enabled,
      }),
    onSuccess: () => {
      toast.success(
        pendingEmbeddingState ? 'Embedding enabled. Daemon restarted.' : 'Embedding disabled. Daemon restarted.',
      )
    },
    onError: (error: unknown) => {
      toast.error('Failed to restart daemon: ' + String(error))
      reportError(error, {
        feature: 'settings',
        operation: 'restart-daemon',
        pendingEmbeddingState,
      })
    },
  })
  const openDraftLogs = useMutation({
    mutationFn: () => client.diagnosis.openDraftLogFolder.mutate(),
  })
  function handleEmbeddingToggle() {
    const newState = !embeddingEnabled
    setPendingEmbeddingState(newState)
    setShowEmbeddingConfirm(true)
  }
  function confirmEmbeddingChange() {
    setShowEmbeddingConfirm(false)
    writeExperiments.mutate({
      embeddingEnabled: pendingEmbeddingState,
    })
    restartDaemon.mutate(pendingEmbeddingState)
  }
  return (
    <>
      <SettingsCard label="DEVELOPERS">
        <SettingsRow
          label="Embedding / AI Features"
          description="Enable AI-powered document embeddings for semantic search and related content features. This will restart the background service."
          right={
            <Button size="sm" variant="outline" onClick={handleEmbeddingToggle} disabled={restartDaemon.isLoading}>
              {restartDaemon.isLoading ? 'Restarting…' : embeddingEnabled ? 'Disable Embedding' : 'Enable Embedding'}
            </Button>
          }
        />
        <Separator />
        <SettingsRow
          label="Developer Tools"
          description="Adds features across the app for helping diagnose issues. Mostly useful for Seed Developers."
          right={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                writeExperiments.mutate({
                  developerTools: !enabledDevTools,
                })
              }
            >
              {enabledDevTools ? 'Disable Debug Tools' : 'Enable Debug Tools'}
            </Button>
          }
        />
        <Separator />
        <SettingsRow
          label="Advanced Copy Link Options"
          description="Shows separate Canonical, Gateway, and Hypermedia URL choices in document menus."
          right={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                writeExperiments.mutate({
                  advancedCopyLinkOptions: !enabledAdvancedCopyLinkOptions,
                })
              }
            >
              {enabledAdvancedCopyLinkOptions ? 'Disable Advanced Copy Links' : 'Enable Advanced Copy Links'}
            </Button>
          }
        />
        <Separator />
        <SettingsRow
          label="Publication Content Dev Tools"
          description="Debug options for the formatting of all publication content"
          right={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                writeExperiments.mutate({
                  pubContentDevMenu: !enabledPubContentDevMenu,
                })
              }
            >
              {enabledPubContentDevMenu ? 'Disable Publication Panel' : 'Enable Publication Panel'}
            </Button>
          }
        />
        <Separator />
        <SettingsRow label="Draft Logs" description="Open draft Log Folder" right={<DeleteDraftLogs />} />
      </SettingsCard>
      <AlertDialog open={showEmbeddingConfirm} onOpenChange={setShowEmbeddingConfirm}>
        <AlertDialogPortal>
          <AlertDialogContent className="max-w-[500px] gap-4">
            <AlertDialogTitle className={stylex.props(styles.s86442bb7).className || ''}>
              {pendingEmbeddingState ? 'Enable Embedding?' : 'Disable Embedding?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingEmbeddingState
                ? 'This will restart the background service with AI embedding features enabled. The app may be briefly unresponsive during restart.'
                : 'This will restart the background service with AI embedding features disabled. The app may be briefly unresponsive during restart.'}
            </AlertDialogDescription>
            <div className={stylex.props(styles.sb87f7413).className || ''}>
              <AlertDialogCancel asChild>
                <Button variant="ghost">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant={pendingEmbeddingState ? 'default' : 'destructive'} onClick={confirmEmbeddingChange}>
                  {pendingEmbeddingState ? 'Enable & Restart' : 'Disable & Restart'}
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  )
}
function AccountKeys() {
  const {pickKeyExportFile} = useAppContext()
  const deleteKey = useDeleteKey()
  const exportKey = useExportKey()
  const keys = useListKeys()
  const deleteWords = useMutation({
    mutationFn: (name: string) => client.secureStorage.delete.mutate(name),
  })
  const [walletId, setWalletId] = useState<string | undefined>(undefined)
  const [selectedAccount, setSelectedAccount] = useState<undefined | string>(undefined)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportPassword, setExportPassword] = useState('')
  const [exportError, setExportError] = useState<string | null>(null)
  const selectedKey = keys.data?.find((key) => key.publicKey === selectedAccount)
  const {data: mnemonics, refetch: mnemonicsRefetch} = useSavedMnemonics(selectedKey?.name)
  const selectedAccountId = selectedAccount ? hmId(selectedAccount) : undefined
  const {data: profile} = useResource(selectedAccountId)
  const profileDocument = profile?.type === 'document' ? profile.document : undefined
  const [showWords, setShowWords] = useState<boolean>(false)
  useEffect(() => {
    if (keys.data && keys.data.length) {
      setSelectedAccount((current) => {
        if (current && keys.data.some((key) => key.publicKey === current)) {
          return current
        }
        return keys.data[0].publicKey
      })
    }
  }, [keys.data])
  useEffect(() => {
    if (selectedKey?.name) {
      mnemonicsRefetch()
    }
  }, [mnemonicsRefetch, selectedKey?.name])
  function handleDeleteCurrentAccount() {
    if (!selectedAccount) return
    deleteKey
      .mutateAsync({
        accountId: selectedAccount,
      })
      .then(() => {
        setSelectedAccount(undefined)
        toast.success('Profile removed correctly')
      })
  }
  async function handleExportCurrentAccount(e?: React.FormEvent) {
    e?.preventDefault()
    if (!selectedAccount || !selectedKey) return
    setExportError(null)
    try {
      const filePath = await pickKeyExportFile(`${selectedAccount}.hmkey.json`)
      if (!filePath) return
      await exportKey.mutateAsync({
        name: selectedKey.name,
        filePath,
        password: exportPassword.length > 0 ? exportPassword : undefined,
      })
      setIsExportDialogOpen(false)
      setExportPassword('')
      toast.success(`Key exported to ${filePath}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown export error'
      setExportError(message)
      toast.error('Failed to export key: ' + message)
    }
  }
  if (walletId && selectedAccount)
    return (
      <WalletPage
        walletId={walletId}
        accountUid={selectedAccount}
        onClose={() => {
          setWalletId(undefined)
        }}
      />
    )
  return keys.data?.length && selectedAccount ? (
    <div className={stylex.props(styles.sd28bc940).className || ''}>
      <div className="flex max-w-[25%] flex-1 flex-col gap-2">
        <div className={stylex.props(styles.s486e68e8).className || ''}>
          {keys.data?.map((key) => (
            <KeyItem
              key={key.publicKey}
              item={key.publicKey}
              isActive={key.publicKey == selectedAccount}
              onSelect={() => setSelectedAccount(key.publicKey)}
            />
          ))}
        </div>
      </div>
      <div className={cn('border-border dark:bg-background bg-muted flex flex-[3] flex-col rounded-lg border')}>
        <div className={stylex.props(styles.s21835087).className || ''}>
          <div className={stylex.props(styles.sd83bda6c).className || ''}>
            <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-x-4 gap-y-4">
              <div className={stylex.props(styles.sc91a2955).className || ''}>
                {selectedAccountId ? (
                  <HMIcon
                    id={selectedAccountId}
                    name={profileDocument?.metadata?.name}
                    icon={profileDocument?.metadata?.icon}
                    size={80}
                  />
                ) : null}
              </div>
              <div className={stylex.props(styles.s731a65c4).className || ''}>
                <Field id="username" label="Profile Name">
                  <Input disabled value={getMetadataName(profileDocument?.metadata)} />
                </Field>
                <Field id="accountid" label="Account ID">
                  <Input disabled value={selectedAccount} />
                </Field>
              </div>
            </div>
            <div className={stylex.props(styles.s788b4147).className || ''}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setExportPassword('')
                  setExportError(null)
                  setIsExportDialogOpen(true)
                }}
              >
                <Download className={stylex.props(styles.sef1c143e).className || ''} />
                Export Key
              </Button>
              <AlertDialog>
                <Tooltip content="Delete account from device">
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash className={stylex.props(styles.sef1c143e).className || ''} />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                </Tooltip>
                <AlertDialogPortal>
                  <AlertDialogContent className="max-w-[600px] gap-4">
                    <AlertDialogTitle className={stylex.props(styles.s38dca3a9).className || ''}>
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? This account will be removed. Make sure you have saved the Secret Recovery Phrase
                      for this account if you want to recover it later.
                    </AlertDialogDescription>
                    <div className={stylex.props(styles.sb87f7413).className || ''}>
                      <AlertDialogCancel asChild>
                        <Button variant="ghost">Cancel</Button>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={handleDeleteCurrentAccount}>
                          Delete Permanently
                        </Button>
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialogPortal>
              </AlertDialog>
            </div>
          </div>
          {mnemonics ? (
            <div className={stylex.props(styles.sfbc6e28e).className || ''}>
              <Field label="Secret Recovery Phrase" id="words">
                <div className={stylex.props(styles.se658ac15).className || ''}>
                  <Textarea
                    className={stylex.props(styles.s56c7105c).className || ''}
                    rows={4}
                    disabled
                    value={
                      showWords
                        ? Array.isArray(mnemonics)
                          ? mnemonics.join(', ')
                          : mnemonics
                        : '**** **** **** **** **** **** **** **** **** **** **** ****'
                    }
                  />
                  <div className={stylex.props(styles.sfbc6e28e).className || ''}>
                    <Button size="sm" variant="outline" onClick={() => setShowWords((v) => !v)}>
                      {showWords ? (
                        <EyeOff className={stylex.props(styles.sca3de968).className || ''} />
                      ) : (
                        <Eye className={stylex.props(styles.sca3de968).className || ''} />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log('mnemonics', mnemonics)
                        copyTextToClipboard(mnemonics.join(', '))
                        toast.success('Words copied to clipboard')
                      }}
                    >
                      <Copy className={stylex.props(styles.sca3de968).className || ''} />
                    </Button>

                    <AlertDialog>
                      <Tooltip content="Delete words from device">
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash className={stylex.props(styles.sca3de968).className || ''} />
                          </Button>
                        </AlertDialogTrigger>
                      </Tooltip>
                      <AlertDialogPortal>
                        <AlertDialogContent className="max-w-[600px] gap-4">
                          <AlertDialogTitle className={stylex.props(styles.s38dca3a9).className || ''}>
                            Delete Words
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you really sure? you cant recover the secret words after you delete them. please save
                            them securely in another place before you delete
                          </AlertDialogDescription>
                          <div className={stylex.props(styles.sb87f7413).className || ''}>
                            <AlertDialogCancel asChild>
                              <Button variant="ghost">Cancel</Button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  deleteWords.mutateAsync(selectedKey?.name || selectedAccount).then(() => {
                                    toast.success('Words deleted!')
                                    invalidateQueries([queryKeys.SECURE_STORAGE])
                                  })
                                }
                              >
                                Delete Permanently
                              </Button>
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialogPortal>
                    </AlertDialog>
                  </div>
                </div>
              </Field>
            </div>
          ) : null}
          <SettingsSection title="Wallets">
            <AccountWallet accountUid={selectedAccount} onOpenWallet={(walletId) => setWalletId(walletId)} />
          </SettingsSection>
        </div>
      </div>
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Export Key File</DialogTitle>
            <DialogDescription>
              Choose whether to protect the exported `.hmkey.json` file with a password.
            </DialogDescription>
          </DialogHeader>
          <form className={stylex.props(styles.sfbc6e290).className || ''} onSubmit={handleExportCurrentAccount}>
            <div className={stylex.props(styles.sf3161146).className || ''}>
              Exported key files can grant full account control. Use a password whenever possible and store the file
              securely.
            </div>
            {exportError ? <p className={stylex.props(styles.s11c1d1bc).className || ''}>{exportError}</p> : null}
            <div className={stylex.props(styles.sfbc6e28e).className || ''}>
              <Label htmlFor="export-key-password">Password (optional)</Label>
              <Input
                id="export-key-password"
                type="password"
                value={exportPassword}
                onChange={(event) => setExportPassword(event.currentTarget.value)}
                autoComplete="off"
                placeholder="Only needed for encrypted exports"
              />
            </div>
            <div className={stylex.props(styles.sb87f7413).className || ''}>
              <Button type="button" variant="ghost" onClick={() => setIsExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={exportKey.isPending}>
                {exportKey.isPending ? 'Exporting…' : 'Export Key'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <div className={stylex.props(styles.scd595190).className || ''}>
      <div className={stylex.props(styles.s72a2b24b).className || ''}>
        <UserRoundPlus size={50} className={stylex.props(styles.sf2718385).className || ''} />
      </div>
      <SizableText size="xl">No Accounts Found</SizableText>
      <p className="text-muted-foreground max-w-lg text-center">
        Create a new profile to get started with Seed. You'll need to create a profile to use all the features.
      </p>
      <Button
        className={stylex.props(styles.s33458e).className || ''}
        size="lg"
        onClick={() => {
          // TODO: Implement wizard event dispatch
          console.log('Create new profile clicked')
        }}
      >
        <Plus className={stylex.props(styles.sef1c143e).className || ''} />
        Create a new Profile
      </Button>
    </div>
  )
}
function KeyItem({item, isActive, onSelect}: {item: string; isActive: boolean; onSelect: () => void}) {
  const id = hmId(item)
  const entity = useResource(id)
  const document = entity.data?.type === 'document' ? entity.data.document : undefined
  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      onClick={onSelect}
      className={stylex.props(styles.s636aae46).className || ''}
    >
      <HMIcon id={id} name={document?.metadata?.name} icon={document?.metadata?.icon} size={24} />
      <div className={stylex.props(styles.s8d50829d).className || ''}>
        <SizableText weight={isActive ? 'bold' : 'normal'} className={stylex.props(styles.s5c0d82dc).className || ''}>
          {document?.metadata.name || item}
        </SizableText>
        <SizableText color="muted" size="xs" className={stylex.props(styles.sbf63b0a7).className || ''}>
          {item.substring(item.length - 8)}
        </SizableText>
      </div>
    </Button>
  )
}
export function ExperimentSection({
  experiment,
  onValue,
  value,
}: {
  id: string
  experiment: ExperimentType
  onValue: (v: boolean) => void
  value: boolean
}) {
  return (
    <div className={cn('dark:bg-background bg-muted flex items-center gap-6 rounded border p-3 px-6')}>
      <SizableText size="2xl">{experiment.emoji}</SizableText>
      <div className={stylex.props(styles.s731a65c4).className || ''}>
        <div className={stylex.props(styles.sd28bc940).className || ''}>
          <SizableText size="xl">{experiment.label}</SizableText>
        </div>
        <SizableText>{experiment.description}</SizableText>
        <div className={stylex.props(styles.s78289774).className || ''}>
          {value ? <EnabledTag /> : <div />}
          <Button
            variant={value ? 'destructive' : 'default'}
            onClick={() => {
              onValue(!value)
            }}
          >
            {value ? 'Disable Feature' : `Enable Feature`}
          </Button>
        </div>
      </div>
    </div>
  )
}
function EnabledTag() {
  return (
    <div className={stylex.props(styles.sdef6fad4).className || ''}>
      <Check className={stylex.props(styles.s6ff5c0c1).className || ''} />
      <SizableText size="sm" className={stylex.props(styles.s2c8b4ee7).className || ''} weight="bold">
        Enabled
      </SizableText>
    </div>
  )
}
type ExperimentType = {
  key: keyof NonNullable<ReturnType<typeof useUniversalAppContext>['experiments']>
  label: string
  emoji: string
  description: string
}
const EXPERIMENTS: ExperimentType[] = []
function GatewaySettings() {
  const gatewayUrl = useGatewayUrl()
  const setGatewayUrl = useSetGatewayUrl()
  const [gwUrl, setGWUrl] = useState('')
  useEffect(() => {
    if (gatewayUrl.data) {
      setGWUrl(gatewayUrl.data)
    }
  }, [gatewayUrl.data])
  const gwChanged = gwUrl !== (gatewayUrl.data || '')
  return (
    <>
      <SizableText size="2xl" weight="bold">
        Sync options
      </SizableText>
      <SettingsCard label="CONNECTION">
        <SettingsRow
          label="Gateway URL"
          description="Primary hyper.media endpoint"
          right={
            <div className="relative w-[220px]">
              <Input
                className={cn(stylex.props(styles.scdbaf625).className || '', gwChanged && 'pr-14')}
                value={gwUrl}
                onChangeText={setGWUrl}
              />
              {gwChanged ? (
                <Button
                  size="xs"
                  variant="outline"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={() => {
                    setGatewayUrl.mutate(gwUrl)
                    toast.success('Gateway URL saved!')
                  }}
                >
                  Save
                </Button>
              ) : null}
            </div>
          }
        />
      </SettingsCard>
      <NetworkSettings />
      <SettingsCard label="AUTO-PUSH TRIGGERS">
        <PushOnPublishSetting />
        <Separator />
        <PushOnCopySetting />
      </SettingsCard>
    </>
  )
}
function PushSettingRow({
  label,
  description,
  hookResult,
  setMutation,
}: {
  label: string
  description: string
  hookResult: {
    data?: string
    isLoading: boolean
    isError: boolean
    refetch: () => void
  }
  setMutation: {
    mutate: (value: 'always' | 'never' | 'ask', options?: any) => void
  }
}) {
  const id = useId()
  const serverValue = hookResult.data || 'always'
  const [optimisticValue, setOptimisticValue] = useState(serverValue)
  useEffect(() => {
    setOptimisticValue(serverValue)
  }, [serverValue])
  if (hookResult.isLoading)
    return <SettingsRow label={label} description={description} right={<Spinner size="small" />} />
  return (
    <SettingsRow
      label={label}
      description={description}
      right={
        <RadioGroup
          value={optimisticValue}
          onValueChange={(value: string) => {
            const validValue: 'always' | 'never' = value === 'never' ? 'never' : 'always'
            const previousValue = optimisticValue
            if (validValue === previousValue) return
            setOptimisticValue(validValue)
            setMutation.mutate(validValue, {
              onError: (error: unknown) => {
                setOptimisticValue(previousValue)
                toast.error('Failed to update setting.')
                reportError(error, {
                  feature: 'settings',
                  operation: 'update-push-setting',
                  setting: label,
                  value: validValue,
                })
              },
            })
          }}
          className={stylex.props(styles.s86ff3e6).className || ''}
        >
          <div className={stylex.props(styles.sac428cea).className || ''}>
            <RadioGroupItem value="always" id={`${id}-always`} />
            <Label htmlFor={`${id}-always`} className={stylex.props(styles.sab7cc6fa).className || ''}>
              Always
            </Label>
          </div>
          <div className={stylex.props(styles.sac428cea).className || ''}>
            <RadioGroupItem value="never" id={`${id}-never`} />
            <Label htmlFor={`${id}-never`} className={stylex.props(styles.sab7cc6fa).className || ''}>
              Never
            </Label>
          </div>
        </RadioGroup>
      }
    />
  )
}
function PushOnCopySetting() {
  const pushOnCopy = usePushOnCopy()
  const setPushOnCopy = useSetPushOnCopy()
  return (
    <PushSettingRow
      label="On copy"
      description="Push to network when you copy a link"
      hookResult={pushOnCopy}
      setMutation={setPushOnCopy}
    />
  )
}
function PushOnPublishSetting() {
  const pushOnPublish = usePushOnPublish()
  const setPushOnPublish = useSetPushOnPublish()
  return (
    <PushSettingRow
      label="On publish"
      description="Push to network when you publish content"
      hookResult={pushOnPublish}
      setMutation={setPushOnPublish}
    />
  )
}
function DeviceItem({id}: {id: string}) {
  let {data} = usePeerInfo(id)
  let {data: current} = useDaemonInfo()
  let isCurrent = useMemo(() => {
    if (!current?.peerId) return false
    return current.peerId == id
  }, [id, current])
  return (
    <TableList>
      <InfoListHeader
        title={id.substring(id.length - 10)}
        right={
          isCurrent && (
            <Button size="xs" className={stylex.props(styles.sa16ea943).className || ''} disabled>
              current device
            </Button>
          )
        }
      />

      <InfoListItem
        label="Peer ID"
        value={id}
        onCopy={() => {
          copyTextToClipboard(id)
          toast.success('Copied peerID successfully')
        }}
      />

      <Separator />

      <InfoListItem
        label="Device Address"
        value={data?.addrs.sort().join(', ')}
        onCopy={() => {
          data?.addrs && copyTextToClipboard(data.addrs.sort().join(', '))
          toast.success('Copied device address successfully')
        }}
      />
    </TableList>
  )
}
function AppSettings() {
  const ipc = useIPC()
  // @ts-expect-error versions is not typed
  const versions = useMemo(() => ipc.versions(), [ipc])
  const appInfo = useQuery({
    queryKey: ['app-info'],
    queryFn: () => client.getAppInfo.query(),
  }).data
  const openUrl = useOpenUrl()
  const {value: autoUpdate, setAutoUpdate} = useAutoUpdatePreference()
  const daemonInfo = useQuery({
    queryKey: ['daemon-info'],
    queryFn: () => client.getDaemonInfo.query(),
  }).data
  let goBuildInfo = ''
  if (daemonInfo?.errors.length) {
    goBuildInfo = daemonInfo.errors.join('\n')
  } else if (daemonInfo?.daemonVersion) {
    goBuildInfo = daemonInfo.daemonVersion
  }
  const {data: deviceInfo} = useDaemonInfo()
  const peer = usePeerInfo(deviceInfo?.peerId)
  const addrs = peer.data?.addrs?.join('\n')
  return (
    <>
      <SizableText size="2xl" weight="bold">
        App info
      </SizableText>
      <SettingsCard label="IDENTITY">
        <SettingsRow
          label="Peer ID"
          description={deviceInfo?.peerId || ''}
          right={
            addrs ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(addrs)
                  toast.success('Copied addresses')
                }}
              >
                Copy addresses
              </Button>
            ) : null
          }
        />
        <Separator />
        <SettingsRow label="Protocol" description={deviceInfo?.protocolId || ''} />
      </SettingsCard>

      <SettingsCard label="NETWORK ADDRESSES">
        <NetworkAddresses addrs={addrs} />
      </SettingsCard>

      <SettingsCard label="APPLICATION">
        <div className={stylex.props(styles.s3898da93).className || ''}>
          <SizableText size="sm">
            Version: <span className={stylex.props(styles.sa16ea943).className || ''}>{VERSION}</span>
          </SizableText>
          <SizableText size="sm">
            Node: <span className={stylex.props(styles.sa16ea943).className || ''}>{versions.node}</span>
          </SizableText>
          <SizableText size="sm">
            Electron: <span className={stylex.props(styles.sa16ea943).className || ''}>{versions.electron}</span>
          </SizableText>
          <SizableText size="sm">
            Chrome: <span className={stylex.props(styles.sa16ea943).className || ''}>{versions.chrome}</span>
          </SizableText>
        </div>
        <Separator />
        <SettingsRow
          label="Data directory:"
          description={appInfo?.dataDir || ''}
          right={
            <div className={stylex.props(styles.se658ac13).className || ''}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (appInfo?.dataDir) {
                    copyTextToClipboard(appInfo.dataDir)
                    toast.success('Copied')
                  }
                }}
              >
                <Copy className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (appInfo?.dataDir) ipc.send('open_path', appInfo.dataDir)
                }}
              >
                <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
            </div>
          }
        />
        <Separator />
        <SettingsRow
          label="Log directory:"
          description={appInfo?.loggingDir || ''}
          right={
            <div className={stylex.props(styles.se658ac13).className || ''}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (appInfo?.loggingDir) {
                    copyTextToClipboard(appInfo.loggingDir)
                    toast.success('Copied')
                  }
                }}
              >
                <Copy className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (appInfo?.loggingDir) ipc.send('open_path', appInfo.loggingDir)
                }}
              >
                <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
            </div>
          }
        />
      </SettingsCard>

      <SettingsCard label="APP UPDATES">
        <div className={stylex.props(styles.s8fc7e6c5).className || ''}>
          <Checkbox
            id="auto-update"
            checked={autoUpdate.data == 'true'}
            onCheckedChange={(newVal) => setAutoUpdate(newVal ? 'true' : 'false')}
          />
          <Label htmlFor="auto-update" className={stylex.props(styles.sab7cc6fa).className || ''}>
            Check for updates automatically
          </Label>
        </div>
      </SettingsCard>

      <SettingsCard label="DEBUG">
        <SettingsRow
          label="Commit"
          description={COMMIT_HASH}
          right={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                copyTextToClipboard(
                  `App Version: ${VERSION}\nElectron: ${versions.electron}\nChrome: ${versions.chrome}\nNode: ${
                    versions.node
                  }\nCommit: ${COMMIT_HASH.slice(0, 8)}\nGo Build: ${goBuildInfo}`,
                )
                toast.success('Copied debug info')
              }}
            >
              Copy debug info
            </Button>
          }
        />
        <Separator />
        <div className={stylex.props(styles.sa6bfe6cd).className || ''}>
          <div className={stylex.props(styles.s783f19f3).className || ''}>
            <SizableText size="sm" weight="medium">
              Seed host
            </SizableText>
            <SizableText
              size="xs"
              className={stylex.props(styles.s2ca89e9a).className || ''}
              onClick={() => openUrl(SEED_HOST_URL)}
            >
              {SEED_HOST_URL}
            </SizableText>
          </div>
          <div className={stylex.props(styles.s783f19f3).className || ''}>
            <SizableText size="sm" weight="medium">
              Lightning
            </SizableText>
            <SizableText
              size="xs"
              className={stylex.props(styles.s2ca89e9a).className || ''}
              onClick={() => openUrl(LIGHTNING_API_URL)}
            >
              {LIGHTNING_API_URL}
            </SizableText>
          </div>
        </div>
        <Separator />
        <GoBuildInfo goBuildInfo={goBuildInfo} />
      </SettingsCard>
    </>
  )
}
const CustomTabsContent = (props: React.ComponentProps<typeof TabsContent>) => {
  return (
    <TabsContent className={stylex.props(styles.s8a7f4779).className || ''} {...props}>
      <ScrollArea>
        <div className={stylex.props(styles.s288837e).className || ''}>{props.children}</div>
      </ScrollArea>
    </TabsContent>
  )
}
function Tab(
  props: React.ComponentProps<typeof TabsTrigger> & {
    icon: any
    label: string
    active: boolean
  },
) {
  const {icon: Icon, label, active, ...rest} = props
  return (
    <TabsTrigger
      data-testid={`tab-${props.value}`}
      className="flex h-auto cursor-default flex-col items-center justify-center gap-2 rounded-none border-0 bg-transparent p-4 pb-3 text-sm font-medium hover:bg-black/5 data-[state=active]:shadow-none dark:hover:bg-white/10"
      {...rest}
    >
      <Icon
        className={cn(
          stylex.props(styles.sca3de969).className || '',
          active ? 'text-brand-2' : 'text-muted-foreground',
        )}
      />
      <SizableText
        size="xs"
        className={cn(
          stylex.props(styles.sb42feb5d).className || '',
          active ? 'text-brand-2' : 'text-muted-foreground',
        )}
      >
        {label}
      </SizableText>
    </TabsTrigger>
  )
}
function SettingsSection({
  title,
  children,
  afterTitle,
}: React.PropsWithChildren<{
  title: string
  afterTitle?: React.ReactNode
}>) {
  return (
    <div className={cn('dark:bg-background bg-muted flex flex-col gap-3 rounded p-3')}>
      <div className={stylex.props(styles.s48f5532a).className || ''}>
        <SizableText size="2xl">{title}</SizableText>
        {afterTitle}
      </div>
      {children}
    </div>
  )
}
