import * as stylex from '@stylexjs/stylex'
import {createInspectIpfsNavRoute, NavRoute, useCID} from '@shm/shared'
import {code as DAG_CBOR_CODE} from '@shm/shared/cbor'
import {DEFAULT_GATEWAY_URL} from '@shm/shared/constants'
import {useOpenUrl, useRouteLink, useUniversalClient} from '@shm/shared/routing'
import {useNavigate} from '@shm/shared/utils/navigation'
import {Check, FileEdit, MoreHorizontal, X} from 'lucide-react'
import {base58btc} from 'multiformats/bases/base58'
import {CID} from 'multiformats/cid'
import {type ReactNode, useEffect, useMemo, useState} from 'react'
import {Button} from './button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from './components/dropdown-menu'
import {Textarea} from './components/textarea'
import {base64ToBytes, isDagJsonBytes} from './dag-json'
import {useFileProxyUrl, useImageUrl} from './get-file-url'
import {publishCborBlob, publishTextBlob} from './ipfs-publish'
import {Spinner} from './spinner'
import {toast} from './toast'
import {OmnibarUrl} from './url-omnibar'
import {CBOR_VALUE_RULES, isPlainObject, ValueDisplay, ValueEditor, ValueEditorProvider} from './value-editor'
const styles_4 = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s2ff5a5: {
    height: 'calc(0.25rem * 11)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd1033: {
    paddingBlock: 'calc(0.25rem * 0.5)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
})
const styles_3 = stylex.create({
  sfd023371: {
    minHeight: '60vh',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s6dd5e73e: {
    maxHeight: '80vh',
    maxWidth: '100%',
    borderRadius: 'calc(var(--radius) - 2px)',
    objectFit: 'contain',
    boxShadow: 'var(--shadow-sm)',
  },
})
const styles_2 = stylex.create({
  s6c2b5195: {
    backgroundColor: 'var(--background)',
    display: 'flex',
    height: '100%',
    maxHeight: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
  },
})
const styles = stylex.create({
  s7026dbcb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 8)',
  },
  s78630139: {
    display: 'flex',
    justifyContent: 'center',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sbaa01070: {
    backgroundColor: 'var(--background)',
    overflowX: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 4)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    whiteSpace: 'pre-wrap',
  },
  s7054e59b: {
    flex: '1',
    overflowY: 'auto',
    backgroundColor: 'oklch(96.7% 0.001 286.375)',
  },
  s53eda8b5: {
    marginInline: 'auto',
    width: '100%',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 4)',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sb42feb5d: {
    flex: '1',
  },
})
type IpfsKind = 'loading' | 'image' | 'cbor' | 'text'

/** Sentinel `ipfsPath` that opens the viewer in "author a new object" mode. */
const NEW_IPFS_BLOB_PATH = 'new'

/**
 * Probes whether an image URL loads. Returns `null` while testing, `true`/`false`
 * once known. More reliable than a content-type header the gateway may not set.
 */
function useIsLoadableImage(imageUrl: string): boolean | null {
  const [isImage, setIsImage] = useState<boolean | null>(imageUrl ? null : false)
  useEffect(() => {
    if (!imageUrl || typeof window === 'undefined') {
      setIsImage(false)
      return
    }
    setIsImage(null)
    let cancelled = false
    const img = new window.Image()
    img.onload = () => {
      if (!cancelled) setIsImage(true)
    }
    img.onerror = () => {
      if (!cancelled) setIsImage(false)
    }
    img.src = imageUrl
    return () => {
      cancelled = true
    }
  }, [imageUrl])
  return isImage
}

/** Fetches an IPFS file as text (for editing/viewing plain-text blobs). */
function useIpfsText(url: string): {
  text: string | null
  loading: boolean
} {
  const [state, setState] = useState<{
    text: string | null
    loading: boolean
  }>({
    text: null,
    loading: !!url,
  })
  useEffect(() => {
    if (!url) {
      setState({
        text: null,
        loading: false,
      })
      return
    }
    let cancelled = false
    setState({
      text: null,
      loading: true,
    })
    fetch(url)
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled)
          setState({
            text,
            loading: false,
          })
      })
      .catch(() => {
        if (!cancelled)
          setState({
            text: null,
            loading: false,
          })
      })
    return () => {
      cancelled = true
    }
  }, [url])
  return state
}

/**
 * Dedicated IPFS file viewer/editor. Shows the read-only `ipfs://` URL in a
 * slim top bar with a copy action and a "…" menu. For DAG-CBOR blobs and plain
 * text files, the menu offers Edit — which turns the view into an unpublished
 * draft (the CID disappears) and lets you Publish a new blob with a new CID.
 */
export function InspectIpfsPage({
  ipfsPath,
  exitRoute,
  windowControls,
  trafficLightInset = false,
  gatewayUrl = DEFAULT_GATEWAY_URL,
}: {
  ipfsPath: string
  exitRoute?: NavRoute | null
  /** Retained for API compatibility; hm:// / ipfs:// links now route via the app openUrl. */
  getRouteForUrl?: (url: string) => NavRoute | string | null
  /** Desktop-only window controls (e.g. close button on non-macOS) shown at the far right. */
  windowControls?: ReactNode
  /** Reserve space at the left of the top bar for macOS traffic lights. */
  trafficLightInset?: boolean
  /** Gateway origin for the shareable `https://<gateway>/ipfs/<cid>` link. */
  gatewayUrl?: string
}) {
  const segments = ipfsPath.split('/').filter(Boolean)
  // `new` opens a draft: `new` alone is a blank object; `new/<cid>` forks an
  // existing blob into a draft (so "Edit" leaves the original window alone).
  const isDraft = segments[0] === NEW_IPFS_BLOB_PATH
  const forkCid = isDraft ? segments[1] : undefined
  const cid = isDraft ? undefined : segments[0]
  const pathSegments = isDraft ? [] : segments.slice(1)
  const hasSubpath = pathSegments.length > 0
  // The blob we fetch — to display (view) or to prefill the draft (fork).
  const contentCid = isDraft ? forkCid : cid
  const ipfsData = useCID(contentCid)
  const client = useUniversalClient()
  const replaceRoute = useNavigate('replace')
  const openUrl = useOpenUrl()

  // The CID's codec tells us definitively whether this is structured DAG-CBOR
  // (0x71) or a raw UnixFS file (dag-pb / raw) — an image or plain text.
  const codec = useMemo(() => {
    try {
      return CID.parse(contentCid!).code
    } catch {
      return null
    }
  }, [contentCid])
  const isDagCbor = codec === DAG_CBOR_CODE
  const isFile = codec != null && !isDagCbor
  const getImageUrl = useImageUrl()
  const imageUrl = !isDraft && isFile && !hasSubpath && contentCid ? getImageUrl(`ipfs://${contentCid}`) : ''
  const isImage = useIsLoadableImage(imageUrl)

  // Proxy URL (/hm/api/file/<cid>) on web so text fetches don't hit a localhost
  // daemon URL; falls back to the direct daemon URL on desktop.
  const getFileUrl = useFileProxyUrl()
  const preparedData = useMemo(() => {
    if (ipfsData.data?.value === undefined) return null
    // Keep IPLD links/bytes in their DAG-JSON shape so ValueDisplay renders them
    // like the editor; only decode `signer` bytes to a readable hm:// principal.
    return readInspectIpfsPath(decodeSignerBytes(ipfsData.data.value), pathSegments)
  }, [ipfsData.data?.value, pathSegments])

  // Resolve what kind of content this is.
  let kind: IpfsKind
  if (isDraft && !forkCid) {
    kind = 'cbor' // brand-new empty object
  } else if (hasSubpath || isDagCbor) {
    kind = ipfsData.isLoading ? 'loading' : 'cbor'
  } else if (isFile) {
    kind = isImage === null ? 'loading' : isImage ? 'image' : 'text'
  } else {
    kind = ipfsData.isLoading ? 'loading' : ipfsData.data?.value != null ? 'cbor' : 'text'
  }
  const textUrl = kind === 'text' && !hasSubpath && contentCid ? getFileUrl(`ipfs://${contentCid}`) : ''
  const {text: rawText, loading: textLoading} = useIpfsText(textUrl)

  // "Edit" is offered on an editable view (not already a draft, not a sub-path).
  const canEdit = !isDraft && !hasSubpath && (kind === 'cbor' || kind === 'text')

  // Edit/draft state. A draft window opens straight into edit mode; a fork
  // prefills from the source blob once it loads.
  const [mode, setMode] = useState<'view' | 'edit'>(isDraft ? 'edit' : 'view')
  const [editJson, setEditJson] = useState<unknown>(isDraft && !forkCid ? {} : undefined)
  const [editText, setEditText] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  useEffect(() => {
    setMode(isDraft ? 'edit' : 'view')
    setEditJson(isDraft && !forkCid ? {} : undefined)
    setEditText(null)
    setPublishing(false)
  }, [ipfsPath, isDraft, forkCid])

  // Fork: seed the draft from the source blob once it has loaded (only if the
  // user hasn't started editing yet).
  useEffect(() => {
    if (!isDraft || !forkCid) return
    if (kind === 'cbor' && ipfsData.data?.value !== undefined) {
      setEditJson((cur: unknown) => (cur === undefined ? ipfsData.data!.value : cur))
    } else if (kind === 'text' && rawText != null) {
      setEditText((cur) => (cur === null ? rawText : cur))
    }
  }, [isDraft, forkCid, kind, ipfsData.data?.value, rawText])

  // "Edit" forks the blob into a draft in a NEW window, leaving this one alone.
  const editInNewWindow = () => {
    if (cid) openUrl(`hm://inspect/ipfs/${NEW_IPFS_BLOB_PATH}/${cid}`, true)
  }

  // Open a linked IPFS blob (from a native IPLD link) in its own new window.
  const openLinkedBlob = (linkCid: string) => openUrl(`hm://inspect/ipfs/${linkCid}`, true)
  // Open an hm:// reference (e.g. a decoded signer) in a new window.
  const openInNewWindow = (url: string) => openUrl(url, true)
  const publish = async () => {
    setPublishing(true)
    try {
      const newCid =
        kind === 'text' ? await publishTextBlob(client, editText ?? '') : await publishCborBlob(client, editJson)
      toast.success('Published a new blob')
      setMode('view')
      replaceRoute(createInspectIpfsNavRoute(newCid))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }
  const gatewayLink = `${gatewayUrl.replace(/\/+$/, '')}/ipfs/${ipfsPath}`
  const exitLinkProps = useRouteLink(exitRoute || null)
  let body: ReactNode
  if (mode === 'edit' && kind === 'cbor') {
    // A fork is still loading its source until editJson is seeded.
    body =
      editJson === undefined ? (
        <div className={stylex.props(styles.s7026dbcb).className || ''}>
          <Spinner />
        </div>
      ) : (
        <ValueEditorProvider openFile={openLinkedBlob}>
          <ValueEditor value={editJson} onValue={setEditJson} rules={CBOR_VALUE_RULES} />
        </ValueEditorProvider>
      )
  } else if (mode === 'edit' && kind === 'text') {
    body =
      editText === null && forkCid ? (
        <div className={stylex.props(styles.s7026dbcb).className || ''}>
          <Spinner />
        </div>
      ) : (
        <Textarea
          autoFocus
          value={editText ?? ''}
          onChange={(e) => setEditText(e.target.value)}
          spellCheck={false}
          className={stylex.props(styles_3.sfd023371).className || ''}
        />
      )
  } else if (kind === 'loading' || (kind === 'text' && textLoading)) {
    body = (
      <div className={stylex.props(styles.s7026dbcb).className || ''}>
        <Spinner />
      </div>
    )
  } else if (kind === 'image') {
    body = (
      <div className={stylex.props(styles.s78630139).className || ''}>
        <img src={imageUrl} alt={`ipfs://${cid}`} className={stylex.props(styles_3.s6dd5e73e).className || ''} />
      </div>
    )
  } else if (kind === 'text') {
    body =
      rawText == null ? (
        <div className={stylex.props(styles.sa56e915f).className || ''}>No IPFS data found.</div>
      ) : (
        <pre className={stylex.props(styles.sbaa01070).className || ''}>{rawText}</pre>
      )
  } else if (preparedData === null || preparedData === undefined) {
    body = <div className={stylex.props(styles.sa56e915f).className || ''}>No IPFS data found.</div>
  } else {
    // Render the published blob with the editor's own value renderer so the view
    // matches the editor (native IPLD links show as tags, opening in a new window).
    body = (
      <ValueEditorProvider openFile={openLinkedBlob} openUrl={openInNewWindow}>
        <ValueDisplay value={preparedData} rules={CBOR_VALUE_RULES} />
      </ValueEditorProvider>
    )
  }
  return (
    <div className={stylex.props(styles_2.s6c2b5195).className || ''}>
      <IpfsTopBar
        restingUrl={`ipfs://${ipfsPath}`}
        gatewayLink={gatewayLink}
        editing={mode === 'edit'}
        canEdit={canEdit}
        publishing={publishing}
        onEdit={editInNewWindow}
        onPublish={publish}
        exitRoute={exitRoute}
        exitLinkProps={exitLinkProps}
        windowControls={windowControls}
        trafficLightInset={trafficLightInset}
      />
      <div className={stylex.props(styles.s7054e59b).className || ''}>
        <div
          className={stylex.props(styles.s53eda8b5).className || ''}
          style={{
            maxWidth: 960,
          }}
        >
          <div className={stylex.props(styles.sfbc6e290).className || ''}>{body}</div>
        </div>
      </div>
    </div>
  )
}

/** The slim, non-editable top bar: omnibar-style URL + copy + "…" menu, or draft controls. */
function IpfsTopBar({
  restingUrl,
  gatewayLink,
  editing,
  canEdit,
  publishing,
  onEdit,
  onPublish,
  exitRoute,
  exitLinkProps,
  windowControls,
  trafficLightInset,
}: {
  restingUrl: string
  gatewayLink: string
  editing: boolean
  canEdit: boolean
  publishing: boolean
  onEdit: () => void
  onPublish: () => void
  exitRoute?: NavRoute | null
  exitLinkProps: ReturnType<typeof useRouteLink>
  windowControls?: ReactNode
  trafficLightInset?: boolean
}) {
  // Only surface the "…" menu when it would contain at least one action.
  const hasMenu = canEdit || !!exitRoute
  const menu = hasMenu ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="iconSm" aria-label="More actions">
          <MoreHorizontal className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit && (
          <DropdownMenuItem onSelect={onEdit}>
            <FileEdit className={stylex.props(styles.sca3de968).className || ''} />
            Edit...
          </DropdownMenuItem>
        )}
        {exitRoute && (
          <DropdownMenuItem asChild>
            <a {...exitLinkProps}>
              <X className={stylex.props(styles.sca3de968).className || ''} />
              Open Resource
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : undefined
  return (
    <div
      className={
        stylex.props(
          styles_4.s1a01a0ed,
          styles_4.s436dc7b6,
          styles_4.s2ffff9,
          styles_4.s2ff5a5,
          styles_4.sf032ed6c,
          styles_4.sc6ed1702,
          styles_4.s5d936fb,
          styles_4.s7c401f01,
          styles_4.s34b1ae,
        ).className || ''
      }
      style={
        trafficLightInset
          ? {
              paddingLeft: 78,
            }
          : undefined
      }
    >
      {editing ? (
        <>
          <span
            className={
              stylex.props(
                styles_4.s5fd609e3,
                styles_4.sf2718385,
                styles_4.s529492ad,
                styles_4.s34b1ad,
                styles_4.sc5dd1033,
                styles_4.sab7cc79b,
                styles_4.s129e46b3,
              ).className || ''
            }
          >
            Unpublished draft
          </span>
          <div className={stylex.props(styles.sb42feb5d).className || ''} />
          <div className={stylex.props(styles_4.s2ffff9, styles_4.sc6ed1702, styles_4.s5d936fb).className || ''}>
            <Button size="sm" onClick={onPublish} disabled={publishing}>
              {publishing ? (
                <Spinner className={stylex.props(styles.sca3de968).className || ''} />
              ) : (
                <Check className={stylex.props(styles.sca3de968).className || ''} />
              )}
              Publish
            </Button>
          </div>
        </>
      ) : (
        <OmnibarUrl restingUrl={restingUrl} copyUrl={gatewayLink} rightActions={menu} />
      )}
      {windowControls}
    </div>
  )
}

/**
 * Decode DAG-CBOR `signer` byte fields into a readable `hm://<principal>` string
 * while leaving IPLD links (`{"/": cid}`) and other bytes in their DAG-JSON shape
 * so ValueDisplay can render them like the editor does.
 */
function decodeSignerBytes(data: unknown, parentKey?: string): unknown {
  if (parentKey === 'signer' && isDagJsonBytes(data)) {
    try {
      return `hm://${base58btc.encode(base64ToBytes(data['/'].bytes))}`
    } catch {
      return data
    }
  }
  if (Array.isArray(data)) {
    return data.map((item) => decodeSignerBytes(item))
  }
  if (isPlainObject(data) && !isDagJsonBytes(data) && !('/' in data)) {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, decodeSignerBytes(value, key)]))
  }
  return data
}
function readInspectIpfsPath(data: unknown, pathSegments: string[]): unknown {
  if (!pathSegments.length) return data
  return pathSegments.reduce<unknown>((currentValue, segment) => {
    if (Array.isArray(currentValue)) {
      const index = Number(segment)
      return Number.isInteger(index) ? currentValue[index] : undefined
    }
    if (typeof currentValue === 'object' && currentValue !== null) {
      return (currentValue as Record<string, unknown>)[segment]
    }
    return undefined
  }, data)
}
