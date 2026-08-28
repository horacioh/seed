import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {
  getDocumentTitle,
  packReferenceUrl,
  SearchResult,
  unpackHmId,
  useRouteLinkHref,
  useSearch,
  useUniversalAppContext,
} from '@shm/shared'
import {ContentTypeFilter, SearchType} from '@shm/shared/client/.generated/entities/v1alpha/entities_pb'
import {useResource} from '@shm/shared/models/entity'
import {Fragment, PropsWithChildren, useEffect, useMemo, useRef, useState} from 'react'
import {Button} from './button'
import {ScrollArea} from './components/scroll-area'
import {Search} from './icons'
import {Spinner} from './spinner'
import {SizableText} from './text'
import {usePopoverState} from './use-popover-state'
import {IS_WEB} from '@shm/shared/constants'
import {useDebounce} from '@shm/shared/utils/use-debounce'
import {useIsomorphicLayoutEffect} from '@shm/shared/utils/use-isomorphic-layout-effect'
import {Input} from './components/input'
import {Popover, PopoverContent, PopoverTrigger} from './components/popover'
import {HMIcon} from './hm-icon'
import {Separator} from './separator'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles_4 = stylex.create({
  s74586d9b: {
    color: 'var(--muted-foreground)',
    position: 'absolute',
    top: '50%',
    right: 'calc(var(--spacing) * 2)',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
  },
  s661644f6: {
    backgroundColor: 'var(--background)',
    position: 'absolute',
    insetInline: 'calc(var(--spacing) * 2)',
    top: 'calc(100% + 8px)',
    zIndex: '20',
    maxHeight: '65dvh',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: 'var(--shadow-sm)',
  },
  sdfaef2d3: {
    maxHeight: '65dvh',
  },
  sff0b9a5b: {
    display: 'none',
    flexDirection: 'column',
    '@media ((min-width: 640px))': {
      display: 'flex',
    },
  },
  scc11e8f6: {
    backgroundColor: 'var(--surface-hover)',
  },
  sa8e74781: {
    display: 'flex',
    height: 'calc(100vh - 100px)',
    maxHeight: '600px',
    flexDirection: 'column',
  },
  s9b4a76a1: {
    position: 'absolute',
    top: '50%',
    left: 'calc(var(--spacing) * 4)',
    zIndex: '30',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
  },
  sc14611cb: {
    color: 'var(--muted-foreground)',
    position: 'absolute',
    top: '50%',
    right: 'calc(var(--spacing) * 4)',
    zIndex: '30',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
  },
  s820fadce: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--brand-12)',
      },
    },
    ':active': {
      backgroundColor: 'var(--brand-11)',
    },
    containerType: 'inline-size',
    display: 'flex',
    height: 'auto',
    width: '100%',
    alignItems: 'flex-start',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: '0',
    paddingBlock: 'calc(var(--spacing) * 2)',
  },
  s6f0c3745: {
    backgroundColor: 'var(--brand-10)',
    color: 'var(--text-on-secondary)',
    display: 'inline-block',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(var(--spacing) * 1)',
    fontWeight: 'var(--font-weight-medium)',
  },
  s35ddbd0c: {
    position: 'absolute',
    top: '50%',
    left: 'calc(var(--spacing) * 2.5)',
    zIndex: '3',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
  },
  s1bfd6f2d: {
    position: 'absolute',
    top: '50%',
    right: 'calc(var(--spacing) * 7)',
    zIndex: '3',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
    color: 'var(--overlay-50)',
  },
  sddbbea52: {
    maxHeight: '200px',
    minHeight: 'calc(var(--spacing) * 0)',
    flex: '1',
    overflow: 'hidden',
  },
})
const styles_3 = stylex.create({
  s579c56af: {
    backgroundColor: 'var(--brand-12)',
  },
})
const styles_2 = stylex.create({
  sf1ed2181: {
    minHeight: 'calc(0.25rem * 0)',
    width: '100%',
    maxWidth: '42rem',
    flex: '1',
  },
  sfbcb1886: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 'calc(0.25rem * 1)',
  },
  seb39dbfa: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    overflow: 'hidden',
  },
  s946f13fd: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
  },
})
const styles = stylex.create({
  sca36b5d1: {
    color: 'var(--muted-foreground)',
    padding: 'calc(0.25rem * 4)',
    textAlign: 'center',
  },
  s2c26492e: {
    color: 'var(--destructive)',
    padding: 'calc(0.25rem * 4)',
    textAlign: 'center',
  },
  sd3f5e2f6: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 4)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s2145d5b1: {
    position: 'relative',
    zIndex: '20',
    width: '100%',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: 'calc(0.25rem * 2)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s92d3c495: {
    width: '100%',
    flex: '1',
    paddingRight: 'calc(0.25rem * 8)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s62783270: {
    height: 'calc(0.25rem * 8)',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'transparent',
    padding: 'calc(0.25rem * 0)',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
  sf2aded09: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    alignSelf: 'stretch',
    padding: 'calc(0.25rem * 2)',
  },
  s39d68924: {
    height: 'calc(0.25rem * 8)',
    flex: '1',
    paddingRight: 'calc(0.25rem * 8)',
    paddingLeft: 'calc(0.25rem * 8)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  sc95934cc: {
    display: 'flex',
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    flex: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sf8247e22: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '1',
    height: 'calc(0.25rem * 5)',
    width: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    fontWeight: '500',
  },
  s7f32d374: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '1',
    flex: 'none',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    color: 'oklch(70.7% 0.022 261.325)',
  },
  s558ede3b: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '1',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-sans)',
    color: 'oklch(70.7% 0.022 261.325)',
  },
  s24363b51: {
    flex: 'none',
    whiteSpace: 'nowrap',
    color: 'oklch(70.7% 0.022 261.325)',
  },
  se978af5d: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sd9440047: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s97941fa1: {
    width: '100%',
    paddingInline: 'calc(0.25rem * 1)',
    paddingRight: 'calc(0.25rem * 8)',
    paddingLeft: 'calc(0.25rem * 8)',
  },
  sb42244d4: {
    height: '100%',
  },
})
const SEARCH_DEBOUNCE_MS = 250

// Runs two parallel keyword searches and merges them:
// - Primary: scoped to the current site with iriFilter.
// - Secondary: global TITLE-only search, client-filtered to account-home
//   entries (no path) so foreign contributor profiles surface without
//   polluting results with unrelated docs from other sites.
// Keyword-only because the web server runs the embedder on CPU and HYBRID
// costs 5-8s; keyword is ~20ms per leg and the two run in parallel.
function useSiteSearch(searchValue: string, siteHomeId: UnpackedHypermediaId | null) {
  const query = searchValue.trim()
  const enabled = !!query
  const primary = useSearch(query, {
    enabled,
    iriFilter: siteHomeId?.uid ? `hm://${siteHomeId.uid}*` : undefined,
    includeBody: true,
    contextSize: Math.max(8, 48 - query.length),
    searchType: SearchType.SEARCH_KEYWORD,
    pageSize: 20,
  })
  const profiles = useSearch(query, {
    enabled,
    contentTypeFilter: [ContentTypeFilter.CONTENT_TYPE_TITLE],
    searchType: SearchType.SEARCH_KEYWORD,
    pageSize: 8,
  })
  const entities = useMemo(() => {
    const primaryEntities = primary.data?.entities ?? []
    const profileEntities = (profiles.data?.entities ?? []).filter((e) => !e.id.path || e.id.path.length === 0)
    const seen = new Set<string>()
    const out: typeof primaryEntities = []
    for (const e of [...profileEntities, ...primaryEntities]) {
      const key = packReferenceUrl(e.id)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(e)
    }
    return out
  }, [primary.data, profiles.data])
  return {
    entities,
    isFetching: primary.isFetching || profiles.isFetching,
    isError: primary.isError || profiles.isError,
  }
}
function toSearchResults(entities: ReturnType<typeof useSiteSearch>['entities']): SearchResult[] {
  return entities.map((item) => {
    const title = item.title || item.id.uid
    return {
      id: item.id,
      key: packReferenceUrl(item.id),
      title,
      path: item.parentNames,
      icon: item.icon,
      onFocus: () => {},
      onMouseEnter: () => {},
      searchQuery: item.searchQuery,
      versionTime: item.versionTime || '',
    } as SearchResult
  })
}
function SearchStatusMessage({
  query,
  isLoading,
  isError,
  hasResults,
}: {
  query: string
  isLoading: boolean
  isError: boolean
  hasResults: boolean
}) {
  if (!query) {
    return <div className={stylex.props(styles.sca36b5d1).className || ''}>Type to search documents</div>
  }
  if (isError) {
    return <div className={stylex.props(styles.s2c26492e).className || ''}>Search failed</div>
  }
  if (isLoading) {
    return (
      <div className={stylex.props(styles.sd3f5e2f6).className || ''}>
        <Spinner className={stylex.props(styles.sca3de968).className || ''} />
        <span>Searching…</span>
      </div>
    )
  }
  if (!hasResults) {
    return <div className={stylex.props(styles.sca36b5d1).className || ''}>No results found</div>
  }
  return null
}
export function MobileSearch({
  siteHomeId,
  onSelect,
  onSearchActiveChange,
}: {
  siteHomeId: UnpackedHypermediaId | null
  onSelect: () => void
  onSearchActiveChange?: (isActive: boolean) => void
}) {
  const [searchValue, setSearchValue] = useState('')
  const trimmedSearchValue = searchValue.trim()
  const debouncedSearchValue = useDebounce(trimmedSearchValue, SEARCH_DEBOUNCE_MS)
  const isSearchActive = trimmedSearchValue.length > 0
  const isDebouncing = isSearchActive && debouncedSearchValue !== trimmedSearchValue
  const searchResults = useSiteSearch(debouncedSearchValue, siteHomeId)
  const isLoading = isDebouncing || searchResults.isFetching
  const resultEntities = isDebouncing ? [] : searchResults.entities
  const searchItems: SearchResult[] = toSearchResults(resultEntities)
  useEffect(() => {
    onSearchActiveChange?.(isSearchActive)
    return () => onSearchActiveChange?.(false)
  }, [isSearchActive, onSearchActiveChange])
  return (
    <div className={stylex.props(styles.s2145d5b1).className || ''}>
      <div className={stylex.props(styles.sdef3facc).className || ''}>
        <Input
          className={stylex.props(styles.s92d3c495).className || ''}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
          }}
          placeholder="Search Documents"
        />
        {isLoading ? <Spinner className={stylex.props(styles_4.s74586d9b).className || ''} /> : null}
      </div>
      {isSearchActive ? (
        <div className={stylex.props(styles_4.s661644f6).className || ''}>
          <ScrollArea className={stylex.props(styles_4.sdfaef2d3).className || ''}>
            <div className={stylex.props(styles.s34b56e).className || ''}>
              {searchItems.length > 0 ? (
                searchItems.map((item: SearchResult) => {
                  return (
                    <Fragment key={item.key}>
                      <SearchResultItem
                        item={{
                          ...item,
                        }}
                        onSelect={onSelect}
                        siteHomeId={siteHomeId}
                        selected={false}
                      />
                    </Fragment>
                  )
                })
              ) : (
                <SearchStatusMessage
                  query={trimmedSearchValue}
                  isLoading={isLoading}
                  isError={searchResults.isError}
                  hasResults={searchItems.length > 0}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  )
}
export function HeaderSearch({siteHomeId}: {siteHomeId: UnpackedHypermediaId | null}) {
  const popoverState = usePopoverState()
  const [searchValue, setSearchValue] = useState('')
  const trimmedSearchValue = searchValue.trim()
  const debouncedSearchValue = useDebounce(trimmedSearchValue, SEARCH_DEBOUNCE_MS)
  const isDebouncing = trimmedSearchValue.length > 0 && debouncedSearchValue !== trimmedSearchValue
  const searchResults = useSiteSearch(debouncedSearchValue, siteHomeId)
  const isLoading = isDebouncing || searchResults.isFetching
  const resultEntities = isDebouncing ? [] : searchResults.entities
  const [focusedIndex, setFocusedIndex] = useState(0)
  const universalAppContext = useUniversalAppContext()

  // Clear search when popover closes
  useEffect(() => {
    if (!popoverState.open) {
      setSearchValue('')
      setFocusedIndex(0)
    }
  }, [popoverState.open])

  // Listen for Command+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    if (!IS_WEB) return
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        popoverState.onOpenChange(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [popoverState])
  const searchItems: SearchResult[] = toSearchResults(resultEntities)
  useEffect(() => {
    if (focusedIndex >= searchItems.length) setFocusedIndex(0)
  }, [focusedIndex, searchItems])
  return (
    <div className={stylex.props(styles_4.sff0b9a5b).className || ''}>
      <Popover
        {...popoverState}
        onOpenChange={(open) => {
          popoverState.onOpenChange(open)
        }}
      >
        <Tooltip content="Search">
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                stylex.props(styles.s62783270).className || '',
                stylex.props(popoverState.open ? styles_4.scc11e8f6 : null).className || '',
              )}
            >
              <Search className={stylex.props(styles.sca3de968).className || ''} />
            </Button>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent align="end" side="bottom" className={stylex.props(styles.s1aa13).className || ''}>
          <div className={stylex.props(styles_4.sa8e74781).className || ''}>
            <div className={stylex.props(styles.sf2aded09).className || ''}>
              <Search className={stylex.props(styles_4.s9b4a76a1).className || ''} />
              {isLoading ? <Spinner className={stylex.props(styles_4.sc14611cb).className || ''} /> : null}
              <Input
                value={searchValue}
                className={stylex.props(styles.s39d68924).className || ''}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    popoverState.onOpenChange(false)
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (!universalAppContext || isLoading) {
                      return
                    }
                    const selectedEntity = resultEntities[focusedIndex]
                    if (!selectedEntity) {
                      return
                    }
                    universalAppContext.openRoute?.({
                      key: 'document',
                      id: selectedEntity.id,
                    })
                    popoverState.onOpenChange(false)
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    if (!searchItems.length) return
                    setFocusedIndex((prev) => (prev - 1 + searchItems.length) % searchItems.length)
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    if (!searchItems.length) return
                    setFocusedIndex((prev) => (prev + 1) % searchItems.length)
                  }
                }}
              />
            </div>
            <div className={stylex.props(styles_2.sf1ed2181).className || ''}>
              <ScrollArea>
                <div className={stylex.props(styles.s783f19f3).className || ''}>
                  {searchItems.length > 0 ? (
                    searchItems.map((item: SearchResult, index: number) => {
                      return (
                        <Fragment key={item.key}>
                          <div
                            ref={
                              focusedIndex === index
                                ? (el) => {
                                    if (el) {
                                      const container = el.closest('[data-radix-scroll-area-viewport]')
                                      if (container) {
                                        const containerRect = container.getBoundingClientRect()
                                        const elementRect = el.getBoundingClientRect()
                                        if (elementRect.bottom > containerRect.bottom) {
                                          container.scrollTop += elementRect.bottom - containerRect.bottom
                                        } else if (elementRect.top < containerRect.top) {
                                          container.scrollTop -= containerRect.top - elementRect.top
                                        }
                                      }
                                    }
                                  }
                                : undefined
                            }
                          >
                            <SearchResultItem
                              item={item}
                              siteHomeId={siteHomeId}
                              selected={focusedIndex === index}
                              // onSelect={() => {
                              //   popoverState.onOpenChange(false)
                              // }}
                            />
                          </div>
                          {index === searchItems.length - 1 ? undefined : <Separator />}
                        </Fragment>
                      )
                    })
                  ) : (
                    <SearchStatusMessage
                      query={trimmedSearchValue}
                      isLoading={isLoading}
                      isError={searchResults.isError}
                      hasResults={searchItems.length > 0}
                    />
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
export function SearchResultItem({
  item,
  siteHomeId,
  selected = false,
  className,
  onSelect,
  ...props
}: {
  item: SearchResult
  siteHomeId?: UnpackedHypermediaId | null
  selected: boolean
  className?: string
  onSelect?: () => void
}) {
  const elm = useRef<HTMLDivElement>(null)
  const collapsedPath = useCollapsedPath(item.path ?? [], elm)
  const routeKey = item.key.split(':comments/')[0] || item.key
  const unpackedId = unpackHmId(routeKey)
  useIsomorphicLayoutEffect(() => {
    if (selected) {
      elm.current?.scrollIntoView({
        block: 'nearest',
      })
    }
  }, [selected])
  const navigateProps = useRouteLinkHref(routeKey)
  const selectProps = item.onSelect
    ? {
        onClick: () => {
          item.onSelect?.()
          onSelect?.()
        },
      }
    : {
        ...navigateProps,
        onClick: (e: any) => {
          onSelect?.()
          navigateProps?.onClick?.(e)
        },
      }
  return (
    <Button
      {...props}
      variant="ghost"
      {...selectProps}
      data-testid={`search-result-${item.title}`}
      className={cn(
        // dark:hover:bg-brand-12 overrides the ghost variant's dark:hover:bg-muted
        stylex.props(styles_4.s820fadce).className || '',
        stylex.props(selected && styles_3.s579c56af).className || '',
        className,
      )}
    >
      {/* Icon column (only takes space if present) */}
      {item.icon && (
        <div className={stylex.props(styles.sc95934cc).className || ''}>
          {unpackedId ? <HMIcon id={unpackedId} icon={item.icon} /> : null}
        </div>
      )}

      {/* Main (title/details) column */}
      <div className={stylex.props(styles_2.sfbcb1886).className || ''}>
        <SizableText className={stylex.props(styles.sf8247e22).className || ''}>
          {!!item.path && unpackedId?.blockRef
            ? item.path[item.path?.length - 1]
            : highlightSearchMatch(item.title, item.searchQuery)}
        </SizableText>

        {unpackedId?.blockRef && (
          <SizableText size="xs" weight="light" className={stylex.props(styles.s7f32d374).className || ''}>
            ...{highlightSearchMatch(item.title, item.searchQuery)}...
          </SizableText>
        )}

        {!!item.path && (unpackedId?.latest || item.versionTime) && (
          <div className={stylex.props(styles_2.seb39dbfa).className || ''}>
            <div className={stylex.props(styles_2.s946f13fd).className || ''}>
              {!!item.path && (
                <SizableText size="xs" weight="light" className={stylex.props(styles.s558ede3b).className || ''}>
                  {collapsedPath.join(' / ')}
                </SizableText>
              )}
            </div>

            {/* Type column */}
            <Tooltip content={item.versionTime || 'No timestamp available'}>
              <SizableText
                className={stylex.props(styles.s24363b51).className || ''}
                size="xs"
                weight="light"
                color={unpackedId?.latest ? 'success' : 'default'}
              >
                {unpackedId?.latest ? 'Latest Version' : item.versionTime ? 'Previous Version' : ''}
              </SizableText>
            </Tooltip>
          </div>
        )}
      </div>
    </Button>
  )
}
export type SearchResultItem = {
  key: string
  title: string
  subtitle?: string
  path: string[]
  id?: UnpackedHypermediaId
  onSelect: () => void
  onFocus: () => void
  onMouseEnter: () => void
}
export function RecentSearchResultItem({
  item,
  selected,
  siteHomeId,
  ...props
}: {
  item: SearchResultItem
  selected: boolean
  siteHomeId?: UnpackedHypermediaId | null
  onFocus?: (e: React.FocusEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseDown?: (e: React.MouseEvent) => void
}) {
  let path = normalizePath(item.path.slice(0, -1))
  const homeUnpacked = item.id ? unpackHmId(`hm://${item.id.uid}`) : null
  const homeEntity = useResource(homeUnpacked)
  if (item.id) {
    const doc = homeEntity.data?.type === 'document' ? homeEntity.data.document : undefined
    const homeTitle = getDocumentTitle(doc)
    if (homeTitle && homeTitle !== item.title) {
      path = [homeTitle, ...path]
    }
  }
  return (
    <SearchResultItem
      {...props}
      item={{
        ...item,
      }}
      selected={selected}
      siteHomeId={siteHomeId}
    />
  )
}
export function highlightSearchMatch(text: string, highlight: string = '') {
  if (!highlight) return text
  const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'))
  return (
    <>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === highlight.toLowerCase()
        return isMatch ? (
          <SizableText className={stylex.props(styles_4.s6f0c3745).className || ''} key={i}>
            {part}
          </SizableText>
        ) : (
          part
        )
      })}
    </>
  )
}
export function SearchInput({
  children,
  inputProps,
  onArrowDown,
  onArrowUp,
  onEscape,
  onEnter,
  loading,
}: PropsWithChildren<{
  searchResults: Array<SearchResult>
  inputProps: {
    value: string
    onChangeText: (text: string) => void
    disabled: boolean
  }
  onEscape: () => void
  onArrowUp: () => void
  onArrowDown: () => void
  onEnter: () => void
  focusedIndex: number
  loading?: boolean
}>) {
  return (
    <div className={stylex.props(styles.se978af5d).className || ''}>
      <div className={stylex.props(styles.sd9440047).className || ''}>
        <Search className={stylex.props(styles_4.s35ddbd0c).className || ''} />
        {loading ? <Spinner className={stylex.props(styles_4.s1bfd6f2d).className || ''} /> : null}
        <Input
          autoFocus={true}
          placeholder="Search Hypermedia documents"
          className={stylex.props(styles.s97941fa1).className || ''}
          {...inputProps}
          onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              onEscape?.()
            }
            if (e.nativeEvent.key === 'Enter') {
              e.preventDefault()
              onEnter?.()
            }
            if (e.nativeEvent.key === 'ArrowUp') {
              e.preventDefault()
              onArrowUp?.()
            }
            if (e.nativeEvent.key === 'ArrowDown') {
              e.preventDefault()
              onArrowDown?.()
            }
          }}
        />
      </div>
      <div className={stylex.props(styles_4.sddbbea52).className || ''}>
        <ScrollArea className={stylex.props(styles.sb42244d4).className || ''}>{children}</ScrollArea>
      </div>
    </div>
  )
}
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function normalizePath(path: string[]): string[] {
  return path.map((segment) => {
    const [first, ...rest] = segment.split('-')
    // @ts-ignore
    return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(' ')
  })
}
export function useCollapsedPath(
  path: string[],
  containerRef: React.RefObject<HTMLElement>,
  fontSize = 12,
  maxWidth = 200, // fallback width if ref not ready
) {
  const [collapsedPath, setCollapsedPath] = useState<string[]>(path)
  useEffect(() => {
    if (!containerRef.current || path.length <= 3) {
      setCollapsedPath(path)
      return
    }
    const containerWidth = containerRef.current.offsetWidth || maxWidth
    const spacer = 10
    const charWidth = fontSize * 0.6 // approx width of each character

    // Estimate full breadcrumb width
    const fullWidth = path.reduce((acc, item) => acc + item.length * charWidth + spacer, 0)
    if (fullWidth <= containerWidth) {
      setCollapsedPath(path)
    } else {
      // @ts-ignore
      setCollapsedPath([path[0], '…', path[path.length - 1]])
    }
  }, [path, containerRef])
  return collapsedPath
}
