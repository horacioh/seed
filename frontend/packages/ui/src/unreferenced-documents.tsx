import * as stylex from '@stylexjs/stylex'
import {EditorBlock} from '@seed-hypermedia/client/editor-types'
import {
  HMBlockNode,
  HMDocumentInfo,
  HMListedDraft,
  HMMetadata,
  UnpackedHypermediaId,
} from '@seed-hypermedia/client/hm-types'
import {
  editorBlocksToHMBlockNodes,
  extractAllContentRefs,
  getMetadataName,
  hasQueryBlockTargetingSelf,
  hmId,
  useRouteLink,
} from '@shm/shared'
import {useCanSeePrivateDocs} from '@shm/shared/models/capabilities'
import {useDraftsForAccountSafe, type HMListedDraftWithLocation} from '@shm/shared/draft-breadcrumb-context'
import {collectChildDraftIds} from '@shm/shared/utils/child-draft-refs'
import {useMemo} from 'react'
import {DocumentListItem} from './document-list-item'
import {Button} from './button'
import {DraftBadge} from './draft-badge'
import {SizableText} from './text'
const styles_2 = stylex.create({
  sb24cdc6d: {
    height: 'auto',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderStyle: 'none',
    backgroundColor: 'var(--surface-contrast)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    boxShadow: 'var(--shadow-sm)',
    ':hover': {
      '@media (hover: hover)': {
        boxShadow: 'var(--shadow-md)',
      },
    },
  },
})
const styles = stylex.create({
  sa15101ca: {
    marginTop: 'calc(0.25rem * 8)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(0.25rem * 4)',
    paddingBottom: 'calc(0.25rem * 16)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sf2746014: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    overflow: 'hidden',
  },
  s62d3095e: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
  },
})
function toHMBlockNodes(blocks: EditorBlock[] | HMBlockNode[]): HMBlockNode[] {
  const first = blocks[0]
  const isEditorFormat = first != null && 'type' in first && !('block' in first)
  return isEditorFormat ? editorBlocksToHMBlockNodes(blocks as EditorBlock[]) : (blocks as HMBlockNode[])
}

/** Renders child documents that are not referenced by the current document content. */
export function UnreferencedDocuments({
  docId,
  content,
  draftContent,
  directory,
}: {
  docId: UnpackedHypermediaId
  content: HMBlockNode[]
  draftContent?: EditorBlock[] | HMBlockNode[]
  directory: HMDocumentInfo[] | undefined
}) {
  const canSeePrivate = useCanSeePrivateDocs(docId)
  const drafts = useDraftsForAccountSafe(docId.uid)
  const {unreferencedDocs, unreferencedDrafts} = useMemo(() => {
    const sourceContent = draftContent && draftContent.length > 0 ? toHMBlockNodes(draftContent) : content
    if (hasQueryBlockTargetingSelf(sourceContent, docId.uid, docId.path)) {
      return {
        unreferencedDocs: [],
        unreferencedDrafts: [],
      }
    }
    const allRefs = extractAllContentRefs(sourceContent)
    const referencedIds = new Set<string>()
    allRefs.forEach((ref) => {
      if (ref.refId) {
        referencedIds.add(ref.refId.id)
      }
    })
    const referencedDraftIds = new Set(collectChildDraftIds(sourceContent))
    const unreferencedDocs = (directory ?? [])
      .filter((child) => canSeePrivate || child.visibility !== 'PRIVATE')
      .filter((child) => !referencedIds.has(child.id.id))
    const currentPath = docId.path ?? []
    const unreferencedDrafts = (drafts.data ?? [])
      .filter((draft) => draft.locationId?.uid === docId.uid)
      .filter((draft) => pathEquals(draft.locationId?.path ?? [], currentPath))
      .filter((draft) => !draft.editId)
      .filter((draft) => canSeePrivate || draft.visibility !== 'PRIVATE')
      .filter((draft) => !referencedDraftIds.has(draft.id))
    return {
      unreferencedDocs,
      unreferencedDrafts,
    }
  }, [content, draftContent, directory, drafts.data, docId.uid, docId.path, canSeePrivate])
  if (unreferencedDocs.length === 0 && unreferencedDrafts.length === 0) return null
  return (
    <div className={stylex.props(styles.sa15101ca).className || ''}>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        {unreferencedDocs.map((item) => (
          <DocumentListItem key={item.id.id} item={item} />
        ))}
        {unreferencedDrafts.map((draft) => (
          <UnreferencedDraftListItem key={draft.id} draft={draft} />
        ))}
      </div>
    </div>
  )
}
function pathEquals(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((segment, index) => segment === b[index])
}
function UnreferencedDraftListItem({draft}: {draft: HMListedDraftWithLocation | HMListedDraft}) {
  const locationId = 'locationId' in draft ? draft.locationId : undefined
  const linkProps = useRouteLink(
    locationId
      ? {
          key: 'document',
          id: hmId(locationId.uid, {
            path: [...(locationId.path ?? []), `-${draft.id}`],
          }),
        }
      : {
          key: 'draft',
          id: draft.id,
        },
  )
  return (
    <Button asChild variant="ghost" className={stylex.props(styles_2.sb24cdc6d).className || ''}>
      <a {...linkProps}>
        <div className={stylex.props(styles.sf2746014).className || ''}>
          <SizableText className={stylex.props(styles.s62d3095e).className || ''}>
            {getMetadataName(draft.metadata as HMMetadata)}
          </SizableText>
          <DraftBadge />
        </div>
      </a>
    </Button>
  )
}
