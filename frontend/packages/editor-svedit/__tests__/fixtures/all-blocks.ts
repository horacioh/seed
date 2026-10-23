import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'

const b = (block: Record<string, unknown>, children?: HMBlockNode[]): HMBlockNode =>
  ({block, ...(children ? {children} : {})}) as unknown as HMBlockNode

/** One block of every type the ProseKit adapter models, plus hierarchy and formatting. */
export const allBlocks: HMBlockNode[] = [
  b({type: 'Heading', id: 'h1', text: 'Title', annotations: [], attributes: {childrenType: 'Group'}}, [
    b({
      type: 'Paragraph',
      id: 'p-format',
      text: 'bold italic under strike code link 😀 end',
      annotations: [
        {type: 'Bold', starts: [0], ends: [4]},
        {type: 'Italic', starts: [5], ends: [11]},
        {type: 'Underline', starts: [12], ends: [17]},
        {type: 'Strike', starts: [18], ends: [24]},
        {type: 'Code', starts: [25], ends: [29]},
        {type: 'Link', starts: [30], ends: [34], link: 'https://seed.hyper.media'},
        {type: 'Bold', starts: [35], ends: [36]},
      ],
      attributes: {},
    }),
    b({
      type: 'Paragraph',
      id: 'p-mentions',
      text: 'hi \uFFFC and \uFFFC',
      annotations: [
        {type: 'Embed', starts: [3], ends: [4], link: 'hm://z6MkAccount', attributes: {mentionKind: 'account'}},
        {type: 'Embed', starts: [9], ends: [10], link: 'hm://z6MkSite/a/doc', attributes: {mentionKind: 'document'}},
      ],
      attributes: {},
    }),
    b({
      type: 'Paragraph',
      id: 'p-colors',
      text: 'red bg',
      annotations: [
        {type: 'TextColor', starts: [0], ends: [3], attributes: {value: '#f00'}},
        {type: 'BackgroundColor', starts: [4], ends: [6], attributes: {value: 'yellow'}},
      ],
      attributes: {},
    }),
  ]),
  b({type: 'Paragraph', id: 'list', text: 'Lists', annotations: [], attributes: {childrenType: 'Unordered'}}, [
    b({type: 'Paragraph', id: 'li1', text: 'one', annotations: [], attributes: {childrenType: 'Ordered'}}, [
      b({type: 'Paragraph', id: 'li1a', text: 'nested', annotations: [], attributes: {}}),
    ]),
    b({type: 'Paragraph', id: 'li2', text: 'two', annotations: [], attributes: {}}),
  ]),
  b({type: 'Paragraph', id: 'quote', text: 'Quote', annotations: [], attributes: {childrenType: 'Blockquote'}}, [
    b({type: 'Paragraph', id: 'q1', text: 'quoted', annotations: [], attributes: {}}),
  ]),
  b({type: 'Code', id: 'code', text: 'const a = 1\nconst b = 2', attributes: {language: 'typescript'}}),
  b({type: 'Math', id: 'math', text: 'e = mc^2', attributes: {}}),
  b({type: 'Image', id: 'img', text: 'caption', link: 'ipfs://bafyimage', attributes: {width: '400', name: 'a.png'}}),
  b({type: 'Video', id: 'vid', text: '', link: 'ipfs://bafyvideo', attributes: {name: 'v.mp4'}}),
  b({type: 'File', id: 'file', text: '', link: 'ipfs://bafyfile', attributes: {name: 'f.pdf', size: '1234'}}),
  b({type: 'Button', id: 'btn', text: 'Click', link: 'https://example.com', attributes: {alignment: 'center'}}),
  b({type: 'Embed', id: 'emb-content', text: '', link: 'hm://z6MkSite/doc', attributes: {view: 'Content'}}),
  b({type: 'Embed', id: 'emb-card', text: '', link: 'hm://z6MkSite/doc', attributes: {view: 'Card'}}),
  b({type: 'WebEmbed', id: 'web', text: '', link: 'https://x.com/status/1', attributes: {}}),
  b({
    type: 'Query',
    id: 'query',
    text: '',
    attributes: {style: 'Card', columnCount: 2, query: {includes: [{space: 'z6MkSite', path: '', mode: 'Children'}]}},
  }),
]
