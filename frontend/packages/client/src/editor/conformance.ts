/**
 * The contract tests every editor adapter must pass, independent of any test
 * runner: each case throws on failure. Run them with e.g.
 * `for (const c of adapterConformanceCases(adapter, {fixtures})) it(c.name, c.run)`.
 */

import {collectHMBlockIds, hmDocumentOperations, type EditorAdapter} from '../editor-adapter'
import type {HMBlockNode} from '../hm-types'
import {validateHMTree} from './ids'

/** One named conformance check; `run` throws when the adapter violates the contract. */
export type ConformanceCase = {name: string; run: () => void}

/**
 * Editor operations the edit-dependent cases need. Implement them with the
 * editor's real commands (not by editing HM data), so the cases test the
 * editor. Cases whose hook is missing are skipped.
 */
export interface ConformanceHooks<Doc> {
  /** Replace the whole text of the block with id `blockId` with `text`, as a user edit. */
  setBlockText?(doc: Doc, blockId: string, text: string): Doc
  /** Paste `blocks` (with their existing ids) after the block with id `afterBlockId`, through the paste path. */
  pasteBlocks?(doc: Doc, afterBlockId: string, blocks: HMBlockNode[]): Doc
}

/** Options for {@link adapterConformanceCases}. */
export type ConformanceOptions<Doc> = {
  /** Extra HM trees that must round-trip byte-for-byte (e.g. `editorFixtures`). */
  fixtures?: Record<string, HMBlockNode[]>
  /** Edit operations for the edit-dependent cases. */
  hooks?: ConformanceHooks<Doc>
}

const node = (block: Record<string, unknown>, children?: HMBlockNode[], extra?: Record<string, unknown>) =>
  ({block, ...(children ? {children} : {}), ...extra}) as unknown as HMBlockNode

/**
 * Data no editor models: an unknown block type with children, unknown block
 * keys and attributes, an unknown annotation and an unknown node key. Every
 * adapter must return it unchanged, and keep it when other blocks are edited.
 */
export const unknownDataFixture: HMBlockNode[] = [
  node({
    type: 'Paragraph',
    id: 'cf-known',
    text: 'edit me please',
    annotations: [{type: 'Highlight', starts: [0], ends: [4], attributes: {tone: 'warm'}}],
    attributes: {futureAttr: {nested: [1, 2]}},
    futureKey: 'kept',
  }),
  node(
    {
      type: 'FutureBlock',
      id: 'cf-unknown',
      text: 'unknown text',
      annotations: [{type: 'Bold', starts: [0], ends: [7]}],
      attributes: {childrenType: 'Ordered', shape: 'star'},
      revision: 3,
    },
    [node({type: 'Paragraph', id: 'cf-child', text: 'child', annotations: [], attributes: {}})],
    {futureNodeKey: true},
  ),
  node({type: 'Paragraph', id: 'cf-empty-children', text: '', annotations: [], attributes: {}}, []),
]

/** Image, file video and YouTube/Vimeo players with every media setting plus an unknown one. */
export const mediaFixture: HMBlockNode[] = [
  node({
    type: 'Image',
    id: 'cf-image',
    text: 'caption',
    link: 'ipfs://bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy',
    annotations: [],
    attributes: {width: '320', name: 'photo.png', focalPoint: [0.5, 0.5]},
  }),
  node({
    type: 'Video',
    id: 'cf-video',
    text: '',
    link: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    annotations: [],
    attributes: {width: '640', name: 'clip.mp4', autoplay: 'true', loop: 'true', muted: 'true', poster: 'x'},
  }),
  node({
    type: 'Video',
    id: 'cf-youtube',
    text: '',
    link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    annotations: [],
    attributes: {},
  }),
  node({
    type: 'Video',
    id: 'cf-vimeo',
    text: '',
    link: 'https://player.vimeo.com/video/76979871',
    annotations: [],
    attributes: {},
  }),
]

function fail(message: string, expected?: unknown, actual?: unknown): never {
  const detail =
    expected === undefined ? '' : `\nexpected: ${JSON.stringify(expected)}\nactual:   ${JSON.stringify(actual)}`
  throw new Error(message + detail)
}

function assertSameJSON(actual: unknown, expected: unknown, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(message, expected, actual)
}

function findNode(blocks: HMBlockNode[], id: string): HMBlockNode | undefined {
  for (const n of blocks) {
    if (n.block.id === id) return n
    const found = n.children && findNode(n.children, id)
    if (found) return found
  }
  return undefined
}

function assertValidTree(blocks: HMBlockNode[]) {
  const issues = validateHMTree(blocks).filter((i) => i.kind !== 'unknown-children-type')
  if (issues.length) fail(`invalid HM tree: ${JSON.stringify(issues)}`)
}

/** The conformance cases for `adapter`. */
export function adapterConformanceCases<Doc>(
  adapter: EditorAdapter<Doc>,
  options: ConformanceOptions<Doc> = {},
): ConformanceCase[] {
  const {fixtures = {}, hooks = {}} = options
  const all = {...fixtures, 'unknown data': unknownDataFixture, media: mediaFixture}
  const cases: ConformanceCase[] = []
  const roundTrip = (blocks: HMBlockNode[]) => adapter.toHM(adapter.fromHM(structuredClone(blocks)))
  for (const [name, blocks] of Object.entries(all)) {
    cases.push({
      name: `${adapter.name}: ${name} round-trips byte-for-byte`,
      run: () => assertSameJSON(roundTrip(blocks), blocks, `${name} changed on an untouched round trip`),
    })
    cases.push({
      name: `${adapter.name}: ${name} untouched load yields no operations`,
      run: () => {
        const ops = hmDocumentOperations(blocks, roundTrip(blocks))
        if (ops.length) fail(`untouched ${name} produced operations`, [], ops)
      },
    })
    cases.push({
      name: `${adapter.name}: ${name} keeps every block id`,
      run: () => {
        const out = roundTrip(blocks)
        assertValidTree(out)
        assertSameJSON(collectHMBlockIds(out), collectHMBlockIds(blocks), 'block ids changed')
      },
    })
  }
  const {setBlockText, pasteBlocks} = hooks
  if (setBlockText) {
    cases.push({
      name: `${adapter.name}: editing a block keeps its id, unknown data, and every other block`,
      run: () => {
        const input = structuredClone(unknownDataFixture)
        const out = adapter.toHM(setBlockText(adapter.fromHM(input), 'cf-known', 'edited'))
        const edited = findNode(out, 'cf-known')?.block as Record<string, any> | undefined
        if (!edited) fail('the edited block lost its id')
        if (edited.text !== 'edited') fail('the edit was not saved', 'edited', edited.text)
        assertSameJSON(
          edited.attributes,
          (unknownDataFixture[0]!.block as Record<string, unknown>).attributes,
          'unknown attributes lost',
        )
        if (edited.futureKey !== 'kept') fail('unknown block key lost', 'kept', edited.futureKey)
        assertSameJSON(out.slice(1), unknownDataFixture.slice(1), 'editing one block changed other blocks')
        const ops = hmDocumentOperations(unknownDataFixture, out)
        const touched = ops.map((op) => (op.type === 'ReplaceBlock' ? (op.block as {id: string}).id : op.type))
        assertSameJSON(touched, ['cf-known'], 'operations touch more than the edited block')
      },
    })
  }
  if (pasteBlocks) {
    cases.push({
      name: `${adapter.name}: pasted blocks get fresh, unique ids`,
      run: () => {
        const input = structuredClone(unknownDataFixture)
        const before = collectHMBlockIds(input)
        const clip = [structuredClone(unknownDataFixture[0]!), structuredClone(unknownDataFixture[2]!)]
        const out = adapter.toHM(pasteBlocks(adapter.fromHM(input), 'cf-known', clip))
        assertValidTree(out)
        const after = collectHMBlockIds(out)
        // The first pasted block may merge into the block at the cursor, so expect at least one new block.
        if (!after.some((id) => !before.includes(id))) fail('pasted blocks got no new ids', 'new ids', after)
        for (const id of before) if (!after.includes(id)) fail(`paste removed block ${id}`)
      },
    })
  }
  return cases
}
