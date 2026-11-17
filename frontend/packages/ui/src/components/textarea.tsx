import * as React from 'react'

import {cn} from '../utils'

type TextareaProps = React.ComponentProps<'textarea'> & {focusOnMount?: boolean}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {className, focusOnMount, ...props},
  ref,
) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  React.useImperativeHandle(ref, () => textareaRef.current!, [])
  React.useEffect(() => {
    if (focusOnMount) textareaRef.current?.focus()
  }, [focusOnMount])

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      className={cn(
        'border-input-border placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
})

export {Textarea}
