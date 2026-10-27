import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {describe, expect, it} from 'vitest'
import {checkDocumentAccessibility} from './document-accessibility'

const node = (id: string, block: Record<string, any>, children?: HMBlockNode[]): HMBlockNode =>
  ({block: {id, ...block}, children}) as HMBlockNode

describe('checkDocumentAccessibility', () => {
  it('identifies image, heading, and link findings with document-wide ordinals', () => {
    const issues = checkDocumentAccessibility([
      node('heading-one', {type: 'Heading', text: 'Introduction', attributes: {}}),
      node('image-one', {type: 'Image', text: 'A flower', attributes: {name: 'flower.jpg'}}),
      node('parent', {type: 'Paragraph', text: 'Parent'}, [
        node('image-two', {type: 'Image', text: '', attributes: {name: 'portrait.png'}}),
        node('heading-two', {type: 'Heading', text: 'Details', attributes: {}}),
      ]),
      node('empty-heading', {type: 'Heading', text: '  ', attributes: {}}),
      node('filename-image', {type: 'Image', text: 'camera.png', attributes: {name: 'camera.png'}}),
      node('vague-link', {
        type: 'Paragraph',
        text: 'click here',
        annotations: [{type: 'Link', starts: [0], ends: ['click here'.length], link: 'https://example.com'}],
      }),
    ])

    expect(issues).toEqual([
      {blockId: 'image-two', kind: 'image-missing-alt', message: 'Image 2: add alt text (portrait.png)'},
      {blockId: 'empty-heading', kind: 'empty-heading', message: 'Heading 3 is empty'},
      {
        blockId: 'filename-image',
        kind: 'image-alt-is-filename',
        message: 'Image 3: replace filename "camera.png" with descriptive alt text',
      },
      {blockId: 'vague-link', kind: 'vague-link-text', message: 'Link "click here" needs descriptive text'},
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

    expect(issues).toEqual(
      vagueTexts.map((text, index) => ({
        blockId: `vague-${index}`,
        kind: 'vague-link-text',
        message: `Link "${text.trim()}" needs descriptive text`,
      })),
    )
  })

  it('flags uploaded videos without captions using an ordinal among video blocks', () => {
    const issues = checkDocumentAccessibility([
      node('video-one', {type: 'Video', text: '', link: 'ipfs://video-one', attributes: {}}),
      node('video-embed', {type: 'Video', text: '', link: 'https://youtube.com/embed/abc', attributes: {}}),
      node('video-captioned', {
        type: 'Video',
        text: '',
        link: 'ipfs://video-captioned',
        attributes: {captions: 'ipfs://captions'},
      }),
      node('video-four', {type: 'Video', text: '', link: 'ipfs://video-four', attributes: {}}),
    ])

    expect(issues).toEqual([
      {blockId: 'video-one', kind: 'video-missing-captions', message: 'Video 1: add captions'},
      {blockId: 'video-four', kind: 'video-missing-captions', message: 'Video 4: add captions'},
    ])
  })
})
