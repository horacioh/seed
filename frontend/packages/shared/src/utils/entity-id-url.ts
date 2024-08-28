import {z} from 'zod'
import {StateStream} from './stream'

export const HYPERMEDIA_PUBLIC_WEB_GATEWAY = 'https://hyper.media'

export const HYPERMEDIA_SCHEME = 'hm'

export const HYPERMEDIA_ENTITY_TYPES = {
  d: 'Document', // the default type
  comment: 'Comment',
  draft: 'Local Draft',
} as const

export type HMEntityType = keyof typeof HYPERMEDIA_ENTITY_TYPES

export function createSiteUrl({
  path,
  hostname,
  version,
  latest,
  blockRef,
  blockRange,
}: {
  path: string[] | null | undefined
  hostname: string
  version?: string | null | undefined
  latest?: boolean
  blockRef?: string | null | undefined
  blockRange?: BlockRange | ExpandedBlockRange | null
}) {
  let res = `${hostname}/`
  if (path && path.length) {
    res += path.join('/')
  }
  const query: Record<string, string | null> = {}
  if (version) {
    query.v = version
  }
  if (latest) {
    query.l = null
  }
  res += serializeQueryString(query)
  if (blockRef) {
    res += `#${blockRef}${serializeBlockRange(blockRange)}`
  }
  return res
}

export function createWebHMUrl(
  type: keyof typeof HYPERMEDIA_ENTITY_TYPES,
  uid: string,
  {
    version,
    blockRef,
    blockRange,
    hostname,
    latest,
    path,
  }: {
    version?: string | null | undefined
    blockRef?: string | null | undefined
    blockRange?: BlockRange | ExpandedBlockRange | null
    hostname?: string | null | undefined
    latest?: boolean | null
    path?: string[] | null
  } = {},
) {
  const webPath = type === 'd' ? `/hm/${uid}` : `/hm/${type}/${uid}`
  const urlHost =
    hostname === undefined
      ? HYPERMEDIA_PUBLIC_WEB_GATEWAY
      : hostname === null
      ? ''
      : hostname
  let res = `${urlHost}${webPath}`
  if (path && path.length) {
    res += `/${path.join('/')}`
  }
  const query: Record<string, string | null> = {}
  if (version) {
    query.v = version
  }
  if (latest) {
    query.l = null
  }
  res += serializeQueryString(query)
  if (blockRef) {
    res += `#${blockRef}${serializeBlockRange(blockRange)}`
  }

  return res
}

function packBaseId(
  type: UnpackedHypermediaId['type'],
  uid: string,
  path?: string[] | null,
) {
  const restPath = path?.length ? `/${path.join('/')}` : ''
  if (type === 'd') return `${HYPERMEDIA_SCHEME}://${uid}${restPath}`
  return `${HYPERMEDIA_SCHEME}://${type}/${uid}${restPath}`
}

export function packHmId(hmId: UnpackedHypermediaId): string {
  const {type, path, version, latest, blockRef, blockRange, uid} = hmId
  if (!uid) throw new Error('uid is required')
  let responseUrl = packBaseId(type, uid, path)
  const query: Record<string, string | null> = {}
  if (version) {
    query.v = version
  }
  if (latest) {
    query.l = null
  }
  responseUrl += serializeQueryString(query)
  if (blockRef) {
    responseUrl += `#${blockRef}${serializeBlockRange(blockRange)}`
  }
  return responseUrl
}

export function hmDocId(uid: string, opts?: Parameters<typeof hmId>[2]) {
  return hmId('d', uid, opts)
}

type ParsedURL = {
  scheme: string | null
  path: string[]
  query: Record<string, string>
  fragment: string | null
}

export function parseCustomURL(url: string): ParsedURL | null {
  if (!url) return null
  const [scheme, rest] = url.split('://')
  if (!rest) return null
  const [pathAndQuery, fragment = null] = rest.split('#')
  const [path, queryString] = pathAndQuery.split('?')
  const query = new URLSearchParams(queryString)
  const queryObject = Object.fromEntries(query.entries())
  return {
    scheme,
    path: path.split('/'),
    query: queryObject,
    fragment,
  }
}

function inKeys<V extends string>(
  key: string,
  values: Record<V, string>,
): V | null {
  // TODO: change to expect-error instead
  // @ts-ignore
  if (values[key]) return key as V
  return null
}

export const unpackedHmIdSchema = z.object({
  id: z.string(),
  type: z.union([z.literal('d'), z.literal('comment'), z.literal('draft')]),
  uid: z.string(),
  path: z.array(z.string()).nullable(),
  version: z.string().nullable(),
  blockRef: z.string().nullable(),
  blockRange: z
    .object({start: z.number(), end: z.number()})
    .or(
      z.object({
        expanded: z.boolean(),
      }),
    )
    .nullable(),
  hostname: z.string().nullable(),
  scheme: z.string().nullable(),
  latest: z.boolean().nullable().optional(),
})

export type UnpackedHypermediaId = z.infer<typeof unpackedHmIdSchema>

export function hmId(
  type: keyof typeof HYPERMEDIA_ENTITY_TYPES,
  uid: string,
  opts: {
    version?: string | null
    blockRef?: string | null
    blockRange?: BlockRange | ExpandedBlockRange | null
    path?: string[] | null
    latest?: boolean | null
    hostname?: string | null
  } = {},
): UnpackedHypermediaId {
  if (!uid) throw new Error('uid is required')
  return {
    type,
    uid,
    id: packBaseId(type, uid, opts.path),
    path: opts.path || null,
    version: opts.version || null,
    blockRef: opts.blockRef || null,
    blockRange: opts.blockRange || null,
    hostname: opts.hostname || null,
    scheme: null,
    ...opts,
  }
}

export function unpackHmId(hypermediaId?: string): UnpackedHypermediaId | null {
  if (!hypermediaId) return null
  const parsed = parseCustomURL(hypermediaId)
  if (!parsed) return null
  let uidOrType
  let path: string[]
  let hostname = null
  if (parsed.scheme === 'https' || parsed.scheme === 'http') {
    if (parsed.path[1] !== 'hm') return null
    hostname = parsed.path[0]
    uidOrType = parsed.path[2]
    path = parsed.path.slice(3)
  } else if (parsed.scheme === HYPERMEDIA_SCHEME) {
    uidOrType = parsed.path[0]
    path = parsed.path.slice(1)
  } else {
    return null
  }
  let type = inKeys(uidOrType, HYPERMEDIA_ENTITY_TYPES)
  let restPath = path
  let uid
  if (type) {
    uid = path[0]
    restPath = path.slice(1)
  } else {
    uid = uidOrType
    type = 'd'
  }
  if (restPath.length === 1 && restPath[0] === '') restPath = []
  const version = parsed.query.v || null
  const latest = parsed.query.l !== undefined
  const fragment = parseFragment(parsed.fragment)

  let blockRange = null
  if (fragment) {
    if ('start' in fragment) {
      blockRange = {
        start: fragment.start,
        end: fragment.end,
      }
    } else if ('expanded' in fragment) {
      blockRange = {
        expanded: fragment.expanded,
      }
    }
  }
  return {
    id: packBaseId(type, uid, restPath),
    type,
    uid,
    path: restPath || null,
    version,
    blockRef: fragment ? fragment.blockId : null,
    blockRange,
    hostname,
    latest,
    scheme: parsed.scheme,
  }
}

export function isHypermediaScheme(url?: string) {
  return !!url?.startsWith(`${HYPERMEDIA_SCHEME}://`)
}

export function isPublicGatewayLink(text: string, gwUrl: StateStream<string>) {
  const matchesGateway = text.indexOf(gwUrl.get()) === 0
  return !!matchesGateway
}

export function idToUrl(hmId: UnpackedHypermediaId) {
  if (!hmId?.type) return null
  return createWebHMUrl(hmId.type, hmId.uid, {
    version: hmId.version,
    blockRef: hmId.blockRef,
    blockRange: hmId.blockRange,
    path: hmId.path,
    hostname: hmId.hostname,
  })
}

export function normalizeHmId(
  urlMaybe: string,
  gwUrl: StateStream<string>,
): string | undefined {
  if (isHypermediaScheme(urlMaybe)) return urlMaybe
  if (isPublicGatewayLink(urlMaybe, gwUrl)) {
    const unpacked = unpackHmId(urlMaybe)
    if (unpacked?.uid && unpacked.type) {
      return packHmId(
        hmId(unpacked.type, unpacked.uid, {
          blockRange: unpacked.blockRange,
          blockRef: unpacked.blockRef,
          version: unpacked.version,
        }),
      )
    }
    return undefined
  }
}

// TODO: migrate to existing ID functions
export function createHmDocLink_DEPRECATED({
  documentId,
  version,
  blockRef,
  blockRange,
  latest,
}: {
  documentId: string
  version?: string | null
  blockRef?: string | null
  blockRange?: BlockRange | ExpandedBlockRange | null
  latest?: boolean
}): string {
  let res = documentId
  const query: Record<string, string | null> = {}
  if (version) {
    query.v = version
  }
  if (latest) {
    query.l = null
  }
  res += serializeQueryString(query)
  if (blockRef) {
    res += `${
      !blockRef.startsWith('#') ? '#' : ''
    }${blockRef}${serializeBlockRange(blockRange)}`
  }
  return res
}

function serializeQueryString(query: Record<string, string | null>) {
  const queryString = Object.entries(query)
    .map(([key, value]) => (value === null ? key : `${key}=${value}`))
    .join('&')
  if (!queryString) return ''
  return `?${queryString}`
}

export function labelOfEntityType(type: keyof typeof HYPERMEDIA_ENTITY_TYPES) {
  return HYPERMEDIA_ENTITY_TYPES[type]
}

export function hmIdWithVersion(
  id: string | null | undefined,
  version: string | null | undefined,
  blockRef?: string | null | undefined,
  blockRange?: BlockRange | ExpandedBlockRange | null,
) {
  if (!id) return null
  const unpacked = unpackHmId(id)
  if (!unpacked) return null
  return packHmId(
    hmId(unpacked.type, unpacked.uid, {
      path: unpacked.path,
      version: version || unpacked.version,
      blockRef,
      blockRange,
    }),
  )
}

export function extractBlockRefOfUrl(
  url: string | null | undefined,
): string | null {
  const fragment = url?.match(/#(.*)$/)?.[1] || null

  if (fragment) {
    return parseFragment(fragment)?.blockId || null
  } else {
    return null
  }
}

export function extractBlockRangeOfUrl(
  url: string | null | undefined,
): BlockRange | ExpandedBlockRange | null {
  const fragment = url?.match(/#(.*)$/)?.[1] || null

  if (fragment) {
    let res = parseFragment(fragment)
    if (res) {
      const {blockId, ...range} = res
      return range
    } else {
      return null
    }
  } else {
    return null
  }
}

export type ParsedFragment =
  | {blockId: string}
  | (BlockRange & {blockId: string})
  | (ExpandedBlockRange & {blockId: string})

export type BlockRange = {
  start: number
  end: number
}
export type ExpandedBlockRange = {
  expanded: boolean
}

export function parseFragment(input: string | null): ParsedFragment | null {
  if (!input) return null
  const regex =
    /^(?<blockId>\S{8})((?<expanded>\+)|\[(?<rangeStart>\d+)\:(?<rangeEnd>\d+)\])?$/
  const match = input.match(regex)
  if (match && match.groups) {
    if (match.groups.expanded == '+') {
      return {
        blockId: match.groups.blockId,
        expanded: true,
      }
    } else if (
      typeof match.groups.rangeStart != 'undefined' ||
      typeof match.groups.rangeEnd != 'undefined'
    ) {
      return {
        blockId: match.groups.blockId,
        start: parseInt(match.groups.rangeStart || '0'),
        end: parseInt(match.groups.rangeEnd || '0'),
      }
    } else {
      return {
        blockId: match.groups.blockId,
      }
    }
  } else {
    return {
      blockId: input,
    }
  }
}

export function serializeBlockRange(
  range: BlockRange | ExpandedBlockRange | null | undefined,
): string {
  let res = ''
  if (range) {
    if ('expanded' in range && range.expanded) {
      res += '+'
    } else if ('start' in range) {
      res += `[${range.start}:${range.end}]`
    }
  }

  return res
}
