import type {HMAnnotation, HMBlockNode} from '@seed-hypermedia/client/hm-types'

/** An advisory accessibility finding tied to a persisted document block. */
export type DocumentA11yIssue = {
  blockId: string
  kind: 'image-missing-alt' | 'image-alt-is-filename' | 'empty-heading' | 'vague-link-text'
  message: string
}

const vagueLinkText = new Set(['click here', 'here', 'link', 'this link', 'read more', 'more', 'learn more'])

function getVagueLinkTexts(text: string, annotations: HMAnnotation[] = []): string[] {
  const matches: string[] = []
  for (const annotation of annotations) {
    if (annotation.type !== 'Link') continue
    annotation.starts.forEach((start, index) => {
      const end = annotation.ends[index]
      if (end === undefined) return
      const linkText = text.slice(start, end).trim()
      if (vagueLinkText.has(linkText.toLowerCase())) matches.push(linkText)
    })
  }
  return matches
}

/**
 * Finds advisory accessibility issues in a document's persisted HM blocks.
 * The check uses image alt text stored in block text and link annotation ranges.
 */
export function checkDocumentAccessibility(blocks: HMBlockNode[]): DocumentA11yIssue[] {
  const issues: DocumentA11yIssue[] = []
  let imageOrdinal = 0
  let headingOrdinal = 0

  const visit = (nodes: HMBlockNode[]) => {
    for (const node of nodes) {
      const block = node.block
      if (block.type === 'Image') {
        imageOrdinal += 1
        const alt = block.text.trim()
        const fileName = (block.attributes.name ?? '').trim()
        if (!alt) {
          issues.push({
            blockId: block.id,
            kind: 'image-missing-alt',
            message: `Image ${imageOrdinal}: add alt text${fileName ? ` (${fileName})` : ''}`,
          })
        } else if (alt.toLowerCase() === fileName.toLowerCase()) {
          issues.push({
            blockId: block.id,
            kind: 'image-alt-is-filename',
            message: fileName
              ? `Image ${imageOrdinal}: replace filename "${fileName}" with descriptive alt text`
              : `Image ${imageOrdinal}: replace filename alt text with a description`,
          })
        }
      } else if (block.type === 'Heading') {
        headingOrdinal += 1
        if (!block.text.trim()) {
          issues.push({
            blockId: block.id,
            kind: 'empty-heading',
            message: `Heading ${headingOrdinal} is empty`,
          })
        }
      }

      if ('text' in block && typeof block.text === 'string' && 'annotations' in block) {
        for (const linkText of getVagueLinkTexts(block.text, block.annotations ?? [])) {
          issues.push({
            blockId: block.id,
            kind: 'vague-link-text',
            message: `Link "${linkText}" needs descriptive text`,
          })
        }
      }

      if (node.children?.length) visit(node.children)
    }
  }

  visit(blocks)
  return issues
}
