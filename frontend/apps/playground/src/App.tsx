import {Puck, Render, type Data} from '@puckeditor/core'
import {ArrowLeft, Copy, Maximize, Plus, Trash2} from 'lucide-react'
import {useEffect, useRef, useState, type ReactNode, type WheelEvent} from 'react'
import {DeviceFrame} from './frame'
import {SettingsPopover} from './SettingsPopover'
import {type Artboard, type Board, type Device, deviceSizes} from './model'
import {createTemplateData, playgroundConfig} from './registry'
import {PLAYGROUND_BOARD_STORAGE_KEY} from './defaults'
import {MediaWindowContext} from '@shm/ui/use-media'

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
      {id: crypto.randomUUID(), name: 'Mobile document', device: 'mobile', x: 1600, y: 80, data: createTemplateData()},
    ],
  }
}

function loadBoard(): Board {
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
}: {
  board: Board
  setBoard: (board: Board) => void
  onEdit: (id: string) => void
}) {
  const [selectedId, setSelectedId] = useState(board.artboards[0]?.id)
  const [template, setTemplate] = useState<'Desktop document' | 'Mobile document'>('Desktop document')
  const [device, setDevice] = useState<Device>('desktop')
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
      data: createTemplateData(),
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
      <header className="bg-background z-10 flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <strong className="mr-auto text-sm">Seed Layout Playground</strong>
        <select
          className="bg-background h-9 rounded-md border px-2 text-sm"
          value={template}
          onChange={(event) => setTemplate(event.target.value as typeof template)}
        >
          <option>Desktop document</option>
          <option>Mobile document</option>
        </select>
        <select
          className="bg-background h-9 rounded-md border px-2 text-sm"
          value={device}
          onChange={(event) => setDevice(event.target.value as Device)}
        >
          {Object.keys(deviceSizes).map((name) => (
            <option key={name} value={name}>
              {name}
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
        <button aria-label="Zoom to fit" className="hover:bg-muted rounded-md p-2" onClick={zoomToFit}>
          <Maximize className="size-4" />
        </button>
        <span className="text-muted-foreground w-12 text-right text-xs">{Math.round(zoom * 100)}%</span>
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
                style={{left: artboard.x, top: artboard.y, width: size.width, height: size.height + 44}}
              >
                <div
                  className="bg-background flex h-11 cursor-grab items-center justify-between border-b px-4 text-sm font-medium active:cursor-grabbing"
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
                  onDoubleClick={() => onEdit(artboard.id)}
                >
                  <span>{artboard.name}</span>
                  <span className="text-muted-foreground capitalize">{artboard.device}</span>
                </div>
                <DeviceFrame width={size.width} height={size.height}>
                  <Render config={playgroundConfig} data={artboard.data} />
                </DeviceFrame>
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
}: {
  artboard: Artboard
  onBack: () => void
  onChange: (data: Data) => void
  onDeviceChange: (device: Device) => void
}) {
  return (
    <div className="h-full">
      <Puck
        key={`${artboard.id}-${artboard.device}`}
        config={playgroundConfig}
        data={artboard.data}
        onChange={onChange}
        headerTitle={artboard.name}
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
          } as never
        }
        renderHeader={({children}) => (
          <header className="bg-background flex min-h-12 items-center gap-3 border-b px-3">
            <button className="hover:bg-muted flex items-center gap-1 rounded-md px-2 py-1.5 text-sm" onClick={onBack}>
              <ArrowLeft className="size-4" /> Board
            </button>
            <strong className="mr-auto text-sm">{artboard.name}</strong>
            <select
              aria-label="Device viewport"
              className="bg-background h-8 rounded-md border px-2 text-sm"
              value={artboard.device}
              onChange={(event) => onDeviceChange(event.target.value as Device)}
            >
              {Object.keys(deviceSizes).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {children}
          </header>
        )}
      />
    </div>
  )
}

export default function App() {
  const [board, setBoard] = useState<Board>(loadBoard)
  const [editingId, setEditingId] = useState<string | null>(null)
  useEffect(() => localStorage.setItem(PLAYGROUND_BOARD_STORAGE_KEY, JSON.stringify(board)), [board])
  const editing = board.artboards.find((item) => item.id === editingId)

  if (editing) {
    return (
      <EditorView
        artboard={editing}
        onBack={() => setEditingId(null)}
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
    )
  }
  return <BoardView board={board} setBoard={setBoard} onEdit={setEditingId} />
}
