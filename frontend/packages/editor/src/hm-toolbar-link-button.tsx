import * as stylex from '@stylexjs/stylex'
import {resolveHypermediaUrl, type DomainResolverFn} from '@seed-hypermedia/client'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {hmId, packHmId, packReferenceUrl, unpackHmId} from '@shm/shared'
import {useSearch} from '@shm/shared/models/search'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {Close} from '@shm/ui/icons'
import {SearchResultItem} from '@shm/ui/search'
import {Spinner} from '@shm/ui/spinner'
import {Tooltip} from '@shm/ui/tooltip'
import {usePopoverState} from '@shm/ui/use-popover-state'
import {cn} from '@shm/ui/utils'
import {Check, Link2, Unlink} from 'lucide-react'
import {useCallback, useEffect, useState} from 'react'
import {BlockNoteEditor, BlockSchema, useEditorSelectionChange} from './blocknote'
const styles_2 = stylex.create({
  s68989642: {
    ':is(.dark *)': {
      borderColor: 'color-mix(in oklab, #fff 10%, transparent)',
    },
  },
  se117420b: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'color-mix(in oklab, #fff 10%, transparent)',
      },
    },
  },
  sa0da43a7: {
    ':is(.dark *)': {
      ':focus': {
        backgroundColor: 'color-mix(in oklab, #fff 10%, transparent)',
      },
    },
  },
})
const styles = stylex.create({
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  se45bb2b0: {
    borderColor: 'color-mix(in oklab, #000 10%, transparent)',
  },
  s291c6d79: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
      },
    },
  },
  se8df6f15: {
    ':focus': {
      backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
    },
  },
  s5f36a877: {
    backgroundColor: '#000',
  },
  s2daecf89: {
    color: '#fff',
  },
  s291c6e52: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 80%, transparent)',
      },
    },
  },
  s25eca887: {
    ':hover': {
      '@media (hover: hover)': {
        color: '#fff',
      },
    },
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  s6a2edbb: {
    width: 'fit-content',
  },
  sf887c4ab: {
    minWidth: '400px',
  },
  s8d9e6ddc: {
    maxWidth: '500px',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sda323b8f: {
    maxHeight: '300px',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  s775ae258: {
    borderRadius: '0',
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
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
})
export const HMLinkToolbarButton = <BSchema extends BlockSchema>(props: {
  editor: BlockNoteEditor<BSchema>
  testId: string
}) => {
  const [url, setUrl] = useState<string>(props.editor.getSelectedLinkUrl() || '')
  const [text, setText] = useState<string>(props.editor.getSelectedText() || '')
  const {open, ...popoverProps} = usePopoverState()
  const closePopover = useCallback(() => {
    popoverProps.onOpenChange(false)
  }, [popoverProps])
  useEditorSelectionChange(props.editor, () => {
    setText(props.editor.getSelectedText() || '')
    setUrl(props.editor.getSelectedLinkUrl() || '')
  })
  useEffect(() => {
    const removeListener = props.editor.hyperlinkToolbar!.on('update', (state) => {
      setText(state.text || '')
      setUrl(state.url || '')
    })
    return () => removeListener()
  }, [props.editor])
  const setLink = useCallback(
    (url: string, text?: string, currentUrl?: string) => {
      if (currentUrl) {
        deleteLink()
      }
      closePopover()
      props.editor.focus()
      props.editor.createLink(url, text)
    },
    [closePopover, props.editor],
  )
  const deleteLink = () => {
    const url = props.editor.getSelectedLinkUrl()
    if (url) {
      const {view} = props.editor._tiptapEditor
      const {state} = view
      const $urlPos = state.doc.resolve(state.selection.from)
      const linkMarks = $urlPos.parent.firstChild!.marks
      if (linkMarks && linkMarks.length > 0) {
        // @ts-ignore
        const linkMark = linkMarks.find((mark) => mark.type.name == 'link')
        view.dispatch(
          view.state.tr.removeMark($urlPos.start(), $urlPos.end(), linkMark).setMeta('preventAutolink', true),
        )
        view.focus()
      }
    }
  }
  return (
    <Popover open={open} {...popoverProps}>
      <PopoverTrigger asChild>
        <span>
          <Button
            data-testid={props.testId}
            size="icon"
            variant="ghost"
            className={cn(
              stylex.props(styles.sf79988b7, styles.sad8c742c, styles.se45bb2b0).className || '',
              stylex.props(styles_2.s68989642).className || '',
              stylex.props(styles.s291c6d79).className || '',
              stylex.props(styles_2.se117420b).className || '',
              stylex.props(styles.se8df6f15).className || '',
              stylex.props(styles_2.sa0da43a7).className || '',
              'format-toolbar-item',
              open
                ? stylex.props(styles.s5f36a877, styles.s2daecf89, styles.s291c6e52, styles.s25eca887).className || ''
                : '',
            )}
          >
            <Link2 className={stylex.props(styles.sca3de968).className || ''} />
          </Button>
        </span>
      </PopoverTrigger>

      <PopoverContent
        className={
          stylex.props(
            styles.s1a01a0ed,
            styles.s436dc7b6,
            styles.sc05281e3,
            styles.s6a2edbb,
            styles.sf887c4ab,
            styles.s8d9e6ddc,
            styles.sad8c742c,
            styles.s1aa13,
            styles.s8a6c2964,
          ).className || ''
        }
        side="bottom"
        sideOffset={52}
      >
        <LinkSearchInput
          initialUrl={url}
          domainResolver={props.editor.domainResolver}
          onLinkSelect={(selectedUrl: string) => {
            closePopover()
            props.editor.focus()
            if (url) {
              // TODO: find out why text needs to be here
              setLink(selectedUrl, undefined, url)
            } else {
              setLink(selectedUrl, undefined)
            }
          }}
          onCancel={closePopover}
          onDeleteLink={deleteLink}
        />
      </PopoverContent>
    </Popover>
  )
}
function LinkSearchInput({
  initialUrl = '',
  domainResolver,
  onLinkSelect,
  onCancel,
  onDeleteLink,
}: {
  initialUrl?: string
  domainResolver?: DomainResolverFn
  onLinkSelect: (url: string) => void
  onCancel: () => void
  onDeleteLink?: () => void
}) {
  const [searchValue, setSearchValue] = useState(initialUrl)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Helper functions to detect URL types
  const isHttpUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://') || url.includes('.')
  const isHypermediaUrl = (url: string) => url.startsWith('hm://') || unpackHmId(url) !== null

  // Use the search hook from shared package
  const searchResults = useSearch(searchValue, {
    enabled: !!searchValue && !isHttpUrl(searchValue) && !isHypermediaUrl(searchValue),
    includeBody: false,
    contextSize: 48 - searchValue.length,
  })
  const searchItems =
    searchResults?.data?.entities?.map((item, index) => ({
      id: item.id,
      key: packReferenceUrl(item.id),
      title: item.title || item.id.uid,
      path: item.parentNames,
      icon: item.icon,
      searchQuery: item.searchQuery,
      versionTime: item.versionTime || '',
      onSelect: () => handleDocumentSelect(item.id),
      onFocus: () => setFocusedIndex(index),
      onMouseEnter: () => setFocusedIndex(index),
    })) || []
  const handleDocumentSelect = (id: UnpackedHypermediaId) => {
    const url = packReferenceUrl(id)
    onLinkSelect(url)
  }
  const handleUrlSubmit = useCallback(
    async (url: string) => {
      if (!url.trim()) return
      try {
        setIsLoading(true)
        if (isHttpUrl(url) || isHypermediaUrl(url)) {
          // Handle hypermedia URL resolution
          if (isHypermediaUrl(url)) {
            try {
              const resolved = await resolveHypermediaUrl(url, {
                domainResolver,
              })
              if (resolved) {
                const baseId = unpackHmId(resolved.id)
                if (baseId) {
                  const u = new URL(url.startsWith('http') ? url : `https://${url.replace('hm://', '')}`)
                  const latest = u.searchParams.get('l')
                  const blockRef = u.hash?.slice(1)
                  const id = hmId(baseId.uid, {
                    path: baseId.path,
                    latest: latest === '',
                  })
                  const finalUrl = `${packHmId(id)}${blockRef ? `#${blockRef}` : ''}`
                  onLinkSelect(finalUrl)
                  return
                }
              }
            } catch (e) {
              console.warn('Failed to resolve hypermedia URL, using as-is:', e)
            }
          }

          // Handle HTTP URLs or fallback
          const finalUrl = url.startsWith('http') ? url : `https://${url}`
          onLinkSelect(finalUrl)
        } else {
          // If it's not a URL and there are no search results, treat as a regular URL
          const finalUrl = `https://${url}`
          onLinkSelect(finalUrl)
        }
      } catch (e) {
        console.error('Error processing URL:', e)
        onLinkSelect(url)
      } finally {
        setIsLoading(false)
      }
    },
    [onLinkSelect],
  )
  const allItems = [
    ...(searchValue && (isHttpUrl(searchValue) || isHypermediaUrl(searchValue))
      ? [
          {
            key: 'url-input',
            title: `Link to: ${searchValue}`,
            onSelect: () => handleUrlSubmit(searchValue),
            onFocus: () => setFocusedIndex(0),
            onMouseEnter: () => setFocusedIndex(0),
          },
        ]
      : []),
    ...searchItems,
  ]
  useEffect(() => {
    if (focusedIndex >= allItems.length) setFocusedIndex(0)
  }, [focusedIndex, allItems.length])
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (allItems[focusedIndex]) {
        allItems[focusedIndex].onSelect()
      } else {
        handleUrlSubmit(searchValue)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev + 1) % allItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev - 1 + allItems.length) % allItems.length)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }
  return (
    <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.sf79988b7).className || ''}>
      {/* Search Input Header */}
      <div
        className={
          stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fb, styles.s7c401f01, styles.s1aa15).className ||
          ''
        }
      >
        <Input
          data-testid="link-search-input"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search documents or enter a URL"
          className={stylex.props(styles.sb42feb5d).className || ''}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        {isLoading ? (
          <Spinner size="small" />
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              stylex.props(styles.s291c6d79).className || '',
              stylex.props(styles_2.se117420b).className || '',
              stylex.props(styles.se8df6f15).className || '',
              stylex.props(styles_2.sa0da43a7).className || '',
            )}
            disabled={!searchValue}
            onClick={() => handleUrlSubmit(searchValue)}
          >
            <Check className={stylex.props(styles.sca3de967).className || ''} />
          </Button>
        )}

        {onDeleteLink && (
          <Tooltip content="Delete Link" side="top">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                stylex.props(styles.s291c6d79).className || '',
                stylex.props(styles_2.se117420b).className || '',
                stylex.props(styles.se8df6f15).className || '',
                stylex.props(styles_2.sa0da43a7).className || '',
              )}
              onClick={onDeleteLink}
            >
              <Unlink className={stylex.props(styles.sca3de967).className || ''} />
            </Button>
          </Tooltip>
        )}

        <Button
          size="icon"
          variant="ghost"
          className={cn(
            stylex.props(styles.s291c6d79).className || '',
            stylex.props(styles_2.se117420b).className || '',
            stylex.props(styles.se8df6f15).className || '',
            stylex.props(styles_2.sa0da43a7).className || '',
          )}
          onClick={onCancel}
        >
          <Close className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      </div>

      {/* Search Results */}
      {allItems.length > 0 && (
        <div className={stylex.props(styles.sda323b8f, styles.sac38f2ae).className || ''}>
          {allItems.map((item, index) => (
            <SearchResultItem
              key={item.key}
              item={item}
              selected={focusedIndex === index}
              onSelect={() => item.onSelect()}
              className={
                stylex.props(styles.s1a01a0ed, styles.s775ae258, styles.s7c401f01, styles.s4779fbc8).className || ''
              }
            />
          ))}
        </div>
      )}

      {searchValue &&
        !isHttpUrl(searchValue) &&
        !isHypermediaUrl(searchValue) &&
        searchItems.length === 0 &&
        !searchResults.isLoading && (
          <div
            className={
              stylex.props(styles.sf2718385, styles.s1aa17, styles.s65e234f5, styles.sab7cc6fa).className || ''
            }
          >
            No documents found. Press Enter to create a web link.
          </div>
        )}
    </div>
  )
}
