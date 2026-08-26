import * as stylex from '@stylexjs/stylex'
import {cn} from './utils'
const styles = stylex.create({
  s284c2f1: {
    height: '100%',
    width: '100%',
  },
  sede8610d: {
    marginInline: 'auto',
    display: 'flex',
    width: '100%',
    flexShrink: '0',
    flexDirection: 'column',
    paddingInline: 'calc(0.25rem * 4)',
    paddingTop: 'calc(0.25rem * 6)',
  },
})
export function PanelContainer({className, children, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[stylex.props(styles.s284c2f1).className || '', className].filter(Boolean).join(' ')}>
      <div
        className={cn('bg-panel sm:border-border h-full overflow-hidden sm:rounded-md sm:border', className)}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}
export const Container = ({
  className,
  clearVerticalSpace = false,
  centered = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  hide?: boolean
  clearVerticalSpace?: boolean
  centered?: boolean
}) => {
  return (
    <div
      className={cn(
        stylex.props(styles.sede8610d).className || '',
        props.hide && 'pointer-events-none opacity-0',
        clearVerticalSpace && 'py-0',
        centered && 'max-w-[calc(85ch+1em)]',
        className,
      )}
      {...props}
    />
  )
}
export const windowContainerStyles = cn('flex flex-col w-screen h-screen min-h-svh bg-panel-background p-2')
export const panelContainerStyles = cn(
  'flex flex-col w-full h-full min-h-0 rounded-md overflow-hidden bg-panel border border-border',
)
