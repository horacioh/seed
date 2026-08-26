import * as stylex from '@stylexjs/stylex'
import {ScrollArea} from '@shm/ui/components/scroll-area'
import {HTMLAttributes} from 'react'
const styles = stylex.create({
  se8f9b829: {
    height: '100%',
    flex: '1',
  },
})
export function MainWrapper({
  children,
  scrollable = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  scrollable?: boolean
}) {
  return (
    <div {...props} className={`flex h-full w-full flex-1 ${className || ''}`}>
      {/* TODO: we cannot remove this ID here because the SlashMenu is referencing
       this! */}
      <div className={stylex.props(styles.se8f9b829).className || ''}>
        {scrollable ? <ScrollArea id="scroll-page-wrapper">{children}</ScrollArea> : children}
      </div>
    </div>
  )
}
export function MainWrapperStandalone({children, className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-1 ${className || ''}`} {...props}>
      {/* TODO: we cannot remove this ID here because the SlashMenu is referencing
       this! */}
      <ScrollArea id="scroll-page-wrapper">{children}</ScrollArea>
    </div>
  )
}
export function MainWrapperNoScroll({children, className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-1 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}
