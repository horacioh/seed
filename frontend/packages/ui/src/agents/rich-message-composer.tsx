import * as stylex from '@stylexjs/stylex'
import {trimTrailingEmptyBlocks} from '@seed-hypermedia/client'
import {Button} from '@shm/ui/button'
import {Send, Square} from 'lucide-react'
import React, {useRef, useState} from 'react'
import type {RunStatus, SessionAttachmentInfo} from './client'
import {type AgentSessionDraftMessage, uploadFileToAgentServer} from './models'
import {getAgentsPlatform, type AgentsRichEditorGetContent, type AgentsRichEditorSubmitHandle} from './platform'
import {promptBlocksToMarkdown} from './prompt-editor'
import {UserToolPalette} from './user-tool-palette'

/**
 * The one rich message composer for agent sessions.
 *
 * Shared by the full session page and the assistant sidebar so both get the same input: rich
 * blocks with markdown serialization, file attachments as session-private uploads, the user tool
 * palette, queue-aware send, and stop. Any composer feature belongs here, not in a per-surface
 * copy.
 */

/** Run states a sub-session's parent can no longer be driving it from. */
const styles = stylex.create({
  saa9e18e6: {
    borderColor: 'var(--border)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  sb5c8d341: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 3)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s34f4bddb: {
    paddingInline: 'calc(0.25rem * 3)',
    paddingTop: 'calc(0.25rem * 2)',
  },
  s948be48c: {
    flex: 'none',
  },
  s6bbccae4: {
    backgroundColor: 'var(--muted)',
    height: 'calc(0.25rem * 1)',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'calc(infinity * 1px)',
  },
  sb57c4182: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'calc(0.25rem * 2)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sde768909: {
    display: 'flex',
    flexShrink: '0',
    gap: 'calc(0.25rem * 1)',
    paddingBottom: 'calc(0.25rem * 1)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
})
export const TERMINAL_RUN_STATUSES = new Set<RunStatus>(['succeeded', 'failed', 'canceled'])
export const SUB_SESSION_DRIVEN_MESSAGE =
  'This sub-session is being driven by its parent — watch, or open the parent to intervene'
type CommentEditorGetContent = AgentsRichEditorGetContent
export function AgentRichMessageComposer({
  isBusy,
  isStreaming,
  disabledMessage,
  stopPending,
  serverUrl,
  accountId,
  sessionId,
  agentTools,
  agentToolsLoading,
  focusOnMount = true,
  canInvokeTools = true,
  composerHandleRef,
  onToolStartSession,
  onToolSessionStarted,
  onSend,
  onStop,
}: {
  isBusy: boolean
  isStreaming: boolean
  /** When set, the composer is replaced by this explanation — the session is not the user's to drive. */
  disabledMessage?: string
  stopPending: boolean
  serverUrl: string
  accountId: string | null
  /** Absent for a draft: no session exists yet, so attachments stay off and the tool palette —
   * which needs one to target — renders disabled until the first send creates it. */
  sessionId?: string
  /** The agent definition's tools array, for the user tool palette's callable list. */
  agentTools?: string[]
  /** True while the agent definition is loading; the palette shows a loading state. */
  agentToolsLoading?: boolean
  /** Focus the editor when the composer mounts. On by default, like the full session page. */
  focusOnMount?: boolean
  /** Whether the user tool palette is offered. Off for chat-only access, which cannot run session tools. */
  canInvokeTools?: boolean
  /** External handle for imperative focus/submit (e.g. the sidebar's new-chat flows). */
  composerHandleRef?: React.MutableRefObject<AgentsRichEditorSubmitHandle | null>
  /** Draft composer only: lets a tool run create the session, the same way the first send would. */
  onToolStartSession?: () => Promise<string>
  /** Called once a tool run that created its own session finishes, e.g. to navigate to it. */
  onToolSessionStarted?: (sessionId: string) => void
  onSend: (message: AgentSessionDraftMessage) => void
  onStop: () => void
}) {
  const [draftMarkdown, setDraftMarkdown] = useState('')
  const {CommentEditor} = getAgentsPlatform()
  const internalHandleRef = useRef<AgentsRichEditorSubmitHandle | null>(null)
  const submitHandleRef = composerHandleRef ?? internalHandleRef
  /** In-flight attachment upload shown as a slim progress bar; null when idle. */
  const [attachmentUpload, setAttachmentUpload] = useState<{
    name: string
    sent: number
    total: number
  } | null>(null)
  /** Metadata for every attachment uploaded from this composer, keyed by id, so a sent message
   * can carry the infos of the attachments its blocks still reference. */
  const uploadedAttachmentsRef = useRef(new Map<string, SessionAttachmentInfo>())

  // The editor captures handleFileAttachment on creation, so route changing values through a ref.
  const uploadContextRef = useRef({
    accountId,
    sessionId,
  })
  uploadContextRef.current = {
    accountId,
    sessionId,
  }

  // Dropped/pasted files upload as session-private attachments on the agent server — never to
  // IPFS or agent memory. The agent sees metadata and pulls content on demand (view_attachment);
  // it can persist or publish one only via its explicit attachment tools. Large files go in
  // chunks so signing never freezes the renderer, with progress shown above the composer.
  async function handleFileAttachment(file: File) {
    const {accountId: currentAccountId, sessionId: currentSessionId} = uploadContextRef.current
    if (!currentAccountId) throw new Error('Select an account first')
    if (!currentSessionId) throw new Error('Send a message to start the chat before attaching files')
    const content = new Uint8Array(await file.arrayBuffer())
    setAttachmentUpload({
      name: file.name,
      sent: 0,
      total: content.byteLength,
    })
    try {
      const {attachment} = await uploadFileToAgentServer({
        serverUrl,
        accountUid: currentAccountId,
        target: {
          kind: 'session-attachment',
          sessionId: currentSessionId,
          name: file.name,
          mimeType: file.type || undefined,
        },
        data: content,
        onProgress: (progress) =>
          setAttachmentUpload({
            name: file.name,
            ...progress,
          }),
      })
      if (!attachment) throw new Error('Upload did not return an attachment')
      uploadedAttachmentsRef.current.set(attachment.id, attachment)
      return {
        displaySrc: URL.createObjectURL(file),
        url: `attachment://${attachment.id}`,
      }
    } finally {
      setAttachmentUpload(null)
    }
  }
  async function submitRichMessage(getContent: CommentEditorGetContent, reset: () => void) {
    const {blockNodes} = await getContent(async () => ({
      blobs: [],
      resultCIDs: [],
    }))
    const trimmedBlocks = trimTrailingEmptyBlocks(blockNodes)
    const markdown = promptBlocksToMarkdown(trimmedBlocks)
    if (!markdown.trim()) return
    // Only attachments still referenced by a block at submit time ride along with the message.
    const attachments = collectAttachmentIds(trimmedBlocks)
      .map((id) => uploadedAttachmentsRef.current.get(id))
      .filter((info): info is SessionAttachmentInfo => !!info)
    reset()
    setDraftMarkdown('')
    requestAnimationFrame(
      () =>
        submitHandleRef.current?.focus({
          moveCursorToEnd: true,
        }),
    )
    onSend({
      text: markdown,
      blocks: trimmedBlocks,
      ...(attachments.length
        ? {
            attachments,
          }
        : {}),
    })
  }
  if (disabledMessage) {
    return (
      <div className={stylex.props(styles.saa9e18e6).className || ''}>
        <div className={stylex.props(styles.sb5c8d341).className || ''}>{disabledMessage}</div>
      </div>
    )
  }
  return (
    <div className={stylex.props(styles.saa9e18e6).className || ''}>
      {attachmentUpload ? (
        <div className={stylex.props(styles.s34f4bddb).className || ''}>
          <div className="text-muted-foreground mb-1 flex items-center justify-between gap-2 text-[11px]">
            <span className="min-w-0 truncate">Uploading {attachmentUpload.name}…</span>
            <span className={stylex.props(styles.s948be48c).className || ''}>
              {Math.floor((attachmentUpload.sent / Math.max(1, attachmentUpload.total)) * 100)}%
            </span>
          </div>
          <div className={stylex.props(styles.s6bbccae4).className || ''}>
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-200"
              style={{
                width: `${(attachmentUpload.sent / Math.max(1, attachmentUpload.total)) * 100}%`,
              }}
            />
          </div>
        </div>
      ) : null}
      <div className={stylex.props(styles.sb57c4182).className || ''}>
        {/* The compact chat sizing is desktop-only: iOS Safari zooms the whole page whenever a
            focused field is under 16px, so phones get 16px in the composer instead. */}
        <div className="min-w-0 flex-1 font-sans [&_.ProseMirror]:font-sans max-sm:[&_.ProseMirror]:!text-base sm:[&_.ProseMirror]:!text-sm [&_.comment-editor]:!min-h-8 [&_.comment-editor]:!pt-1 [&_.comment-editor]:!pb-1 [&_.comment-editor]:font-sans sm:[&_.comment-editor]:!text-sm [&_.comment-editor_.ProseMirror]:!min-h-0 [&_.comment-editor_.bn-editor]:!min-h-0 sm:[&_.hm-prose]:!text-sm">
          <CommentEditor
            focusOnMount={focusOnMount}
            hideAvatar
            hideSubmitToolbar
            disableTrailingNode
            submitOnEnter
            submitHandleRef={submitHandleRef}
            handleFileAttachment={sessionId ? handleFileAttachment : undefined}
            initialBlocks={[]}
            onContentChange={(blocks) => setDraftMarkdown(promptBlocksToMarkdown(trimTrailingEmptyBlocks(blocks)))}
            handleSubmit={(getContent, reset) => void submitRichMessage(getContent, reset)}
            submitButton={() => <></>}
          />
        </div>
        <div className={stylex.props(styles.sde768909).className || ''}>
          {canInvokeTools ? (
            <UserToolPalette
              serverUrl={serverUrl}
              accountId={accountId}
              sessionId={sessionId}
              agentTools={agentTools}
              agentToolsLoading={agentToolsLoading}
              disabled={isBusy}
              onStartSession={sessionId ? undefined : onToolStartSession}
              onSessionStarted={onToolSessionStarted}
            />
          ) : null}
          {draftMarkdown.trim() ? (
            <Button
              size="sm"
              className="max-sm:size-10"
              onClick={() => submitHandleRef.current?.submit()}
              title={isBusy ? 'Send while the agent is working' : 'Send'}
            >
              <Send className={stylex.props(styles.s3269316e).className || ''} />
            </Button>
          ) : !isBusy ? (
            <Button size="sm" className="max-sm:size-10" disabled>
              <Send className={stylex.props(styles.s3269316e).className || ''} />
            </Button>
          ) : null}
          {isStreaming ? (
            <Button size="sm" variant="destructive" className="max-sm:size-10" onClick={onStop} disabled={stopPending}>
              <Square className={stylex.props(styles.sca3de967).className || ''} />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Collects attachment ids referenced by attachment:// links anywhere in a message block tree. */
function collectAttachmentIds(blocks: unknown[]): string[] {
  const ids: string[] = []
  const visit = (nodes: unknown[]) => {
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue
      const {block, children} = node as {
        block?: {
          link?: unknown
        }
        children?: unknown
      }
      const link = block?.link
      if (typeof link === 'string' && link.startsWith('attachment://')) {
        const id = link.slice('attachment://'.length)
        if (id && !ids.includes(id)) ids.push(id)
      }
      if (Array.isArray(children) && children.length) visit(children)
    }
  }
  visit(blocks)
  return ids
}
