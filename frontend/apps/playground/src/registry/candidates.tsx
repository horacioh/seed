import type {HMActivitySummary, HMDocumentInfo} from '@seed-hypermedia/client/hm-types'
import {useAccountsMetadata, useResource} from '@shm/shared'
import {useSiteMembers} from '@shm/shared/models/entity'
import {SubDocumentItem} from '@shm/ui/activity'
import {ExploreDocumentCard} from '@shm/ui/explore-cards'
import {FacePile} from '@shm/ui/face-pile'
import {MembersFacepile} from '@shm/ui/members-facepile'
import {DocumentCard} from '@shm/ui/newspaper'
import {QueryBlockContent} from '@shm/ui/query-block-content'
import {DEFAULT_DOCUMENT_RESOURCE} from '../defaults'
import {boundResource} from './content'

function useCandidateDocument(resource = DEFAULT_DOCUMENT_RESOURCE) {
  const id = boundResource(resource)
  const result = useResource(id)
  const document = result.data?.type === 'document' ? result.data.document : null
  const activitySummary = document
    ? ({
        latestChangeTime: document.updateTime,
        latestCommentId: '',
        commentCount: 0,
        isUnread: false,
      } satisfies HMActivitySummary)
    : undefined
  const info =
    document && id
      ? ({
          type: 'document',
          id,
          path: id.path ?? [],
          authors: document.authors,
          createTime: document.createTime,
          updateTime: document.updateTime,
          sortTime: new Date(),
          genesis: document.genesis,
          version: document.version,
          breadcrumbs: [],
          activitySummary,
          generationInfo: document.generationInfo ?? {genesis: document.genesis, generation: 0n},
          metadata: document.metadata,
          visibility: document.visibility,
        } as HMDocumentInfo)
      : null
  return {id, result, document, info, activitySummary}
}

function LoadingCandidate() {
  return <div className="text-muted-foreground p-4 text-sm">Loading resource…</div>
}

/** Render the current resource as a read-only activity item. */
export function ActivityBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const {id, result, info, activitySummary} = useCandidateDocument(resource)
  const accounts = useAccountsMetadata(info?.authors ?? [])
  if (!id) return <div className="text-destructive p-4 text-sm">Enter a valid resource URL.</div>
  if (result.isLoading) return <LoadingCandidate />
  if (!info || !activitySummary) return null
  return (
    <SubDocumentItem
      item={{...info, activitySummary, latestComment: null}}
      accountsMetadata={accounts.data}
      markedAsRead
    />
  )
}

/** Render a resource using the read-only Explore document card. */
export function ExploreCardBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const {id, result, info} = useCandidateDocument(resource)
  if (!id) return <div className="text-destructive p-4 text-sm">Enter a valid resource URL.</div>
  if (result.isLoading) return <LoadingCandidate />
  return info ? <ExploreDocumentCard document={info} /> : null
}

/** Render author avatars for a resource. */
export function FacePileBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const {id, result, info} = useCandidateDocument(resource)
  const accounts = useAccountsMetadata(info?.authors ?? [])
  if (!id) return <div className="text-destructive p-4 text-sm">Enter a valid resource URL.</div>
  if (result.isLoading || accounts.isLoading) return <LoadingCandidate />
  return info ? <FacePile accounts={info.authors} accountsMetadata={accounts.data} /> : null
}

/** Render the live collaborator facepile for a resource. */
export function MembersFacepileBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const {id} = useCandidateDocument(resource)
  const siteMembers = useSiteMembers(id)
  if (!id) return <div className="text-destructive p-4 text-sm">Enter a valid resource URL.</div>
  return <MembersFacepile members={siteMembers.members} siteId={id} />
}

/** Render a resource through the read-only collection query block. */
export function QueryResultsBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const {id, result, info} = useCandidateDocument(resource)
  const accounts = useAccountsMetadata(info?.authors ?? [])
  if (!id) return <div className="text-destructive p-4 text-sm">Enter a valid resource URL.</div>
  if (result.isLoading || accounts.isLoading) return <LoadingCandidate />
  return info ? (
    <QueryBlockContent items={[info]} style="Card" columnCount={1} accountsMetadata={accounts.data} />
  ) : null
}

/** Render a resource using the read-only newspaper document card. */
export function NewspaperCardBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const {id, result, info} = useCandidateDocument(resource)
  if (!id) return <div className="text-destructive p-4 text-sm">Enter a valid resource URL.</div>
  if (result.isLoading) return <LoadingCandidate />
  return info && result.data ? (
    <DocumentCard
      docId={id}
      entity={result.data as never}
      metadata={info.metadata}
      interactionSummary={{comments: 0, authorUids: info.authors}}
      navigate={false}
      hideInlineActions
      showCommentAction={false}
    />
  ) : null
}
