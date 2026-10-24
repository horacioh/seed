import {unpackHmId} from '@seed-hypermedia/client/hm-types'
import {hmId, useResource} from '@shm/shared'
import {AccountPage} from '@shm/ui/account-page'
import {AccountAvatar} from '@shm/ui/account-avatar'
import {CollaboratorsPage} from '@shm/ui/collaborators-page'
import {DirectoryPageContent} from '@shm/ui/directory-page'
import {DirectoryPanel} from '@shm/ui/directory-panel'
import {DiscussionsPageContent} from '@shm/ui/discussions-page'
import {DocumentHeader} from '@shm/ui/document-header'
import {DocumentTopBar} from '@shm/ui/document-top-bar'
import {DocumentVersionsPanel} from '@shm/ui/document-versions-panel'
import {Feed} from '@shm/ui/feed'
import {FloatingAccountFooter} from '@shm/ui/floating-account-footer'
import {FollowButton} from '@shm/ui/follow-button'
import {FooterWrapper} from '@shm/ui/footer'
import {JoinButton} from '@shm/ui/join-button'
import {SearchInput} from '@shm/ui/search'
import {SiteHeader} from '@shm/ui/site-header'
import {ReadOnlyViewer} from '@shm/editor/readonly-viewer'
import {useState} from 'react'
import {DEFAULT_DOCUMENT_RESOURCE} from '../defaults'

/** Puck field for a resource URL binding. */
export const resourceField = {type: 'text', label: 'Resource URL', placeholder: DEFAULT_DOCUMENT_RESOURCE}

/** Resolves a typed resource URL for read-only component hooks. */
export function boundResource(resource = DEFAULT_DOCUMENT_RESOURCE) {
  return unpackHmId(resource.trim())
}
function InvalidResource() {
  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 text-destructive m-4 rounded-md border p-3 text-sm"
    >
      Enter a valid hm://… or https://… document URL.
    </div>
  )
}

/** Renders a document through the shared read-only viewer. */
export function DocumentView({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  const result = useResource(id)
  if (!id) return <InvalidResource />
  if (result.isInitialLoading) return <div className="text-muted-foreground p-4 text-sm">Loading document…</div>
  if (!result.data || result.data.type !== 'document')
    return <div className="text-muted-foreground p-4 text-sm">Document not found.</div>
  const document = result.data.document
  return (
    <article className="mx-auto w-full max-w-4xl px-5 pt-8 pb-12">
      <DocumentHeader docId={id} docMetadata={document.metadata} authors={[]} updateTime={document.updateTime} />
      <ReadOnlyViewer blocks={document.content} resourceId={id} rootChildrenType="Group" />
    </article>
  )
}

/** Site header bound to a resource space. */
export function SiteHeaderBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <SiteHeader siteHomeId={hmId(id.uid)} docId={id} /> : <InvalidResource />
}
/** Directory panel bound to a resource space. */
export function DirectoryBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <DirectoryPanel docId={id} /> : <InvalidResource />
}
/** Discussion panel bound to a resource. */
export function DiscussionsBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <DiscussionsPageContent docId={id} showOpenInPanel={false} contentMaxWidth={480} /> : <InvalidResource />
}
/** Feed bound to a resource space. */
export function FeedBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <Feed filterResource={id.id} size="sm" /> : <InvalidResource />
}
/** Collaborator panel bound to a resource space. */
export function CollaboratorsBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <CollaboratorsPage docId={id} /> : <InvalidResource />
}
/** Version history panel bound to a document. */
export function VersionsBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <DocumentVersionsPanel docId={id} size="sm" /> : <InvalidResource />
}
/** Full directory page bound to a resource space. */
export function DirectoryPageBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <DirectoryPageContent docId={id} showSearch={false} /> : <InvalidResource />
}
/** Account profile bound to a resource. */
export function AccountBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <AccountPage accountUid={id.uid} tab="profile" onFollowClick={() => {}} /> : <InvalidResource />
}
/** Account avatar bound to a resource. */
export function AvatarBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <AccountAvatar id={hmId(id.uid)} size={40} /> : <InvalidResource />
}
/** Document top bar and breadcrumbs for a resource. */
export function TopBarBlock({resource = DEFAULT_DOCUMENT_RESOURCE}: {resource?: string}) {
  const id = boundResource(resource)
  return id ? <DocumentTopBar breadcrumbs={[{label: id.path?.at(-1) ?? 'Lobby'}]} /> : <InvalidResource />
}
/** Seed footer with editable label text. */
export function FooterBlock({label = 'Status'}: {label?: string}) {
  return (
    <FooterWrapper>
      <span className="text-muted-foreground px-2 text-xs">{label}</span>
    </FooterWrapper>
  )
}
/** Floating account footer with an editable call to action. */
export function FloatingFooterBlock({label = 'Join'}: {label?: string}) {
  return <FloatingAccountFooter floatingButton={<JoinButton onClick={() => {}} />}>{label}</FloatingAccountFooter>
}
/** No-op follow button for read-only previews. */
export function FollowBlock() {
  return <FollowButton onClick={() => {}} isFollowing={false} />
}
/** No-op join button for read-only previews. */
export function JoinBlock() {
  return <JoinButton onClick={() => {}} />
}
/** Search input primitive with local state and Seed's fixed placeholder. */
export function SearchBlock() {
  const [value, setValue] = useState('')
  return (
    <SearchInput
      searchResults={[]}
      inputProps={{value, onChangeText: setValue, disabled: false}}
      onEscape={() => setValue('')}
      onArrowUp={() => {}}
      onArrowDown={() => {}}
      onEnter={() => {}}
      focusedIndex={-1}
    >
      {null}
    </SearchInput>
  )
}
