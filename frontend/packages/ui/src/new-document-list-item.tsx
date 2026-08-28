import * as stylex from '@stylexjs/stylex'
import {Plus} from 'lucide-react'
import {SizableText} from './text'
import {cn} from './utils'
const styles_2 = stylex.create({
  s993b893d: {
    borderColor: 'color-mix(in oklab, var(--muted-foreground) 25%, transparent)',
    backgroundColor: 'var(--color-white)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 2)',
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
  s86394f20: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    borderRadius: '0.25rem',
    borderStyle: 'dashed',
    borderWidth: '2px',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  s7091d227: {
    color: 'var(--muted-foreground)',
    marginRight: 'calc(0.25rem * 3)',
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
    flexShrink: '0',
  },
  s8488e609: {
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--font-sans)',
    fontWeight: '500',
  },
})
export interface NewDocumentListItemProps {
  onCreateDraft: () => void
}
export function NewDocumentListItem({onCreateDraft}: NewDocumentListItemProps) {
  return (
    <button
      onClick={onCreateDraft}
      className={cn(
        stylex.props(styles.s86394f20).className || '',
        stylex.props(styles_2.s993b893d).className || '',
        stylex.props(styles_2.sfa63f40d).className || '',
        stylex.props(styles_2.s31a60f83).className || '',
        stylex.props(styles.sc7847ec6).className || '',
      )}
    >
      <Plus className={stylex.props(styles.s7091d227).className || ''} />
      <SizableText size="sm" className={stylex.props(styles.s8488e609).className || ''}>
        New Document
      </SizableText>
    </button>
  )
}
