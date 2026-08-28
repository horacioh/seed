import * as stylex from '@stylexjs/stylex'
import {SearchInput} from '@/components/search-input'
import {Block, BlockNoteEditor} from '@shm/editor/blocknote'
import {MultipleNodeSelection} from '@shm/editor/blocknote/core/extensions/SideMenu/MultipleNodeSelection'
import {createReactBlockSpec, useEditorSelectionChange} from '@shm/editor/blocknote/react'
import {getNodesInSelection} from '@shm/editor/utils'
import {entityQueryPathToHmIdPath} from '@shm/shared'
import {queryQueryBlock} from '@shm/shared/models/queries'
import {useUniversalClient} from '@shm/shared/routing'
import {EditorQueryBlock} from '@seed-hypermedia/client/editor-types'
import {HMBlockQuery, HMQueryTableConfig, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useResource} from '@shm/shared/models/entity'
import {NavRoute} from '@shm/shared/routes'
import {hmId} from '@shm/shared/utils/entity-id-url'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {SelectField, SwitchField} from '@shm/ui/form-fields'
import {Pencil, Search, Trash} from '@shm/ui/icons'
import {useQueryBlockFrontendPerf} from '@shm/ui/query-block-frontend-perf'
import {LazyViewportMount} from '@shm/ui/lazy-viewport-mount'
import {QueryBlockContent} from '@shm/ui/query-block-content'
import {SizableText} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
import {usePopoverState} from '@shm/ui/use-popover-state'
import {useQuery} from '@tanstack/react-query'
import {Fragment} from '@tiptap/pm/model'
import {NodeSelection, TextSelection} from 'prosemirror-state'
import {FocusEvent, Profiler, useCallback, useEffect, useMemo, useState} from 'react'
import {HMBlockSchema} from './schema'
const styles_5 = stylex.create({
  s67010d77: {
    position: 'absolute',
  },
  sbe0abfea: {
    left: 'calc(0.25rem * 0)',
  },
  s382471: {
    zIndex: '20',
  },
  s2ffff9: {
    display: 'flex',
  },
  sb42244d4: {
    height: '100%',
  },
  scdbaf625: {
    width: '100%',
  },
  s93b5f015: {
    alignItems: 'flex-start',
  },
  s6044a01e: {
    justifyContent: 'flex-end',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s3824af: {
    zIndex: '40',
  },
  s486c2d2f: {
    opacity: '100%',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_4 = stylex.create({
  s2ad763f: {
    marginInline: 'calc(0.25rem * -4)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s11f8a88a: {
    borderColor: 'var(--muted)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s67010d77: {
    position: 'absolute',
  },
  sa832a59: {
    left: 'calc(0.25rem * -2)',
  },
  s5360d9ad: {
    top: 'calc(0.25rem * -2)',
  },
  s3824af: {
    zIndex: '40',
  },
  sa49bd51f: {
    height: '260px',
  },
  s5eeac68b: {
    minHeight: '80%',
  },
  s2d275e4a: {
    width: 'calc(100% + 16px)',
  },
  s92bcf7b9: {
    maxWidth: '800px',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
})
const styles_3 = stylex.create({
  s3f5459e4: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--background)',
      },
    },
    backgroundColor: 'var(--surface-contrast)',
  },
  s2130529a: {
    backgroundColor: 'var(--background)',
    zIndex: '30',
    display: 'flex',
    width: '100%',
    maxWidth: '350px',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'var(--radius)',
    padding: 'calc(var(--spacing) * 4)',
    boxShadow: 'var(--shadow-lg)',
  },
  sb6c02e55: {
    borderColor: 'var(--border)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--input)',
      },
    },
    height: 'calc(var(--spacing) * 9)',
    gap: 'calc(var(--spacing) * 2)',
    overflow: 'hidden',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
})
const styles_2 = stylex.create({
  sdfc9511e: {
    maxWidth: '100%',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  },
})
const styles = stylex.create({
  s533430e6: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 4)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s1addb860: {
    borderColor: 'var(--border)',
    marginTop: 'calc(0.25rem * -1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  s9141e77: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  sb344561e: {
    position: 'fixed',
    inset: 'calc(0.25rem * 0)',
    zIndex: '10',
  },
  sce47739f: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  sf8eef924: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
  },
  sb344567b: {
    position: 'fixed',
    inset: 'calc(0.25rem * 0)',
    zIndex: '40',
  },
})
const defaultQueryIncludes = '[{"space":"","path":"","mode":"Children"}]'
const defaultQuerySort = '[{"term":"UpdateTime","reverse":false}]'
export const QueryBlock = createReactBlockSpec({
  type: 'query',
  propSchema: {
    style: {
      values: ['Card', 'List', 'Table'],
      // TODO: convert HMEmbedView type to array items
      default: 'Card',
    },
    columnCount: {
      default: '3',
      values: ['1', '2', '3'],
    },
    queryLimit: {
      default: '',
    },
    queryIncludes: {
      default: defaultQueryIncludes,
    },
    querySort: {
      default: defaultQuerySort,
    },
    banner: {
      default: 'false',
      values: ['true', 'false'],
    },
    defaultOpen: {
      default: 'false',
      values: ['true', 'false'],
    },
    tableConfig: {
      default: '',
    },
  },
  containsInlineContent: false,
  selectable: true,
  render: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) =>
    Render(block, editor),
  parseHTML: [
    {
      tag: 'div[data-content-type=query]',
      priority: 1000,
      getContent: (_node, _schema) => {
        return Fragment.empty
      },
    },
  ],
})
function Render(block: Block<HMBlockSchema>, editor: BlockNoteEditor<HMBlockSchema>) {
  const client = useUniversalClient()
  const [selected, setSelected] = useState(false)
  const tiptapEditor = editor._tiptapEditor
  const queryIncludes: HMQueryBlockIncludes = useMemo(() => {
    return JSON.parse(block.props.queryIncludes || defaultQueryIncludes)
  }, [block.props.queryIncludes])
  const querySort = useMemo(() => {
    return JSON.parse(block.props.querySort || defaultQuerySort)
  }, [block.props.querySort])
  const banner = useMemo(() => {
    return Boolean(block.props.banner == 'true')
  }, [block.props.banner])
  const queryLimit = useMemo(() => {
    const parsed = parseInt(block.props.queryLimit || '', 10)
    return parsed > 0 ? parsed : undefined
  }, [block.props.queryLimit])
  const queryBlockInput = useMemo(() => {
    if (!queryIncludes?.[0]?.space) return null
    return {
      query: {
        includes: queryIncludes,
        sort: querySort,
        limit: queryLimit,
      },
    }
  }, [queryIncludes, querySort, queryLimit])
  const queryBlock = useQuery(queryQueryBlock(client, queryBlockInput))
  const sortedItems = queryBlock.data?.results ?? []
  useEditorSelectionChange(editor, updateSelection)
  const assign = useCallback(
    (props: Partial<EditorQueryBlock['props']>) => {
      editor.updateBlock(block.id, {
        props,
      } as any)
    },
    [editor, block.id],
  )
  function updateSelection() {
    const {view} = tiptapEditor
    const {selection} = view.state
    let isSelected = false
    if (selection instanceof NodeSelection) {
      // If the selection is a NodeSelection, check if this block is the selected node
      const selectedNode = view.state.doc.resolve(selection.from).parent
      if (selectedNode && selectedNode.attrs && selectedNode.attrs.id === block.id) {
        isSelected = true
      }
    } else if (selection instanceof TextSelection || selection instanceof MultipleNodeSelection) {
      // If it's a TextSelection or MultipleNodeSelection (TODO Fix for drag), check if this block's node is within the selection range
      const selectedNodes = getNodesInSelection(view)
      isSelected = selectedNodes.some((node) => node.attrs && node.attrs.id === block.id)
    }
    setSelected(isSelected)
  }
  const interactionSummaries = queryBlock.data?.interactionSummaries ?? {}
  const itemContributors = useMemo(() => {
    const contributors: Record<string, string[]> = {}
    sortedItems.forEach((item) => {
      const uids = new Set(item.authors)
      interactionSummaries[item.id.id]?.authorUids.forEach((uid) => uids.add(uid))
      contributors[item.id.id] = Array.from(uids)
    })
    return contributors
  }, [sortedItems, interactionSummaries])
  const accountsMetadata = queryBlock.data?.accountsMetadata ?? {}
  const tableConfig = useMemo<HMQueryTableConfig | undefined>(() => {
    if (!block.props.tableConfig) return undefined
    return JSON.parse(block.props.tableConfig)
  }, [block.props.tableConfig])
  const [isFocusedWithin, setIsFocusedWithin] = useState(false)
  const isActive = selected || isFocusedWithin
  const {onRender} = useQueryBlockFrontendPerf({
    source: 'desktop',
    blockId: block.id,
    queryInput: queryBlockInput,
    style: block.props.style as 'Card' | 'List' | 'Table',
    banner,
    active: isActive,
    status: queryBlock.status,
    fetchStatus: queryBlock.fetchStatus,
    data: queryBlock.data,
    error: queryBlock.error,
  })
  const handleBlurCapture = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsFocusedWithin(false)
    }
  }
  return (
    <div
      // @ts-ignore
      contentEditable={false}
      className={
        stylex.props(styles_4.s2ad763f, styles_4.s2ffff9, styles_4.sa145969, styles_4.s67e351ac, styles_4.s34b1af)
          .className || ''
      }
      onFocusCapture={() => setIsFocusedWithin(true)}
      onBlurCapture={handleBlurCapture}
    >
      <QuerySettings
        queryDocName={queryBlock.data?.queryTargetName || ''}
        queryIncludes={queryIncludes}
        querySort={querySort}
        style={block.props.style as 'Card' | 'List' | 'Table'}
        banner={banner}
        // @ts-expect-error
        block={block}
        editor={editor}
        onValuesChange={({id: _id, props}) => {
          assign(props)
        }}
      />
      <LazyViewportMount active={isActive}>
        <Profiler id={`query-block-${block.id}`} onRender={onRender}>
          <QueryBlockContent
            items={sortedItems}
            style={block.props.style as 'Card' | 'List' | 'Table'}
            columnCount={block.props.columnCount}
            banner={banner}
            accountsMetadata={accountsMetadata}
            itemContributors={itemContributors}
            interactionSummaries={interactionSummaries}
            isDiscovering={queryBlock.isLoading}
            tableConfig={tableConfig}
            onTableConfigChange={(config) =>
              assign({
                tableConfig: JSON.stringify(config),
              })
            }
            onTableSortingChange={(sorting) => {
              const first = sorting[0]
              const terms: Record<string, HMQueryBlockSort[number]['term']> = {
                title: 'Title',
                path: 'Path',
                created: 'CreateTime',
                updated: 'UpdateTime',
              }
              const term = first ? terms[first.id] : undefined
              if (term)
                assign({
                  querySort: JSON.stringify([
                    {
                      term,
                      reverse: first?.desc ?? false,
                    },
                  ]),
                })
            }}
          />
        </Profiler>
      </LazyViewportMount>
    </div>
  )
}
function EmptyQueryBlock({queryIncludes}: {queryIncludes: string | undefined}) {
  const queryIncludesData = queryIncludes ? JSON.parse(queryIncludes) : null
  const queryIncludesFirst = queryIncludesData?.[0]
  const includesEntity = useResource(
    queryIncludesFirst
      ? hmId(queryIncludesFirst.space, {
          path: entityQueryPathToHmIdPath(queryIncludesFirst.path),
        })
      : null,
  )
  if (!queryIncludesFirst || !queryIncludesFirst.space) {
    return <BlankQueryBlockMessage message="Empty Query. Select a Document to Query the Directory." />
  }
  return (
    <BlankQueryBlockMessage
      // @ts-expect-error
      message={`No Documents found in "${includesEntity.data?.document?.metadata.name}". Add a Document there, or query for other Parent Documents.`}
    />
  )
}
function BlankQueryBlockMessage({message}: {message: string}) {
  return (
    <div className={stylex.props(styles.s533430e6).className || ''}>
      <SizableText className={stylex.props(styles.sf2718385).className || ''}>{message}</SizableText>
    </div>
  )
}
type HMQueryBlockIncludes = HMBlockQuery['attributes']['query']['includes']
type HMQueryBlockSort = NonNullable<HMBlockQuery['attributes']['query']['sort']>
function QuerySettings({
  queryDocName = '',
  block,
  onValuesChange,
  queryIncludes,
  querySort,
  editor,
  banner,
}: {
  queryDocName: string
  block: EditorQueryBlock
  queryIncludes: HMQueryBlockIncludes
  querySort: HMQueryBlockSort
  banner: boolean
  onValuesChange: ({id, props}: {id: UnpackedHypermediaId | null; props: EditorQueryBlock['props']}) => void
  editor: BlockNoteEditor<HMBlockSchema>
}) {
  // @ts-expect-error
  const popoverState = usePopoverState(block.props.defaultOpen === 'true')
  const [limit, setLimit] = useState(!!block.props.queryLimit)
  return (
    <>
      <div
        className={
          (stylex.props(
            styles_5.s67010d77,
            styles_5.sbe0abfea,
            styles_5.s382471,
            styles_5.s2ffff9,
            styles_5.sb42244d4,
            styles_5.scdbaf625,
            styles_5.s93b5f015,
            styles_5.s6044a01e,
            styles_5.s5d936fb,
            styles_5.s1aa15,
          ).className || '') +
          ' ' +
          (popoverState.open
            ? stylex.props(styles_5.s3824af, styles_5.s486c2d2f).className || ''
            : stylex.props(styles_5.s382471, styles_5.s765a26ee).className || '')
        }
        onClick={
          popoverState.open
            ? (e) => {
                e.stopPropagation()
                popoverState.onOpenChange(false)
              }
            : undefined
        }
        style={{
          top: queryIncludes.length > 0 ? 12 : 0,
        }}
      >
        <Tooltip content="Edit Query">
          <Button
            size="icon"
            variant="ghost"
            className={stylex.props(styles_3.s3f5459e4).className || ''}
            onClick={() => popoverState.onOpenChange(!popoverState.open)}
          >
            <Pencil className={stylex.props(styles.sca3de968).className || ''} />
          </Button>
        </Tooltip>

        {popoverState.open ? (
          <>
            <div
              className={stylex.props(styles_3.s2130529a).className || ''}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <QuerySearch
                selectedDocName={queryDocName}
                onSelect={({id, route}) => {
                  if (id) {
                    const newVal: HMQueryBlockIncludes = [
                      {
                        ...queryIncludes[0],
                        space: id.uid,
                        path: id.path && id.path.length ? id.path.join('/') : '',
                        mode: queryIncludes[0]?.mode ? queryIncludes[0]?.mode : 'AllDescendants',
                      },
                    ]
                    onValuesChange({
                      id,
                      props: {
                        ...block.props,
                        queryIncludes: JSON.stringify(newVal),
                      },
                    })
                  }
                }}
              />

              <SelectField
                value={queryIncludes[0]?.mode ?? 'Children'}
                onValue={(value) => {
                  let newVal = [
                    {
                      ...queryIncludes[0],
                      mode: value,
                    },
                  ]
                  onValuesChange({
                    id: null,
                    props: {
                      ...block.props,
                      queryIncludes: JSON.stringify(newVal),
                    },
                  })
                }}
                id="showChildren"
                options={[
                  {
                    label: 'Show only Direct Children',
                    value: 'Children',
                  },
                  {
                    label: 'Show all Descendants',
                    value: 'AllDescendants',
                  },
                ]}
              />

              <SelectField
                value={block.props.style}
                onValue={(value) => {
                  onValuesChange({
                    id: null,
                    props: {
                      ...block.props,
                      style: value as 'Card' | 'List' | 'Table',
                    },
                  })
                }}
                label="View"
                id="view"
                options={[
                  {
                    label: 'Card',
                    value: 'Card',
                  },
                  {
                    label: 'List',
                    value: 'List',
                  },
                  {
                    label: 'Table',
                    value: 'Table',
                  },
                ]}
              />
              <SelectField
                // @ts-ignore
                value={querySort[0].term}
                onValue={(value) => {
                  let newVal = [
                    {
                      ...querySort[0],
                      term: value,
                    },
                  ]
                  onValuesChange({
                    id: null,
                    props: {
                      ...block.props,
                      querySort: JSON.stringify(newVal),
                    },
                  })
                }}
                label="Sort by"
                id="sort"
                options={[
                  {
                    label: 'Update time',
                    value: 'UpdateTime',
                  },
                  {
                    label: 'Create time',
                    value: 'CreateTime',
                  },
                  {
                    label: 'Display time',
                    value: 'DisplayTime',
                  },
                  // {
                  //   label: 'By Path',
                  //   value: 'Path',
                  // },
                  {
                    label: 'Latest activity',
                    value: 'ActivityTime',
                  },
                  {
                    label: 'By Title',
                    value: 'Title',
                  },
                ]}
              />
              {block.props.style == 'Card' ? (
                <>
                  <SelectField
                    value={block.props.columnCount || '3'}
                    onValue={(value) => {
                      onValuesChange({
                        id: null,
                        props: {
                          ...block.props,
                          columnCount: value as '1' | '2' | '3',
                        },
                      })
                    }}
                    label="Columns"
                    id="columns"
                    options={[
                      {
                        label: '1',
                        value: '1',
                      },
                      {
                        label: '2',
                        value: '2',
                      },
                      {
                        label: '3',
                        value: '3',
                      },
                    ]}
                  />
                  <SwitchField
                    label="Show Banner"
                    id="banner"
                    defaultChecked={banner}
                    // @ts-expect-error
                    opacity={banner ? 1 : 0.4}
                    onCheckedChange={(value) => {
                      onValuesChange({
                        id: null,
                        props: {
                          ...block.props,
                          banner: value ? 'true' : 'false',
                        },
                      })
                    }}
                  />
                </>
              ) : null}

              <SwitchField
                label="Reverse"
                // @ts-ignore
                defaultChecked={querySort[0].reverse}
                id="sort-reverse"
                onCheckedChange={(value) => {
                  let newVal = [
                    {
                      ...querySort[0],
                      reverse: value,
                    },
                  ]
                  onValuesChange({
                    id: null,
                    props: {
                      ...block.props,
                      querySort: JSON.stringify(newVal),
                    },
                  })
                }}
              />
              <SwitchField
                label="Limit Result Count"
                id="limit"
                defaultChecked={limit}
                onCheckedChange={(value) => {
                  setLimit(value)
                  onValuesChange({
                    id: null,
                    props: {
                      ...block.props,
                      queryLimit: value ? block.props.queryLimit || '10' : '',
                    },
                  })
                }}
              />
              {limit ? (
                <Input
                  type="number"
                  value={block.props.queryLimit}
                  onChangeText={(value) => {
                    onValuesChange({
                      id: null,
                      props: {
                        ...block.props,
                        queryLimit: value,
                      },
                    })
                  }}
                  placeholder="Item Count"
                />
              ) : null}
              <div className={stylex.props(styles.s1addb860).className || ''}>
                <div className={stylex.props(styles.s9141e77).className || ''}>
                  <Button
                    size="icon"
                    onClick={() => {
                      editor.removeBlocks([block.id])
                    }}
                  >
                    <Trash className={stylex.props(styles.sca3de968).className || ''} />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
      {popoverState.open ? (
        <div
          className={stylex.props(styles.sb344561e).className || ''}
          onClick={() => popoverState.onOpenChange(false)}
        />
      ) : null}
    </>
  )
}
export function QuerySearch({
  selectedDocName = '',
  onSelect,
  allowWebURL,
}: {
  selectedDocName?: string | null | undefined
  onSelect: ({id, route, webUrl}: {id?: UnpackedHypermediaId; route?: NavRoute; webUrl?: string}) => void
  allowWebURL?: boolean
}) {
  const [showSearch, setShowSearch] = useState(false)
  return (
    <div className={stylex.props(styles.sce47739f).className || ''}>
      <Button onClick={() => setShowSearch(true)} className={stylex.props(styles_3.sb6c02e55).className || ''}>
        <Search className={stylex.props(styles.sf8eef924).className || ''} />
        <SizableText
          family="default"
          className={stylex.props(styles_2.sdfc9511e).className || ''}
          style={{
            color: selectedDocName ? 'text-foreground' : 'muted-foreground',
          }}
        >
          {selectedDocName || 'Search Hypermedia Document'}
        </SizableText>
      </Button>
      {showSearch ? (
        <>
          <div className={stylex.props(styles.sb344567b).className || ''} onClick={() => setShowSearch(false)} />
          <div
            className={
              stylex.props(
                styles_4.s11f8a88a,
                styles_4.s436dc7b6,
                styles_4.s67010d77,
                styles_4.sa832a59,
                styles_4.s5360d9ad,
                styles_4.s3824af,
                styles_4.sa49bd51f,
                styles_4.s5eeac68b,
                styles_4.s2d275e4a,
                styles_4.s92bcf7b9,
                styles_4.sf79988b7,
                styles_4.sad8c742c,
                styles_4.s1aa15,
                styles_4.s8a6c2948,
              ).className || ''
            }
          >
            <SearchInput
              onClose={() => setShowSearch(false)}
              allowWebURL={allowWebURL}
              onSelect={(data) => {
                if (data.id) {
                  setShowSearch(false)
                }
                onSelect(data)
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
