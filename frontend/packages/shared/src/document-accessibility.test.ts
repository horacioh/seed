import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {describe, expect, it} from 'vitest'
import {checkDocumentAccessibility} from './document-accessibility'

const node = (id: string, block: Record<string, any>, children?: HMBlockNode[]): HMBlockNode =>
  ({block: {id, ...block}, children}) as HMBlockNode

describe('checkDocumentAccessibility', () => {
  it('reports missing image alt text, filename alt text, and empty headings recursively', () => {
    const issues = checkDocumentAccessibility([
      node('missing-image', {type: 'Image', text: '', attributes: {name: 'flower.jpg'}}),
      node('filename-image', {type: 'Image', text: 'flower.jpg', attributes: {name: 'flower.jpg'}}),
      node('parent', {type: 'Paragraph', text: 'Parent'}, [
        node('empty-heading', {type: 'Heading', text: '  ', attributes: {}}),
      ]),
    ])

    expect(issues).toEqual([
      {blockId: 'missing-image', kind: 'image-missing-alt', message: 'Add alt text to this image.'},
      {
        blockId: 'filename-image',
        kind: 'image-alt-is-filename',
        message: 'Replace the image filename with a description.',
      },
      {blockId: 'empty-heading', kind: 'empty-heading', message: 'Add text to this heading.'},
    ])
  })

  it('flags only trimmed, case-insensitive vague link annotation text', () => {
    const vagueTexts = ['  Click Here ', 'HERE', 'link', 'this link', 'read more', 'more', 'learn more']
    const issues = checkDocumentAccessibility([
      ...vagueTexts.map((text, index) =>
        node(`vague-${index}`, {
          type: 'Paragraph',
          text,
          annotations: [{type: 'Link', starts: [0], ends: [text.length], link: 'https://example.com'}],
        }),
      ),
      node('descriptive', {
        type: 'Paragraph',
        text: 'Read the guide',
        annotations: [{type: 'Link', starts: [0], ends: [14], link: 'https://example.com'}],
      }),
    ])

    expect(issues.map(({blockId, kind}) => ({blockId, kind}))).toEqual(
      vagueTexts.map((_, index) => ({blockId: `vague-${index}`, kind: 'vague-link-text'})),
    )
  })
})
