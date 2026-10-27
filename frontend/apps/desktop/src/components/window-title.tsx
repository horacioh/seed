import {getWindowTitle} from '@/hooks/route-breadcrumbs'
import {getRouteLabel} from '@/utils/route-label'
import type {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {getDocumentTitle} from '@shm/shared/content'
import {useResource} from '@shm/shared/models/entity'
import type {NavRoute} from '@shm/shared/routes'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {useEffect} from 'react'

function getRouteResourceId(route: NavRoute): UnpackedHypermediaId | null {
  switch (route.key) {
    case 'contact':
    case 'profile':
    case 'site-profile':
    case 'document':
    case 'feed':
    case 'directory':
    case 'all-documents':
    case 'collaborators':
    case 'activity':
    case 'comments':
    case 'metadata':
    case 'inspect':
    case 'site-settings':
      return route.id
    default:
      return null
  }
}

/** Synchronizes the current desktop page name to Electron's native window title. */
export function WindowTitle() {
  const route = useNavRoute()
  const resource = useResource(getRouteResourceId(route))
  const activeName =
    resource.data?.type === 'document' ? getDocumentTitle(resource.data.document) || undefined : undefined
  const routeTitle = getWindowTitle(route, activeName)
  const label = routeTitle === 'Seed' ? getRouteLabel(route) || routeTitle : routeTitle
  const title = label === 'Seed' ? label : `${label} – Seed`

  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <span className="sr-only" aria-live="polite" aria-atomic="true">
      {title}
    </span>
  )
}
