import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {bookmarkUrlFromRoute} from '@shm/shared/utils/entity-id-url'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {useHover} from '@shm/shared/use-hover'
import {Button} from '@shm/ui/button'
import {Star} from '@shm/ui/icons'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {Bookmark} from 'lucide-react'
import {ComponentProps} from 'react'
import {useBookmark} from '../models/bookmarks'
const styles = stylex.create({
  s55ac44a1: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    fill: 'currentcolor',
  },
  s9594946f: {
    backgroundColor: 'transparent',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000',
  },
  s8c293c0c: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    stroke: '#fff',
  },
})
function RemoveBookmarkButton({
  onClick,
  active,
  className,
}: {
  onClick: ComponentProps<typeof Button>['onClick']
  active?: boolean
  className?: string
}) {
  const {hover, ...hoverProps} = useHover()
  return (
    <Tooltip content="Remove from Bookmarks">
      <Button
        size="icon"
        variant={active ? 'default' : 'ghost'}
        {...hoverProps}
        onClick={onClick}
        className={cn('no-window-drag', active && 'bg-transparent shadow-none', className)}
      >
        <Bookmark className={stylex.props(styles.s55ac44a1).className || ''} />
      </Button>
    </Tooltip>
  )
}
export function BookmarkButton({
  id,
  hideUntilItemHover,
  active,
  className,
}: {
  id: UnpackedHypermediaId
  hideUntilItemHover?: boolean
  active?: boolean
  className?: string
}) {
  const route = useNavRoute()
  const routeBookmarkUrl = bookmarkUrlFromRoute(route)
  // Use route-derived URL (with view term) only when we're on a page for this document.
  // In list contexts the route is the parent page, so fall back to the base document ID.
  const isCurrentDoc = 'id' in route && (route as any).id?.id === id.id
  const bookmarkUrl = isCurrentDoc && routeBookmarkUrl ? routeBookmarkUrl : id.id
  const bookmark = useBookmark(bookmarkUrl)
  if (bookmark.isBookmarked) {
    return (
      <RemoveBookmarkButton
        active={active}
        className={className}
        onClick={(e) => {
          e.stopPropagation()
          bookmark.removeBookmark()
        }}
      />
    )
  }
  return (
    <Tooltip content="Add To Bookmarks">
      <Button
        size="icon"
        variant={active ? 'default' : 'ghost'}
        className={cn(
          'no-window-drag',
          hideUntilItemHover && 'opacity-0 group-hover:opacity-100',
          stylex.props(styles.s9594946f).className || '',
          className,
        )}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation()
          bookmark.addBookmark()
        }}
      >
        <Bookmark className="stroke-foreground text-foreground size-3.5 dark:stroke-white dark:text-white" />
      </Button>
    </Tooltip>
  )
}
export function useBookmarkMenuItem(url: string | null) {
  const bookmark = useBookmark(url)
  return {
    key: 'toggleBookmark',
    label: bookmark.isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks',
    icon: <Star className={stylex.props(styles.s8c293c0c).className || ''} />,
    onClick: () => {
      bookmark.isBookmarked ? bookmark.removeBookmark() : bookmark.addBookmark()
    },
  }
}
