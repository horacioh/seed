import {Plugin, PluginKey, PluginView} from 'prosemirror-state'
import {EditorView} from 'prosemirror-view'
import type {BlockNoteEditor} from '../../BlockNoteEditor'
import {BaseUiElementState} from '../../shared/BaseUiElementTypes'
import type {Block, BlockSchema} from '../Blocks/api/blockTypes'
import {createBlockDragGuardPlugin, setupDragMonitor} from './pragmatic-dnd-bridge'

type SideMenuPluginState = {
  activeBlockId?: string
}

export type SideMenuState<BSchema extends BlockSchema> = BaseUiElementState & {
  block: Block<BSchema>
  lineHeight: string
}

/**
 * PluginView that wires up the pragmatic drag-and-drop monitor for the editor.
 *
 * The side menu normally derives from FullBlockSelection; `activeBlockId` carries
 * the explicit target when Alt-F10 opens it from the editor selection.
 */
class SideMenuDragView<BSchema extends BlockSchema> implements PluginView {
  private monitorCleanup?: () => void

  constructor(editor: BlockNoteEditor<BSchema>, pmView: EditorView) {
    if (editor.dragStateManager && editor.editorDragId) {
      this.monitorCleanup = setupDragMonitor(
        pmView.dom as HTMLElement,
        editor,
        editor.dragStateManager,
        editor.editorDragId,
      )
    }
  }

  destroy() {
    this.monitorCleanup?.()
  }
}

/** ProseMirror key for the side menu's active block state. */
export const sideMenuPluginKey = new PluginKey<SideMenuPluginState>('SideMenuPlugin')

export class SideMenuProsemirrorPlugin<BSchema extends BlockSchema> {
  public readonly plugin: Plugin
  public readonly blockDragGuardPlugin: Plugin

  constructor(editor: BlockNoteEditor<BSchema>) {
    this.plugin = new Plugin<SideMenuPluginState>({
      key: sideMenuPluginKey,
      state: {
        init: () => ({}),
        apply: (transaction, previousState) => {
          const activeBlockId = transaction.getMeta(sideMenuPluginKey) as string | undefined
          if (activeBlockId) return {activeBlockId}
          if (transaction.selectionSet || transaction.docChanged) return {}
          return previousState
        },
      },
      view: (editorView) => new SideMenuDragView(editor, editorView),
    })
    this.blockDragGuardPlugin = createBlockDragGuardPlugin()
  }

  /**
   * Legacy no-ops retained for callers that still reference them
   * (media-container.tsx, AddBlockButton, legacy DragHandle props).
   * Pragmatic DnD manages drags via setupBlockDraggable directly.
   */
  addBlock = () => {}
  blockDragStart = (_event: {dataTransfer: DataTransfer | null; clientX?: number; clientY: number}) => {}
  blockDragEnd = () => {}
  freezeMenu = () => {}
  unfreezeMenu = () => {}
}
