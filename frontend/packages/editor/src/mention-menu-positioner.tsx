import * as stylex from '@stylexjs/stylex'
import {InlineMentionsResult, useInlineMentions} from '@shm/shared/models/inline-mentions'
import type {SearchResultItem as SearchResultData} from '@shm/shared/models/search'
import {packHmId, packReferenceUrl} from '@shm/shared/utils/entity-id-url'
import {useDebounce} from '@shm/shared/utils/use-debounce'
import {SearchResultItem} from '@shm/ui/search'
import {SizableText} from '@shm/ui/text'
import {TooltipProvider} from '@shm/ui/tooltip'
import Tippy from '@tippyjs/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {BlockNoteEditor} from './blocknote/core/BlockNoteEditor'
import {BlockSchema} from './blocknote/core/extensions/Blocks/api/blockTypes'
import type {MentionMenuState} from './mention-menu-plugin'
const styles = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s61c52e09: {
    maxHeight: '10em',
  },
  s34453852: {
    width: '20em',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s4779fbc8: {
    ':lastChild': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
})
const groupsOrder = ['Contacts', 'Recents', 'Profiles', 'Documents'] as const
type GroupKey = (typeof groupsOrder)[number]
function isOptionsEmpty(obj: InlineMentionsResult) {
  return Object.values(obj).every((value) => value.length === 0)
}
function getVisibleGroups(suggestions: InlineMentionsResult): GroupKey[] {
  return groupsOrder.filter((g) => suggestions[g].length > 0)
}
export function MentionMenuPositioner<BSchema extends BlockSchema>({
  editor,
  perspectiveAccountUid,
}: {
  editor: BlockNoteEditor<BSchema>
  perspectiveAccountUid?: string | null
}) {
  const [show, setShow] = useState(false)
  const [query, setQuery] = useState('')
  const referencePos = useRef<DOMRect>()
  const decorationIdRef = useRef<string>()
  const scroller = useRef<HTMLElement | null>(null)
  const [scrollTick, setScrollTick] = useState(0)
  const debouncedQuery = useDebounce(query, 250)
  const {onMentionsQuery} = useInlineMentions(perspectiveAccountUid)
  const [suggestions, setSuggestions] = useState<InlineMentionsResult>({
    Recents: [],
    Profiles: [],
    Documents: [],
    Contacts: [],
  })
  const [index, setIndex] = useState<[GroupKey, number]>(['Recents', 0])
  const [hasFetched, setHasFetched] = useState(false)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const refreshReferencePos = useCallback(() => {
    if (!decorationIdRef.current) return
    const el = document.querySelector(`[data-decoration-id="${decorationIdRef.current}"]`)
    if (el) {
      referencePos.current = el.getBoundingClientRect()
      setScrollTick((t) => t + 1)
    }
  }, [])
  useEffect(() => {
    setTimeout(() => {
      scroller.current = document.getElementById('scroll-page-wrapper')
    }, 100)
  }, [])
  useEffect(() => {
    if (!show) return
    // Prefer the editor's nearest scroll ancestor over the global page scroller.
    const scrollEl =
      editor.domElement.closest('[data-radix-scroll-area-viewport]') ?? scroller.current ?? document.documentElement
    if (!scrollEl) return
    const onScroll = () => refreshReferencePos()
    scrollEl.addEventListener('scroll', onScroll, {
      passive: true,
    })
    return () => scrollEl.removeEventListener('scroll', onScroll)
  }, [show, editor, refreshReferencePos])
  useEffect(() => {
    if (!editor.mentionMenu) return
    return editor.mentionMenu.onUpdate((state: MentionMenuState) => {
      setShow(state.show)
      setQuery(state.query)
      referencePos.current = state.referencePos
      if (state.show) {
        decorationIdRef.current = editor.mentionMenu!.decorationId
      }
      if (!state.show) {
        setSuggestions({
          Recents: [],
          Profiles: [],
          Documents: [],
          Contacts: [],
        })
        setIndex(['Recents', 0])
        setHasFetched(false)
        decorationIdRef.current = undefined
      }
    })
  }, [editor])
  useEffect(() => {
    if (!editor.mentionMenu) return
    return editor.mentionMenu.onKeyboard(({key}) => {
      if (key === 'ArrowUp') {
        setIndex((prev) => {
          const [group, idx] = prev
          const groups = getVisibleGroups(suggestions)
          if (groups.length === 0) return prev
          if (idx > 0) return [group, idx - 1]
          const groupIdx = groups.indexOf(group)
          if (groupIdx <= 0) {
            const lastGroup = groups[groups.length - 1]!
            return [lastGroup, suggestions[lastGroup].length - 1]
          }
          const prevGroup = groups[groupIdx - 1]!
          return [prevGroup, suggestions[prevGroup].length - 1]
        })
      } else if (key === 'ArrowDown') {
        setIndex((prev) => {
          const [group, idx] = prev
          const groups = getVisibleGroups(suggestions)
          if (groups.length === 0) return prev
          if (idx < suggestions[group].length - 1) return [group, idx + 1]
          const groupIdx = groups.indexOf(group)
          if (groupIdx >= groups.length - 1) return [groups[0]!, 0]
          return [groups[groupIdx + 1]!, 0]
        })
      } else if (key === 'Enter') {
        handleSelect()
      }
    })
  }, [editor, suggestions, index])
  function handleSelect() {
    const [group, idx] = index
    const groups = getVisibleGroups(suggestions)
    if (groups.indexOf(group) >= 0 && idx < suggestions[group].length) {
      const item = suggestions[group][idx]
      if (item) {
        editor.mentionMenu?.insertMention(
          packReferenceUrl({
            ...item.id,
            latest: !item.id.blockRef,
          }),
        )
      }
    }
  }
  useEffect(() => {
    if (!show) return
    let isActive = true
    onMentionsQuery(debouncedQuery).then((results: InlineMentionsResult) => {
      if (!isActive) return
      setSuggestions((prev) => ({
        ...prev,
        ...results,
      }))
      setHasFetched(true)
      if (isOptionsEmpty(results) && debouncedQuery.length > 5) {
        editor.mentionMenu?.closeNoResults()
      }
    })
    return () => {
      isActive = false
    }
  }, [debouncedQuery, show])
  useEffect(() => {
    const firstGroup = groupsOrder.find((g) => suggestions[g].length > 0)
    if (firstGroup) {
      setIndex([firstGroup, 0])
    }
  }, [suggestions])
  useEffect(() => {
    const el = itemRefs.current[`${index[0]}-${index[1]}`]
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [index])
  const groups = useMemo(() => getVisibleGroups(suggestions), [suggestions])
  const getReferenceClientRect = useMemo(
    () => {
      if (!referencePos.current) return undefined
      const rect = referencePos.current
      return () =>
        ({
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          x: rect.left,
          y: rect.top,
          toJSON: () => {},
        }) as DOMRect
    },
    [referencePos.current, scrollTick], // eslint-disable-line
  )
  function selectItem(item: SearchResultData) {
    editor.mentionMenu?.insertMention(
      packReferenceUrl({
        ...item.id,
        latest: !item.id.blockRef,
      }),
    )
  }
  const hasResults = groups.length > 0
  const content = useMemo(() => {
    return (
      <TooltipProvider>
        <div
          className={
            stylex.props(
              styles.s1a01a0ed,
              styles.s436dc7b6,
              styles.s2ffff9,
              styles.s61c52e09,
              styles.s34453852,
              styles.s67e351ac,
              styles.sac38f2ae,
              styles.s529492ad,
              styles.sad8c742c,
              styles.s8a6c2948,
            ).className || ''
          }
        >
          {hasFetched && !hasResults && (
            <div
              className={
                stylex.props(styles.s2ffff9, styles.s5d936fb, styles.s605ce4a1, styles.s34b1af, styles.s34b56e)
                  .className || ''
              }
            >
              <SizableText size="sm" className={stylex.props(styles.sb42feb5d).className || ''}>
                No Results
              </SizableText>
            </div>
          )}
          {groups.map((group) => (
            <div
              className={
                stylex.props(styles.s1a01a0ed, styles.s2ffff9, styles.s67e351ac, styles.s4779fbc8).className || ''
              }
              key={group}
            >
              <div
                className={
                  stylex.props(styles.s2ffff9, styles.s5d936fb, styles.s605ce4a1, styles.s34b1af, styles.s34b56e)
                    .className || ''
                }
              >
                <SizableText size="sm" className={stylex.props(styles.sf2718385, styles.sb42feb5d).className || ''}>
                  {group}
                </SizableText>
                {suggestions[group].length >= 1 ? (
                  <SizableText size="xs" className={stylex.props(styles.sf2718385).className || ''}>
                    {suggestions[group].length === 1 ? '1 item' : `${suggestions[group].length} items`}
                  </SizableText>
                ) : null}
              </div>
              {suggestions[group].map((item, i) => {
                const [currentGroup, currentIdx] = index
                const title = item.title || item.id.uid
                return (
                  <div
                    key={`${group}-${item.id.id}`}
                    ref={(el: HTMLDivElement | null) => {
                      itemRefs.current[`${group}-${i}`] = el
                    }}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return
                      e.preventDefault()
                      selectItem(item)
                    }}
                  >
                    <SearchResultItem
                      selected={currentGroup === group && currentIdx === i}
                      item={{
                        // @ts-expect-error id is not in SearchResult but used by the component
                        id: item.id,
                        key: packHmId(item.id),
                        title,
                        path: item.parentNames,
                        icon: item.icon,
                        onFocus: () => {},
                        onMouseEnter: () => {},
                        onSelect: () => selectItem(item),
                        subtitle: 'Document',
                        searchQuery: item.searchQuery,
                        versionTime: item.versionTime || '',
                      }}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </TooltipProvider>
    )
  }, [suggestions, groups, index, editor, hasResults, hasFetched])
  return (
    <Tippy
      // Always append to document.body so the popup escapes any container
      // stacking context.
      appendTo={document.body}
      content={content}
      getReferenceClientRect={getReferenceClientRect}
      interactive={true}
      visible={show}
      animation={'fade'}
      placement="bottom-start"
      zIndex={100000}
    />
  )
}
