import * as stylex from '@stylexjs/stylex'
import {Badge} from './components/badge'
import {cn} from './utils'
const styles = stylex.create({
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
})
interface DraftBadgeProps {
  className?: string
}
export function DraftBadge({className}: DraftBadgeProps) {
  return (
    <Badge variant="warning" className={cn(stylex.props(styles.sa1762f51).className || '', className)}>
      Draft
    </Badge>
  )
}
