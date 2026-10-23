import {describe, expect, it} from 'vitest'
import {
  createFormulaTriggerPlugin,
  createInlineEmbedNode,
  inlineEmbedClipboardText,
  MentionToken,
} from './mentions-plugin'
import {Schema} from 'prosemirror-model'
import {EditorState, Plugin, TextSelection} from 'prosemirror-state'
import {attributeMenuPluginKey, createAttributeMenuPlugin, getAttributeMenuRange} from './attribute-menu'
import {EditorView} from 'prosemirror-view'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {UniversalAppProvider} from '@shm/shared/routing'
import {queryAccount, queryResource} from '@shm/shared/models/queries'
import {unpackHmId} from '@shm/shared'
import {formatAccountIdentityName} from '@shm/ui/account-avatar'

describe('inlineEmbedClipboardText', () => {
  it('serializes inline embeds to a non-empty clipboard fallback', () => {
    expect(inlineEmbedClipboardText('hm://uid1/docs/page')).toBe('hm://uid1/docs/page')
  })

  it('returns empty string when link is missing', () => {
    expect(inlineEmbedClipboardText('')).toBe('')
  })

  it('parses data-inline-embed anchors before generic links', () => {
    const parseRules = createInlineEmbedNode().config.parseHTML?.() || []

    expect(parseRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tag: 'a[data-inline-embed]',
          priority: 1000,
        }),
      ]),
    )
  })
})

it('preserves mention kind in rich clipboard HTML', () => {
  const node = createInlineEmbedNode()
  expect(node.config.addAttributes?.()).toHaveProperty('mentionKind')
  const html = node.config.renderHTML?.({
    node: {attrs: {link: 'hm://alice', mentionKind: 'document'}},
    HTMLAttributes: {link: 'hm://alice'},
  } as any)
  expect(html?.[1]).toHaveProperty('data-mention-kind', 'document')
})

describe('mention labels', () => {
  function renderMention(link: string, mentionKind?: 'account' | 'document', name = 'Alice') {
    const client = {request: async () => null} as any
    const queryClient = new QueryClient({defaultOptions: {queries: {staleTime: Infinity}}})
    queryClient.setQueryData(queryAccount(client, 'alice').queryKey, {metadata: {name}})
    for (const id of [unpackHmId('hm://alice'), unpackHmId('hm://alice/page')]) {
      queryClient.setQueryData(queryResource(client, id).queryKey, {
        type: 'document',
        document: {metadata: {name: 'Home document'}},
      })
    }
    const html = renderToStaticMarkup(
      createElement(
        QueryClientProvider,
        {client: queryClient},
        createElement(
          UniversalAppProvider,
          {universalClient: client, openUrl: () => {}, openRoute: () => {}},
          createElement(MentionToken, {value: link, mentionKind}),
        ),
      ),
    )
    queryClient.clear()
    return html
  }

  it.each([
    ['hm://alice/:profile', 'account'],
    ['hm://alice/:profile', undefined],
    ['hm://site/:profile/alice', 'account'],
    ['hm://site/:profile/alice', undefined],
    ['hm://alice', undefined],
  ] as const)('prefixes account label %s (%s) with @', (link, kind) => {
    expect(renderMention(link, kind)).toContain('>@Alice<')
  })

  it('does not duplicate an existing @ in a profile name or petname', () => {
    expect(renderMention('hm://alice/:profile', 'account', '@Alice')).toContain('>@Alice<')
  })

  it.each([
    ['hm://alice', 'document'],
    ['hm://alice/page', 'document'],
    ['hm://alice/page', undefined],
  ] as const)('keeps document label %s (%s) unprefixed', (link, kind) => {
    expect(renderMention(link, kind)).toContain('>Home document<')
    expect(renderMention(link, kind)).not.toContain('@Home document')
  })
})

describe('account identity names', () => {
  it('limits Unicode characters without splitting surrogate pairs', () => {
    expect(formatAccountIdentityName('😀'.repeat(21), {maxLength: 20})).toBe('😀'.repeat(20) + '…')
    expect(formatAccountIdentityName('😀'.repeat(20), {maxLength: 20})).toBe('😀'.repeat(20))
  })

  it('keeps full mention names and adds only one prefix', () => {
    const name = 'A very long account display name'
    expect(formatAccountIdentityName(name, {mention: true})).toBe('@' + name)
    expect(formatAccountIdentityName('@Alice', {mention: true})).toBe('@Alice')
  })
})

describe('variable chips', () => {
  function renderVariable(link: string, docs: Record<string, Record<string, unknown>>) {
    const client = {request: async () => null} as any
    const queryClient = new QueryClient({defaultOptions: {queries: {staleTime: Infinity}}})
    for (const [id, metadata] of Object.entries(docs)) {
      queryClient.setQueryData(queryResource(client, unpackHmId(id)).queryKey, {
        type: 'document',
        document: {metadata},
      })
    }
    const html = renderToStaticMarkup(
      createElement(
        QueryClientProvider,
        {client: queryClient},
        createElement(
          UniversalAppProvider,
          {universalClient: client, openUrl: () => {}, openRoute: () => {}},
          createElement(MentionToken, {value: link}),
        ),
      ),
    )
    queryClient.clear()
    return html
  }

  it('renders the sum of number attributes instead of a document mention', () => {
    const html = renderVariable(`hm://alice/budget?formula=${encodeURIComponent('sum(price, tax)')}`, {
      'hm://alice/budget': {name: 'Budget', price: 100, tax: 21},
    })
    expect(html).toContain('data-variable-kind="formula"')
    expect(html).toContain('121')
    expect(html).not.toContain('Budget')
  })

  it('renders attribute values from formula attributes', () => {
    const html = renderVariable('hm://alice/budget?attr=total', {
      'hm://alice/budget': {price: 100, tax: 21, total: '=price + tax'},
    })
    expect(html).toContain('121')
  })
})

describe('createFormulaTriggerPlugin', () => {
  const schema = new Schema({
    nodes: {
      doc: {content: 'block+'},
      paragraph: {content: 'inline*', group: 'block', toDOM: () => ['p', 0]},
      code: {content: 'text*', group: 'block', code: true, toDOM: () => ['pre', 0]},
      text: {group: 'inline'},
      'inline-embed': {inline: true, group: 'inline', atom: true, attrs: {link: {default: ''}}, toDOM: () => ['a']},
    },
  })

  function editorState(text: string, docId: string | null, block: string, plugins: Plugin[]) {
    const doc = schema.node('doc', null, [schema.node(block as any, null, text ? [schema.text(text)] : [])])
    return EditorState.create({doc, plugins, selection: TextSelection.create(doc, 1 + text.length)})
  }

  function typeEquals(text: string, docId: string | null = 'hm://alice/budget', block = 'paragraph') {
    const state = editorState(text, docId, block, [createFormulaTriggerPlugin(() => docId ?? undefined)])
    const view = new EditorView(document.createElement('div'), {state})
    const pos = view.state.selection.from
    const handled = view.someProp('handleTextInput', (f) => f(view, pos, pos, '=', () => view.state.tr))
    const result = {handled: !!handled, doc: view.state.doc.toJSON()}
    view.destroy()
    return result
  }

  it('turns `==` into an empty formula chip for the current document', () => {
    const {handled, doc} = typeEquals('Total: =')
    expect(handled).toBe(true)
    expect(doc.content[0].content).toEqual([
      {type: 'text', text: 'Total: '},
      {type: 'inline-embed', attrs: {link: 'hm://alice/budget?formula='}},
      {type: 'text', text: ' '},
    ])
  })

  it('ignores a single equals sign, `a==` and code', () => {
    expect(typeEquals('Total: ').handled).toBe(false)
    expect(typeEquals('a=').handled).toBe(false)
    expect(typeEquals('=', 'hm://alice/budget', 'code').handled).toBe(false)
    expect(typeEquals('=', null).handled).toBe(false)
  })

  it('opens the attribute menu after `{{` and tracks the query', () => {
    const {plugin} = createAttributeMenuPlugin()
    const range = (text: string, block = 'paragraph') => getAttributeMenuRange(editorState(text, null, block, [plugin]))
    expect(range('Total: {{pri')).toEqual({from: 8, queryStart: 10, to: 13})
    expect(range('{{')).toEqual({from: 1, queryStart: 3, to: 3})
    expect(range('({{')).toEqual({from: 2, queryStart: 4, to: 4})
    expect(range('Total: {')).toBeNull()
    expect(range('a{{')).toBeNull()
    expect(range('{{', 'code')).toBeNull()
  })

  it('keeps a dismissed `{{` menu closed while typing on', () => {
    const {plugin} = createAttributeMenuPlugin()
    const state = editorState('Total: {{', null, 'paragraph', [plugin])
    const dismissed = state.apply(state.tr.setMeta(attributeMenuPluginKey, 8))
    expect(getAttributeMenuRange(dismissed)).toBeNull()
    expect(getAttributeMenuRange(dismissed.apply(dismissed.tr.insertText('p')))).toBeNull()
  })
})
