import * as stylex from '@stylexjs/stylex'
import {
  AlertCircle,
  ArrowRight,
  Binary,
  Braces,
  ChevronRight,
  Copy,
  RefreshCw,
  Search,
  Sparkles,
  TerminalSquare,
  Unplug,
} from 'lucide-react'
import {type ReactNode, useDeferredValue, useEffect, useState} from 'react'
import {
  buildApiRequestPreview,
  createStarterPayload,
  executeApiRequest,
  resolveSchemaNode,
  type ApiExecutionResult,
  type ApiSchemaDefinition,
  type ApiSchemaIndex,
  type ApiSchemaRouteSummary,
  type JSONSchemaNode,
} from '@shm/shared/api-lab'
import DataViewer from './data-viewer'
import {cn} from './utils'
const styles_8 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s3f582e10: {
    minHeight: '0px',
  },
  sb42feb5d: {
    flex: '1',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
})
const styles_7 = stylex.create({
  sc7133e99: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
  },
  sc7133e9a: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 5)',
  },
  sc7133e97: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
  },
})
const styles_6 = stylex.create({
  s18d815cb: {
    borderColor: 'oklch(87.1% 0.006 286.286)',
  },
  s4e1b8250: {
    backgroundColor: 'oklch(96.7% 0.001 286.375)',
  },
  s9df2e12d: {
    color: 'oklch(44.2% 0.017 285.786)',
  },
  s9df2d5ea: {
    color: 'oklch(87.1% 0.006 286.286)',
  },
  s5d5bba5c: {
    backgroundColor: 'oklch(98.5% 0 none)',
  },
  s9df2ed0b: {
    color: 'oklch(14.1% 0.005 285.823)',
  },
  s9df2dd6c: {
    color: 'oklch(55.2% 0.016 285.938)',
  },
})
const styles_5 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  s93b5f015: {
    alignItems: 'flex-start',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  sf7998a14: {
    borderRadius: 'calc(var(--radius) + 4px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56f: {
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  s993b6d55: {
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s18d8120a: {
    borderColor: 'oklch(92% 0.004 286.32)',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s33458b: {
    marginTop: 'calc(0.25rem * 1)',
  },
  s18c0f: {
    height: 'calc(0.25rem * 4)',
  },
  s1c45e: {
    width: 'calc(0.25rem * 4)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s62c182b1: {
    fontWeight: '600',
  },
  s8a6c2ac8: {
    boxShadow: 'var(--shadow-xs)',
  },
  s9b8736ad: {
    display: 'inline-flex',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sd52b2d2: {
    textTransform: 'uppercase',
  },
  sbad092cd: {
    letterSpacing: '0.16em',
  },
  sc5cf0034: {
    paddingInline: 'calc(0.25rem * 2.5)',
  },
  s34b56d: {
    paddingBlock: 'calc(0.25rem * 1)',
  },
  s55426dfb: {
    fontSize: '10px',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  s5542e25a: {
    fontSize: '11px',
  },
  sbacfaa0f: {
    letterSpacing: '0.14em',
  },
})
const styles_4 = stylex.create({
  s345f19: {
    paddingBottom: 'calc(0.25rem * 4)',
  },
  s33458e: {
    marginTop: 'calc(0.25rem * 4)',
  },
})
const styles_3 = stylex.create({
  sff8f1a60: {
    display: 'grid',
    minHeight: 'calc(var(--spacing) * 0)',
    flex: '1',
    gap: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 1280px))': {
      gridTemplateColumns: '20rem minmax(0,1fr)',
    },
  },
  sadfa990e: {
    pointerEvents: 'none',
    position: 'absolute',
    top: '50%',
    left: 'calc(var(--spacing) * 4)',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
    color: 'var(--color-zinc-400)',
  },
  s81e9186b: {
    width: '100%',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--color-zinc-200)',
    backgroundColor: 'var(--color-white)',
    paddingInline: 'calc(var(--spacing) * 11)',
    paddingBlock: 'calc(var(--spacing) * 3)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    color: 'var(--color-zinc-900)',
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    outlineStyle: 'none',
    ':focus': {
      borderColor: 'var(--color-zinc-400)',
      boxShadow: '0 0 0 4px currentcolor',
    },
  },
  s93ff291b: {
    display: 'grid',
    gap: 'calc(var(--spacing) * 3)',
    '@media ((min-width: 768px))': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
  s3b628783: {
    display: 'grid',
    gap: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 1536px))': {
      gridTemplateColumns: 'minmax(0,1.15fr) minmax(20rem,0.85fr)',
    },
  },
  s25d912ff: {
    minHeight: '24rem',
    width: '100%',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'color-mix(in oklab, var(--color-zinc-900) 10%, transparent)',
    backgroundColor: 'var(--color-zinc-950)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 4)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'calc(var(--spacing) * 6)',
    color: 'var(--color-zinc-100)',
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    outlineStyle: 'none',
    ':focus': {
      borderColor: 'var(--color-zinc-400)',
      boxShadow: '0 0 0 4px currentcolor',
    },
  },
  s1032c15: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'var(--color-zinc-900)',
    paddingInline: 'calc(var(--spacing) * 5)',
    paddingBlock: 'calc(var(--spacing) * 3)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-white)',
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-zinc-800)',
      },
    },
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: 'var(--color-zinc-300)',
      color: 'var(--color-zinc-500)',
      borderColor: 'var(--color-zinc-100)',
    },
  },
  s9e30e4d6: {
    display: 'grid',
    gap: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 1280px))': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  sb2919a5a: {
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.24em',
    color: 'var(--color-zinc-500)',
    textTransform: 'uppercase',
  },
  se2a13966: {
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'var(--color-rose-100)',
    paddingInline: 'calc(var(--spacing) * 2.5)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    fontSize: '11px',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.16em',
    color: 'var(--color-rose-700)',
    textTransform: 'uppercase',
  },
  s3e1fe971: {
    marginTop: 'calc(var(--spacing) * 3)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    letterSpacing: '0.18em',
    color: 'var(--color-zinc-500)',
    textTransform: 'uppercase',
  },
  sea7985bd: {
    marginBottom: 'calc(var(--spacing) * 3)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.2em',
    color: 'var(--color-zinc-500)',
    textTransform: 'uppercase',
  },
  s3ba25e7c: {
    overflow: 'hidden',
    borderRadius: 'var(--radius-2xl)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--color-zinc-200)',
    backgroundColor: 'var(--color-white)',
    padding: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 640px))': {
      padding: 'calc(var(--spacing) * 6)',
    },
  },
  s28557fb9: {
    marginBottom: 'calc(var(--spacing) * 5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: 'var(--color-zinc-100)',
    paddingBottom: 'calc(var(--spacing) * 5)',
    '@media ((min-width: 640px))': {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
  },
  s75d5b7d6: {
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.28em',
    color: 'var(--color-zinc-500)',
    textTransform: 'uppercase',
  },
  s34adeb3: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--color-zinc-200)',
    backgroundColor: 'var(--color-white)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-zinc-700)',
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'var(--color-zinc-300)',
        backgroundColor: 'var(--color-zinc-50)',
      },
    },
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: 'var(--color-zinc-300)',
      color: 'var(--color-zinc-400)',
      borderColor: 'var(--color-zinc-100)',
    },
  },
  s68f952f8: {
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.2em',
    color: 'var(--color-zinc-500)',
    textTransform: 'uppercase',
  },
  sfea8a514: {
    fontSize: '11px',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.18em',
    color: 'var(--color-zinc-500)',
    textTransform: 'uppercase',
  },
  sb18494ac: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
})
const styles_2 = stylex.create({
  s5e9c6c57: {
    marginInline: 'auto',
    display: 'flex',
    height: '100%',
    minHeight: 'calc(0.25rem * 0)',
    width: '100%',
    maxWidth: '80rem',
    flexDirection: 'column',
  },
  s3f582e10: {
    minHeight: 'calc(0.25rem * 0)',
  },
  sb04cd461: {
    display: 'flex',
    height: '100%',
    minHeight: 'calc(0.25rem * 0)',
    flexDirection: 'column',
  },
  sef2be82b: {
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    overflowY: 'auto',
    paddingRight: 'calc(0.25rem * 1)',
  },
  sa11c0168: {
    minHeight: 'calc(0.25rem * 0)',
    overflowY: 'auto',
    paddingRight: 'calc(0.25rem * 1)',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
})
const styles = stylex.create({
  sd63a8a39: {
    position: 'relative',
    display: 'block',
  },
  s1fa2d8e6: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  se80bcbd2: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  se80bcbd3: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 3)',
  },
  s2b64fb66: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    animation: 'spin 1s linear infinite',
  },
  sa5279f8a: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.2% 0.016 285.938)',
  },
  s46c30091: {
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    backgroundColor: 'oklch(98.5% 0 0)',
    padding: 'calc(0.25rem * 4)',
  },
  sa0e0d57d: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(27.4% 0.006 286.033)',
  },
  s8dc64edf: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(21% 0.006 285.885)',
  },
  s4768be23: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(76.9% 0.188 70.08)',
  },
  sc4e66034: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(44.2% 0.017 285.786)',
  },
  sf4bc5bd8: {
    display: 'inline-flex',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    backgroundColor: 'oklch(96.7% 0.001 286.375)',
    padding: 'calc(0.25rem * 1)',
  },
  sf4b54005: {
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    backgroundColor: 'oklch(98.5% 0 0)',
  },
  s482ba5c7: {
    cursor: 'pointer',
    listStyleType: 'none',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(27.4% 0.006 286.033)',
  },
  sb5fcaba7: {
    overflowX: 'auto',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 4)',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(37% 0.013 285.805)',
  },
  s309c1ac6: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.2% 0.016 285.938)',
  },
  s9f5ea161: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(68.5% 0.169 237.323)',
  },
  s3ffc2aef: {
    marginTop: 'calc(0.25rem * 4)',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sb399e9e6: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    color: 'oklch(70.5% 0.015 286.067)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s79b4711b: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(21% 0.006 285.885)',
  },
  sc2fd7247: {
    marginTop: 'calc(0.25rem * 2)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    wordBreak: 'break-all',
    color: 'oklch(55.2% 0.016 285.938)',
  },
  sf8d612f7: {
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(21% 0.006 285.885)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '600',
    color: '#fff',
  },
  s357fc043: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(44.2% 0.017 285.786)',
  },
  scbcc2085: {
    marginTop: 'calc(0.25rem * 3)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)',
  },
  sd71515ff: {
    marginLeft: 'calc(0.25rem * 2)',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(92% 0.004 286.32)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0em',
    color: 'oklch(27.4% 0.006 286.033)',
    textTransform: 'none',
  },
  s3a19df69: {
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(87.1% 0.006 286.286)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
  },
  sd432b4bb: {
    marginTop: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(87.1% 0.006 286.286)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
  },
  sf67243d5: {
    marginTop: 'calc(0.25rem * 4)',
    overflowX: 'auto',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(37% 0.013 285.805)',
  },
  s2b839648: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '600',
    letterSpacing: '-0.025em',
    color: 'oklch(14.1% 0.005 285.823)',
  },
  sb7a80442: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(44.2% 0.017 285.786)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s85de826b: {
    marginTop: 'calc(0.25rem * 3)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(21% 0.006 285.885)',
  },
  s2c815aea: {
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sbb5ba128: {
    marginTop: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(27.4% 0.006 286.033)',
  },
  s5ab913f5: {
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(89.2% 0.058 10.001)',
    backgroundColor: 'oklch(96.9% 0.015 12.422)',
    padding: 'calc(0.25rem * 4)',
    color: 'oklch(45.5% 0.188 13.697)',
  },
  s69f644cf: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
  },
  s9097ff5: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
  },
  se6fec38: {
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(89.2% 0.058 10.001)',
    backgroundColor: 'oklch(96.9% 0.015 12.422)',
    padding: 'calc(0.25rem * 6)',
    color: 'oklch(41% 0.159 10.272)',
  },
  sd6b3e1b6: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
  },
  s44342515: {
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(87.1% 0.006 286.286)',
    backgroundColor: 'oklch(98.5% 0 0)',
    padding: 'calc(0.25rem * 6)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(55.2% 0.016 285.938)',
  },
})
type ApiInspectorProps = {
  apiHost: string
}

/** Renders a desktop-friendly API lab for inspecting and executing every local API endpoint. */
export function ApiInspector({apiHost}: ApiInspectorProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [routeFilter, setRouteFilter] = useState('')
  const deferredRouteFilter = useDeferredValue(routeFilter)
  const [schemaIndex, setSchemaIndex] = useState<ApiSchemaIndex | null>(null)
  const [isIndexLoading, setIsIndexLoading] = useState(true)
  const [indexError, setIndexError] = useState<string | null>(null)
  const [schemaDefinitions, setSchemaDefinitions] = useState<Record<string, ApiSchemaDefinition>>({})
  const [loadingDefinitionKey, setLoadingDefinitionKey] = useState<string | null>(null)
  const [definitionError, setDefinitionError] = useState<string | null>(null)
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, ApiExecutionResult>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [schemaTab, setSchemaTab] = useState<'input' | 'output'>('input')
  useEffect(() => {
    setResults({})
    setRunError(null)
  }, [apiHost])
  useEffect(() => {
    const abortController = new AbortController()
    setIsIndexLoading(true)
    setIndexError(null)
    setDefinitionError(null)
    setSchemaDefinitions({})
    setSelectedKey(null)
    fetch(buildAbsoluteUrl(apiHost, '/api/schema'), {
      signal: abortController.signal,
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} loading /api/schema`)
        }
        return (await response.json()) as ApiSchemaIndex
      })
      .then((nextIndex) => {
        setSchemaIndex(nextIndex)
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return
        }
        setSchemaIndex(null)
        setIndexError(getErrorMessage(error))
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsIndexLoading(false)
        }
      })
    return () => abortController.abort()
  }, [apiHost])
  useEffect(() => {
    const routes = schemaIndex?.routes ?? []
    if (!routes.length) {
      return
    }
    if (selectedKey && routes.some((route) => route.key === selectedKey)) {
      return
    }
    setSelectedKey(routes[0]?.key ?? null)
  }, [schemaIndex, selectedKey])
  useEffect(() => {
    if (!selectedKey || schemaDefinitions[selectedKey]) {
      return
    }
    const abortController = new AbortController()
    setLoadingDefinitionKey(selectedKey)
    setDefinitionError(null)
    setSchemaTab('input')
    fetch(buildAbsoluteUrl(apiHost, `/api/schema?key=${encodeURIComponent(selectedKey)}`), {
      signal: abortController.signal,
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} loading schema for ${selectedKey}`)
        }
        return (await response.json()) as ApiSchemaDefinition
      })
      .then((definition) => {
        setSchemaDefinitions((currentDefinitions) => ({
          ...currentDefinitions,
          [definition.key]: definition,
        }))
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return
        }
        setDefinitionError(getErrorMessage(error))
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoadingDefinitionKey(null)
        }
      })
    return () => abortController.abort()
  }, [apiHost, schemaDefinitions, selectedKey])
  const selectedDefinition = selectedKey ? schemaDefinitions[selectedKey] : undefined
  useEffect(() => {
    if (!selectedDefinition) {
      return
    }
    setDraftInputs((currentDrafts) => {
      if (currentDrafts[selectedDefinition.key] !== undefined) {
        return currentDrafts
      }
      return {
        ...currentDrafts,
        [selectedDefinition.key]: formatJsonValue(
          createStarterPayload(selectedDefinition.inputSchema, selectedDefinition.inputSchema),
        ),
      }
    })
  }, [selectedDefinition])
  const filteredRoutes = (schemaIndex?.routes ?? []).filter((route) => {
    const query = deferredRouteFilter.trim().toLowerCase()
    if (!query) {
      return true
    }
    return (
      route.key.toLowerCase().includes(query) ||
      route.path.toLowerCase().includes(query) ||
      route.kind.toLowerCase().includes(query)
    )
  })
  const selectedInput = selectedKey ? draftInputs[selectedKey] ?? '' : ''
  const selectedResult = selectedKey ? results[selectedKey] : undefined
  let previewError: string | null = null
  let preview: ReturnType<typeof buildApiRequestPreview> | undefined
  if (selectedDefinition && selectedInput) {
    try {
      preview = buildApiRequestPreview(apiHost, selectedDefinition, selectedInput)
    } catch (error) {
      previewError = getErrorMessage(error)
    }
  }
  const activeSchema =
    selectedDefinition && schemaTab === 'input' ? selectedDefinition.inputSchema : selectedDefinition?.outputSchema
  async function handleRunRequest() {
    if (!selectedDefinition || !selectedKey) {
      return
    }
    setIsRunning(true)
    setRunError(null)
    try {
      const result = await executeApiRequest(apiHost, selectedDefinition, draftInputs[selectedKey] ?? '')
      setResults((currentResults) => ({
        ...currentResults,
        [selectedKey]: result,
      }))
    } catch (error) {
      setRunError(getErrorMessage(error))
    } finally {
      setIsRunning(false)
    }
  }
  function handleRouteSelection(route: ApiSchemaRouteSummary) {
    setSelectedKey(route.key)
  }
  function handleInputReset() {
    if (!selectedDefinition) {
      return
    }
    setDraftInputs((currentDrafts) => ({
      ...currentDrafts,
      [selectedDefinition.key]: formatJsonValue(
        createStarterPayload(selectedDefinition.inputSchema, selectedDefinition.inputSchema),
      ),
    }))
    setRunError(null)
  }
  function handleFormatJson() {
    if (!selectedKey) {
      return
    }
    try {
      setDraftInputs((currentDrafts) => ({
        ...currentDrafts,
        [selectedKey]: formatJsonValue(JSON.parse(currentDrafts[selectedKey] ?? '')),
      }))
      setRunError(null)
    } catch (error) {
      setRunError(getErrorMessage(error))
    }
  }
  function handleCopyPreviewUrl() {
    if (!preview) {
      return
    }
    navigator.clipboard.writeText(preview.url)
  }
  return (
    <div className={stylex.props(styles_2.s5e9c6c57).className || ''}>
      <div className={stylex.props(styles_3.sff8f1a60).className || ''}>
        <aside className={stylex.props(styles_2.s3f582e10).className || ''}>
          <Panel
            className={stylex.props(styles_2.sb04cd461).className || ''}
            contentClassName={
              stylex.props(styles_8.s2ffff9, styles_8.s3f582e10, styles_8.sb42feb5d, styles_8.s67e351ac).className || ''
            }
          >
            <label className={stylex.props(styles.sd63a8a39).className || ''}>
              <Search className={stylex.props(styles_3.sadfa990e).className || ''} />
              <input
                type="search"
                value={routeFilter}
                onChange={(event) => setRouteFilter(event.target.value)}
                placeholder="Filter by key or path"
                className={stylex.props(styles_3.s81e9186b).className || ''}
              />
            </label>

            <div className={stylex.props(styles_2.sef2be82b).className || ''}>
              {isIndexLoading ? (
                <MutedState message="Loading /api/schema…" />
              ) : indexError ? (
                <ErrorState message={indexError} />
              ) : filteredRoutes.length ? (
                <div className={stylex.props(styles_7.sc7133e99).className || ''}>
                  <RouteGroup
                    title="Queries"
                    routes={filteredRoutes.filter((route) => route.kind === 'query')}
                    selectedKey={selectedKey}
                    onSelect={handleRouteSelection}
                  />
                  <RouteGroup
                    title="Actions"
                    routes={filteredRoutes.filter((route) => route.kind === 'action')}
                    selectedKey={selectedKey}
                    onSelect={handleRouteSelection}
                  />
                </div>
              ) : (
                <MutedState message="No endpoints match the current filter." />
              )}
            </div>
          </Panel>
        </aside>

        <main className={stylex.props(styles_2.sa11c0168).className || ''}>
          <div className={stylex.props(styles_4.s345f19).className || ''}>
            {selectedDefinition ? (
              <>
                <Panel
                  eyebrow="Endpoint"
                  title={selectedDefinition.key}
                  subtitle={`${selectedDefinition.method} ${selectedDefinition.path}`}
                  actions={
                    <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                      <StatusPill label={selectedDefinition.inputEncoding} tone="amber" />
                      <StatusPill label={selectedDefinition.outputSerialization} tone="sky" />
                      {selectedDefinition.usesParamMapping ? <StatusPill label="Mapped Params" tone="slate" /> : null}
                    </div>
                  }
                >
                  <div className={stylex.props(styles_3.s93ff291b).className || ''}>
                    <MetaBlock label="Method" value={selectedDefinition.method} />
                    <MetaBlock label="Request Body" value={selectedDefinition.inputEncoding} />
                    <MetaBlock
                      label="Response"
                      value={`${selectedDefinition.outputEncoding} + ${selectedDefinition.outputSerialization}`}
                    />
                  </div>
                </Panel>

                <div className={stylex.props(styles_3.s3b628783).className || ''}>
                  <Panel
                    eyebrow="Request Composer"
                    title="Input JSON"
                    subtitle="Edit the logical request payload. The API inspector derives the exact wire format from the schema."
                    actions={
                      <div className={stylex.props(styles.se80bcbd2).className || ''}>
                        <ActionButton onClick={handleInputReset} disabled={!selectedDefinition}>
                          <RefreshCw className={stylex.props(styles.sca3de968).className || ''} />
                          Reset
                        </ActionButton>
                        <ActionButton onClick={handleFormatJson} disabled={!selectedDefinition}>
                          <Sparkles className={stylex.props(styles.sca3de968).className || ''} />
                          Format JSON
                        </ActionButton>
                      </div>
                    }
                  >
                    <textarea
                      value={selectedInput}
                      onChange={(event) => {
                        if (!selectedKey) {
                          return
                        }
                        setDraftInputs((currentDrafts) => ({
                          ...currentDrafts,
                          [selectedKey]: event.target.value,
                        }))
                        setRunError(null)
                      }}
                      spellCheck={false}
                      className={stylex.props(styles_3.s25d912ff).className || ''}
                    />

                    {previewError ? <InlineAlert title="Preview unavailable" message={previewError} /> : null}
                    {runError ? <InlineAlert title="Request failed" message={runError} /> : null}

                    <div className={stylex.props(styles.se80bcbd3).className || ''}>
                      <button
                        type="button"
                        onClick={handleRunRequest}
                        disabled={!preview || isRunning}
                        className={stylex.props(styles_3.s1032c15).className || ''}
                      >
                        {isRunning ? (
                          <RefreshCw className={stylex.props(styles.s2b64fb66).className || ''} />
                        ) : (
                          <TerminalSquare className={stylex.props(styles.sca3de968).className || ''} />
                        )}
                        {isRunning ? 'Running…' : 'Run request'}
                      </button>
                      <div className={stylex.props(styles.sa5279f8a).className || ''}>
                        <ArrowRight className={stylex.props(styles.sca3de968).className || ''} />
                        Exact transport: {selectedDefinition.method}{' '}
                        {selectedDefinition.method === 'GET' ? 'query string' : 'CBOR body'}
                      </div>
                    </div>
                  </Panel>

                  <Panel
                    eyebrow="Wire Preview"
                    title="HTTP Request"
                    subtitle="The exact request the desktop API will receive."
                    actions={
                      <ActionButton onClick={handleCopyPreviewUrl} disabled={!preview}>
                        <Copy className={stylex.props(styles.sca3de968).className || ''} />
                        Copy URL
                      </ActionButton>
                    }
                  >
                    {preview ? (
                      <div className={stylex.props(styles_7.sc7133e9a).className || ''}>
                        <div className={stylex.props(styles.s46c30091).className || ''}>
                          <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                            <StatusPill label={preview.method} tone="slate" />
                            <p className={stylex.props(styles.sa0e0d57d).className || ''}>{preview.url}</p>
                          </div>
                        </div>

                        <KeyValueList
                          title="Headers"
                          rows={Object.entries(preview.headers).map(([key, value]) => ({
                            key,
                            value,
                          }))}
                        />

                        {preview.method === 'GET' ? (
                          <KeyValueList
                            title="Query Params"
                            rows={preview.queryParams ?? []}
                            emptyMessage="No query params are required for this request."
                          />
                        ) : (
                          <div className={stylex.props(styles.s46c30091).className || ''}>
                            <div className={stylex.props(styles.s8dc64edf).className || ''}>
                              <Binary className={stylex.props(styles.s4768be23).className || ''} />
                              CBOR body
                            </div>
                            <p className={stylex.props(styles.sc4e66034).className || ''}>
                              {preview.cborByteLength ?? 0} bytes generated from the current JSON payload.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <MutedState message="Select an endpoint and enter valid JSON to generate a request preview." />
                    )}
                  </Panel>
                </div>

                <Panel
                  eyebrow="Schema Guide"
                  title={schemaTab === 'input' ? 'Input Schema' : 'Output Schema'}
                  subtitle="Use the schema tree while composing requests and inspecting response structure."
                  actions={
                    <div className={stylex.props(styles.sf4bc5bd8).className || ''}>
                      <SchemaTabButton
                        label="Input"
                        isActive={schemaTab === 'input'}
                        onClick={() => setSchemaTab('input')}
                      />
                      <SchemaTabButton
                        label="Output"
                        isActive={schemaTab === 'output'}
                        onClick={() => setSchemaTab('output')}
                      />
                    </div>
                  }
                >
                  {loadingDefinitionKey === selectedDefinition.key ? (
                    <MutedState message="Loading schema detail…" />
                  ) : definitionError ? (
                    <ErrorState message={definitionError} />
                  ) : activeSchema ? (
                    <div className={stylex.props(styles_7.sc7133e99).className || ''}>
                      <SchemaNodeView
                        rootSchema={activeSchema}
                        schema={activeSchema}
                        name={schemaTab === 'input' ? 'input' : 'output'}
                        isRoot
                      />

                      <details className={stylex.props(styles.sf4b54005).className || ''}>
                        <summary className={stylex.props(styles.s482ba5c7).className || ''}>Raw JSON Schema</summary>
                        <pre className={stylex.props(styles.sb5fcaba7).className || ''}>
                          {formatJsonValue(activeSchema)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <MutedState message="Schema details are not available yet." />
                  )}
                </Panel>

                <Panel
                  eyebrow="Response"
                  title="Result"
                  subtitle="Status, raw payload, and decoded output from the last request for this endpoint."
                >
                  {selectedResult ? (
                    <div className={stylex.props(styles_7.sc7133e9a).className || ''}>
                      <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                        <StatusPill
                          label={`${selectedResult.status} ${selectedResult.statusText}`.trim()}
                          tone={selectedResult.ok ? 'emerald' : 'rose'}
                        />
                        <p className={stylex.props(styles.s309c1ac6).className || ''}>
                          {selectedResult.ok ? 'Decoded with superjson.' : 'Non-2xx responses are shown raw.'}
                        </p>
                      </div>

                      <KeyValueList
                        title="Headers"
                        rows={Object.entries(selectedResult.headers).map(([key, value]) => ({
                          key,
                          value,
                        }))}
                      />

                      <div className={stylex.props(styles_3.s9e30e4d6).className || ''}>
                        <ResponseBlock
                          title="Raw Body"
                          content={
                            selectedResult.rawBody ? prettyRawBody(selectedResult.rawBody) : '(empty response body)'
                          }
                        />
                        <div className={stylex.props(styles.s46c30091).className || ''}>
                          <div className={stylex.props(styles.s8dc64edf).className || ''}>
                            <Braces className={stylex.props(styles.s9f5ea161).className || ''} />
                            Decoded Output
                          </div>
                          <div className={stylex.props(styles.s3ffc2aef).className || ''}>
                            {selectedResult.decodedBody !== undefined ? (
                              <DataViewer data={selectedResult.decodedBody} />
                            ) : (
                              <MutedState message="No decoded payload for this response." />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <MutedState message="Run a request to populate the response panel." />
                  )}
                </Panel>
              </>
            ) : definitionError ? (
              <ErrorState message={definitionError} />
            ) : loadingDefinitionKey ? (
              <MutedState message={`Loading schema for ${loadingDefinitionKey}…`} />
            ) : (
              <MutedState message="Choose an endpoint from the schema index to start exploring." />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
function RouteGroup({
  title,
  routes,
  selectedKey,
  onSelect,
}: {
  title: string
  routes: ApiSchemaRouteSummary[]
  selectedKey: string | null
  onSelect: (route: ApiSchemaRouteSummary) => void
}) {
  if (!routes.length) {
    return null
  }
  return (
    <section className={stylex.props(styles_7.sc7133e97).className || ''}>
      <div className={stylex.props(styles.s78289774).className || ''}>
        <h2 className={stylex.props(styles_3.sb2919a5a).className || ''}>{title}</h2>
        <span className={stylex.props(styles.sb399e9e6).className || ''}>{routes.length}</span>
      </div>

      <div className={stylex.props(styles_7.sc7133e97).className || ''}>
        {routes.map((route) => {
          const isSelected = route.key === selectedKey
          return (
            <button
              key={route.key}
              type="button"
              onClick={() => onSelect(route)}
              className={
                (stylex.props(
                  styles_5.s2ffff9,
                  styles_5.scdbaf625,
                  styles_5.s93b5f015,
                  styles_5.sc1a629cb,
                  styles_5.s5d936fc,
                  styles_5.sf7998a14,
                  styles_5.sad8c742c,
                  styles_5.s34b1af,
                  styles_5.s34b56f,
                  styles_5.sbf63b0a7,
                  styles_5.s993b6d55,
                ).className || '') +
                ' ' +
                (isSelected
                  ? stylex.props(styles_6.s18d815cb, styles_6.s4e1b8250).className || ''
                  : stylex.props(styles_5.s18d8120a, styles_5.s605ce4a1).className || '')
              }
            >
              <div className={stylex.props(styles_2.s3f58665f).className || ''}>
                <div className={stylex.props(styles.s86ff3e4).className || ''}>
                  <span className={stylex.props(styles.s79b4711b).className || ''}>{route.key}</span>
                  <StatusPill label={route.method} tone={route.kind === 'query' ? 'sky' : 'amber'} compact />
                </div>
                <p className={stylex.props(styles.sc2fd7247).className || ''}>{route.path}</p>
              </div>
              <ChevronRight
                className={
                  (stylex.props(
                    styles_5.s33458b,
                    styles_5.s18c0f,
                    styles_5.s1c45e,
                    styles_5.sf032ed6c,
                    styles_5.s993b6d55,
                  ).className || '') +
                  ' ' +
                  (isSelected
                    ? stylex.props(styles_6.s9df2e12d).className || ''
                    : stylex.props(styles_6.s9df2d5ea).className || '')
                }
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
function SchemaNodeView({
  rootSchema,
  schema,
  name,
  required = false,
  isRoot = false,
}: {
  rootSchema: JSONSchemaNode
  schema: JSONSchemaNode
  name?: string
  required?: boolean
  isRoot?: boolean
}) {
  const resolvedSchema = resolveSchemaNode(rootSchema, schema)
  const schemaType = getSchemaType(resolvedSchema)
  const variants = resolvedSchema.oneOf ?? resolvedSchema.anyOf
  return (
    <div
      className={
        (stylex.props(styles_5.sf7998a14, styles_5.sad8c742c, styles_5.s18d8120a).className || '') +
        ' ' +
        (isRoot ? stylex.props(styles_5.s605ce4a1).className || '' : stylex.props(styles_6.s5d5bba5c).className || '') +
        ' ' +
        (stylex.props(styles_5.s1aa17).className || '')
      }
    >
      <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
        {name ? <code className={stylex.props(styles.sf8d612f7).className || ''}>{name}</code> : null}
        {required ? <span className={stylex.props(styles_3.se2a13966).className || ''}>required</span> : null}
        {schemaType ? <SchemaBadge label={schemaType} tone="slate" /> : null}
        {resolvedSchema['x-js-type'] ? <SchemaBadge label={resolvedSchema['x-js-type']} tone="amber" /> : null}
        {resolvedSchema.contentEncoding ? (
          <SchemaBadge label={`encoding: ${resolvedSchema.contentEncoding}`} tone="sky" />
        ) : null}
      </div>

      {resolvedSchema.description ? (
        <p className={stylex.props(styles.s357fc043).className || ''}>{resolvedSchema.description}</p>
      ) : null}

      {resolvedSchema.enum?.length ? (
        <div className={stylex.props(styles.scbcc2085).className || ''}>
          {resolvedSchema.enum.map((option, optionIndex) => (
            <SchemaBadge key={`${String(option)}-${optionIndex}`} label={formatInlineValue(option)} tone="emerald" />
          ))}
        </div>
      ) : null}

      {resolvedSchema.default !== undefined ? (
        <p className={stylex.props(styles_3.s3e1fe971).className || ''}>
          Default{' '}
          <span className={stylex.props(styles.sd71515ff).className || ''}>
            {formatInlineValue(resolvedSchema.default)}
          </span>
        </p>
      ) : null}

      {variants?.length ? (
        <div className={stylex.props(styles_4.s33458e).className || ''}>
          {variants.map((variant, index) => (
            <div key={`variant-${index}`} className={stylex.props(styles.s3a19df69).className || ''}>
              <p className={stylex.props(styles_3.sea7985bd).className || ''}>Option {index + 1}</p>
              <SchemaNodeView rootSchema={rootSchema} schema={variant} name={undefined} />
            </div>
          ))}
        </div>
      ) : null}

      {(schemaType === 'object' || (!schemaType && resolvedSchema.properties)) && resolvedSchema.properties ? (
        <div className={stylex.props(styles_4.s33458e).className || ''}>
          {Object.entries(resolvedSchema.properties).map(([propertyName, propertySchema]) => (
            <SchemaNodeView
              key={propertyName}
              rootSchema={rootSchema}
              schema={propertySchema}
              name={propertyName}
              required={resolvedSchema.required?.includes(propertyName)}
            />
          ))}
        </div>
      ) : null}

      {schemaType === 'array' ? (
        <div className={stylex.props(styles.sd432b4bb).className || ''}>
          <p className={stylex.props(styles_3.sea7985bd).className || ''}>Array Items</p>
          {Array.isArray(resolvedSchema.items) ? (
            resolvedSchema.items.map((itemSchema, index) => (
              <SchemaNodeView
                key={`array-item-${index}`}
                rootSchema={rootSchema}
                schema={itemSchema}
                name={`item ${index + 1}`}
              />
            ))
          ) : resolvedSchema.items ? (
            <SchemaNodeView rootSchema={rootSchema} schema={resolvedSchema.items} name="item" />
          ) : (
            <MutedState message="Array item schema is not specified." />
          )}
        </div>
      ) : null}

      {resolvedSchema.additionalProperties && typeof resolvedSchema.additionalProperties === 'object' ? (
        <div className={stylex.props(styles.sd432b4bb).className || ''}>
          <p className={stylex.props(styles_3.sea7985bd).className || ''}>Additional Properties</p>
          <SchemaNodeView rootSchema={rootSchema} schema={resolvedSchema.additionalProperties} name="*" />
        </div>
      ) : null}
    </div>
  )
}
function ResponseBlock({title, content}: {title: string; content: string}) {
  return (
    <div className={stylex.props(styles.s46c30091).className || ''}>
      <div className={stylex.props(styles.s8dc64edf).className || ''}>
        <Braces className={stylex.props(styles.s4768be23).className || ''} />
        {title}
      </div>
      <pre className={stylex.props(styles.sf67243d5).className || ''}>{content}</pre>
    </div>
  )
}
function Panel({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
}: {
  eyebrow?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={cn(stylex.props(styles_3.s3ba25e7c).className || '', className)}>
      {eyebrow || title || subtitle ? (
        <div className={stylex.props(styles_3.s28557fb9).className || ''}>
          <div>
            {eyebrow ? <p className={stylex.props(styles_3.s75d5b7d6).className || ''}>{eyebrow}</p> : null}
            {title ? <h2 className={stylex.props(styles.s2b839648).className || ''}>{title}</h2> : null}
            {subtitle ? <p className={stylex.props(styles.sb7a80442).className || ''}>{subtitle}</p> : null}
          </div>
          {actions ? <div className={stylex.props(styles.sf032ed6c).className || ''}>{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn(stylex.props(styles_7.sc7133e99).className || '', contentClassName)}>{children}</div>
    </section>
  )
}
function ActionButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={stylex.props(styles_3.s34adeb3).className || ''}
    >
      {children}
    </button>
  )
}
function SchemaTabButton({label, isActive, onClick}: {label: string; isActive: boolean; onClick: () => void}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        (stylex.props(
          styles_5.s775755af,
          styles_5.s34b1af,
          styles_5.s34b56e,
          styles_5.sab7cc6fa,
          styles_5.s62c182b1,
          styles_5.s993b6d55,
        ).className || '') +
        ' ' +
        (isActive
          ? (stylex.props(styles_5.s8a6c2ac8, styles_5.s605ce4a1).className || '') +
            ' ' +
            (stylex.props(styles_6.s9df2ed0b).className || '')
          : stylex.props(styles_6.s9df2dd6c).className || '')
      }
    >
      {label}
    </button>
  )
}
function StatusPill({
  label,
  tone: _tone,
  compact = false,
}: {
  label: string
  tone: 'amber' | 'sky' | 'slate' | 'emerald' | 'rose'
  compact?: boolean
}) {
  return (
    <span
      className={
        (stylex.props(
          styles_5.s9b8736ad,
          styles_5.sc6ed1702,
          styles_5.s775755af,
          styles_5.s62c182b1,
          styles_5.sd52b2d2,
          styles_5.sbad092cd,
        ).className || '') +
        ' ' +
        (compact
          ? stylex.props(styles_5.sc5cf0034, styles_5.s34b56d, styles_5.s55426dfb).className || ''
          : stylex.props(styles_5.s34b1ae, styles_5.sc5dd13f4, styles_5.s5542e25a).className || '')
      }
    >
      {label}
    </span>
  )
}
function SchemaBadge({label, tone: _tone}: {label: string; tone: 'amber' | 'sky' | 'slate' | 'emerald'}) {
  return (
    <span
      className={
        stylex.props(
          styles_5.s775755af,
          styles_5.sc5cf0034,
          styles_5.s34b56d,
          styles_5.s5542e25a,
          styles_5.s62c182b1,
          styles_5.sd52b2d2,
          styles_5.sbacfaa0f,
        ).className || ''
      }
    >
      {label}
    </span>
  )
}
function MetaBlock({label, value}: {label: string; value: string}) {
  return (
    <div className={stylex.props(styles.s46c30091).className || ''}>
      <p className={stylex.props(styles_3.s68f952f8).className || ''}>{label}</p>
      <p className={stylex.props(styles.s85de826b).className || ''}>{value}</p>
    </div>
  )
}
function KeyValueList({
  title,
  rows,
  emptyMessage = 'Nothing to show.',
}: {
  title: string
  rows: Array<{
    key: string
    value: string
  }>
  emptyMessage?: string
}) {
  return (
    <div className={stylex.props(styles.s46c30091).className || ''}>
      <div className={stylex.props(styles.s8dc64edf).className || ''}>
        <ArrowRight className={stylex.props(styles.s9f5ea161).className || ''} />
        {title}
      </div>
      {rows.length ? (
        <div className={stylex.props(styles_4.s33458e).className || ''}>
          {rows.map((row) => (
            <div key={`${row.key}-${row.value}`} className={stylex.props(styles.s2c815aea).className || ''}>
              <p className={stylex.props(styles_3.sfea8a514).className || ''}>{row.key}</p>
              <p className={stylex.props(styles.sbb5ba128).className || ''}>{row.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <MutedState message={emptyMessage} />
      )}
    </div>
  )
}
function InlineAlert({title, message}: {title: string; message: string}) {
  return (
    <div className={stylex.props(styles.s5ab913f5).className || ''}>
      <div className={stylex.props(styles.s69f644cf).className || ''}>
        <AlertCircle className={stylex.props(styles.sca3de968).className || ''} />
        {title}
      </div>
      <p className={stylex.props(styles.s9097ff5).className || ''}>{message}</p>
    </div>
  )
}
function ErrorState({message}: {message: string}) {
  return (
    <div className={stylex.props(styles.se6fec38).className || ''}>
      <div className={stylex.props(styles_3.sb18494ac).className || ''}>
        <Unplug className={stylex.props(styles.sca3de968).className || ''} />
        Error
      </div>
      <p className={stylex.props(styles.sd6b3e1b6).className || ''}>{message}</p>
    </div>
  )
}
function MutedState({message}: {message: string}) {
  return <div className={stylex.props(styles.s44342515).className || ''}>{message}</div>
}
function buildAbsoluteUrl(apiHost: string, path: string): string {
  return `${apiHost.replace(/\/+$/, '')}${path}`
}
function formatJsonValue(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
function formatInlineValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  return String(value)
}
function prettyRawBody(rawBody: string): string {
  try {
    return JSON.stringify(JSON.parse(rawBody), null, 2)
  } catch {
    return rawBody
  }
}
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
function getSchemaType(schema: JSONSchemaNode): string | undefined {
  if (Array.isArray(schema.type)) {
    return schema.type.find((type) => type !== 'null') ?? schema.type[0]
  }
  return schema.type
}
