import type {NavRoute} from '@shm/shared/routes'

/** Returns a fallback title for routes without a resource title. */
export function getRouteLabel(route: NavRoute): string | null {
  switch (route.key) {
    case 'onboarding':
      return 'Welcome to Seed Hypermedia'
    case 'library':
      return 'Library'
    case 'agents':
      return 'Agents'
    case 'drafts':
      return 'Drafts'
    case 'contacts':
      return 'Contacts'
    case 'bookmarks':
      return 'Bookmarks'
    case 'settings':
      return 'Settings'
    case 'api-inspector':
      return 'API Inspector'
    case 'query-documents':
      return 'Query Documents'
    case 'explore':
      return 'Explore'
    case 'draft':
      return 'Draft'
    default:
      return null
  }
}
