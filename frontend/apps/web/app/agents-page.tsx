import * as stylex from '@stylexjs/stylex'
import {agentsRouteFromUrl} from '@/agents-routing'
import {clientLazy, ClientOnly} from '@/client-lazy'
import {SiteHeaderPayload} from '@/loaders'
import {PageFooter} from '@/page-footer'
import {NavigationLoadingContent, WebSiteProvider} from '@/providers'
import {WebSiteHeader} from '@/web-site-header'
import {WebHeaderActions} from '@/web-utils'
import {unwrap} from '@/wrapping'
import {useLoaderData, useLocation} from '@remix-run/react'
import {GeneralPageSurface} from '@shm/ui/general-page'
import {Spinner} from '@shm/ui/spinner'
import {Suspense, useMemo} from 'react'

// The agents chunk pulls in the editor and agents models; keep it out of the SSR bundle and load
// it only on the client, like the commenting editor.
const styles_3 = stylex.create({
  s87b70f1e: {
    display: 'flex',
    minHeight: 'calc(var(--spacing) * 0)',
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
  sd8bf54a1: {
    height: '100dvh',
    minHeight: 'calc(0.25rem * 0)',
    alignItems: 'center',
  },
})
const styles = stylex.create({
  scdbaf625: {
    width: '100%',
  },
})
const WebAgentsContent = clientLazy(async () => ({
  default: (await import('./agents-page-content')).default,
}))

/**
 * Shared body for the /hm/agents routes (index and splat). The loader payload is the standard site
 * header payload; the agents UI itself is client-only and talks straight to the agent server.
 */
export function AgentsPage() {
  const {originHomeId, siteHost, origin, homeMetadata, dehydratedState} = unwrap<SiteHeaderPayload>(useLoaderData())
  const location = useLocation()
  const initialRoute = useMemo(
    () => agentsRouteFromUrl(location.pathname, new URLSearchParams(location.search)),
    [location.pathname, location.search],
  )
  if (!originHomeId) {
    return <h2>Invalid origin home id</h2>
  }
  return (
    <WebSiteProvider
      origin={origin}
      originHomeId={originHomeId}
      siteHost={siteHost}
      dehydratedState={dehydratedState}
      initialRoute={initialRoute}
    >
      {/* The agents pages are full-height panels (PanelContainer uses h-full and scrolls
          internally), so the surface must be a definite viewport height, not min-h-screen. */}
      <GeneralPageSurface className={stylex.props(styles_2.sd8bf54a1).className || ''}>
        <WebSiteHeader
          homeMetadata={homeMetadata}
          originHomeId={originHomeId}
          siteHomeId={originHomeId}
          docId={null}
          origin={origin}
          rightActions={<WebHeaderActions siteUid={originHomeId.uid} />}
        />
        <NavigationLoadingContent className={stylex.props(styles_3.s87b70f1e).className || ''}>
          <ClientOnly>
            <Suspense fallback={<Spinner />}>
              <WebAgentsContent />
            </Suspense>
          </ClientOnly>
        </NavigationLoadingContent>
        <PageFooter className={stylex.props(styles.scdbaf625).className || ''} />
      </GeneralPageSurface>
    </WebSiteProvider>
  )
}
