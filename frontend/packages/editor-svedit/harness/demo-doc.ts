import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'

const UID = 'z6Mkvz9TgGtv9zsGsdrksfNk1ajbFancgHREJEz3Y2HsAVdk'
const p = (id: string, text: string, extra: Record<string, unknown> = {}, children?: HMBlockNode[]): HMBlockNode =>
  ({
    block: {type: 'Paragraph', id, text, annotations: [], attributes: {}, ...extra},
    ...(children ? {children} : {}),
  }) as HMBlockNode

/** `?id=demo`: a local document exercising every minimum feature, with embeds of real public documents. */
export const demoDocument: HMBlockNode[] = [
  {
    block: {type: 'Heading', id: 'demo-h1', text: 'Svedit spike demo', annotations: [], attributes: {}},
    children: [
      p('demo-p1', 'Bold, italic, underline, strike, code and a link 😀 survive as HM annotations.', {
        annotations: [
          {type: 'Bold', starts: [0], ends: [4]},
          {type: 'Italic', starts: [6], ends: [12]},
          {type: 'Underline', starts: [14], ends: [23]},
          {type: 'Strike', starts: [25], ends: [31]},
          {type: 'Code', starts: [33], ends: [37]},
          {type: 'Link', starts: [44], ends: [48], link: 'https://seed.hyper.media'},
        ],
      }),
      p('demo-p2', 'Mentions: \uFFFC wrote \uFFFC.', {
        annotations: [
          {type: 'Embed', starts: [10], ends: [11], link: `hm://${UID}`},
          {type: 'Embed', starts: [18], ends: [19], link: `hm://${UID}/projects/seed-hypermedia`},
        ],
      }),
    ],
  } as HMBlockNode,
  {
    block: {
      type: 'Heading',
      id: 'demo-h2',
      text: 'Lists keep their childrenType',
      annotations: [],
      attributes: {childrenType: 'Unordered'},
    },
    children: [
      p('demo-u1', 'Unordered item'),
      p('demo-u2', 'Item with an ordered sublist', {attributes: {childrenType: 'Ordered'}}, [
        p('demo-o1', 'First'),
        p('demo-o2', 'Second'),
      ]),
      p('demo-u3', 'A quote follows', {attributes: {childrenType: 'Blockquote'}}, [
        p('demo-q1', 'Never delete what you do not understand.'),
      ]),
    ],
  } as HMBlockNode,
  {
    block: {type: 'Heading', id: 'demo-h3', text: 'Embeds', annotations: [], attributes: {}},
    children: [
      {
        block: {
          type: 'Embed',
          id: 'demo-e1',
          text: '',
          link: `hm://${UID}/projects/seed-hypermedia`,
          annotations: [],
          attributes: {view: 'Card'},
        },
      },
      {
        block: {
          type: 'Embed',
          id: 'demo-e2',
          text: '',
          link: `hm://${UID}/projects/seed-hypermedia/weekly-review-june-17-23-2026`,
          annotations: [],
          attributes: {view: 'Content'},
        },
      },
    ] as HMBlockNode[],
  } as HMBlockNode,
  {
    block: {type: 'Heading', id: 'demo-h4', text: 'Other blocks', annotations: [], attributes: {}},
    children: [
      {
        block: {
          type: 'Code',
          id: 'demo-c1',
          text: 'const adapter = sveditAdapter\nadapter.toHM(adapter.fromHM(blocks))',
          annotations: [],
          attributes: {language: 'ts'},
        },
      },
      {
        block: {
          type: 'Image',
          id: 'demo-i1',
          text: 'An Image block with caption',
          link: 'ipfs://bafkreid5t7kjcw4m2uqblfhin6rtwksxm5bmv6gmurkuxpqfzmdpaj4wc4',
          annotations: [],
          attributes: {},
        },
      },
      {block: {type: 'Math', id: 'demo-m1', text: 'e^{i\\pi} + 1 = 0', annotations: [], attributes: {}}},
      {
        block: {
          type: 'Button',
          id: 'demo-b1',
          text: 'Open Seed',
          link: 'https://seed.hyper.media',
          annotations: [],
          attributes: {},
        },
      },
      {
        block: {
          type: 'FancyFutureBlock',
          id: 'demo-x1',
          text: 'An unknown future block type renders its text and children',
          annotations: [],
          attributes: {futureAttr: 1},
        },
        children: [p('demo-x2', 'Its child, also editable')],
      },
    ] as HMBlockNode[],
  } as HMBlockNode,
]
