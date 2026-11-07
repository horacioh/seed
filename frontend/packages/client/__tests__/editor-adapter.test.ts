import {describe, expect, it} from 'vitest'
import {collectHMBlockIds, hmDocumentOperations} from '../src/editor-adapter'
import type {HMBlockNode} from '../src/hm-types'

const p = (id: string, text: string, children?: HMBlockNode[]): HMBlockNode =>
  ({
    block: {type: 'Paragraph', id, text, annotations: [], attributes: {}},
    ...(children ? {children} : {}),
  }) as HMBlockNode

describe('hmDocumentOperations', () => {
  it('produces no operations for an untouched document', () => {
    const doc = [p('a', 'one', [p('b', 'two')]), p('c', 'three')]
    expect(hmDocumentOperations(doc, structuredClone(doc))).toEqual([])
  })

  it('replaces only edited blocks and keeps their ids', () => {
    const doc = [p('a', 'one'), p('b', 'two')]
    const ops = hmDocumentOperations(doc, [p('a', 'one'), p('b', 'two!')])
    expect(ops).toEqual([{type: 'ReplaceBlock', block: expect.objectContaining({id: 'b', text: 'two!'})}])
  })

  it('creates, moves and deletes blocks by id', () => {
    const doc = [p('a', 'one'), p('b', 'two'), p('c', 'three')]
    const ops = hmDocumentOperations(doc, [p('a', 'one', [p('c', 'three')]), p('new', 'fresh')])
    expect(ops).toContainEqual({type: 'MoveBlocks', blocks: ['c'], parent: 'a'})
    expect(ops).toContainEqual({type: 'ReplaceBlock', block: expect.objectContaining({id: 'new'})})
    expect(ops).toContainEqual({type: 'DeleteBlocks', blocks: ['b']})
  })
})

describe('collectHMBlockIds', () => {
  it('walks the tree depth-first', () => {
    expect(collectHMBlockIds([p('a', '', [p('b', '')]), p('c', '')])).toEqual(['a', 'b', 'c'])
  })
})
