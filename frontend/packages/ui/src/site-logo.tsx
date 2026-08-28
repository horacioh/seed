import * as stylex from '@stylexjs/stylex'
import {HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useRouteLink} from '@shm/shared'
import {useImageUrl} from './get-file-url'
import {useHighlighter} from './highlight-context'
import {HMIcon} from './hm-icon'
import {cn} from './utils'
const styles_3 = stylex.create({
  se6f071ca: {
    color: 'var(--foreground)',
    minWidth: 'calc(var(--spacing) * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    fontWeight: 'var(--font-weight-bold)',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    '@media ((min-width: 768px))': {
      textAlign: 'left',
    },
  },
})
const styles_2 = stylex.create({
  scc23c503: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 2)',
  },
})
const styles = stylex.create({
  s22db9e54: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s9e61af4b: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export function SiteLogo({id, metadata}: {id: UnpackedHypermediaId; metadata?: HMMetadata | null}) {
  const imageUrl = useImageUrl()
  const highlighter = useHighlighter()
  const homeLinkProps = useRouteLink({
    key: 'document',
    id: {
      ...id,
      latest: true,
      version: null,
    },
  })
  if (metadata?.seedExperimentalLogo) {
    return (
      <div
        className={cn(stylex.props(styles.s22db9e54).className || '')}
        style={{
          height: '60px',
        }}
        {...highlighter(id)}
      >
        <a {...homeLinkProps} data-resourceid={id.id} className={stylex.props(styles.s9e61af4b).className || ''}>
          <img
            alt={metadata?.name || 'Space logo'}
            src={imageUrl(metadata.seedExperimentalLogo, 'M')}
            height={60}
            style={{
              objectFit: 'contain',
              height: '100%',
            }}
          />
        </a>
      </div>
    )
  }
  return (
    <a
      {...homeLinkProps}
      data-resourceid={id.id}
      className={cn(stylex.props(styles_2.scc23c503).className || '')}
      {...highlighter(id)}
    >
      <HMIcon size={24} id={id} name={metadata?.name} icon={metadata?.icon} />
      <p className={cn(stylex.props(styles_3.se6f071ca).className || '')}>{metadata?.name}</p>
    </a>
  )
}
