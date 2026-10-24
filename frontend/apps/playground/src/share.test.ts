import {describe, expect, it} from 'vitest'
import type {Board} from './model'
import {decodeBoard, encodeBoard} from './share'

const board: Board = {version: 1, artboards: []}

describe('share encoding', () => {
  it('round-trips board JSON', () => {
    expect(decodeBoard(encodeBoard(board))).toEqual(board)
  })

  it('rejects invalid input', () => {
    expect(decodeBoard('not-a-board')).toBeNull()
  })
})
