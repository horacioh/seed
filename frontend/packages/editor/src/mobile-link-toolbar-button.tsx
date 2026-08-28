import * as stylex from '@stylexjs/stylex'
import {hmId, packHmId, packReferenceUrl, unpackHmId} from '@shm/shared'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useSearch} from '@shm/shared/models/search'
import {resolveHypermediaUrl, type DomainResolverFn} from '@seed-hypermedia/client'
import {Button} from '@shm/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@shm/ui/components/dialog'
import {Input} from '@shm/ui/components/input'
import {SearchResultItem} from '@shm/ui/search'
import {Spinner} from '@shm/ui/spinner'
import {cn} from '@shm/ui/utils'
import {Check, Link2, Unlink, X} from 'lucide-react'
import {useCallback, useEffect, useState} from 'react'
import {BlockNoteEditor, BlockSchema, useEditorSelectionChange} from './blocknote'
const styles_2 = stylex.create({
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
  sca3de96d: {
    width: 'calc(0.25rem * 9)',
    height: 'calc(0.25rem * 9)',
  },
  sf032ed6c: {
    flexShrink: '0',
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
  sb42244d4: {
    height: '100%',
  },
  se35af15d: {
    maxHeight: '100%',
  },
  scdbaf625: {
    width: '100%',
  },
  sfcf3a2ae: {
    maxWidth: '100%',
  },
  s775ae258: {
    borderRadius: '0',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  sca3de96c: {
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s333e0a: {
    marginRight: 'calc(0.25rem * 2)',
  },
  s620be2c4: {
    maxHeight: '60vh',
  },
  s7c401f13: {
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
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
  s65e234f5: {
    textAlign: 'center',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
})
export const MobileLinkToolbarButton = <BSchema extends BlockSchema>(props: {editor: BlockNoteEditor<BSchema>}) => {
  const [url, setUrl] = useState<string>(props.editor.getSelectedLinkUrl() || '')
  const [text, setText] = useState<string>(props.editor.getSelectedText() || '')
  const [isOpen, setIsOpen] = useState(false)
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
      setIsOpen(false)
      props.editor.focus()
      props.editor.createLink(url, text)
    },
    [props.editor],
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
    setIsOpen(false)
  }
  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          stylex.props(styles.s291c6d79).className || '',
          stylex.props(styles_2.se117420b).className || '',
          stylex.props(styles.se8df6f15).className || '',
          stylex.props(styles_2.sa0da43a7).className || '',
          stylex.props(styles.sca3de96d, styles.sf032ed6c).className || '',
          isOpen
            ? stylex.props(styles.s5f36a877, styles.s2daecf89, styles.s291c6e52, styles.s25eca887).className || ''
            : '',
        )}
        onClick={() => setIsOpen(true)}
      >
        <Link2 className={stylex.props(styles.sca3de968).className || ''} />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={
            stylex.props(
              styles.sb42244d4,
              styles.se35af15d,
              styles.scdbaf625,
              styles.sfcf3a2ae,
              styles.s775ae258,
              styles.s1aa13,
            ).className || ''
          }
          showCloseButton={false}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className={stylex.props(styles.s2ffff9, styles.sb42244d4, styles.s67e351ac).className || ''}>
            <DialogHeader className={stylex.props(styles.s7c401f01, styles.s1aa17).className || ''}>
              <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sc1a629cb).className || ''}>
                <DialogTitle>Add Link</DialogTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className={stylex.props(styles.sca3de96c).className || ''}
                >
                  <X className={stylex.props(styles.sca3de968).className || ''} />
                </Button>
              </div>
            </DialogHeader>

            <div className={stylex.props(styles.sb42feb5d, styles.sac38f2ae).className || ''}>
              <LinkSearchInput
                initialUrl={url}
                isOpen={isOpen}
                domainResolver={props.editor.domainResolver}
                onLinkSelect={(selectedUrl: string) => {
                  if (url) {
                    setLink(selectedUrl, undefined, url)
                  } else {
                    setLink(selectedUrl, undefined)
                  }
                }}
                onCancel={() => setIsOpen(false)}
                onDeleteLink={url ? deleteLink : undefined}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
function LinkSearchInput({
  initialUrl = '',
  isOpen,
  domainResolver,
  onLinkSelect,
  onCancel,
  onDeleteLink,
}: {
  initialUrl?: string
  isOpen: boolean
  domainResolver?: DomainResolverFn
  onLinkSelect: (url: string) => void
  onCancel: () => void
  onDeleteLink?: () => void
}) {
  const [searchValue, setSearchValue] = useState(initialUrl)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const isHttpUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://') || url.includes('.')
  const isHypermediaUrl = (url: string) => url.startsWith('hm://') || unpackHmId(url) !== null
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
          const finalUrl = url.startsWith('http') ? url : `https://${url}`
          onLinkSelect(finalUrl)
        } else {
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
    <div className={stylex.props(styles.s2ffff9, styles.s67e351ac).className || ''}>
      <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s5d936fb, styles.s1aa17).className || ''}>
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search documents or enter a URL"
          onKeyDown={handleKeyDown}
        />

        <div className={stylex.props(styles.s2ffff9, styles.s5d936fb).className || ''}>
          {isLoading ? (
            <Spinner size="small" />
          ) : (
            <Button
              variant="default"
              className={stylex.props(styles.sb42feb5d).className || ''}
              disabled={!searchValue}
              onClick={() => handleUrlSubmit(searchValue)}
            >
              <Check className={stylex.props(styles.s333e0a, styles.sca3de968).className || ''} />
              Add Link
            </Button>
          )}

          {onDeleteLink && (
            <Button variant="destructive" onClick={onDeleteLink}>
              <Unlink className={stylex.props(styles.s333e0a, styles.sca3de968).className || ''} />
              Remove
            </Button>
          )}
        </div>
      </div>

      {allItems.length > 0 && (
        <div className={stylex.props(styles.s620be2c4, styles.sac38f2ae, styles.s7c401f13).className || ''}>
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
