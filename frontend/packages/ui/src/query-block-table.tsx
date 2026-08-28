import * as stylex from '@stylexjs/stylex'
import type {
  HMAccountsMetadata,
  HMDocumentInfo,
  HMQueryBlockItemSummary,
  HMQueryTableConfig,
} from '@seed-hypermedia/client/hm-types'
import {formattedDate, getMetadataName, useRouteLink} from '@shm/shared'
import {useInteractionSummary} from '@shm/shared/models/interaction-summary'
import {
  type ColumnDef,
  type ColumnOrderState,
  type ColumnSizingState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {ChevronDown, ChevronUp, ChevronsUpDown, Columns3, Filter, Plus, Search, X} from 'lucide-react'
import {useEffect, useMemo, useRef, useState} from 'react'
import {Button} from './button'
import {Input} from './components/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './components/table'
import {FacePile} from './face-pile'
import {Spinner} from './spinner'
import {
  buildQueryTableColumns,
  filterQueryTableItems,
  getQueryTableValue,
  moveQueryTableColumn,
  type QueryTableFilter,
  queryTableItemMatchesSearch,
} from './query-block-table-model'
import {cn} from './utils'
const styles_4 = stylex.create({
  s88b2469a: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 'var(--font-weight-medium)',
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
  s6f7c6ca7: {
    color: 'var(--muted-foreground)',
    pointerEvents: 'none',
    position: 'absolute',
    top: '50%',
    left: 'calc(var(--spacing) * 3)',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
  },
  s3c25506a: {
    borderColor: 'var(--border)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'flex',
    height: 'calc(var(--spacing) * 9)',
    cursor: 'pointer',
    listStyleType: 'none',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 3)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s99f984b2: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
  },
})
const styles_3 = stylex.create({
  s839477da: {
    backgroundColor: 'var(--background)',
    position: 'sticky',
    left: 'calc(0.25rem * 0)',
    zIndex: '20',
  },
  s839477bb: {
    backgroundColor: 'var(--background)',
    position: 'sticky',
    left: 'calc(0.25rem * 0)',
    zIndex: '10',
  },
})
const styles_2 = stylex.create({
  sd69f8dd3: {
    marginBlock: 'calc(0.25rem * 4)',
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    fontFamily: 'var(--font-sans)',
  },
  s19b1654: {
    position: 'relative',
    minWidth: 'calc(0.25rem * 48)',
    flex: '1',
  },
  s7c5ebd39: {
    borderColor: 'var(--border)',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    borderRadius: '0.25rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s42a8dddc: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    cursor: 'pointer',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s886946be: {
    borderColor: 'var(--border)',
    maxWidth: '100%',
    touchAction: 'pan-x  ',
    overflowX: 'auto',
    overscrollBehaviorX: 'contain',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
})
const styles = stylex.create({
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sf8e652db: {
    whiteSpace: 'nowrap',
  },
  s12583799: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s87c83994: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    marginBlock: 'calc(0.25rem * 4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 4)',
    fontFamily: 'var(--font-sans)',
  },
  sb9bd3a30: {
    fontStyle: 'italic',
  },
  s1fa2d8e6: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s3484a8: {
    paddingLeft: 'calc(0.25rem * 9)',
  },
  sdef3facc: {
    position: 'relative',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s86bb3ab7: {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    position: 'absolute',
    right: 'calc(0.25rem * 0)',
    zIndex: '30',
    marginTop: 'calc(0.25rem * 1)',
    display: 'flex',
    width: 'calc(0.25rem * 80)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 3)',
    boxShadow: 'var(--shadow-lg)',
  },
  se658ac13: {
    display: 'flex',
    gap: 'calc(0.25rem * 1)',
  },
  sc93df855: {
    borderColor: 'var(--border)',
    borderRadius: '0.25rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s67c3557b: {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    position: 'absolute',
    right: 'calc(0.25rem * 0)',
    zIndex: '30',
    marginTop: 'calc(0.25rem * 1)',
    width: 'calc(0.25rem * 56)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 2)',
    boxShadow: 'var(--shadow-lg)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s9af0cfd6: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    height: 'calc(0.25rem * 28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sce14a4b5: {
    tableLayout: 'fixed',
  },
  s86ff3e3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s5fd2960c: {
    position: 'absolute',
    top: 'calc(0.25rem * 0)',
    right: 'calc(0.25rem * 0)',
    height: '100%',
    width: 'calc(0.25rem * 2)',
    cursor: 'col-resize',
    touchAction: 'none',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  s18c11: {
    height: 'calc(0.25rem * 6)',
  },
})
const INITIAL_ROWS = 25
const ROW_CHUNK = 25

/** Props for the shared read-only Query block Table view. */
export interface QueryBlockTableProps {
  items: HMDocumentInfo[]
  accountsMetadata: HMAccountsMetadata
  interactionSummaries?: Record<string, HMQueryBlockItemSummary>
  isDiscovering?: boolean
  tableConfig?: HMQueryTableConfig
  onTableConfigChange?: (config: HMQueryTableConfig) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
}
function CitationCell({item}: {item: HMDocumentInfo}) {
  const summary = useInteractionSummary(item.id)
  return (
    <span className={stylex.props(styles.sf2718385).className || ''}>
      {summary.isLoading ? '…' : summary.data?.citations ?? 0}
    </span>
  )
}
function TitleCell({item}: {item: HMDocumentInfo}) {
  const linkProps = useRouteLink({
    key: 'document',
    id: item.id,
  })
  return (
    <a {...linkProps} className={stylex.props(styles_4.s88b2469a).className || ''}>
      {getMetadataName(item.metadata) || item.path.at(-1) || 'Untitled'}
    </a>
  )
}
function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Renders loaded Query results as an interactive TanStack Table. */
export function QueryBlockTable({
  items,
  accountsMetadata,
  interactionSummaries = {},
  isDiscovering,
  tableConfig,
  onTableConfigChange,
  sorting: controlledSorting,
  onSortingChange,
}: QueryBlockTableProps) {
  const descriptors = useMemo(() => buildQueryTableColumns(items), [items])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<QueryTableFilter[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [visibleCount, setVisibleCount] = useState(() => Math.min(items.length, INITIAL_ROWS))
  const sentinelRef = useRef<HTMLDivElement>(null)
  const configuredColumns = tableConfig?.columns ?? []
  const initialOrder = [
    ...configuredColumns.map((column) => column.id),
    ...descriptors.map((column) => column.id).filter((id) => !configuredColumns.some((column) => column.id === id)),
  ]
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialOrder)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    Object.fromEntries(
      descriptors.map((descriptor) => [
        descriptor.id,
        configuredColumns.find((column) => column.id === descriptor.id)?.visible ?? descriptor.defaultVisible,
      ]),
    ),
  )
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() =>
    Object.fromEntries(configuredColumns.flatMap((column) => (column.width ? [[column.id, column.width]] : []))),
  )
  useEffect(() => {
    setColumnOrder((current) => [
      ...current.filter((id) => descriptors.some((descriptor) => descriptor.id === id)),
      ...descriptors.map((descriptor) => descriptor.id).filter((id) => !current.includes(id)),
    ])
    setColumnVisibility((current) => ({
      ...Object.fromEntries(descriptors.map((descriptor) => [descriptor.id, descriptor.defaultVisible])),
      ...current,
    }))
  }, [descriptors])
  const filteredItems = useMemo(
    () =>
      filterQueryTableItems(
        items.filter((item) => queryTableItemMatchesSearch(item, search)),
        filters,
      ),
    [filters, items, search],
  )
  useEffect(() => setVisibleCount(Math.min(filteredItems.length, INITIAL_ROWS)), [filteredItems])
  useEffect(() => {
    if (visibleCount >= filteredItems.length || typeof IntersectionObserver === 'undefined') return
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisibleCount((count) => Math.min(filteredItems.length, count + ROW_CHUNK))
      },
      {
        rootMargin: '800px 0px',
      },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filteredItems.length, visibleCount])
  const columns = useMemo<ColumnDef<HMDocumentInfo>[]>(
    () =>
      descriptors.map((descriptor) => ({
        id: descriptor.id,
        accessorFn: (item) => {
          if (descriptor.id === 'comments') {
            return interactionSummaries[item.id.id]?.comments ?? item.activitySummary?.commentCount ?? 0
          }
          if (descriptor.id === 'children') return interactionSummaries[item.id.id]?.children ?? 0
          return getQueryTableValue(item, descriptor.id)
        },
        header: descriptor.label,
        enableSorting: !['authors', 'citations'].includes(descriptor.id),
        minSize: descriptor.id === 'title' ? 180 : 100,
        size: descriptor.id === 'title' ? 240 : 140,
        cell: ({row}) => {
          const item = row.original
          if (descriptor.id === 'title') return <TitleCell item={item} />
          if (descriptor.id === 'authors')
            return <FacePile accounts={item.authors} accountsMetadata={accountsMetadata} />
          if (descriptor.id === 'citations') return <CitationCell item={item} />
          if (descriptor.id === 'comments') {
            return <span>{interactionSummaries[item.id.id]?.comments ?? item.activitySummary?.commentCount ?? 0}</span>
          }
          if (descriptor.id === 'children') return <span>{interactionSummaries[item.id.id]?.children ?? 0}</span>
          if (descriptor.id === 'updated')
            return (
              <span className={stylex.props(styles.sf8e652db).className || ''}>{formattedDate(item.updateTime)}</span>
            )
          if (descriptor.id === 'created')
            return (
              <span className={stylex.props(styles.sf8e652db).className || ''}>{formattedDate(item.createTime)}</span>
            )
          return (
            <span className={stylex.props(styles.s12583799).className || ''}>
              {displayValue(getQueryTableValue(item, descriptor.id))}
            </span>
          )
        },
      })),
    [accountsMetadata, descriptors, interactionSummaries],
  )
  const activeSorting = controlledSorting ?? sorting
  const table = useReactTable({
    data: filteredItems,
    columns,
    state: {
      sorting: activeSorting,
      columnOrder,
      columnVisibility,
      columnSizing,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(activeSorting) : updater
      setSorting(next)
      onSortingChange?.(next)
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  function persistColumns(nextVisibility = columnVisibility) {
    onTableConfigChange?.({
      columns: columnOrder.map((id) => ({
        id,
        visible: nextVisibility[id] !== false,
        width: columnSizing[id],
      })),
    })
  }
  if (items.length === 0 && isDiscovering) {
    return (
      <div className={stylex.props(styles.s87c83994).className || ''}>
        <Spinner size="small" />
        <span className={stylex.props(styles.sb9bd3a30).className || ''}>Searching for documents…</span>
      </div>
    )
  }
  return (
    <div className={stylex.props(styles_2.sd69f8dd3).className || ''}>
      <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
        <div className={stylex.props(styles_2.s19b1654).className || ''}>
          <Search className={stylex.props(styles_4.s6f7c6ca7).className || ''} />
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search table…"
            aria-label="Search table"
            className={stylex.props(styles.s3484a8).className || ''}
          />
        </div>
        <details className={stylex.props(styles.sdef3facc).className || ''}>
          <summary className={stylex.props(styles_4.s3c25506a).className || ''}>
            <Filter className={stylex.props(styles.sca3de968).className || ''} /> Filter{' '}
            <ChevronDown className={stylex.props(styles.sca3de967).className || ''} />
          </summary>
          <div className={stylex.props(styles.s86bb3ab7).className || ''}>
            {filters.map((filter, index) => (
              <div key={index} className={stylex.props(styles.se658ac13).className || ''}>
                <select
                  aria-label="Filter attribute"
                  className={stylex.props(styles_2.s7c5ebd39).className || ''}
                  value={filter.columnId}
                  onChange={(event) =>
                    setFilters((current) =>
                      current.map((value, i) =>
                        i === index
                          ? {
                              ...value,
                              columnId: event.target.value,
                            }
                          : value,
                      ),
                    )
                  }
                >
                  {descriptors.map((descriptor) => (
                    <option key={descriptor.id} value={descriptor.id}>
                      {descriptor.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter operator"
                  className={stylex.props(styles.sc93df855).className || ''}
                  value={filter.operator}
                  onChange={(event) =>
                    setFilters((current) =>
                      current.map((value, i) =>
                        i === index
                          ? {
                              ...value,
                              operator: event.target.value as QueryTableFilter['operator'],
                            }
                          : value,
                      ),
                    )
                  }
                >
                  <option value="contains">contains</option>
                  <option value="equals">equals</option>
                  <option value="greaterThan">is greater than</option>
                  <option value="lessThan">is less than</option>
                </select>
                <Input
                  value={filter.value}
                  onChangeText={(value) =>
                    setFilters((current) =>
                      current.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              value,
                            }
                          : item,
                      ),
                    )
                  }
                  aria-label="Filter value"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Remove filter"
                  onClick={() => setFilters((current) => current.filter((_, i) => i !== index))}
                >
                  <X className={stylex.props(styles.sca3de968).className || ''} />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              onClick={() =>
                setFilters((current) => [
                  ...current,
                  {
                    columnId: descriptors[0]?.id ?? 'title',
                    operator: 'contains',
                    value: '',
                  },
                ])
              }
            >
              <Plus className={stylex.props(styles.sca3de968).className || ''} /> Add filter
            </Button>
          </div>
        </details>
        <details className={stylex.props(styles.sdef3facc).className || ''}>
          <summary className={stylex.props(styles_4.s3c25506a).className || ''}>
            <Columns3 className={stylex.props(styles.sca3de968).className || ''} /> Columns
          </summary>
          <div className={stylex.props(styles.s67c3557b).className || ''}>
            {table.getAllLeafColumns().map((column) => (
              <div key={column.id} className={stylex.props(styles_4.s99f984b2).className || ''}>
                <label className={stylex.props(styles_2.s42a8dddc).className || ''}>
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={(event) => {
                      const next = {
                        ...columnVisibility,
                        [column.id]: event.target.checked,
                      }
                      setColumnVisibility(next)
                      persistColumns(next)
                    }}
                  />
                  <span className={stylex.props(styles.s6e724d66).className || ''}>
                    {descriptors.find((descriptor) => descriptor.id === column.id)?.label}
                  </span>
                </label>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Move ${column.id} column left`}
                  onClick={() => {
                    const next = moveQueryTableColumn(columnOrder, column.id, -1)
                    setColumnOrder(next)
                    onTableConfigChange?.({
                      columns: next.map((id) => ({
                        id,
                        visible: columnVisibility[id] !== false,
                        width: columnSizing[id],
                      })),
                    })
                  }}
                >
                  <ChevronUp className={stylex.props(styles.sca3de967).className || ''} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Move ${column.id} column right`}
                  onClick={() => {
                    const next = moveQueryTableColumn(columnOrder, column.id, 1)
                    setColumnOrder(next)
                    onTableConfigChange?.({
                      columns: next.map((id) => ({
                        id,
                        visible: columnVisibility[id] !== false,
                        width: columnSizing[id],
                      })),
                    })
                  }}
                >
                  <ChevronDown className={stylex.props(styles.sca3de967).className || ''} />
                </Button>
              </div>
            ))}
          </div>
        </details>
      </div>

      {filteredItems.length === 0 ? (
        <div className={stylex.props(styles.s9af0cfd6).className || ''}>
          {items.length === 0 ? 'No documents found.' : 'No documents match the current search and filters.'}
        </div>
      ) : (
        <div className={stylex.props(styles_2.s886946be).className || ''}>
          <Table
            className={stylex.props(styles.sce14a4b5).className || ''}
            style={{
              width: table.getCenterTotalSize(),
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        stylex.props(styles.sdef3facc).className || '',
                        stylex.props(header.column.id === 'title' && styles_3.s839477da).className || '',
                      )}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          className={stylex.props(styles.s86ff3e3).className || ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ChevronsUpDown className={stylex.props(styles.sca3de967).className || ''} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                      <button
                        type="button"
                        aria-label={`Resize ${header.column.id} column`}
                        className={stylex.props(styles.s5fd2960c).className || ''}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseUp={() => persistColumns()}
                        onTouchEnd={() => persistColumns()}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table
                .getRowModel()
                .rows.slice(0, visibleCount)
                .map((row) => (
                  <TableRow key={row.original.id.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          stylex.props(styles.s92852dd5).className || '',
                          stylex.props(cell.column.id === 'title' && styles_3.s839477bb).className || '',
                        )}
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {visibleCount < filteredItems.length ? (
            <div ref={sentinelRef} className={stylex.props(styles.s18c11).className || ''} aria-hidden="true" />
          ) : null}
        </div>
      )}
    </div>
  )
}
