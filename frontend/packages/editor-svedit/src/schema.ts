import {define_document_schema} from 'svedit'

/**
 * The Svedit document schema for Seed documents.
 *
 * Every HM block is one `hm_block` node, whatever its HM `type`: the type is
 * data (`block_type`), not schema. Svedit rejects nodes whose type is not in the
 * schema, so this is what lets unknown future block types load, render and
 * round-trip. Changing a block's type (slash menu, `# ` shortcut) is a property
 * set instead of a node replacement, so the node id (= HM block id) survives.
 *
 * - `content` is the HM `text` + modelled annotations.
 * - `children` is the HM `children` array; `children_type` the parent's
 *   `attributes.childrenType` (`''` when absent).
 * - `attributes` is the JSON of every other HM attribute.
 * - `hm_original`/`hm_baseline`/`hm_node_keys` keep the block exactly as loaded
 *   so untouched blocks serialize byte-for-byte.
 *
 * Inline formatting uses one mark type, `hm_inline`, because Svedit marks are
 * mutually exclusive while HM annotations overlap: the adapter flattens
 * overlapping Bold/Italic/Link/... into disjoint runs that each carry the full
 * set of styles. HM annotations the editor does not model become data-only
 * `hm_annotation` ranges, which Svedit keeps in place while text is edited.
 */
export const seedSchema = define_document_schema({
  hm_document: {
    kind: 'document',
    properties: {
      body: {type: 'node_array', node_types: ['hm_block'], default_node_type: 'hm_block'},
    },
  },
  hm_block: {
    kind: 'text',
    properties: {
      block_type: {type: 'string', default: 'Paragraph'},
      content: {
        type: 'text',
        mark_types: ['hm_inline'],
        annotation_types: ['hm_annotation'],
        allow_newlines: true,
      },
      children: {type: 'node_array', node_types: ['hm_block'], default_node_type: 'hm_block'},
      children_type: {type: 'string'},
      link: {type: 'string'},
      attributes: {type: 'string', default: '{}'},
      hm_original: {type: 'string'},
      hm_baseline: {type: 'string'},
      hm_node_keys: {type: 'string_array'},
    },
  },
  hm_inline: {
    kind: 'mark',
    properties: {
      styles: {type: 'string_array'},
      link: {type: 'string'},
      embed: {type: 'string'},
      embed_json: {type: 'string'},
    },
  },
  hm_annotation: {
    kind: 'annotation',
    properties: {json: {type: 'string'}},
  },
})

/** The Svedit schema type of {@link seedSchema}. */
export type SeedSchema = typeof seedSchema

/** The id of the document node every Seed Svedit document uses. */
export const DOCUMENT_ID = 'hm_document'

/** HM formatting annotation types the editor models as `hm_inline` styles. */
export const INLINE_STYLES = ['Bold', 'Italic', 'Underline', 'Strike', 'Code'] as const

/** One of {@link INLINE_STYLES}. */
export type InlineStyle = (typeof INLINE_STYLES)[number]

/** HM block types without editable inline text (rendered as cards/media). */
export const ATOM_BLOCK_TYPES = ['Embed', 'Image', 'Video', 'File', 'Button', 'WebEmbed', 'Query', 'Nostr']

/** Placeholder character an inline `Embed` annotation (mention) covers. */
export const INLINE_EMBED_CHAR = '\uFFFC'

/**
 * Map an HM block id to a Svedit node id. Svedit ids must match
 * `/^[A-Za-z_][A-Za-z0-9_-]*$/` without `__`, while HM ids may start with a
 * digit and contain `_` (e.g. `Xr_qmEGA`). Prefix with `b` and escape every
 * character outside `[A-Za-z0-9-]` as `_` + six hex digits. Reversible.
 */
export function toNodeId(hmId: string): string {
  let out = 'b'
  for (const ch of hmId) out += /[A-Za-z0-9-]/.test(ch) ? ch : '_' + ch.codePointAt(0)!.toString(16).padStart(6, '0')
  return out
}

/** Inverse of {@link toNodeId}. */
export function fromNodeId(nodeId: string): string {
  return nodeId.slice(1).replace(/_([0-9a-f]{6})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
}

/** A fresh random HM block id, in the same 8-character alphabet BlockNote uses. */
export function createBlockId(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

/** Svedit `generate_id`: every node id is the encoding of a fresh HM block id. */
export function generateNodeId(): string {
  return toNodeId(createBlockId())
}
