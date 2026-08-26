import * as stylex from '@stylexjs/stylex'
import {SpaceAgentsSettings} from '@/components/site-settings-agents'
import {MembersSettings} from '@/components/site-settings-members'
import {NavigationSettings} from '@/components/site-settings-navigation'
import {useUpdateHomeDocument} from '@/models/site'
import {fileUpload} from '@/utils/file-upload'
import {useNavigate} from '@/utils/useNavigate'
import type {HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useIsSiteOwner} from '@shm/shared/models/capabilities'
import {useResource} from '@shm/shared/models/entity'
import type {SiteSettingsTab} from '@shm/shared/routes'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {ScrollArea} from '@shm/ui/components/scroll-area'
import {panelContainerStyles, windowContainerStyles} from '@shm/ui/container'
import {getDaemonFileUrl} from '@shm/ui/get-file-url'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {cn} from '@shm/ui/utils'
import {Bot, Image as ImageIcon, Navigation as NavigationIcon, Plus, Users} from 'lucide-react'
import {type ReactNode, useState} from 'react'

// Tabs of the site settings page
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
  saa15f52: {
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    textTransform: 'uppercase',
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
  s4c9e7ebc: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 10)',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sd6fbdd99: {
    position: 'absolute',
    inset: 'calc(0.25rem * 0)',
    zIndex: '10',
    cursor: 'pointer',
    opacity: '0%',
  },
  s2b57d061: {
    position: 'absolute',
    inset: 'calc(0.25rem * 0)',
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
  s3566be65: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
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
})
type SiteSettingsSection = 'identity' | 'navigation' | 'members' | 'agents'
type SiteSettingsTabConfig = {
  key: SiteSettingsSection
  icon: any
  label: string
}
const SITE_SETTINGS_TAB_CONFIG: SiteSettingsTabConfig[] = [
  {
    key: 'identity',
    icon: ImageIcon,
    label: 'Identity',
  },
  {
    key: 'navigation',
    icon: NavigationIcon,
    label: 'Navigation',
  },
  {
    key: 'members',
    icon: Users,
    label: 'Members',
  },
  {
    key: 'agents',
    icon: Bot,
    label: 'Agents',
  },
]

/** Map a URL subpath to its tab. */
function sectionForTab(tab: SiteSettingsTab | undefined): SiteSettingsSection {
  if (tab === 'navigation') return 'navigation'
  if (tab === 'members' || tab === 'writers' || tab === 'email-subscribers') return 'members'
  if (tab === 'agents') return 'agents'
  return 'identity'
}
export default function SiteSettings() {
  const route = useNavRoute()
  const navigate = useNavigate('replace')
  if (route.key !== 'site-settings') return null
  const activeSection = sectionForTab(route.tab)
  const setActiveTab = (tab: SiteSettingsTab) =>
    navigate({
      key: 'site-settings',
      id: route.id,
      tab,
    })
  return (
    <div className={cn(windowContainerStyles, 'h-full max-h-full min-h-0 w-full overflow-hidden pt-0')}>
      <div className={panelContainerStyles}>
        <div className={stylex.props(styles.sa368bb19).className || ''}>
          <div className={stylex.props(styles.sc3ed6c02).className || ''}>
            {/* Sidebar */}
            <div className="border-border flex w-[220px] shrink-0 flex-col gap-1 border-r p-2">
              <SizableText
                size="xs"
                weight="bold"
                color="muted"
                className={stylex.props(styles.saa15f52).className || ''}
              >
                Space Settings
              </SizableText>
              {SITE_SETTINGS_TAB_CONFIG.map((tab) => (
                <SidebarTab
                  key={tab.key}
                  active={activeSection === tab.key}
                  icon={tab.icon}
                  label={tab.label}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>
            {/* Content */}
            <ScrollArea className={stylex.props(styles.sb42feb5d).className || ''}>
              <div className={stylex.props(styles.s219f7f8b).className || ''}>
                {activeSection === 'identity' && <IdentityTab siteId={route.id} />}
                {activeSection === 'navigation' && <NavigationSettings siteId={route.id} />}
                {activeSection === 'members' && <MembersSettings siteId={route.id} activeTab={route.tab} />}
                {activeSection === 'agents' && <SpaceAgentsSettings siteId={route.id} />}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}

/** A picked image is either an existing metadata value or a freshly selected file. */
type ImageValue = string | File | null
function IdentityTab({siteId}: {siteId: UnpackedHypermediaId}) {
  const accountUid = siteId.uid
  const resource = useResource(siteId)
  const document = resource.data?.type === 'document' ? resource.data.document : undefined
  const {isSiteOwner, isLoading: isOwnerLoading} = useIsSiteOwner(accountUid)
  const updateHome = useUpdateHomeDocument(accountUid)

  // Form state, seeded from the published metadata once loaded.
  const [name, setName] = useState<string | null>(null)
  const [logo, setLogo] = useState<ImageValue | undefined>(undefined)
  const [cover, setCover] = useState<ImageValue | undefined>(undefined)
  if (resource.isInitialLoading || isOwnerLoading) {
    return (
      <div className={stylex.props(styles.s4c9e7ebc).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (!document) {
    return <SizableText color="muted">This account doesn't have a space yet.</SizableText>
  }
  if (!isSiteOwner) {
    return (
      <>
        <SizableText size="2xl" weight="bold">
          Identity
        </SizableText>
        <SizableText color="muted">Only the space owner can edit these settings.</SizableText>
      </>
    )
  }
  const metadata = document.metadata
  // Fall back to the published value until the field has been edited.
  const nameValue = name ?? metadata.name ?? ''
  const logoValue = logo === undefined ? metadata.icon || null : logo
  const coverValue = cover === undefined ? metadata.cover || null : cover
  const isDirty = name !== null || logo !== undefined || cover !== undefined
  const canSave = isDirty && nameValue.trim().length > 0 && !updateHome.isPending
  async function handleSave() {
    try {
      // Pass full desired metadata. The hook diffs against the published values.
      const nextMetadata: HMMetadata = {
        ...metadata,
        name: nameValue.trim(),
        icon: logo !== undefined ? await resolveImageValue(logo) : metadata.icon,
        cover: cover !== undefined ? await resolveImageValue(cover) : metadata.cover,
      }
      await updateHome.mutateAsync({
        metadata: nextMetadata,
      })
      toast.success('Space identity updated')
      setName(null)
      setLogo(undefined)
      setCover(undefined)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update space identity')
    }
  }
  return (
    <>
      <div className={stylex.props(styles.s78289774).className || ''}>
        <SizableText size="2xl" weight="bold">
          Identity
        </SizableText>
        <Button variant="default" disabled={!canSave} onClick={handleSave}>
          {updateHome.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <SettingsField label="Space name">
        <Input value={nameValue} onChange={(e) => setName(e.target.value)} placeholder="Your space name" />
      </SettingsField>

      <SettingsField label="Space logo" hint="100px height JPG or PNG.">
        <ImagePicker
          value={logoValue}
          onChange={setLogo}
          onClear={() => setLogo(null)}
          className="h-[100px] w-[100px]"
        />
      </SettingsField>

      <SettingsField label="Home cover image" hint="Recommended 1600 × 400px. JPG or PNG.">
        <ImagePicker
          value={coverValue}
          onChange={setCover}
          onClear={() => setCover(null)}
          className="h-[160px] w-full max-w-2xl"
        />
      </SettingsField>
    </>
  )
}

/** Upload a picked file and return its ipfs ref, or pass through an existing ref. */
async function resolveImageValue(value: ImageValue): Promise<string> {
  if (value instanceof File) {
    const cid = await fileUpload(value)
    return `ipfs://${cid}`
  }
  return value ?? ''
}
function SettingsField({label, hint, children}: {label: string; hint?: string; children: ReactNode}) {
  return (
    <div className={stylex.props(styles.sfbc6e28e).className || ''}>
      <SizableText weight="medium">{label}</SizableText>
      {children}
      {hint ? (
        <SizableText size="xs" color="muted">
          {hint}
        </SizableText>
      ) : null}
    </div>
  )
}
function ImagePicker({
  value,
  onChange,
  onClear,
  className,
}: {
  value: ImageValue
  onChange: (file: File) => void
  onClear: () => void
  className?: string
}) {
  const previewUrl = value ? (value instanceof File ? URL.createObjectURL(value) : getDaemonFileUrl(value)) : null
  return (
    <div
      className={cn(
        'group border-border bg-muted/40 relative flex cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed hover:border-neutral-400 dark:hover:border-neutral-500',
        className,
      )}
    >
      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
          e.target.value = ''
        }}
        className={stylex.props(styles.sd6fbdd99).className || ''}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="" className={stylex.props(styles.s2b57d061).className || ''} />
      ) : (
        <Plus className={stylex.props(styles.s3566be65).className || ''} />
      )}
      {value ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClear()
          }}
          className="absolute top-1 right-1 z-20 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          Remove
        </button>
      ) : null}
    </div>
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
