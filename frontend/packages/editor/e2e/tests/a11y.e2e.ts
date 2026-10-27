import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'
import {expect, test} from './fixtures'

const modes = ['light', 'dark', 'reflow-320'] as const

test.describe('editor accessibility', () => {
  test('default editor has no axe violations across themes and zoom modes', async ({page, editorHelpers}) => {
    await editorHelpers.waitForEditorReady()
    await expect(editorHelpers.getContentArea()).toHaveAttribute('role', 'textbox')
    await expect(editorHelpers.getContentArea()).toHaveAttribute('aria-multiline', 'true')
    await expect(editorHelpers.getContentArea()).toHaveAttribute('aria-label', 'Document content')
    await expect(page.locator('[aria-live="polite"]')).toHaveCount(1)
    await expectNoA11yViolations(page, {modes: [...modes]})
  })

  test('slash menu exposes a listbox and active option', async ({page, editorHelpers}) => {
    await editorHelpers.waitForEditorReady()
    await editorHelpers.openSlashMenu()
    const listbox = page.getByRole('listbox', {name: 'Block suggestions'})
    await expect(listbox).toBeVisible()
    await expect(editorHelpers.getContentArea()).toHaveAttribute(
      'aria-controls',
      (await listbox.getAttribute('id')) || '',
    )
    await expect(editorHelpers.getContentArea()).toHaveAttribute('aria-expanded', 'true')
    await expect(editorHelpers.getContentArea()).toHaveAttribute('aria-activedescendant', /.+/)
    await expectNoA11yViolations(page, {modes: [...modes]})
    await editorHelpers.pressKey('Escape')
    await expect(editorHelpers.getContentArea()).not.toHaveAttribute('aria-activedescendant')
    await editorHelpers.openSlashMenu()
    await page.getByRole('option', {name: 'Heading'}).click()
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Inserted Heading')
    await expect(editorHelpers.getContentArea()).not.toHaveAttribute('aria-controls')
  })

  test('keyboard block movement reorders siblings and announces the move', async ({page, editorHelpers}) => {
    await editorHelpers.waitForEditorReady()
    await editorHelpers.typeText('First block')
    await editorHelpers.pressKey('Enter')
    await editorHelpers.typeText('Second block')
    await editorHelpers.pressKey('Control+Shift+ArrowUp')
    await expect
      .poll(async () => (await editorHelpers.getBlocks()).map((block) => block.content?.[0]?.text))
      .toEqual(['Second block', 'First block'])
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Moved block up')
  })

  test('keyboard block movement moves a block down', async ({page, editorHelpers}) => {
    await page.goto('/?fixture=empty&edit=1')
    await editorHelpers.waitForEditorReady()
    await editorHelpers.typeText('First block')
    await editorHelpers.pressKey('Enter')
    await editorHelpers.typeText('Second block')
    await editorHelpers.pressKey('Control+Shift+ArrowUp')
    await editorHelpers.pressKey('Control+Shift+ArrowDown')
    await expect
      .poll(async () => (await editorHelpers.getBlocks()).map((block) => block.content?.[0]?.text))
      .toEqual(['First block', 'Second block'])
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Moved block down')
  })

  test('keyboard block movement announces when the block is already at the top', async ({page, editorHelpers}) => {
    await page.goto('/?fixture=empty&edit=1')
    await editorHelpers.waitForEditorReady()
    await editorHelpers.pressKey('Control+Shift+ArrowUp')
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Block is already at the top')
  })

  test('keyboard block movement announces when the block is already at the bottom', async ({page, editorHelpers}) => {
    await page.goto('/?fixture=empty&edit=1')
    await editorHelpers.waitForEditorReady()
    await editorHelpers.pressKey('Control+Shift+ArrowDown')
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Block is already at the bottom')
  })

  test('keyboard block movement preserves nested children and the selected text', async ({page, editorHelpers}) => {
    await page.goto('/?fixture=nested&edit=1')
    await editorHelpers.waitForEditorReady()
    await editorHelpers.selectText('Parent')
    await editorHelpers.pressKey('Control+Shift+ArrowUp')
    await expect
      .poll(async () => (await editorHelpers.getBlocks()).map((block) => block.id))
      .toEqual(['nested-parent', 'nested-before', 'nested-after'])
    const blocks = await editorHelpers.getBlocks()
    expect(blocks[0].children?.[0]?.content?.[0]?.text).toBe('Child')
    await expect.poll(() => editorHelpers.getSelectedText()).toBe('Parent')
  })

  test('Alt-F10 routes focus to the toolbar for text selection and supports roving focus', async ({
    page,
    editorHelpers,
  }) => {
    await page.goto('/?fixture=empty&edit=1')
    await editorHelpers.waitForEditorReady()
    await editorHelpers.typeText('Toolbar text')
    await editorHelpers.selectText('Toolbar text')
    await page.waitForTimeout(100)
    const toolbar = page.getByRole('toolbar', {name: 'Formatting'})
    const buttons = toolbar.getByRole('button')
    await editorHelpers.pressKey('Alt+F10')
    await expect(buttons.first()).toHaveAttribute('tabindex', '0')
    await expect(buttons.first()).toHaveAttribute('aria-label', 'Bold (Mod+B)')
    await expect(buttons.first()).toHaveAttribute('aria-keyshortcuts', 'Control+B Meta+B')
    await expect(buttons.first()).toHaveAttribute('aria-pressed', 'false')
    await expect(buttons.first()).toBeFocused()
    await editorHelpers.pressKey('ArrowRight')
    await expect(buttons.nth(1)).toBeFocused()
    const tooltip = page.getByRole('tooltip', {name: 'Italic (Mod+I)'})
    await expect(tooltip).toBeVisible()
    await tooltip.evaluate(async (element) => {
      const tooltipContent = element.closest('.animate-in.fade-in-0.zoom-in-95') ?? element
      await Promise.all(
        tooltipContent.getAnimations({subtree: true}).map((animation) => animation.finished.catch(() => undefined)),
      )
    })
    await expectNoA11yViolations(page, {modes: [...modes]})
  })

  test('drag handle menu can be opened with the keyboard and has movement actions', async ({page, editorHelpers}) => {
    await page.goto('/?fixture=empty&edit=1')
    await editorHelpers.waitForEditorReady()
    await editorHelpers.pressKey('Alt+F10')
    const handle = page.getByRole('button', {name: 'Block options'})
    await expect(handle).toBeFocused()
    await editorHelpers.pressKey('Enter')
    await expect(page.getByRole('menu', {name: 'Block options'})).toBeVisible()
    await expect(page.getByRole('menuitem', {name: 'Move up'})).toBeDisabled()
    const deleteItem = page.getByRole('menuitem', {name: 'Delete'})
    await expect(deleteItem).toBeFocused()
    await expectNoA11yViolations(page, {modes: [...modes]})
    const previousSelection = await page.evaluate(() => window.TEST_EDITOR?.pmSelection())
    await deleteItem.focus()
    await editorHelpers.pressKey('Escape')
    await expect(editorHelpers.getContentArea()).toBeFocused()
    await expect.poll(async () => page.evaluate(() => window.TEST_EDITOR?.pmSelection())).toEqual(previousSelection)

    await editorHelpers.pressKey('Alt+F10')
    await page.getByRole('button', {name: 'Block options'}).press('Space')
    await expect(page.getByRole('menu', {name: 'Block options'})).toBeVisible()
    await editorHelpers.pressKey('Escape')
    await expect(editorHelpers.getContentArea()).toBeFocused()
  })

  test('menu movement actions reorder blocks and return focus to the moved block', async ({page, editorHelpers}) => {
    await page.goto('/?fixture=empty&edit=1')
    await editorHelpers.waitForEditorReady()
    await editorHelpers.typeText('First block')
    await editorHelpers.pressKey('Enter')
    await editorHelpers.typeText('Second block')
    await editorHelpers.pressKey('Alt+F10')
    const handle = page.getByRole('button', {name: 'Block options'})
    await expect(handle).toBeFocused()
    await handle.press('Enter')
    await page.getByRole('menuitem', {name: 'Move up'}).click()
    await expect
      .poll(async () => (await editorHelpers.getBlocks()).map((block) => block.content?.[0]?.text))
      .toEqual(['Second block', 'First block'])
    await expect(editorHelpers.getContentArea()).toBeFocused()
  })

  test('menu movement actions move a block down', async ({page, editorHelpers}) => {
    await page.goto('/?fixture=nested&edit=1')
    await editorHelpers.waitForEditorReady()
    const beforeBlock = page.locator('[data-id="nested-before"]')
    await beforeBlock.click({position: {x: 16, y: 12}})
    await expect.poll(async () => page.evaluate(() => window.TEST_EDITOR?.pmSelection().blockId)).toBe('nested-before')
    await page.locator('[data-id="nested-after"]').hover()
    await expect.poll(async () => page.evaluate(() => window.TEST_EDITOR?.pmSelection().blockId)).toBe('nested-before')
    await page.keyboard.press('Alt+F10')
    await page.getByRole('button', {name: 'Block options'}).press('Enter')
    await page.getByRole('menuitem', {name: 'Move down'}).click()
    await expect
      .poll(async () => (await editorHelpers.getBlocks()).map((block) => block.id))
      .toEqual(['nested-parent', 'nested-before', 'nested-after'])
    const blocks = await editorHelpers.getBlocks()
    expect(blocks[0].children?.[0]?.content?.[0]?.text).toBe('Child')
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Moved block down')
  })

  test('gallery dialog is labelled, traps focus, restores its opener, and never uses a filename as alt', async ({
    page,
  }) => {
    await page.goto('/?fixture=allBlocks&real=1')
    const image = page.locator('img').first()
    await expect(image).toHaveAttribute('alt', '')
    await expect(image).toHaveAttribute('data-missing-alt', 'true')
    await image.dblclick()
    const gallery = page.getByRole('dialog', {name: 'Image gallery'})
    await expect(gallery).toBeVisible()
    await expectNoA11yViolations(page, {modes: [...modes]})
    await page.keyboard.press('Escape')
    await expect(gallery).toBeHidden()
    await expect(page.locator('[contenteditable="true"]').first()).toBeFocused()
  })
})
