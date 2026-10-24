import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from 'lz-string'
import {playgroundConfig} from './registry'
import type {Board} from './model'

const allowedComponents = new Set(Object.keys(playgroundConfig.components))

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeNodes(value: unknown, depth = 0): unknown {
  if (depth > 50) return undefined
  if (Array.isArray(value))
    return value.map((item) => sanitizeNodes(item, depth + 1)).filter((item) => item !== undefined)
  if (!isRecord(value)) return value
  if (typeof value.type === 'string' && !allowedComponents.has(value.type)) return undefined
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, sanitizeNodes(item, depth + 1)] as const)
      .filter(([, item]) => item !== undefined),
  )
}

/** Validates a persisted board and removes component nodes not supported by the Playground registry. */
export function validateBoard(value: unknown): Board | null {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.artboards) || value.artboards.length > 50) {
    return null
  }
  const artboards = []
  for (const artboard of value.artboards) {
    if (
      !isRecord(artboard) ||
      typeof artboard.id !== 'string' ||
      typeof artboard.name !== 'string' ||
      !['desktop', 'laptop', 'tablet', 'mobile'].includes(String(artboard.device)) ||
      typeof artboard.x !== 'number' ||
      !Number.isFinite(artboard.x) ||
      typeof artboard.y !== 'number' ||
      !Number.isFinite(artboard.y) ||
      !isRecord(artboard.data) ||
      !Array.isArray(artboard.data.content) ||
      !isRecord(artboard.data.root)
    ) {
      return null
    }
    artboards.push({
      ...artboard,
      data: {
        ...artboard.data,
        content: sanitizeNodes(artboard.data.content),
        root: sanitizeNodes(artboard.data.root),
      },
    })
  }
  return {version: 1, artboards} as Board
}

/** Compresses a board for inclusion in a URL fragment. */
export function encodeBoard(board: Board): string {
  return compressToEncodedURIComponent(JSON.stringify(board))
}

/** Decodes and validates a compressed board fragment. */
export function decodeBoard(encoded: string): Board | null {
  try {
    const decoded = decompressFromEncodedURIComponent(encoded)
    if (!decoded) return null
    return validateBoard(JSON.parse(decoded))
  } catch {
    return null
  }
}
