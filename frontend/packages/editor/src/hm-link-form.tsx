import * as stylex from '@stylexjs/stylex'
import {SearchResult} from '@seed-hypermedia/client/editor-types'
import {useAccount, useResource} from '@shm/shared/models/entity'
import {useSearch} from '@shm/shared/models/search'
import {hmId, packHmId, packReferenceUrl, unpackHmId} from '@shm/shared/utils/entity-id-url'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {Label} from '@shm/ui/components/label'
import {SwitchField} from '@shm/ui/form-fields'
import {useHighlighter} from '@shm/ui/highlight-context'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  CircleDot,
  ExternalLink,
  File,
  Link as LinkIcon,
  PanelBottom,
  Quote,
  Search,
  TextCursorInput,
  Trash,
  Unlink,
} from '@shm/ui/icons'
import {SearchResultItem} from '@shm/ui/search'
import {Separator} from '@shm/ui/separator'
import {SizableText} from '@shm/ui/text'
import {cn} from '@shm/ui/utils'
import {ReactNode, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {BlockNoteEditor} from './blocknote'
import {getNodeById} from './blocknote/core/api/util/nodeUtil'
import './hm-link-form.css'
import {HMBlockSchema} from './schema'
const styles = stylex.create({
  s1cfa2: {
    zIndex: '5',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  sf2243a08: {
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'var(--muted)',
      },
    },
  },
  s2ac16bec: {
    ':focus': {
      borderColor: 'var(--muted)',
    },
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s335852: {
    marginBlock: 'calc(0.25rem * 3)',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s33458c: {
    marginTop: 'calc(0.25rem * 2)',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  s3484a0: {
    paddingLeft: 'calc(0.25rem * 1)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s1bfab962: {
    color: 'var(--primary)',
  },
  s6044a01e: {
    justifyContent: 'flex-end',
  },
  s67010d77: {
    position: 'absolute',
  },
  s1d8b174c: {
    zIndex: '99999',
  },
  sdd9beccd: {
    maxHeight: '500px',
  },
  sa4fc76f8: {
    overflow: 'scroll',
  },
  s77547602: {
    borderBottomRightRadius: 'calc(var(--radius) - 2px)',
    borderBottomLeftRadius: 'calc(var(--radius) - 2px)',
  },
  sa1198998: {
    borderTopColor: 'transparent',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  s34b56f: {
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
  sb76e9daa: {
    display: 'none',
  },
  s486c2d2f: {
    opacity: '100%',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s335492: {
    marginInline: 'calc(0.25rem * 4)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s37120a61: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  scdbaf625: {
    width: '100%',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  s7c401ecf: {
    borderStyle: 'solid',
    borderWidth: '0px',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  s18c13: {
    height: 'calc(0.25rem * 8)',
  },
  sc007588a: {
    marginLeft: 'calc(0.25rem * 1.5)',
  },
})
const LINK_TYPES = [
  {
    value: 'link',
    label: 'Link',
    icon: LinkIcon,
  },
  {
    value: 'inline-embed',
    label: 'Mention',
    icon: Quote,
  },
  {
    value: 'button',
    label: 'Button',
    icon: CircleDot,
  },
  {
    value: 'embed',
    label: 'Content Embed',
    icon: File,
  },
  {
    value: 'comments',
    label: 'Discussions Embed',
    icon: File,
  },
  {
    value: 'card',
    label: 'Card',
    icon: PanelBottom,
  },
  {
    value: 'embed-link',
    label: 'Embed Link',
    icon: ExternalLink,
  },
]
export type HypermediaLinkFormProps = {
  editor: BlockNoteEditor<HMBlockSchema>
  children?: ReactNode
  id: string
  url: string
  text: string
  isHmLink: boolean
  type: 'link' | 'inline-embed' | 'embed' | 'card' | 'embed-link' | 'button' | 'comments'
  updateLink: (url: string, text: string, hideMenu: boolean) => void
  resetLink: () => void
  hasName?: boolean
  hasSearch?: boolean
  onChangeType?: (type: string) => void
  toolbarProps?: {
    alignment?: 'flex-start' | 'center' | 'flex-end'
    view?: string
    [key: string]: any
  }
}
export function HypermediaLinkForm(props: HypermediaLinkFormProps) {
  const [_url, setUrl] = useState(props.url || '')
  const [_text, setText] = useState(props.text || '')
  const [selectedType, setSelectedType] = useState(props.type)
  const unpacked = unpackHmId(_url)
  const isSeedLink = !!unpacked
  const isLatestVersion = isSeedLink ? unpacked.latest !== false : false
  useEffect(() => {
    setSelectedType(props.type)
  }, [props.type])
  function handleKeydown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' || event.key == 'Enter') {
      event.preventDefault()
      props.updateLink(_url, _text, true)
    }
  }
  return (
    <div className={stylex.props(styles.s1cfa2, styles.s2ffff9, styles.s67e351ac, styles.s5d936fb).className || ''}>
      <LinkTypeDropdown
        selected={selectedType}
        onSelect={(val) => {
          // @ts-expect-error
          setSelectedType(val)
          props.onChangeType?.(val)
        }}
        isHmLink={props.isHmLink}
      />
      {props.hasName && (
        <div
          className={
            stylex.props(
              styles.s436dc7b6,
              styles.s1a01a0ed,
              styles.sf2243a08,
              styles.s2ac16bec,
              styles.s2ffff9,
              styles.sc6ed1702,
              styles.s5d936fb,
              styles.sf79988b7,
              styles.s34b1ad,
            ).className || ''
          }
        >
          <TextCursorInput size={16} />
          <Input
            data-testid="link-text-input"
            className={stylex.props(styles.sb42feb5d).className || ''}
            placeholder={`${props.type} text`}
            id="link-text"
            value={_text}
            onKeyDown={handleKeydown}
            onChangeText={(val) => {
              setText(val)
              props.updateLink(_url, val, false)
            }}
          />
        </div>
      )}
      <div
        className={
          stylex.props(
            styles.s436dc7b6,
            styles.s1a01a0ed,
            styles.sf2243a08,
            styles.s2ac16bec,
            styles.s2ffff9,
            styles.sc6ed1702,
            styles.s5d936fb,
            styles.sf79988b7,
            styles.s34b1ad,
          ).className || ''
        }
      >
        <Search size={16} />
        <SearchInput
          updateLink={props.updateLink}
          link={_url}
          text={_text}
          type={props.type}
          setLink={setUrl}
          title={props.type === 'inline-embed' ? true : false}
        />
      </div>

      {(props.type === 'embed' || props.type === 'card' || props.type === 'inline-embed') && isSeedLink && (
        <div
          className={stylex.props(styles.s335852, styles.s2ffff9, styles.s67e351ac, styles.s5d936fc).className || ''}
        >
          {!unpacked.blockRef && (
            <SwitchField
              label="Show Latest Version"
              id="latest"
              defaultChecked={isLatestVersion}
              style={{
                opacity: isLatestVersion ? 1 : 0.4,
              }}
              onCheckedChange={(checked) => {
                const newUrl = packHmId({
                  ...unpacked,
                  latest: checked,
                })
                setUrl(newUrl)
                props.updateLink(newUrl, _text, false)
              }}
            />
          )}
          {props.type === 'embed' && unpacked.blockRef && (
            <SwitchField
              label="Include Children"
              id="expanded"
              defaultChecked={
                !!unpacked.blockRange && 'expanded' in unpacked.blockRange && !!unpacked.blockRange.expanded
              }
              style={{
                opacity:
                  unpacked.blockRange && 'expanded' in unpacked.blockRange && unpacked.blockRange.expanded ? 1 : 0.4,
              }}
              onCheckedChange={(checked) => {
                const newUrl = packHmId({
                  ...unpacked,
                  blockRange: {
                    ...unpacked.blockRange,
                    expanded: checked,
                  },
                })
                setUrl(newUrl)
                props.updateLink(newUrl, _text, false)
              }}
            />
          )}
        </div>
      )}
      {props.toolbarProps?.alignment && (
        <div
          className={
            stylex.props(styles.s33458c, styles.s2ffff9, styles.sc1a629cb, styles.s5d936fa, styles.s3484a0).className ||
            ''
          }
        >
          <Label>Alignment</Label>
          <div className={stylex.props(styles.s2ffff9, styles.s5d936fc).className || ''}>
            <Button
              size="icon"
              onClick={() => {
                props.editor.updateBlock(props.id, {
                  props: {
                    alignment: 'flex-start',
                  },
                })
                props.editor.hyperlinkToolbar!.updatePosition()
              }}
              variant={props.toolbarProps.alignment === 'flex-start' ? 'default' : 'ghost'}
            >
              <AlignLeft className={stylex.props(styles.sca3de967).className || ''} />
            </Button>
            <Button
              size="icon"
              onClick={() => {
                props.editor.updateBlock(props.id, {
                  props: {
                    alignment: 'center',
                  },
                })
                props.editor.hyperlinkToolbar!.updatePosition()
              }}
              variant={props.toolbarProps.alignment === 'center' ? 'default' : 'ghost'}
            >
              <AlignCenter className={stylex.props(styles.sca3de967).className || ''} />
            </Button>
            <Button
              size="icon"
              onClick={() => {
                props.editor.updateBlock(props.id, {
                  props: {
                    alignment: 'flex-end',
                  },
                })
                props.editor.hyperlinkToolbar!.updatePosition()
              }}
              variant={props.toolbarProps.alignment === 'flex-end' ? 'default' : 'ghost'}
            >
              <AlignRight className={stylex.props(styles.sca3de967).className || ''} />
            </Button>
          </div>
        </div>
      )}

      <SizableText
        size="sm"
        className={stylex.props(styles.s1bfab962).className || ''}
        data-testid="link-resource-type"
      >
        {!!props.isHmLink ? `Seed Resource` : 'Web Address'}
      </SizableText>

      {props.children}

      <Separator />

      <div className={stylex.props(styles.s2ffff9, styles.s6044a01e).className || ''}>
        <Button
          size="icon"
          onClick={() => {
            if (props.type === 'link') {
              const {state, view} = props.editor._tiptapEditor
              let tr = state.tr
              let range
              const {posBeforeNode} = getNodeById(props.id, state.doc)
              const contentNode = state.doc.nodeAt(posBeforeNode + 1)
              if (contentNode) {
                if (contentNode.type.name === 'embed' || contentNode.type.name === 'button') {
                  range = {
                    from: posBeforeNode + 1,
                    to: posBeforeNode + 1 + contentNode.nodeSize,
                  }
                } else {
                  // @ts-ignore
                  contentNode.descendants((child, childPos) => {
                    const linkMark = child.marks?.find(
                      // @ts-ignore
                      (mark) => mark.type.name === 'link',
                    )
                    if (linkMark) {
                      range = {
                        from: posBeforeNode + 2 + childPos,
                        to: posBeforeNode + 2 + childPos + (child.text?.length || 1),
                      }
                      return false
                    }
                    if (child.type.name === 'inline-embed') {
                      range = {
                        from: posBeforeNode + 2 + childPos,
                        to: posBeforeNode + 2 + childPos + child.nodeSize,
                      }
                      return false
                    }
                  })
                }
              }
              tr = tr.insertText(props.text.length ? props.text : ' ', range!.from, range!.to)
              view.dispatch(tr)
            } else props.editor.removeBlocks([props.id])
            props.resetLink()
          }}
        >
          {props.type === 'link' ? <Unlink size={14} /> : <Trash size={16} />}
        </Button>
      </div>
    </div>
  )
}
const SearchInput = ({
  updateLink,
  link,
  text,
  setLink,
  title,
  type,
}: {
  updateLink: (url: string, text: string, hideMenu: boolean) => void
  link: string
  text: string
  setLink: any
  title: boolean
  type: string
}) => {
  const [focused, setFocused] = useState(false)
  const [inputPosition, setInputPosition] = useState<DOMRect | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const viewportHeight = window.innerHeight
  const portalRoot = window.document.body
  const unpackedId = unpackHmId(link)
  const profileAccountUid = unpackedId?.path?.[0] === ':profile' ? unpackedId.path[1] || unpackedId.uid : null
  const highlightId = profileAccountUid ? hmId(profileAccountUid) : unpackedId
  const currentEntity = useResource(profileAccountUid ? null : unpackedId)
  const account = useAccount(profileAccountUid)
  const document = currentEntity.data?.type === 'document' ? currentEntity.data.document : undefined
  const [searchDraft, setSearchDraft] = useState<{
    forLink: string
    value: string
  } | null>(null)
  const search =
    searchDraft?.forLink === link ? searchDraft.value : document?.metadata.name ?? account.data?.metadata?.name ?? link

  // const recents = useRecents()
  const searchResults = useSearch(search, {
    includeBody: true,
    contextSize: 20 - search.length,
  })
  const searchItems: Array<SearchResult> =
    searchResults.data?.entities
      ?.map((item) => {
        return {
          title: item.title || item.id.uid,
          key: packHmId(item.id),
          searchQuery: item.searchQuery,
          versionTime: item.versionTime || '',
          onFocus: () => {},
          onMouseEnter: () => {},
          onSelect: () => {
            const newText = type === 'link' ? text : title ? item.title : text
            const packedUrl =
              type === 'inline-embed'
                ? packReferenceUrl({
                    ...item.id,
                    latest: !item.id.blockRef,
                  })
                : type === 'link' || type === 'button'
                  ? packReferenceUrl(item.id)
                  : item.id.id
            setLink(packedUrl)
            setSearchDraft(null)
            updateLink(packedUrl, newText, true)
          },
          subtitle: 'Document',
        }
      })
      .filter(Boolean) || []
  const isDisplayingRecents = !search.length
  // const activeItems = isDisplayingRecents ? recentItems : searchItems
  const activeItems = searchItems
  const [focusedIndex, setFocusedIndex] = useState(0)
  const highlight = useHighlighter()
  useEffect(() => {
    if (focusedIndex >= activeItems.length) setFocusedIndex(0)
  }, [focusedIndex, activeItems])

  // Calculate position of input
  useEffect(() => {
    if (inputRef.current) {
      setInputPosition(inputRef.current.getBoundingClientRect())
    }
  }, [focused, search])
  let dropdownContent = (
    <div
      className={cn(
        'search-dropdown-content',
        stylex.props(
          styles.s67010d77,
          styles.s1d8b174c,
          styles.s2ffff9,
          styles.sdd9beccd,
          styles.s67e351ac,
          styles.s5d936fb,
          styles.sa4fc76f8,
        ).className || '',
        stylex.props(styles.s77547602, styles.sa1198998, styles.s34b1ae, styles.s34b56f).className || '',
        stylex.props(styles.s5fd609e3, styles.s8a6c2964).className || '',
        focused ? stylex.props(styles.s2ffff9).className || '' : stylex.props(styles.sb76e9daa).className || '',
        activeItems.length > 0
          ? stylex.props(styles.s486c2d2f).className || ''
          : stylex.props(styles.s765a26ee).className || '',
      )}
      style={{
        width: inputPosition && inputPosition.width ? inputPosition.width + 37 : 300,
        top: inputPosition ? Math.min(inputPosition.bottom, viewportHeight - 200) + 5 : 0,
        left: inputPosition ? inputPosition.left - 30 : 0,
      }}
    >
      {isDisplayingRecents ? (
        <SizableText className={stylex.props(styles.s335492).className || ''}>Recent Resources</SizableText>
      ) : null}
      {activeItems?.map((item, itemIndex) => {
        return (
          <SearchResultItem
            item={item}
            key={item.key}
            selected={focusedIndex === itemIndex}
            // @ts-expect-error
            onFocus={() => {
              setFocusedIndex(itemIndex)
            }}
            onMouseEnter={() => {
              setFocusedIndex(itemIndex)
            }}
          />
        )
      })}
    </div>
  )
  return (
    <>
      <Input
        data-testid="link-search-input"
        ref={inputRef}
        className={stylex.props(styles.sb42feb5d).className || ''}
        onFocus={() => {
          setFocused(true)
        }}
        onBlur={() => {
          setTimeout(() => {
            setFocused(false)
          }, 150)
        }}
        autoFocus={false}
        value={search}
        onChangeText={(val) => {
          setSearchDraft({
            forLink: val,
            value: val,
          })
          setLink(val)
          if (type === 'link' || type === 'button') {
            updateLink(val, text, false)
          }
        }}
        placeholder="Open Seed Document…"
        {...highlight(highlightId)}
        onKeyDown={(e) => {
          if (e.nativeEvent.key === 'Escape') {
            setFocused(false)
            e.preventDefault()
            updateLink(link, text, true)
            return
          }
          if (e.nativeEvent.key === 'Enter') {
            const item = activeItems[focusedIndex]
            if (item) {
              // @ts-expect-error
              item.onSelect()
            } else {
              e.preventDefault()
              updateLink(link, text, true)
            }
          }
          if (e.nativeEvent.key === 'ArrowDown') {
            e.preventDefault()
            setFocusedIndex((prev) => (prev + 1) % activeItems.length)
          }
          if (e.nativeEvent.key === 'ArrowUp') {
            e.preventDefault()
            setFocusedIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length)
          }
        }}
      />

      {focused && inputPosition && createPortal(dropdownContent, portalRoot)}
    </>
  )
}
export function LinkTypeDropdown({
  selected,
  onSelect,
  isHmLink,
}: {
  selected: string
  onSelect: (value: string) => void
  isHmLink: boolean
}) {
  const [focused, setFocused] = useState(false)
  const [inputPosition, setInputPosition] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLButtonElement>(null)
  const portalRoot = document.body
  const selectedTypeObj = LINK_TYPES.find((t) => t.value === selected)
  const filteredTypes = LINK_TYPES.filter((t) => {
    if (t.value === 'link' || t.value === 'button' || t.value === 'embed-link') return true
    return !!isHmLink
  })
  useEffect(() => {
    if (ref.current) {
      setInputPosition(ref.current.getBoundingClientRect())
    }
  }, [focused])
  const dropdown = (
    <div
      className={
        stylex.props(
          styles.s436dc7b6,
          styles.s67010d77,
          styles.s1d8b174c,
          styles.s2ffff9,
          styles.s67e351ac,
          styles.sf79988b7,
          styles.s34b56e,
          styles.s8a6c2964,
        ).className || ''
      }
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      style={{
        top: inputPosition ? inputPosition.bottom + 5 : 0,
        left: inputPosition?.left ?? 0,
        width: inputPosition?.width ?? 200,
      }}
    >
      {filteredTypes.map((item) => (
        <button
          type="button"
          key={item.value}
          className={
            stylex.props(
              styles.s37120a61,
              styles.sc05281e3,
              styles.s2ffff9,
              styles.scdbaf625,
              styles.sc7847ec6,
              styles.s5d936fb,
              styles.s7c401ecf,
              styles.s60f53bca,
              styles.s34b1ae,
              styles.s34b56e,
              styles.sbf63b0a7,
            ).className || ''
          }
          onMouseDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onSelect(item.value)
            setFocused(false)
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <item.icon size={16} color={item.value === selected ? '$brand4' : '$color12'} />
          <SizableText size="md" color={item.value === selected ? 'brand' : 'default'}>
            {item.label}
          </SizableText>
        </button>
      ))}
    </div>
  )
  return (
    <>
      <button
        type="button"
        ref={ref}
        aria-haspopup="listbox"
        aria-expanded={focused}
        onMouseDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setFocused(!focused)
        }}
        className={
          stylex.props(
            styles.s1a01a0ed,
            styles.s436dc7b6,
            styles.sf2243a08,
            styles.s2ffff9,
            styles.s18c13,
            styles.sc6ed1702,
            styles.s5d936fb,
            styles.sf79988b7,
            styles.s7c401ecf,
            styles.s34b1ad,
          ).className || ''
        }
      >
        {selectedTypeObj?.icon && <selectedTypeObj.icon size={16} />}
        <SizableText className={stylex.props(styles.sc007588a).className || ''}>{selectedTypeObj?.label}</SizableText>
        <ChevronDown size={16} />
      </button>
      {focused && inputPosition && createPortal(dropdown, portalRoot)}
    </>
  )
}
