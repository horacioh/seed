import * as stylex from '@stylexjs/stylex'
import {HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useDocumentActions} from '@shm/shared/document-actions-context'
import {useResource} from '@shm/shared/models/entity'
import {useRouteLink} from '@shm/shared/routing'
import {HMIcon} from './hm-icon'
import {HoverCard, HoverCardContent, HoverCardTrigger} from './hover-card'
const styles_2 = stylex.create({
  s280d302a: {
    width: '100%',
    maxWidth: 'calc(0.25rem * 100)',
    padding: 'calc(0.25rem * 0)',
  },
})
const styles_3 = stylex.create({
  base: {
    display: 'inline',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    whiteSpace: 'normal',
    backgroundColor: 'var(--color-gray-100)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--border)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-gray-200)',
      },
    },
    ':is(.dark *)': {
      backgroundColor: 'var(--color-gray-800)',
      ':hover': {
        '@media (hover: hover)': {
          color: '#fff',
        },
      },
    },
  },
  preview: {
    display: 'inline-block',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    paddingInline: 'var(--spacing)',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
})
const styles = stylex.create({
  s76a06a6d: {
    marginRight: 'calc(0.25rem * 1)',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  sd7369eb8: {
    color: 'var(--foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
export function ResourceToken({
  id,
  metadata,
  ResourcePreview,
}: {
  id: UnpackedHypermediaId
  metadata?: HMMetadata | null
  ResourcePreview?: React.ComponentType<{
    metadata?: HMMetadata | null
    id: UnpackedHypermediaId
  }>
}) {
  const linkProps = useRouteLink({
    key: 'document',
    id: id,
  })
  const actions = useDocumentActions()
  const draft = actions.getDraft?.(id)
  const resource = useResource(id, {
    subscribed: true,
  })
  const liveMetadata = resource.data?.type === 'document' ? resource.data.document.metadata : undefined
  const displayMetadata = draft?.metadata
    ? {
        ...(metadata ?? {}),
        ...(liveMetadata ?? {}),
        ...draft.metadata,
      }
    : liveMetadata ?? metadata
  const icon =
    !id.path?.length || displayMetadata?.icon ? (
      <HMIcon size={20} id={id} name={displayMetadata?.name} icon={displayMetadata?.icon} />
    ) : null
  if (ResourcePreview) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <a {...linkProps} className={stylex.props(styles_3.base, styles_3.preview).className || ''}>
            {icon ? <span className={stylex.props(styles.s76a06a6d).className || ''}>{icon}</span> : null}
            <span className={stylex.props(styles.sd7369eb8).className || ''}>
              {displayMetadata?.name || 'Untitled Resource'}
            </span>
          </a>
        </HoverCardTrigger>
        <HoverCardContent className={stylex.props(styles_2.s280d302a).className || ''} align="end">
          <ResourcePreview metadata={displayMetadata} id={id} />
        </HoverCardContent>
      </HoverCard>
    )
  }
  return (
    <a {...linkProps} className={stylex.props(styles_3.base).className || ''}>
      {icon ? <span className={stylex.props(styles.s76a06a6d).className || ''}>{icon}</span> : null}
      {displayMetadata?.name || 'Untitled Resource'}
    </a>
  )
}
