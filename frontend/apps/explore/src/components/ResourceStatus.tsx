import * as stylex from '@stylexjs/stylex'
import {HMResource, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {packHmId} from '@shm/shared'
import {ArrowRight, Ban, FileQuestion, Loader, Radar, SignpostBig, TriangleAlert} from 'lucide-react'
import {Link} from 'react-router-dom'
import {exploreHref, isProfileId} from '../utils/exploreHref'
import {useDiscoverResource} from '../utils/useDiscoverResource'
import {CopyTextButton} from './CopyTextButton'
import {OpenInAppButton} from './ExternalOpenButton'
const styles = stylex.create({
  s3c8fe2ea: {
    marginBottom: 'calc(0.25rem * 2)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '700',
    color: 'oklch(27.8% 0.033 256.848)',
  },
  s40f12e70: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(63.7% 0.237 25.331)',
  },
  saf5ba6ec: {
    color: 'oklch(44.6% 0.03 256.802)',
  },
  s28fa9c02: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(76.9% 0.188 70.08)',
  },
  sf407d84: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    overflowWrap: 'break-word',
    color: 'oklch(57.7% 0.245 27.325)',
  },
  s154594b4: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s656eb3c8: {
    marginBottom: 'calc(0.25rem * 4)',
    color: 'oklch(44.6% 0.03 256.802)',
  },
  s2b64fb66: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    animation: 'spin 1s linear infinite',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s1de0fcf3: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(57.7% 0.245 27.325)',
  },
  sf1816aec: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(54.6% 0.245 262.881)',
  },
  s74c94543: {
    marginBottom: 'calc(0.25rem * 1)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '700',
    color: 'oklch(37.3% 0.034 259.733)',
  },
  s2c51369b: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    overflow: 'hidden',
  },
  s6c7f0552: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
    color: 'oklch(70.7% 0.022 261.325)',
  },
})
const panelClass = 'rounded-xl border border-gray-200 bg-white p-6'

/**
 * Renders resource states that are not a document or comment: redirects,
 * tombstones, not-found, and errors. Redirects are shown (not followed) with a
 * link to the destination so the user can choose to navigate there.
 */
export function ResourceStatus({data}: {data: HMResource}) {
  if (data.type === 'redirect') {
    return <RedirectStatus id={data.id} target={data.redirectTarget} republish={data.republish} />
  }
  if (data.type === 'tombstone') {
    return (
      <div className={panelClass}>
        <div className={stylex.props(styles.s3c8fe2ea).className || ''}>
          <Ban className={stylex.props(styles.s40f12e70).className || ''} />
          Deleted
        </div>
        <p className={stylex.props(styles.saf5ba6ec).className || ''}>
          This {isProfileId(data.id) ? 'profile' : 'resource'} has been deleted (tombstoned).
        </p>
      </div>
    )
  }
  if (data.type === 'not-found') {
    return <NotFoundStatus id={data.id} />
  }
  if (data.type === 'error') {
    return (
      <div className={panelClass}>
        <div className={stylex.props(styles.s3c8fe2ea).className || ''}>
          <TriangleAlert className={stylex.props(styles.s28fa9c02).className || ''} />
          Error
        </div>
        <p className={stylex.props(styles.sf407d84).className || ''}>{data.message}</p>
      </div>
    )
  }
  return null
}

/**
 * Not-found panel with a Discover action. The configured host doesn't have the
 * resource locally, so this pokes the daemon's network discovery and refetches
 * once the content arrives.
 */
function NotFoundStatus({id}: {id: UnpackedHypermediaId}) {
  const kind = isProfileId(id) ? 'profile' : 'resource'
  const {state, discover} = useDiscoverResource(id)
  const isDiscovering = state.status === 'discovering'
  return (
    <div className={panelClass}>
      <div className={stylex.props(styles.s3c8fe2ea).className || ''}>
        <FileQuestion className={stylex.props(styles.s154594b4).className || ''} />
        Not Found
      </div>
      <p className={stylex.props(styles.s656eb3c8).className || ''}>
        No {kind} was found at this address on the configured host. Try discovering it on the network.
      </p>

      <button
        onClick={discover}
        disabled={isDiscovering}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isDiscovering ? (
          <Loader className={stylex.props(styles.s2b64fb66).className || ''} />
        ) : (
          <Radar className={stylex.props(styles.sca3de968).className || ''} />
        )}
        {isDiscovering ? 'Discovering…' : 'Discover on the network'}
      </button>

      {state.status === 'failed' && (
        <p className={stylex.props(styles.s1de0fcf3).className || ''}>{state.error || 'Discovery failed.'}</p>
      )}
    </div>
  )
}
function RedirectStatus({
  id,
  target,
  republish,
}: {
  id: UnpackedHypermediaId
  target: UnpackedHypermediaId
  republish: boolean
}) {
  const targetUrl = packHmId(target)
  const kind = isProfileId(id) ? 'profile' : 'document'
  return (
    <div className={panelClass}>
      <div className={stylex.props(styles.s3c8fe2ea).className || ''}>
        <SignpostBig className={stylex.props(styles.sf1816aec).className || ''} />
        Redirect
      </div>
      <p className={stylex.props(styles.s656eb3c8).className || ''}>
        This {kind} redirects to another {republish ? 'resource (republished content)' : kind}. The explorer does not
        follow redirects automatically.
      </p>

      <div className={stylex.props(styles.s74c94543).className || ''}>Destination</div>
      <div className={stylex.props(styles.s2c51369b).className || ''}>
        <ArrowRight className={stylex.props(styles.s6c7f0552).className || ''} />
        <Link to={exploreHref(target)} className="font-mono break-all text-blue-600 underline hover:underline">
          {targetUrl}
        </Link>
        <CopyTextButton text={targetUrl} />
        <OpenInAppButton url={targetUrl} />
      </div>
    </div>
  )
}
export default ResourceStatus
