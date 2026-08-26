import * as stylex from '@stylexjs/stylex'
import {Lock} from 'lucide-react'
import {Badge} from './components/badge'
import {cn} from './utils'
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
        size === 'sm' ? 'text-[10px]' : 'text-xs',
        className,
      )}
    >
      <Lock size={size === 'sm' ? 10 : 12} strokeWidth={2} />
      Private
    </Badge>
  )
}
