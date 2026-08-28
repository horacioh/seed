import * as stylex from '@stylexjs/stylex'
import {json, LoaderFunctionArgs} from '@remix-run/node'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useRouteError,
} from '@remix-run/react'
import {captureRemixErrorBoundaryError, withSentry} from '@sentry/remix'
import {
  ENABLE_EMAIL_NOTIFICATIONS,
  LIGHTNING_API_URL,
  NOTIFY_SERVICE_HOST,
  SEED_ASSET_HOST,
  SITE_BASE_URL,
  WEB_IDENTITY_ENABLED,
  WEB_IDENTITY_ORIGIN,
} from '@shm/shared/constants'
import {SizableText} from '@shm/ui/text'
import {Providers} from './providers'
import './stylex.css'
const styles_2 = stylex.create({
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  sa9df3e8c: {
    minHeight: '100vh',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  sf611594d: {
    WebkitfontSmoothing: 'antialiased',
    MozosxFontSmoothing: 'grayscale',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  s1593095a: {
    maxWidth: '32rem',
  },
  sb42feb5d: {
    flex: '1',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fd: {
    gap: 'calc(0.25rem * 4)',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s1aa19: {
    padding: 'calc(0.25rem * 6)',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
})
const styles = stylex.create({
  sceaed122: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    flexDirection: 'column',
  },
  se6224f5b: {
    display: 'flex',
    flex: '1',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 12)',
  },
})

// enable statistics when SEED_ENABLE_STATISTICS is "true" or "1" at build-time

function getBaseDomain(host: string) {
  if (!host || host === 'localhost' || /^[0-9.]+$/.test(host)) return host
  const parts = host.split('.')
  if (parts.length <= 2) return host
  const twoLevel = new Set(['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'net.uk', 'sch.uk'])
  const lastTwo = parts.slice(-2).join('.')
  if (twoLevel.has(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join('.')
  }
  return lastTwo
}
export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const runtimeDomain = getBaseDomain(url.hostname)

  // Gate everything on the server so no client env access is needed
  const isProd = process.env.NODE_ENV === 'production'
  const enableStats = process.env.SEED_ENABLE_STATISTICS === 'true' || process.env.SEED_ENABLE_STATISTICS === '1'
  const domain = process.env.MONITORING_DOMAIN || runtimeDomain

  // Get siteHost for window.ENV injection
  const siteHost = url.hostname
  const result = {
    isProd,
    enableStats,
    domain,
    siteHost,
  }
  return json(result)
}
export function Layout({children}: {children: React.ReactNode}) {
  const loaderData = useRouteLoaderData<typeof loader>('root')
  const isProd = loaderData?.isProd ?? process.env.NODE_ENV === 'production'
  const enableStats =
    loaderData?.enableStats ??
    (process.env.SEED_ENABLE_STATISTICS === 'true' || process.env.SEED_ENABLE_STATISTICS === '1')
  const domain = loaderData?.domain
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {/* Inject environment variables BEFORE JS bundles load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify({
              LIGHTNING_API_URL,
              SITE_BASE_URL,
              WEB_IDENTITY_ORIGIN,
              WEB_IDENTITY_ENABLED,
              ENABLE_EMAIL_NOTIFICATIONS,
              SEED_ASSET_HOST,
              NOTIFY_SERVICE_HOST,
            })}`,
          }}
        />
        <Links />
        {/* Put Plausible in <head> so it loads ASAP */}
        {isProd && enableStats ? (
          <script
            defer
            data-domain={domain}
            // enable the same plugins you had:
            file-types="rpm,deb,dmg,exe"
            src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
          />
        ) : null}
      </head>
      <body
        className={
          stylex.props(styles_2.s5fd609e3, styles_2.sa9df3e8c, styles_2.sa1762f51, styles_2.sf611594d).className || ''
        }
      >
        <Providers>{children}</Providers>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
export function ErrorBoundary({}: {}) {
  const error = useRouteError()
  let errorMessage = 'Unknown Error'
  if (isRouteErrorResponse(error)) {
    errorMessage = error.data.message
  } else if (error instanceof Error) {
    errorMessage = error.message
  }
  captureRemixErrorBoundaryError(error)
  return (
    <html>
      <head>
        <title>Oops! Something went wrong</title>
      </head>
      <body>
        <div className={stylex.props(styles.sceaed122).className || ''}>
          <div className={stylex.props(styles.se6224f5b).className || ''}>
            <div
              className={
                stylex.props(
                  styles_2.s1a01a0ed,
                  styles_2.s2ffff9,
                  styles_2.scdbaf625,
                  styles_2.s1593095a,
                  styles_2.sb42feb5d,
                  styles_2.s67e351ac,
                  styles_2.s5d936fd,
                  styles_2.sf799889b,
                  styles_2.sad8c742c,
                  styles_2.s605ce4a1,
                  styles_2.s1aa19,
                  styles_2.s8a6c2948,
                ).className || ''
              }
            >
              <SizableText size="5xl">🤕</SizableText>
              <SizableText size="2xl" weight="bold">
                Uh oh, it's not you, it's us...
              </SizableText>

              <SizableText asChild>
                <p>Looks like something didn't go as planned on our end. Don't worry, it's not your fault!</p>
              </SizableText>
              <SizableText asChild>
                <p>
                  Give it a quick refresh or come back in a bit, and we'll have things sorted. If it keeps happening,
                  just reach out to support and we'll make it right in no time!
                </p>
              </SizableText>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
export default function App(props: any) {
  if (process.env.NODE_ENV === 'production') {
    return withSentry(Outlet)
  }
  return <Outlet />
}
