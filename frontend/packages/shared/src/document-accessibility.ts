import type {HMAnnotation, HMBlockNode} from '@seed-hypermedia/client/hm-types'

/** An advisory accessibility finding tied to a persisted document block. */
export type DocumentA11yIssue = {
  blockId: string
  kind: 'image-missing-alt' | 'image-alt-is-filename' | 'empty-heading' | 'vague-link-text'
  message: string
}

const vagueLinkText = new Set(['click here', 'here', 'link', 'this link', 'read more', 'more', 'learn more'])

function getVagueLinkText(text: string, annotations: HMAnnotation[] = []): boolean {
  return annotations.some((annotation) => {
    if (annotation.type !== 'Link') return false
    return annotation.starts.some((start, index) => {
      const end = annotation.ends[index]
      if (end === undefined) return false
      return vagueLinkText.has(text.slice(start, end).trim().toLowerCase())
    })
  })
}

/**
 * Finds advisory accessibility issues in a document's persisted HM blocks.
 * The check uses image alt text stored in block text and link annotation ranges.
 */
export function checkDocumentAccessibility(blocks: HMBlockNode[]): DocumentA11yIssue[] {
  const issues: DocumentA11yIssue[] = []

  const visit = (nodes: HMBlockNode[]) => {
    for (const node of nodes) {
      const block = node.block
      if (block.type === 'Image') {
        const alt = block.text.trim()
        if (!alt) {
          issues.push({
            blockId: block.id,
            kind: 'image-missing-alt',
            message: 'Add alt text to this image.',
          })
        } else if (alt.toLowerCase() === (block.attributes.name ?? '').trim().toLowerCase()) {
          issues.push({
            blockId: block.id,
            kind: 'image-alt-is-filename',
            message: 'Replace the image filename with a description.',
          })
        }
      } else if (block.type === 'Heading' && !block.text.trim()) {
        issues.push({blockId: block.id, kind: 'empty-heading', message: 'Add text to this heading.'})
      }

      if (
        'text' in block &&
        typeof block.text === 'string' &&
        'annotations' in block &&
        getVagueLinkText(block.text, block.annotations ?? [])
      ) {
        issues.push({blockId: block.id, kind: 'vague-link-text', message: 'Use descriptive link text.'})
      }

      if (node.children?.length) visit(node.children)
    }
  }

  visit(blocks)
  return issues
}
