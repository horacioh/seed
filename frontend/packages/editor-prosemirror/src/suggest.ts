import {Plugin, PluginKey, type EditorState} from 'prosemirror-state'

/** Which menu a typed trigger opens. */
export type SuggestKind = 'account' | 'document' | 'slash'

/** An open suggestion: the trigger + query text spans `from`…`to`. */
export type SuggestMatch = {kind: SuggestKind; query: string; from: number; to: number}

const TRIGGERS: Array<[SuggestKind, RegExp]> = [
  ['account', /(?:^|\s)@([^\s@]*)$/u],
  ['document', /\[\[([^\]]*)$/u],
  ['slash', /(?:^|\s)\/(\S*)$/u],
]

/** Plugin key; `suggestPluginKey.getState(state)` is the open {@link SuggestMatch} or null. */
export const suggestPluginKey = new PluginKey<SuggestMatch | null>('seed-suggest')

function findMatch(state: EditorState, dismissedAt: number | null): SuggestMatch | null {
  const {$from, empty} = state.selection
  if (!empty || !$from.parent.isTextblock || $from.parent.type.spec.code) return null
  const before = $from.parent.textBetween(0, $from.parentOffset, undefined, '\uFFFC')
  for (const [kind, regex] of TRIGGERS) {
    const m = regex.exec(before)
    if (!m) continue
    const from = $from.pos - m[0].trimStart().length
    if (from === dismissedAt) return null
    return {kind, query: m[1] ?? '', from, to: $from.pos}
  }
  return null
}

/** Handles keys while a suggestion menu is open; returns true when it consumed the key. */
export type SuggestKeyHandler = (event: KeyboardEvent) => boolean

/**
 * Detect `@`, `[[` and `/` triggers before the cursor. The React menus read
 * the match from plugin state and register `keys.current` to take over
 * arrow/Enter/Escape while open. Escape dismisses the trigger at its position.
 */
export function createSuggestPlugin(keys: {current: SuggestKeyHandler | null}) {
  let dismissedAt: number | null = null
  return new Plugin<SuggestMatch | null>({
    key: suggestPluginKey,
    state: {
      init: () => null,
      apply: (tr, _value, _old, state) => {
        if (tr.getMeta(suggestPluginKey) === 'dismiss') dismissedAt = findMatch(state, null)?.from ?? null
        else if (dismissedAt !== null) dismissedAt = tr.mapping.map(dismissedAt)
        return findMatch(state, dismissedAt)
      },
    },
    props: {
      handleKeyDown(view, event) {
        if (!suggestPluginKey.getState(view.state)) return false
        if (event.key === 'Escape') {
          view.dispatch(view.state.tr.setMeta(suggestPluginKey, 'dismiss'))
          return true
        }
        return keys.current?.(event) ?? false
      },
    },
  })
}
