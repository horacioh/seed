import * as stylex from '@stylexjs/stylex'
import {MainWrapper} from '@/components/main-wrapper'
import {grpcClient} from '@/grpc-client'
import {useAccountList} from '@/models/accounts'
import {useSelectedAccountId} from '@/selected-account'
import {DOCUMENT_ATTRIBUTE_DESCRIPTIONS} from '@seed-hypermedia/client/hm-types'
import {prepareHMDocumentInfo} from '@shm/shared/models/entity'
import {
  AttributeValue,
  DocumentFilter,
  DocumentFilter_Comparison,
  DocumentFilter_Comparison_Operator,
  DocumentFilter_Not,
  DocumentFilter_PathMatch,
  DocumentFilter_Presence,
  DocumentFilter_SpaceMatch,
  DocumentFilter_StringMatch,
  DocumentSort,
  DocumentAttributeKind,
  QueryDocumentsRequest,
  QueryDocumentsResponse,
} from '@shm/shared/client/grpc-types'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@shm/ui/select-dropdown'
import {DocumentListItem} from '@shm/ui/document-list-item'
import {PanelContainer} from '@shm/ui/container'
import {cn} from '@shm/ui/utils'
import {
  AtSign,
  Braces,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Filter,
  Loader2,
  LocateFixed,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import {useEffect, useId, useMemo, useRef, useState, type ReactNode} from 'react'
const styles = stylex.create({
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sc3771bb1: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sf80b4c8a: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s4d016d20: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    animation: 'spin 1s linear infinite',
  },
  s1fa2d8e6: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s7ceacacd: {
    color: 'var(--muted-foreground)',
    marginRight: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
    letterSpacing: '0.025em',
    textTransform: 'uppercase',
  },
  sa56e9200: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sd46c5b0e: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
    letterSpacing: '0.025em',
    textTransform: 'uppercase',
  },
  s10a6312: {
    backgroundColor: 'var(--background)',
    display: 'inline-flex',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 0.5)',
  },
  s60699f3c: {
    borderRadius: '0.25rem',
    paddingInline: 'calc(0.25rem * 2.5)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  s11c1d25d: {
    color: 'var(--destructive)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s8a8b6bdd: {
    borderColor: 'var(--border)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    padding: 'calc(0.25rem * 4)',
  },
  sab2acd6c: {
    marginBottom: 'calc(0.25rem * 3)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
  },
  sfaa15d2: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
    letterSpacing: '0.025em',
    textTransform: 'uppercase',
  },
  s51bcccdb: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontVariantNumeric: '   tabular-nums ',
  },
  sd36a4a47: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s33458c: {
    marginTop: 'calc(0.25rem * 2)',
  },
  se3172170: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-sm)',
  },
  s3b858bae: {
    animation: 'spin 1s linear infinite',
  },
  sce049c4e: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s4bed10d3: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 1.5)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBottom: 'calc(0.25rem * 3)',
    paddingLeft: 'calc(0.25rem * 12)',
  },
  s120e1b03: {
    color: 'var(--foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s65916d2f: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 'calc(0.25rem * 1)',
  },
  s349b2d: {
    paddingRight: 'calc(0.25rem * 8)',
  },
  s12583799: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
  sa2b7e80d: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontStyle: 'italic',
  },
  s36c758: {
    width: 'calc(0.25rem * 24)',
  },
  s5bf2d9b6: {
    color: 'var(--muted-foreground)',
    marginBottom: 'calc(0.25rem * 3)',
  },
  s9d4b128d: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
})
type ConditionMode = 'and' | 'or'
type ConditionKind = 'comparison' | 'contains' | 'prefix' | 'exists' | 'missing'
type ValueKind = 'string' | 'int' | 'bool'
const spaceField = '$space'
const pathField = '$path'
const maxSortRules = 16
type AutocompleteSuggestion = {
  value: string
  label?: string
  meta?: string
  description?: string
}
type Condition = {
  id: number
  key: string
  kind: ConditionKind
  operator: (typeof comparisonOperators)[number][0]
  valueKind: ValueKind
  value: string
}
type SortRule = {
  id: number
  key: string
  descending: boolean
}
type QueryResult = Awaited<ReturnType<typeof grpcClient.documents.queryDocuments>>
const comparisonOperators = [
  ['=', DocumentFilter_Comparison_Operator.EQUAL],
  ['≠', DocumentFilter_Comparison_Operator.NOT_EQUAL],
  ['<', DocumentFilter_Comparison_Operator.LESS_THAN],
  ['≤', DocumentFilter_Comparison_Operator.LESS_THAN_OR_EQUAL],
  ['>', DocumentFilter_Comparison_Operator.GREATER_THAN],
  ['≥', DocumentFilter_Comparison_Operator.GREATER_THAN_OR_EQUAL],
] as const
function emptyCondition(id: number): Condition {
  return {
    id,
    key: '',
    kind: 'comparison',
    operator: '=',
    valueKind: 'string',
    value: '',
  }
}
function emptySortRule(id: number): SortRule {
  return {
    id,
    key: '',
    descending: false,
  }
}
function conditionFilter(condition: Condition): DocumentFilter | null {
  const key = condition.key.trim()
  if (!key) return null
  if (key === spaceField) {
    if (!condition.value.trim()) return null
    const filter = new DocumentFilter({
      filter: {
        case: 'spaceMatch',
        value: new DocumentFilter_SpaceMatch({
          space: condition.value.trim(),
        }),
      },
    })
    return condition.operator === '≠'
      ? new DocumentFilter({
          filter: {
            case: 'not',
            value: new DocumentFilter_Not({
              filter,
            }),
          },
        })
      : filter
  }
  if (key === pathField) {
    if (!condition.value.trim()) return null
    const filter = new DocumentFilter({
      filter: {
        case: 'pathMatch',
        value: new DocumentFilter_PathMatch({
          path: condition.value.trim() === '/' ? '' : condition.value.trim(),
          prefix: condition.kind === 'prefix',
        }),
      },
    })
    return condition.operator === '≠'
      ? new DocumentFilter({
          filter: {
            case: 'not',
            value: new DocumentFilter_Not({
              filter,
            }),
          },
        })
      : filter
  }
  if (condition.kind === 'exists' || condition.kind === 'missing') {
    return new DocumentFilter({
      filter: {
        case: condition.kind,
        value: new DocumentFilter_Presence({
          key,
        }),
      },
    })
  }
  if (!condition.value.trim()) return null
  if (condition.kind === 'contains' || condition.kind === 'prefix') {
    return new DocumentFilter({
      filter: {
        case: 'stringMatch',
        value: new DocumentFilter_StringMatch({
          key,
          value: condition.value,
          prefix: condition.kind === 'prefix',
        }),
      },
    })
  }
  const operator = comparisonOperators.find(([label]) => label === condition.operator)?.[1]
  const value = new AttributeValue({
    value:
      condition.valueKind === 'int'
        ? {
            case: 'intValue',
            value: BigInt(condition.value),
          }
        : condition.valueKind === 'bool'
          ? {
              case: 'boolValue',
              value: condition.value === 'true',
            }
          : {
              case: 'stringValue',
              value: condition.value,
            },
  })
  return new DocumentFilter({
    filter: {
      case: 'comparison',
      value: new DocumentFilter_Comparison({
        key,
        operator: operator ?? DocumentFilter_Comparison_Operator.EQUAL,
        value,
      }),
    },
  })
}
function isComplete(condition: Condition) {
  if (!condition.key.trim()) return false
  if (condition.key.trim() === spaceField) return !!condition.value.trim()
  if (condition.key.trim() === pathField) {
    const path = condition.value.trim()
    return path === '/' || (path.startsWith('/') && !path.endsWith('/'))
  }
  if (condition.kind === 'exists' || condition.kind === 'missing') return true
  if (condition.kind === 'comparison' && condition.valueKind === 'int') return /^-?\d+$/.test(condition.value.trim())
  return !!condition.value.trim()
}
export default function QueryDocumentsPage() {
  const selectedSpaceId = useSelectedAccountId()
  const spaceList = useAccountList({
    queryOptions: {
      pageSize: 1000,
    },
  })
  const [mode, setMode] = useState<ConditionMode>('and')
  const [conditions, setConditions] = useState<Condition[]>([emptyCondition(1)])
  const [sortRules, setSortRules] = useState<SortRule[]>([emptySortRule(1)])
  const [attributeNames, setAttributeNames] = useState<string[]>([])
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const spaceSuggestions = useMemo(
    () =>
      spaceList.data?.accounts.map((space) => ({
        value: space.id,
        label: space.metadata.name || undefined,
        meta: space.metadata.name ? space.id : undefined,
      })) ?? [],
    [spaceList.data?.accounts],
  )
  useEffect(() => {
    const controller = new AbortController()
    async function loadNames() {
      const names: string[] = []
      let pageToken = ''
      do {
        const response = await grpcClient.documents.listDocumentAttributeNames(
          {
            recursive: true,
            pageSize: 100,
            pageToken,
          },
          {
            signal: controller.signal,
          },
        )
        names.push(...response.names.map((name) => name.name))
        pageToken = response.nextPageToken
      } while (pageToken)
      setAttributeNames(names)
    }
    loadNames().catch((reason) => {
      if (!controller.signal.aborted) console.warn('Could not load document attribute names', reason)
    })
    return () => controller.abort()
  }, [])
  const invalidConditions = conditions.filter((condition) => condition.key.trim() && !isComplete(condition))
  const filters = useMemo(
    () =>
      conditions
        .filter(isComplete)
        .map(conditionFilter)
        .filter((filter): filter is DocumentFilter => !!filter),
    [conditions],
  )
  const request = useMemo(() => {
    const filter =
      filters.length === 0
        ? undefined
        : new DocumentFilter({
            filter: {
              case: mode,
              value: {
                filters,
              },
            },
          })
    return {
      filter,
      sort: sortRules
        .filter((rule) => rule.key.trim())
        .map(
          (rule) =>
            new DocumentSort({
              key: rule.key.trim(),
              descending: rule.descending,
            }),
        ),
      pageSize: 30,
    }
  }, [filters, mode, sortRules])
  const requestPreview = useMemo(
    () =>
      new QueryDocumentsRequest(request).toJsonString({
        prettySpaces: 2,
      }),
    [request],
  )
  const resultAttributeKeys = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...conditions.map((condition) => condition.key.trim()).filter(Boolean),
            ...sortRules.map((rule) => rule.key.trim()).filter(Boolean),
          ].filter((key) => key !== spaceField && key !== pathField),
        ),
      ),
    [conditions, sortRules],
  )
  const queryIsValid = invalidConditions.length === 0
  const queryGeneration = useRef(0)
  useEffect(() => {
    const generation = ++queryGeneration.current
    setError(null)
    if (!queryIsValid) {
      setResult(null)
      setIsLoading(false)
      return
    }
    const controller = new AbortController()
    setIsLoading(true)
    const timeout = setTimeout(() => {
      grpcClient.documents
        .queryDocuments(request, {
          signal: controller.signal,
        })
        .then((response) => {
          if (queryGeneration.current === generation) setResult(response)
        })
        .catch((reason) => {
          if (!controller.signal.aborted && queryGeneration.current === generation) {
            setResult(null)
            setError(reason instanceof Error ? reason.message : 'The query could not be completed.')
          }
        })
        .finally(() => {
          if (queryGeneration.current === generation) setIsLoading(false)
        })
    }, 250)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [queryIsValid, request])
  const updateCondition = (id: number, update: Partial<Condition>) => {
    setConditions((current) =>
      current.map((condition) =>
        condition.id === id
          ? {
              ...condition,
              ...update,
            }
          : condition,
      ),
    )
  }
  const loadMore = async (pageToken: string) => {
    const generation = queryGeneration.current
    setIsLoading(true)
    setError(null)
    try {
      const response = await grpcClient.documents.queryDocuments({
        ...request,
        pageToken,
      })
      if (queryGeneration.current !== generation) return
      setResult((current) =>
        current
          ? new QueryDocumentsResponse({
              ...response,
              documents: [...current.documents, ...response.documents],
            })
          : response,
      )
    } catch (reason) {
      if (queryGeneration.current === generation) {
        setError(reason instanceof Error ? reason.message : 'The query could not be completed.')
      }
    } finally {
      if (queryGeneration.current === generation) setIsLoading(false)
    }
  }
  const reset = () => {
    setMode('and')
    setConditions([emptyCondition(1)])
    setSortRules([emptySortRule(1)])
    setResult(null)
    setError(null)
  }
  const applySelectedSpace = () => {
    if (!selectedSpaceId) return
    setConditions((current) => {
      const spaceIndex = current.findIndex((condition) => condition.key.trim() === spaceField)
      const spaceCondition = {
        ...(spaceIndex >= 0 ? current[spaceIndex] : emptyCondition(Math.max(...current.map((item) => item.id), 0) + 1)),
        key: spaceField,
        kind: 'comparison' as const,
        operator: '=' as const,
        valueKind: 'string' as const,
        value: selectedSpaceId,
      }
      if (spaceIndex >= 0) {
        return current.map((condition, index) => (index === spaceIndex ? spaceCondition : condition))
      }
      const emptyIndex = current.findIndex((condition) => !condition.key.trim())
      if (emptyIndex >= 0) {
        return current.map((condition, index) => (index === emptyIndex ? spaceCondition : condition))
      }
      return [spaceCondition, ...current]
    })
  }
  const clearLocationFilters = () => {
    setConditions((current) => {
      const remaining = current.filter((condition) => {
        const key = condition.key.trim()
        return key !== spaceField && key !== pathField
      })
      return remaining.length ? remaining : [emptyCondition(Math.max(...current.map((item) => item.id), 0) + 1)]
    })
  }
  const hasLocationFilters = conditions.some((condition) => {
    const key = condition.key.trim()
    return key === spaceField || key === pathField
  })
  const updateSortRule = (id: number, update: Partial<SortRule>) => {
    setSortRules((current) =>
      current.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              ...update,
            }
          : rule,
      ),
    )
  }
  const moveSortRule = (index: number, offset: -1 | 1) => {
    setSortRules((current) => {
      const target = index + offset
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }
  return (
    <PanelContainer>
      <MainWrapper scrollable>
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 lg:px-8">
          <header className="border-border flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase">
                <Filter className={stylex.props(styles.s3269316e).className || ''} /> Document index
              </div>
              <h1 className={stylex.props(styles.sc3771bb1).className || ''}>Query Documents</h1>
              <p className="text-muted-foreground max-w-xl text-sm">
                Explore visible document attributes without saving a search.
              </p>
            </div>
            <div className={stylex.props(styles.s86ff3e4).className || ''}>
              {isLoading ? (
                <span className={stylex.props(styles.sf80b4c8a).className || ''} role="status">
                  <Loader2 className={stylex.props(styles.s4d016d20).className || ''} /> Updating
                </span>
              ) : null}
              <Button variant="ghost" size="sm" onClick={reset} aria-label="Reset query">
                <RotateCcw /> Reset
              </Button>
            </div>
          </header>

          <section className="border-border bg-muted/20 rounded-lg border shadow-sm">
            <div className="border-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                <span className={stylex.props(styles.s7ceacacd).className || ''}>Quick scope</span>
                <Button variant="outline" size="sm" onClick={applySelectedSpace} disabled={!selectedSpaceId}>
                  <AtSign /> Selected space
                </Button>
                <Button variant="ghost" size="sm" onClick={clearLocationFilters} disabled={!hasLocationFilters}>
                  <LocateFixed /> All visible
                </Button>
              </div>
              <span className={stylex.props(styles.sa56e9200).className || ''}>
                Space and path are also available as built-in fields.
              </span>
            </div>

            <div className="space-y-3 p-4">
              <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                <span className={stylex.props(styles.sd46c5b0e).className || ''}>Match</span>
                <div className={stylex.props(styles.s10a6312).className || ''} role="group" aria-label="Condition mode">
                  {(['and', 'or'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMode(value)}
                      className={cn(
                        stylex.props(styles.s60699f3c).className || '',
                        mode === value && 'bg-primary text-primary-foreground shadow-sm',
                      )}
                    >
                      {value === 'and' ? 'All' : 'Any'}
                    </button>
                  ))}
                </div>
                <span className={stylex.props(styles.sa56e9200).className || ''}>conditions</span>
              </div>

              <div className="space-y-2">
                {conditions.map((condition, index) => (
                  <ConditionRow
                    key={condition.id}
                    condition={condition}
                    index={index}
                    attributeNames={attributeNames}
                    spaceSuggestions={spaceSuggestions}
                    onChange={(update) => updateCondition(condition.id, update)}
                    onRemove={() => setConditions((current) => current.filter((item) => item.id !== condition.id))}
                    removable={conditions.length > 1}
                  />
                ))}
              </div>
              {invalidConditions.length ? (
                <p className={stylex.props(styles.s11c1d25d).className || ''}>
                  Finish the highlighted value to update the results.
                </p>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConditions((current) => [
                    ...current,
                    emptyCondition(Math.max(...current.map((item) => item.id), 0) + 1),
                  ])
                }
              >
                <Plus /> Add condition
              </Button>
            </div>

            <div className={stylex.props(styles.s8a8b6bdd).className || ''}>
              <div className={stylex.props(styles.sab2acd6c).className || ''}>
                <div className={stylex.props(styles.sfaa15d2).className || ''}>
                  <SlidersHorizontal className={stylex.props(styles.s3269316e).className || ''} /> Sort
                </div>
                <span className={stylex.props(styles.sa56e9200).className || ''}>
                  Earlier rows have higher priority. Up to {maxSortRules} attributes.
                </span>
              </div>
              <div className="space-y-2">
                {sortRules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="bg-background border-border grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border p-2 sm:grid-cols-[auto_minmax(12rem,1fr)_10rem_auto]"
                  >
                    <span className={stylex.props(styles.s51bcccdb).className || ''}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <AutocompleteInput
                      value={rule.key}
                      onChangeText={(key) =>
                        updateSortRule(rule.id, {
                          key,
                        })
                      }
                      suggestions={attributeNames.map((name) => ({
                        value: name,
                        description: DOCUMENT_ATTRIBUTE_DESCRIPTIONS[name],
                      }))}
                      placeholder="Attribute name"
                      ariaLabel={`Sort ${index + 1} attribute`}
                    />
                    <Select
                      value={rule.descending ? 'desc' : 'asc'}
                      onValueChange={(value) =>
                        updateSortRule(rule.id, {
                          descending: value === 'desc',
                        })
                      }
                      disabled={!rule.key.trim()}
                    >
                      <SelectTrigger className="col-span-2 w-full sm:col-span-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className={stylex.props(styles.sd36a4a47).className || ''}>
                      <button
                        type="button"
                        className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-sm p-1 disabled:opacity-30"
                        onClick={() => moveSortRule(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move sort ${index + 1} up`}
                      >
                        <ChevronUp className={stylex.props(styles.sca3de968).className || ''} />
                      </button>
                      <button
                        type="button"
                        className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-sm p-1 disabled:opacity-30"
                        onClick={() => moveSortRule(index, 1)}
                        disabled={index === sortRules.length - 1}
                        aria-label={`Move sort ${index + 1} down`}
                      >
                        <ChevronDown className={stylex.props(styles.sca3de968).className || ''} />
                      </button>
                      <button
                        type="button"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-sm p-1 disabled:opacity-30"
                        onClick={() => setSortRules((current) => current.filter((item) => item.id !== rule.id))}
                        disabled={sortRules.length === 1}
                        aria-label={`Remove sort ${index + 1}`}
                      >
                        <Trash2 className={stylex.props(styles.sca3de968).className || ''} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className={stylex.props(styles.s33458c).className || ''}
                variant="outline"
                size="sm"
                disabled={sortRules.length >= maxSortRules}
                onClick={() =>
                  setSortRules((current) => [
                    ...current,
                    emptySortRule(Math.max(...current.map((rule) => rule.id), 0) + 1),
                  ])
                }
              >
                <Plus /> Add sort
              </Button>
            </div>
          </section>

          <section className={stylex.props(styles.se3172170).className || ''}>
            <button
              className="text-muted-foreground hover:bg-muted/60 flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium tracking-wide uppercase transition-colors"
              type="button"
              onClick={() => setShowPreview((value) => !value)}
              aria-expanded={showPreview}
            >
              <span className={stylex.props(styles.s86ff3e4).className || ''}>
                <Braces className={stylex.props(styles.s3269316e).className || ''} /> Request preview
              </span>
              {showPreview ? (
                <ChevronDown className={stylex.props(styles.sca3de968).className || ''} />
              ) : (
                <ChevronRight className={stylex.props(styles.sca3de968).className || ''} />
              )}
            </button>
            {showPreview ? (
              <pre className="border-border bg-muted/30 overflow-x-auto border-t p-4 text-xs leading-5">
                {requestPreview}
              </pre>
            ) : null}
          </section>

          <section aria-live="polite" className="min-h-40">
            {isLoading && !result ? (
              <QueryState
                icon={<Loader2 className={stylex.props(styles.s3b858bae).className || ''} />}
                title="Searching documents"
                detail="Applying your current scope and conditions."
              />
            ) : null}
            {error ? <QueryState icon={<Filter />} title="Query failed" detail={error} tone="error" /> : null}
            {result && !result.documents.length ? (
              <QueryState
                icon={<Filter />}
                title="No matching documents"
                detail="Try broadening the scope or changing a condition."
              />
            ) : null}
            {result?.documents.length ? (
              <div className="space-y-2">
                <div className={stylex.props(styles.sce049c4e).className || ''}>
                  <span>
                    {result.documents.length} result{result.documents.length === 1 ? '' : 's'}
                  </span>
                  <span>Open a document to inspect it.</span>
                </div>
                <div className="divide-border border-border divide-y rounded-lg border">
                  {result.documents.map((document) => {
                    const item = prepareHMDocumentInfo(document)
                    return (
                      <div key={`${document.account}/${document.path}`}>
                        <DocumentListItem item={item} />
                        {resultAttributeKeys.length ? (
                          <div className={stylex.props(styles.s4bed10d3).className || ''}>
                            {resultAttributeKeys.map((key) => (
                              <span
                                key={key}
                                className="border-border bg-muted/40 text-muted-foreground inline-flex max-w-full items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[11px]"
                              >
                                <span>{key}</span>
                                <span className={stylex.props(styles.s120e1b03).className || ''}>
                                  {formatAttributeValue(item.metadata, key)}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
                {result.nextPageToken ? (
                  <div className={stylex.props(styles.s65916d2f).className || ''}>
                    <Button
                      variant="outline"
                      size="sm"
                      loading={isLoading}
                      onClick={() => loadMore(result.nextPageToken)}
                    >
                      Load more
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </main>
      </MainWrapper>
    </PanelContainer>
  )
}
function formatAttributeValue(metadata: unknown, key: string) {
  let value = metadata
  for (const segment of key.split('.')) {
    if (!value || typeof value !== 'object' || !(segment in value)) return '—'
    value = (value as Record<string, unknown>)[segment]
  }
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}
function AutocompleteInput({
  value,
  onChangeText,
  suggestions,
  className,
  placeholder,
  ariaLabel,
  inputMode,
  invalid,
}: {
  value: string
  onChangeText: (value: string) => void
  suggestions: AutocompleteSuggestion[]
  className?: string
  placeholder: string
  ariaLabel: string
  inputMode?: 'numeric'
  invalid?: boolean
}) {
  const listId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const visibleSuggestions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase()
    return suggestions
      .map((suggestion, index) => {
        const label = (suggestion.label ?? suggestion.value).toLocaleLowerCase()
        const rawValue = suggestion.value.toLocaleLowerCase()
        const meta = suggestion.meta?.toLocaleLowerCase() ?? ''
        const rank =
          !query || label === query
            ? 0
            : label.startsWith(query)
              ? 1
              : rawValue.startsWith(query)
                ? 2
                : label.includes(query)
                  ? 3
                  : rawValue.includes(query) || meta.includes(query)
                    ? 4
                    : -1
        return {
          suggestion,
          index,
          rank,
        }
      })
      .filter((item) => item.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .slice(0, 100)
      .map((item) => item.suggestion)
  }, [suggestions, value])
  useEffect(() => {
    setActiveIndex(null)
  }, [value])
  useEffect(() => {
    if (activeIndex === null) return
    listRef.current?.children[activeIndex]?.scrollIntoView({
      block: 'nearest',
    })
  }, [activeIndex])
  const choose = (suggestion: AutocompleteSuggestion) => {
    onChangeText(suggestion.value)
    setOpen(false)
    setActiveIndex(null)
  }
  return (
    <div className="relative w-full min-w-0">
      <Input
        value={value}
        inputMode={inputMode}
        aria-invalid={invalid}
        onChangeText={(nextValue) => {
          onChangeText(nextValue)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false)
          setActiveIndex(null)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (!open) setOpen(true)
            if (!visibleSuggestions.length) return
            event.preventDefault()
            setActiveIndex((current) => {
              if (event.key === 'ArrowDown') {
                return current === null ? 0 : Math.min(current + 1, visibleSuggestions.length - 1)
              }
              return current === null ? visibleSuggestions.length - 1 : Math.max(current - 1, 0)
            })
          }
          if (event.key === 'Enter' && activeIndex !== null && visibleSuggestions[activeIndex]) {
            event.preventDefault()
            choose(visibleSuggestions[activeIndex])
          }
          if (event.key === 'Escape') {
            setOpen(false)
            setActiveIndex(null)
          }
        }}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && visibleSuggestions.length > 0}
        aria-controls={listId}
        aria-activedescendant={activeIndex === null ? undefined : `${listId}-option-${activeIndex}`}
        className={cn(stylex.props(styles.s349b2d).className || '', className)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2" />
      {open && visibleSuggestions.length ? (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          className="border-border bg-popover absolute z-50 mt-1 max-h-52 w-full overflow-y-auto overscroll-contain rounded-md border p-1 shadow-lg"
          onMouseDown={(event) => event.preventDefault()}
        >
          {visibleSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.value}
              id={`${listId}-option-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              className={cn(
                'hover:bg-accent flex w-full items-start justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-sm outline-none',
                activeIndex === index && 'bg-accent',
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(suggestion)}
            >
              <span className="min-w-0">
                <span className={stylex.props(styles.s12583799).className || ''}>
                  {suggestion.label ?? suggestion.value}
                </span>
                {suggestion.description ? (
                  <span className={stylex.props(styles.s1047710f).className || ''}>{suggestion.description}</span>
                ) : null}
              </span>
              {suggestion.meta ? (
                <span className="text-muted-foreground max-w-40 shrink-0 truncate text-[11px]">{suggestion.meta}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
function ConditionRow({
  condition,
  index,
  attributeNames,
  spaceSuggestions,
  onChange,
  onRemove,
  removable,
}: {
  condition: Condition
  index: number
  attributeNames: string[]
  spaceSuggestions: AutocompleteSuggestion[]
  onChange: (update: Partial<Condition>) => void
  onRemove: () => void
  removable: boolean
}) {
  const field = condition.key.trim()
  const isSpace = field === spaceField
  const isPath = field === pathField
  const isBuiltIn = isSpace || isPath
  const needsValue = condition.kind !== 'exists' && condition.kind !== 'missing'
  const operators =
    condition.valueKind === 'bool'
      ? comparisonOperators.filter(([label]) => label === '=' || label === '≠')
      : comparisonOperators
  return (
    <div className="bg-background border-border grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-md border p-2 sm:grid-cols-[auto_minmax(10rem,1fr)_9rem_7rem_minmax(9rem,1fr)_auto] sm:items-center">
      <span className={stylex.props(styles.s51bcccdb).className || ''}>{String(index + 1).padStart(2, '0')}</span>
      <AutocompleteInput
        value={condition.key}
        onChangeText={(key) => {
          if (key === spaceField) {
            onChange({
              key,
              kind: 'comparison',
              operator: '=',
              valueKind: 'string',
              value: '',
            })
          } else if (key === pathField) {
            onChange({
              key,
              kind: 'prefix',
              operator: '=',
              valueKind: 'string',
              value: '',
            })
          } else {
            onChange({
              key,
            })
          }
        }}
        className={cn(isBuiltIn && 'border-primary/40 bg-primary/5 font-medium')}
        suggestions={[
          {
            value: spaceField,
            description: 'Space containing the document.',
          },
          {
            value: pathField,
            description: 'Document path within its space.',
          },
          ...attributeNames.map((name) => ({
            value: name,
            description: DOCUMENT_ATTRIBUTE_DESCRIPTIONS[name],
          })),
        ]}
        placeholder="Field or attribute"
        ariaLabel={`Condition ${index + 1} field`}
      />
      {isBuiltIn ? (
        <Select
          value={
            isPath && condition.kind === 'prefix'
              ? condition.operator === '≠'
                ? 'outside'
                : 'within'
              : condition.operator === '≠'
                ? 'is-not'
                : 'is'
          }
          onValueChange={(operator) => {
            if (operator === 'within' || operator === 'outside') {
              onChange({
                kind: 'prefix',
                operator: operator === 'outside' ? '≠' : '=',
              })
            } else {
              onChange({
                kind: 'comparison',
                operator: operator === 'is-not' ? '≠' : '=',
              })
            }
          }}
        >
          <SelectTrigger className="sm:col-span-2" aria-label={`Condition ${index + 1} built-in operator`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="is">Is</SelectItem>
            <SelectItem value="is-not">Is not</SelectItem>
            {isPath ? <SelectItem value="within">Is at or below</SelectItem> : null}
            {isPath ? <SelectItem value="outside">Is outside</SelectItem> : null}
          </SelectContent>
        </Select>
      ) : (
        <>
          <Select
            value={condition.kind}
            onValueChange={(kind: ConditionKind) =>
              onChange({
                kind,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comparison">Compare</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="prefix">Starts with</SelectItem>
              <SelectItem value="exists">Exists</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
            </SelectContent>
          </Select>
          {condition.kind === 'comparison' ? (
            <Select
              value={condition.operator}
              onValueChange={(operator: Condition['operator']) =>
                onChange({
                  operator,
                })
              }
            >
              <SelectTrigger aria-label={`Condition ${index + 1} comparison operator`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map(([label]) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="hidden sm:block" />
          )}
        </>
      )}
      {isSpace ? (
        <AutocompleteInput
          value={condition.value}
          onChangeText={(value) =>
            onChange({
              value,
            })
          }
          suggestions={spaceSuggestions}
          placeholder="Space ID or space name"
          ariaLabel={`Condition ${index + 1} space`}
        />
      ) : isPath ? (
        <Input
          value={condition.value}
          onChangeText={(value) =>
            onChange({
              value,
            })
          }
          placeholder="/path or /"
          aria-label={`Condition ${index + 1} path`}
          aria-invalid={!!condition.value.trim() && !isComplete(condition)}
        />
      ) : needsValue ? (
        <ConditionValue condition={condition} onChange={onChange} label={`Condition ${index + 1} value`} />
      ) : (
        <span className={stylex.props(styles.sa2b7e80d).className || ''}>No value</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!removable}
        aria-label={`Remove condition ${index + 1}`}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
function ConditionValue({
  condition,
  onChange,
  label,
}: {
  condition: Condition
  onChange: (update: Partial<Condition>) => void
  label: string
}) {
  const suggestions = useGlobalAttributeValues(condition)
  const autocompleteSuggestions = suggestions.map((value) => ({
    value,
  }))
  if (condition.kind === 'comparison') {
    return (
      <div className="flex min-w-0 gap-2">
        <Select
          value={condition.valueKind}
          onValueChange={(valueKind: ValueKind) => {
            const boolOperator = condition.operator === '=' || condition.operator === '≠' ? condition.operator : '='
            onChange({
              valueKind,
              value: valueKind === 'bool' ? 'true' : condition.value,
              operator: valueKind === 'bool' ? boolOperator : condition.operator,
            })
          }}
        >
          <SelectTrigger className={stylex.props(styles.s36c758).className || ''} aria-label={`${label} type`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">Text</SelectItem>
            <SelectItem value="int">Integer</SelectItem>
            <SelectItem value="bool">Boolean</SelectItem>
          </SelectContent>
        </Select>
        {condition.valueKind === 'bool' ? (
          <Select
            value={condition.value || 'true'}
            onValueChange={(value) =>
              onChange({
                value,
              })
            }
          >
            <SelectTrigger aria-label={label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <AutocompleteInput
            value={condition.value}
            onChangeText={(value) =>
              onChange({
                value,
              })
            }
            suggestions={autocompleteSuggestions}
            inputMode={condition.valueKind === 'int' ? 'numeric' : undefined}
            placeholder="Value"
            ariaLabel={label}
            invalid={condition.valueKind === 'int' && !!condition.value && !/^-?\d+$/.test(condition.value.trim())}
          />
        )}
      </div>
    )
  }
  return (
    <AutocompleteInput
      value={condition.value}
      onChangeText={(value) =>
        onChange({
          value,
        })
      }
      suggestions={autocompleteSuggestions}
      placeholder={condition.kind === 'prefix' ? 'Prefix' : 'Text to find'}
      ariaLabel={label}
    />
  )
}
function useGlobalAttributeValues(condition: Condition) {
  const [values, setValues] = useState<string[]>([])
  useEffect(() => {
    const key = condition.key.trim()
    const kind =
      condition.kind === 'contains' || condition.kind === 'prefix' || condition.valueKind === 'string'
        ? DocumentAttributeKind.STRING
        : condition.valueKind === 'int'
          ? DocumentAttributeKind.INT
          : null
    if (!key || condition.kind === 'exists' || condition.kind === 'missing' || kind === null) {
      setValues([])
      return
    }
    const controller = new AbortController()
    grpcClient.documents
      .listDocumentAttributeValues(
        {
          path: key.split('.'),
          kind,
          prefix: condition.value,
          pageSize: 30,
        },
        {
          signal: controller.signal,
        },
      )
      .then((response) => {
        setValues(
          response.values.flatMap((item) => {
            const value = item.value?.value
            if (value?.case === 'stringValue' || value?.case === 'intValue') return [String(value.value)]
            return []
          }),
        )
      })
      .catch((reason) => {
        if (!controller.signal.aborted) console.warn('Could not load document attribute values', reason)
      })
    return () => controller.abort()
  }, [condition.key, condition.kind, condition.value, condition.valueKind])
  return values
}
function QueryState({icon, title, detail, tone}: {icon: ReactNode; title: string; detail: string; tone?: 'error'}) {
  return (
    <div
      className={cn(
        'border-border bg-muted/20 flex min-h-40 flex-col items-center justify-center rounded-lg border p-6 text-center',
        tone === 'error' && 'border-destructive/40 bg-destructive/5',
      )}
    >
      <span className={cn(stylex.props(styles.s5bf2d9b6).className || '', tone === 'error' && 'text-destructive')}>
        {icon}
      </span>
      <h2 className={stylex.props(styles.s9d4b128d).className || ''}>{title}</h2>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{detail}</p>
    </div>
  )
}
