import {ScrollArea} from '@shm/ui/components/scroll-area'
import {HTMLAttributes} from 'react'

/** Provides the single semantic main landmark and focus target for desktop routes. */
export function MainContent({children, className, ...props}: HTMLAttributes<HTMLElement>) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      data-a11y-region="main"
      className={`flex h-full min-h-0 w-full flex-1 ${className || ''}`}
      {...props}
    >
      {children}
    </main>
  )
}

export function MainWrapper({
  children,
  scrollable = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {scrollable?: boolean}) {
  return (
    <div {...props} className={`flex h-full w-full flex-1 ${className || ''}`}>
      {/* TODO: we cannot remove this ID here because the SlashMenu is referencing
      this! */}
      <div className="h-full flex-1">
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
