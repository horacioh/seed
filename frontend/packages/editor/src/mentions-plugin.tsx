import {HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {hmId, hypermediaUrlToHref, useUniversalAppContext} from '@shm/shared'
import {getContactMetadata, getDocumentTitle} from '@shm/shared/content'
import {useDocumentActions} from '@shm/shared/document-actions-context'
import {
  buildVariableLink,
  evaluateVariable,
  formatFormulaValue,
  parseVariableLink,
  type FormulaResult,
  type VariableLink,
} from '@shm/shared/formulas'
import {useAccount, useResource, useResources} from '@shm/shared/models/entity'
import {unpackHmId} from '@shm/shared/utils/entity-id-url'
import {AccountIdentityName} from '@shm/ui/account-avatar'
import {useHighlighter} from '@shm/ui/highlight-context'
import {Button} from '@shm/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {SizableText} from '@shm/ui/text'
import {cn} from '@shm/ui/utils'
import {forwardRef, useEffect, useMemo, useState} from 'react'
import {Node} from '@tiptap/core'
import {Plugin} from '@tiptap/pm/state'
import {NodeViewWrapper, ReactNodeViewRenderer} from '@tiptap/react'
import './inline-embed.css'

/** Fallback text used when serializing an inline embed to the clipboard. */
export function inlineEmbedClipboardText(link: string): string {
  return link || ''
}

/** Creates the TipTap Node for rendering inline-embed mentions in the document. */
export function createInlineEmbedNode() {
  const InlineEmbedNode = Node.create({
    atom: true,
    name: 'inline-embed',
    group: 'inline',
    inline: true,
    addNodeView() {
      return ReactNodeViewRenderer(InlineEmbedNodeComponent)
    },
    renderHTML({node, HTMLAttributes}) {
      return [
        'a',
        {
          ...HTMLAttributes,
          href: HTMLAttributes.link,
          'data-inline-embed': HTMLAttributes.link,
          ...(node.attrs.mentionKind ? {'data-mention-kind': node.attrs.mentionKind} : {}),
        },
        inlineEmbedClipboardText(node.attrs.link),
      ]
    },
    renderText({node}) {
      return inlineEmbedClipboardText(node.attrs.link)
    },
    parseHTML() {
      return [
        {
          tag: `a[data-inline-embed]`,
          priority: 1000,
          getAttrs: (dom) => {
            if (dom instanceof HTMLElement) {
              const value = dom.getAttribute('data-inline-embed')
              if (!value || !unpackHmId(value)) return false
              const kind = dom.getAttribute('data-mention-kind')
              return {link: value, mentionKind: kind === 'account' || kind === 'document' ? kind : null}
            }
            return false
          },
        },
        {
          tag: `span[data-inline-embed]`,
          priority: 1000,
          getAttrs: (dom) => {
            if (dom instanceof HTMLElement) {
              const value = dom.getAttribute('data-inline-embed')
              if (!value || !unpackHmId(value)) return false
              const kind = dom.getAttribute('data-mention-kind')
              return {link: value, mentionKind: kind === 'account' || kind === 'document' ? kind : null}
            }
            return false
          },
        },
      ]
    },
    addAttributes() {
      return {
        mentionKind: {default: null, rendered: false},
        link: {
          default: '',
        },
      }
    },
    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handleKeyDown(view, event) {
              if (view.state.selection.from === view.state.selection.to) {
                const resolved = view.state.doc.resolve(view.state.selection.from)
                if (
                  resolved.nodeBefore == null &&
                  resolved.nodeAfter?.type.name === 'inline-embed' &&
                  event.code === `Key${event.key.toUpperCase()}`
                ) {
                  view.dispatch(view.state.tr.insertText(event.key))
                  return true
                }
              }
              return false
            },
          },
        }),
      ]
    },
  })

  return InlineEmbedNode
}

function InlineEmbedNodeComponent(props: any) {
  const {hmUrlHref, origin, originHomeId} = useUniversalAppContext()
  const renderedHref =
    hypermediaUrlToHref(props.node.attrs.link, {
      hmUrlHref,
      origin,
      originHomeId,
    }) || props.node.attrs.link
  const isEditable = props.editor?.isEditable
  const variable = parseVariableLink(props.node.attrs.link)
  if (variable) {
    return (
      <NodeViewWrapper as="span" className="inline-embed-token" data-inline-embed={props.node.attrs.link}>
        {isEditable ? (
          <VariableEditor
            variable={variable}
            selected={props.selected}
            onChange={(next) => props.updateAttributes({link: buildVariableLink(next)})}
          />
        ) : (
          <VariableToken variable={variable} selected={props.selected} />
        )}
      </NodeViewWrapper>
    )
  }
  const wrapperProps = isEditable ? {} : {href: renderedHref}

  return (
    <NodeViewWrapper
      as={isEditable ? 'span' : 'a'}
      className={`inline-embed-token ${props.selected ? 'selected' : ''}`}
      data-inline-embed={props.node.attrs.link}
      data-mention-kind={props.node.attrs.mentionKind || undefined}
      {...wrapperProps}
    >
      <MentionToken
        value={props.node.attrs.link}
        mentionKind={props.node.attrs.mentionKind}
        selected={props.selected}
      />
    </NodeViewWrapper>
  )
}

/** Renders explicit mention identities while preserving legacy root-account references. */
export function MentionToken(props: {value: string; mentionKind?: 'account' | 'document'; selected?: boolean}) {
  const variable = parseVariableLink(props.value)
  if (variable) return <VariableToken variable={variable} selected={props.selected} />
  const unpackedRef = unpackHmId(props.value)
  const profileAccountUid = unpackedRef?.path?.[0] === ':profile' ? unpackedRef.path[1] || unpackedRef.uid : null

  if (unpackedRef && props.mentionKind === 'document') {
    return <DocumentMention unpackedRef={unpackedRef} {...props} />
  } else if (profileAccountUid) {
    return <ContactMention accountUid={profileAccountUid} highlightId={hmId(profileAccountUid)} {...props} />
  } else if (unpackedRef && unpackedRef.path && unpackedRef.path.length > 0) {
    return <DocumentMention unpackedRef={unpackedRef} {...props} />
  } else if (unpackedRef) {
    return <ContactMention accountUid={unpackedRef.uid} highlightId={unpackedRef} {...props} />
  } else {
    console.log('=== MENTION ERROR', props)
    return <MentionText>ERROR</MentionText>
  }
}

function DocumentMention({unpackedRef, selected}: {unpackedRef: UnpackedHypermediaId; selected?: boolean}) {
  const entity = useResource(unpackedRef, {subscribed: true})
  const actions = useDocumentActions()
  const highlight = useHighlighter()
  const draft = actions.getDraft?.(unpackedRef)
  const publishedTitle =
    entity.data && 'document' in entity.data && entity.data.document ? getDocumentTitle(entity.data.document) : null
  const resolved = draft?.metadata?.name ?? publishedTitle
  return (
    <MentionText selected={selected} {...highlight(unpackedRef)}>
      {resolved || unpackedRef.id}
    </MentionText>
  )
}

function ContactMention({
  accountUid,
  highlightId,
  selected,
}: {
  accountUid: string
  highlightId: UnpackedHypermediaId
  selected?: boolean
}) {
  const {contacts} = useUniversalAppContext()
  const highlight = useHighlighter()
  const entity = useAccount(accountUid, {subscribe: true})
  const meta = getContactMetadata(accountUid, entity.data?.metadata, contacts)

  return (
    <MentionText selected={selected} {...highlight(highlightId)}>
      <AccountIdentityName name={meta.name} mention />
    </MentionText>
  )
}

export function MentionText(props: any) {
  return (
    <SizableText
      weight="bold"
      className="mention-text link text-link hover:text-link-hover px-0.5 pb-0.5"
      style={{
        fontSize: 'inherit',
        fontFamily: 'inherit',
      }}
      {...props}
    >
      {props.children}
    </SizableText>
  )
}

/**
 * Evaluates a variable or formula against live document metadata (drafts first, then published), loading
 * cross-document references on demand.
 */
export function useVariableValue(variable: VariableLink): FormulaResult {
  const [docIds, setDocIds] = useState<string[]>([variable.docId])
  const unpackedIds = useMemo(() => docIds.map((id) => unpackHmId(id)), [docIds.join(',')])
  const resources = useResources(unpackedIds, {subscribed: true})
  const actions = useDocumentActions()
  const metadataById = new Map<string, HMMetadata | null | undefined>()
  docIds.forEach((id, i) => {
    const resource = resources[i]
    const unpacked = unpackedIds[i]
    const draft = unpacked && !unpacked.version ? actions.getDraft?.(unpacked) : undefined
    const published =
      resource?.data && 'document' in resource.data && resource.data.document
        ? resource.data.document.metadata
        : undefined
    if (draft) metadataById.set(id, {...published, ...draft.metadata})
    else if (published) metadataById.set(id, published)
    else metadataById.set(id, resource?.isLoading ? undefined : null)
  })
  const result = evaluateVariable(variable, (id) => (metadataById.has(id) ? metadataById.get(id) : undefined))
  const missing = result.status === 'pending' ? result.missing.filter((id) => !docIds.includes(id)) : []
  useEffect(() => {
    if (missing.length) setDocIds((ids) => [...ids, ...missing.filter((id) => !ids.includes(id))])
  }, [missing.join(',')])
  return result
}

/** Short label describing what a variable computes, e.g. `price` or `=sum(price, tax)`. */
function variableSource(variable: VariableLink) {
  return variable.kind === 'attr' ? variable.key : `=${variable.expr}`
}

/** Read-only inline chip showing the computed value of an attribute or formula. */
export const VariableToken = forwardRef<HTMLSpanElement, {variable: VariableLink; selected?: boolean}>(
  function VariableToken({variable, selected, ...rest}, ref) {
    const result = useVariableValue(variable)
    const label =
      result.status === 'ok'
        ? formatFormulaValue(result.value)
        : result.status === 'pending'
          ? '…'
          : variable.kind === 'formula' && !variable.expr.trim()
            ? 'formula'
            : '#ERR'
    return (
      <span
        ref={ref}
        {...rest}
        data-variable-kind={variable.kind}
        title={result.status === 'error' ? `${variableSource(variable)} — ${result.message}` : variableSource(variable)}
        className={cn(
          'inline-flex items-baseline gap-1 rounded-sm px-1 font-mono tabular-nums',
          result.status === 'error'
            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
            : 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
          selected && 'ring-2 ring-sky-500',
        )}
        style={{fontSize: '0.92em'}}
      >
        {variable.kind === 'formula' ? <span className="opacity-50">ƒ</span> : null}
        {label}
      </span>
    )
  },
)

/** Editable variable chip: clicking it opens a popover to edit the expression with a live preview. */
function VariableEditor({
  variable,
  selected,
  onChange,
}: {
  variable: VariableLink
  selected?: boolean
  onChange: (next: VariableLink) => void
}) {
  const isEmpty = variable.kind === 'formula' && !variable.expr.trim()
  const [open, setOpen] = useState(isEmpty)
  const [draftExpr, setDraftExpr] = useState(variable.kind === 'attr' ? variable.key : variable.expr)
  useEffect(() => {
    if (open) setDraftExpr(variable.kind === 'attr' ? variable.key : variable.expr)
  }, [open])
  const trimmed = draftExpr.trim().replace(/^=/, '')
  const next: VariableLink = /^[A-Za-z_][\w.]*$/.test(trimmed)
    ? {docId: variable.docId, kind: 'attr', key: trimmed}
    : {docId: variable.docId, kind: 'formula', expr: trimmed}
  const preview = useVariableValue(next)
  const numberAttributes = useNumberAttributes(variable.docId)
  const apply = () => {
    onChange(next)
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <VariableToken variable={variable} selected={selected || open} />
      </PopoverTrigger>
      <PopoverContent
        className="flex w-80 flex-col gap-3"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        contentEditable={false}
      >
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-medium">Formula</span>
          <input
            autoFocus
            className="border-border bg-background focus:ring-ring rounded-md border px-2 py-1.5 font-mono text-sm outline-none focus:ring-2"
            placeholder="sum(price, tax)"
            value={draftExpr}
            onChange={(e) => setDraftExpr(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') {
                e.preventDefault()
                apply()
              } else if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
          />
        </label>
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Result</span>
          <span
            className={cn(
              'truncate font-mono tabular-nums',
              preview.status === 'error' && 'text-amber-700 dark:text-amber-300',
            )}
          >
            {preview.status === 'ok'
              ? formatFormulaValue(preview.value)
              : preview.status === 'pending'
                ? 'Loading…'
                : trimmed
                  ? preview.message
                  : '—'}
          </span>
        </div>
        {numberAttributes.length ? (
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs font-medium">Attributes in this document</span>
            <div className="flex flex-wrap gap-1">
              {numberAttributes.map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  className="bg-muted hover:bg-accent rounded px-1.5 py-0.5 font-mono text-xs"
                  title={String(value)}
                  onClick={() => setDraftExpr((expr) => (expr.trim() ? `${expr.trimEnd()} + ${key}` : key))}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">
            Add number attributes in the Attributes tab, then reference them by name.
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          Functions: sum, avg, min, max, count, round, abs. Other documents: <code>[[hm://…]].key</code>
        </p>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={apply} disabled={!trimmed}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Custom attributes of a document whose value is a number or a formula. */
function useNumberAttributes(docId: string): [string, unknown][] {
  const unpacked = unpackHmId(docId)
  const resource = useResource(unpacked, {subscribed: true})
  const actions = useDocumentActions()
  const draft = unpacked && !unpacked.version ? actions.getDraft?.(unpacked) : undefined
  const published =
    resource.data && 'document' in resource.data && resource.data.document ? resource.data.document.metadata : {}
  const metadata: Record<string, unknown> = {...published, ...draft?.metadata}
  return Object.entries(metadata).filter(
    ([, value]) =>
      typeof value === 'number' ||
      (typeof value === 'string' && (value.trim().startsWith('=') || (value.trim() !== '' && !isNaN(Number(value))))),
  )
}
