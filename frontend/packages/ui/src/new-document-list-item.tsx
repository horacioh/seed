import * as stylex from '@stylexjs/stylex'
import {Plus} from 'lucide-react'
import {SizableText} from './text'
import {cn} from './utils'
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
        'border-muted-foreground/25 bg-white px-4 py-2 transition-colors duration-200',
        'hover:border-muted-foreground/50 hover:bg-muted/30',
        'dark:hover:bg-muted/20 dark:bg-black',
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
