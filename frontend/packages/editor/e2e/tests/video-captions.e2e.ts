import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'
import {fileURLToPath} from 'node:url'
import {expect, test} from './fixtures'

const validCaptionsPath = fileURLToPath(new URL('../fixtures/captions-valid.vtt', import.meta.url))
const invalidCaptionsPath = fileURLToPath(new URL('../fixtures/captions-invalid.txt', import.meta.url))

test('video captions can be added, validated, and removed accessibly', async ({page, editorHelpers}) => {
  await page.goto('/?fixture=empty&edit=1')
  await editorHelpers.waitForEditorReady()
  const videoId = await page.evaluate(() => {
    const editor = (window as any).TEST_EDITOR?.editor
    const firstBlock = editor?.topLevelBlocks?.[0]
    if (!editor || !firstBlock) throw new Error('Editor is not ready')
    Object.defineProperty(editor, 'handleFileAttachment', {
      configurable: true,
      value: async (file: File) => {
        ;(window as any).TEST_EDITOR.uploadedCaptionsFileName = file.name
        return {url: 'ipfs://captions-cid'}
      },
    })
    return editor.insertBlocks(
      [{type: 'video', props: {url: 'ipfs://video-cid', name: 'video.mp4'}}],
      firstBlock.id,
      'before',
    )[0].id
  })
  const addCaptionsButton = page.getByRole('button', {name: 'Add captions'})
  await expect(addCaptionsButton).toBeVisible()

  await page.getByRole('button', {name: 'Select video block'}).focus()
  for (let step = 0; step < 5; step += 1) {
    if (await addCaptionsButton.evaluate((button) => button === document.activeElement)) break
    await page.keyboard.press('Tab')
  }
  await expect(addCaptionsButton).toBeFocused()

  const captionsInput = page.locator(`input[data-video-captions-input][data-block-id="${videoId}"]`)
  await captionsInput.setInputFiles(invalidCaptionsPath)
  await expect(page.getByRole('alert')).toHaveText('Captions must be a WebVTT (.vtt) file')
  await expect(page.locator('[data-editor-live-region]')).toHaveText('Captions must be a WebVTT (.vtt) file')

  await captionsInput.setInputFiles(validCaptionsPath)
  await expect(page.locator('[data-editor-live-region]')).toHaveText('Captions added')
  const track = page.locator(`video track[kind="captions"]`)
  await expect(track).toHaveAttribute('src', /\S+/)
  await expect(track).toHaveAttribute('srclang', 'en')
  await expect(page.getByRole('button', {name: 'Replace captions'})).toBeVisible()
  expect(await page.evaluate(() => (window as any).TEST_EDITOR.uploadedCaptionsFileName)).toBe('captions-valid.vtt')

  await expectNoA11yViolations(page, {modes: ['light', 'dark']})

  await page.getByRole('button', {name: 'Remove captions'}).click()
  await expect(page.locator('[data-editor-live-region]')).toHaveText('Captions removed')
  await expect(page.locator(`video track[kind="captions"]`)).toHaveCount(0)
})
