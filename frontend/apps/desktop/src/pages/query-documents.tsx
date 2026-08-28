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
const styles_6 = stylex.create({
  sc7133e96: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 1)',
  },
  sc7133e97: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
  },
})
const styles_5 = stylex.create({
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
})
const styles_4 = stylex.create({
  sffc515b6: {
    marginInline: 'auto',
    display: 'flex',
    width: '100%',
    maxWidth: 'var(--container-6xl)',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 5)',
    paddingInline: 'calc(var(--spacing) * 5)',
    paddingBlock: 'calc(var(--spacing) * 6)',
    '@media ((min-width: 1024px))': {
      paddingInline: 'calc(var(--spacing) * 8)',
    },
  },
  sb5a1f499: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingBottom: 'calc(var(--spacing) * 5)',
    '@media ((min-width: 640px))': {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
  },
  s6185ff34: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  s196aeaf: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 20%, transparent)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: 'var(--shadow-sm)',
  },
  s4ffa9207: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 3)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 640px))': {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },
  sf54e12d9: {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0,1fr) auto',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 2)',
    '@media ((min-width: 640px))': {
      gridTemplateColumns: 'auto minmax(12rem,1fr) 10rem auto',
    },
  },
  s18f67c04: {
    gridColumn: 'span 2 / span 2',
    width: '100%',
    '@media ((min-width: 640px))': {
      gridColumn: 'span 1 / span 1',
    },
  },
  s496a170d: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        color: 'var(--foreground)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    borderRadius: 'calc(var(--radius) - 4px)',
    padding: 'calc(var(--spacing) * 1)',
    ':disabled': {
      opacity: '30%',
    },
  },
  se71b5546: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
        color: 'var(--destructive)',
        opacity: '100%',
      },
    },
    borderRadius: 'calc(var(--radius) - 4px)',
    padding: 'calc(var(--spacing) * 1)',
    ':disabled': {
      opacity: '30%',
    },
  },
  s269feb8c: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 3)',
    textAlign: 'left',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sfdbf1c0e: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    overflowX: 'auto',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'calc(var(--spacing) * 5)',
  },
  sa205e0c5: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    color: 'var(--muted-foreground)',
    display: 'inline-flex',
    maxWidth: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    borderRadius: '0.25rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 1.5)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
  },
  s8def49e6: {
    color: 'var(--muted-foreground)',
    pointerEvents: 'none',
    position: 'absolute',
    top: '50%',
    right: 'calc(var(--spacing) * 2.5)',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
  },
  s86991cfd: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        color: 'var(--foreground)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    textAlign: 'left',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    outlineStyle: 'none',
  },
  s3205deca: {
    color: 'var(--muted-foreground)',
    maxWidth: 'calc(var(--spacing) * 40)',
    flexShrink: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '11px',
  },
  s80a077ad: {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0,1fr)',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 2)',
    '@media ((min-width: 640px))': {
      gridTemplateColumns: 'auto minmax(10rem,1fr) 9rem 7rem minmax(9rem,1fr) auto',
      alignItems: 'center',
    },
  },
  s9925fe9: {
    borderColor: 'color-mix(in oklab, var(--primary) 40%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--primary) 5%, transparent)',
    fontWeight: 'var(--font-weight-medium)',
  },
  sd36f607c: {
    '@media ((min-width: 640px))': {
      gridColumn: 'span 2 / span 2',
    },
  },
  s28c43d23: {
    display: 'none',
    '@media ((min-width: 640px))': {
      display: 'block',
    },
  },
  s552e5d41: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 20%, transparent)',
    display: 'flex',
    minHeight: 'calc(var(--spacing) * 40)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 6)',
    textAlign: 'center',
  },
  sffc13ed6: {
    borderColor: 'color-mix(in oklab, var(--destructive) 40%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--destructive) 5%, transparent)',
  },
})
const styles_3 = stylex.create({
  s46078cef: {
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    boxShadow: 'var(--shadow-sm)',
  },
  s856bab52: {
    backgroundColor: 'var(--accent)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
})
const styles_2 = stylex.create({
  s545e01e8: {
    color: 'var(--muted-foreground)',
    maxWidth: '36rem',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sabad949c: {
    minHeight: 'calc(0.25rem * 40)',
  },
  s4ac9df38: {
    position: 'relative',
    width: '100%',
    minWidth: 'calc(0.25rem * 0)',
  },
  s6e90c5ad: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--popover)',
    position: 'absolute',
    zIndex: '50',
    marginTop: 'calc(0.25rem * 1)',
    maxHeight: 'calc(0.25rem * 52)',
    width: '100%',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 1)',
    boxShadow: 'var(--shadow-lg)',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sa9c17a13: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    gap: 'calc(0.25rem * 2)',
  },
  s2df23bad: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    maxWidth: '24rem',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
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
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
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
    boxShadow: 'var(--shadow-sm)',
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
        <main className={stylex.props(styles_4.sffc515b6).className || ''}>
          <header className={stylex.props(styles_4.sb5a1f499).className || ''}>
            <div className={stylex.props(styles_6.sc7133e96).className || ''}>
              <div className={stylex.props(styles_4.s6185ff34).className || ''}>
                <Filter className={stylex.props(styles.s3269316e).className || ''} /> Document index
              </div>
              <h1 className={stylex.props(styles.sc3771bb1).className || ''}>Query Documents</h1>
              <p className={stylex.props(styles_2.s545e01e8).className || ''}>
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

          <section className={stylex.props(styles_4.s196aeaf).className || ''}>
            <div className={stylex.props(styles_4.s4ffa9207).className || ''}>
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

            <div className={stylex.props(styles_5.s1aa17).className || ''}>
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
                        stylex.props(mode === value && styles_3.s46078cef).className || '',
                      )}
                    >
                      {value === 'and' ? 'All' : 'Any'}
                    </button>
                  ))}
                </div>
                <span className={stylex.props(styles.sa56e9200).className || ''}>conditions</span>
              </div>

              <div className={stylex.props(styles_6.sc7133e97).className || ''}>
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
              <div className={stylex.props(styles_6.sc7133e97).className || ''}>
                {sortRules.map((rule, index) => (
                  <div key={rule.id} className={stylex.props(styles_4.sf54e12d9).className || ''}>
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
                      <SelectTrigger className={stylex.props(styles_4.s18f67c04).className || ''}>
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
                        className={stylex.props(styles_4.s496a170d).className || ''}
                        onClick={() => moveSortRule(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move sort ${index + 1} up`}
                      >
                        <ChevronUp className={stylex.props(styles.sca3de968).className || ''} />
                      </button>
                      <button
                        type="button"
                        className={stylex.props(styles_4.s496a170d).className || ''}
                        onClick={() => moveSortRule(index, 1)}
                        disabled={index === sortRules.length - 1}
                        aria-label={`Move sort ${index + 1} down`}
                      >
                        <ChevronDown className={stylex.props(styles.sca3de968).className || ''} />
                      </button>
                      <button
                        type="button"
                        className={stylex.props(styles_4.se71b5546).className || ''}
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
              className={stylex.props(styles_4.s269feb8c).className || ''}
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
              <pre className={stylex.props(styles_4.sfdbf1c0e).className || ''}>{requestPreview}</pre>
            ) : null}
          </section>

          <section aria-live="polite" className={stylex.props(styles_2.sabad949c).className || ''}>
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
              <div className={stylex.props(styles_6.sc7133e97).className || ''}>
                <div className={stylex.props(styles.sce049c4e).className || ''}>
                  <span>
                    {result.documents.length} result{result.documents.length === 1 ? '' : 's'}
                  </span>
                  <span>Open a document to inspect it.</span>
                </div>
                <div
                  className={stylex.props(styles_5.s1a01a0ed, styles_5.sf799889b, styles_5.sad8c742c).className || ''}
                >
                  {result.documents.map((document) => {
                    const item = prepareHMDocumentInfo(document)
                    return (
                      <div key={`${document.account}/${document.path}`}>
                        <DocumentListItem item={item} />
                        {resultAttributeKeys.length ? (
                          <div className={stylex.props(styles.s4bed10d3).className || ''}>
                            {resultAttributeKeys.map((key) => (
                              <span key={key} className={stylex.props(styles_4.sa205e0c5).className || ''}>
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
    <div className={[stylex.props(styles_2.s4ac9df38).className || '', className].filter(Boolean).join(' ')}>
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
      <ChevronDown className={stylex.props(styles_4.s8def49e6).className || ''} />
      {open && visibleSuggestions.length ? (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          className={stylex.props(styles_2.s6e90c5ad).className || ''}
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
                stylex.props(styles_4.s86991cfd).className || '',
                stylex.props(activeIndex === index && styles_3.s856bab52).className || '',
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(suggestion)}
            >
              <span className={stylex.props(styles_2.s3f58665f).className || ''}>
                <span className={stylex.props(styles.s12583799).className || ''}>
                  {suggestion.label ?? suggestion.value}
                </span>
                {suggestion.description ? (
                  <span className={stylex.props(styles.s1047710f).className || ''}>{suggestion.description}</span>
                ) : null}
              </span>
              {suggestion.meta ? (
                <span className={stylex.props(styles_4.s3205deca).className || ''}>{suggestion.meta}</span>
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
    <div className={stylex.props(styles_4.s80a077ad).className || ''}>
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
        className={cn(stylex.props(isBuiltIn ? styles_4.s9925fe9 : null).className || '')}
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
          <SelectTrigger
            className={stylex.props(styles_4.sd36f607c).className || ''}
            aria-label={`Condition ${index + 1} built-in operator`}
          >
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
            <span className={stylex.props(styles_4.s28c43d23).className || ''} />
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
      <div className={stylex.props(styles_2.sa9c17a13).className || ''}>
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
        stylex.props(styles_4.s552e5d41).className || '',
        stylex.props(tone === 'error' ? styles_4.sffc13ed6 : null).className || '',
      )}
    >
      <span
        className={cn(
          stylex.props(styles.s5bf2d9b6).className || '',
          stylex.props(tone === 'error' && styles_3.s8a2570e2).className || '',
        )}
      >
        {icon}
      </span>
      <h2 className={stylex.props(styles.s9d4b128d).className || ''}>{title}</h2>
      <p className={stylex.props(styles_2.s2df23bad).className || ''}>{detail}</p>
    </div>
  )
}
