import * as stylex from '@stylexjs/stylex'
import {DraftStatus, draftStatus} from '@/draft-status'
import {reportError} from '@/errors'
import {draftEditId, draftLocationId} from '@/models/drafts'
import {useGatewayUrl, usePushOnPublish} from '@/models/gateway-settings'
import {useSelectedAccount} from '@/selected-account'
import {client} from '@/trpc'
import {pathNameify} from '@/utils/path'
import {
  computeInlineDraftPublishPath,
  computePublishPath,
  shouldAutoLinkParent,
  validatePublishPath,
} from '@/utils/publish-utils'
import {useNavigate} from '@/utils/useNavigate'
import {useBroadcastWindowEvent} from '@/utils/window-events'
import {HMDocument, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useResource} from '@shm/shared/models/entity'
import {invalidateQueries} from '@shm/shared/models/query-client'
import {queryKeys} from '@shm/shared/models/query-keys'
import {DraftRoute} from '@shm/shared/routes'
import {validatePath} from '@shm/shared/utils/document-path'
import {createSiteUrl, createWebHMUrl, hmId} from '@shm/shared/utils/entity-id-url'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {entityQueryPathToHmIdPath} from '@shm/shared/utils/path-api'
import {writeableStateStream} from '@shm/shared/utils/stream'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {copyTextToClipboard} from '@shm/ui/copy-to-clipboard'
import {AlertCircle, Check, Copy} from '@shm/ui/icons'
import {PublishedToast, PushResourceStatus} from '@shm/ui/push-toast'
import {Separator} from '@shm/ui/separator'
import {Spinner} from '@shm/ui/spinner'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {usePopoverState} from '@shm/ui/use-popover-state'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useDraft} from '../models/accounts'
import {
  addLinkToParentDraft,
  publishLinkToParentDocument,
  usePublishResource,
  usePushResource,
} from '../models/documents'
const styles = stylex.create({
  s36c80e: {
    width: 'calc(0.25rem * 80)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s9d4b128d: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s8e245ec4: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sa56e9200: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s11c1d25d: {
    color: 'var(--destructive)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s396b6e9f: {
    backgroundColor: 'var(--destructive)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1)',
    color: '#fff',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sa3871be7: {
    height: 'auto',
    padding: 'calc(0.25rem * 0)',
  },
})
export default function PublishDraftButton() {
  const route = useNavRoute()
  const navigate = useNavigate('replace')
  const draftRoute: DraftRoute | null = route.key === 'draft' ? route : null
  if (!draftRoute) throw new Error('PublishDraftButton requires draft route')
  const draftId = draftRoute.id
  const draft = useDraft(draftId)
  const pushOnPublish = usePushOnPublish()
  const editId = draftRoute.editUid
    ? hmId(draftRoute.editUid, {
        path: draftRoute.editPath,
      })
    : draftEditId(draft.data)
  const deleteDraft = useMutation({
    mutationFn: (draftId: string) => client.drafts.delete.mutate(draftId),
    onSuccess: () => {
      invalidateQueries([queryKeys.DRAFT])
    },
  })
  const pushResource = usePushResource()
  const publish = usePublishResource(
    editId
      ? {
          ...editId,
          version: draft.data?.deps[0] || null,
        }
      : undefined,
  )
  const signingAccount = useSelectedAccount()
  const broadcastWindowEvent = useBroadcastWindowEvent()
  const signingAccountId = signingAccount?.id.uid

  // Inline first-publish detection: drafts created via `useCreateInlineDraft`
  // carry a placeholder editPath `[..parent, -${draftId}]`. Their `editId` is
  // set, but no doc exists at that path yet — so we still want to treat the
  // publish as a first publish (slugify the path, show the editable
  // permalink, link to parent on success).
  const draftEditPath = draft.data?.editPath ?? draftRoute.editPath ?? null
  const draftHasPlaceholderEdit = !!draftEditPath && draftEditPath.length > 0 && draftEditPath.at(-1) === `-${draftId}`
  const editResource = useResource(editId && !draftHasPlaceholderEdit ? editId : undefined)
  const editTargetExists = editResource.data?.type === 'document' ? !!editResource.data.document?.version : false
  const isLegacyFirstPublish = !editId
  const isInlineFirstPublish = !!editId && (draftHasPlaceholderEdit || (editResource.isFetched && !editTargetExists))
  const isFirstPublish = isLegacyFirstPublish || isInlineFirstPublish
  const isPrivate = draftRoute.visibility === 'PRIVATE' || draft.data?.visibility === 'PRIVATE'
  const defaultLocationId = draftLocationId(draft.data)

  // For first publish, we need editable location state
  const [editableLocation, setEditableLocation] = useState<UnpackedHypermediaId | null>(null)

  // Track if location is available (not already taken)
  const isLocationAvailable = useRef(true)

  // Inline error shown below the path input when publish fails during first publish
  const [publishError, setPublishError] = useState<string | null>(null)

  // Parent auto-link state for first publish
  type ParentPublishInfo = {
    parentId: UnpackedHypermediaId
    parentDocument: HMDocument | null
    hasDraft: boolean
    draftId?: string
    willAddLink: boolean
  }
  const [parentPublishInfo, setParentPublishInfo] = useState<ParentPublishInfo | null>(null)

  // Compute parent ID from the destination location
  const parentId = useMemo(() => {
    if (!isFirstPublish) return null
    const destLocation = editableLocation
    if (!destLocation) return null
    // Parent path is everything except the last segment
    const parentPath = destLocation.path?.slice(0, -1) || []
    return hmId(destLocation.uid, {
      path: parentPath,
    })
  }, [isFirstPublish, editableLocation])

  // Fetch parent document resource
  const {data: parentResource, refetch: refetchParentResource} = useResource(
    parentId
      ? hmId(parentId.uid, {
          path: parentId.path,
          latest: true,
        })
      : undefined,
    {
      staleTime: 0,
    }, // Always fetch fresh data
  )
  const parentDocument = parentResource?.type === 'document' ? parentResource.document : null

  // Check if parent has an existing draft
  const {data: parentDraft, refetch: refetchParentDraft} = useQuery({
    queryKey: [queryKeys.DRAFT, 'findByEdit', parentId?.uid, parentId?.path],
    queryFn: () =>
      parentId
        ? client.drafts.findByEdit.query({
            editUid: parentId.uid,
            editPath: parentId.path || [],
          })
        : null,
    enabled: isFirstPublish && !!parentId,
    staleTime: 0, // Always fetch fresh data
  })

  // Compute parent publish info when dependencies change
  useEffect(() => {
    if (!isFirstPublish || !parentId || !editableLocation) {
      setParentPublishInfo(null)
      return
    }
    const willAddLink = shouldAutoLinkParent(!!isPrivate, parentDocument, editableLocation, parentId)
    setParentPublishInfo({
      parentId,
      parentDocument,
      hasDraft: !!parentDraft,
      draftId: parentDraft?.id,
      willAddLink,
    })
  }, [isFirstPublish, isPrivate, parentId, editableLocation, parentDocument, parentDraft])

  // Track initialization params to avoid redundant updates
  const initializedWith = useRef<{
    name: string
    locationUid: string | undefined
  } | null>(null)

  // Initialize editable location when signingAccountId becomes available
  useEffect(() => {
    if (!isFirstPublish) return
    if (!signingAccountId) return
    const docName = draft.data?.metadata.name || ''
    const locationUid = defaultLocationId?.uid

    // Skip if we already initialized with these exact values
    if (initializedWith.current?.name === docName && initializedWith.current?.locationUid === locationUid) {
      return
    }
    initializedWith.current = {
      name: docName,
      locationUid,
    }

    // Inline first-publish: replace the placeholder `-${draftId}` segment
    // with a slugified title via `computeInlineDraftPublishPath`. Falls back
    // to `untitled-${draftId}` so two untitled drafts don't collide.
    if (isInlineFirstPublish && editId) {
      const inlinePath = computeInlineDraftPublishPath(editId.path ?? [], docName, draftId)
      setEditableLocation(
        hmId(editId.uid, {
          path: inlinePath,
        }),
      )
      return
    }

    // Legacy first-publish: anchor on the draft's location, append the slug
    // (or keep the random-id path for private docs).
    const baseUid = locationUid || signingAccountId
    const basePath = defaultLocationId?.path || []
    setEditableLocation(
      hmId(baseUid, {
        path: computePublishPath(!!isPrivate, basePath, docName),
      }),
    )
  }, [
    isFirstPublish,
    isInlineFirstPublish,
    editId,
    draftId,
    signingAccountId,
    defaultLocationId,
    draft.data?.metadata.name,
  ])

  // Use editable location for first publish, otherwise use editId
  const locationId = isFirstPublish ? editableLocation : editId
  const gatewayUrl = useGatewayUrl()
  const {data: siteResource} = useResource(
    locationId
      ? hmId(locationId.uid, {
          latest: true,
        })
      : undefined,
  )
  const siteDocument = siteResource?.type === 'document' ? siteResource.document : undefined

  // Compute parent URL (site root or parent path)
  const parentUrl = useMemo(() => {
    if (!locationId || !gatewayUrl.data) return null
    const siteUrl = siteDocument?.metadata?.siteUrl
    const parentPath = locationId.path?.slice(0, -1) || []
    if (siteUrl) {
      return createSiteUrl({
        path: parentPath,
        hostname: siteUrl,
      })
    }
    return createWebHMUrl(locationId.uid, {
      path: parentPath,
      hostname: gatewayUrl.data,
    })
  }, [locationId, gatewayUrl.data, siteDocument?.metadata?.siteUrl])
  const documentUrl = useMemo(() => {
    if (!locationId || !gatewayUrl.data) return null
    const siteUrl = siteDocument?.metadata?.siteUrl
    if (siteUrl) {
      return createSiteUrl({
        path: locationId.path,
        hostname: siteUrl,
      })
    }
    return createWebHMUrl(locationId.uid, {
      path: locationId.path,
      hostname: gatewayUrl.data,
    })
  }, [locationId, gatewayUrl.data, siteDocument?.metadata?.siteUrl])

  // Get the editable path segment (last part of the path)
  const editablePath = editableLocation?.path?.at(-1) || ''

  // Wrap handlePublishPress as async so errors from handlePublish are awaited
  // and unhandled-promise-rejection warnings are avoided. Errors that need
  // user-facing feedback are handled (toasted) inside handlePublish / mutations.
  async function handlePublishPress() {
    if (!draftId) throw new Error('No Draft ID?!')
    if (!draft.data) {
      throw new Error('Draft not loaded')
    }
    async function handlePublish(destinationId: UnpackedHypermediaId, accountId: string) {
      if (!draft.data) {
        toast.error('Draft not loaded')
        throw new Error('Draft not loaded')
      }

      // Step 1: Publish the child document
      const res = await publish.mutateAsync({
        draft: draft.data,
        destinationId,
        accountId,
      })
      const resultPath = entityQueryPathToHmIdPath(res.path)
      const childResultId = hmId(res.account, {
        path: resultPath,
      })
      const resultDocId = hmId(res.account, {
        path: resultPath,
        latest: true,
      })

      // Step 2: Handle parent auto-link BEFORE anything else
      let parentResultDoc: HMDocument | null = null
      const shouldAddLinkToParent = parentPublishInfo?.willAddLink
      if (shouldAddLinkToParent && accountId) {
        try {
          const navigateToParent = () => {
            navigate({
              key: 'document',
              id: hmId(parentPublishInfo.parentId.uid, {
                path: parentPublishInfo.parentId.path,
                latest: true,
              }),
            })
          }
          if (parentPublishInfo.hasDraft && parentPublishInfo.draftId) {
            // Add to draft - no push needed for parent
            await addLinkToParentDraft(parentPublishInfo.draftId, childResultId)
            // Show success toast for draft update
            toast.success(<ParentUpdateToast message="Link added to parent draft" onViewParent={navigateToParent} />)
            // Tell every window holding this draft open that its on-disk
            // content has changed under it (the parent's editor in another
            // window keeps stale ProseMirror state).
            broadcastWindowEvent({
              type: 'draft_externally_modified',
              draftId: parentPublishInfo.draftId,
            })
          } else if (parentPublishInfo.parentDocument) {
            // Publish to parent document
            parentResultDoc = await publishLinkToParentDocument(
              parentPublishInfo.parentId,
              parentPublishInfo.parentDocument,
              childResultId,
              accountId,
            )
            // Show success toast for parent publish
            toast.success(<ParentUpdateToast message="Parent document updated" onViewParent={navigateToParent} />)
          }
        } catch (error) {
          console.error('Failed to add link to parent:', error)
          toast.error('Published document, but failed to add link to parent')
        }
      }

      // Step 3: Delete the draft
      if (resultDocId && draftId) {
        await deleteDraft.mutateAsync(draftId).catch((e) => {
          console.error('Failed to delete draft', e)
        })
        invalidateQueries([queryKeys.DRAFT])
        invalidateQueries([queryKeys.DRAFTS_LIST])
        invalidateQueries([queryKeys.DRAFTS_LIST_ACCOUNT])
      }

      // Step 4: Navigate to the published document
      if (resultDocId) {
        const hasAlreadyPrompted = await client.prompting.getPromptedKey.query(
          `account-email-notifs-${resultDocId.uid}`,
        )
        navigate({
          key: 'document',
          panel: route.key == 'draft' && route.panel?.key == 'activity' ? route.panel : null,
          id: resultDocId,
          immediatelyPromptNotifs: !hasAlreadyPrompted,
        })
      }

      // Step 5: Handle push workflow (in background, after navigation)
      if (pushOnPublish.data !== 'never' && res.version) {
        const [setPushStatus, pushStatus] = writeableStateStream<PushResourceStatus | null>(null)

        // Push child document
        const childPushPromise = pushResource(childResultId, undefined, setPushStatus)

        // Push parent document if we published changes to it
        if (parentResultDoc) {
          const parentResultId = hmId(parentResultDoc.account, {
            path: entityQueryPathToHmIdPath(parentResultDoc.path),
            version: parentResultDoc.version,
          })
          pushResource(parentResultId).catch((err) => {
            console.error('Failed to push parent document:', err)
            reportError(err, {
              feature: 'publish-draft',
              operation: 'push-parent',
              parentResourceId: parentResultId.id,
              childResourceId: childResultId.id,
            })
          })
        }
        toast.promise(childPushPromise, {
          loading: <PublishedToast pushStatus={pushStatus} status="loading" />,
          success: <PublishedToast pushStatus={pushStatus} status="success" />,
          error: (err) => <PublishedToast pushStatus={pushStatus} status="error" errorMessage={err.message} />,
        })
      }
    }
    setPublishError(null)
    if (editId && signingAccountId && !isInlineFirstPublish) {
      // Editing an existing document — keep the existing path as-is.
      await handlePublish(editId, signingAccountId).catch((err) => {
        console.error('Publish failed:', err)
        toast.error(err.message || 'Publish failed')
        reportError(err, {
          feature: 'publish-draft',
          operation: 'publish-existing',
          editId: editId.id,
          signingAccountId,
        })
      })
    } else if (editableLocation && signingAccountId) {
      // First publish with editable location from popover
      if (!isLocationAvailable.current) {
        setPublishError('This location is unavailable. Create a new path name.')
        return
      }
      const pathError = validatePublishPath(!!isPrivate, editableLocation.path, validatePath)
      if (pathError) {
        setPublishError(pathError)
        return
      }
      await handlePublish(editableLocation, signingAccountId).catch((err) => {
        console.error('Publish failed:', err)
        setPublishError(err.message || 'Failed to publish. Try a different path name.')
        reportError(err, {
          feature: 'publish-draft',
          operation: 'publish-first',
          editableLocation,
          signingAccountId,
        })
      })
    } else {
      toast.error('Cannot publish: missing location or account')
    }
  }

  // Refetch parent data when popover opens to handle edge case where
  // parent state changes between creating the draft and publishing
  const popoverState = usePopoverState(false, (isOpen) => {
    if (isOpen && isFirstPublish && parentId) {
      refetchParentResource()
      refetchParentDraft()
    }
  })
  return (
    <>
      <SaveIndicatorStatus />
      <Popover {...popoverState}>
        <Tooltip content={signingAccount ? `Publish as ${signingAccount?.metadata?.name}` : 'Publish Document…'}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="brand">
              Publish
            </Button>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent
          align="end"
          className={stylex.props(styles.s36c80e).className || ''}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement)?.focus()
          }}
        >
          <div className={stylex.props(styles.sfbc6e28f).className || ''}>
            {/* URL row */}
            <div className={stylex.props(styles.sfbc6e28e).className || ''}>
              <p className={stylex.props(styles.s9d4b128d).className || ''}>Your document will be available at</p>
              {documentUrl ? (
                <div className={stylex.props(styles.s86ff3e4).className || ''}>
                  <span
                    className="text-muted-foreground min-w-0 flex-1 text-xs"
                    style={{
                      direction: 'rtl',
                      textAlign: 'left',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {documentUrl}
                  </span>
                  <Tooltip content="Copy URL">
                    <Button
                      size="iconSm"
                      variant="ghost"
                      className={stylex.props(styles.sf032ed6c).className || ''}
                      onClick={() => {
                        copyTextToClipboard(documentUrl).then(() => {
                          toast.success('Copied document URL')
                        })
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                  </Tooltip>
                </div>
              ) : (
                <div className={stylex.props(styles.s8e245ec4).className || ''}>
                  <Spinner className={stylex.props(styles.sca3de967).className || ''} />
                  <span>Loading…</span>
                </div>
              )}
              {/* Permalink editor - first publish only */}
              {isFirstPublish && editableLocation && (
                <div className={stylex.props(styles.sfbc6e28d).className || ''}>
                  <p className={stylex.props(styles.sa56e9200).className || ''}>Edit your permalink</p>
                  <Input
                    value={`/${editablePath}`}
                    disabled={!!isPrivate}
                    onChange={(e) => {
                      if (isPrivate) return
                      if (!editableLocation) return
                      const raw = e.target.value.replace(/^\//, '')
                      const newPath = [...(editableLocation.path?.slice(0, -1) || []), pathNameify(raw)]
                      setEditableLocation(
                        hmId(editableLocation.uid, {
                          path: newPath,
                        }),
                      )
                      setPublishError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
                        e.stopPropagation()
                        ;(e.target as HTMLInputElement).select()
                      }
                    }}
                    placeholder="/document-path"
                    className={`h-8 border-black/10 text-xs dark:border-white/20 ${
                      publishError ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {isPrivate ? (
                    <p className={stylex.props(styles.sa56e9200).className || ''}>
                      Private document paths are generated automatically.
                    </p>
                  ) : null}
                  {publishError && <p className={stylex.props(styles.s11c1d25d).className || ''}>{publishError}</p>}
                </div>
              )}
            </div>

            <Separator className="bg-black/10 dark:bg-white/10" />

            <div className={stylex.props(styles.sfbc6e28d).className || ''}>
              <Button size="sm" variant="brand" onClick={handlePublishPress}>
                Publish: Make it live now
              </Button>
              <Button size="sm" variant="ghost" onClick={() => popoverState.onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

/** Dark pill shown next to the publish button while autosave is saving / just saved / errored. */
function SaveIndicatorStatus() {
  const [status, setStatus] = useState('idle' as DraftStatus)
  useEffect(() => {
    return draftStatus.subscribe((current) => {
      if (current == 'saved') {
        setTimeout(() => {
          setStatus('idle')
        }, 1000)
      }
      setStatus(current)
    })
  }, [])
  if (status === 'idle') return null
  if (status === 'error') {
    return (
      <Tooltip content="An error occurred while trying to save the latest changes.">
        <div className={stylex.props(styles.s396b6e9f).className || ''}>
          <AlertCircle size={12} />
          <span className={stylex.props(styles.sab7cc79b).className || ''}>Error</span>
        </div>
      </Tooltip>
    )
  }
  const label = status === 'saving' ? 'Saving…' : 'Saved'
  const icon =
    status === 'saving' ? (
      <Spinner className={stylex.props(styles.sca3de967).className || ''} />
    ) : (
      <Check size={12} color="currentColor" />
    )
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-neutral-800 px-3 py-1 text-white dark:bg-neutral-700">
      {icon}
      <span className={stylex.props(styles.sab7cc79b).className || ''}>{label}</span>
    </div>
  )
}
function ParentUpdateToast({message, onViewParent}: {message: string; onViewParent: () => void}) {
  return (
    <div className={stylex.props(styles.s86ff3e4).className || ''}>
      <span>{message}</span>
      <Button
        size="xs"
        variant="link"
        className={stylex.props(styles.sa3871be7).className || ''}
        onClick={onViewParent}
      >
        View parent
      </Button>
    </div>
  )
}
