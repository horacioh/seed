import * as stylex from '@stylexjs/stylex'
import {ReactNode} from 'react'

/** Provides the neutral inspector background and sticky toolbar layout. */
const styles_3 = stylex.create({
  s5574c491: {
    marginInline: 'auto',
  },
  scdbaf625: {
    width: '100%',
  },
  sb42244d4: {
    height: '100%',
  },
})
const styles_2 = stylex.create({
  s39f6fddf: {
    position: 'sticky',
    top: 'calc(var(--spacing) * 0)',
    zIndex: '10',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: 'var(--color-zinc-200)',
    backgroundColor: 'color-mix(in oklab, var(--color-zinc-100) 95%, transparent)',
    WebkitBackdropFilter: 'blur(8px)',
    backdropFilter: 'blur(8px)        ',
  },
  sa13f237d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 3)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 3)',
    '@media ((min-width: 768px))': {
      paddingInline: 'calc(var(--spacing) * 0)',
    },
  },
  s39fc00bd: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-base)',
    lineHeight: 'var(--leading-tight)',
    fontWeight: 'var(--font-weight-semibold)',
    wordBreak: 'break-all',
    color: 'var(--color-zinc-700)',
    '@media ((min-width: 768px))': {
      fontSize: 'var(--text-lg)',
      lineHeight: 'var(--text-lg--line-height)',
    },
  },
  s5576cd83: {
    height: '100%',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 768px))': {
      paddingInline: 'calc(var(--spacing) * 0)',
    },
  },
})
const styles = stylex.create({
  sc3a47911: {
    display: 'flex',
    height: '100%',
    minHeight: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    backgroundColor: 'oklch(96.7% 0.001 286.375)',
  },
  s92c2336d: {
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
  },
})
export function InspectorShell({
  title,
  toolbar,
  children,
  contentMaxWidth = 960,
}: {
  title: string
  toolbar?: ReactNode
  children: ReactNode
  contentMaxWidth?: number
}) {
  const maxWidthStyle = {
    maxWidth: contentMaxWidth ?? 'calc(85ch + 1em)',
  }
  return (
    <div className={stylex.props(styles.sc3a47911).className || ''}>
      <div className={stylex.props(styles_2.s39f6fddf).className || ''}>
        <div className={stylex.props(styles_3.s5574c491, styles_3.scdbaf625).className || ''} style={maxWidthStyle}>
          <div className={stylex.props(styles_2.sa13f237d).className || ''}>
            <h1 className={stylex.props(styles_2.s39fc00bd).className || ''}>{title}</h1>
            {toolbar}
          </div>
        </div>
      </div>
      <div className={stylex.props(styles.s92c2336d).className || ''}>
        <div
          className={stylex.props(styles_3.s5574c491, styles_3.sb42244d4, styles_3.scdbaf625).className || ''}
          style={maxWidthStyle}
        >
          <div className={stylex.props(styles_2.s5576cd83).className || ''}>{children}</div>
        </div>
      </div>
    </div>
  )
}
