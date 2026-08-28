import * as stylex from '@stylexjs/stylex'
import {ScrollArea} from '@shm/ui/components/scroll-area'
import {HTMLAttributes} from 'react'
const styles_2 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  sb42244d4: {
    height: '100%',
  },
  scdbaf625: {
    width: '100%',
  },
  sb42feb5d: {
    flex: '1',
  },
})
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
    <div
      {...props}
      className={
        (stylex.props(styles_2.s2ffff9, styles_2.sb42244d4, styles_2.scdbaf625, styles_2.sb42feb5d).className || '') +
        ' ' +
        (className || '')
      }
    >
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
    <div
      className={(stylex.props(styles_2.s2ffff9, styles_2.sb42feb5d).className || '') + ' ' + (className || '')}
      {...props}
    >
      {/* TODO: we cannot remove this ID here because the SlashMenu is referencing
       this! */}
      <ScrollArea id="scroll-page-wrapper">{children}</ScrollArea>
    </div>
  )
}
export function MainWrapperNoScroll({children, className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={(stylex.props(styles_2.s2ffff9, styles_2.sb42feb5d).className || '') + ' ' + (className || '')}
      {...props}
    >
      {children}
    </div>
  )
}
