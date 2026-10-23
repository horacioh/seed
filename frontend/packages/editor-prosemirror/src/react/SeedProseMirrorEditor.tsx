import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import type {Node as PMNode} from 'prosemirror-model'
import type {EditorState} from 'prosemirror-state'
import {EditorView, type NodeView, type NodeViewConstructor} from 'prosemirror-view'
import {
  createContext,
  type ComponentType,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import {createPortal} from 'react-dom'
import {toHM} from '../convert'
import {createSeedState} from '../editor'
import type {SuggestKeyHandler} from '../suggest'
import {SeedEditorMenus} from './menus'
import {mathNodeView, reactNodeViews} from './node-views'
import {type SeedEditorServices, SeedServicesContext} from './services'
import './style.css'

/** Props a React node view receives. */
export type ReactNodeViewProps = {
  node: PMNode
  selected: boolean
  view: EditorView
  getPos: () => number | undefined
  /** Replace some of the node's attrs (one undoable transaction). */
  setAttrs: (attrs: Record<string, unknown>) => void
}

type Portal = {key: number; dom: HTMLElement; component: ComponentType<ReactNodeViewProps>; props: ReactNodeViewProps}

/** Holds the mounted React node views so one React tree can portal into ProseMirror's DOM. */
class PortalStore {
  private portals = new Map<number, Portal>()
  private snapshot: Portal[] = []
  private listeners = new Set<() => void>()
  set(portal: Portal) {
    this.portals.set(portal.key, portal)
    this.emit()
  }
  delete(key: number) {
    this.portals.delete(key)
    this.emit()
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  getSnapshot = () => this.snapshot
  private emit() {
    this.snapshot = [...this.portals.values()]
    this.listeners.forEach((l) => l())
  }
}

let nextPortalKey = 0

/** A `NodeViewConstructor` that renders `component` into a portal. */
function reactNodeView(store: PortalStore, component: ComponentType<ReactNodeViewProps>): NodeViewConstructor {
  return (initialNode, view, getPos) => {
    const key = nextPortalKey++
    const dom = document.createElement(initialNode.isInline ? 'span' : 'div')
    dom.className = 'seed-node-view'
    let props: ReactNodeViewProps = {
      node: initialNode,
      selected: false,
      view,
      getPos,
      setAttrs: (attrs) => {
        const pos = getPos()
        if (pos == null) return
        view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, {...props.node.attrs, ...attrs}))
      },
    }
    const render = (patch: Partial<ReactNodeViewProps>) => {
      props = {...props, ...patch}
      store.set({key, dom, component, props})
    }
    render({})
    const nodeView: NodeView = {
      dom,
      update(node) {
        if (node.type !== props.node.type) return false
        if (node !== props.node) render({node})
        return true
      },
      selectNode: () => render({selected: true}),
      deselectNode: () => render({selected: false}),
      // Inputs and buttons inside the view handle their own events.
      stopEvent: (event) => {
        const target = event.target as HTMLElement
        return Boolean(target.closest?.('input, button, textarea, select, video, iframe, a, [data-stop-event]'))
      },
      ignoreMutation: () => true,
      destroy: () => store.delete(key),
    }
    return nodeView
  }
}

const EditorViewContext = createContext<{view: EditorView | null; state: EditorState | null}>({view: null, state: null})

/** The editor view and its latest state; re-renders on every transaction. Menus use this. */
export function useEditorView() {
  return useContext(EditorViewContext)
}

/** Props for {@link SeedProseMirrorEditor}. */
export type SeedProseMirrorEditorProps = {
  /** The document content to load, as published (HM blocks). */
  initialContent: HMBlockNode[]
  /** Called with the HM blocks after every document change. */
  onChange?: (blocks: HMBlockNode[]) => void
  /** Search, loading and upload services (see {@link SeedEditorServices}). */
  services: SeedEditorServices
  /** Receives the ProseMirror view once created (tests, devtools). */
  onView?: (view: EditorView) => void
}

/** A Seed document editor built directly on ProseMirror. Mount with a `key` to reload content. */
export function SeedProseMirrorEditor({initialContent, onChange, services, onView}: SeedProseMirrorEditorProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const store = useMemo(() => new PortalStore(), [])
  const portals = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const suggestKeys = useRef<SuggestKeyHandler | null>(null)
  const [ctx, setCtx] = useState<{view: EditorView | null; state: EditorState | null}>({view: null, state: null})
  const latest = useRef({onChange, services})
  latest.current = {onChange, services}

  useLayoutEffect(() => {
    const state = createSeedState(initialContent, {
      uploadFile: (file) => latest.current.services.uploadFile(file),
      suggestKeys,
    })
    const nodeViews: Record<string, NodeViewConstructor> = {hmMath: mathNodeView}
    for (const [name, component] of Object.entries(reactNodeViews)) nodeViews[name] = reactNodeView(store, component)
    const view: EditorView = new EditorView(mountRef.current, {
      state,
      nodeViews,
      attributes: {class: 'seed-pm-content', 'data-testid': 'prosemirror-editor', spellcheck: 'false'},
      dispatchTransaction(tr) {
        const next = view.state.apply(tr)
        view.updateState(next)
        setCtx({view, state: next})
        if (tr.docChanged) latest.current.onChange?.(toHM(next.doc))
      },
    })
    setCtx({view, state})
    onView?.(view)
    return () => view.destroy()
    // The editor owns its state after mount; parents remount it to reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SeedServicesContext.Provider value={services}>
      <EditorViewContext.Provider value={ctx}>
        <div className="seed-pm">
          <div ref={mountRef} />
          <SeedEditorMenus suggestKeys={suggestKeys} />
        </div>
        {portals.map(({key, dom, component: Component, props}) =>
          createPortal(<Component {...props} />, dom, String(key)),
        )}
      </EditorViewContext.Provider>
    </SeedServicesContext.Provider>
  )
}
