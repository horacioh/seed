import * as stylex from '@stylexjs/stylex'
import {roleCanWrite, useSelectedAccountCapability} from '@/models/access-control'
import {useDeleteKey} from '@/models/daemon'
import {useListSite} from '@/models/documents'
import {hmId} from '@shm/shared'
import {getDocumentTitle, getMetadataName} from '@shm/shared/content'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useResource} from '@shm/shared/models/entity'
import {Button, ButtonProps} from '@shm/ui/button'
import {DeleteDocumentDialog as SharedDeleteDocumentDialog} from '@shm/ui/delete-document-dialog'
import {Spinner} from '@shm/ui/spinner'
import {Text} from '@shm/ui/text'
import {useAppDialog} from '@shm/ui/universal-dialog'
import React, {ReactNode} from 'react'
import {useDeleteEntities} from '../models/entities'
const styles = stylex.create({
  s9a378369: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s11c1d1bc: {
    color: 'var(--destructive)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sd9ba56bc: {
    backgroundColor: 'var(--background)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 4)',
  },
  saf49316c: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sb87f7413: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 3)',
  },
})
export type DeleteDialogProps = {
  trigger?: (props: {onClick: ButtonProps['onClick']}) => JSX.Element
  cancelButton?: ReactNode
  actionButton?: ReactNode
  title: string
  description: string
}
export function useDeleteDialog() {
  return useAppDialog(DeleteDocumentDialog, {
    isAlert: true,
  })
}
export function DeleteDocumentDialog({
  input: {id, onSuccess},
  onClose,
}: {
  input: {
    id: UnpackedHypermediaId
    onSuccess?: () => void
  }
  onClose?: () => void
}) {
  const list = useListSite(id)
  const parentPath = id.path ?? []
  const childDocs =
    list.data?.filter((item) => {
      if (!item.path?.length) return false
      if (parentPath.length === item.path.length) return false
      return parentPath.every((segment, index) => item.path[index] === segment)
    }) || []
  const deleteEntity = useDeleteEntities({})
  const cap = useSelectedAccountCapability(id)
  const doc = useResource(id)
  if (doc.isLoading)
    return (
      <div className={stylex.props(styles.s9a378369).className || ''}>
        <Spinner />
      </div>
    )
  if (doc.isError || doc.data?.type !== 'document')
    return (
      <Text className={stylex.props(styles.s11c1d1bc).className || ''}>
        {doc.error ? String(doc.error) : 'Could not load document'}
      </Text>
    )
  const childDocIds = childDocs.map((item) =>
    hmId(id.uid, {
      path: item.path,
    }),
  )
  const document = doc.data.document
  return (
    <SharedDeleteDocumentDialog
      document={{
        key: id.id,
        title: getDocumentTitle(document),
        path: id.path,
      }}
      childDocuments={childDocs.map((item) => ({
        key: item.id.id,
        title: getMetadataName(item.metadata),
        path: item.path,
      }))}
      canDelete={!!cap && roleCanWrite(cap.role)}
      onConfirm={() =>
        deleteEntity.mutateAsync({
          ids: [id, ...childDocIds],
          signingAccountUid: cap!.accountUid,
          capabilityId: cap!.capabilityId,
        })
      }
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
export function useDeleteKeyDialog() {
  const c = useAppDialog(DeleteKeyDialog, {
    isAlert: true,
  })
  return c
}
export function DeleteKeyDialog({
  input: {accountId, onSuccess},
  onClose,
}: {
  input: {
    accountId: string
    onSuccess?: () => void
  }
  onClose?: () => void
}) {
  const deleteKey = useDeleteKey()
  return (
    <div className={stylex.props(styles.sd9ba56bc).className || ''}>
      <Text className={stylex.props(styles.saf49316c).className || ''}>Delete Key</Text>
      <Text className={stylex.props(styles.sa56e915f).className || ''}>
        Are you sure you want to delete this key from your computer? You will NOT be able to recover this neither sign
        content with this identity.
      </Text>

      <div className={stylex.props(styles.sb87f7413).className || ''}>
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            deleteKey.mutate({
              accountId,
            })
            onSuccess?.()
            onClose?.()
          }}
        >
          Delete Key
        </Button>
      </div>
    </div>
  )
}
