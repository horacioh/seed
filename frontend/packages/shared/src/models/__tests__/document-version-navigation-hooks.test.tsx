// @vitest-environment jsdom
/**
 * Desired-behavior tests for the React sync hooks that feed the document
 * machine during version navigation. The machine actor is keyed by the
 * version-independent document id (`getDocumentMachineKey`), so navigating
 * between versions reuses the same actor and relies entirely on these hooks
 * re-delivering the right events.
 *
 * These tests assert the SAFE behavior the hooks SHOULD have and are expected
 * to be RED against the current implementation:
 *
 * - D3: `useDocumentSync`'s `seenVersions` skip (added for the post-publish
 *   stale-`latest` refetch race) also swallows deliberate navigation BACK to a
 *   previously seen version, leaving the machine rendering stale content at
 *   the latest URL.
 * - D4: `useDraftResolutionSync` is one-shot; landing on a historical-version
 *   URL latches `draft.resolved {draftId: null}` and the real saved draft is
 *   never delivered when navigating to latest (draft appears lost).
 *
 * The machine-level halves of these issues are covered in
 * `document-machine-version-navigation.test.ts`.
 */
import type {HMBlockNode, HMDocument} from '@seed-hypermedia/client/hm-types'
import {createRoot, Root} from 'react-dom/client'
import {act} from 'react-dom/test-utils'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {fromPromise} from 'xstate'
import {documentMachine} from '../document-machine'
import {
  DocumentMachineProvider,
  useDocumentMachineRef,
  useDocumentSync,
  useDraftResolutionSync,
  useVersionLatestSync,
  useCapabilitySync,
  type DocumentMachineActorRef,
} from '../use-document-machine'

const mockDocumentId = {
  id: 'hm://z6Mktest/doc',
  uid: 'z6Mktest',
  path: ['doc'],
  version: null,
  blockRef: null,
  blockRange: null,
  hostname: null,
  scheme: 'hm',
} as any

const para = (id: string, text: string): HMBlockNode => ({
  block: {type: 'Paragraph', id, text, attributes: {}} as HMBlockNode['block'],
  children: [],
})

const docBase = {
  account: 'z6Mktest',
  authors: ['z6Mktest'],
  path: '/doc',
  createTime: '2025-01-01T00:00:00Z',
  updateTime: '2025-01-01T00:00:00Z',
  metadata: {name: 'Test Doc'},
  genesis: 'bafygenesis',
  visibility: 'PUBLIC',
}

const oldDoc = {...docBase, version: 'v1-old', content: [para('b1', 'old')]} as unknown as HMDocument
const latestDoc = {...docBase, version: 'v2-latest', content: [para('b1', 'latest')]} as unknown as HMDocument

const testMachine = documentMachine.provide({
  actors: {
    writeDraft: fromPromise<{id: string}, any>(async () => ({id: 'draft-123'})),
    publishDocument: fromPromise<HMDocument, any>(async () => latestDoc),
    discardDraft: fromPromise<void, any>(async () => {}),
  },
})

let container: HTMLDivElement
let root: Root
let actorRef: DocumentMachineActorRef | null = null

beforeEach(() => {
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  actorRef = null
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

type HarnessProps = {
  document: HMDocument | null
  isLatest: boolean
  canEdit: boolean
  draftResolution: {draftId: string | null; content: HMBlockNode[] | null; cursorPosition: number | null} | undefined
}

/** Mirrors DocumentBody's sync wiring: one machine actor fed by the sync hooks. */
function Harness({document, isLatest, canEdit, draftResolution}: HarnessProps) {
  actorRef = useDocumentMachineRef()
  useDocumentSync(document)
  useCapabilitySync(canEdit)
  useVersionLatestSync(isLatest)
  useDraftResolutionSync(draftResolution)
  return null
}

function renderHarness(props: HarnessProps) {
  act(() => {
    root.render(
      <DocumentMachineProvider
        machine={testMachine}
        input={{documentId: mockDocumentId, canEdit: props.canEdit} as any}
      >
        <Harness {...props} />
      </DocumentMachineProvider>,
    )
  })
}

describe('useDocumentSync across version navigation (D3)', () => {
  it('re-delivers the latest document after navigating latest → old → latest', () => {
    // Land on the latest version with no draft.
    renderHarness({
      document: latestDoc,
      isLatest: true,
      canEdit: true,
      draftResolution: {draftId: null, content: null, cursorPosition: null},
    })
    expect(actorRef!.getSnapshot().context.document?.version).toBe('v2-latest')

    // Navigate to a pinned historical version.
    renderHarness({
      document: oldDoc,
      isLatest: false,
      canEdit: false,
      draftResolution: {draftId: null, content: null, cursorPosition: null},
    })
    expect(actorRef!.getSnapshot().context.document?.version).toBe('v1-old')

    // Navigate back to latest: the machine must render the latest content
    // again. (Today the `seenVersions` skip swallows this event and the
    // machine keeps showing the historical snapshot at the latest URL.)
    renderHarness({
      document: latestDoc,
      isLatest: true,
      canEdit: true,
      draftResolution: {draftId: null, content: null, cursorPosition: null},
    })
    expect(actorRef!.getSnapshot().context.document?.version).toBe('v2-latest')
  })

  it('still ignores a stale post-publish refetch that reverts to a superseded version', () => {
    // The skip guard's legitimate purpose: after publishing v2, a lagging
    // `latest` refetch may still return v1 on the SAME route — that revert
    // must not clobber the newer document.
    renderHarness({
      document: oldDoc,
      isLatest: true,
      canEdit: true,
      draftResolution: {draftId: null, content: null, cursorPosition: null},
    })
    renderHarness({
      document: latestDoc,
      isLatest: true,
      canEdit: true,
      draftResolution: {draftId: null, content: null, cursorPosition: null},
    })
    // Stale refetch of the same (latest) route delivers the superseded v1.
    renderHarness({
      document: oldDoc,
      isLatest: true,
      canEdit: true,
      draftResolution: {draftId: null, content: null, cursorPosition: null},
    })
    expect(actorRef!.getSnapshot().context.document?.version).toBe('v2-latest')
  })
})

describe('useDraftResolutionSync across version navigation (D4)', () => {
  it('delivers the saved draft when navigating from a historical version to latest', () => {
    const draftBlocks = [para('b1', 'my draft edit')]

    // Land directly on a historical-version URL: the route layer gates the
    // draft off (`shouldUseDraftForRenderedDocument` → false), so resolution
    // settles as "no draft".
    renderHarness({
      document: oldDoc,
      isLatest: false,
      canEdit: false,
      draftResolution: {draftId: null, content: null, cursorPosition: null},
    })
    expect(actorRef!.getSnapshot().context.draftId).toBeNull()

    // Navigate to latest: the same actor is reused and the route layer now
    // resolves the real saved draft. It must reach the machine — otherwise
    // the user's draft is invisible until a full remount (perceived data loss).
    renderHarness({
      document: latestDoc,
      isLatest: true,
      canEdit: true,
      draftResolution: {draftId: 'draft-saved', content: draftBlocks, cursorPosition: null},
    })
    expect(actorRef!.getSnapshot().context.draftId).toBe('draft-saved')
    expect(actorRef!.getSnapshot().context.draftContent).toEqual(draftBlocks)
  })

  it('does not clobber a hydrated draft when a later resolution reports no draft', () => {
    const draftBlocks = [para('b1', 'my draft edit')]

    // Land on latest with a saved draft.
    renderHarness({
      document: latestDoc,
      isLatest: true,
      canEdit: true,
      draftResolution: {draftId: 'draft-saved', content: draftBlocks, cursorPosition: null},
    })
    expect(actorRef!.getSnapshot().context.draftId).toBe('draft-saved')

    // Navigate to a historical version: the route layer gates the draft off.
    // The machine must keep the draft data — the draft still exists on disk.
    renderHarness({
      document: oldDoc,
      isLatest: false,
      canEdit: false,
      draftResolution: {draftId: null, content: null, cursorPosition: null},
    })
    expect(actorRef!.getSnapshot().context.draftId).toBe('draft-saved')
    expect(actorRef!.getSnapshot().context.draftContent).toEqual(draftBlocks)
  })
})
