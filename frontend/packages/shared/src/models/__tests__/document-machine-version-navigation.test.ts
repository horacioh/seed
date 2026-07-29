/**
 * Desired-behavior tests for draft safety across version navigation and remote sync.
 *
 * These tests assert the SAFE behavior the machine SHOULD have. Several of them
 * are expected to be RED against the current implementation — each red test
 * documents a known data-loss / wrong-content issue (labelled D1–D7):
 *
 * - D1: navigating away from editing wipes the draft's rebase metadata
 *   (`baseBlocks`, `mineTouchedIds`), so re-entering editing adopts a wrong
 *   three-way merge base which the next autosave persists to the draft file.
 * - D2: an OLD document version arriving while editing is stashed as
 *   `pendingRemoteDocument`, so auto-rebase can merge old content into a draft.
 * - D3 (render half): with a draft present, `selectRenderableBlocks` prefers the
 *   draft even when viewing a pinned historical version.
 * - D5: an applied auto-rebase merge is never persisted until the next user edit.
 * - D6: a rebase conflict silently drops the remote update; the `conflict`
 *   state is unreachable and publish is not gated.
 * - D7: exiting editing while draft creation is in flight loses the created
 *   draft id, allowing a duplicate draft on the next edit.
 *
 * The hook-layer halves of D3/D4 (the `seenVersions` skip and the one-shot
 * draft resolution latch) are covered in
 * `document-version-navigation-hooks.test.tsx`.
 */
import {HMBlockNode, HMDocument} from '@seed-hypermedia/client/hm-types'
import {describe, expect, it, vi} from 'vitest'
import {createActor, fromPromise} from 'xstate'
import {documentMachine, DocumentMachineInput, WriteDraftInput} from '../document-machine'
import {selectRenderableBlocks} from '../use-document-machine'

const documentId = {
  id: 'hm://z6Mktest/doc',
  uid: 'z6Mktest',
  path: ['doc'],
  version: null,
  blockRef: null,
  blockRange: null,
  hostname: null,
  scheme: 'hm',
} as DocumentMachineInput['documentId']

const para = (id: string, text: string): HMBlockNode => ({
  block: {type: 'Paragraph', id, text, attributes: {}} as HMBlockNode['block'],
  children: [],
})

const oldBlocks = [para('b1', 'one (old)'), para('b2', 'two (old)')]
const latestBlocks = [para('b1', 'one (latest)'), para('b2', 'two (latest)')]
const draftBlocks = [para('b1', 'one (my draft edit)'), para('b2', 'two (latest)')]
const remoteBlocks = [para('b1', 'one (latest)'), para('b2', 'two (their edit)')]

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

const oldDoc = {...docBase, version: 'v1-old', content: oldBlocks} as unknown as HMDocument
const latestDoc = {...docBase, version: 'v2-latest', content: latestBlocks} as unknown as HMDocument
const remoteDoc = {...docBase, version: 'v3-remote', content: remoteBlocks} as unknown as HMDocument

function createTestActor(opts: {writeDraftDelayMs?: number} = {}) {
  const writeDraftSpy = vi.fn<(input: unknown) => void>()
  const machine = documentMachine.provide({
    actors: {
      writeDraft: fromPromise<{id: string}, any>(async ({input}) => {
        writeDraftSpy(input)
        if (opts.writeDraftDelayMs) await new Promise((r) => setTimeout(r, opts.writeDraftDelayMs))
        return {id: 'draft-123'}
      }),
      publishDocument: fromPromise<HMDocument, any>(async () => remoteDoc),
      discardDraft: fromPromise<void, any>(async () => {}),
    },
    delays: {autosaveTimeout: 10, saveIndicatorDismiss: 10},
  })
  const actor = createActor(machine, {input: {documentId, canEdit: true}})
  return {actor, writeDraftSpy}
}

/**
 * Loads the latest document and resolves a persisted draft based on it,
 * mirroring what `useDocumentSync` + `useDraftResolutionSync` send on desktop
 * when a saved draft file exists (with its rebase metadata: baseBlocks, deps,
 * mineTouchedIds), then enters editing.
 */
function enterEditingWithPersistedDraft(actor: ReturnType<typeof createTestActor>['actor']) {
  actor.start()
  actor.send({type: 'document.loaded', document: latestDoc})
  actor.send({
    type: 'draft.resolved',
    draftId: 'draft-existing',
    content: draftBlocks,
    cursorPosition: null,
    deps: ['v2-latest'],
    mineTouchedIds: ['b1'],
    baseBlocks: latestBlocks,
  })
  actor.send({type: 'edit.start'})
  expect(actor.getSnapshot().matches('editing')).toBe(true)
}

describe('scenario 1: draft with changes + navigate to an old version', () => {
  it('D1: leaving editing keeps the persisted draft rebase metadata (baseBlocks, mineTouchedIds)', () => {
    const {actor} = createTestActor()
    enterEditingWithPersistedDraft(actor)

    // Version navigation as it reaches the machine today: the old doc arrives
    // first (stashed while editing), then edit capability is dropped because
    // the route pins a historical version, then the latest-flag flips.
    actor.send({type: 'document.remoteUpdate', document: oldDoc})
    actor.send({type: 'capability.changed', canEdit: false})
    actor.send({type: 'version.changed', isLatest: false})

    const ctx = actor.getSnapshot().context
    expect(actor.getSnapshot().matches('loaded')).toBe(true)
    // The draft itself survives...
    expect(ctx.draftId).toBe('draft-existing')
    expect(ctx.draftContent).toEqual(draftBlocks)
    // ...and so must its merge metadata: it mirrors what is persisted in the
    // draft file, and clearing it here corrupts the next autosave.
    expect(ctx.baseBlocks).toEqual(latestBlocks)
    expect(ctx.mineTouchedIds).toEqual(['b1'])
    actor.stop()
  })

  it('D1: re-entering editing after old-version navigation must not adopt the old snapshot as merge base', () => {
    const {actor} = createTestActor()
    enterEditingWithPersistedDraft(actor)

    // Navigate to the old version (capability drop exits editing), the old doc
    // lands while in `loaded`, then navigate back to latest and edit again.
    actor.send({type: 'capability.changed', canEdit: false})
    actor.send({type: 'version.changed', isLatest: false})
    actor.send({type: 'document.remoteUpdate', document: oldDoc})
    actor.send({type: 'capability.changed', canEdit: true})
    actor.send({type: 'version.changed', isLatest: true})
    actor.send({type: 'edit.start'})

    const ctx = actor.getSnapshot().context
    expect(actor.getSnapshot().matches('editing')).toBe(true)
    // The three-way merge base must stay the draft's persisted base — never
    // the historical snapshot the user happened to view in between.
    expect(ctx.baseBlocks).toEqual(latestBlocks)
    expect(ctx.mineTouchedIds).toEqual(['b1'])
    expect(ctx.deps).toEqual(['v2-latest'])
    actor.stop()
  })

  it('D1: a draft without stored deps must not fork from a historical version on re-edit', () => {
    const {actor} = createTestActor()
    actor.start()
    actor.send({type: 'document.loaded', document: latestDoc})
    // Draft resolved without deps metadata (legacy draft file).
    actor.send({
      type: 'draft.resolved',
      draftId: 'draft-existing',
      content: draftBlocks,
      cursorPosition: null,
    })
    actor.send({type: 'edit.start'})
    actor.send({type: 'capability.changed', canEdit: false})
    actor.send({type: 'version.changed', isLatest: false})
    actor.send({type: 'document.remoteUpdate', document: oldDoc})
    actor.send({type: 'capability.changed', canEdit: true})
    actor.send({type: 'version.changed', isLatest: true})
    actor.send({type: 'edit.start'})

    // Publishing must not use the historical version as its base.
    expect(actor.getSnapshot().context.deps).not.toEqual(['v1-old'])
    actor.stop()
  })

  it('D2: an old/superseded version arriving while editing must not be stashed for rebase', () => {
    const {actor} = createTestActor()
    enterEditingWithPersistedDraft(actor)

    // The route now pins a historical version; the machine knows it is no
    // longer viewing latest. The historical doc must not become auto-rebase
    // input — otherwise old content can be merged over the draft.
    actor.send({type: 'version.changed', isLatest: false})
    actor.send({type: 'document.remoteUpdate', document: oldDoc})

    const ctx = actor.getSnapshot().context
    expect(ctx.pendingRemoteDocument).toBeNull()
    expect(ctx.pendingRemoteVersion).toBeNull()
    actor.stop()
  })

  it('D3 (render): a pinned historical version renders the historical snapshot, not the draft', () => {
    const {actor} = createTestActor()
    actor.start()
    actor.send({type: 'document.loaded', document: latestDoc})
    actor.send({
      type: 'draft.resolved',
      draftId: 'draft-existing',
      content: draftBlocks,
      cursorPosition: null,
      baseBlocks: latestBlocks,
    })
    // Navigate to the old version without ever editing.
    actor.send({type: 'version.changed', isLatest: false})
    actor.send({type: 'capability.changed', canEdit: false})
    actor.send({type: 'document.remoteUpdate', document: oldDoc})

    // Viewing a pinned historical version must show that immutable snapshot.
    expect(selectRenderableBlocks(actor.getSnapshot())).toEqual(oldBlocks)
    actor.stop()
  })
})

describe('scenario 2: no draft + navigate to an old version and back', () => {
  it('renders the old snapshot on the old version and the latest content after navigating back', () => {
    const {actor} = createTestActor()
    actor.start()
    actor.send({type: 'document.loaded', document: latestDoc})
    actor.send({type: 'draft.resolved', draftId: null, content: null, cursorPosition: null})

    actor.send({type: 'version.changed', isLatest: false})
    actor.send({type: 'capability.changed', canEdit: false})
    actor.send({type: 'document.remoteUpdate', document: oldDoc})
    expect(selectRenderableBlocks(actor.getSnapshot())).toEqual(oldBlocks)

    // Back to latest. (At the machine level this works; the hook-level
    // `seenVersions` skip that prevents this event from being re-sent is
    // covered in the hooks test file.)
    actor.send({type: 'document.remoteUpdate', document: latestDoc})
    actor.send({type: 'version.changed', isLatest: true})
    actor.send({type: 'capability.changed', canEdit: true})
    expect(selectRenderableBlocks(actor.getSnapshot())).toEqual(latestBlocks)
    expect(actor.getSnapshot().context.publishedVersion).toBe('v2-latest')
    actor.stop()
  })

  it('blocks edit.start on a historical version without a draft', () => {
    const {actor} = createTestActor()
    actor.start()
    actor.send({type: 'document.loaded', document: oldDoc})
    actor.send({type: 'draft.resolved', draftId: null, content: null, cursorPosition: null})
    actor.send({type: 'version.changed', isLatest: false})

    actor.send({type: 'edit.start'})
    expect(actor.getSnapshot().matches('loaded')).toBe(true)
    actor.stop()
  })
})

describe('scenario 3: editing with changes + a new version syncs', () => {
  it('stashes the remote update without touching the draft or the editor base', () => {
    const {actor} = createTestActor()
    enterEditingWithPersistedDraft(actor)

    actor.send({type: 'document.remoteUpdate', document: remoteDoc})

    const ctx = actor.getSnapshot().context
    expect(ctx.pendingRemoteDocument).toBe(remoteDoc)
    expect(ctx.pendingRemoteVersion).toBe('v3-remote')
    // Draft and merge base are untouched until an explicit rebase.
    expect(ctx.draftContent).toEqual(draftBlocks)
    expect(ctx.baseBlocks).toEqual(latestBlocks)
    expect(ctx.deps).toEqual(['v2-latest'])
    expect(actor.getSnapshot().matches('editing')).toBe(true)
    actor.stop()
  })

  it('D5: an applied auto-rebase merge is persisted to the draft store', async () => {
    const {actor, writeDraftSpy} = createTestActor()
    enterEditingWithPersistedDraft(actor)

    actor.send({type: 'document.remoteUpdate', document: remoteDoc})
    const merged = [para('b1', 'one (my draft edit)'), para('b2', 'two (their edit)')]
    writeDraftSpy.mockClear()
    actor.send({type: 'rebase.apply', mergedBlocks: merged, newDocument: remoteDoc})

    // The merged result + new deps/baseBlocks must reach the draft store
    // without waiting for the next user keystroke; otherwise a reload reverts
    // the merge the user already saw.
    await vi.waitFor(() => {
      expect(writeDraftSpy).toHaveBeenCalled()
    })
    const lastWrite = writeDraftSpy.mock.calls.at(-1)?.[0] as WriteDraftInput | undefined
    expect(lastWrite?.deps).toEqual(['v3-remote'])
    actor.stop()
  })

  it('D6: a detected conflict is tracked in the conflict state and keeps the remote document', () => {
    const {actor} = createTestActor()
    enterEditingWithPersistedDraft(actor)

    actor.send({type: 'document.remoteUpdate', document: remoteDoc})
    actor.send({type: 'rebase.detectConflict', conflictedBlockIds: ['b1'], author: 'Alice'})

    const snapshot = actor.getSnapshot()
    expect(snapshot.matches({editing: {rebase: 'conflict'}})).toBe(true)
    expect(snapshot.context.pendingRebase).toEqual({
      kind: 'conflict',
      conflictedBlockIds: ['b1'],
      author: 'Alice',
    })
    // The remote update must survive until the user resolves the conflict —
    // dropping it silently discards the other author's edits from view.
    expect(snapshot.context.pendingRemoteDocument).toBe(remoteDoc)
    actor.stop()
  })

  it('D6: publish is gated while a conflict is unresolved, and unblocked by rebase.dismiss', async () => {
    const {actor} = createTestActor()
    enterEditingWithPersistedDraft(actor)
    // Persist the draft so the publish guard (hasDraftId) passes.
    actor.send({type: 'change'})
    await vi.waitFor(() => {
      expect(actor.getSnapshot().matches({editing: {draft: 'idle'}})).toBe(true)
    })

    actor.send({type: 'document.remoteUpdate', document: remoteDoc})
    actor.send({type: 'rebase.detectConflict', conflictedBlockIds: ['b1'], author: 'Alice'})

    // Publishing over an unresolved conflict forks the document and can
    // clobber the other author's edits — it must require an explicit dismiss.
    actor.send({type: 'publish.start'})
    expect(actor.getSnapshot().matches('publishing')).toBe(false)

    actor.send({type: 'rebase.dismiss'})
    actor.send({type: 'publish.start'})
    expect(actor.getSnapshot().matches('publishing')).toBe(true)
    actor.stop()
  })

  it('D7: the draft id from an in-flight creation survives exiting editing', async () => {
    const {actor, writeDraftSpy} = createTestActor({writeDraftDelayMs: 50})
    actor.start()
    actor.send({type: 'document.loaded', document: latestDoc})
    actor.send({type: 'draft.resolved', draftId: null, content: null, cursorPosition: null})
    actor.send({type: 'edit.start'})
    actor.send({type: 'change'})

    // Wait for the autosave debounce to start the draft creation write...
    await vi.waitFor(() => {
      expect(writeDraftSpy).toHaveBeenCalled()
    })
    // ...then navigation to an old version drops edit capability mid-write.
    actor.send({type: 'capability.changed', canEdit: false})
    await new Promise((r) => setTimeout(r, 100))

    // The write completed in the store; the machine must know the draft id,
    // or the next edit session creates a second, orphaned draft.
    expect(actor.getSnapshot().context.draftId).toBe('draft-123')
    actor.stop()
  })
})
