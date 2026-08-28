import * as stylex from '@stylexjs/stylex'
import {HMDocument, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {hmId} from '@shm/shared'
import {IS_DESKTOP} from '@shm/shared/constants'
import {useResource} from '@shm/shared/models/entity'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {useMemo} from 'react'
import {ScrollArea} from './components/scroll-area'
import {Feed} from './feed'
import {GeneralPageContainer, GeneralPageHeader} from './general-page'
import {useDocumentLayout} from './layout'
import {MenuItemType, OptionsDropdown} from './options-dropdown'
import {CommentEditorProps, computeHeaderData, PageWrapper} from './resource-page-common'
import {Separator} from './separator'
import {Spinner} from './spinner'
import {useMedia} from './use-media'
const styles_2 = stylex.create({
  sa97a3ae0: {
    position: 'absolute',
    top: 'calc(var(--spacing) * 2)',
    right: 'calc(var(--spacing) * 2)',
    zIndex: '40',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    borderRadius: 'calc(var(--radius) - 4px)',
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    '@media ((min-width: 768px))': {
      top: 'calc(var(--spacing) * 4)',
      right: 'calc(var(--spacing) * 4)',
    },
  },
})
const styles = stylex.create({
  s22db9e54: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s6ac707c: {
    position: 'relative',
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    paddingBottom: 'calc(0.25rem * 16)',
  },
  sca000771: {
    position: 'relative',
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sb42244d4: {
    height: '100%',
  },
})
export interface FeedPageProps {
  docId: UnpackedHypermediaId
  CommentEditor?: React.ComponentType<CommentEditorProps>
  extraMenuItems?: MenuItemType[]
  rightActions?: React.ReactNode
}
export function FeedPage({docId, extraMenuItems, rightActions}: FeedPageProps) {
  const siteHomeId = hmId(docId.uid)
  const siteHomeResource = useResource(siteHomeId, {
    subscribed: true,
  })
  const siteHomeDocument: HMDocument | null =
    siteHomeResource.data?.type === 'document' ? siteHomeResource.data.document : null
  const headerData = computeHeaderData(siteHomeDocument)
  const targetDomain = siteHomeDocument?.metadata?.siteUrl || undefined
  if (siteHomeResource.isInitialLoading) {
    return (
      <PageWrapper
        siteHomeId={siteHomeId}
        docId={docId}
        headerData={headerData}
        isMainFeedVisible
        rightActions={rightActions}
      >
        <div className={stylex.props(styles.s22db9e54).className || ''}>
          <Spinner />
        </div>
      </PageWrapper>
    )
  }
  return (
    <PageWrapper
      siteHomeId={siteHomeId}
      docId={docId}
      headerData={headerData}
      document={siteHomeDocument ?? undefined}
      isMainFeedVisible
      rightActions={rightActions}
    >
      <FeedBody siteHomeId={siteHomeId} extraMenuItems={extraMenuItems} targetDomain={targetDomain} />
    </PageWrapper>
  )
}
function FeedBody({
  siteHomeId,
  extraMenuItems,
  targetDomain,
}: {
  siteHomeId: UnpackedHypermediaId
  extraMenuItems?: MenuItemType[]
  targetDomain?: string
}) {
  const route = useNavRoute()
  const filterEventType = useMemo(() => {
    if (route.key === 'feed' && route.panel?.key === 'activity') {
      return (route.panel as any).filterEventType
    }
    return undefined
  }, [route])
  const {contentMaxWidth} = useDocumentLayout({
    contentWidth: undefined,
    showSidebars: false,
  })
  const media = useMedia()
  // In Electron (IS_DESKTOP), always use element scroll regardless of window width
  const isMobile = media.xs && !IS_DESKTOP
  const menuItems = extraMenuItems || []
  const actionButtons =
    menuItems.length > 0 ? <OptionsDropdown menuItems={menuItems} align="end" side="bottom" /> : null
  const feedContent = (
    <GeneralPageContainer contentMaxWidth={contentMaxWidth}>
      <GeneralPageHeader title="Activity Feed" />
      <Separator />
      <Feed
        filterResource={`${siteHomeId.id}*`}
        targetDomain={targetDomain}
        size="md"
        filterEventType={filterEventType}
      />
    </GeneralPageContainer>
  )
  if (isMobile) {
    return (
      <div className={stylex.props(styles.s6ac707c).className || ''}>
        {actionButtons ? <div className={stylex.props(styles_2.sa97a3ae0).className || ''}>{actionButtons}</div> : null}
        {feedContent}
      </div>
    )
  }
  return (
    <div className={stylex.props(styles.sca000771).className || ''}>
      {actionButtons ? <div className={stylex.props(styles_2.sa97a3ae0).className || ''}>{actionButtons}</div> : null}
      <ScrollArea className={stylex.props(styles.sb42244d4).className || ''}>{feedContent}</ScrollArea>
    </div>
  )
}
