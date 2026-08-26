import * as stylex from '@stylexjs/stylex'
import {AlertCircle} from 'lucide-react'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles = stylex.create({
  s51ab7e65: {
    color: 'var(--destructive)',
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
})
export function InlineError({message = 'Could not be found', className}: {message?: string; className?: string}) {
  return (
    <Tooltip content={message}>
      <AlertCircle className={cn(stylex.props(styles.s51ab7e65).className || '', className)} />
    </Tooltip>
  )
}
