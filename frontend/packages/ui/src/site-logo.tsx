import {HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useRouteLink} from '@shm/shared'
import {useImageUrl} from './get-file-url'
import {useHighlighter} from './highlight-context'
import {HMIcon} from './hm-icon'
import {cn} from './utils'

export function SiteLogo({
  id,
  metadata,
  asHeading = false,
}: {
  id: UnpackedHypermediaId
  metadata?: HMMetadata | null
  asHeading?: boolean
}) {
  const imageUrl = useImageUrl()
  const highlighter = useHighlighter()
  const TitleElement = asHeading ? 'h1' : 'p'
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
      <div className={cn('flex flex-1 items-center justify-center')} style={{height: '60px'}} {...highlighter(id)}>
        <a {...homeLinkProps} data-resourceid={id.id} className="flex h-full items-center justify-center">
          {asHeading ? (
            <h1 className="m-0">
              <img
                alt={metadata?.name || 'Space logo'}
                src={imageUrl(metadata.seedExperimentalLogo, 'M')}
                height={60}
                style={{objectFit: 'contain', height: '100%'}}
              />
            </h1>
          ) : (
            <img
              alt={metadata?.name || 'Space logo'}
              src={imageUrl(metadata.seedExperimentalLogo, 'M')}
              height={60}
              style={{objectFit: 'contain', height: '100%'}}
            />
          )}
        </a>
      </div>
    )
  }
  return (
    <a
      {...homeLinkProps}
      data-resourceid={id.id}
      className={cn('flex min-w-0 items-center justify-center gap-2')}
      {...highlighter(id)}
    >
      <HMIcon size={24} id={id} name={metadata?.name} icon={metadata?.icon} alt="" aria-hidden="true" />
      <TitleElement
        className={cn(
          'text-foreground min-w-0 truncate overflow-hidden text-center font-bold select-none md:text-left',
        )}
        {...highlighter(id)}
      >
        {metadata?.name}
      </TitleElement>
    </a>
  )
}
