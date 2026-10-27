import React from 'react'
import {createRoot, Root} from 'react-dom/client'
;(globalThis as typeof globalThis & {React?: typeof React}).React = React
import {act} from 'react-dom/test-utils'
import {hmId} from '@shm/shared/utils/entity-id-url'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {expectNoAxeViolations} from '@shm/a11y-testing/dom'

const {selectMock, useResourceMock, useAccountMock} = vi.hoisted(() => ({
  selectMock: {
    document: null as any,
    draftId: null as string | null,
    metadata: {} as Record<string, any>,
    renameState: 'idle' as 'idle' | 'renaming' | 'committing' | 'error',
    renameError: null as string | null,
    publishPath: null as string[] | null,
    effectivePublishPath: [] as string[],
    blocks: [] as any[],
  },
  useResourceMock: vi.fn(),
  useAccountMock: vi.fn(),
}))

// `useDocumentSelector` reads from the mocked snapshot. Each test rebinds
// `selectMock.document` / `draftId` / `metadata` to drive different code paths.
vi.mock('@shm/shared/models/use-document-machine', () => ({
  useDocumentSelector: (selector: (snapshot: any) => any) => {
    const snapshot = {
      context: {
        document: selectMock.document,
        draftId: selectMock.draftId,
        metadata: selectMock.metadata,
        blocks: selectMock.blocks,
      },
    }
    return selector(snapshot)
  },
  useDocumentSend: () => vi.fn(),
  selectDocument: (s: any) => s.context.document,
  selectDraftId: (s: any) => s.context.draftId,
  selectMetadata: (s: any) => s.context.metadata,
  selectBlocks: (s: any) => s.context.blocks,
  selectRenameState: () => selectMock.renameState,
  selectRenameError: () => selectMock.renameError,
  selectPublishPath: () => selectMock.publishPath,
  selectEffectivePublishPath: () => selectMock.effectivePublishPath,
  selectEditorBaseline: () => null,
  selectNavigation: () => undefined,
  selectSaveIndicatorStatus: () => 'hidden',
  selectSaveStatus: () => 'idle',
}))

vi.mock('@shm/shared/models/entity', () => ({
  useResource: useResourceMock,
  useAccount: useAccountMock,
}))

vi.mock('@/models/gateway-settings', () => ({
  useGatewayUrl: () => ({data: 'https://hyper.media'}),
}))

vi.mock('@shm/shared/models/editor-handlers-context', () => ({
  useEditorHandlersRef: () => ({current: {getCurrentBlocks: () => []}}),
}))

vi.mock('@/models/navigation', () => ({getNavigationChanges: () => []}))

vi.mock('@/trpc', () => ({
  client: {createAppWindow: {mutate: vi.fn()}},
}))

vi.mock('@/utils/useNavigate', () => ({useNavigate: () => vi.fn()}))

// Editor barrel pulls in BlockNote files that use bare `<JSX />` (legacy
// classic runtime). Stub them out so the popover test only loads what it
// actually exercises.
vi.mock('@shm/editor/blocknote', () => ({useBlockNote: vi.fn()}))
vi.mock('@shm/editor/blocknote/core', () => ({BlockNoteEditor: class {}}))
vi.mock('@shm/editor/hypermedia-link-plugin', () => ({createHypermediaDocLinkPlugin: vi.fn()}))
vi.mock('@shm/editor/slash-menu-items', () => ({getSlashMenuItems: () => []}))
vi.mock('@shm/editor/document-editor', () => ({DocumentEditor: () => null}))
vi.mock('@shm/editor/query-search-context', () => ({QuerySearchInputProvider: ({children}: any) => children}))

// `delete-draft-dialog` imports `@/models/documents`, which transitively
// imports the BlockNote editor (via slash-menu, draft-machine, etc.). The
// popover body uses the dialog only via `useDeleteDraftDialog`, so stub it.
vi.mock('../delete-draft-dialog', () => ({
  useDeleteDraftDialog: () => ({open: vi.fn(), content: null}),
}))
vi.mock('@/models/documents', () => ({
  useDeleteDraft: () => ({mutate: vi.fn()}),
}))

vi.mock('@shm/ui/copy-to-clipboard', () => ({copyTextToClipboard: vi.fn(() => Promise.resolve())}))

vi.mock('@shm/ui/toast', () => ({
  toast: {success: vi.fn(), error: vi.fn(), promise: vi.fn()},
}))

// Tooltip needs a TooltipProvider in scope; bypass it for the popover test.
vi.mock('@shm/ui/tooltip', async () => {
  const React = await import('react')
  return {
    Tooltip: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children),
  }
})

import {PublishPopoverBody} from '../editing-toolbar'
;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true

function setSnapshot(opts: {document?: any; draftId?: string | null; metadata?: Record<string, any>; blocks?: any[]}) {
  selectMock.document = opts.document ?? null
  selectMock.draftId = opts.draftId ?? null
  selectMock.metadata = opts.metadata ?? {}
  selectMock.blocks = opts.blocks ?? []
}

function renderPopover(
  docId: ReturnType<typeof hmId>,
  onPublish: () => void,
  onFocusBlock: (blockId: string) => void = vi.fn(),
) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(
      <PublishPopoverBody
        docId={docId}
        changeCount={3}
        onPublish={onPublish}
        onClose={vi.fn()}
        publishDisabled={false}
        getDocumentUrl={() => 'https://example.com/parent/my-cool-doc'}
        onFocusBlock={onFocusBlock}
      />,
    )
  })
  return {container, root}
}

function cleanup(root: Root, container: HTMLDivElement) {
  act(() => {
    root.unmount()
  })
  container.remove()
}

function findInput(container: HTMLDivElement) {
  return container.querySelector('input') as HTMLInputElement | null
}

describe('PublishPopoverBody', () => {
  beforeEach(() => {
    selectMock.document = null
    selectMock.draftId = null
    selectMock.metadata = {}
    selectMock.blocks = []
    selectMock.renameState = 'idle'
    selectMock.renameError = null
    selectMock.publishPath = null
    selectMock.effectivePublishPath = ['parent', 'my-cool-doc']
    useResourceMock.mockReset()
    useAccountMock.mockReset()
    useResourceMock.mockReturnValue({data: undefined})
    useAccountMock.mockReturnValue({data: undefined})
  })

  it('shows a pencil button and no input for a published doc', () => {
    setSnapshot({
      document: {version: 'bafy123', metadata: {}},
      draftId: 'abc',
      metadata: {name: 'My Cool Doc'},
    })
    const docId = hmId('acct-1', {path: ['parent', 'my-cool-doc']})
    const {container, root} = renderPopover(docId, vi.fn())
    try {
      expect(findInput(container)).toBeNull()
      expect(container.querySelector('button[aria-label="Edit path"]')).toBeTruthy()
    } finally {
      cleanup(root, container)
    }
  })

  it('lists accessibility issues, focuses their block, and keeps Publish advisory', async () => {
    setSnapshot({
      draftId: 'draft-1',
      blocks: [
        {block: {id: 'image-1', type: 'Image', text: '', attributes: {name: 'flower.jpg'}, link: ''}},
        {block: {id: 'image-2', type: 'Image', text: 'cat.png', attributes: {name: 'cat.png'}, link: ''}},
        {block: {id: 'heading-1', type: 'Heading', text: 'Title', attributes: {}}},
        {block: {id: 'heading-2', type: 'Heading', text: 'Details', attributes: {}}},
        {block: {id: 'heading-3', type: 'Heading', text: '', attributes: {}}},
        {
          block: {
            id: 'link-1',
            type: 'Paragraph',
            text: 'click here',
            annotations: [{type: 'Link', starts: [0], ends: [10], link: 'https://example.com'}],
          },
        },
      ],
    })
    const onFocusBlock = vi.fn()
    const docId = hmId('acct-1', {path: ['draft']})
    const {container, root} = renderPopover(docId, vi.fn(), onFocusBlock)
    try {
      const section = container.querySelector('section[aria-labelledby="publish-accessibility-heading"]')
      expect(section?.textContent).toContain('Accessibility')
      const issueButtons = Array.from(section?.querySelectorAll('button') ?? [])
      expect(issueButtons.map((button) => button.textContent)).toEqual([
        'Image 1: add alt text (flower.jpg)',
        'Image 2: replace filename "cat.png" with descriptive alt text',
        'Heading 3 is empty',
        'Link "click here" needs descriptive text',
      ])
      expect(issueButtons[0]?.getAttribute('aria-label')).toBe('Go to Image 1: add alt text (flower.jpg)')
      expect(issueButtons[0]?.className).toContain('underline')
      expect(issueButtons[0]?.className).toContain('focus-visible:ring-2')
      expect(section?.querySelector('[aria-live="polite"]')).toBeTruthy()
      expect(container.querySelector('button:disabled')).toBeNull()
      await expectNoAxeViolations(container)
      act(() => issueButtons[0]?.click())
      expect(onFocusBlock).toHaveBeenCalledWith('image-1')
    } finally {
      cleanup(root, container)
    }
  })

  it('hides the accessibility section when the document has no issues', () => {
    setSnapshot({draftId: 'draft-1', blocks: [{block: {id: 'paragraph-1', type: 'Paragraph', text: 'All good'}}]})
    const docId = hmId('acct-1', {path: ['draft']})
    const {container, root} = renderPopover(docId, vi.fn())
    try {
      expect(container.querySelector('section[aria-labelledby="publish-accessibility-heading"]')).toBeNull()
    } finally {
      cleanup(root, container)
    }
  })

  it('shows a pencil button and no input for a first-publish doc', () => {
    setSnapshot({
      document: {version: '', metadata: {}},
      draftId: 'abc',
      metadata: {name: 'My Cool Doc'},
    })
    const docId = hmId('acct-1', {path: ['parent', '-abc']})
    const {container, root} = renderPopover(docId, vi.fn())
    try {
      expect(findInput(container)).toBeNull()
      expect(container.querySelector('button[aria-label="Edit path"]')).toBeTruthy()
    } finally {
      cleanup(root, container)
    }
  })

  it('hides the pencil for home-doc edits (empty path)', () => {
    setSnapshot({
      document: {version: '', metadata: {}},
      draftId: 'abc',
      metadata: {name: 'Home'},
    })
    const docId = hmId('acct-1', {path: []})
    const {container, root} = renderPopover(docId, vi.fn())
    try {
      expect(container.querySelector('button[aria-label="Edit path"]')).toBeNull()
    } finally {
      cleanup(root, container)
    }
  })

  it('hides the pencil for private docs', () => {
    setSnapshot({
      document: {version: 'bafy123', metadata: {}, visibility: 'PRIVATE'},
      draftId: 'abc',
      metadata: {name: 'My Private Doc'},
    })
    const docId = hmId('acct-1', {path: ['my-cool-doc']})
    const {container, root} = renderPopover(docId, vi.fn())
    try {
      expect(container.querySelector('button[aria-label="Edit path"]')).toBeNull()
    } finally {
      cleanup(root, container)
    }
  })

  it('shows a non-clickable not-yet-published status for first publish docs', () => {
    setSnapshot({
      document: {version: '', metadata: {}},
      draftId: 'abc',
      metadata: {name: 'My Cool Doc'},
    })
    const docId = hmId('acct-1', {path: ['parent', '-abc']})
    const {container, root} = renderPopover(docId, vi.fn())
    try {
      expect(container.textContent).toContain('Not yet published')
      const matchingButton = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent?.includes('Not yet published'),
      )
      expect(matchingButton).toBeUndefined()
    } finally {
      cleanup(root, container)
    }
  })

  it('renders an input with save and cancel buttons while renaming', () => {
    selectMock.renameState = 'renaming'
    setSnapshot({
      document: {version: '', metadata: {}},
      draftId: 'abc',
      metadata: {name: 'My Cool Doc'},
    })
    const docId = hmId('acct-1', {path: ['parent', '-abc']})
    const {container, root} = renderPopover(docId, vi.fn())
    try {
      expect(findInput(container)).toBeTruthy()
      expect(container.querySelector('button[aria-label="Save path"]')).toBeTruthy()
      expect(container.querySelector('button[aria-label="Cancel path edit"]')).toBeTruthy()
    } finally {
      cleanup(root, container)
    }
  })
})
