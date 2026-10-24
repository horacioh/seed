import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from 'lz-string'
import type {Board} from './model'

/** Compresses a board for inclusion in a URL fragment. */
export function encodeBoard(board: Board): string {
  return compressToEncodedURIComponent(JSON.stringify(board))
}

/** Decodes and validates a compressed board fragment. */
export function decodeBoard(encoded: string): Board | null {
  try {
    const decoded = decompressFromEncodedURIComponent(encoded)
    if (!decoded) return null
    const value: unknown = JSON.parse(decoded)
    if (
      !value ||
      typeof value !== 'object' ||
      (value as Board).version !== 1 ||
      !Array.isArray((value as Board).artboards)
    )
      return null
    return value as Board
  } catch {
    return null
  }
}
