import * as stylex from '@stylexjs/stylex'
import {LucideIcon} from 'lucide-react'
const styles = stylex.create({
  s78039d98: {
    width: 'calc(0.25rem * 12)',
    height: 'calc(0.25rem * 12)',
    marginBottom: 'calc(0.25rem * 3)',
    color: 'oklch(70.7% 0.022 261.325)',
  },
  s65e234f5: {
    textAlign: 'center',
  },
})
interface EmptyStateProps {
  message: string
  icon?: LucideIcon
  className?: string
}
export function EmptyState({message, icon: Icon, className = ''}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-gray-500 ${className}`}>
      {Icon && <Icon className={stylex.props(styles.s78039d98).className || ''} />}
      <p className={stylex.props(styles.s65e234f5).className || ''}>{message}</p>
    </div>
  )
}
export default EmptyState
