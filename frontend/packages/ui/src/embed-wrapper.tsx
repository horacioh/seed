import * as stylex from '@stylexjs/stylex'
import './blocks-content.css'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {getRoutePanel, type DocumentPanelRoute, type DocumentRoute, type NavRoute} from '@shm/shared'
import {useRouteLink} from '@shm/shared/routing'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {packHmId} from '@shm/shared/utils/entity-id-url'
import {HTMLAttributes, MouseEvent, PropsWithChildren, useMemo} from 'react'
import {blockStyles} from './blocks-content-utils'
import {useHighlighter} from './highlight-context'
import {cn} from './utils'
const styles_3 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
})
const styles_2 = stylex.create({
  s79f948d1: {
    borderLeftColor: 'var(--primary)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '3px',
  },
  s7cc0508b: {
    cursor: 'pointer',
    color: 'inherit',
    textDecorationLine: 'none',
  },
})
const styles = stylex.create({
  s77fea5a8: {
    margin: 'calc(0.25rem * 0)',
    borderRadius: '0',
  },
})
function isInteractiveEmbedClickTarget(event: MouseEvent<HTMLElement>) {
  const target = event.target as HTMLElement | null
  if (!target?.closest) return false
  const embedEl = target.closest('[data-content-type="embed"]')
  const interactiveEl = target.closest(
    'a[href], .link[href], button, input, textarea, select, [role="button"], [data-embed-interactive]',
  )
  return !!interactiveEl && interactiveEl !== embedEl
}

/** Builds a document route for an embed while retaining the currently active panel. */
export function getEmbedDocumentRoute(id: UnpackedHypermediaId, currentRoute: NavRoute): DocumentRoute {
  const panel = getRoutePanel(currentRoute) as DocumentPanelRoute | null
  return panel
    ? {
        key: 'document',
        id,
        panel,
      }
    : {
        key: 'document',
        id,
      }
}
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
  const Wrapper = openOnClick && effectiveRoute ? 'a' : 'div'
  if (!id) return null
  return (
    <Wrapper
      contentEditable={false}
      className={cn(
        stylex.props(styles_3.s2ffff9, styles_3.s67e351ac).className || '',
        'block-embed hm-prose',
        blockStyles,
        stylex.props(!hideBorder && styles_2.s79f948d1).className || '',
        stylex.props(styles.s77fea5a8).className || '',
        stylex.props(openOnClick && effectiveRoute && styles_2.s7cc0508b).className || '',
      )}
      data-is-range={isRange ? 'true' : undefined}
      data-content-type="embed"
      data-url={packHmId(id)}
      data-view={viewType}
      data-blockid={
        id && id.blockRange && 'expanded' in id.blockRange && id.blockRange.expanded ? id?.blockRef : undefined
      }
      data-resourceid={id?.blockRef ? undefined : id?.id}
      {...(openOnClick && effectiveRoute ? linkAttributes : {})}
      onClick={
        openOnClick && effectiveRoute
          ? (e) => {
              if (isInteractiveEmbedClickTarget(e)) return
              const selection = window.getSelection()
              const hasSelection = selection && selection.toString().length > 0
              if (hasSelection) {
                e.preventDefault()
                return
              }
              routeOnClick?.(e)
            }
          : undefined
      }
      {...highlight(id)}
      {...props}
    >
      {children}
    </Wrapper>
  )
}
