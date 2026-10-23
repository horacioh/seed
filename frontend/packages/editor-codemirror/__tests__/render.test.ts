import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {EditorView} from '@codemirror/view'
import {describe, expect, it} from 'vitest'
import {moveBlockTo, seedEditorExtensions, type SeedEditorServices} from '../src/editor'
import {createSeedState, toHM} from '../src/state'

const services: SeedEditorServices = {
  searchMentions: async () => [],
  loadDocument: async () => ({title: 'Embedded doc', content: []}),
  fileUrl: (link) => link.replace('ipfs://', 'https://gateway.test/ipfs/'),
}

function mount(blocks: HMBlockNode[]) {
  const parent = document.createElement('div')
  document.body.append(parent)
  return new EditorView({parent, state: createSeedState(blocks, seedEditorExtensions(services))})
}

describe('live preview', () => {
  it('renders unknown blocks with their text and children and no error', () => {
    const view = mount([
      {
        block: {type: 'FancyFutureBlock', id: 'u', text: 'future text', attributes: {x: 1}},
        children: [{block: {type: 'Paragraph', id: 'c', text: 'child', annotations: [], attributes: {}}}],
      } as unknown as HMBlockNode,
    ])
    const text = view.contentDOM.textContent
    expect(text).toContain('future text')
    expect(text).toContain('child')
    expect(view.contentDOM.querySelector('.cm-seed-badge')?.textContent).toBe('FancyFutureBlock')
    expect(text).not.toMatch(/error|unsupported/i)
    view.destroy()
  })

  it('renders media through the file gateway and video players by link kind', () => {
    const view = mount([
      {block: {type: 'Image', id: 'i', text: 'cap', link: 'ipfs://bafyimg', attributes: {width: '320'}}},
      {block: {type: 'Video', id: 'v', text: '', link: 'ipfs://bafyvid', attributes: {}}},
      {block: {type: 'Video', id: 'y', text: '', link: 'https://www.youtube.com/embed/dQw4w9WgXcQ', attributes: {}}},
      {block: {type: 'Embed', id: 'e', text: '', link: 'hm://z6MkA/doc', attributes: {view: 'Card'}}},
    ] as unknown as HMBlockNode[])
    const dom = view.contentDOM
    expect(dom.querySelector('.cm-seed-atom img')?.getAttribute('src')).toBe('https://gateway.test/ipfs/bafyimg')
    expect(dom.querySelector('.cm-seed-atom img')?.getAttribute('width')).toBe('320')
    expect(dom.querySelector('figcaption')?.textContent).toBe('cap')
    expect(dom.querySelector('video')?.getAttribute('src')).toBe('https://gateway.test/ipfs/bafyvid')
    expect(dom.querySelector('iframe')?.getAttribute('src')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(dom.querySelector('.cm-seed-atom-Embed [data-active]')?.textContent).toBe('Card')
    view.destroy()
  })

  it('pasting a YouTube URL on an empty line creates a Video block with the embed link', () => {
    const view = mount([{block: {type: 'Paragraph', id: 'p', text: '', annotations: [], attributes: {}}}])
    const event = new Event('paste', {bubbles: true, cancelable: true}) as ClipboardEvent
    Object.defineProperty(event, 'clipboardData', {
      value: {files: [], getData: () => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'},
    })
    view.contentDOM.dispatchEvent(event)
    expect(toHM(view.state)[0]!.block).toMatchObject({
      type: 'Video',
      id: 'p',
      link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
    view.destroy()
  })

  it('drag handle: shows a grip per block and moves a subtree to the drop target, keeping ids', () => {
    const p = (id: string, text: string, children?: HMBlockNode[]) =>
      ({
        block: {type: 'Paragraph', id, text, annotations: [], attributes: {}},
        ...(children ? {children} : {}),
      }) as HMBlockNode
    const view = mount([
      p('a', 'first'),
      {
        ...p('b', 'list', [p('b1', 'one'), p('b2', 'two')]),
        block: {...p('b', 'list').block, attributes: {childrenType: 'Unordered'}},
      } as unknown as HMBlockNode,
      p('c', 'last'),
    ])
    expect(view.dom.querySelectorAll('.cm-seed-grip')).toHaveLength(5)
    const ids = (nodes: HMBlockNode[]): unknown[] =>
      nodes.map((n) => (n.children ? [n.block.id, ids(n.children)] : n.block.id))
    expect(moveBlockTo(view, 3, 0)).toBe(true)
    expect(ids(toHM(view.state))).toEqual(['b2', 'a', ['b', ['b1']], 'c'])
    expect(moveBlockTo(view, 2, 5)).toBe(true)
    expect(ids(toHM(view.state))).toEqual(['b2', 'a', 'c', ['b', ['b1']]])
    expect(moveBlockTo(view, 0, 4)).toBe(true)
    expect(ids(toHM(view.state))).toEqual(['a', 'c', ['b', ['b2', 'b1']]])
    expect((toHM(view.state)[2]!.block as {attributes?: unknown}).attributes).toMatchObject({childrenType: 'Unordered'})
    expect(moveBlockTo(view, 2, 3)).toBe(false)
    view.destroy()
  })
})
