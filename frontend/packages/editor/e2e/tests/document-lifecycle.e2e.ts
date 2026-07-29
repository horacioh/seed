import {expect, Page, test} from '@playwright/test'

/**
 * Desired-behavior E2E tests for draft safety across version navigation and
 * remote sync, driven through the real documentMachine + real sync hooks +
 * real DocumentEditor (see `test-app/LifecycleTestApp.tsx`).
 *
 * These tests assert the SAFE behavior the app SHOULD have. Several are
 * expected to be RED against the current implementation — each documents a
 * known data-loss / wrong-content issue (D1–D7, see the unit test files in
 * packages/shared for the machine/hook-level halves):
 *
 * - D1: version navigation corrupts the draft's persisted merge base.
 * - D3: navigating between versions renders the wrong content (draft shown on
 *   a pinned historical version; historical snapshot shown at the latest URL).
 * - D4: a saved draft is invisible after landing on a historical-version URL.
 * - D5: an applied auto-rebase merge is not persisted to the draft store.
 * - D6: a rebase conflict silently drops the remote update and publish is not
 *   gated.
 */

const machineSend = (page: Page, event: unknown) => page.evaluate((e) => (window as any).TEST_MACHINE.send(e), event)
const machineContext = (page: Page) => page.evaluate(() => (window as any).TEST_MACHINE.context())
const machineMatches = (page: Page, state: unknown) =>
  page.evaluate((s) => (window as any).TEST_MACHINE.matches(s), state)
const draftStore = (page: Page) => page.evaluate(() => (window as any).TEST_DRAFT_STORE)

const renderedText = (page: Page) => page.getByTestId('rendered-content').innerText()

async function startEditingAndType(page: Page, text: string) {
  await machineSend(page, {type: 'edit.start'})
  const content = page.locator('[data-testid="editor-container"] .ProseMirror')
  await content.waitFor()
  await content.click()
  await page.keyboard.press('ControlOrMeta+ArrowDown')
  await page.keyboard.type(text)
  // Wait for the autosave debounce (500ms) to persist the draft and for the
  // save queue to settle (mirrors useAutoRebase waiting for draft idle).
  await expect.poll(async () => (await draftStore(page)).draft, {timeout: 5000}).not.toBeNull()
  await expect.poll(async () => machineMatches(page, {editing: {draft: 'idle'}}), {timeout: 5000}).toBe(true)
}

test.describe('scenario 1: draft with changes + navigate between versions', () => {
  test('D3: a pinned historical version renders the historical snapshot, not the draft', async ({page}) => {
    await page.goto('/?lifecycle=1&seedDraft=1')
    // The draft renders at the latest URL.
    await expect(page.getByTestId('rendered-content')).toContainText('my seeded draft edit')

    await page.getByTestId('nav-old').click()
    // A pinned historical version is immutable: it must show that snapshot.
    await expect(page.getByTestId('rendered-content')).toContainText('old version content')
    await expect(page.getByTestId('rendered-content')).not.toContainText('my seeded draft edit')
  })

  test('D1: navigating away while editing and editing again keeps the draft merge base intact', async ({page}) => {
    await page.goto('/?lifecycle=1&seedDraft=1')
    // The user is actively editing when they navigate to the old version.
    await startEditingAndType(page, ' plus more')
    await page.getByTestId('nav-old').click()
    await expect.poll(() => machineMatches(page, 'loaded'), {timeout: 5000}).toBe(true)
    await page.getByTestId('nav-latest').click()

    // The draft must still be visible after coming back...
    await expect(page.getByTestId('rendered-content')).toContainText('my seeded draft edit')

    // ...and continuing to edit must persist the draft with its ORIGINAL
    // merge base (v2-latest, with the user's touched blocks tracked), not the
    // historical snapshot viewed in between.
    await machineSend(page, {type: 'edit.start'})
    const content = page.locator('[data-testid="editor-container"] .ProseMirror')
    await content.waitFor()
    await content.click()
    await page.keyboard.press('ControlOrMeta+ArrowDown')
    await page.keyboard.type(' and more')
    await expect.poll(async () => (await draftStore(page)).writes.length, {timeout: 5000}).toBeGreaterThan(1)
    const store = await draftStore(page)
    const lastWrite = store.writes[store.writes.length - 1]
    expect(lastWrite.deps).toEqual(['v2-latest'])
    expect(JSON.stringify(lastWrite.baseBlocks)).toContain('latest version content')
    expect(JSON.stringify(lastWrite.baseBlocks)).not.toContain('old version content')
    // The blocks the user had touched before navigating must stay tracked;
    // persisting an emptied set makes future rebases treat the user's own
    // edits as untouched and silently overwrite them with remote content.
    expect(lastWrite.mineTouchedIds).toContain('b1')
  })
})

test.describe('scenario 2: no draft + navigate between versions', () => {
  test('renders the old snapshot on the old version', async ({page}) => {
    await page.goto('/?lifecycle=1')
    await expect(page.getByTestId('rendered-content')).toContainText('latest version content')
    await page.getByTestId('nav-old').click()
    await expect(page.getByTestId('rendered-content')).toContainText('old version content')
  })

  test('D3: navigating back to latest renders the latest content again', async ({page}) => {
    await page.goto('/?lifecycle=1')
    await page.getByTestId('nav-old').click()
    await expect(page.getByTestId('rendered-content')).toContainText('old version content')
    await page.getByTestId('nav-latest').click()
    // The latest URL must never keep showing the historical snapshot.
    await expect(page.getByTestId('rendered-content')).toContainText('latest version content')
  })
})

test.describe('landing on a historical version URL with a saved draft', () => {
  test('D4: the saved draft appears after navigating to latest', async ({page}) => {
    await page.goto('/?lifecycle=1&seedDraft=1&start=old')
    await expect(page.getByTestId('rendered-content')).toContainText('old version content')

    await page.getByTestId('nav-latest').click()
    // The draft exists in the store; it must not be invisible until a reload.
    await expect(page.getByTestId('rendered-content')).toContainText('my seeded draft edit')
  })
})

test.describe('scenario 3: editing with changes + a newer version syncs', () => {
  test('the remote update never replaces the draft in the editor', async ({page}) => {
    await page.goto('/?lifecycle=1&seedDraft=1')
    await startEditingAndType(page, ' while syncing')
    await page.getByTestId('remote-sync').click()

    // Local content stays; the update is only stashed for rebase.
    const ctx = await machineContext(page)
    expect(ctx.pendingRemoteVersion).toBe('v3-remote')
    expect(await page.locator('[data-testid="editor-container"] .ProseMirror').innerText()).toContain('while syncing')
  })

  test('D5: an applied auto-rebase merge is persisted to the draft store', async ({page}) => {
    await page.goto('/?lifecycle=1&seedDraft=1')
    await startEditingAndType(page, ' before merge')
    await page.getByTestId('remote-sync').click()

    // The auto-rebase layer applies a clean merge.
    await page.evaluate(() => {
      const w = window as any
      w.TEST_MACHINE.send({
        type: 'rebase.apply',
        mergedBlocks: w.TEST_LIFECYCLE_DOCS.remoteDoc.content,
        newDocument: w.TEST_LIFECYCLE_DOCS.remoteDoc,
      })
    })

    // Without any further typing, the merged result + new deps must reach the
    // draft store; otherwise closing the app reverts the merge the user saw.
    await expect.poll(async () => (await draftStore(page)).draft.deps, {timeout: 3000}).toEqual(['v3-remote'])
    const ctx = await machineContext(page)
    expect(ctx.deps).toEqual(['v3-remote'])
  })

  test('D6: a conflicting remote update is tracked, kept, and gates publish', async ({page}) => {
    await page.goto('/?lifecycle=1&seedDraft=1')
    await startEditingAndType(page, ' conflicting edit')
    await page.getByTestId('remote-sync').click()

    // The auto-rebase layer classifies the update as a conflict.
    await machineSend(page, {type: 'rebase.detectConflict', conflictedBlockIds: ['b2'], author: 'Alice'})

    // The conflict must be tracked (not silently dropped)...
    expect(await machineMatches(page, {editing: {rebase: 'conflict'}})).toBe(true)
    const ctx = await machineContext(page)
    expect(ctx.pendingRemoteVersion).toBe('v3-remote')

    // ...and publishing over it must require an explicit resolution.
    await machineSend(page, {type: 'publish.start'})
    expect(await machineMatches(page, 'publishing')).toBe(false)
  })
})
