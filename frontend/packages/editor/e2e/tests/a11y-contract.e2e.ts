import {runEditorA11yContract, type EditorA11yContractAdapter} from '@shm/a11y-testing/playwright'
import {test} from './fixtures'

runEditorA11yContract('BlockNote', async (page): Promise<EditorA11yContractAdapter> => {
  await page.goto('/?fixture=empty&edit=1')
  const editorRoot = page.locator('[contenteditable="true"]').first()
  await editorRoot.waitFor()

  const createBlocks: EditorA11yContractAdapter['createBlocks'] = async (count, withChildren = false) => {
    await page.evaluate(
      ({count, withChildren}) => {
        const editor = window.TEST_EDITOR?.editor
        if (!editor) throw new Error('Test editor is not ready')
        const blocks = Array.from({length: count}, (_, index) => ({
          id: `a11y-contract-${index}`,
          type: 'paragraph',
          content: `Contract block ${index}`,
          ...(withChildren && index === count - 1 ? {children: [{type: 'paragraph', content: 'Contract child'}]} : {}),
        }))
        const referenceBlock = editor.topLevelBlocks[editor.topLevelBlocks.length - 1]
        const lastBlock = blocks[blocks.length - 1]
        if (!referenceBlock || !lastBlock) throw new Error('No block available for the contract setup')
        editor.insertBlocks(blocks as any, referenceBlock.id, 'after')
        editor.setTextCursorPosition(lastBlock.id, 'start')
        editor.focus()
      },
      {count, withChildren},
    )
  }

  const getBlockTexts = () =>
    page.evaluate(() => {
      const flatten = (blocks: any[]): string[] =>
        blocks.flatMap((block) => [
          (block.content ?? []).map((item: any) => item.text ?? '').join(''),
          ...flatten(block.children ?? []),
        ])
      return flatten(window.TEST_EDITOR?.getBlocks() ?? [])
    })

  const createImageBlock: EditorA11yContractAdapter['createImageBlock'] = async (alt = '') => {
    await page.evaluate((alt) => {
      const editor = window.TEST_EDITOR?.editor
      if (!editor) throw new Error('Test editor is not ready')
      const referenceBlock = editor.topLevelBlocks[editor.topLevelBlocks.length - 1]
      if (!referenceBlock) throw new Error('No block available for the contract setup')
      editor.insertBlocks(
        [
          {
            type: 'image',
            props: {url: 'https://example.com/secret-filename.png', name: 'secret-filename.png', alt},
            content: [],
          },
        ] as any,
        referenceBlock.id,
        'after',
      )
    }, alt)
    const image = page.locator('img').last()
    await image.waitFor({state: 'attached'})
    return image
  }

  return {
    page,
    editorRoot,
    createBlocks,
    getBlockTexts,
    createImageBlock,
    imageBlock: page.locator('img').last(),
    openFormattingToolbar: async () => {
      await createBlocks(1)
      await page.keyboard.type('Toolbar text')
      await page.keyboard.press('ControlOrMeta+A')
      const toolbar = page.getByRole('toolbar', {name: 'Formatting'})
      await toolbar.waitFor()
      await page.keyboard.press('Alt+F10')
      return toolbar
    },
    deleteBlockByKeyboard: async () => {
      await page.getByText('Contract block 1', {exact: true}).click()
      await page.keyboard.press('Alt+F10')
      await page.getByRole('button', {name: 'Block options'}).press('Enter')
      await page.getByRole('menuitem', {name: 'Delete'}).click()
    },
    getLiveRegion: () => page.locator('[data-editor-live-region]'),
    moveUpShortcut: 'Control+Shift+ArrowUp',
    moveDownShortcut: 'Control+Shift+ArrowDown',
    optionsShortcut: 'Alt+F10',
  }
})

test.fixme('ProseKit editor passes the shared accessibility contract', async () => {
  // The adapter is on origin/devin/1793032977-editor-adapter-kit; do not modify that branch here.
})
