/**
 * How each HM block type maps onto an editor's content model. This is the
 * single list adapters consult, so adding a block type is one edit here.
 */

/**
 * - `text`: inline rich text (text + annotations), e.g. Paragraph, Heading.
 * - `code` / `math`: plain text, no annotations.
 * - `atom`: no editable inline content; the editor treats `link`, `text` and
 *   all attributes as one opaque value (media, embeds, buttons, queries).
 */
export type HMBlockKind = 'text' | 'code' | 'math' | 'atom'

/** Kind of every HM block type Seed editors model. Anything else is unknown. */
export const HM_BLOCK_KINDS: Readonly<Record<string, HMBlockKind>> = {
  Paragraph: 'text',
  Heading: 'text',
  Code: 'code',
  Math: 'math',
  Embed: 'atom',
  Image: 'atom',
  Video: 'atom',
  File: 'atom',
  Button: 'atom',
  WebEmbed: 'atom',
  Query: 'atom',
  Nostr: 'atom',
}

/**
 * Kind of an HM block type, or `unknown`. Unknown blocks must still render
 * their text and children, and keep every field they carry.
 */
export function blockKind(type: string): HMBlockKind | 'unknown' {
  return Object.hasOwn(HM_BLOCK_KINDS, type) ? HM_BLOCK_KINDS[type]! : 'unknown'
}

/**
 * Attributes an editor of this kind writes itself. `all` means the editor
 * edits the whole attribute object (atom settings forms). `childrenType` is
 * owned whenever the block has children; see `withChildrenType`.
 */
export function ownedAttributes(kind: HMBlockKind | 'unknown'): readonly string[] | 'all' {
  if (kind === 'atom') return 'all'
  if (kind === 'code') return ['language']
  return []
}

/** The `childrenType` values Seed renders. Others are preserved but shown as `Group`. */
export const CHILDREN_TYPES = ['Group', 'Ordered', 'Unordered', 'Blockquote'] as const
