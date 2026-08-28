import * as stylex from '@stylexjs/stylex'
import type {AgentMemoryEntry, AgentMemoryFile} from './client'
import {
  uploadFileToAgentServer,
  useAgentMemory,
  useAgentMemoryFile,
  useDeleteAgentMemoryFile,
  useDownloadAgentMemoryFile,
  useUploadAgentMemoryFileToIpfs,
  useWriteAgentMemoryFile,
} from './models'
import {invalidateQueries} from '@shm/shared/models/query-client'
import {formattedDateMedium} from '@shm/shared/utils/date'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {OptionsDropdown} from '@shm/ui/options-dropdown'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {
  ChevronRight,
  Copy,
  Download,
  FilePlus,
  FileText,
  Folder,
  Globe,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  UploadCloud,
} from 'lucide-react'
import {useEffect, useMemo, useRef, useState} from 'react'

/** Files above this size skip the inline preview fetch — pulling hundreds of MB stalls the UI. */
const styles_5 = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s158c30ef: {
    maxHeight: 'calc(0.25rem * 56)',
  },
  scdbaf625: {
    width: '100%',
  },
  s948be48c: {
    flex: 'none',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  saae5326: {
    '@media ((min-width: 640px))': {
      maxHeight: 'none',
    },
  },
  s80d4f4f4: {
    '@media ((min-width: 640px))': {
      width: 'calc(0.25rem * 64)',
    },
  },
  s94043d84: {
    '@media ((min-width: 640px))': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  sf9c2bc31: {
    '@media ((min-width: 640px))': {
      borderRightStyle: 'solid',
      borderRightWidth: '1px',
    },
  },
  sc883a3d5: {
    boxShadow: '0 0 0 2px var(--ring-color, currentcolor)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
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
  s46d743d4: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
  },
  s46d743d9: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 15%, transparent)',
  },
  sc883a3d4: {
    boxShadow: '0 0 0 1px var(--ring-color, currentcolor)',
  },
  s9c668528: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
      },
    },
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s8b2dd4f4: {
    transitionProperty: 'transform, translate, scale, rotate',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_4 = stylex.create({
  s948be48c: {
    flex: 'none',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_3 = stylex.create({
  s925cbdaf: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'calc(var(--spacing) * 2)',
    '@media ((min-width: 640px))': {
      flexWrap: 'nowrap',
      alignItems: 'center',
    },
  },
  s284af276: {
    '@media ((max-width: 639px))': {
      minHeight: 'calc(var(--spacing) * 10)',
    },
  },
  sf909be14: {
    backgroundColor: 'var(--primary)',
    height: '100%',
    borderRadius: 'calc(infinity * 1px)',
    transitionProperty: 'width',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: '200ms',
  },
  s69f58106: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--card)',
    display: 'flex',
    minHeight: 'calc(var(--spacing) * 0)',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    '@media ((min-width: 640px))': {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
  },
  s916f298e: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
  },
  s4c0dae9c: {
    ':focus': {
      boxShadow: '0 0 0 2px currentcolor',
    },
    minHeight: 'calc(var(--spacing) * 0)',
    flex: '1',
    resize: 'none',
    backgroundColor: 'transparent',
    padding: 'calc(var(--spacing) * 3)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    outlineStyle: 'none',
  },
  s35e8f34e: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    display: 'flex',
    width: '100%',
    maxWidth: 'var(--container-sm)',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 8)',
  },
  s5e13eb37: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    minWidth: 'calc(var(--spacing) * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1.5)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    textAlign: 'left',
    '@media ((max-width: 639px))': {
      minHeight: 'calc(var(--spacing) * 10)',
    },
  },
  sc566ce12: {
    display: 'flex',
    minWidth: 'calc(var(--spacing) * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1.5)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    textAlign: 'left',
    '@media ((max-width: 639px))': {
      minHeight: 'calc(var(--spacing) * 10)',
    },
  },
  s6548d595: {
    color: 'color-mix(in oklab, var(--muted-foreground) 70%, transparent)',
    marginLeft: 'auto',
    flex: 'none',
    paddingRight: 'calc(var(--spacing) * 1)',
    fontSize: '10px',
  },
})
const styles_2 = stylex.create({
  sdc9fb26a: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    overflow: 'hidden',
  },
  s797b1794: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
  },
  s5e669942: {
    color: 'var(--muted-foreground)',
    minWidth: 'calc(0.25rem * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s15930280: {
    maxWidth: 'calc(0.25rem * 56)',
  },
  s60e2bfdc: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  s5e981e19: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
  },
  s700ce289: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
  },
  s9fd13fd5: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
    padding: 'calc(0.25rem * 4)',
  },
  sc0f44c0: {
    maxHeight: '100%',
    maxWidth: '100%',
    borderRadius: 'calc(var(--radius) - 2px)',
    objectFit: 'contain',
  },
  sb09d96e6: {
    maxHeight: '100%',
    maxWidth: '100%',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s82f80d11: {
    width: '100%',
    maxWidth: '28rem',
  },
  s9fd13fd7: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
    padding: 'calc(0.25rem * 6)',
  },
})
const styles = stylex.create({
  sa0238738: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sb76e9daa: {
    display: 'none',
  },
  sef1c143e: {
    marginRight: 'calc(0.25rem * 2)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s7b06a24b: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--card)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 2)',
  },
  s1f027a3: {
    marginBottom: 'calc(0.25rem * 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sd934a9b1: {
    color: 'var(--muted-foreground)',
    flex: 'none',
  },
  s8b97c16b: {
    backgroundColor: 'var(--muted)',
    height: 'calc(0.25rem * 1.5)',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'calc(infinity * 1px)',
  },
  sa8c3280f: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--card)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 2)',
  },
  se295dce0: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 4)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  sf48c8a4d: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 6)',
  },
  sd231ed2c: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 6)',
  },
  s3566be67: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  s33458c: {
    marginTop: 'calc(0.25rem * 2)',
  },
  sa41e8da5: {
    marginRight: 'calc(0.25rem * 1)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  saa4f1d10: {
    borderColor: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s9cbc670f: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flex: 'none',
  },
  s948be48c: {
    flex: 'none',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s8056ee4: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    display: 'flex',
    width: 'calc(0.25rem * 14)',
    height: 'calc(0.25rem * 14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) + 4px)',
  },
  sca3de96b: {
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
  },
  s91654f6f: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 0.5)',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  se15ec85a: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    flex: 'none',
  },
  scbdf1fe2: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s2c60fcd5: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    flex: 'none',
  },
  sa0238737: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
})
const MAX_MEMORY_PREVIEW_BYTES = 32 * 1024 * 1024

/**
 * The agent Memory tab: a browser/editor for the agent's private persistent filesystem.
 * The same files are read and written by the agent's `memory_*` session tools, so this
 * gives the user full visibility and control over what the agent remembers. Text files
 * are editable in place; binary files (media the agent downloaded, or files the user
 * uploads) get previews, on-demand download, and one-click IPFS publishing for use in
 * Hypermedia content.
 */
export function AgentMemoryTab({
  serverUrl,
  accountUid,
  agentId,
  openPath,
  onOpenPathChange,
  readOnly = false,
}: {
  serverUrl: string
  accountUid: string | null
  agentId: string
  /** Prevents a reader collaborator from changing the shared memory. */
  readOnly?: boolean
  /** File the route asked for — a tool row linking to `~/memory/<path>` lands the user on it. */
  openPath?: string
  /** Reports the opened file back to the host so the route (and its copyable URL) can follow. */
  onOpenPathChange?: (path: string) => void
}) {
  const memory = useAgentMemory(serverUrl, accountUid, agentId)
  const writeFile = useWriteAgentMemoryFile(serverUrl, accountUid)
  const deleteFile = useDeleteAgentMemoryFile(serverUrl, accountUid)
  const downloadFromWeb = useDownloadAgentMemoryFile(serverUrl, accountUid)
  const uploadToIpfs = useUploadAgentMemoryFileToIpfs(serverUrl, accountUid)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [draftText, setDraftText] = useState<string | null>(null)
  const [newFilePath, setNewFilePath] = useState('')
  const [addPanel, setAddPanel] = useState<'none' | 'new-file' | 'from-url'>('none')
  const [webUrl, setWebUrl] = useState('')
  const [webPath, setWebPath] = useState('')
  const [confirmDeletePath, setConfirmDeletePath] = useState<string | null>(null)
  /** In-flight local file upload shown as a progress bar; null when idle. */
  const [uploadProgress, setUploadProgress] = useState<{
    name: string
    sent: number
    total: number
  } | null>(null)
  /** Where dragged files would land: '' = memory root, a path = that folder, null = no drag. */
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  /** Last IPFS publish result per memory path, kept so the URL stays visible/copyable. */
  const [ipfsUrls, setIpfsUrls] = useState<Record<string, string>>({})
  /** Directories currently expanded in the tree; everything starts collapsed. */
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(() => new Set())
  const uploadInputRef = useRef<HTMLInputElement>(null)
  // Reading a file pulls its full bytes over the wire; very large files (multi-hundred-MB
  // uploads) would stall or crash the preview, so those render a size card instead of fetching.
  const selectedEntry = memory.data?.entries.find((entry) => entry.type === 'file' && entry.path === selectedPath)
  const selectedTooLarge = (selectedEntry?.size ?? 0) > MAX_MEMORY_PREVIEW_BYTES
  const file = useAgentMemoryFile(
    serverUrl,
    accountUid,
    agentId,
    selectedTooLarge ? undefined : selectedPath ?? undefined,
  )
  const entries = memory.data?.entries ?? []
  const fileCount = entries.filter((entry) => entry.type === 'file').length
  const visibleEntries = entries.filter((entry) => isPathVisible(entry.path, expandedDirs))

  // Drop the selection when the selected file disappears from the listing (e.g. the
  // agent or another window deleted it).
  useEffect(() => {
    if (!selectedPath || !memory.data) return
    if (!memory.data.entries.some((entry) => entry.type === 'file' && entry.path === selectedPath)) {
      setSelectedPath(null)
      setDraftText(null)
    }
  }, [memory.data, selectedPath])
  function selectFile(path: string) {
    setSelectedPath(path)
    setDraftText(null)
    setConfirmDeletePath(null)
    revealPath(path)
    if (path !== openPath) onOpenPathChange?.(path)
  }
  function toggleDir(path: string) {
    setExpandedDirs((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  // Arriving from a `~/memory/…` link: open that file (or reveal that folder) ONCE per requested
  // path — a later poll of the listing must not yank the user back off whatever they opened next.
  const openedPathRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    // Waiting for the listing keeps a directory link from being opened as if it were a file.
    if (!openPath || !memory.data || openedPathRef.current === openPath) return
    openedPathRef.current = openPath
    if (memory.data.entries.some((entry) => entry.path === openPath && entry.type === 'dir')) {
      setExpandedDirs((current) => new Set(current).add(openPath))
      revealPath(openPath)
      return
    }
    selectFile(openPath)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one reveal per requested path
  }, [openPath, memory.data])

  /** Expands every ancestor directory of a path so it is visible in the tree. */
  function revealPath(path: string) {
    const segments = path.split('/')
    if (segments.length <= 1) return
    setExpandedDirs((current) => {
      const next = new Set(current)
      for (let i = 1; i < segments.length; i++) next.add(segments.slice(0, i).join('/'))
      return next
    })
  }
  async function handleCreateFile() {
    const path = newFilePath.trim()
    if (!path) return
    try {
      await writeFile.mutateAsync({
        agentId,
        path,
        content: '',
      })
      setNewFilePath('')
      setAddPanel('none')
      selectFile(path.replace(/^\/+/, ''))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create memory file')
    }
  }
  async function handleDownloadFromWeb() {
    const url = webUrl.trim()
    if (!url) return
    try {
      const result = await downloadFromWeb.mutateAsync({
        agentId,
        url,
        path: webPath.trim() || undefined,
      })
      setWebUrl('')
      setWebPath('')
      setAddPanel('none')
      selectFile(result.entry.path)
      toast.success(`Downloaded to ${result.entry.path}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not download the file')
    }
  }

  /** Uploads local files into memory, optionally inside a target directory. Large files go in
   * chunks (each signed action stays small) with a visible progress bar. */
  async function handleUploadLocalFiles(localFiles: DroppedFile[], dirPath?: string) {
    if (!accountUid) {
      toast.error('Select an account first')
      return
    }
    let lastPath: string | null = null
    let uploaded = 0
    try {
      for (const {path: relativePath, file: localFile} of localFiles) {
        try {
          const bytes = new Uint8Array(await localFile.arrayBuffer())
          const path = dirPath ? `${dirPath}/${relativePath}` : relativePath
          setUploadProgress({
            name: relativePath,
            sent: 0,
            total: bytes.byteLength,
          })
          await uploadFileToAgentServer({
            serverUrl,
            accountUid,
            target: {
              kind: 'memory',
              agentId,
              path,
            },
            data: bytes,
            onProgress: (progress) =>
              setUploadProgress({
                name: relativePath,
                ...progress,
              }),
          })
          lastPath = path
          uploaded++
        } catch (error) {
          toast.error(error instanceof Error ? `${relativePath}: ${error.message}` : 'Could not add the file to memory')
        }
      }
    } finally {
      setUploadProgress(null)
      invalidateQueries(['agents', 'memory'])
    }
    if (lastPath) {
      selectFile(lastPath)
      toast.success(
        uploaded === 1
          ? `Added ${lastPath} to memory`
          : `Added ${uploaded} files to memory${dirPath ? ` in ${dirPath}/` : ''}`,
      )
    }
  }

  /** Handles a drop of OS files and/or folders, walking folders so their contents land as nested paths. */
  async function handleDroppedItems(dataTransfer: DataTransfer, dirPath?: string) {
    try {
      const dropped = await collectDroppedFiles(dataTransfer)
      if (dropped.length) await handleUploadLocalFiles(dropped, dirPath)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not read the dropped files')
    }
  }
  async function handleSave() {
    if (selectedPath === null || draftText === null) return
    try {
      await writeFile.mutateAsync({
        agentId,
        path: selectedPath,
        content: draftText,
      })
      setDraftText(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save memory file')
    }
  }
  async function handleDelete(path: string) {
    try {
      await deleteFile.mutateAsync({
        agentId,
        path,
      })
      setConfirmDeletePath(null)
      if (selectedPath === path || selectedPath?.startsWith(`${path}/`)) {
        setSelectedPath(null)
        setDraftText(null)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete from memory')
    }
  }
  async function handlePublishToIpfs() {
    if (!selectedPath) return
    try {
      const result = await uploadToIpfs.mutateAsync({
        agentId,
        path: selectedPath,
      })
      setIpfsUrls((current) => ({
        ...current,
        [result.path]: result.url,
      }))
      await copyText(result.url)
      toast.success(`Published to IPFS — URL copied: ${result.url}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not upload to IPFS')
    }
  }
  const dirty = draftText !== null && draftText !== (file.data?.content ?? '')
  const selectedIpfsUrl = selectedPath ? ipfsUrls[selectedPath] : undefined
  return (
    <section className={stylex.props(styles_2.sdc9fb26a).className || ''}>
      <div className={stylex.props(styles_3.s925cbdaf).className || ''}>
        <div className={stylex.props(styles_2.s797b1794).className || ''}>
          <SizableText weight="bold">Memory</SizableText>
          <SizableText size="xs" color="muted">
            Private files this agent reads and writes across sessions.{' '}
            {readOnly ? 'You have read-only access.' : 'You can edit everything here.'}
            {memory.data
              ? ` ${fileCount} file${fileCount === 1 ? '' : 's'}, ${formatBytes(memory.data.totalBytes)}.`
              : ''}
          </SizableText>
        </div>
        {!readOnly ? (
          <div className={stylex.props(styles.sa0238738).className || ''}>
            <input
              ref={uploadInputRef}
              type="file"
              multiple
              className={stylex.props(styles.sb76e9daa).className || ''}
              onChange={(event) => {
                const localFiles = Array.from(event.currentTarget.files ?? [])
                event.currentTarget.value = ''
                if (localFiles.length)
                  void handleUploadLocalFiles(
                    localFiles.map((file) => ({
                      path: file.name,
                      file,
                    })),
                  )
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className={stylex.props(styles_3.s284af276).className || ''}
              onClick={() => uploadInputRef.current?.click()}
              disabled={writeFile.isLoading}
            >
              <Upload className={stylex.props(styles.sef1c143e).className || ''} /> Add file
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={stylex.props(styles_3.s284af276).className || ''}
              onClick={() => setAddPanel((current) => (current === 'from-url' ? 'none' : 'from-url'))}
            >
              <Globe className={stylex.props(styles.sef1c143e).className || ''} /> From URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={stylex.props(styles_3.s284af276).className || ''}
              onClick={() => setAddPanel((current) => (current === 'new-file' ? 'none' : 'new-file'))}
            >
              <FilePlus className={stylex.props(styles.sef1c143e).className || ''} /> New file
            </Button>
          </div>
        ) : null}
      </div>

      {uploadProgress ? (
        <div className={stylex.props(styles.s7b06a24b).className || ''}>
          <div className={stylex.props(styles.s1f027a3).className || ''}>
            <span className={stylex.props(styles_2.s5e669942).className || ''}>
              Uploading {uploadProgress.name}… {formatBytes(uploadProgress.sent)} of {formatBytes(uploadProgress.total)}
            </span>
            <span className={stylex.props(styles.sd934a9b1).className || ''}>
              {Math.floor((uploadProgress.sent / Math.max(1, uploadProgress.total)) * 100)}%
            </span>
          </div>
          <div className={stylex.props(styles.s8b97c16b).className || ''}>
            <div
              className={stylex.props(styles_3.sf909be14).className || ''}
              style={{
                width: `${(uploadProgress.sent / Math.max(1, uploadProgress.total)) * 100}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {addPanel === 'new-file' ? (
        <form
          className={stylex.props(styles.sa8c3280f).className || ''}
          onSubmit={(event) => {
            event.preventDefault()
            void handleCreateFile()
          }}
        >
          <Input
            autoFocus
            value={newFilePath}
            onChange={(event) => setNewFilePath(event.target.value)}
            placeholder="notes/topic.md"
            aria-label="New memory file path"
          />
          <Button type="submit" size="sm" disabled={!newFilePath.trim() || writeFile.isLoading}>
            Create
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setAddPanel('none')}>
            Cancel
          </Button>
        </form>
      ) : null}

      {addPanel === 'from-url' ? (
        <form
          className={stylex.props(styles.sa8c3280f).className || ''}
          onSubmit={(event) => {
            event.preventDefault()
            void handleDownloadFromWeb()
          }}
        >
          <Input
            autoFocus
            value={webUrl}
            onChange={(event) => setWebUrl(event.target.value)}
            placeholder="https://example.com/file.png"
            aria-label="URL to download into memory"
          />
          <Input
            value={webPath}
            onChange={(event) => setWebPath(event.target.value)}
            placeholder="Optional path (media/file.png)"
            aria-label="Optional memory path for the download"
            className={stylex.props(styles_2.s15930280).className || ''}
          />
          <Button type="submit" size="sm" disabled={!webUrl.trim() || downloadFromWeb.isLoading}>
            {downloadFromWeb.isLoading ? 'Downloading…' : 'Download'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setAddPanel('none')}>
            Cancel
          </Button>
        </form>
      ) : null}

      <div className={stylex.props(styles_3.s69f58106).className || ''}>
        <div
          className={
            (stylex.props(
              styles_5.s1a01a0ed,
              styles_5.s2ffff9,
              styles_5.s158c30ef,
              styles_5.scdbaf625,
              styles_5.s948be48c,
              styles_5.s67e351ac,
              styles_5.sac38f2ae,
              styles_5.s7c401f01,
              styles_5.s1aa15,
              styles_5.saae5326,
              styles_5.s80d4f4f4,
              styles_5.s94043d84,
              styles_5.sf9c2bc31,
            ).className || '') +
            ' ' +
            (dropTarget === '' ? stylex.props(styles_5.sc883a3d5).className || '' : '')
          }
          onDragOver={(event) => {
            if (readOnly || !hasDraggedFiles(event)) return
            event.preventDefault()
            // Dir rows stop propagation while hovered, so reaching here means the root is targeted.
            setDropTarget('')
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
            setDropTarget(null)
          }}
          onDrop={(event) => {
            if (readOnly || !hasDraggedFiles(event)) return
            event.preventDefault()
            setDropTarget(null)
            void handleDroppedItems(event.dataTransfer)
          }}
        >
          {memory.isLoading ? (
            <div className={stylex.props(styles.se295dce0).className || ''}>
              <Spinner />
            </div>
          ) : memory.isError ? (
            <SizableText size="sm" color="muted" className={stylex.props(styles.s1aa15).className || ''}>
              Could not load memory from the agent server.
            </SizableText>
          ) : entries.length === 0 ? (
            <SizableText size="sm" color="muted" className={stylex.props(styles.s1aa15).className || ''}>
              No memory yet. The agent stores files here as it works, and you can add files for it to find — or drop
              files here.
            </SizableText>
          ) : (
            visibleEntries.map((entry) => (
              <MemoryEntryRow
                key={entry.path}
                entry={entry}
                selected={entry.type === 'file' && entry.path === selectedPath}
                confirmingDelete={confirmDeletePath === entry.path}
                expanded={entry.type === 'dir' && expandedDirs.has(entry.path)}
                onToggle={entry.type === 'dir' ? () => toggleDir(entry.path) : undefined}
                onSelect={() => (entry.type === 'file' ? selectFile(entry.path) : undefined)}
                onRequestDelete={readOnly ? undefined : () => setConfirmDeletePath(entry.path)}
                onCancelDelete={() => setConfirmDeletePath(null)}
                onConfirmDelete={() => void handleDelete(entry.path)}
                deleting={deleteFile.isLoading && confirmDeletePath === entry.path}
                dropTargeted={entry.type === 'dir' && dropTarget === entry.path}
                onDirDragOver={
                  !readOnly && entry.type === 'dir'
                    ? (event) => {
                        if (!hasDraggedFiles(event)) return
                        event.preventDefault()
                        event.stopPropagation()
                        setDropTarget(entry.path)
                      }
                    : undefined
                }
                onDirDrop={
                  !readOnly && entry.type === 'dir'
                    ? (event) => {
                        if (!hasDraggedFiles(event)) return
                        event.preventDefault()
                        event.stopPropagation()
                        setDropTarget(null)
                        void handleDroppedItems(event.dataTransfer, entry.path)
                      }
                    : undefined
                }
              />
            ))
          )}
        </div>

        <div className={stylex.props(styles_2.s60e2bfdc).className || ''}>
          {selectedPath === null ? (
            <div className={stylex.props(styles.sf48c8a4d).className || ''}>
              <SizableText size="sm" color="muted">
                Select a file to view and edit it.
              </SizableText>
            </div>
          ) : selectedTooLarge && selectedEntry ? (
            <div className={stylex.props(styles.sd231ed2c).className || ''}>
              <FileText className={stylex.props(styles.s3566be67).className || ''} />
              <SizableText size="sm" weight="bold" className={stylex.props(styles_2.s5e981e19).className || ''}>
                {selectedPath}
              </SizableText>
              <SizableText size="sm" color="muted">
                {formatBytes(selectedEntry.size)}
                {selectedEntry.mimeType ? ` · ${selectedEntry.mimeType}` : ''} — too large to preview here.
              </SizableText>
              {!readOnly ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeletePath(selectedPath)}
                  className={stylex.props(styles.s33458c).className || ''}
                >
                  <Trash2 className={stylex.props(styles.sa41e8da5).className || ''} /> Delete
                </Button>
              ) : null}
            </div>
          ) : file.isLoading ? (
            <div className={stylex.props(styles.sf48c8a4d).className || ''}>
              <Spinner />
            </div>
          ) : file.isError ? (
            <div className={stylex.props(styles.sf48c8a4d).className || ''}>
              <SizableText size="sm" color="muted">
                {file.error instanceof Error ? file.error.message : 'Could not read this memory file.'}
              </SizableText>
            </div>
          ) : file.data ? (
            <>
              <div className={stylex.props(styles.saa4f1d10).className || ''}>
                <FileText className={stylex.props(styles.s9cbc670f).className || ''} />
                <SizableText size="sm" weight="bold" className={stylex.props(styles_2.s700ce289).className || ''}>
                  {selectedPath}
                </SizableText>
                <SizableText size="xs" color="muted" className={stylex.props(styles.s948be48c).className || ''}>
                  {formatBytes(dirty ? new TextEncoder().encode(draftText ?? '').byteLength : file.data.size)}
                  {file.data.mimeType ? ` · ${file.data.mimeType}` : ''}
                  {file.data.updatedAt ? ` · ${formattedDateMedium(new Date(file.data.updatedAt))}` : ''}
                </SizableText>
                {!readOnly && file.data.encoding === 'utf8' && dirty ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={stylex.props(styles.s948be48c).className || ''}
                      onClick={() => setDraftText(null)}
                      disabled={writeFile.isLoading}
                    >
                      <RotateCcw className={stylex.props(styles.sa41e8da5).className || ''} /> Revert
                    </Button>
                    <Button
                      size="sm"
                      className={stylex.props(styles.s948be48c).className || ''}
                      onClick={() => void handleSave()}
                      disabled={writeFile.isLoading}
                    >
                      <Save className={stylex.props(styles.sa41e8da5).className || ''} />{' '}
                      {writeFile.isLoading ? 'Saving…' : 'Save'}
                    </Button>
                  </>
                ) : null}
                <OptionsDropdown
                  align="end"
                  menuItems={[
                    {
                      key: 'download',
                      icon: <Download className={stylex.props(styles.sca3de968).className || ''} />,
                      label: 'Download',
                      onClick: () => file.data && saveFileToDisk(file.data),
                    },
                    {
                      key: 'publish-ipfs',
                      icon: <UploadCloud className={stylex.props(styles.sca3de968).className || ''} />,
                      label: uploadToIpfs.isLoading ? 'Publishing…' : 'Publish to IPFS',
                      disabled: readOnly || uploadToIpfs.isLoading,
                      onClick: () => void handlePublishToIpfs(),
                    },
                  ]}
                />
              </div>
              {selectedIpfsUrl ? (
                <div className={stylex.props(styles_3.s916f298e).className || ''}>
                  <SizableText size="xs" color="muted" className={stylex.props(styles.s948be48c).className || ''}>
                    IPFS:
                  </SizableText>
                  <SizableText size="xs" className={stylex.props(styles_2.s700ce289).className || ''}>
                    {selectedIpfsUrl}
                  </SizableText>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    className={stylex.props(styles.s948be48c).className || ''}
                    aria-label="Copy IPFS URL"
                    onClick={() => void copyText(selectedIpfsUrl).then(() => toast.success('IPFS URL copied'))}
                  >
                    <Copy className={stylex.props(styles.s3269316e).className || ''} />
                  </Button>
                </div>
              ) : null}
              {file.data.encoding === 'utf8' ? (
                <textarea
                  aria-label={`Memory file ${selectedPath}`}
                  className={stylex.props(styles_3.s4c0dae9c).className || ''}
                  value={draftText ?? file.data.content ?? ''}
                  onChange={(event) => setDraftText(event.currentTarget.value)}
                  readOnly={readOnly}
                  spellCheck={false}
                />
              ) : (
                <BinaryFilePreview file={file.data} onDownload={() => file.data && saveFileToDisk(file.data)} />
              )}
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/**
 * Renders binary memory files: inline previews for images (including animated GIFs), video, and
 * audio, and a download-first card for every other binary type.
 */
function BinaryFilePreview({file, onDownload}: {file: AgentMemoryFile; onDownload: () => void}) {
  const objectUrl = useMemo(() => {
    if (!file.data || !file.data.byteLength) return null
    const blob = new Blob(
      [new Uint8Array(file.data)],
      file.mimeType
        ? {
            type: file.mimeType,
          }
        : undefined,
    )
    return URL.createObjectURL(blob)
  }, [file])
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])
  const kind = file.mimeType?.split('/')[0]
  if (objectUrl && kind === 'image') {
    return (
      <div className={stylex.props(styles_2.s9fd13fd5).className || ''}>
        <img src={objectUrl} alt={file.path} className={stylex.props(styles_2.sc0f44c0).className || ''} />
      </div>
    )
  }
  if (objectUrl && kind === 'video') {
    return (
      <div className={stylex.props(styles_2.s9fd13fd5).className || ''}>
        <video src={objectUrl} controls className={stylex.props(styles_2.sb09d96e6).className || ''} />
      </div>
    )
  }
  if (objectUrl && kind === 'audio') {
    return (
      <div className={stylex.props(styles_2.s9fd13fd5).className || ''}>
        <audio src={objectUrl} controls className={stylex.props(styles_2.s82f80d11).className || ''} />
      </div>
    )
  }
  const name = file.path.split('/').at(-1) || file.path
  return (
    <div className={stylex.props(styles_2.s9fd13fd7).className || ''}>
      <div className={stylex.props(styles_3.s35e8f34e).className || ''}>
        <div className={stylex.props(styles.s8056ee4).className || ''}>
          <FileText className={stylex.props(styles.sca3de96b).className || ''} />
        </div>
        <div className={stylex.props(styles.s91654f6f).className || ''}>
          <SizableText size="sm" weight="bold" className={stylex.props(styles_2.s5e981e19).className || ''}>
            {name}
          </SizableText>
          <SizableText size="xs" color="muted">
            {formatBytes(file.size)}
            {file.mimeType ? ` · ${file.mimeType}` : ' · binary file'}
          </SizableText>
        </div>
        {objectUrl ? (
          <>
            <SizableText size="xs" color="muted" className={stylex.props(styles.s65e234f5).className || ''}>
              This file type has no inline preview.
            </SizableText>
            <Button onClick={onDownload}>
              <Download className={stylex.props(styles.sef1c143e).className || ''} /> Download
            </Button>
          </>
        ) : (
          <SizableText size="xs" color="muted" className={stylex.props(styles.s65e234f5).className || ''}>
            The file content could not be loaded for preview. If this agent server was recently updated, restart it and
            reopen the file.
          </SizableText>
        )}
      </div>
    </div>
  )
}
function MemoryEntryRow({
  entry,
  selected,
  confirmingDelete,
  deleting,
  expanded,
  onToggle,
  onSelect,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  dropTargeted,
  onDirDragOver,
  onDirDrop,
}: {
  entry: AgentMemoryEntry
  selected: boolean
  confirmingDelete: boolean
  deleting: boolean
  /** True when this directory's contents are shown. */
  expanded?: boolean
  /** Collapses/expands this directory. */
  onToggle?: () => void
  onSelect: () => void
  onRequestDelete?: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
  /** True while dragged files hover this directory row. */
  dropTargeted?: boolean
  onDirDragOver?: (event: React.DragEvent<HTMLDivElement>) => void
  onDirDrop?: (event: React.DragEvent<HTMLDivElement>) => void
}) {
  const depth = entry.path.split('/').length - 1
  const name = entry.path.split('/').at(-1) || entry.path
  return (
    <div
      className={
        (stylex.props(
          styles_5.s2ffff9,
          styles_5.sc6ed1702,
          styles_5.s5d936fa,
          styles_5.sf79988b7,
          styles_5.s34b1ac,
          styles_5.sc5dd1033,
        ).className || '') +
        ' ' +
        (selected
          ? stylex.props(styles_5.s46d743d4).className || ''
          : dropTargeted
            ? stylex.props(styles_5.s46d743d9, styles_5.sc883a3d4).className || ''
            : stylex.props(styles_5.s9c668528).className || '')
      }
      style={{
        paddingLeft: `${4 + depth * 14}px`,
      }}
      onDragOver={onDirDragOver}
      onDrop={onDirDrop}
    >
      {entry.type === 'dir' ? (
        <button
          type="button"
          className={stylex.props(styles_3.s5e13eb37).className || ''}
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${entry.path}`}
        >
          <ChevronRight
            className={stylex.props(styles_5.sca3de967, styles_5.s948be48c, styles_5.s8b2dd4f4).className || ''}
          />
          <Folder className={stylex.props(styles.se15ec85a).className || ''} />
          <span className={stylex.props(styles.scbdf1fe2).className || ''}>{name}</span>
        </button>
      ) : (
        <button type="button" className={stylex.props(styles_3.sc566ce12).className || ''} onClick={onSelect}>
          <FileText className={stylex.props(styles.s2c60fcd5).className || ''} />
          <span className={stylex.props(styles.scbdf1fe2).className || ''}>{name}</span>
          <span className={stylex.props(styles_3.s6548d595).className || ''}>{formatBytes(entry.size)}</span>
        </button>
      )}
      {confirmingDelete ? (
        <span className={stylex.props(styles.sa0238737).className || ''}>
          <Button variant="destructive" size="xs" onClick={onConfirmDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
          <Button variant="ghost" size="xs" onClick={onCancelDelete} disabled={deleting}>
            Cancel
          </Button>
        </span>
      ) : onRequestDelete ? (
        <Button
          variant="ghost"
          size="iconSm"
          aria-label={`Delete ${entry.path}`}
          className={stylex.props(styles_4.s948be48c, styles_4.s765a26ee).className || ''}
          onClick={onRequestDelete}
        >
          <Trash2 className={stylex.props(styles.s3269316e).className || ''} />
        </Button>
      ) : null}
    </div>
  )
}

/** True when every ancestor directory of the path is expanded (root entries are always visible). */
function isPathVisible(path: string, expandedDirs: Set<string>): boolean {
  const segments = path.split('/')
  for (let i = 1; i < segments.length; i++) {
    if (!expandedDirs.has(segments.slice(0, i).join('/'))) return false
  }
  return true
}

/** True when a drag event carries OS files (rather than in-app text/element drags). */
function hasDraggedFiles(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes('Files')
}

/** A local file to upload, with its memory-relative path (includes folder names for folder drops). */
type DroppedFile = {
  path: string
  file: File
}

/**
 * Collects the files carried by a drop, recursing into dropped folders so nested files keep
 * their relative paths. Must be called synchronously from the drop event: `webkitGetAsEntry`
 * only works while the DataTransfer is live.
 */
async function collectDroppedFiles(dataTransfer: DataTransfer): Promise<DroppedFile[]> {
  const entries = Array.from(dataTransfer.items).map((item) => item.webkitGetAsEntry?.() ?? null)
  if (!entries.some(Boolean)) {
    // No entries API (or a non-filesystem drag): fall back to the flat file list.
    return Array.from(dataTransfer.files).map((file) => ({
      path: file.name,
      file,
    }))
  }
  const collected: DroppedFile[] = []
  for (const entry of entries) {
    if (entry) await collectEntry(entry, collected)
  }
  return collected
}
async function collectEntry(entry: FileSystemEntry, out: DroppedFile[]): Promise<void> {
  if (entry.isFile) {
    if (entry.name === '.DS_Store') return
    const file = await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject))
    out.push({
      path: entry.fullPath.replace(/^\/+/, ''),
      file,
    })
  } else if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader()
    // readEntries returns results in batches (~100 in Chromium) until an empty batch.
    while (true) {
      const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject))
      if (!batch.length) break
      for (const child of batch) await collectEntry(child, out)
    }
  }
}

/** Saves a memory file to the user's computer via a browser download. */
function saveFileToDisk(file: AgentMemoryFile) {
  const bytes =
    file.encoding === 'binary' ? file.data ?? new Uint8Array() : new TextEncoder().encode(file.content ?? '')
  const blob = new Blob(
    [new Uint8Array(bytes)],
    file.mimeType
      ? {
          type: file.mimeType,
        }
      : undefined,
  )
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.path.split('/').at(-1) || 'file'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard access can fail outside a focused window; the URL stays visible for manual copy.
  }
}
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
