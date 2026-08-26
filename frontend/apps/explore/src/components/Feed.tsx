import * as stylex from '@stylexjs/stylex'
import {useInfiniteFeed, useLatestEvent} from '@shm/shared'
import {invalidateQueries} from '@shm/shared/models/query-client'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useHmNavigate} from '../utils/useHmNavigate'
import DataViewer from './DataViewer'
const styles = stylex.create({
  s452fb49b: {
    marginBottom: 'calc(0.25rem * 6)',
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  s2f290a25: {
    textAlign: 'center',
    color: 'oklch(57.7% 0.245 27.325)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  sab36ee45: {
    paddingBlock: 'calc(0.25rem * 4)',
    textAlign: 'center',
  },
  s51dd0aa4: {
    display: 'inline-block',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    animation: 'spin 1s linear infinite',
    borderRadius: 'calc(infinity * 1px)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px',
    borderColor: 'oklch(21% 0.034 264.665)',
  },
  s332784: {
    marginLeft: 'calc(0.25rem * 2)',
  },
})
export default function Feed() {
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error} = useInfiniteFeed(10)
  const {data: latestEvent} = useLatestEvent()
  const navigate = useHmNavigate()
  const observerRef = useRef<IntersectionObserver>()
  const [showNewContentPill, setShowNewContentPill] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [latestKnownId, setLatestKnownId] = useState<string | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  // Flatten all pages into a single array of events
  const allEvents = useMemo(() => data?.pages.flatMap((page) => page.events) || [], [data?.pages])

  // Check for new content
  useEffect(() => {
    if (latestEvent && allEvents.length > 0) {
      const currentLatestId = (
        allEvents[0] as {
          id?: string
        }
      )?.id

      // Update the latest known ID when we have new data
      if (latestKnownId !== currentLatestId) {
        setLatestKnownId(currentLatestId || null)
      }
      if (
        (
          latestEvent as {
            id?: string
          }
        ).id !== currentLatestId
      ) {
        if (isAtTop) {
          // If at top, automatically refresh by invalidating the entire query
          invalidateQueries(['infinite-feed'])
        } else {
          // If scrolled down, show the pill
          setShowNewContentPill(true)
        }
      } else {
        // If IDs match, hide the pill
        setShowNewContentPill(false)
      }
    }
  }, [latestEvent, allEvents, isAtTop, latestKnownId])

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsAtTop(scrollTop < 100) // Consider "at top" if within 100px
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle clicking the new content pill
  const handleNewContentClick = () => {
    setShowNewContentPill(false)
    // Invalidate the entire infinite query to get all new pages
    invalidateQueries(['infinite-feed'])
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
  console.log('feed.data', allEvents)
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <h1 className={stylex.props(styles.s452fb49b).className || ''}>Event Feed</h1>
        <div className={stylex.props(styles.s65e234f5).className || ''}>Loading…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <h1 className={stylex.props(styles.s452fb49b).className || ''}>Event Feed</h1>
        <div className={stylex.props(styles.s2f290a25).className || ''}>Error loading feed</div>
      </div>
    )
  }
  return (
    <div className="container mx-auto max-w-4xl p-4">
      {/* New Content Pill */}
      {showNewContentPill && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 transform">
          <button
            onClick={handleNewContentClick}
            className="bg-link hover:bg-link-hover flex items-center justify-center gap-2 rounded-full px-4 py-2 font-medium whitespace-nowrap text-white shadow-lg transition-colors duration-200"
          >
            <svg
              className={stylex.props(styles.sca3de968).className || ''}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            New events available
          </button>
        </div>
      )}

      <h1 className={stylex.props(styles.s452fb49b).className || ''}>Event Feed</h1>
      <div className={stylex.props(styles.sfbc6e290).className || ''}>
        {allEvents.map((event: any, index: number) => (
          <div
            className="container mx-auto max-w-4xl rounded-lg bg-white p-4 shadow"
            key={event.id}
            ref={index === allEvents.length - 1 ? lastElementRef : undefined}
          >
            <DataViewer data={event} onNavigate={navigate} />
          </div>
        ))}
        {isFetchingNextPage && (
          <div className={stylex.props(styles.sab36ee45).className || ''}>
            <div className={stylex.props(styles.s51dd0aa4).className || ''}></div>
            <span className={stylex.props(styles.s332784).className || ''}>Loading more…</span>
          </div>
        )}
      </div>
    </div>
  )
}
