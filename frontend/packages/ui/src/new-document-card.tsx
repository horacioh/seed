import * as stylex from '@stylexjs/stylex'
import {Plus} from 'lucide-react'
import {cn} from './utils'
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
        'flex min-h-[200px] flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed',
        'border-muted-foreground/25 bg-white transition-colors duration-200',
        'hover:border-muted-foreground/50 hover:bg-muted/30',
        'dark:hover:bg-muted/20 dark:bg-black',
      )}
    >
      <div className={stylex.props(styles.s21fb93aa).className || ''}>
        <Plus className={stylex.props(styles.s3566be67).className || ''} />
        <span className={stylex.props(styles.sd523fbe3).className || ''}>New Document</span>
      </div>
    </button>
  )
}
