import * as stylex from '@stylexjs/stylex'
import {useBookmarks, useRemoveBookmark, type BookmarkItem} from '@/models/bookmarks'
import {useSelectedAccountContacts} from '@shm/shared/models/contacts'
import {getContactMetadata} from '@shm/shared/content'
import {useResources} from '@shm/shared/models/entity'
import {createDocumentNavRoute, type ProfileTab} from '@shm/shared/routes'
import {useRouteLink} from '@shm/shared'
import {viewTermToRouteKey, type ViewTerm} from '@shm/shared/utils/entity-id-url'
import {Button} from '@shm/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {HMIcon} from '@shm/ui/hm-icon'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {AlertCircle, Bookmark, Folder, History, Lock, MessageSquare, Quote, Users, X} from 'lucide-react'
import React, {useState, type ElementType, type KeyboardEvent, type MouseEvent, type ReactNode} from 'react'

/** Return a copy of the stored bookmark list ordered from newest to oldest. */
const styles_5 = stylex.create({
  s8a2570e2: {
    color: 'var(--destructive)',
  },
})
const styles_4 = stylex.create({
  s18c13: {
    height: 'calc(0.25rem * 8)',
  },
  s1c462: {
    width: 'calc(0.25rem * 8)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
  s9c668528: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
      },
    },
  },
  sbe4cb2e9: {
    ':focus-visible': {
      backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
    },
  },
  sf8e1b8f0: {
    ':focus-visible': {},
  },
  s2ffff9: {
    display: 'flex',
  },
  sabad9443: {
    minHeight: 'calc(0.25rem * 14)',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  s4779fbc8: {
    ':lastChild': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  sc1942972: {
    ':focus-visible': {
      boxShadow: '0 0 0 2px var(--ring-color, currentcolor)',
    },
  },
  s22d8ea5d: {
    ':focus-visible': {},
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  se1b1d596: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
      },
    },
  },
  sd914ee97: {
    ':focus-visible': {
      backgroundColor: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
    },
  },
  sca3de96c: {
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_3 = stylex.create({
  s7f5653f2: {
    borderColor: 'var(--overlay-15)',
    backgroundColor: 'var(--overlay-10)',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'var(--overlay-20)',
        backgroundColor: 'var(--overlay-15)',
      },
    },
  },
  sc5a0131: {
    borderColor: 'transparent',
  },
  s6e3f8196: {
    width: '100vw',
    maxWidth: 'none',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--overlay-8-10)',
    backgroundColor: 'var(--surface-contrast)',
    padding: 'calc(var(--spacing) * 0)',
    boxShadow: 'var(--shadow-xl)',
    '@media ((min-width: 640px))': {
      width: '360px',
      maxWidth: '360px',
    },
  },
  s6c8e26f1: {
    maxHeight: '75vh',
    overflowY: 'auto',
    '@media ((min-width: 640px))': {
      maxHeight: '50vh',
    },
  },
  sf222097f: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    color: 'var(--muted-foreground)',
    marginBottom: 'calc(var(--spacing) * 5)',
    display: 'flex',
    width: 'calc(var(--spacing) * 14)',
    height: 'calc(var(--spacing) * 14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-2xl)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
})
const styles_2 = stylex.create({
  s67fe302f: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 72)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 10)',
    textAlign: 'center',
  },
  sdd4d6178: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 2)',
    maxWidth: 'calc(0.25rem * 64)',
    fontSize: '0.875rem',
    lineHeight: '1.625',
  },
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
})
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sba77648c: {
    display: 'flex',
    height: 'calc(0.25rem * 14)',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 4)',
  },
  saf49316c: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
  },
  sd3cabf4b: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
    fontVariantNumeric: '   tabular-nums ',
  },
  s51ab7e67: {
    color: 'var(--destructive)',
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sca3de96a: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  sebff7442: {
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
    fontWeight: '600',
  },
  s6c074f86: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  s1047710f: {
    color: 'var(--muted-foreground)',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s26a52803: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    flexShrink: '0',
  },
})
export function newestBookmarksFirst<T>(bookmarks: readonly T[]): T[] {
  return [...bookmarks].reverse()
}

/** Human-readable resource and view label shown beneath a bookmark title. */
export function bookmarkKindLabel(bookmark: Pick<BookmarkItem, 'key' | 'viewTerm'>): string {
  const kind = bookmark.key === 'profile' ? 'Profile' : 'Document'
  if (!bookmark.viewTerm || bookmark.viewTerm === ':profile') return kind
  const view = bookmark.viewTerm.slice(1)
  return `${kind} · ${view.charAt(0).toUpperCase()}${view.slice(1)}`
}
const VIEW_TERM_ICONS: Record<string, ElementType> = {
  ':comments': MessageSquare,
  ':activity': Quote,
  ':collaborators': Users,
  ':directory': Folder,
  ':feed': History,
}
function profileTabFromViewTerm(viewTerm: ViewTerm | null): ProfileTab {
  switch (viewTerm) {
    case ':membership':
      return 'membership'
    case ':followers':
      return 'followers'
    case ':following':
      return 'following'
    default:
      return 'profile'
  }
}

/** Titlebar control and popover for navigating and removing saved bookmarks. */
export function BookmarksPopover() {
  const [open, setOpen] = useState(false)
  const bookmarks = newestBookmarksFirst(useBookmarks())
  const bookmarkEntities = useResources(bookmarks.map((bookmark) => bookmark.id))
  const contacts = useSelectedAccountContacts()
  const removeBookmark = useRemoveBookmark()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content="Bookmarks" asChild>
        <PopoverTrigger asChild>
          <Button
            aria-label="Bookmarks"
            aria-expanded={open}
            className={cn(
              stylex.props(styles_4.s18c13, styles_4.s1c462, styles_4.s775755af, styles_4.sad8c742c, styles_4.s1aa13)
                .className || '',
              'window-no-drag',
              stylex.props(open ? styles_3.s7f5653f2 : styles_3.sc5a0131).className || '',
            )}
          >
            <Bookmark className={stylex.props(styles.sca3de968).className || ''} />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="end" className={stylex.props(styles_3.s6e3f8196).className || ''}>
        <div className={stylex.props(styles.sba77648c).className || ''}>
          <h2 className={stylex.props(styles.saf49316c).className || ''}>Bookmarks</h2>
          <span className={stylex.props(styles.sd3cabf4b).className || ''}>{bookmarks.length}</span>
        </div>
        {bookmarks.length ? (
          <div className={stylex.props(styles_3.s6c8e26f1).className || ''}>
            {bookmarks.map((bookmark, index) => {
              const entity = bookmarkEntities[index]
              const deleting = removeBookmark.isLoading && removeBookmark.variables === bookmark.url
              if (!entity?.data || entity.data.type !== 'document') {
                if (entity?.isLoading) return null
                return (
                  <BookmarkRow
                    key={bookmark.url}
                    bookmark={bookmark}
                    title="Error"
                    titleClassName={stylex.props(styles_5.s8a2570e2).className || ''}
                    icon={<AlertCircle className={stylex.props(styles.s51ab7e67).className || ''} />}
                    deleting={deleting}
                    onRemove={() => removeBookmark.mutate(bookmark.url)}
                    onNavigate={() => setOpen(false)}
                  />
                )
              }
              const {id, document} = entity.data
              const metadata = id.path?.length
                ? document?.metadata
                : getContactMetadata(id.uid, document?.metadata, contacts.data)
              return (
                <BookmarkRow
                  key={bookmark.url}
                  bookmark={bookmark}
                  title={metadata?.name || 'Untitled'}
                  icon={
                    <HMIcon
                      id={id}
                      name={metadata?.name}
                      icon={metadata?.icon}
                      size={24}
                      className={stylex.props(styles.sf032ed6c).className || ''}
                    />
                  }
                  privateDocument={document?.visibility === 'PRIVATE'}
                  deleting={deleting}
                  onRemove={() => removeBookmark.mutate(bookmark.url)}
                  onNavigate={() => setOpen(false)}
                />
              )
            })}
          </div>
        ) : (
          <div className={stylex.props(styles_2.s67fe302f).className || ''}>
            <div className={stylex.props(styles_3.sf222097f).className || ''}>
              <Bookmark className={stylex.props(styles.sca3de96a).className || ''} />
            </div>
            <p className={stylex.props(styles.sebff7442).className || ''}>No bookmarks yet</p>
            <p className={stylex.props(styles_2.sdd4d6178).className || ''}>
              Bookmark documents, profiles, and views to find them quickly here.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
function BookmarkRow({
  bookmark,
  title,
  titleClassName,
  icon,
  privateDocument,
  deleting,
  onRemove,
  onNavigate,
}: {
  bookmark: BookmarkItem
  title: string
  titleClassName?: string
  icon: ReactNode
  privateDocument?: boolean
  deleting: boolean
  onRemove: () => void
  onNavigate: () => void
}) {
  const route =
    bookmark.key === 'profile'
      ? {
          key: 'profile' as const,
          id: bookmark.id,
          tab: profileTabFromViewTerm(bookmark.viewTerm),
        }
      : bookmark.viewTerm
        ? createDocumentNavRoute(bookmark.id, viewTermToRouteKey(bookmark.viewTerm))
        : {
            key: 'document' as const,
            id: bookmark.id,
          }
  const linkProps = useRouteLink(route)
  const ViewTermIcon = bookmark.viewTerm ? VIEW_TERM_ICONS[bookmark.viewTerm] : null
  const navigate = (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    linkProps.onClick?.(event as MouseEvent<HTMLDivElement>)
    onNavigate()
  }
  return (
    <div
      role="link"
      tabIndex={0}
      className={
        stylex.props(
          styles_4.s9c668528,
          styles_4.sbe4cb2e9,
          styles_4.sf8e1b8f0,
          styles_4.s2ffff9,
          styles_4.sabad9443,
          styles_4.sc7847ec6,
          styles_4.sc6ed1702,
          styles_4.s5d936fc,
          styles_4.s7c401f01,
          styles_4.s34b1af,
          styles_4.sa602a1e3,
          styles_4.s4779fbc8,
          styles_4.sc1942972,
          styles_4.s22d8ea5d,
        ).className || ''
      }
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigate(event)
        }
      }}
    >
      {icon}
      <span className={stylex.props(styles_2.se30fd43e).className || ''}>
        <span className={cn(stylex.props(styles.s6c074f86).className || '', titleClassName)} title={title}>
          {title}
        </span>
        <span className={stylex.props(styles.s1047710f).className || ''}>{bookmarkKindLabel(bookmark)}</span>
      </span>
      {ViewTermIcon ? <ViewTermIcon className={stylex.props(styles.s26a52803).className || ''} /> : null}
      {privateDocument ? <Lock className={stylex.props(styles.s26a52803).className || ''} /> : null}
      <Tooltip content="Remove from Bookmarks">
        <Button
          aria-label={`Remove ${title} from Bookmarks`}
          disabled={deleting}
          className={
            stylex.props(
              styles_4.s8a2570e2,
              styles_4.se1b1d596,
              styles_4.sd914ee97,
              styles_4.sca3de96c,
              styles_4.sf032ed6c,
              styles_4.sf799889b,
              styles_4.s60f53bca,
              styles_4.s1aa13,
              styles_4.s765a26ee,
              styles_4.s83442393,
            ).className || ''
          }
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onRemove()
          }}
        >
          <X className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      </Tooltip>
    </div>
  )
}
