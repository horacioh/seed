import * as stylex from '@stylexjs/stylex'
import React from 'react'
import {Button} from './button'
import {Text} from './text'
import {toast} from './toast'
import {cn} from './utils'
const styles_4 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
})
const styles_3 = stylex.create({
  sed5953ff: {
    backgroundColor: 'color-mix(in oklab, var(--destructive) 15%, transparent)',
    display: 'flex',
    width: 'calc(var(--spacing) * 8)',
    height: 'calc(var(--spacing) * 8)',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  sf01b85e8: {
    borderColor: 'color-mix(in oklab, var(--destructive) 20%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--destructive) 3%, transparent)',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sb1ab7538: {
    color: 'var(--primary)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--primary) 80%, transparent)',
      },
    },
    ':focus-visible': {
      boxShadow: '0 0 0 3px currentcolor',
    },
    borderRadius: 'calc(var(--radius) - 4px)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    outlineStyle: 'none',
  },
})
const styles_2 = stylex.create({
  sf3690bef: {
    minWidth: 'calc(0.25rem * 0)',
    fontSize: '1.5rem',
    lineHeight: '1.25',
    fontWeight: '600',
  },
  s3b867143: {
    borderColor: 'var(--border)',
    maxHeight: 'calc(0.25rem * 56)',
    overflowY: 'auto',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  secd636e1: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
})
const styles = stylex.create({
  sfbc6e293: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 7)',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sbe9e10ab: {
    backgroundColor: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    display: 'flex',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
    fontSize: '1rem',
    lineHeight: '1',
    fontWeight: '700',
  },
  s7ca58426: {
    color: 'var(--muted-foreground)',
    fontSize: '1rem',
    lineHeight: 'calc(0.25rem * 7)',
  },
  s87791731: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sebff7442: {
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
    fontWeight: '600',
  },
  s8245ef4d: {
    display: 'flex',
    flexShrink: '0',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 3)',
  },
  s59c17cd3: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  s2627021c: {
    color: 'var(--muted-foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
})
export type DeleteDocumentDialogItem = {
  key: string
  title: string
  path?: string[] | null
}
export type DeleteDocumentDialogProps = {
  document: DeleteDocumentDialogItem
  childDocuments?: DeleteDocumentDialogItem[]
  canDelete?: boolean
  cannotDeleteReason?: string
  onConfirm: () => Promise<void> | void
  onClose?: () => void
  onSuccess?: () => void
  className?: string
}

/** Shared confirmation UI for deleting a document and its child documents. */
export function DeleteDocumentDialog({
  document,
  childDocuments = [],
  canDelete = true,
  cannotDeleteReason = 'Not allowed to delete',
  onConfirm,
  onClose,
  onSuccess,
  className,
}: DeleteDocumentDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showChildDocuments, setShowChildDocuments] = React.useState(false)
  const childDocumentListId = React.useId()
  const deletedDocumentCount = childDocuments.length + 1
  const documentLabel = deletedDocumentCount === 1 ? 'document' : 'documents'
  const hasChildren = childDocuments.length > 0
  const childDocumentLabel = childDocuments.length === 1 ? 'document' : 'documents'
  async function handleConfirm() {
    if (!canDelete) {
      toast.error(cannotDeleteReason)
      return
    }
    const deletePromise = Promise.resolve(onConfirm())
    setIsDeleting(true)
    toast.promise(deletePromise, {
      loading: deletedDocumentCount === 1 ? 'Deleting document…' : `Deleting ${deletedDocumentCount} documents…`,
      success:
        deletedDocumentCount === 1
          ? 'Successfully deleted document'
          : `Successfully deleted ${deletedDocumentCount} documents`,
      error: (error) => {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return deletedDocumentCount === 1
          ? `Failed to delete document: ${message}`
          : `Failed to delete ${documentLabel}: ${message}`
      },
    })
    try {
      await deletePromise
      onClose?.()
      onSuccess?.()
    } catch {
      // The toast already presents the error; keep the dialog open for retry.
    } finally {
      setIsDeleting(false)
    }
  }
  return (
    <div className={cn(stylex.props(styles.sfbc6e293).className || '', className)}>
      <div className={stylex.props(styles.sfbc6e290).className || ''}>
        <div className={stylex.props(styles.s86ff3e5).className || ''}>
          <span className={stylex.props(styles_3.sed5953ff).className || ''}>
            <span className={stylex.props(styles.sbe9e10ab).className || ''}>!</span>
          </span>
          <Text className={stylex.props(styles_2.sf3690bef).className || ''}>Delete &quot;{document.title}&quot;?</Text>
        </div>
        <Text className={stylex.props(styles.s7ca58426).className || ''}>
          This permanently removes the document and all its content. Links pointing to it from other documents will
          break.
        </Text>
      </div>

      {hasChildren ? (
        <div className={stylex.props(styles_3.sf01b85e8).className || ''} data-testid="delete-document-child-section">
          <div className={stylex.props(styles.s87791731).className || ''}>
            <Text className={stylex.props(styles.sebff7442).className || ''}>
              {childDocuments.length} {childDocumentLabel} will also be deleted
            </Text>
            <button
              type="button"
              aria-controls={showChildDocuments ? childDocumentListId : undefined}
              aria-expanded={showChildDocuments}
              className={stylex.props(styles_3.sb1ab7538).className || ''}
              onClick={() => setShowChildDocuments((visible) => !visible)}
            >
              {showChildDocuments ? 'Hide' : 'Show'}
            </button>
          </div>
          {showChildDocuments ? (
            <div
              id={childDocumentListId}
              className={stylex.props(styles_2.s3b867143).className || ''}
              data-testid="delete-document-child-list"
            >
              <div className={stylex.props(styles_4.s2ffff9, styles_4.s67e351ac).className || ''}>
                {childDocuments.map((item) => (
                  <DeletionListItem key={item.key} item={item} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={stylex.props(styles.s8245ef4d).className || ''} data-testid="delete-document-footer">
        <Button onClick={onClose} variant="outline" disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
          Delete document
        </Button>
      </div>
    </div>
  )
}
function DeletionListItem({item}: {item: DeleteDocumentDialogItem}) {
  return (
    <div className={stylex.props(styles_2.secd636e1).className || ''} data-testid="delete-document-child-item">
      <Text className={stylex.props(styles.s59c17cd3).className || ''}>{item.title}</Text>
      <Text className={stylex.props(styles.s2627021c).className || ''}>{item.path?.join('/') || 'Unknown path'}</Text>
    </div>
  )
}
