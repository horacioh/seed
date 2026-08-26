import * as stylex from '@stylexjs/stylex'
import React from 'react'
import {Button} from './button'
import {Text} from './text'
import {toast} from './toast'
import {cn} from './utils'
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
          <span className="bg-destructive/15 flex size-8 shrink-0 items-center justify-center rounded-full">
            <span className={stylex.props(styles.sbe9e10ab).className || ''}>!</span>
          </span>
          <Text className="min-w-0 text-2xl leading-tight font-semibold">Delete &quot;{document.title}&quot;?</Text>
        </div>
        <Text className={stylex.props(styles.s7ca58426).className || ''}>
          This permanently removes the document and all its content. Links pointing to it from other documents will
          break.
        </Text>
      </div>

      {hasChildren ? (
        <div
          className="border-destructive/20 bg-destructive/[0.03] overflow-hidden rounded-lg border"
          data-testid="delete-document-child-section"
        >
          <div className={stylex.props(styles.s87791731).className || ''}>
            <Text className={stylex.props(styles.sebff7442).className || ''}>
              {childDocuments.length} {childDocumentLabel} will also be deleted
            </Text>
            <button
              type="button"
              aria-controls={showChildDocuments ? childDocumentListId : undefined}
              aria-expanded={showChildDocuments}
              className="text-primary hover:text-primary/80 focus-visible:ring-ring/50 rounded-sm text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]"
              onClick={() => setShowChildDocuments((visible) => !visible)}
            >
              {showChildDocuments ? 'Hide' : 'Show'}
            </button>
          </div>
          {showChildDocuments ? (
            <div
              id={childDocumentListId}
              className="border-border max-h-56 overflow-y-auto border-t px-4 py-3"
              data-testid="delete-document-child-list"
            >
              <div className="flex flex-col divide-y">
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
    <div className="flex min-w-0 flex-col gap-1 py-3" data-testid="delete-document-child-item">
      <Text className={stylex.props(styles.s59c17cd3).className || ''}>{item.title}</Text>
      <Text className={stylex.props(styles.s2627021c).className || ''}>{item.path?.join('/') || 'Unknown path'}</Text>
    </div>
  )
}
