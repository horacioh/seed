import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'

const HOME = 'hm://z6Mkvz9TgGtv9zsGsdrksfNk1ajbFancgHREJEz3Y2HsAVdk'
let n = 0
const b = (block: Record<string, unknown>, children?: HMBlockNode[]): HMBlockNode =>
  ({
    block: {id: `demo-${++n}`, text: '', annotations: [], attributes: {}, ...block},
    ...(children ? {children} : {}),
  }) as unknown as HMBlockNode
const p = (text: string, annotations: unknown[] = [], children?: HMBlockNode[]) =>
  b({type: 'Paragraph', text, annotations}, children)

/** `?id=demo`: a local document with every block type the spike renders. */
export const demoDocument: HMBlockNode[] = [
  b({type: 'Heading', text: 'CodeMirror live preview', attributes: {childrenType: 'Group'}}, [
    p('Bold, italic, underline, strike, code and a link, plus a mention of \uFFFC.', [
      {type: 'Bold', starts: [0], ends: [4]},
      {type: 'Italic', starts: [6], ends: [12]},
      {type: 'Underline', starts: [14], ends: [23]},
      {type: 'Strike', starts: [25], ends: [31]},
      {type: 'Code', starts: [33], ends: [37]},
      {type: 'Link', starts: [44], ends: [48], link: 'https://seed.hyper.media'},
      {type: 'Embed', starts: [68], ends: [69], link: HOME, attributes: {mentionKind: 'account'}},
    ]),
  ]),
  b({type: 'Paragraph', text: 'A bulleted list', attributes: {childrenType: 'Unordered'}}, [
    p('first item'),
    b({type: 'Paragraph', text: 'second item with ordered children', attributes: {childrenType: 'Ordered'}}, [
      p('one'),
      p('two'),
    ]),
  ]),
  b({type: 'Paragraph', text: 'A quote', attributes: {childrenType: 'Blockquote'}}, [
    p('Schema changes must never break rendering.'),
  ]),
  b({type: 'Code', text: 'const editor = new EditorView({state})', attributes: {language: 'typescript'}}),
  b({type: 'Math', text: 'e = mc^2'}),
  b({
    type: 'Image',
    text: 'An image from IPFS, 320px wide',
    link: 'ipfs://bafkreid5t7kjcw4m2uqblfhin6rtwksxm5bmv6gmurkuxpqfzmdpaj4wc4',
    attributes: {width: '320', name: 'seed.png'},
  }),
  b({type: 'Video', link: 'https://www.youtube.com/embed/dQw4w9WgXcQ', attributes: {width: '560'}}),
  b({type: 'Embed', link: HOME, attributes: {view: 'Card'}}),
  b({type: 'Embed', link: HOME, attributes: {view: 'Content'}}),
  b({type: 'Button', text: 'Visit Seed', link: 'https://seed.hyper.media', attributes: {alignment: 'flex-start'}}),
  b({
    type: 'File',
    link: 'ipfs://bafkreiaogsqzvi5dr5puss3rlwajzl4vp2nmihsw67hupplyclwltzjl74',
    attributes: {name: 'whitepaper.pdf', size: '1024'},
  }),
  b({type: 'WebEmbed', link: 'https://x.com/seedhypermedia/status/1'}),
  b({type: 'FancyFutureBlock', text: 'An unknown block type still shows its text', attributes: {futureAttr: 1}}, [
    p('and its children'),
  ]),
]
