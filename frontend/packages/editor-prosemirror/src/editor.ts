import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {baseKeymap} from 'prosemirror-commands'
import {dropCursor} from 'prosemirror-dropcursor'
import {gapCursor} from 'prosemirror-gapcursor'
import {history} from 'prosemirror-history'
import {inputRules} from 'prosemirror-inputrules'
import {keymap} from 'prosemirror-keymap'
import {EditorState, type Plugin} from 'prosemirror-state'
import {blockIdsPlugin, seedInputRules, seedKeys} from './commands'
import {fromHM} from './convert'
import {createMediaPlugin, type UploadFile} from './media'
import {createSuggestPlugin, type SuggestKeyHandler} from './suggest'

/** Options for {@link createSeedPlugins}. */
export type SeedPluginOptions = {
  /** Stores uploaded/dropped/pasted files; defaults to a local object URL. */
  uploadFile?: UploadFile
  /** Filled by the menus to handle keys while a suggestion is open. */
  suggestKeys?: {current: SuggestKeyHandler | null}
}

/** Every plugin of the Seed editor, in priority order. All are stock ProseMirror plugins or Seed `Plugin`s. */
export function createSeedPlugins({
  uploadFile = async (file) => URL.createObjectURL(file),
  suggestKeys = {current: null},
}: SeedPluginOptions = {}): Plugin[] {
  return [
    createSuggestPlugin(suggestKeys),
    blockIdsPlugin,
    createMediaPlugin(uploadFile),
    inputRules({rules: seedInputRules}),
    keymap(seedKeys),
    keymap(baseKeymap),
    history(),
    dropCursor({color: '#0969da'}),
    gapCursor(),
  ]
}

/** A fresh editor state holding `blocks`. */
export function createSeedState(blocks: HMBlockNode[], options?: SeedPluginOptions): EditorState {
  const doc = fromHM(blocks)
  return EditorState.create({doc, schema: doc.type.schema, plugins: createSeedPlugins(options)})
}
