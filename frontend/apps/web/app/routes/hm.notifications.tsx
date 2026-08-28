import * as stylex from '@stylexjs/stylex'
import {loadSiteHeaderData, SiteHeaderPayload} from '@/loaders'
import {defaultSiteIcon} from '@/meta'
import {PageFooter} from '@/page-footer'
import {getOptimizedImageUrl, NavigationLoadingContent, WebSiteProvider} from '@/providers'
import {parseRequest} from '@/request'
import {WebSiteHeader} from '@/web-site-header'
import {unwrap} from '@/wrapping'
import {wrapJSON} from '@/wrapping.server'
import {getDaemonAuthToken, withDaemonAuthToken} from '@/daemon-auth.server'
import {LoaderFunctionArgs, MetaFunction} from '@remix-run/node'
import {MetaDescriptor, useLoaderData} from '@remix-run/react'
import {extractIpfsUrlCid} from '@shm/ui/get-file-url'
import {ClientOnly} from '@/client-lazy'
import {WebNotificationsPage} from '@/notifications-page-content'
import {WebHeaderActions} from '@/web-utils'
import {Suspense} from 'react'
import {GeneralPageSurface} from '@shm/ui/general-page'
import {Spinner} from '@shm/ui/spinner'
const styles_3 = stylex.create({
  s833a2e0e: {
    display: 'flex',
    width: '100%',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    paddingTop: 'var(--site-header-h)',
    '@media ((min-width: 640px))': {
      paddingTop: 'calc(var(--spacing) * 0)',
    },
  },
})
const styles_2 = stylex.create({
  s6bedac16: {
    minHeight: '100vh',
    alignItems: 'center',
  },
})
const styles = stylex.create({
  scdbaf625: {
    width: '100%',
  },
})
type NotificationsPagePayload = SiteHeaderPayload
export const meta: MetaFunction = ({data}) => {
  const {homeMetadata} = unwrap<NotificationsPagePayload>(data)
  const meta: MetaDescriptor[] = []
  const homeIcon = homeMetadata?.icon ? getOptimizedImageUrl(extractIpfsUrlCid(homeMetadata.icon), 'S') : null
  meta.push({
    tagName: 'link',
    rel: 'icon',
    href: homeIcon || defaultSiteIcon,
    type: 'image/png',
  })
  meta.push({
    title: 'Notifications',
  })
  return meta
}
export const loader = async ({request}: LoaderFunctionArgs) => {
  const parsedRequest = parseRequest(request)
  const authToken = await getDaemonAuthToken(request)
  return withDaemonAuthToken(authToken, async () => {
    const headerData = await loadSiteHeaderData(parsedRequest)
    return wrapJSON(headerData satisfies NotificationsPagePayload)
  })
}
export default function NotificationsRoute() {
  const {originHomeId, siteHost, origin, homeMetadata, dehydratedState} =
    unwrap<NotificationsPagePayload>(useLoaderData())
  if (!originHomeId) {
    return <h2>Invalid origin home id</h2>
  }
  return (
    <WebSiteProvider origin={origin} originHomeId={originHomeId} siteHost={siteHost} dehydratedState={dehydratedState}>
      <GeneralPageSurface className={stylex.props(styles_2.s6bedac16).className || ''}>
        <WebSiteHeader
          homeMetadata={homeMetadata}
          originHomeId={originHomeId}
          siteHomeId={originHomeId}
          docId={null}
          origin={origin}
          rightActions={<WebHeaderActions siteUid={originHomeId.uid} />}
        />
        <NavigationLoadingContent className={stylex.props(styles_3.s833a2e0e).className || ''}>
          <ClientOnly>
            <Suspense fallback={<Spinner />}>
              <WebNotificationsPage />
            </Suspense>
          </ClientOnly>
        </NavigationLoadingContent>
        <PageFooter className={stylex.props(styles.scdbaf625).className || ''} />
      </GeneralPageSurface>
    </WebSiteProvider>
  )
}
