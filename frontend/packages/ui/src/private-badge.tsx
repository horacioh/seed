import * as stylex from '@stylexjs/stylex'
import {Lock} from 'lucide-react'
import {Badge} from './components/badge'
import {cn} from './utils'
const styles_2 = stylex.create({
  s55426dfb: {
    fontSize: '10px',
  },
  sab7cc79b: {
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
})
const styles = stylex.create({
  see592ce5: {
    color: 'var(--muted-foreground)',
    gap: 'calc(0.25rem * 0.5)',
  },
})
export function PrivateBadge({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md'
  className?: string
} = {}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        stylex.props(styles.see592ce5).className || '',
        stylex.props(size === 'sm' ? styles_2.s55426dfb : styles_2.sab7cc79b).className || '',
        className,
      )}
    >
      <Lock size={size === 'sm' ? 10 : 12} strokeWidth={2} />
      Private
    </Badge>
  )
}
