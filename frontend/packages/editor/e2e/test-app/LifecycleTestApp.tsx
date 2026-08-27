import '@/blocknote/core/style.css'
import '@/editor.css'
import '@shm/ui/hm-prose.css'
import type {HMBlockNode, HMDocument} from '@seed-hypermedia/client/hm-types'
import {UniversalAppProvider, writeableStateStream} from '@shm/shared'
import {documentMachine, type WriteDraftInput} from '@shm/shared/models/document-machine'
import {
  DocumentMachineProvider,
  selectRenderableBlocks,
  useDocumentMachineRef,
  useCapabilitySync,
  useDocumentSync,
  useDraftResolutionSync,
  useVersionLatestSync,
} from '@shm/shared/models/use-document-machine'
import {NavContextProvider} from '@shm/shared/utils/navigation'
import {TooltipProvider} from '@shm/ui/tooltip'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useSelector} from '@xstate/react'
import {useEffect, useState} from 'react'
import {fromPromise} from 'xstate'
import {DocumentEditor} from '../../src/document-editor'

/**
 * Document lifecycle test harness: the REAL documentMachine + the REAL sync
 * hooks (useDocumentSync / useDraftResolutionSync / useVersionLatestSync /
 * useCapabilitySync) + the REAL DocumentEditor, wired exactly like
 * resource-page-common's DocumentBody — but with an in-memory draft store and
 * simulated route/version navigation, so Playwright can exercise the draft
 * data-loss scenarios end-to-end without a daemon.
 *
 * Enabled via `?lifecycle=1`. Optional params:
 * - `start=old`   — land on the pinned historical version URL.
 * - `seedDraft=1` — pre-populate the draft store with a saved draft (as if a
 *                   previous session had edited the latest version).
 */

const [, navStateStream] = writeableStateStream<any>({routes: [], routeIndex: 0, lastAction: 'push'})
const navContext = {state: navStateStream, dispatch: () => {}} as any

const queryClient = new QueryClient({
  defaultOptions: {queries: {retry: false, refetchOnWindowFocus: false, staleTime: Infinity}},
})

const universalClient = {
  request: async () => null,
  publish: async () => ({cids: []}),
}

const docId = {
  id: 'hm://bafy-doc-uid/doc',
  uid: 'bafy-doc-uid',
  path: ['doc'],
  version: null,
  blockRef: null,
  blockRange: null,
  hostname: null,
  scheme: 'hm',
} as any

const hmPara = (id: string, text: string): HMBlockNode =>
  ({
    block: {type: 'Paragraph', id, text, annotations: [], attributes: {}},
    children: [],
  }) as any

const docBase = {
  account: 'bafy-doc-uid',
  authors: ['bafy-doc-uid'],
  path: '/doc',
  createTime: '2025-01-01T00:00:00Z',
  updateTime: '2025-01-01T00:00:00Z',
  metadata: {name: 'Lifecycle Doc'},
  genesis: 'bafygenesis',
  visibility: 'PUBLIC',
}

/** The pinned historical version of the document. */
const oldDoc = {
  ...docBase,
  version: 'v1-old',
  content: [hmPara('b1', 'old version content'), hmPara('b2', 'old second paragraph')],
} as unknown as HMDocument

/** The current latest version. */
const latestDoc = {
  ...docBase,
  version: 'v2-latest',
  content: [hmPara('b1', 'latest version content'), hmPara('b2', 'latest second paragraph')],
} as unknown as HMDocument

/** A newer version synced from another author while the user edits. */
const remoteDoc = {
  ...docBase,
  version: 'v3-remote',
  content: [hmPara('b1', 'latest version content'), hmPara('b2', 'their remote edit')],
} as unknown as HMDocument

type StoredDraft = {
  id: string
  content: unknown[] | null
  deps: string[]
  baseBlocks: HMBlockNode[] | null
  mineTouchedIds: string[]
  metadata: Record<string, unknown>
}

/**
 * In-memory stand-in for the on-disk draft file. Exposed on
 * `window.TEST_DRAFT_STORE` so tests can assert exactly what would be
 * persisted (and therefore what a reload would restore).
 */
const draftStore: {draft: StoredDraft | null; writes: WriteDraftInput[]} = {draft: null, writes: []}
;(window as any).TEST_DRAFT_STORE = draftStore
;(window as any).TEST_LIFECYCLE_DOCS = {oldDoc, latestDoc, remoteDoc}

const sp = new URLSearchParams(window.location.search)
if (sp.get('seedDraft') === '1') {
  draftStore.draft = {
    id: 'draft-seeded',
    content: [hmPara('b1', 'my seeded draft edit'), hmPara('b2', 'latest second paragraph')] as any,
    deps: ['v2-latest'],
    baseBlocks: latestDoc.content,
    mineTouchedIds: ['b1'],
    metadata: {},
  }
}

let editorAccessor: {topLevelBlocks?: unknown[]} | null = null

/** Draft writer mirroring desktop: reads the live editor blocks + machine metadata. */
const lifecycleMachine = documentMachine.provide({
  actors: {
    writeDraft: fromPromise<{id: string}, WriteDraftInput>(async ({input}) => {
      const id = input.draftId ?? 'draft-created'
      draftStore.writes.push(input)
      draftStore.draft = {
        id,
        content: (editorAccessor?.topLevelBlocks as unknown[]) ?? draftStore.draft?.content ?? null,
        deps: input.deps,
        baseBlocks: input.baseBlocks,
        mineTouchedIds: input.mineTouchedIds,
        metadata: input.metadata ?? {},
      }
      return {id}
    }),
    publishDocument: fromPromise<HMDocument, any>(async () => remoteDoc),
    discardDraft: fromPromise<void, any>(async () => {
      draftStore.draft = null
    }),
  },
})

type RouteVersion = 'latest' | 'old'

function LifecycleInner({route, syncedDoc}: {route: RouteVersion; syncedDoc: HMDocument | null}) {
  const actorRef = useDocumentMachineRef()
  const [editor, setEditor] = useState<any>(null)

  // Mirrors resource-page-common: the resolved document for the current route,
  // whether it is the latest version, and whether editing/drafts apply.
  const document = route === 'old' ? oldDoc : syncedDoc ?? latestDoc
  const isLatest = route === 'latest'
  const shouldUseDraft = isLatest // shouldUseDraftForRenderedDocument: pinned old version → false
  const effectiveCanEdit = isLatest

  useDocumentSync(document)
  useCapabilitySync(effectiveCanEdit)
  useVersionLatestSync(isLatest)
  useDraftResolutionSync(
    shouldUseDraft && draftStore.draft
      ? {
          draftId: draftStore.draft.id,
          content: draftStore.draft.content as any,
          cursorPosition: null,
          deps: draftStore.draft.deps,
          mineTouchedIds: draftStore.draft.mineTouchedIds,
          baseBlocks: draftStore.draft.baseBlocks,
        }
      : {draftId: null, content: null, cursorPosition: null},
  )

  const renderable = useSelector(actorRef, selectRenderableBlocks)
  const machineState = useSelector(actorRef, (s) => JSON.stringify(s.value))
  const isEditing = useSelector(actorRef, (s) => s.matches('editing'))

  useEffect(() => {
    if (editor) editorAccessor = editor
  }, [editor])

  useEffect(() => {
    ;(window as any).TEST_MACHINE = {
      state: () => actorRef.getSnapshot().value,
      matches: (s: any) => actorRef.getSnapshot().matches(s),
      context: () => {
        const ctx = actorRef.getSnapshot().context
        return {
          draftId: ctx.draftId,
          deps: ctx.deps,
          documentVersion: ctx.document?.version ?? null,
          publishedVersion: ctx.publishedVersion,
          pendingRemoteVersion: ctx.pendingRemoteVersion,
          isLatestVersion: ctx.isLatestVersion,
          baseBlocks: ctx.baseBlocks,
          mineTouchedIds: ctx.mineTouchedIds,
          draftContent: ctx.draftContent,
        }
      },
      send: (e: any) => actorRef.send(e),
    }
    return () => {
      ;(window as any).TEST_MACHINE = null
    }
  }, [actorRef])

  return (
    <div data-testid="lifecycle-harness">
      <div data-testid="machine-state">{machineState}</div>
      <div data-testid="rendered-content">
        {renderable.map((node) => (
          <p key={node.block.id} data-testid={`rendered-block-${node.block.id}`}>
            {'text' in node.block ? (node.block as any).text : ''}
          </p>
        ))}
      </div>
      {isEditing ? (
        <div data-testid="editor-container">
          <DocumentEditor
            blocks={[]}
            resourceId={docId}
            onEditorReady={setEditor}
            isBlockInPublishedVersion={() => true}
          />
        </div>
      ) : null}
    </div>
  )
}

export function LifecycleTestApp() {
  const [route, setRoute] = useState<RouteVersion>(sp.get('start') === 'old' ? 'old' : 'latest')
  const [syncedDoc, setSyncedDoc] = useState<HMDocument | null>(null)

  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <NavContextProvider value={navContext}>
          <UniversalAppProvider universalClient={universalClient as any} openUrl={() => {}} openRoute={() => {}}>
            <div>
              <button data-testid="nav-old" onClick={() => setRoute('old')}>
                View old version
              </button>
              <button data-testid="nav-latest" onClick={() => setRoute('latest')}>
                View latest
              </button>
              <button data-testid="remote-sync" onClick={() => setSyncedDoc(remoteDoc)}>
                Sync newer remote version
              </button>
            </div>
            <DocumentMachineProvider
              machine={lifecycleMachine}
              input={{documentId: docId, canEdit: sp.get('start') !== 'old'} as any}
            >
              <LifecycleInner route={route} syncedDoc={syncedDoc} />
            </DocumentMachineProvider>
          </UniversalAppProvider>
        </NavContextProvider>
      </QueryClientProvider>
    </TooltipProvider>
  )
}
