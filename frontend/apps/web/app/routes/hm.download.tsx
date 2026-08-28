import * as stylex from '@stylexjs/stylex'
import downloadBg from '@/assets/download-bg.png'
import {loadSiteResource, SiteDocumentPayload} from '@/loaders'
import {defaultPageMeta} from '@/meta'
import {PageFooter} from '@/page-footer'
import {NavigationLoadingContent, WebSiteProvider} from '@/providers'
import {parseRequest} from '@/request'
import {getConfig} from '@/site-config.server'
import {WebSiteHeader} from '@/web-site-header'
import {unwrap} from '@/wrapping'
import {getDaemonAuthToken, withDaemonAuthToken} from '@/daemon-auth.server'
import {useLoaderData} from '@remix-run/react'
import {hmId} from '@shm/shared'
import {Button} from '@shm/ui/button'
import {Download, Linux, Macos, Win32} from '@shm/ui/icons'
import {SizableText} from '@shm/ui/text'
import {useEffect, useState} from 'react'
import {z} from 'zod'
import {Container} from '../ui/container'
const styles_4 = stylex.create({
  s1aa1b: {
    padding: 'calc(0.25rem * 8)',
  },
  s2f77d9f6: {
    alignSelf: 'center',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
})
const styles_3 = stylex.create({
  s88b3b93e: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    paddingTop: 'var(--site-header-h)',
    '@media ((min-width: 640px))': {
      paddingTop: 'calc(var(--spacing) * 0)',
    },
  },
  saf87fe0e: {
    display: 'flex',
    minHeight: '45vh',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(var(--spacing) * 8)',
  },
  sfadecc62: {
    textAlign: 'center',
    fontSize: 'var(--text-4xl)',
    lineHeight: 'var(--text-4xl--line-height)',
    fontWeight: 'var(--font-weight-bold)',
    '@media ((min-width: 768px))': {
      fontSize: 'var(--text-5xl)',
      lineHeight: 'var(--text-5xl--line-height)',
    },
  },
  sae80c57d: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(var(--spacing) * 4)',
    padding: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 640px))': {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
    },
  },
  sc617585a: {
    borderColor: 'var(--border)',
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: 'var(--surface-contrast)',
    padding: 'calc(var(--spacing) * 4)',
    boxShadow: 'var(--shadow-xl)',
    '@media ((min-width: 640px))': {
      width: 'auto',
      minWidth: 'var(--container-3xs)',
    },
  },
  sa421322c: {
    width: '60px',
    height: '60px',
  },
})
const styles_2 = stylex.create({
  sca3de96a: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
const styles = stylex.create({
  s610350de: {
    backgroundSize: 'cover',
    backgroundPosition: 'top',
  },
  s912a40f4: {
    gap: 'calc(0.25rem * 4)',
    paddingInline: 'calc(0.25rem * 6)',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  se2dff700: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  se658ac14: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sab7cc794: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
  },
})
async function isArm64(): Promise<boolean | null> {
  // this check only works on chrome, not safari. So we need to handle null and offer both dl buttons

  // @ts-expect-error
  const values = await navigator.userAgentData?.getHighEntropyValues(['architecture'])
  if (!values) return null
  return values.architecture === 'arm'
}
function getOS(): undefined | 'mac' | 'windows' | 'linux' {
  const platform = navigator?.platform?.toLowerCase()
  if (!platform) return undefined
  if (platform.includes('mac')) return 'mac'
  if (platform.includes('win')) return 'windows'
  if (platform.includes('linux')) return 'linux'
  return undefined
}
async function getPlatform() {
  return {
    os: getOS(),
    isArm64: await isArm64(),
  }
}
const RELEASES_JSON_URL = 'https://seedreleases.s3.eu-west-2.amazonaws.com/prod/latest.json'
const assetSchema = z.object({
  download_url: z.string().optional(),
  zip_url: z.string().optional(),
  nupkg_url: z.string().optional(),
  release_url: z.string().optional(),
})
const releaseSchema = z.object({
  name: z.string(),
  tag_name: z.string(),
  release_notes: z.string(),
  assets: z.object({
    macos: z.object({
      x64: assetSchema.optional(),
      arm64: assetSchema.optional(),
    }),
    win32: z.object({
      x64: assetSchema.optional(),
    }),
    linux: z.object({
      rpm: assetSchema.optional(),
      deb: assetSchema.optional(),
      app_image: assetSchema.optional(),
      flatpak: assetSchema.optional(),
    }),
  }),
})
async function loadUpstreamRelease() {
  const response = await fetch(RELEASES_JSON_URL)
  const data = await response.json()
  return releaseSchema.parse(data)
}
export const loader = async ({request}: {request: Request}) => {
  const parsedRequest = parseRequest(request)
  const {hostname} = parsedRequest
  const serviceConfig = await getConfig(hostname)
  if (!serviceConfig) throw new Error(`No config defined for ${hostname}`)
  const {registeredAccountUid} = serviceConfig
  if (!registeredAccountUid) throw new Error(`No registered account uid defined for ${hostname}`)
  const stableRelease = await loadUpstreamRelease()
  const authToken = await getDaemonAuthToken(request)
  return withDaemonAuthToken(authToken, () =>
    loadSiteResource(
      parsedRequest,
      hmId(registeredAccountUid, {
        path: [],
        latest: true,
      }),
      {
        stableRelease,
      },
    ),
  )
}
export const meta = defaultPageMeta('Download Seed Hypermedia')
export default function DownloadPage() {
  const data = unwrap<
    SiteDocumentPayload & {
      stableRelease: z.infer<typeof releaseSchema>
    }
  >(useLoaderData())
  const {stableRelease, originHomeId, siteHost, homeMetadata, id, document, origin} = data
  //   const os = getOS();
  const [platform, setPlatform] = useState<Awaited<ReturnType<typeof getPlatform>> | undefined>(undefined)
  useEffect(() => {
    getPlatform().then(setPlatform)
  }, [])
  const suggestedButtons: React.ReactNode[] = []
  if (platform?.os === 'mac') {
    if (platform.isArm64 || platform.isArm64 == null) {
      suggestedButtons.push(
        <ReleaseEntry large label="Download Seed for Mac (Apple Silicon)" asset={stableRelease.assets?.macos?.arm64} />,
      )
    }
    if (!platform.isArm64) {
      suggestedButtons.push(
        <ReleaseEntry large label="Download Seed for Mac (Intel)" asset={stableRelease.assets?.macos?.x64} />,
      )
    }
  } else if (platform?.os === 'windows') {
    suggestedButtons.push(
      <ReleaseEntry large label="Download Seed for Windows x64" asset={stableRelease.assets?.win32?.x64} />,
    )
  } else if (platform?.os === 'linux') {
    suggestedButtons.push(
      <ReleaseEntry large label="Download Seed for Linux (rpm)" asset={stableRelease.assets?.linux?.rpm} />,
      <ReleaseEntry large label="Download Seed for Linux (deb)" asset={stableRelease.assets?.linux?.deb} />,
      <ReleaseEntry large label="Download Seed for Linux (AppImage)" asset={stableRelease.assets?.linux?.app_image} />,
      <ReleaseEntry large label="Download Seed for Linux (Flatpak)" asset={stableRelease.assets?.linux?.flatpak} />,
    )
  }
  return (
    <WebSiteProvider origin={origin} originHomeId={originHomeId} siteHost={siteHost}>
      <div
        className={stylex.props(styles.s610350de).className || ''}
        style={{
          backgroundImage: `url(${downloadBg})`,
        }}
      >
        <WebSiteHeader
          homeMetadata={homeMetadata}
          originHomeId={originHomeId}
          siteHomeId={originHomeId}
          docId={id}
          document={document}
          origin={origin}
        />
        <NavigationLoadingContent className={stylex.props(styles_3.s88b3b93e).className || ''}>
          <div className={stylex.props(styles_3.saf87fe0e).className || ''}>
            <Container className={stylex.props(styles.s912a40f4).className || ''}>
              <h1 className={stylex.props(styles_3.sfadecc62).className || ''}>Download Seed Hypermedia Today!</h1>
              <SizableText size="xl" className={stylex.props(styles.s65e234f5).className || ''}>
                Start writing and collaborating with your peers.
              </SizableText>
              <div className={stylex.props(styles.sfbc6e290).className || ''}>
                {suggestedButtons.length > 0 && suggestedButtons}
              </div>
            </Container>
          </div>
          <Container>
            <div className={stylex.props(styles.se2dff700).className || ''}>
              <SizableText size="2xl" weight="bold">
                Download Seed Hypermedia {stableRelease.name}
              </SizableText>
            </div>
            <div className={stylex.props(styles_3.sae80c57d).className || ''}>
              {stableRelease.assets?.macos && (
                <PlatformItem label="MacOS" icon={Macos} assets={stableRelease.assets.macos} />
              )}
              {stableRelease.assets?.win32 && (
                <PlatformItem label="Windows" icon={Win32} assets={stableRelease.assets.win32} />
              )}
              {stableRelease.assets?.linux && (
                <PlatformItem label="Linux" icon={Linux} assets={stableRelease.assets.linux} />
              )}
            </div>
          </Container>
        </NavigationLoadingContent>
        <PageFooter />
      </div>
    </WebSiteProvider>
  )
}
function PlatformItem({
  label,
  icon: Icon,
  assets,
}: {
  label: string
  icon: any
  assets: Record<string, z.infer<typeof assetSchema> | {} | undefined>
}) {
  const assetArray = Object.entries(assets)
    .filter(([_, asset]) => asset && 'download_url' in asset)
    .map(([key, asset]) => ({
      label: key,
      url: (asset as z.infer<typeof assetSchema>).download_url,
    }))
  return (
    <div className={stylex.props(styles_3.sc617585a).className || ''}>
      <Icon size={60} className={stylex.props(styles_3.sa421322c).className || ''} />
      <SizableText size="lg" weight="bold">
        {label}
      </SizableText>
      <div className={stylex.props(styles.se658ac14).className || ''}>
        {assetArray.map(
          (asset) =>
            asset.url && (
              <Button
                key={asset.label}
                variant="link"
                className={'plausible-event-name=download plausible-event-os=' + ' ' + asset.url.split('.').pop()}
                size="sm"
                asChild
              >
                <a
                  href={asset.url}
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <Download className={stylex.props(styles.sca3de967).className || ''} />
                  {asset.label}
                </a>
              </Button>
            ),
        )}
      </div>
    </div>
  )
}
function ReleaseEntry({label, asset, large}: {label: string; asset?: z.infer<typeof assetSchema>; large?: boolean}) {
  if (!asset) return null
  if (!asset.download_url) return null
  return (
    <Button
      asChild
      variant="default"
      className={
        (stylex.props(styles_4.s1aa1b).className || '') +
        ' ' +
        (stylex.props(styles_4.s2f77d9f6, styles_4.sf79988b7).className || '')
      }
      style={{
        textDecoration: 'none',
      }}
      size={large ? 'lg' : 'default'}
    >
      <a href={asset.download_url}>
        <Download className={stylex.props(large ? styles_2.sca3de96a : styles_2.sca3de968).className || ''} />{' '}
        <span className={stylex.props(styles.sab7cc794).className || ''}>{label}</span>
      </a>
    </Button>
  )
}
