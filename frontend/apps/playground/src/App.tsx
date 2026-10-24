import {Puck, Render, type Data, usePuck} from '@puckeditor/core'
import {ArrowLeft, Copy, Maximize, Plus, Trash2, Minus, Play, Share2, Undo2, Redo2} from 'lucide-react'
import {useEffect, useRef, useState, type ReactNode, type WheelEvent} from 'react'
import {DeviceFrame} from './frame'
import {SettingsPopover} from './SettingsPopover'
import {type Artboard, type Board, type Device, deviceSizes} from './model'
import {createTemplateData, playgroundConfig, type TemplateName} from './registry'
import {PLAYGROUND_BOARD_STORAGE_KEY} from './defaults'
import {MediaWindowContext} from '@shm/ui/use-media'
import {decodeBoard, encodeBoard} from './share'

const viewports = [
  {label: 'Desktop', width: 1440, icon: 'Monitor' as const},
  {label: 'Laptop', width: 1280, icon: 'Monitor' as const},
  {label: 'Tablet', width: 834, icon: 'Tablet' as const},
  {label: 'Mobile', width: 390, icon: 'Smartphone' as const},
]

function initialBoard(): Board {
  return {
    version: 1,
    artboards: [
      {id: crypto.randomUUID(), name: 'Desktop document', device: 'desktop', x: 80, y: 80, data: createTemplateData()},
      {
        id: crypto.randomUUID(),
        name: 'Mobile document',
        device: 'mobile',
        x: 1600,
        y: 80,
        data: createTemplateData('Mobile document'),
      },
    ],
  }
}

function loadBoard(): Board {
  const shared = location.hash.startsWith('#b=') ? decodeBoard(location.hash.slice(3)) : null
  if (shared) return shared
  try {
    const stored = localStorage.getItem(PLAYGROUND_BOARD_STORAGE_KEY)
    const board = stored ? (JSON.parse(stored) as Board) : null
    if (board?.version === 1 && Array.isArray(board.artboards)) return board
  } catch {
    // Use the starter board when saved state cannot be read.
  }
  return initialBoard()
}

function cloneData(data: Data): Data {
  const clone = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(clone)
    if (!value || typeof value !== 'object') return value
    const source = value as Record<string, unknown>
    const next = Object.fromEntries(Object.entries(source).map(([key, item]) => [key, clone(item)]))
    if (source.id && typeof source.id === 'string') next.id = crypto.randomUUID()
    return next
  }
  return clone(data) as Data
}

function BoardView({
  board,
  setBoard,
  onEdit,
  onShare,
}: {
  board: Board
  setBoard: (board: Board) => void
  onEdit: (id: string) => void
  onShare: () => void
}) {
  const [selectedId, setSelectedId] = useState(board.artboards[0]?.id)
  const [template, setTemplate] = useState<TemplateName>('Desktop document')
  const [device, setDevice] = useState<Device>('desktop')
  const [playMode, setPlayMode] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [zoom, setZoom] = useState(0.5)
  const [pan, setPan] = useState({x: 0, y: 0})
  const canvasRef = useRef<HTMLDivElement>(null)
  const spaceDown = useRef(false)
  const panStart = useRef<{x: number; y: number; panX: number; panY: number} | null>(null)
  const artboardDrag = useRef<{id: string; x: number; y: number; startX: number; startY: number} | null>(null)
  const selected = board.artboards.find((artboard) => artboard.id === selectedId)

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !(event.target instanceof HTMLInputElement)) {
        spaceDown.current = true
        event.preventDefault()
      }
    }
    const up = (event: KeyboardEvent) => {
      if (event.code === 'Space') spaceDown.current = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.key.toLowerCase() === 'p' && !event.metaKey && !event.ctrlKey) setPlayMode((value) => !value)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        if (!selected) return
        const copy = {
          ...selected,
          id: crypto.randomUUID(),
          name: `${selected.name} copy`,
          x: selected.x + 80,
          y: selected.y + 80,
          data: cloneData(selected.data),
        }
        setBoard({...board, artboards: [...board.artboards, copy]})
        setSelectedId(copy.id)
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!selected) return
        const remaining = board.artboards.filter((item) => item.id !== selected.id)
        setBoard({...board, artboards: remaining})
        setSelectedId(remaining[0]?.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [board, selected])

  function zoomToFit() {
    const bounds = canvasRef.current?.getBoundingClientRect()
    if (!bounds || board.artboards.length === 0) return
    const left = Math.min(...board.artboards.map((item) => item.x))
    const top = Math.min(...board.artboards.map((item) => item.y))
    const right = Math.max(...board.artboards.map((item) => item.x + deviceSizes[item.device].width))
    const bottom = Math.max(...board.artboards.map((item) => item.y + deviceSizes[item.device].height))
    const scale = Math.min((bounds.width - 96) / (right - left), (bounds.height - 150) / (bottom - top), 1)
    setZoom(scale)
    setPan({x: 48 - left * scale, y: 96 - top * scale})
  }

  function addArtboard() {
    const x = Math.max(80, ...board.artboards.map((item) => item.x + deviceSizes[item.device].width + 80))
    const item: Artboard = {
      id: crypto.randomUUID(),
      name: template,
      device,
      x,
      y: 80,
      data: createTemplateData(template),
    }
    setBoard({...board, artboards: [...board.artboards, item]})
    setSelectedId(item.id)
  }

  function duplicateSelected() {
    if (!selected) return
    const copy = {
      ...selected,
      id: crypto.randomUUID(),
      name: `${selected.name} copy`,
      x: selected.x + 80,
      y: selected.y + 80,
      data: cloneData(selected.data),
    }
    setBoard({...board, artboards: [...board.artboards, copy]})
    setSelectedId(copy.id)
  }

  function deleteSelected() {
    if (!selected) return
    const remaining = board.artboards.filter((item) => item.id !== selected.id)
    setBoard({...board, artboards: remaining})
    setSelectedId(remaining[0]?.id)
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const nextZoom = Math.max(0.2, Math.min(1.25, zoom * Math.exp(-event.deltaY * 0.001)))
    const cursorX = event.clientX - rect.left
    const cursorY = event.clientY - rect.top
    const worldX = (cursorX - pan.x) / zoom
    const worldY = (cursorY - pan.y) / zoom
    setPan({x: cursorX - worldX * nextZoom, y: cursorY - worldY * nextZoom})
    setZoom(nextZoom)
  }

  return (
    <div className="bg-muted/40 text-foreground flex h-full flex-col">
      <header className="playground-chrome bg-background z-10 flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <strong className="mr-auto text-sm">Seed Layout Playground</strong>
        <select
          className="bg-background h-9 rounded-md border px-2 text-sm"
          value={template}
          onChange={(event) => setTemplate(event.target.value as TemplateName)}
        >
          <option>Desktop document</option>
          <option>Mobile document</option>
          <option>Desktop feed</option>
          <option>Blank window</option>
        </select>
        <select
          className="bg-background h-9 rounded-md border px-2 text-sm"
          value={device}
          onChange={(event) => setDevice(event.target.value as Device)}
        >
          {Object.keys(deviceSizes).map((name) => (
            <option key={name} value={name}>
              {name.charAt(0).toUpperCase() + name.slice(1)} · {deviceSizes[name as Device].width}
            </option>
          ))}
        </select>
        <button
          className="bg-primary text-primary-foreground flex h-9 items-center gap-2 rounded-md px-3 text-sm"
          onClick={addArtboard}
        >
          <Plus className="size-4" /> Add artboard
        </button>
        <button
          className={`hover:bg-muted rounded-md px-3 py-2 text-sm ${
            playMode ? 'bg-primary text-primary-foreground' : ''
          }`}
          onClick={() => setPlayMode(!playMode)}
          aria-pressed={playMode}
        >
          <Play className="mr-1 inline size-4" /> {playMode ? 'Playing' : 'Play'}
        </button>
        <button className="hover:bg-muted rounded-md p-2" onClick={onShare} aria-label="Share board">
          <Share2 className="size-4" />
        </button>
        <button
          aria-label="Duplicate artboard"
          disabled={!selected}
          className="hover:bg-muted rounded-md p-2 disabled:opacity-40"
          onClick={duplicateSelected}
        >
          <Copy className="size-4" />
        </button>
        <button
          aria-label="Delete artboard"
          disabled={!selected}
          className="hover:bg-muted rounded-md p-2 disabled:opacity-40"
          onClick={deleteSelected}
        >
          <Trash2 className="size-4" />
        </button>
        <button
          aria-label="Zoom out"
          className="hover:bg-muted rounded-md p-2"
          onClick={() => setZoom((value) => Math.max(0.2, value - 0.1))}
        >
          <Minus className="size-4" />
        </button>
        <span className="text-muted-foreground w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
        <button
          aria-label="Zoom in"
          className="hover:bg-muted rounded-md p-2"
          onClick={() => setZoom((value) => Math.min(1.25, value + 0.1))}
        >
          <Plus className="size-4" />
        </button>
        <button className="hover:bg-muted rounded-md px-2 py-1 text-sm" onClick={zoomToFit}>
          <Maximize className="size-4" />
          Fit
        </button>
        <SettingsPopover />
      </header>
      <div
        ref={canvasRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{touchAction: 'none', cursor: panStart.current ? 'grabbing' : spaceDown.current ? 'grab' : 'default'}}
        onWheel={handleWheel}
        onPointerDown={(event) => {
          if (event.button === 1 || (event.button === 0 && spaceDown.current)) {
            event.preventDefault()
            event.currentTarget.setPointerCapture(event.pointerId)
            panStart.current = {x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y}
          }
        }}
        onPointerMove={(event) => {
          const start = panStart.current
          if (start) setPan({x: start.panX + event.clientX - start.x, y: start.panY + event.clientY - start.y})
        }}
        onPointerUp={() => {
          panStart.current = null
        }}
      >
        <div
          className="absolute top-0 left-0"
          style={{transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'top left'}}
        >
          {board.artboards.map((artboard) => {
            const size = deviceSizes[artboard.device]
            return (
              <section
                key={artboard.id}
                className={`bg-background absolute overflow-hidden rounded-lg border shadow-xl ${
                  selectedId === artboard.id ? 'ring-primary ring-2' : ''
                }`}
                style={{left: artboard.x, top: artboard.y, width: size.width, height: size.height + 44 / zoom}}
                onClick={() => setSelectedId(artboard.id)}
                onDoubleClick={() => onEdit(artboard.id)}
              >
                <div
                  className="bg-background flex h-11 cursor-grab items-center justify-between border-b px-4 font-medium active:cursor-grabbing"
                  style={{
                    height: 44 / zoom,
                    paddingLeft: 16 / zoom,
                    paddingRight: 16 / zoom,
                    fontSize: 14 / zoom,
                    lineHeight: `${20 / zoom}px`,
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    setSelectedId(artboard.id)
                    artboardDrag.current = {
                      id: artboard.id,
                      x: artboard.x,
                      y: artboard.y,
                      startX: event.clientX,
                      startY: event.clientY,
                    }
                    event.currentTarget.setPointerCapture(event.pointerId)
                  }}
                  onPointerMove={(event) => {
                    const drag = artboardDrag.current
                    if (!drag || drag.id !== artboard.id) return
                    const dx = (event.clientX - drag.startX) / zoom
                    const dy = (event.clientY - drag.startY) / zoom
                    setBoard({
                      ...board,
                      artboards: board.artboards.map((item) =>
                        item.id === drag.id ? {...item, x: drag.x + dx, y: drag.y + dy} : item,
                      ),
                    })
                  }}
                  onPointerUp={() => {
                    artboardDrag.current = null
                  }}
                >
                  {renamingId === artboard.id ? (
                    <input
                      autoFocus
                      value={nameDraft}
                      onPointerDown={(event) => event.stopPropagation()}
                      onChange={(event) => setNameDraft(event.target.value)}
                      onBlur={() => {
                        setBoard({
                          ...board,
                          artboards: board.artboards.map((item) =>
                            item.id === artboard.id ? {...item, name: nameDraft || item.name} : item,
                          ),
                        })
                        setRenamingId(null)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur()
                        if (event.key === 'Escape') setRenamingId(null)
                      }}
                      className="w-48 rounded border px-1"
                    />
                  ) : (
                    <button
                      className="text-left"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedId(artboard.id)
                        setNameDraft(artboard.name)
                        setRenamingId(artboard.id)
                      }}
                    >
                      {artboard.name}
                    </button>
                  )}
                  <span className="text-muted-foreground">
                    {artboard.device.charAt(0).toUpperCase() + artboard.device.slice(1)} · {size.width}
                  </span>
                </div>
                <div style={{pointerEvents: playMode ? 'auto' : 'none'}}>
                  <DeviceFrame width={size.width} height={size.height}>
                    <Render config={playgroundConfig} data={artboard.data} />
                  </DeviceFrame>
                </div>
              </section>
            )
          })}
        </div>
        <div className="bg-background/90 text-muted-foreground absolute bottom-4 left-4 rounded-md border px-3 py-2 text-xs">
          Space + drag to pan · Scroll to zoom · Double-click an artboard to edit
        </div>
      </div>
    </div>
  )
}

function EditorView({
  artboard,
  onBack,
  onChange,
  onDeviceChange,
  onNameChange,
  onShare,
}: {
  artboard: Artboard
  onBack: () => void
  onChange: (data: Data) => void
  onDeviceChange: (device: Device) => void
  onNameChange: (name: string) => void
  onShare: () => void
}) {
  const [preview, setPreview] = useState(false)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreview(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  if (preview) {
    const size = deviceSizes[artboard.device]
    return (
      <div className="bg-muted/40 h-full overflow-auto p-6">
        <div className="mx-auto w-fit">
          <DeviceFrame width={size.width} height={size.height}>
            <Render config={playgroundConfig} data={artboard.data} />
          </DeviceFrame>
        </div>
      </div>
    )
  }
  return (
    <div className="playground-editor h-full">
      <Puck
        key={`${artboard.id}-${artboard.device}`}
        config={playgroundConfig}
        data={artboard.data}
        onChange={onChange}
        viewports={viewports}
        iframe={{enabled: true, syncHostStyles: true, waitForStyles: true}}
        ui={{
          viewports: {
            current: {width: deviceSizes[artboard.device].width, height: 'auto'},
            controlsVisible: true,
            options: viewports,
          },
        }}
        overrides={
          {
            iframe: ({children, document}: {children: ReactNode; document?: Document}) => (
              <MediaWindowContext.Provider value={document?.defaultView ?? undefined}>
                {children}
              </MediaWindowContext.Provider>
            ),
            header: () => (
              <EditorHeader
                artboard={artboard}
                onBack={onBack}
                onNameChange={onNameChange}
                onDeviceChange={onDeviceChange}
                onPreview={() => setPreview(true)}
                onShare={onShare}
              />
            ),
            headerActions: () => null,
          } as never
        }
      />
    </div>
  )
}

function EditorHeader({
  artboard,
  onBack,
  onNameChange,
  onDeviceChange,
  onPreview,
  onShare,
}: {
  artboard: Artboard
  onBack: () => void
  onNameChange: (name: string) => void
  onDeviceChange: (device: Device) => void
  onPreview: () => void
  onShare: () => void
}) {
  const {history} = usePuck()
  return (
    <header className="playground-chrome bg-background flex h-12 w-full items-center gap-2 border-b px-3">
      <button
        className="hover:bg-muted flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm"
        onClick={onBack}
      >
        <ArrowLeft className="size-4" /> Board
      </button>
      <input
        aria-label="Artboard name"
        className="bg-background min-w-0 flex-1 rounded border px-2 py-1 text-sm"
        value={artboard.name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <select
        aria-label="Device viewport"
        className="bg-background h-8 shrink-0 rounded-md border px-2 text-sm"
        value={artboard.device}
        onChange={(event) => onDeviceChange(event.target.value as Device)}
      >
        {Object.keys(deviceSizes).map((name) => (
          <option key={name} value={name}>
            {name.charAt(0).toUpperCase() + name.slice(1)} · {deviceSizes[name as Device].width}
          </option>
        ))}
      </select>
      <button className="hover:bg-muted shrink-0 rounded-md px-3 py-1.5 text-sm" onClick={onPreview}>
        Preview
      </button>
      <button
        className="hover:bg-muted flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm"
        onClick={onShare}
      >
        <Share2 className="size-4" /> Share
      </button>
      <button
        className="hover:bg-muted rounded-md p-2 disabled:opacity-40"
        onClick={() => history.back()}
        disabled={!history.hasPast}
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 className="size-4" />
      </button>
      <button
        className="hover:bg-muted rounded-md p-2 disabled:opacity-40"
        onClick={() => history.forward()}
        disabled={!history.hasFuture}
        aria-label="Redo"
        title="Redo"
      >
        <Redo2 className="size-4" />
      </button>
    </header>
  )
}

export default function App() {
  const [board, setBoard] = useState<Board>(loadBoard)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [invalidShare] = useState(() => location.hash.startsWith('#b=') && !decodeBoard(location.hash.slice(3)))
  useEffect(() => localStorage.setItem(PLAYGROUND_BOARD_STORAGE_KEY, JSON.stringify(board)), [board])
  useEffect(() => {
    if (invalidShare) setToast('This share link could not be decoded. Your saved board was loaded instead.')
  }, [invalidShare])
  const share = async () => {
    const encoded = encodeBoard(board)
    location.hash = `b=${encoded}`
    const tooLong = location.href.length > 16_000
    try {
      await navigator.clipboard.writeText(location.href)
      setToast(tooLong ? 'Share link copied, but it exceeds 16k characters.' : 'Share link copied to clipboard.')
    } catch {
      setToast(
        tooLong
          ? 'Share link exceeds 16k characters; clipboard access is unavailable.'
          : 'Could not copy the share link. Check clipboard permissions.',
      )
    }
  }
  const editing = board.artboards.find((item) => item.id === editingId)

  if (editing) {
    return (
      <>
        <EditorView
          artboard={editing}
          onBack={() => setEditingId(null)}
          onShare={share}
          onNameChange={(name) =>
            setBoard({
              ...board,
              artboards: board.artboards.map((item) => (item.id === editing.id ? {...item, name} : item)),
            })
          }
          onChange={(data) =>
            setBoard({
              ...board,
              artboards: board.artboards.map((item) => (item.id === editing.id ? {...item, data} : item)),
            })
          }
          onDeviceChange={(device) =>
            setBoard({
              ...board,
              artboards: board.artboards.map((item) => (item.id === editing.id ? {...item, device} : item)),
            })
          }
        />
        {toast && (
          <div
            role="status"
            className="bg-popover text-popover-foreground fixed right-4 bottom-4 z-[100] rounded-md border px-4 py-3 text-sm shadow-lg"
          >
            {toast}
          </div>
        )}
      </>
    )
  }
  return (
    <>
      <BoardView board={board} setBoard={setBoard} onEdit={setEditingId} onShare={share} />
      {toast && (
        <div
          role="status"
          className="bg-popover text-popover-foreground fixed right-4 bottom-4 z-[100] rounded-md border px-4 py-3 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  )
}
