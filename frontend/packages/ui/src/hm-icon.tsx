import * as stylex from '@stylexjs/stylex'
import {HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {abbreviateUid, useRouteLink} from '@shm/shared'
import {useResource} from '@shm/shared/models/entity'
import {AlertCircle} from 'lucide-react'
import {memo} from 'react'
import {UIAvatar, UIAvatarProps} from './avatar'
import {useImageUrl} from './get-file-url'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles_3 = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s3f582e15: {
    minHeight: 'calc(0.25rem * 5)',
  },
  s3f586664: {
    minWidth: 'calc(0.25rem * 5)',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
})
const styles_2 = stylex.create({
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
})
const styles = stylex.create({
  s41a93db5: {
    flex: 'none',
    backgroundColor: '#fff',
  },
  s71eeb87: {
    backgroundColor: 'var(--destructive)',
    position: 'absolute',
    top: 'calc(0.25rem * -2)',
    left: 'calc(0.25rem * -2)',
    display: 'flex',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  sf796cd41: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: '#fff',
  },
})
export const HMIcon = memo(HMIconImpl, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Deep comparison for id object
  if (prevProps.id?.id !== nextProps.id?.id) return false
  if (prevProps.id?.version !== nextProps.id?.version) return false
  if (prevProps.id?.blockRef !== nextProps.id?.blockRef) return false
  if (prevProps.size !== nextProps.size) return false
  if (prevProps.className !== nextProps.className) return false

  // Direct comparison for name and icon props
  if (prevProps.name !== nextProps.name) return false
  if (prevProps.icon !== nextProps.icon) return false
  return true
})
function HMIconImpl({
  id,
  name,
  icon,
  size = 32,
  className,
  ...props
}: Omit<UIAvatarProps, 'id'> & {
  id?: UnpackedHypermediaId
  name?: HMMetadata['name'] | null
  icon?: HMMetadata['icon'] | null
  size?: number
  className?: string
}) {
  const imageUrl = useImageUrl()
  if (!id) return null
  const isHomeDocument = id.path && id.path.length === 0
  const isProfileDocument = id.path?.[0] === ':profile'

  // We decided that for non-home documents we don't want to show any icons, unless it's specified in the metadata.
  if (!isHomeDocument && !isProfileDocument && !icon) {
    return null
  }
  return (
    <UIAvatar
      size={size}
      id={id.id}
      label={name || ''}
      url={icon ? imageUrl(icon, 'S') : undefined}
      className={cn(
        stylex.props(styles.s41a93db5).className || '',
        // We want home documents and profiles to have round icons,
        // and normal documents to have square icons.
        // This should help differentiate between "people" and "documents".
        stylex.props(isHomeDocument || isProfileDocument ? styles_2.s775755af : styles_2.sf799897a).className || '',
        className,
      )}
      {...props}
    />
  )
}
function getMetadataName(metadata?: HMMetadata | null) {
  return metadata?.name
}
export function LinkIcon({
  id,
  metadata,
  size,
  error,
}: {
  id: UnpackedHypermediaId
  metadata?: HMMetadata | null
  size?: number
  error?: boolean
}) {
  const linkProps = useRouteLink({
    key: 'document',
    id,
  })
  let content = (
    <>
      <HMIcon id={id} size={size} name={metadata?.name} icon={metadata?.icon} />
      <ErrorDot error={error} />
    </>
  )
  return (
    <Tooltip content={getMetadataName(metadata) || abbreviateUid(id.uid)}>
      <a
        className={
          stylex.props(styles_3.sdef3facc, styles_3.s3f582e15, styles_3.s3f586664, styles_3.s1aa13).className || ''
        }
        {...linkProps}
        style={
          {
            height: size,
          } as React.CSSProperties
        }
      >
        {content}
      </a>
    </Tooltip>
  )
}
export function ErrorDot({error}: {error?: boolean}) {
  if (!error) return null
  return (
    <div className={stylex.props(styles.s71eeb87).className || ''}>
      <AlertCircle className={stylex.props(styles.sf796cd41).className || ''} />
    </div>
  )
}
export function LoadedHMIcon({id, size}: {id: UnpackedHypermediaId; size?: number}) {
  const entity = useResource(id)
  const metadata = entity.data?.type === 'document' ? entity.data.document?.metadata : undefined
  return <HMIcon id={id} name={metadata?.name} icon={metadata?.icon} size={size} />
}
