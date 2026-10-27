import './blocks-content.css'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {getRoutePanel, type DocumentPanelRoute, type DocumentRoute, type NavRoute} from '@shm/shared'
import {useRouteLink} from '@shm/shared/routing'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {packHmId} from '@shm/shared/utils/entity-id-url'
import {HTMLAttributes, PropsWithChildren, ReactNode, useMemo} from 'react'
import {blockStyles} from './blocks-content-utils'
import {useHighlighter} from './highlight-context'
import {cn} from './utils'
import {ChevronDown, ChevronUp} from 'lucide-react'
import {buttonVariants} from './button'
import {Tooltip} from './tooltip'

/** Builds a document route for an embed while retaining the currently active panel. */
export function getEmbedDocumentRoute(id: UnpackedHypermediaId, currentRoute: NavRoute): DocumentRoute {
  const panel = getRoutePanel(currentRoute) as DocumentPanelRoute | null
  return panel ? {key: 'document', id, panel} : {key: 'document', id}
}

/** Source navigation and quote frame shared by all embed presentations. */
export function EmbedWrapper({
  id,
  parentBlockId,
  children,
  depth,
  viewType = 'Content',
  hideBorder = false,
  isRange = false,
  route,
  openOnClick = true,
  ...props
}: PropsWithChildren<
  {
    id?: UnpackedHypermediaId
    parentBlockId: string | null
    depth?: number
    viewType?: 'Content' | 'Card' | 'Comments' | 'Link'
    hideBorder?: boolean
    isRange?: boolean
    route?: NavRoute
    openOnClick?: boolean
  } & Omit<HTMLAttributes<HTMLElement>, 'id'>
>) {
  const highlight = useHighlighter()
  const currentRoute = useNavRoute()

  // Preserve any active panel when navigating an embed to a document.
  const effectiveRoute = useMemo(() => {
    if (!route) return route
    if (route.key === 'document' && !route.panel) {
      return getEmbedDocumentRoute(route.id, currentRoute)
    }
    return route
  }, [route, currentRoute])

  const linkProps = useRouteLink(openOnClick && effectiveRoute ? effectiveRoute : null)
  const {onClick: routeOnClick, tag: _routeTag, ...linkAttributes} = linkProps
  const canNavigate = !!(openOnClick && effectiveRoute)

  if (!id) return null
  return (
    <div
      contentEditable={false}
      className={cn(
        'block-embed hm-prose relative flex flex-col',
        blockStyles,
        !hideBorder && 'border-l-primary border-l-3',
        'focus-within:outline-ring m-0 rounded-none focus-within:outline-2 focus-within:outline-offset-2',
        openOnClick && effectiveRoute && 'cursor-pointer text-inherit no-underline',
      )}
      data-is-range={isRange ? 'true' : undefined}
      data-content-type="embed"
      data-url={packHmId(id)}
      data-view={viewType}
      data-blockid={
        id && id.blockRange && 'expanded' in id.blockRange && id.blockRange.expanded ? id?.blockRef : undefined
      }
      data-resourceid={id?.blockRef ? undefined : id?.id}
      {...highlight(id)}
      {...props}
    >
      {canNavigate ? (
        <a
          {...linkAttributes}
          href={linkAttributes.href}
          aria-label="Open embedded content"
          onClickCapture={(event) => {
            event.stopPropagation()
            const selection = window.getSelection()
            if (selection?.toString().length) {
              event.preventDefault()
              return
            }
            routeOnClick?.(event)
          }}
          onAuxClick={(event) => {
            if (event.button !== 1) return
            const selection = window.getSelection()
            if (selection?.toString().length) {
              event.preventDefault()
              event.stopPropagation()
              return
            }
            event.preventDefault()
            event.stopPropagation()
            event.currentTarget.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, ctrlKey: true}))
          }}
          className="focus-visible:ring-ring absolute inset-0 z-0 rounded-md focus-visible:ring-[3px] focus-visible:outline-none"
        />
      ) : null}
      <div className="pointer-events-none relative z-10 [&_[contenteditable=true]]:pointer-events-auto [&_[data-embed-interactive]]:pointer-events-auto [&_[role=button]]:pointer-events-auto [&_[role=checkbox]]:pointer-events-auto [&_[role=menuitem]]:pointer-events-auto [&_[role=radio]]:pointer-events-auto [&_[role=switch]]:pointer-events-auto [&_[role=tab]]:pointer-events-auto [&_a[href]]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto [&_textarea]:pointer-events-auto">
        {children}
      </div>
    </div>
  )
}

/** Displays a fragment with a caret that expands its source in place. */
export function FragmentEmbedControls({
  expanded,
  onExpandedChange,
  children,
  sourceLabel = 'block',
}: {
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  children: ReactNode
  sourceLabel?: 'block' | 'comment'
}) {
  const toggleLabel = expanded ? `Hide full ${sourceLabel}` : `Show full ${sourceLabel}`
  const Caret = expanded ? ChevronUp : ChevronDown
  return (
    <div className="bg-muted/30 relative min-h-8 rounded-sm py-1">
      {children}
      <Tooltip content={toggleLabel} asChild>
        <button
          type="button"
          className={buttonVariants({
            variant: 'ghost',
            size: 'iconSm',
            className: cn(
              'text-muted-foreground hover:text-foreground active:bg-accent absolute right-1 size-6',
              expanded ? 'top-1' : 'top-1/2 -translate-y-1/2',
            ),
          })}
          aria-label={toggleLabel}
          aria-expanded={expanded}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onExpandedChange(!expanded)
          }}
        >
          <Caret className="size-3" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  )
}
