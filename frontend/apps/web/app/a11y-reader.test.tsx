// @vitest-environment jsdom

import type {HMDocument, HMResource} from '@seed-hypermedia/client/hm-types'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {expectNoAxeViolations} from '@shm/a11y-testing/dom'
import {hmId} from '@shm/shared'
import {queryKeys} from '@shm/shared/models/query-keys'
import {TooltipProvider} from '@shm/ui/tooltip'
import {createElement} from 'react'
import {createRoot} from 'react-dom/client'
import {act} from 'react-dom/test-utils'
import {renderToString} from 'react-dom/server'
import {beforeEach, describe, expect, it, vi} from 'vitest'

const TEST_UID = 'z6MkkBQP6c9TQ5JsYJNyemvg1dU3s3AwprWRm8DZHL9VabQY'
const TEST_VERSION = 'a11y-reader-test-version'
const TEST_ORIGIN_UID = 'z6Mktm7dZfYf8u2JY2X4mM2Q9TgF2Yy9p4W1wQdG1mZx9B2R'
const guideId = hmId(TEST_UID, {path: ['guide']})
let mockNavRoute: {key: 'document'; id: ReturnType<typeof hmId>}

const mockUniversalAppContext = {
  origin: 'http://localhost:3000',
  originHomeId: {uid: TEST_UID, id: `hm://${TEST_UID}`, path: [], version: null},
  getOptimizedImageUrl: (cid: string) => `http://localhost:58001/hm/api/image/${cid}`,
  ipfsFileUrl: 'http://localhost:58001/ipfs',
  openUrl: () => {},
  openRoute: () => {},
  onCopyReference: () => {},
  languagePack: undefined,
  universalClient: {
    documents: {searchDocuments: async () => ({documents: []})},
    request: async () => null,
    publish: async () => ({cids: []}),
  },
}

vi.mock('@shm/shared/constants', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    DAEMON_FILE_URL: 'http://localhost:58001/ipfs',
    SITE_BASE_URL: 'http://localhost:3000',
    SEED_ASSET_HOST: 'http://localhost:58001',
    WEB_SIGNING_ENABLED: false,
    WEB_IDENTITY_ENABLED: false,
    WEB_IDENTITY_ORIGIN: '',
  }
})

vi.mock('@shm/shared', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {...actual, useUniversalAppContext: () => mockUniversalAppContext}
})

vi.mock('@shm/ui/layout', () => ({
  useDocumentLayout: () => ({
    showSidebars: false,
    sidebarProps: {},
    mainContentProps: {},
    elementRef: {current: null},
    wrapperProps: {className: ''},
    contentMaxWidth: '800px',
  }),
}))

vi.mock('@shm/shared/models/search', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {...actual, useSearch: () => ({data: [], isLoading: false})}
})

vi.mock('@remix-run/react', () => ({
  useLocation: () => ({pathname: '/', search: '', hash: '', state: null}),
  useNavigate: () => () => {},
}))

vi.mock('@shm/shared/models/comments', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    useDocumentComments: () => ({data: {comments: [], authors: {}}, error: null, isLoading: false}),
    useCommentReplyCount: () => ({data: 0}),
    useCommentVersions: () => ({data: {versions: []}, isLoading: false}),
  }
})

vi.mock('@shm/shared/comments-service-provider', () => ({
  useCommentsServiceContext: () => ({showDeletedContent: false}),
  useDeleteComment: () => ({mutate: () => {}, isLoading: false}),
  useHackyAuthorsSubscriptions: () => {},
  useUpdateComment: () => ({mutate: () => {}, isLoading: false}),
}))

vi.mock('@shm/shared/document-actions-context', () => ({
  useDocumentActions: () => ({isBookmarked: () => false, onBookmarkToggle: () => {}}),
}))

vi.mock('@shm/shared/readonly-viewer-context', () => ({
  useReadOnlyViewer:
    () =>
    ({blocks}: any) =>
      createElement('p', null, blocks.map((node: any) => node.block.text).join('')),
}))

vi.mock('@shm/shared/translation', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    useTxString: () => (value: string) => value,
    useTx: () => (value: string) => value,
  }
})

vi.mock('@shm/ui/universal-dialog', () => ({
  useAppDialog: () => ({open: () => {}}),
}))

vi.mock('./comment-draft-utils', () => ({
  useCommentDraftPersistence: () => ({
    draft: null,
    draftMediaRefs: null,
    isLoading: false,
    saveDraft: () => {},
    clearDraft: () => {},
    draftId: 'a11y-test',
    editorGeneration: 0,
  }),
}))

vi.mock('@/auth', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    useLocalKeyPair: () => null,
    useCreateAccount: () => ({content: null, createAccount: () => {}}),
    useVaultSuccessDialog: () => null,
    AccountFooterActions: () => null,
    EditProfileDialog: () => null,
    LogoutButton: () => null,
    LogoutDialog: () => null,
  }
})

vi.mock('@shm/shared/utils/navigation', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  const mockNav = {
    state: {
      subscribe: () => () => {},
      get: () => ({routes: [{key: 'document', id: hmId(TEST_UID)}], routeIndex: 0}),
    },
    dispatch: () => {},
  }
  return {
    ...actual,
    useNavRoute: () => mockNavRoute,
    useNavigate: () => () => {},
    useNavigation: () => mockNav,
    useNavigationState: () => ({routes: [{key: 'document'}], routeIndex: 0}),
    useNavigationDispatch: () => () => {},
  }
})

vi.mock('@shm/shared/routing', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    useUniversalClient: () => mockUniversalAppContext.universalClient,
  }
})

function createReaderDocument(name: string, content: string, includeNavigation = false): HMDocument {
  return {
    id: `hm://${TEST_UID}`,
    path: '',
    version: TEST_VERSION,
    account: TEST_UID,
    authors: [TEST_UID],
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    genesis: false,
    visibility: 'PUBLIC',
    metadata: {name, language: 'en'},
    content: [
      {
        block: {
          id: 'block-1',
          type: 'Paragraph',
          text: content,
          annotations: [],
          attributes: {},
        },
        children: [],
      },
    ],
    detachedBlocks: includeNavigation
      ? {
          navigation: {
            block: {id: 'navigation', type: 'Group', text: '', annotations: [], attributes: {}},
            children: [
              {
                block: {
                  id: 'navigation-guide',
                  type: 'Link',
                  link: `hm://${TEST_UID}/guide`,
                  text: 'Guide',
                  annotations: [],
                  attributes: {},
                },
                children: [],
              },
            ],
          },
        }
      : {},
  } as unknown as HMDocument
}

function createDocumentResource(document: HMDocument, docId: ReturnType<typeof hmId>): HMResource {
  return {type: 'document', id: docId, document} as HMResource
}

function createHydratedQueryClient(document: HMDocument, homeDocument: HMDocument) {
  const queryClient = new QueryClient({defaultOptions: {queries: {staleTime: Infinity}}})
  const documents = [
    {id: guideId, document},
    {id: hmId(TEST_UID, {path: ['guide'], version: TEST_VERSION}), document},
    {id: hmId(TEST_UID, {path: ['guide'], latest: true}), document},
    {id: hmId(TEST_UID, {latest: true}), document: homeDocument},
    {id: hmId(TEST_UID), document: homeDocument},
  ]
  for (const {id, document: cachedDocument} of documents) {
    queryClient.setQueryData(
      [queryKeys.ENTITY, id.id, id.version || undefined, id.latest || false],
      createDocumentResource(cachedDocument, id),
    )
  }
  return queryClient
}

function withProviders(queryClient: QueryClient, child: React.ReactElement) {
  return createElement(QueryClientProvider, {client: queryClient}, createElement(TooltipProvider, {children: child}))
}

describe.sequential('web reader accessibility contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
      }),
    })
    mockUniversalAppContext.origin = 'http://localhost:3000'
    mockUniversalAppContext.originHomeId = {
      uid: TEST_UID,
      id: `hm://${TEST_UID}`,
      path: [],
      version: null,
    }
    mockNavRoute = {key: 'document', id: guideId}
  })

  it('renders a hydrated reader page with accessible landmarks and navigation', async () => {
    const {ResourcePage} = await import('@shm/ui/resource-page-common')
    const guideDocument = createReaderDocument('Accessibility Guide', 'A nested reader document')
    const homeDocument = createReaderDocument('A11y Reader Demo', 'Home content', true)
    const queryClient = createHydratedQueryClient(guideDocument, homeDocument)
    const DocumentContent = () =>
      createElement(
        'div',
        null,
        createElement('h2', null, 'Reader heading'),
        createElement('p', null, 'This document is part of the hydrated reader fixture.'),
        createElement('img', {
          src: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
          alt: 'Reader illustration',
        }),
      )

    const html = renderToString(
      withProviders(
        queryClient,
        createElement(ResourcePage, {
          docId: guideId,
          DocumentContentComponent: DocumentContent,
        }),
      ),
    )
    document.documentElement.lang = 'en'
    document.title = 'Accessibility Guide'
    document.body.innerHTML = html

    await expectNoAxeViolations(document)

    expect(document.querySelectorAll('main')).toHaveLength(1)
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('h1')?.textContent).toBe('Accessibility Guide')
    expect(document.querySelector('a')?.textContent).toBe('Skip to content')
    expect(document.querySelector('a')?.getAttribute('href')).toBe('#main-content')
    expect(document.querySelector('#main-content')).not.toBeNull()
    const siteNavigationLinks = Array.from(document.querySelectorAll('nav[aria-label="Site"] a')).map(
      (link) => link.textContent?.trim(),
    )
    expect(siteNavigationLinks).toContain('Home')
    expect(siteNavigationLinks).toContain('Guide')
    expect(document.querySelector('aside[aria-label="Site documents"]')).not.toBeNull()
    expect(document.querySelector('h2')?.textContent).toBe('Reader heading')
    expect(document.querySelector('main img[alt="Reader illustration"]')).not.toBeNull()

    const measurement = document.querySelector('[aria-hidden="true"][inert]')
    expect(measurement).not.toBeNull()
  }, 120000)

  it('renders the real web comment editor and UI comment thread accessibly', async () => {
    const [{default: WebCommenting}, {CommentGroup}] = await Promise.all([
      import('./commenting'),
      import('@shm/ui/comments'),
    ])
    const comment = {
      id: 'reader-author/comment',
      version: 'comment-version',
      author: TEST_UID,
      targetAccount: TEST_UID,
      targetPath: 'guide',
      targetVersion: TEST_VERSION,
      content: [{block: {id: 'comment-text', type: 'Paragraph', text: 'A comment on this document.'}}],
      createTime: {seconds: 1792281600, nanos: 0},
      updateTime: {seconds: 1792281600, nanos: 0},
      visibility: 'PUBLIC',
    }
    const thread = createElement(
      'section',
      {'aria-label': 'Comments'},
      createElement(CommentGroup, {
        commentGroup: {type: 'commentGroup', comments: [comment]} as any,
      }),
    )
    const guideDocument = createReaderDocument('Accessibility Guide', 'A nested reader document')
    const queryClient = createHydratedQueryClient(guideDocument, guideDocument)
    document.documentElement.lang = 'en'
    document.title = 'Accessibility Guide'
    const container = document.createElement('div')
    document.body.replaceChildren(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        withProviders(
          queryClient,
          createElement(
            'main',
            null,
            createElement(WebCommenting, {
              docId: hmId(TEST_UID, {path: ['guide'], version: TEST_VERSION}),
              focusOnMount: true,
            }),
            thread,
          ),
        ),
      )
    })
    await expectNoAxeViolations(document)
    expect(document.querySelector('[role="textbox"][aria-label="Comment"]')).not.toBeNull()
    expect(document.querySelector('[aria-label="Create account to publish comment"]')).not.toBeNull()
    expect(document.querySelector('article[aria-label^="Comment by"]')).not.toBeNull()
    await act(async () => root.unmount())
  }, 120000)

  it('detects missing main and hidden-measurement protections', async () => {
    const {ResourcePage} = await import('@shm/ui/resource-page-common')
    const guideDocument = createReaderDocument('Accessibility Guide', 'A nested reader document')
    const queryClient = createHydratedQueryClient(guideDocument, guideDocument)
    const html = renderToString(
      withProviders(
        queryClient,
        createElement(ResourcePage, {
          docId: guideId,
          DocumentContentComponent: () => createElement('p', null, 'Reader content'),
        }),
      ),
    )
    document.documentElement.lang = 'en'
    document.title = 'Accessibility Guide'
    document.body.innerHTML = html

    const measurement = document.querySelector('[aria-hidden="true"][inert]')
    measurement?.removeAttribute('aria-hidden')
    measurement?.removeAttribute('inert')
    document.querySelector('main')?.remove()
    const outsideLandmark = document.createElement('p')
    outsideLandmark.textContent = 'Reader content outside landmarks'
    document.body.append(outsideLandmark)

    expect(document.querySelectorAll('main')).toHaveLength(0)
    expect(measurement?.hasAttribute('aria-hidden')).toBe(false)
    expect(measurement?.hasAttribute('inert')).toBe(false)
    await expect(expectNoAxeViolations(document)).rejects.toThrow(/landmark-one-main|region/)
  }, 120000)
})
