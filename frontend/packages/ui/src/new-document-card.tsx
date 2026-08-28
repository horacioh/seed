import * as stylex from '@stylexjs/stylex'
import {Plus} from 'lucide-react'
import {cn} from './utils'
const styles_2 = stylex.create({
  sb68b0e58: {
    display: 'flex',
    minHeight: '200px',
    flex: '1',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '2px',
  },
  s60113fc: {
    borderColor: 'color-mix(in oklab, var(--muted-foreground) 25%, transparent)',
    backgroundColor: 'var(--surface-contrast)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: '200ms',
  },
  sfa63f40d: {
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'color-mix(in oklab, var(--muted-foreground) 50%, transparent)',
        backgroundColor: 'var(--surface-hover-card)',
      },
    },
  },
  s31a60f83: {
    backgroundColor: 'var(--surface-black)',
  },
})
const styles = stylex.create({
  s21fb93aa: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s3566be67: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  sd523fbe3: {
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
})
export interface NewDocumentCardProps {
  onCreateDraft: () => void
}
export function NewDocumentCard({onCreateDraft}: NewDocumentCardProps) {
  return (
    <button
      onClick={onCreateDraft}
      className={cn(
        stylex.props(styles_2.sb68b0e58).className || '',
        stylex.props(styles_2.s60113fc).className || '',
        stylex.props(styles_2.sfa63f40d).className || '',
        stylex.props(styles_2.s31a60f83).className || '',
      )}
    >
      <div className={stylex.props(styles.s21fb93aa).className || ''}>
        <Plus className={stylex.props(styles.s3566be67).className || ''} />
        <span className={stylex.props(styles.sd523fbe3).className || ''}>New Document</span>
      </div>
    </button>
  )
}
