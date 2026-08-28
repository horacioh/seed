import * as stylex from '@stylexjs/stylex'
import type {
  ExplorePresentation,
  ExploreSortRule,
  ExplorePredicate,
  ExploreQueryNode,
  HMExploreContext,
  HMExploreResult,
  HMExploreResultType,
  ParsedExploreQuery,
} from '@shm/shared/explore'
import {
  exploreQueryChips,
  compileExploreQuery,
  cycleExploreSort,
  clearExploreConditions,
  removeExploreQueryChip,
  serializeExploreQuery,
  toggleExplorePredicate,
  toggleExploreColumn,
} from '@shm/shared/explore'
import {DocumentSort, QueryDocumentsRequest} from '@shm/shared/client/grpc-types'
import {
  exploreDocumentKey,
  useExploreAccounts,
  useExploreAttributeNames,
  useExploreAttributeValues,
} from '@shm/shared/models/explore'
import {hmId, packHmId} from '@shm/shared/utils/entity-id-url'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  Loader2,
  MessageSquare,
  Pilcrow,
  Search,
  X,
} from 'lucide-react'
import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react'
import * as Ariakit from '@ariakit/react'
import {Button} from './button'
import {Input} from './components/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './select-dropdown'
import {cn} from './utils'

/** Highlights query terms in text without interpreting them as a regular expression. */
const styles_5 = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s92852dd5: {
    overflow: 'hidden',
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
  sec52090b: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    color: 'var(--muted-foreground)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s3e751ad3: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    textAlign: 'left',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s1c2156eb: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    fontSize: '11px',
    fontWeight: 'var(--font-weight-medium)',
    textTransform: 'uppercase',
  },
  s8f6ed295: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
    borderRadius: '0.25rem',
    padding: 'calc(var(--spacing) * 1)',
  },
  s47aed50f: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
      },
    },
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 1)',
    fontSize: '11px',
  },
  s28be15b8: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    textAlign: 'left',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
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
  s1fa02c08: {
    color: 'var(--muted-foreground)',
    fontSize: '11px',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  sc731bffd: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 2.5)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sc4a3833e: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
      },
    },
    paddingInline: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s9f6fc75f: {
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    color: 'var(--tone-amber-700)',
  },
  s180f435a: {
    borderColor: 'var(--foreground)',
    color: 'var(--foreground)',
    fontWeight: 'var(--font-weight-medium)',
  },
  sce3543c7: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
      },
    },
    borderColor: 'transparent',
  },
  sacf3fbd8: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    textAlign: 'left',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  sbc6aa5c0: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 10%, transparent)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
  },
  sfd476430: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 10%, transparent)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
  },
  s418b62ed: {
    color: 'var(--muted-foreground)',
    fontSize: '11px',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  s889eda3b: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(var(--spacing) * 2)',
    overflow: 'auto',
    fontSize: '11px',
  },
  sc65561ab: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s44828117: {
    borderColor: 'var(--input)',
    backgroundColor: 'var(--background)',
    ':focus-visible': {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 2px currentcolor',
    },
    height: 'calc(var(--spacing) * 8)',
    width: '100%',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    outlineStyle: 'none',
  },
  s7804e73: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
    ':focus': {
      backgroundColor: 'var(--accent)',
    },
    width: '100%',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    textAlign: 'left',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    outlineStyle: 'none',
  },
  s662f878d: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    color: 'var(--muted-foreground)',
  },
  s899a5760: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    ':focus-visible': {
      boxShadow: '0 0 0 2px currentcolor',
      outlineStyle: 'none',
    },
    outlineStyle: 'none',
  },
  s3b7916ca: {
    cursor: 'default',
  },
  s2dc5299d: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 20%, transparent)',
      },
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    ':lastChild': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  s30a15a48: {
    color: 'var(--foreground)',
    ':focus-visible': {
      boxShadow: '0 0 0 2px currentcolor',
      outlineStyle: 'none',
    },
    borderRadius: '0.25rem',
    textAlign: 'left',
    outlineStyle: 'none',
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
  sb30c8f14: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 20%, transparent)',
      },
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
    ':lastChild': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  s1325ab8d: {
    color: 'var(--muted-foreground)',
    fontSize: '10px',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: 'var(--tracking-widest)',
    textTransform: 'uppercase',
  },
  s505fb8b: {
    backgroundColor: 'var(--muted)',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
  },
  s67840439: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 20%, transparent)',
    display: 'flex',
    minHeight: 'calc(var(--spacing) * 48)',
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
  s180f435a: {
    borderColor: 'var(--foreground)',
    color: 'var(--foreground)',
    fontWeight: '500',
  },
  s856bab52: {
    backgroundColor: 'var(--accent)',
  },
  s3b7916ca: {
    cursor: 'default',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
})
const styles_2 = stylex.create({
  se2dabf6f: {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    position: 'absolute',
    top: '100%',
    right: 'calc(0.25rem * 0)',
    zIndex: '30',
    marginTop: 'calc(0.25rem * 2)',
    minWidth: 'calc(0.25rem * 48)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 1)',
    boxShadow: 'var(--shadow-md)',
  },
  sf26f97cb: {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    position: 'absolute',
    top: '100%',
    right: 'calc(0.25rem * 24)',
    zIndex: '30',
    marginTop: 'calc(0.25rem * 2)',
    minWidth: 'calc(0.25rem * 48)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 1)',
    boxShadow: 'var(--shadow-md)',
  },
  s244b0b8c: {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    position: 'absolute',
    top: '100%',
    right: 'calc(0.25rem * 0)',
    zIndex: '30',
    marginTop: 'calc(0.25rem * 2)',
    minWidth: 'calc(0.25rem * 56)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 1)',
    boxShadow: 'var(--shadow-md)',
  },
  s10483f08: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sabad94a4: {
    minHeight: 'calc(0.25rem * 48)',
  },
  s48338369: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--popover)',
    position: 'absolute',
    top: 'calc(0.25rem * 10)',
    left: 'calc(0.25rem * 0)',
    zIndex: '10',
    display: 'flex',
    minWidth: 'calc(0.25rem * 44)',
    flexDirection: 'column',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 1)',
    boxShadow: 'var(--shadow-md)',
  },
  sdb36c0db: {
    height: 'calc(0.25rem * 8)',
    minWidth: 'calc(0.25rem * 32)',
    flex: '1',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s4e12b012: {
    position: 'relative',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
  sf757653: {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    zIndex: '50',
    maxHeight: 'calc(0.25rem * 48)',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 1)',
    boxShadow: 'var(--shadow-md)',
  },
  s6997be87: {
    width: '100%',
    minWidth: 'max-content',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  saf406c44: {
    maxWidth: 'calc(0.25rem * 80)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    verticalAlign: 'top',
  },
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
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
  s8ba11029: {
    backgroundColor: 'var(--brand-10)',
    color: 'var(--secondary-foreground)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s75f4ad6b: {
    marginLeft: 'calc(0.25rem * 1)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s7f7d213: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderRadius: '0.25rem',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1.5)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s514b5fd3: {
    borderColor: 'var(--border)',
    marginTop: 'calc(0.25rem * 1)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(0.25rem * 1)',
  },
  s3fa69aa1: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s261b6cd6: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingBottom: 'calc(0.25rem * 5)',
  },
  sbbe27b50: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 3)',
  },
  s95e874dc: {
    marginTop: 'calc(0.25rem * 1)',
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  s8cc1e96a: {
    backgroundColor: 'var(--background)',
    height: 'calc(0.25rem * 11)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sc5c9a492: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s86ff3e3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s1fa2d8e6: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sf64c667d: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 1)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s337d6708: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  sc5f26018: {
    color: 'var(--muted-foreground)',
    fontVariantNumeric: '   tabular-nums ',
  },
  s9d4b128d: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  sa56e9200: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s4318b0f5: {
    color: 'var(--muted-foreground)',
    marginBottom: 'calc(0.25rem * 3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s4d016d20: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    animation: 'spin 1s linear infinite',
  },
  s3b858bae: {
    animation: 'spin 1s linear infinite',
  },
  sd467b8c3: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  saaee5cf7: {
    marginTop: 'calc(0.25rem * 4)',
    width: '100%',
  },
  sa843339a: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 5)',
    textAlign: 'center',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sabdedac1: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s5d77118: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s76945554: {
    cursor: 'pointer',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
  },
  se658ac14: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
  s9cddff9f: {
    borderColor: 'var(--border)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '2px',
    paddingLeft: 'calc(0.25rem * 3)',
  },
  s97ff1ece: {
    marginBottom: 'calc(0.25rem * 2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sb2f68493: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
  },
  sc1c9c63d: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 3)',
  },
  sbbe27b4f: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
  },
  s36c758: {
    width: 'calc(0.25rem * 24)',
  },
  se658ac13: {
    display: 'flex',
    gap: 'calc(0.25rem * 1)',
  },
  s2e13e93d: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 2)',
  },
  s335ce1: {
    height: 'calc(0.25rem * 8)',
    width: 'calc(0.25rem * 36)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s36c75c: {
    width: 'calc(0.25rem * 28)',
  },
  s36c73b: {
    width: 'calc(0.25rem * 16)',
  },
  s2fb76463: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    overflowX: 'auto',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sc3e0f3e2: {
    borderColor: 'var(--border)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  s4f7ac506: {
    borderRadius: '0.25rem',
    paddingInline: 'calc(0.25rem * 1)',
    textAlign: 'left',
  },
  s332783: {
    marginLeft: 'calc(0.25rem * 1)',
  },
  sbdcf888f: {
    display: 'flex',
    width: '100%',
    gap: 'calc(0.25rem * 3)',
    textAlign: 'left',
  },
  s87a7d048: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 0.5)',
    display: 'inline-flex',
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sf56ac00b: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
  },
  sd45be9ae: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    display: 'block',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s66d9f4dd: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 2)',
    display: 'block',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
  },
  sd44866c: {
    marginTop: 'calc(0.25rem * 2)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 1.5)',
  },
  s3bb14b3e: {
    marginTop: 'calc(0.25rem * 3)',
    paddingLeft: 'calc(0.25rem * 11)',
  },
  s8dd19d6b: {
    borderColor: 'var(--border)',
    marginTop: 'calc(0.25rem * 2)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '2px',
    paddingLeft: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sd1dfa3c9: {
    color: 'var(--primary)',
    marginTop: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
  },
  s5bf2d9b6: {
    color: 'var(--muted-foreground)',
    marginBottom: 'calc(0.25rem * 3)',
  },
})
export function highlightExploreText(text: string, terms: string[]): ReactNode {
  const normalized = terms.map((term) => term.replace(/^"|"$/g, '').trim()).filter(Boolean)
  if (!normalized.length || !text) return text
  const pattern = new RegExp(
    `(${normalized
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|')})`,
    'giu',
  )
  return text.split(pattern).map((part, index) =>
    normalized.some(
      (term) =>
        part.localeCompare(term, undefined, {
          sensitivity: 'accent',
        }) === 0,
    ) ? (
      <mark key={index} className={stylex.props(styles.s8ba11029).className || ''}>
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function exploreColumnLabel(column: string) {
  const builtIns: Record<string, string> = {
    title: 'Title',
    space: 'Space',
    path: 'Path',
    updated: 'Updated',
    version: 'Version',
  }
  return builtIns[column] ?? column
}
function ExploreScopePill({
  context,
  contextLabel,
  accounts,
  onChange,
}: {
  context: HMExploreContext
  contextLabel: string
  accounts: Array<{
    value: string
    label: string
  }>
  onChange?: (scope: HMExploreContext) => void
}) {
  const [open, setOpen] = useState(false)
  if (!onChange) {
    return <span className={stylex.props(styles_4.sec52090b).className || ''}>{contextLabel}</span>
  }
  const scopeLabel = context.type === 'node' ? 'Whole node' : context.id.uid
  return (
    <div className={stylex.props(styles.sdef3facc).className || ''}>
      <Button size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
        {scopeLabel}
        <ChevronDown className={stylex.props(styles.s75f4ad6b).className || ''} aria-hidden />
      </Button>
      {open ? (
        <div className={stylex.props(styles_2.se2dabf6f).className || ''}>
          <button
            type="button"
            className={stylex.props(styles_4.s3e751ad3).className || ''}
            onClick={() => {
              onChange({
                type: 'node',
              })
              setOpen(false)
            }}
          >
            {context.type === 'node' ? (
              <Check className={stylex.props(styles.s3269316e).className || ''} />
            ) : (
              <span className={stylex.props(styles.s3269316e).className || ''} />
            )}
            Whole node
          </button>
          {accounts.map((account) => (
            <button
              key={account.value}
              type="button"
              className={stylex.props(styles_4.s3e751ad3).className || ''}
              onClick={() => {
                onChange({
                  type: 'site',
                  id: hmId(account.value),
                })
                setOpen(false)
              }}
            >
              {context.type === 'site' && context.id.uid === account.value ? (
                <Check className={stylex.props(styles.s3269316e).className || ''} />
              ) : (
                <span className={stylex.props(styles.s3269316e).className || ''} />
              )}
              {account.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
function ExploreColumnsMenu({
  columns,
  selected,
  onToggle,
}: {
  columns: string[]
  selected: string[]
  onToggle: (column: string) => void
}) {
  return (
    <div className={stylex.props(styles_2.sf26f97cb).className || ''}>
      <p className={stylex.props(styles_4.s1c2156eb).className || ''}>Columns</p>
      {columns.map((column) => (
        <button
          type="button"
          key={column}
          className={stylex.props(styles_4.s3e751ad3).className || ''}
          onClick={() => onToggle(column)}
        >
          {selected.includes(column) ? (
            <Check className={stylex.props(styles.s3269316e).className || ''} />
          ) : (
            <span className={stylex.props(styles.s3269316e).className || ''} />
          )}
          {exploreColumnLabel(column)}
        </button>
      ))}
    </div>
  )
}
function ExploreSortMenu({
  rules,
  availableKeys,
  onCycleDirection,
  onRemove,
  onAdd,
}: {
  rules: ExploreSortRule[]
  availableKeys: string[]
  onCycleDirection: (key: string) => void
  onRemove: (key: string) => void
  onAdd: (key: string) => void
}) {
  const activeKeys = new Set(rules.map((rule) => rule.key))
  return (
    <div className={stylex.props(styles_2.s244b0b8c).className || ''}>
      <p className={stylex.props(styles_4.s1c2156eb).className || ''}>Sort order</p>
      {rules.length
        ? rules.map((rule) => (
            <div key={rule.key} className={stylex.props(styles.s7f7d213).className || ''}>
              <button
                type="button"
                className={stylex.props(styles_4.s8f6ed295).className || ''}
                onClick={() => onCycleDirection(rule.key)}
                aria-label={`Change ${rule.key} sort direction`}
              >
                {rule.direction === 'asc' ? (
                  <ArrowUp className={stylex.props(styles.s3269316e).className || ''} />
                ) : (
                  <ArrowDown className={stylex.props(styles.s3269316e).className || ''} />
                )}
              </button>
              <span className={stylex.props(styles_2.s10483f08).className || ''}>{rule.key}</span>
              <button
                type="button"
                className={stylex.props(styles_4.s47aed50f).className || ''}
                onClick={() => onRemove(rule.key)}
                aria-label={`Remove ${rule.key} sort`}
              >
                Remove
              </button>
            </div>
          ))
        : null}
      <div className={stylex.props(styles.s514b5fd3).className || ''}>
        <p className={stylex.props(styles_4.s1c2156eb).className || ''}>Add attribute sort</p>
        {availableKeys
          .filter((key) => !activeKeys.has(key))
          .map((key) => (
            <button
              key={key}
              type="button"
              className={stylex.props(styles_4.s28be15b8).className || ''}
              onClick={() => onAdd(key)}
            >
              {key}
            </button>
          ))}
        {!availableKeys.some((key) => !activeKeys.has(key)) ? (
          <p className={stylex.props(styles.s3fa69aa1).className || ''}>
            {rules.length ? 'All attributes are already selected.' : 'No attribute names available.'}
          </p>
        ) : null}
      </div>
    </div>
  )
}
export type ExplorePageProps = {
  contextLabel: string
  query: string
  parsed: ParsedExploreQuery
  results: HMExploreResult[]
  counts: Record<HMExploreResultType | 'all', number>
  textTerms: string[]
  diagnostics?: ParsedExploreQuery['diagnostics']
  blocksByDocument?: Record<
    string,
    Extract<
      HMExploreResult,
      {
        type: 'block'
      }
    >[]
  >
  isLoading?: boolean
  isRefetching?: boolean
  error?: string | null
  hasMore?: boolean
  intersectionPending?: boolean
  intersectionTruncated?: boolean
  onLoadMore?: () => void
  onQueryChange: (query: string) => void
  onOpenResult: (result: HMExploreResult) => void
  accountUid?: string
  context: HMExploreContext
  onScopeChange?: (scope: HMExploreContext) => void
}
type ResultTab = 'all' | HMExploreResultType
const tabs: Array<{
  id: ResultTab
  label: string
}> = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'document',
    label: 'Documents',
  },
  {
    id: 'block',
    label: 'Text blocks',
  },
  {
    id: 'comment',
    label: 'Conversations',
  },
]

/** Shared Explore search/results surface used by desktop and web wrappers. */
export function ExplorePage(props: ExplorePageProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>('all')
  const [menu, setMenu] = useState<'type' | 'in' | 'attributes' | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [draft, setDraft] = useState(props.query)
  const [builderAst, setBuilderAst] = useState<ExploreQueryNode | null>(props.parsed.ast)
  const [activeValueField, setActiveValueField] = useState('')
  const [activeValueKind, setActiveValueKind] = useState<'string' | 'int' | 'bool'>('string')
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const debounceRef = useRef<number | null>(null)
  const onQueryChangeRef = useRef(props.onQueryChange)
  onQueryChangeRef.current = props.onQueryChange
  useEffect(() => setDraft(props.query), [props.query])
  useEffect(() => setBuilderAst(props.parsed.ast), [props.parsed.ast])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draft !== props.query) onQueryChangeRef.current(draft)
    }, 260)
    debounceRef.current = timer
    return () => {
      window.clearTimeout(timer)
      if (debounceRef.current === timer) debounceRef.current = null
    }
  }, [draft, props.query])
  const chips = useMemo(() => exploreQueryChips(props.parsed), [props.parsed])
  const accounts = useExploreAccounts(true)
  const attributeNames = useExploreAttributeNames(props.accountUid || '', true)
  const attributeValues = useExploreAttributeValues(activeValueField, activeValueKind, '', true)
  const visibleResults = props.results.filter((result) => activeTab === 'all' || result.type === activeTab)
  const documentOnly = activeTab !== 'all' && activeTab !== 'document'
  const updateQuery = (next: string) => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    setDraft(next)
    onQueryChangeRef.current(next)
  }
  const commitBuilderAst = (nextAst: ExploreQueryNode | null) => {
    setBuilderAst(nextAst)
    const nextQuery = serializeExploreBuilderQuery(nextAst, props.parsed.presentation)
    if (nextQuery !== props.query) updateQuery(nextQuery)
  }
  const updatePresentation = (presentation: ExplorePresentation) =>
    updateQuery(withPresentation(props.parsed.ast, presentation))
  const builtInColumns = ['title', 'space', 'path', 'updated', 'version']
  const availableColumns = [...builtInColumns, ...(attributeNames.data ?? [])]
  const selectedColumns = props.parsed.presentation.columns?.length
    ? props.parsed.presentation.columns
    : ['title', 'space', 'path', 'updated']
  const sortRules = props.parsed.presentation.sort ?? []
  const cycleSort = (key: string) => {
    const nextRules = cycleExploreSort(sortRules, key)
    updatePresentation({
      ...props.parsed.presentation,
      sort: nextRules.length ? nextRules : undefined,
    })
  }
  const cycleSortDirection = (key: string) => {
    const nextRules = sortRules.map((rule) =>
      rule.key === key
        ? {
            ...rule,
            direction: rule.direction === 'asc' ? ('desc' as const) : ('asc' as const),
          }
        : rule,
    )
    updatePresentation({
      ...props.parsed.presentation,
      sort: nextRules,
    })
  }
  const removeSort = (key: string) => {
    const nextRules = sortRules.filter((rule) => rule.key !== key)
    updatePresentation({
      ...props.parsed.presentation,
      sort: nextRules.length ? nextRules : undefined,
    })
  }
  const tableMode = props.parsed.presentation.view === 'table' && activeTab !== 'block' && activeTab !== 'comment'
  return (
    <main className={stylex.props(styles_4.sffc515b6).className || ''}>
      <header className={stylex.props(styles.s261b6cd6).className || ''}>
        <div className={stylex.props(styles.sbbe27b50).className || ''}>
          <div>
            <div className={stylex.props(styles_4.s1fa02c08).className || ''}>Explore</div>
            <h1 className={stylex.props(styles.s95e874dc).className || ''}>Advanced search</h1>
          </div>
          <ExploreScopePill
            context={props.context}
            contextLabel={props.contextLabel}
            accounts={accounts.data ?? []}
            onChange={props.onScopeChange}
          />
        </div>
        <Input
          value={draft}
          onChangeText={setDraft}
          placeholder="Search documents, blocks, conversations, and attributes"
          aria-label="Explore query"
          className={stylex.props(styles.s8cc1e96a).className || ''}
        />
        <div className={stylex.props(styles.sc5c9a492).className || ''}>
          <div className={stylex.props(styles.s86ff3e3).className || ''}>
            <Button
              size="sm"
              variant={props.parsed.presentation.view === 'table' ? 'secondary' : 'outline'}
              onClick={() =>
                updatePresentation({
                  ...props.parsed.presentation,
                  view: props.parsed.presentation.view === 'table' ? 'list' : 'table',
                })
              }
            >
              {props.parsed.presentation.view === 'table' ? 'Table' : 'List'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!tableMode}
              onClick={() => setColumnsOpen((open) => !open)}
              title={!tableMode ? 'Columns are available for document results.' : undefined}
            >
              Columns
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!tableMode}
              onClick={() => setSortOpen((open) => !open)}
              title={!tableMode ? 'Sorting is available for document results.' : undefined}
            >
              Sort{sortRules.length ? ` (${sortRules.length})` : ''}
            </Button>
          </div>
          {columnsOpen ? (
            <ExploreColumnsMenu
              columns={availableColumns}
              selected={selectedColumns}
              onToggle={(column) => {
                const next = toggleExploreColumn(selectedColumns, column)
                updatePresentation({
                  ...props.parsed.presentation,
                  columns: next.length ? next : ['title'],
                })
              }}
            />
          ) : null}
          {sortOpen ? (
            <ExploreSortMenu
              rules={sortRules}
              availableKeys={attributeNames.data ?? []}
              onCycleDirection={cycleSortDirection}
              onRemove={removeSort}
              onAdd={cycleSort}
            />
          ) : null}
          {(['type', 'in', 'attributes'] as const).map((kind) => (
            <div key={kind} className={stylex.props(styles.sdef3facc).className || ''}>
              <Button size="sm" variant="outline" onClick={() => setMenu(menu === kind ? null : kind)}>
                {kind[0]!.toUpperCase() + kind.slice(1)}
              </Button>
              {menu === kind ? (
                <ExploreFilterMenu
                  options={
                    kind === 'type'
                      ? ['type:document', 'type:block', 'type:comment']
                      : kind === 'in'
                        ? accounts.data?.map((account) => `in:${account.value}`) ?? []
                        : attributeNames.data?.map((name) => `has:${name}`) ?? []
                  }
                  activeTokens={chips.map((chip) => chip.token)}
                  onToggle={(predicate) => {
                    const next = toggleExplorePredicate(props.parsed, predicate)
                    updateQuery(serializeExploreQuery(next))
                    setMenu(null)
                  }}
                />
              ) : null}
            </div>
          ))}
          <Button
            size="sm"
            variant={advancedOpen ? 'secondary' : 'outline'}
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            Advanced
          </Button>
        </div>
        {chips.length ? (
          <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => updateQuery(serializeExploreQuery(removeExploreQueryChip(props.parsed, chip.id)))}
                className={stylex.props(styles_4.sc731bffd).className || ''}
              >
                {chip.label}
                <X className={stylex.props(styles.sca3de967).className || ''} aria-hidden />
              </button>
            ))}
            <button
              type="button"
              className={stylex.props(styles_4.sc4a3833e).className || ''}
              onClick={() => updateQuery('')}
            >
              Clear all
            </button>
          </div>
        ) : null}
        {props.diagnostics?.map((diagnostic, index) => (
          <p key={`${diagnostic.start}:${index}`} className={stylex.props(styles_4.s9f6fc75f).className || ''}>
            {diagnostic.message}
          </p>
        ))}
      </header>

      {advancedOpen ? (
        <ExploreBuilder
          ast={builderAst}
          attributeNames={attributeNames.data ?? []}
          attributeValues={attributeValues.data ?? []}
          accounts={accounts.data ?? []}
          context={props.context}
          presentation={props.parsed.presentation}
          onFocusValue={(field, kind) => {
            setActiveValueField(field)
            setActiveValueKind(kind)
          }}
          onChange={commitBuilderAst}
        />
      ) : null}

      <nav className={stylex.props(styles.sf64c667d).className || ''} role="tablist" aria-label="Explore result types">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              stylex.props(styles.s337d6708).className || '',
              stylex.props(activeTab === tab.id ? styles_4.s180f435a : styles_4.sce3543c7).className || '',
            )}
          >
            {tab.label} <span className={stylex.props(styles.sc5f26018).className || ''}>{props.counts[tab.id]}</span>
          </button>
        ))}
      </nav>

      <div className={stylex.props(styles.sbbe27b50).className || ''}>
        <div>
          <p className={stylex.props(styles.s9d4b128d).className || ''}>{props.counts[activeTab]} results</p>
          {documentOnly ? (
            <p className={stylex.props(styles.sa56e9200).className || ''}>Attribute sorting applies to documents.</p>
          ) : null}
        </div>
        <span className={stylex.props(styles.sa56e9200).className || ''}>
          {props.textTerms.length ? 'Text matches highlighted below' : 'Attribute query'}
        </span>
      </div>

      <section aria-live="polite" className={stylex.props(styles_2.sabad94a4).className || ''}>
        {props.isLoading || props.intersectionPending || props.isRefetching ? (
          visibleResults.length ? (
            <p className={stylex.props(styles.s4318b0f5).className || ''}>
              <Loader2 className={stylex.props(styles.s4d016d20).className || ''} aria-hidden />
              Updating results…
            </p>
          ) : (
            <ExploreState
              icon={<Loader2 className={stylex.props(styles.s3b858bae).className || ''} />}
              title="Searching"
              detail="Loading Explore results."
            />
          )
        ) : null}
        {props.error ? (
          <ExploreState icon={<Search />} title="Search failed" detail={props.error} tone="error" />
        ) : null}
        {!props.isLoading &&
        !props.intersectionPending &&
        !props.isRefetching &&
        !props.error &&
        !visibleResults.length ? (
          <ExploreState icon={<Search />} title="No results" detail="Try a broader search or remove a filter." />
        ) : null}
        {visibleResults.length && tableMode ? (
          <ExploreTable
            results={visibleResults.filter(
              (
                result,
              ): result is Extract<
                HMExploreResult,
                {
                  type: 'document'
                }
              > => result.type === 'document',
            )}
            columns={selectedColumns}
            sortRules={sortRules}
            onSort={cycleSort}
            onOpen={props.onOpenResult}
          />
        ) : visibleResults.length ? (
          <div
            className={
              stylex.props(
                styles_5.s1a01a0ed,
                styles_5.s436dc7b6,
                styles_5.s92852dd5,
                styles_5.sf799889b,
                styles_5.sad8c742c,
              ).className || ''
            }
          >
            {visibleResults.map((result) => (
              <ExploreResultRow
                key={
                  result.type === 'comment'
                    ? `${result.type}:${result.commentId}`
                    : `${result.type}:${exploreDocumentKey(result.id)}`
                }
                result={result}
                terms={props.textTerms}
                blocks={
                  result.type === 'document' ? props.blocksByDocument?.[exploreDocumentKey(result.id)] : undefined
                }
                onOpen={props.onOpenResult}
              />
            ))}
          </div>
        ) : null}
        {props.intersectionTruncated ? (
          <p className={stylex.props(styles.sd467b8c3).className || ''}>
            Some matches may be omitted because the document intersection reached its limit.
          </p>
        ) : null}
        {props.hasMore ? (
          <Button
            className={stylex.props(styles.saaee5cf7).className || ''}
            variant="outline"
            onClick={props.onLoadMore}
          >
            Load more
          </Button>
        ) : visibleResults.length ? (
          <p className={stylex.props(styles.sa843339a).className || ''}>End of results</p>
        ) : null}
      </section>
    </main>
  )
}
function ExploreFilterMenu({
  options,
  activeTokens,
  onToggle,
}: {
  options: string[]
  activeTokens: string[]
  onToggle: (predicate: string) => void
}) {
  return (
    <div className={stylex.props(styles_2.s48338369).className || ''}>
      {options.length ? (
        options.map((option) => (
          <button
            key={option}
            type="button"
            className={cn(
              stylex.props(styles_4.sacf3fbd8).className || '',
              stylex.props(activeTokens.includes(option) && styles_3.s856bab52).className || '',
            )}
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        ))
      ) : (
        <p className={stylex.props(styles.s3fa69aa1).className || ''}>No suggestions available.</p>
      )}
    </div>
  )
}
type BuilderNode = ExploreQueryNode
function builderPredicateIsComplete(predicate: ExplorePredicate) {
  if (predicate.kind === 'type') return Boolean(predicate.value)
  if (predicate.kind === 'scope') return Boolean(predicate.value.trim())
  if (predicate.operator === 'exists' || predicate.operator === 'missing') return Boolean(predicate.key.trim())
  return Boolean(predicate.key.trim() && 'value' in predicate && String(predicate.value).trim())
}
function serializableBuilderNode(node: ExploreQueryNode | null): ExploreQueryNode | null {
  if (!node || (node.kind === 'predicate' && !builderPredicateIsComplete(node.predicate))) return null
  if (node.kind === 'text' || node.kind === 'predicate') return node
  if (node.kind === 'not') {
    const child = serializableBuilderNode(node.child)
    return child
      ? {
          kind: 'not',
          child,
        }
      : null
  }
  const children = node.children.flatMap((child) => {
    const next = serializableBuilderNode(child)
    return next ? [next] : []
  })
  return children.length
    ? {
        ...node,
        children,
      }
    : null
}

/** Serializes the completed portion of a builder AST while retaining pending UI nodes locally. */
export function serializeExploreBuilderQuery(ast: ExploreQueryNode | null, presentation: ExplorePresentation) {
  return serializeExploreQuery({
    ast: serializableBuilderNode(ast),
    presentation,
    diagnostics: [],
  })
}
function appendExploreNode(ast: ExploreQueryNode | null, next: ExploreQueryNode): ExploreQueryNode {
  if (!ast) return next
  if (ast.kind === 'and')
    return {
      kind: 'and',
      children: [...ast.children, next],
    }
  return {
    kind: 'and',
    children: [ast, next],
  }
}
function withPresentation(ast: ExploreQueryNode | null, presentation: ExplorePresentation) {
  return serializeExploreQuery({
    ast,
    presentation,
    diagnostics: [],
  })
}
function predicateToDraft(predicate: ExplorePredicate): {
  field: string
  kind: 'comparison' | 'contains' | 'prefix' | 'exists' | 'missing'
  operator: '=' | '!=' | '<' | '<=' | '>' | '>='
  valueKind: 'string' | 'int' | 'bool'
  value: string
} {
  if (predicate.kind === 'scope') {
    return {
      field: predicate.scope === 'path' ? '$path' : '$space',
      kind: predicate.scope === 'path' && predicate.prefix ? 'prefix' : 'contains',
      operator: '=',
      valueKind: 'string',
      value: predicate.value,
    }
  }
  if (predicate.kind === 'type') {
    return {
      field: 'type',
      kind: 'contains',
      operator: '=',
      valueKind: 'string',
      value: predicate.value,
    }
  }
  if (predicate.operator === 'exists' || predicate.operator === 'missing')
    return {
      field: predicate.key,
      kind: predicate.operator,
      operator: '=',
      valueKind: 'string',
      value: '',
    }
  if (predicate.operator === 'contains' || predicate.operator === 'prefix')
    return {
      field: predicate.key,
      kind: predicate.operator,
      operator: '=',
      valueKind: 'string',
      value: predicate.value,
    }
  if (predicate.operator !== 'comparison')
    return {
      field: predicate.key,
      kind: 'contains',
      operator: '=',
      valueKind: 'string',
      value: '',
    }
  return {
    field: predicate.key,
    kind: 'comparison',
    operator: predicate.comparison,
    valueKind: typeof predicate.value === 'number' ? 'int' : typeof predicate.value === 'boolean' ? 'bool' : 'string',
    value: String(predicate.value),
  }
}
function draftToPredicate(
  field: string,
  kind: 'comparison' | 'contains' | 'prefix' | 'exists' | 'missing',
  operator: '=' | '!=' | '<' | '<=' | '>' | '>=',
  valueKind: 'string' | 'int' | 'bool',
  value: string,
): ExplorePredicate | null {
  if (!field.trim()) return null
  if (field === 'type' && ['document', 'block', 'comment'].includes(value))
    return {
      kind: 'type',
      value: value as HMExploreResultType,
    }
  if (field === '$space')
    return {
      kind: 'scope',
      scope: 'space',
      value: value.trim(),
    }
  if (field === '$path')
    return {
      kind: 'scope',
      scope: 'path',
      value: value.trim() || '/',
      prefix: kind === 'prefix',
    }
  if (kind === 'exists' || kind === 'missing')
    return {
      kind: 'attribute',
      key: field.trim(),
      operator: kind,
    }
  if (!value.trim()) return null
  if (kind === 'contains' || kind === 'prefix')
    return {
      kind: 'attribute',
      key: field.trim(),
      operator: kind,
      value,
    }
  const typedValue = valueKind === 'int' ? Number(value) : valueKind === 'bool' ? value === 'true' : value
  return {
    kind: 'attribute',
    key: field.trim(),
    operator: 'comparison',
    comparison: operator,
    value: typedValue,
  }
}
function ExploreBuilder({
  ast,
  attributeNames,
  attributeValues,
  accounts,
  context,
  presentation,
  onFocusValue,
  onChange,
}: {
  ast: ExploreQueryNode | null
  attributeNames: string[]
  attributeValues: string[]
  accounts: Array<{
    value: string
    label: string
  }>
  context: HMExploreContext
  presentation: ExplorePresentation
  onFocusValue: (field: string, kind: 'string' | 'int' | 'bool') => void
  onChange: (ast: ExploreQueryNode | null) => void
}) {
  if (!ast) {
    return (
      <section className={stylex.props(styles_4.sbc6aa5c0).className || ''}>
        <BuilderToolbar onAdd={(node) => onChange(node)} />
      </section>
    )
  }
  return (
    <section className={stylex.props(styles_4.sfd476430).className || ''}>
      <div className={stylex.props(styles.s78289774).className || ''}>
        <div>
          <p className={stylex.props(styles_4.s418b62ed).className || ''}>Query builder</p>
          <p className={stylex.props(styles.sabdedac1).className || ''}>
            Edit document conditions without losing text or presentation directives.
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => onChange(clearExploreConditions(ast))}>
          Clear conditions
        </Button>
      </div>
      <BuilderNodeEditor
        node={ast}
        path={[]}
        attributeNames={attributeNames}
        attributeValues={attributeValues}
        accounts={accounts}
        onFocusValue={onFocusValue}
        onChange={onChange}
      />
      <BuilderToolbar onAdd={(node) => onChange(appendExploreNode(ast, node))} />
      <details className={stylex.props(styles.s5d77118).className || ''}>
        <summary className={stylex.props(styles.s76945554).className || ''}>Request preview</summary>
        <pre className={stylex.props(styles_4.s889eda3b).className || ''}>
          {JSON.stringify(
            new QueryDocumentsRequest({
              filter: compileExploreQuery(
                {
                  ast,
                  presentation,
                  diagnostics: [],
                },
                context,
              ).filter,
              sort: (presentation.sort ?? []).map(
                (rule) =>
                  new DocumentSort({
                    key: rule.key,
                    descending: rule.direction === 'desc',
                  }),
              ),
            }).toJson(),
            null,
            2,
          )}
        </pre>
      </details>
    </section>
  )
}
function BuilderToolbar({onAdd}: {onAdd: (node: ExploreQueryNode) => void}) {
  return (
    <div className={stylex.props(styles.se658ac14).className || ''}>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onAdd({
            kind: 'predicate',
            predicate: {
              kind: 'attribute',
              key: '',
              operator: 'contains',
              value: '',
            },
          })
        }
      >
        Add condition
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onAdd({
            kind: 'and',
            children: [],
          })
        }
      >
        Add group
      </Button>
    </div>
  )
}
function BuilderNodeEditor({
  node,
  path,
  attributeNames,
  attributeValues,
  accounts,
  onFocusValue,
  onChange,
}: {
  node: BuilderNode
  path: number[]
  attributeNames: string[]
  attributeValues: string[]
  accounts: Array<{
    value: string
    label: string
  }>
  onFocusValue: (field: string, kind: 'string' | 'int' | 'bool') => void
  onChange: (ast: ExploreQueryNode | null) => void
}) {
  const replace = (next: ExploreQueryNode | null) => onChange(next)
  if (node.kind === 'text') {
    return <div className={stylex.props(styles_4.sc65561ab).className || ''}>Text: {node.value || '(empty)'}</div>
  }
  if (node.kind === 'predicate') {
    const draft = predicateToDraft(node.predicate)
    return (
      <BuilderCondition
        draft={draft}
        attributeNames={attributeNames}
        attributeValues={attributeValues}
        accounts={accounts}
        onFocusValue={onFocusValue}
        onChange={(next) =>
          replace(
            next
              ? {
                  kind: 'predicate',
                  predicate: next,
                }
              : null,
          )
        }
        onRemove={() => replace(null)}
      />
    )
  }
  if (node.kind === 'not') {
    return (
      <div className={stylex.props(styles.s9cddff9f).className || ''}>
        <div className={stylex.props(styles.s97ff1ece).className || ''}>
          <div className={stylex.props(styles.sb2f68493).className || ''}>Not</div>
          <Button size="xs" variant="ghost" onClick={() => onChange(node.child)}>
            Remove Not
          </Button>
        </div>
        <BuilderNodeEditor
          node={node.child}
          path={[...path, 0]}
          attributeNames={attributeNames}
          attributeValues={attributeValues}
          accounts={accounts}
          onFocusValue={onFocusValue}
          onChange={(next) =>
            onChange(
              next
                ? {
                    kind: 'not',
                    child: next,
                  }
                : null,
            )
          }
        />
      </div>
    )
  }
  return (
    <div className={stylex.props(styles.sc1c9c63d).className || ''}>
      <div className={stylex.props(styles.sbbe27b4f).className || ''}>
        <Select
          value={node.kind}
          onValueChange={(mode) =>
            onChange(
              mode === 'not'
                ? {
                    kind: 'not',
                    child: node,
                  }
                : {
                    ...node,
                    kind: mode as 'and' | 'or',
                  },
            )
          }
        >
          <SelectTrigger size="sm" className={stylex.props(styles.s36c758).className || ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and">All</SelectItem>
            <SelectItem value="or">Any</SelectItem>
            <SelectItem value="not">Not</SelectItem>
          </SelectContent>
        </Select>
        <div className={stylex.props(styles.se658ac13).className || ''}>
          <Button
            size="xs"
            variant="outline"
            onClick={() =>
              onChange({
                kind: node.kind,
                children: [
                  ...node.children,
                  {
                    kind: 'predicate',
                    predicate: {
                      kind: 'attribute',
                      key: '',
                      operator: 'exists',
                    },
                  },
                ],
              })
            }
          >
            Add condition
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() =>
              onChange({
                kind: node.kind,
                children: [
                  ...node.children,
                  {
                    kind: 'and',
                    children: [],
                  },
                ],
              })
            }
          >
            Add group
          </Button>
          {path.length ? (
            <Button size="xs" variant="ghost" onClick={() => replace(clearExploreConditions(node))}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {node.children.map((child, index) => (
        <BuilderNodeEditor
          key={`${path.join('.')}.${index}`}
          node={child}
          path={[...path, index]}
          attributeNames={attributeNames}
          attributeValues={attributeValues}
          accounts={accounts}
          onFocusValue={onFocusValue}
          onChange={(next) => {
            const children = [...node.children]
            if (next) children[index] = next
            else children.splice(index, 1)
            onChange(
              children.length
                ? {
                    ...node,
                    children,
                  }
                : null,
            )
          }}
        />
      ))}
    </div>
  )
}
function BuilderCondition({
  draft,
  attributeNames,
  attributeValues,
  accounts,
  onFocusValue,
  onChange,
  onRemove,
}: {
  draft: ReturnType<typeof predicateToDraft>
  attributeNames: string[]
  attributeValues: string[]
  accounts: Array<{
    value: string
    label: string
  }>
  onFocusValue: (field: string, kind: 'string' | 'int' | 'bool') => void
  onChange: (predicate: ExplorePredicate | null) => void
  onRemove: () => void
}) {
  const [field, setField] = useState(draft.field)
  const [kind, setKind] = useState(draft.kind)
  const [operator, setOperator] = useState(draft.operator)
  const [valueKind, setValueKind] = useState(draft.valueKind)
  const [value, setValue] = useState(draft.value)
  useEffect(() => {
    setField(draft.field)
    setKind(draft.kind)
    setOperator(draft.operator)
    setValueKind(draft.valueKind)
    setValue(draft.value)
  }, [draft.field, draft.kind, draft.operator, draft.valueKind, draft.value])
  const commit = (next: Partial<typeof draft>) => {
    const merged = {
      field,
      kind,
      operator,
      valueKind,
      value,
      ...next,
    }
    setField(merged.field)
    setKind(merged.kind)
    setOperator(merged.operator)
    setValueKind(merged.valueKind)
    setValue(merged.value)
    onChange(draftToPredicate(merged.field, merged.kind, merged.operator, merged.valueKind, merged.value))
  }
  return (
    <div className={stylex.props(styles.s2e13e93d).className || ''}>
      <ExploreAutocomplete
        value={field}
        options={[...attributeNames, '$space', '$path']}
        onChange={(next) =>
          commit({
            field: next,
          })
        }
        placeholder="field"
        className={stylex.props(styles.s335ce1).className || ''}
      />
      <Select
        value={kind}
        onValueChange={(next) =>
          commit({
            kind: next as typeof kind,
          })
        }
      >
        <SelectTrigger size="sm" className={stylex.props(styles.s36c75c).className || ''}>
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
      {kind === 'comparison' ? (
        <Select
          value={operator}
          onValueChange={(next) =>
            commit({
              operator: next as typeof operator,
            })
          }
        >
          <SelectTrigger size="sm" className={stylex.props(styles.s36c73b).className || ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['=', '!=', '<', '<=', '>', '>='].map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {kind !== 'exists' && kind !== 'missing' ? (
        <Select
          value={valueKind}
          onValueChange={(next) =>
            commit({
              valueKind: next as typeof valueKind,
            })
          }
        >
          <SelectTrigger size="sm" className={stylex.props(styles.s36c758).className || ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">Text</SelectItem>
            <SelectItem value="int">Integer</SelectItem>
            <SelectItem value="bool">Boolean</SelectItem>
          </SelectContent>
        </Select>
      ) : null}
      {kind !== 'exists' && kind !== 'missing' ? (
        <ExploreAutocomplete
          value={value}
          options={attributeValues.length ? attributeValues : accounts.map((account) => account.value)}
          onFocus={() => onFocusValue(field, valueKind)}
          onChange={(next) =>
            commit({
              value: next,
            })
          }
          placeholder="value"
          className={stylex.props(styles_2.sdb36c0db).className || ''}
        />
      ) : null}
      <Button size="iconSm" variant="ghost" aria-label="Remove condition" onClick={onRemove}>
        ×
      </Button>
    </div>
  )
}
function ExploreAutocomplete({
  value,
  options,
  onChange,
  onFocus,
  placeholder,
  className,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
  onFocus?: () => void
  placeholder: string
  className?: string
}) {
  const store = Ariakit.useComboboxStore({
    value,
    setValue: onChange,
  })
  const query = value.trim().toLocaleLowerCase()
  const suggestions = options.filter((option) => !query || option.toLocaleLowerCase().includes(query)).slice(0, 50)
  return (
    <div className={[stylex.props(styles_2.s4e12b012).className || '', className].filter(Boolean).join(' ')}>
      <Ariakit.Combobox
        store={store}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className={cn(stylex.props(styles_4.s44828117).className || '', className)}
      />
      <Ariakit.ComboboxPopover
        store={store}
        gutter={4}
        sameWidth
        className={stylex.props(styles_2.sf757653).className || ''}
      >
        {suggestions.map((suggestion) => (
          <Ariakit.ComboboxItem
            key={suggestion}
            store={store}
            value={suggestion}
            className={[stylex.props(styles_4.s7804e73).className || '', className].filter(Boolean).join(' ')}
          />
        ))}
      </Ariakit.ComboboxPopover>
    </div>
  )
}
function tableCellValue(
  result: Extract<
    HMExploreResult,
    {
      type: 'document'
    }
  >,
  column: string,
) {
  const document = result.document
  if (column === 'title') return document?.metadata?.name || result.matchText || 'Untitled'
  if (column === 'space') return result.id.uid
  if (column === 'path') return `/${result.id.path?.join('/') || ''}`
  if (column === 'updated') return result.versionTime || '—'
  if (column === 'version') return result.id.version || '—'
  let value: unknown = document?.metadata
  for (const segment of column.split('.')) {
    if (!value || typeof value !== 'object') return '—'
    value = (value as Record<string, unknown>)[segment]
  }
  return value === undefined || value === null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)
}
function ExploreTable({
  results,
  columns,
  sortRules,
  onSort,
  onOpen,
}: {
  results: Extract<
    HMExploreResult,
    {
      type: 'document'
    }
  >[]
  columns: string[]
  sortRules: ExploreSortRule[]
  onSort: (key: string) => void
  onOpen: (result: HMExploreResult) => void
}) {
  return (
    <div className={stylex.props(styles.s2fb76463).className || ''}>
      <table className={stylex.props(styles_2.s6997be87).className || ''}>
        <thead className={stylex.props(styles_4.s662f878d).className || ''}>
          <tr>
            {columns.map((column) => {
              const sort = sortRules.find((rule) => rule.key === column)
              const sortable = !['title', 'space', 'path', 'updated', 'version'].includes(column)
              return (
                <th key={column} className={stylex.props(styles.sc3e0f3e2).className || ''}>
                  <button
                    type="button"
                    className={cn(
                      stylex.props(styles.s4f7ac506).className || '',
                      stylex.props(sortable ? styles_4.s899a5760 : styles_4.s3b7916ca).className || '',
                    )}
                    disabled={!sortable}
                    onClick={() => onSort(column)}
                    aria-label={sortable ? `Sort by ${column}` : undefined}
                  >
                    {column}
                    {sort ? (
                      <span className={stylex.props(styles.s332783).className || ''}>
                        {sort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    ) : null}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={exploreDocumentKey(result.id)} className={stylex.props(styles_4.s2dc5299d).className || ''}>
              {columns.map((column) => (
                <td key={column} className={stylex.props(styles_2.saf406c44).className || ''}>
                  {column === 'title' ? (
                    <button
                      type="button"
                      className={stylex.props(styles_4.s30a15a48).className || ''}
                      onClick={() => onOpen(result)}
                    >
                      {tableCellValue(result, column)}
                    </button>
                  ) : (
                    tableCellValue(result, column)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function ExploreResultRow({
  result,
  terms,
  blocks,
  onOpen,
}: {
  result: HMExploreResult
  terms: string[]
  blocks?: Extract<
    HMExploreResult,
    {
      type: 'block'
    }
  >[]
  onOpen: (result: HMExploreResult) => void
}) {
  const title =
    result.type === 'document'
      ? result.document?.metadata?.name || result.matchText || packHmId(result.id)
      : result.breadcrumb?.at(-1) || (result.type === 'comment' ? 'Conversation' : 'Text block')
  const Icon = result.type === 'document' ? FileText : result.type === 'block' ? Pilcrow : MessageSquare
  return (
    <article className={stylex.props(styles_4.sb30c8f14).className || ''}>
      <button type="button" className={stylex.props(styles.sbdcf888f).className || ''} onClick={() => onOpen(result)}>
        <span className={stylex.props(styles.s87a7d048).className || ''}>
          <Icon className={stylex.props(styles.sca3de968).className || ''} />
        </span>
        <span className={stylex.props(styles_2.se30fd43e).className || ''}>
          <span className={stylex.props(styles.s86ff3e4).className || ''}>
            <span className={stylex.props(styles.sf56ac00b).className || ''}>{highlightExploreText(title, terms)}</span>
            <span className={stylex.props(styles_4.s1325ab8d).className || ''}>{result.type}</span>
          </span>
          <span className={stylex.props(styles.sd45be9ae).className || ''}>
            {result.breadcrumb?.join(' · ') || 'Explore result'}
            {result.versionTime ? ` · ${new Date(result.versionTime).toLocaleDateString()}` : ''}
          </span>
          {result.matchText ? (
            <span className={stylex.props(styles.s66d9f4dd).className || ''}>
              {highlightExploreText(result.matchText, terms)}
            </span>
          ) : null}
          {result.matchedFields?.length ? (
            <span className={stylex.props(styles.sd44866c).className || ''}>
              {result.matchedFields.map((field) => (
                <span key={field.label} className={stylex.props(styles_4.s505fb8b).className || ''}>
                  {field.label} {field.value}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      </button>
      {blocks?.length ? (
        <div className={stylex.props(styles.s3bb14b3e).className || ''}>
          <p className={stylex.props(styles.sb2f68493).className || ''}>{blocks.length} matching blocks</p>
          {blocks.map((block) => (
            <div key={packHmId(block.id)} className={stylex.props(styles.s8dd19d6b).className || ''}>
              <p className={stylex.props(styles.sf2718385).className || ''}>
                {highlightExploreText(block.matchText || '', terms)}
              </p>
              <button
                type="button"
                className={stylex.props(styles.sd1dfa3c9).className || ''}
                onClick={() => onOpen(block)}
              >
                Jump to source
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}
function ExploreState({icon, title, detail, tone}: {icon: ReactNode; title: string; detail: string; tone?: 'error'}) {
  return (
    <div
      className={cn(
        stylex.props(styles_4.s67840439).className || '',
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
