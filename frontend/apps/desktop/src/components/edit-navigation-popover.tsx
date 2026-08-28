import * as stylex from '@stylexjs/stylex'
import React from 'react'
import {combine} from '@atlaskit/pragmatic-drag-and-drop/combine'
import {draggable, dropTargetForElements, monitorForElements} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {HMNavigationItem, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {packHmId, SearchResult, unpackHmId, useSearch} from '@shm/shared'
import {useDirectory} from '@shm/shared/models/entity'
import {resolveHypermediaUrl} from '@seed-hypermedia/client'
import '@shm/shared/styles/document.css'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {FormField} from '@shm/ui/forms'
import {SearchResultItem} from '@shm/ui/search'
import {Spinner} from '@shm/ui/spinner'
import {usePopoverState} from '@shm/ui/use-popover-state'
import {cn} from '@shm/ui/utils'
import {ChevronDown, EllipsisVertical, Globe, Pencil, Plus, Search, Trash} from 'lucide-react'
import {nanoid} from 'nanoid'
import {useEffect, useRef, useState} from 'react'
const styles_5 = stylex.create({
  sc883a3d5: {
    boxShadow: '0 0 0 2px var(--ring-color, currentcolor)',
  },
})
const styles_4 = stylex.create({
  s66bc867c: {
    maxHeight: '80vh',
    width: '420px',
    overflowY: 'auto',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--overlay-8-10)',
    backgroundColor: 'var(--surface-contrast)',
    padding: 'calc(var(--spacing) * 0)',
  },
  sd6c4b7fc: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: 'var(--overlay-8-10)',
    backgroundColor: 'var(--surface-black)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 3)',
  },
  s4cb35e7: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    marginTop: 'calc(var(--spacing) * 1)',
    justifyContent: 'flex-start',
    paddingInline: 'calc(var(--spacing) * 2)',
  },
  s5e1d0a35: {
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--overlay-8-10)',
    backgroundColor: 'var(--surface-contrast)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sad3d4715: {
    borderColor: 'color-mix(in oklab, var(--primary) 30%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 20%, transparent)',
  },
  sd07b7b7c: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
      },
    },
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2.5)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s8ce93e28: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
  },
  s32a3e7ae: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    cursor: 'grab',
    padding: 'calc(var(--spacing) * 1)',
    ':active': {
      cursor: 'grabbing',
    },
  },
  s5bfcc649: {
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--text-muted-strong)',
    backgroundColor: 'var(--scrim)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: '11px',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--tone-amber-900)',
  },
  s74d9b7a0: {
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'var(--overlay-8-10)',
    backgroundColor: 'var(--surface-black)',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingTop: 'calc(var(--spacing) * 2.5)',
    paddingBottom: 'calc(var(--spacing) * 3)',
  },
  sb412c02f: {
    color: 'var(--destructive)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--destructive)',
        opacity: '100%',
      },
    },
    paddingInline: 'calc(var(--spacing) * 2)',
  },
  s7152e96b: {
    color: 'var(--muted-foreground)',
    position: 'absolute',
    top: '50%',
    left: 'calc(var(--spacing) * 3)',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
  },
  s6823aae4: {
    zIndex: '50',
    maxHeight: '50vh',
    overflowY: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--overlay-8-10)',
    backgroundColor: 'var(--surface-contrast)',
    boxShadow: 'var(--shadow-sm)',
  },
})
const styles_3 = stylex.create({
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sfb3beb77: {
    rotate: '180deg',
  },
  s1bfab962: {
    color: 'var(--primary)',
  },
})
const styles_2 = stylex.create({
  s2920039f: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    textAlign: 'left',
  },
})
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  s9d4b128d: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  sabdedac1: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s21672184: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 3)',
  },
  scdaedd9c: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s83ece90e: {
    color: 'var(--muted-foreground)',
    marginLeft: 'auto',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    transitionProperty: 'transform, translate, scale, rotate',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  s25987cd5: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2.5)',
  },
  s81d6e6b1: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 'calc(0.25rem * 1)',
  },
  s873ae75f: {
    marginRight: 'calc(0.25rem * 1)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s3484a8: {
    paddingLeft: 'calc(0.25rem * 9)',
  },
  sa02df2af: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 3)',
  },
  s2184639f: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
function createEmptyNavigationItem(): HMNavigationItem {
  return {
    id: nanoid(),
    type: 'Link',
    text: '',
    link: '',
  }
}
function getDisplayValueForLink(link: string) {
  if (!link) return ''
  const unpackedLink = unpackHmId(link)
  return unpackedLink ? `/${unpackedLink.path?.join('/') || ''}` : link
}
export function EditNavPopover({
  docNav,
  editDocNav,
  homeId,
}: {
  docNav: HMNavigationItem[]
  editDocNav: (navigation: HMNavigationItem[]) => void
  homeId?: UnpackedHypermediaId
}) {
  const popover = usePopoverState(false)
  const isEmpty = docNav.length === 0
  return (
    <Popover {...popover}>
      <PopoverTrigger asChild className="no-window-drag">
        {isEmpty ? (
          <Button size="sm" variant="ghost">
            <Plus className={stylex.props(styles.sca3de968).className || ''} />
            Add Navigation Item
          </Button>
        ) : (
          <Button size="sm" variant="ghost">
            <Pencil className={stylex.props(styles.sca3de968).className || ''} />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className={stylex.props(styles_4.s66bc867c).className || ''}>
        <EditNavigation docNav={docNav} onDocNav={editDocNav} homeId={homeId} />
      </PopoverContent>
    </Popover>
  )
}
function EditNavigation({
  docNav,
  onDocNav,
  homeId,
}: {
  docNav: HMNavigationItem[]
  onDocNav: (navigation: HMNavigationItem[]) => void
  homeId?: UnpackedHypermediaId
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const didAutoAdd = useRef(false)
  const [isDraggingOverId, setIsDraggingOverId] = useState<string | null>(null)
  const firstBlankItemId = docNav.find((item) => !item.text && !item.link)?.id ?? null
  const [expandedItemId, setExpandedItemId] = useState<string | null>(firstBlankItemId)
  const [autoFocusItemId, setAutoFocusItemId] = useState<string | null>(firstBlankItemId)
  useEffect(() => {
    if (!didAutoAdd.current && docNav.length === 0) {
      didAutoAdd.current = true
      onDocNav([createEmptyNavigationItem()])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!containerRef.current) return
    const cleanup = monitorForElements({
      onDrag: ({location}) => {
        const over = location.current.dropTargets[0]
        if (over) {
          setIsDraggingOverId(over.data.id as string)
        } else {
          setIsDraggingOverId(null)
        }
      },
      onDrop: ({source, location}) => {
        setIsDraggingOverId(null)
        if (!location.current.dropTargets.length) {
          return
        }
        const over = location.current.dropTargets[0]
        const sourceIndex = docNav.findIndex((item) => item.id === source.data.id)
        // @ts-ignore
        const overIndex = docNav.findIndex((item) => item.id === over.data.id)
        if (sourceIndex === -1 || overIndex === -1) {
          return
        }
        const newItems = [...docNav]
        const [removed] = newItems.splice(sourceIndex, 1)
        // @ts-ignore
        newItems.splice(overIndex, 0, removed)
        onDocNav(newItems)
      },
    })
    return cleanup
  }, [docNav, onDocNav])
  useEffect(() => {
    if (expandedItemId && docNav.some((item) => item.id === expandedItemId)) return
    setExpandedItemId(docNav.find((item) => !item.text && !item.link)?.id ?? null)
  }, [docNav, expandedItemId])
  return (
    <div className={stylex.props(styles.s783f19f3).className || ''} ref={containerRef}>
      <div className={stylex.props(styles_4.sd6c4b7fc).className || ''}>
        <div className={stylex.props(styles.s9d4b128d).className || ''}>Navigation</div>
        <div className={stylex.props(styles.sabdedac1).className || ''}>Choose the links shown in the top bar.</div>
      </div>
      <div className={stylex.props(styles.s21672184).className || ''}>
        {docNav.map((item) => {
          return (
            <DraggableNavItem
              key={item.id}
              item={item}
              homeId={homeId}
              filterPresets={(item) => {
                return !docNav.find((i) => i.link === item.link)
              }}
              onUpdate={(result) => {
                onDocNav(docNav.map((i) => (i.id === item.id ? result : i)))
              }}
              onRemove={() => {
                onDocNav(docNav.filter((i) => i.id !== item.id))
              }}
              isDraggingOver={isDraggingOverId === item.id}
              isExpanded={expandedItemId === item.id}
              onToggleExpanded={() => {
                setExpandedItemId((current) => (current === item.id ? null : item.id))
              }}
              autoFocusLabel={autoFocusItemId === item.id}
            />
          )
        })}

        {docNav.length > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            className={stylex.props(styles_4.s4cb35e7).className || ''}
            onClick={() => {
              const newItem = createEmptyNavigationItem()
              setExpandedItemId(newItem.id)
              setAutoFocusItemId(newItem.id)
              onDocNav([...docNav, newItem])
            }}
          >
            <Plus className={stylex.props(styles.sca3de968).className || ''} />
            Add Navigation Item
          </Button>
        ) : null}
      </div>
    </div>
  )
}
function DraggableNavItem({
  item,
  filterPresets,
  onUpdate,
  onRemove,
  homeId,
  isDraggingOver,
  isExpanded,
  onToggleExpanded,
  autoFocusLabel,
}: {
  item: HMNavigationItem
  filterPresets: (item: {link: string}) => boolean
  onUpdate: (item: HMNavigationItem) => void
  onRemove: () => void
  homeId?: UnpackedHypermediaId
  isDraggingOver: boolean
  isExpanded: boolean
  onToggleExpanded: () => void
  autoFocusLabel: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const isIncomplete = !item.text.trim() || !item.link.trim()
  useEffect(() => {
    if (!dragHandleRef.current || !cardRef.current) return
    const cleanup = combine(
      draggable({
        element: dragHandleRef.current,
        getInitialData: () => {
          return {
            id: item.id,
          }
        },
      }),
      dropTargetForElements({
        element: cardRef.current,
        getData: () => {
          return {
            id: item.id,
          }
        },
      }),
    )
    return () => {
      cleanup()
    }
  }, [item.id])
  return (
    <div
      ref={cardRef}
      className={cn(
        stylex.props(styles_4.s5e1d0a35).className || '',
        isDraggingOver ? stylex.props(styles_5.sc883a3d5).className || '' : '',
        stylex.props(isExpanded ? styles_4.sad3d4715 : null).className || '',
      )}
    >
      <div
        className={cn(
          stylex.props(styles_4.sd07b7b7c).className || '',
          stylex.props(isExpanded ? styles_4.s8ce93e28 : null).className || '',
        )}
        ref={dragHandleRef}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: 'grab',
        }}
      >
        <div className={stylex.props(styles_4.s32a3e7ae).className || ''}>
          <EllipsisVertical size={16} />
        </div>
        <button type="button" className={stylex.props(styles_2.s2920039f).className || ''} onClick={onToggleExpanded}>
          <span
            className={cn(
              stylex.props(styles.scdaedd9c).className || '',
              stylex.props(item.text === '' ? styles_3.sf2718385 : null).className || '',
            )}
          >
            {item.text || 'Untitled item'}
          </span>
          {isIncomplete ? <span className={stylex.props(styles_4.s5bfcc649).className || ''}>Incomplete</span> : null}
          <ChevronDown
            className={cn(
              stylex.props(styles.s83ece90e).className || '',
              stylex.props(isExpanded && styles_3.sfb3beb77).className || '',
            )}
          />
        </button>
      </div>
      {isExpanded ? (
        <div className={stylex.props(styles_4.s74d9b7a0).className || ''}>
          <NavItemForm
            item={item}
            homeId={homeId}
            onUpdate={(result) => {
              onUpdate(result)
            }}
            onRemove={onRemove}
            filterPresets={filterPresets}
            autoFocusLabel={autoFocusLabel}
          />
        </div>
      ) : null}
    </div>
  )
}
function NavItemForm({
  item,
  onUpdate,
  onRemove,
  homeId,
  filterPresets,
  autoFocusLabel = false,
}: {
  item: HMNavigationItem
  onUpdate: (result: HMNavigationItem) => void
  onRemove?: () => void
  homeId?: UnpackedHypermediaId
  filterPresets: (item: {link: string}) => boolean
  autoFocusLabel?: boolean
}) {
  return (
    <div className={stylex.props(styles.s25987cd5).className || ''}>
      <FormField name="link" label="Link">
        <HMDocURLInput
          link={item.link}
          onUpdate={(link, title) =>
            onUpdate({
              ...item,
              link,
              text: title,
            })
          }
          homeId={homeId}
          filterPresets={filterPresets}
        />
      </FormField>
      <FormField name="label" label="Label">
        <Input
          autoFocus={autoFocusLabel}
          value={item?.text}
          id="label"
          onChange={(e) =>
            onUpdate({
              ...item,
              text: e.target.value,
            })
          }
          placeholder="My Link…"
        />
      </FormField>
      <div className={stylex.props(styles.s81d6e6b1).className || ''}>
        {onRemove && (
          <Button
            size="sm"
            variant="ghost"
            className={stylex.props(styles_4.sb412c02f).className || ''}
            onClick={() => {
              onRemove()
            }}
          >
            <Trash className={stylex.props(styles.s873ae75f).className || ''} />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
export function HMDocURLInput({
  link,
  onUpdate,
  homeId,
  filterPresets,
}: {
  link: string
  onUpdate: (link: string, title: string) => void
  homeId?: UnpackedHypermediaId
  filterPresets: (item: {link: string}) => boolean
}) {
  const [query, setQuery] = useState(getDisplayValueForLink(link))
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [activeSelection, setActiveSelection] = useState<{
    link: string
    title: string
  } | null>(null)
  const [isResolvingUrl, setIsResolvingUrl] = useState(false)
  const displayValue = getDisplayValueForLink(link)
  const isWebUrl = /^https?:\/\//.test(query.trim())
  const Icon = isWebUrl ? Globe : Search
  useEffect(() => {
    setQuery(displayValue)
  }, [displayValue])
  function closeAndReset() {
    setIsOpen(false)
    setFocusedIndex(0)
    setActiveSelection(null)
    setQuery(displayValue)
    setIsResolvingUrl(false)
  }
  return (
    <div className={stylex.props(styles.sfbc6e28e).className || ''}>
      <div className={stylex.props(styles.sdef3facc).className || ''}>
        <Icon className={stylex.props(styles_4.s7152e96b).className || ''} />
        <Input
          aria-label="Link"
          className={cn(
            stylex.props(styles.s3484a8).className || '',
            stylex.props(link ? styles_3.s1bfab962 : styles_3.sf2718385).className || '',
          )}
          value={query}
          placeholder="Search documents or paste URL"
          onFocus={() => {
            setIsOpen(true)
            setFocusedIndex(0)
          }}
          onBlur={() => {
            window.setTimeout(() => {
              if (
                document.activeElement instanceof HTMLElement &&
                document.activeElement.dataset.navLinkResult === 'true'
              ) {
                return
              }
              closeAndReset()
            }, 0)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setFocusedIndex(0)
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              closeAndReset()
              return
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setFocusedIndex((prev) => prev - 1)
              return
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setFocusedIndex((prev) => prev + 1)
              return
            }
            if (e.key !== 'Enter') return
            const trimmedQuery = query.trim()
            if (!trimmedQuery) return
            e.preventDefault()
            if (/^https?:\/\//.test(trimmedQuery)) {
              onUpdate(trimmedQuery, trimmedQuery)
              setIsResolvingUrl(true)
              try {
                const resolved = await resolveHypermediaUrl(trimmedQuery)
                if (resolved) {
                  onUpdate(resolved.id, resolved.title || trimmedQuery)
                }
              } catch (error) {
                console.error(error)
              } finally {
                setIsResolvingUrl(false)
                setIsOpen(false)
                setActiveSelection(null)
              }
              return
            }
            if (activeSelection) {
              onUpdate(activeSelection.link, activeSelection.title)
              setQuery(getDisplayValueForLink(activeSelection.link))
              setIsOpen(false)
              setFocusedIndex(0)
              setActiveSelection(null)
            }
          }}
        />
      </div>
      {isOpen ? (
        <SearchUI
          query={query}
          focusedIndex={focusedIndex}
          isResolvingUrl={isResolvingUrl}
          onActiveResultChange={setActiveSelection}
          onFocusedIndexChange={setFocusedIndex}
          onValue={(nextLink, title) => {
            onUpdate(nextLink, title)
            setQuery(getDisplayValueForLink(nextLink))
            setIsOpen(false)
            setFocusedIndex(0)
            setActiveSelection(null)
            setIsResolvingUrl(false)
          }}
          homeId={homeId}
          filterPresets={filterPresets}
        />
      ) : null}
    </div>
  )
}
function SearchUI({
  query,
  focusedIndex,
  isResolvingUrl,
  onActiveResultChange,
  onFocusedIndexChange,
  onValue,
  homeId,
  filterPresets,
}: {
  query: string
  focusedIndex: number
  isResolvingUrl: boolean
  onActiveResultChange: (
    result: {
      link: string
      title: string
    } | null,
  ) => void
  onFocusedIndexChange: (index: number | ((prev: number) => number)) => void
  onValue: (link: string, title: string) => void
  homeId?: UnpackedHypermediaId
  filterPresets: (item: {link: string}) => boolean
}) {
  const trimmedQuery = query.trim()
  const isWebUrl = /^https?:\/\//.test(trimmedQuery)
  const isSearching = !!trimmedQuery.length
  const search = useSearch(query, {
    enabled: isSearching && !isWebUrl,
  })
  const dirList = useDirectory(homeId, {
    mode: 'Children',
  })
  const results: SearchResult[] = (
    isSearching
      ? search?.data?.entities
          ?.sort((a, b) => Number(!!b.id.latest) - Number(!!a.id.latest))
          ?.map((item, index) => {
            const title = item.title || item.id.uid
            return {
              key: packHmId(item.id),
              title,
              path: item.parentNames,
              icon: item.icon,
              onFocus: () => {
                onFocusedIndexChange(index)
              },
              onMouseEnter: () => {
                onFocusedIndexChange(index)
              },
              onSelect: () => onValue(packHmId(item.id), item.title || ''),
              subtitle: 'Document',
              searchQuery: item.searchQuery,
              versionTime: item.versionTime || '',
            }
          })
          .filter(Boolean) ?? []
      : dirList.data?.map((d, index) => {
          const id = d.id.id
          return {
            key: id,
            title: d.metadata.name || '',
            path: d.path,
            icon: d.metadata.icon,
            onSelect: () => onValue(id, d.metadata.name || ''),
            subtitle: 'Document',
            searchQuery: query,
            onFocus: () => {
              onFocusedIndexChange(index)
            },
            onMouseEnter: () => {
              onFocusedIndexChange(index)
            },
          }
        }) ?? []
  ).filter((item) =>
    filterPresets({
      link: item.key,
    }),
  )
  const normalizedFocusedIndex =
    results.length > 0 ? ((focusedIndex % results.length) + results.length) % results.length : 0
  const prevActiveKeyRef = useRef<string | null>(null)
  useEffect(() => {
    const activeItem = results[normalizedFocusedIndex]
    const nextKey = activeItem?.key ?? null
    if (nextKey !== prevActiveKeyRef.current) {
      prevActiveKeyRef.current = nextKey
      onActiveResultChange(
        activeItem
          ? {
              link: activeItem.key,
              title: activeItem.title || '',
            }
          : null,
      )
    }
  }, [normalizedFocusedIndex, onActiveResultChange, results])
  return (
    <div className={stylex.props(styles_4.s6823aae4).className || ''}>
      {isResolvingUrl ? (
        <div className={stylex.props(styles.sa02df2af).className || ''}>
          <Spinner />
        </div>
      ) : null}
      {!isResolvingUrl && isWebUrl ? (
        <div className={stylex.props(styles.s2184639f).className || ''}>Press Enter to use this URL.</div>
      ) : null}
      {!isResolvingUrl && !results.length && !isWebUrl ? (
        <div className={stylex.props(styles.s2184639f).className || ''}>
          {isSearching ? 'No documents found.' : 'No documents available.'}
        </div>
      ) : null}
      {!isResolvingUrl &&
        results.map((item, itemIndex) => {
          const isSelected = normalizedFocusedIndex === itemIndex
          return (
            <div key={item.key} data-nav-link-result="true" tabIndex={-1} onMouseDown={(e) => e.preventDefault()}>
              <SearchResultItem
                item={{
                  ...item,
                  path: item.path || [],
                  onSelect: () => {
                    onValue(item.key, item.title || '')
                  },
                  onFocus: () => onFocusedIndexChange(itemIndex),
                  onMouseEnter: () => onFocusedIndexChange(itemIndex),
                }}
                selected={isSelected}
              />
            </div>
          )
        })}
    </div>
  )
}
