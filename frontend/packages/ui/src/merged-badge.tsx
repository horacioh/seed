import * as stylex from '@stylexjs/stylex'
import {Merge} from 'lucide-react'
import {Badge} from './components/badge'
import {cn} from './utils'
const styles = stylex.create({
  see592ce5: {
    color: 'var(--muted-foreground)',
    gap: 'calc(0.25rem * 0.5)',
  },
})
export function MergedBadge({count, size = 'md', className}: {count: number; size?: 'sm' | 'md'; className?: string}) {
  if (count <= 1) return null
  return (
    <Badge
      variant="outline"
      className={cn(
        stylex.props(styles.see592ce5).className || '',
        size === 'sm' ? 'text-[10px]' : 'text-xs',
        className,
      )}
    >
      <Merge size={size === 'sm' ? 10 : 12} strokeWidth={2} />
      Merged · {count} versions
    </Badge>
  )
}
