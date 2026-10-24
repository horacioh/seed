import {describe, expect, it} from 'vitest'
import type {Board} from './model'
import {decodeBoard, encodeBoard, validateBoard} from './share'

const board: Board = {
  version: 1,
  artboards: [
    {
      id: 'board-1',
      name: 'Desktop',
      device: 'desktop',
      x: 0,
      y: 0,
      data: {content: [{type: 'StickyNote', props: {text: 'Hello'}}], root: {props: {}}},
    },
  ],
}

describe('share encoding', () => {
  it('round-trips board JSON', () => {
    expect(decodeBoard(encodeBoard(board))).toEqual(board)
  })

  it('rejects an invalid device', () => {
    const invalid = {...board, artboards: [{...board.artboards[0], device: 'watch'}]}
    expect(validateBoard(invalid)).toBeNull()
  })

  it('drops unknown component types recursively', () => {
    const unknown = {
      ...board,
      artboards: [
        {
          ...board.artboards[0],
          data: {
            content: [
              {type: 'UnknownBlock', props: {}},
              {type: 'StickyNote', props: {text: 'Hello', nested: [{type: 'UnknownBlock', props: {}}]}},
            ],
            root: {props: {}},
          },
        },
      ],
    }
    expect(validateBoard(unknown)?.artboards[0]?.data.content).toEqual([
      {type: 'StickyNote', props: {text: 'Hello', nested: []}},
    ])
  })

  it('rejects a non-array content value', () => {
    const invalid = {
      ...board,
      artboards: [{...board.artboards[0], data: {content: {}, root: {props: {}}}}],
    }
    expect(validateBoard(invalid)).toBeNull()
  })

  it('rejects invalid input', () => {
    expect(decodeBoard('not-a-board')).toBeNull()
  })
})
