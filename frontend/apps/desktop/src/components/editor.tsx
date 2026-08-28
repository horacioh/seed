import * as stylex from '@stylexjs/stylex'
import {
  BlockHoverActionsPositioner,
  BlockNoteView,
  FormattingToolbarPositioner,
  FullBlockSelectionObserver,
  HyperlinkToolbarPositioner,
  ImageGalleryOverlay,
  LinkMenuPositioner,
  PredictionConeDebugOverlay,
  RangeSelectionPositioner,
  SideMenuPositioner,
  SlashMenuPositioner,
  SupernumbersController,
} from '@shm/editor/blocknote'
import type {SupernumbersData} from '@shm/editor/blocknote/core'
import '@shm/editor/blocknote/core/style.css'
import '@shm/editor/editor.css'
import {FragmentActionsContext, type FragmentActions} from '@shm/editor/fragment-actions-context'
import {HMFormattingToolbar} from '@shm/editor/hm-formatting-toolbar'
import {HypermediaLinkPreview} from '@shm/editor/hm-link-preview'
import {MentionMenuPositioner} from '@shm/editor/mention-menu-positioner'
import type {HyperMediaEditor} from '@shm/editor/types'
import {useSelectedAccountId} from '@/selected-account'
import {useUniversalAppContext} from '@shm/shared'
import {useMemo, useState} from 'react'
import {AddBlockAtEndButton} from './add-block-at-end-button'
const styles_2 = stylex.create({
  sc1b073e6: {
    position: 'fixed',
    bottom: 'calc(var(--spacing) * 3)',
    left: 'calc(var(--spacing) * 3)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1.5)',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--tone-neutral-300)',
    backgroundColor: 'var(--tone-neutral-900)',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    color: 'var(--color-neutral-100)',
    boxShadow: 'var(--shadow-lg)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--tone-neutral-800)',
      },
    },
  },
})
const styles = stylex.create({
  s7470bbe2: {
    display: 'inline-block',
    width: 'calc(0.25rem * 2)',
    height: 'calc(0.25rem * 2)',
    borderRadius: 'calc(infinity * 1px)',
  },
})
export function HyperMediaEditorView({
  editor,
  comment,
  openUrl,
  blockCitations,
  hasPublishedVersion,
  onCopyBlockLink,
  onStartComment,
  onCopyFragmentLink,
  onComment,
  onSupernumberClick,
  onBlocksFullSelected,
  resolveImageUrl,
}: {
  editor: HyperMediaEditor
  comment?: boolean
  openUrl: (url: string, newWindow?: boolean) => void
  blockCitations?: SupernumbersData | null
  /** Whether this document has been published before. Controls visibility of Copy Link, Comment, Supernumber actions. */
  hasPublishedVersion?: boolean
  onCopyBlockLink?: (blockId: string) => void
  onStartComment?: (blockId: string) => void
  onCopyFragmentLink?: (blockId: string, rangeStart: number, rangeEnd: number) => void
  onComment?: (blockId: string, rangeStart: number, rangeEnd: number) => void
  onSupernumberClick?: (blockId: string) => void
  /** Called when the set of fully-selected blocks changes. */
  onBlocksFullSelected?: (blockIds: string[]) => void
  resolveImageUrl?: (url: string) => string
}) {
  const selectedAccountId = useSelectedAccountId()
  const {experiments} = useUniversalAppContext()

  // Debug toggle state — forces re-render when toggled so toolbar suppression updates
  const [editableOverride, setEditableOverride] = useState<boolean | null>(null)
  const editable = editableOverride ?? editor.isEditable

  // Memoize the fragment actions so the context value is stable.
  const fragmentActionsValue = useMemo<FragmentActions | null>(() => {
    if (!hasPublishedVersion || !onCopyFragmentLink || !onComment) return null
    return {
      onCopyFragmentLink,
      onComment,
    }
  }, [hasPublishedVersion, onCopyFragmentLink, onComment])
  return (
    <FragmentActionsContext.Provider value={fragmentActionsValue}>
      <BlockNoteView editor={editor} className={comment ? 'hm-prose is-comment' : 'hm-prose draft-editor'}>
        {editable && (
          <>
            <FormattingToolbarPositioner editor={editor} formattingToolbar={HMFormattingToolbar} />
            <SlashMenuPositioner editor={editor} />
            <LinkMenuPositioner editor={editor} />
          </>
        )}
        <HyperlinkToolbarPositioner
          // @ts-expect-error
          hyperlinkToolbar={HypermediaLinkPreview}
          editor={editor}
          // @ts-expect-error
          openUrl={openUrl}
        />
        <MentionMenuPositioner editor={editor} perspectiveAccountUid={selectedAccountId} />
        {editable && !comment ? <SideMenuPositioner editor={editor} placement="left" /> : null}
        {!editable && hasPublishedVersion && (
          <>
            <BlockHoverActionsPositioner
              editor={editor}
              onCopyBlockLink={onCopyBlockLink}
              onStartComment={onStartComment}
              getCommentCount={(blockId) => blockCitations?.[blockId]?.comments}
            />
            <RangeSelectionPositioner editor={editor} onCopyFragmentLink={onCopyFragmentLink} onComment={onComment} />
          </>
        )}
        <FullBlockSelectionObserver editor={editor} onBlocksFullSelected={onBlocksFullSelected} />
        {experiments?.developerTools && <PredictionConeDebugOverlay editor={editor} />}
      </BlockNoteView>
      <ImageGalleryOverlay editor={editor} resolveImageUrl={resolveImageUrl} />
      {hasPublishedVersion && (
        <SupernumbersController editor={editor} data={blockCitations ?? null} onSupernumberClick={onSupernumberClick} />
      )}
      {editable && !comment ? <AddBlockAtEndButton editor={editor} /> : null}
      <EditorEditableToggle
        editor={editor}
        onToggle={(next) => {
          editor.isEditable = next
          setEditableOverride(next)
        }}
      />
    </FragmentActionsContext.Provider>
  )
}

/**
 * Debug toggle for editor editable state.
 * Only renders when the developerTools experiment flag is enabled.
 */
function EditorEditableToggle({editor, onToggle}: {editor: HyperMediaEditor; onToggle: (editable: boolean) => void}) {
  const experiments = useUniversalAppContext().experiments
  if (!experiments?.developerTools) return null
  const editable = editor.isEditable
  return (
    <button
      onClick={() => onToggle(!editable)}
      className={stylex.props(styles_2.sc1b073e6).className || ''}
      title="Toggle editor editable state (debug)"
    >
      <span
        className={stylex.props(styles.s7470bbe2).className || ''}
        style={{
          backgroundColor: editable ? '#22c55e' : '#ef4444',
        }}
      />
      {editable ? 'editable' : 'readOnly'}
    </button>
  )
}
