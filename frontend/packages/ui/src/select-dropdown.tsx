import * as stylex from '@stylexjs/stylex'
import * as SelectPrimitive from '@radix-ui/react-select'
import {CheckIcon, ChevronDownIcon, ChevronUpIcon} from 'lucide-react'
import * as React from 'react'
import {floatingContent} from './animation-keyframes'
import {cn} from './utils'
const styles_6 = stylex.create({
  sdc685e61: {
    ':is([aria-invalid="true"])': {
      '--ring-color': 'color-mix(in oklab, var(--destructive) 20%, transparent)',
    },
  },
  s71984e23: {
    ':is(.dark *)': {
      ':is([aria-invalid="true"])': {
        '--ring-color': 'color-mix(in oklab, var(--destructive) 40%, transparent)',
      },
    },
  },
})
const styles_5 = stylex.create({
  sa2132d46: {
    ':is(.dark *)': {
      backgroundColor: 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
  },
  s7c330746: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'color-mix(in oklab, var(--input) 50%, transparent)',
      },
    },
  },
})
const styles_4 = stylex.create({
  s5f46764d: {
    ':is([data-placeholder])': {
      color: 'var(--muted-foreground)',
    },
  },
  s56db4708: {
    ':is([aria-invalid="true"])': {
      borderColor: 'var(--destructive)',
    },
  },
  sd2ef703a: {
    ':is([data-size="default"])': {
      height: 'calc(0.25rem * 9)',
    },
  },
  scc0e4c78: {
    ':is([data-size="sm"])': {
      height: 'calc(0.25rem * 8)',
    },
  },
  s1b9ca3e8: {
    ':is([data-side="bottom"])': {
      translate: '0 0.25rem',
    },
  },
  sd0b7e9a2: {
    ':is([data-side="left"])': {
      translate: 'calc(0.25rem * -1) 0',
    },
  },
  s7725a3f2: {
    ':is([data-side="right"])': {
      translate: '0.25rem 0',
    },
  },
  s4a6f9b55: {
    ':is([data-side="top"])': {
      translate: '0 calc(0.25rem * -1)',
    },
  },
  sdca6904b: {
    ':is([data-disabled])': {
      pointerEvents: 'none',
    },
  },
  s56ed324e: {
    ':is([data-disabled])': {
      opacity: '50%',
    },
  },
})
const styles_3 = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s5b4447b4: {
    ':focus-visible': {
      borderColor: 'var(--ring)',
    },
  },
  sa391181a: {
    ':focus-visible': {},
  },
  s2ffff9: {
    display: 'flex',
  },
  s6a2edbb: {
    width: 'fit-content',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sf8e652db: {
    whiteSpace: 'nowrap',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  s1d40ae1d: {
    transitionProperty: 'color, box-shadow, border-color',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sd273c872: {
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'color-mix(in oklab, #000 10%, transparent)',
      },
    },
  },
  s21f8c65d: {
    ':focus-visible': {
      boxShadow: '0 0 0 3px var(--ring-color, currentcolor)',
    },
  },
  s8b5b6275: {
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  s8658d75b: {
    ':disabled': {
      opacity: '50%',
    },
  },
  s56bd391d: {
    backgroundColor: 'var(--popover)',
  },
  s9a29c60b: {
    color: 'var(--popover-foreground)',
  },
  se9bda75c: {
    maxHeight: 'var(--radix-select-content-available-height)',
  },
  sd9a79307: {
    transformOrigin: 'var(--radix-select-content-transform-origin)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s3824ce: {
    zIndex: '50',
  },
  s94be9ef1: {
    minWidth: '8rem',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  s2527420a: {
    overflowX: 'hidden',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
  s3e3e7330: {
    ':focus': {
      backgroundColor: 'var(--accent)',
    },
  },
  s758c8268: {
    ':focus': {
      color: 'var(--accent-foreground)',
    },
  },
  s254b9195: {
    outlineStyle: 'none',
    '@media (forced-colors: active)': {
      outline: '2px solid transparent',
      outlineOffset: '2px',
    },
  },
  s3b7916ca: {
    cursor: 'default',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  s3484a1: {
    paddingLeft: 'calc(0.25rem * 2)',
  },
  s349b2d: {
    paddingRight: 'calc(0.25rem * 8)',
  },
})
const styles_2 = stylex.create({
  s7fc21f1c: {
    height: 'var(--radix-select-trigger-height)',
    width: '100%',
    minWidth: 'var(--radix-select-trigger-width)',
    scrollMarginBlock: 'calc(var(--spacing) * 1)',
  },
})
const styles = stylex.create({
  s1ed2b555: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    opacity: '50%',
    color: 'var(--muted-foreground)',
    pointerEvents: 'none',
    flexShrink: 0,
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s51ee0527: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1.5)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s96cb041d: {
    position: 'absolute',
    right: 'calc(0.25rem * 2)',
    display: 'flex',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    pointerEvents: 'none',
    flexShrink: 0,
  },
  sselectValue: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sitemText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    minWidth: 0,
    flex: '1 1 0%',
  },
  s2fe88ac9: {
    backgroundColor: 'var(--border)',
    pointerEvents: 'none',
    marginInline: 'calc(0.25rem * -1)',
    marginBlock: 'calc(0.25rem * 1)',
    height: '1px',
  },
  s4088a8ec: {
    display: 'flex',
    cursor: 'default',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 1)',
  },
})
function Select({...props}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}
function SelectGroup({...props}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}
function SelectValue({className, ...props}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(stylex.props(styles.sselectValue).className || '', className)}
      {...props}
    />
  )
}
function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        stylex.props(
          styles_3.s1a01a0ed,
          styles_3.s5b4447b4,
          styles_3.sa391181a,
          styles_3.s2ffff9,
          styles_3.s6a2edbb,
          styles_3.scdbaf625,
          styles_3.sc6ed1702,
          styles_3.sc1a629cb,
          styles_3.s5d936fb,
          styles_3.sf8e652db,
          styles_3.sf79988b7,
          styles_3.sad8c742c,
          styles_3.s60f53bca,
          styles_3.s34b1ae,
          styles_3.s34b56e,
          styles_3.sab7cc6fa,
          styles_3.sa602a1e3,
          styles_3.s1d40ae1d,
          styles_3.sd273c872,
          styles_3.s21f8c65d,
          styles_3.s8b5b6275,
          styles_3.s8658d75b,
        ).className || '',
        stylex.props(styles_4.s5f46764d, styles_4.s56db4708, styles_4.sd2ef703a, styles_4.scc0e4c78).className || '',
        stylex.props(styles_5.sa2132d46, styles_5.s7c330746).className || '',
        stylex.props(styles_6.sdc685e61, styles_6.s71984e23).className || '',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={stylex.props(styles.s1ed2b555).className || ''} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}
function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          stylex.props(
            styles_3.s56bd391d,
            styles_3.s9a29c60b,
            styles_3.se9bda75c,
            styles_3.sd9a79307,
            styles_3.sdef3facc,
            styles_3.s3824ce,
            styles_3.s94be9ef1,
            styles_3.sac38f2ae,
            styles_3.s2527420a,
            styles_3.sf79988b7,
            styles_3.sad8c742c,
            styles_3.s8a6c2964,
            floatingContent.base,
            floatingContent.bottom,
            floatingContent.left,
            floatingContent.right,
            floatingContent.top,
          ).className || '',
          position === 'popper'
            ? stylex.props(styles_4.s1b9ca3e8, styles_4.sd0b7e9a2, styles_4.s7725a3f2, styles_4.s4a6f9b55).className ||
                ''
            : '',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            stylex.props(styles.s1aa14).className || '',
            stylex.props(position === 'popper' ? styles_2.s7fc21f1c : null).className || '',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}
function SelectLabel({className, ...props}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(stylex.props(styles.s51ee0527).className || '', className)}
      {...props}
    />
  )
}
function SelectItem({className, children, ...props}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        stylex.props(
          styles_3.s3e3e7330,
          styles_3.s758c8268,
          styles_3.s254b9195,
          styles_3.sdef3facc,
          styles_3.s2ffff9,
          styles_3.scdbaf625,
          styles_3.s3b7916ca,
          styles_3.sa145969,
          styles_3.sc6ed1702,
          styles_3.s5d936fb,
          styles_3.sf799897a,
          styles_3.sc5dd13f4,
          styles_3.s3484a1,
          styles_3.s349b2d,
          styles_3.sab7cc6fa,
        ).className || '',
        stylex.props(styles_4.sdca6904b, styles_4.s56ed324e).className || '',
        className,
      )}
      {...props}
    >
      <span className={stylex.props(styles.s96cb041d).className || ''}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className={stylex.props(styles.sca3de968).className || ''} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <span className={stylex.props(styles.sitemText).className || ''}>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </span>
    </SelectPrimitive.Item>
  )
}
function SelectSeparator({className, ...props}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(stylex.props(styles.s2fe88ac9).className || '', className)}
      {...props}
    />
  )
}
function SelectScrollUpButton({className, ...props}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(stylex.props(styles.s4088a8ec).className || '', className)}
      {...props}
    >
      <ChevronUpIcon className={stylex.props(styles.sca3de968).className || ''} />
    </SelectPrimitive.ScrollUpButton>
  )
}
function SelectScrollDownButton({className, ...props}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(stylex.props(styles.s4088a8ec).className || '', className)}
      {...props}
    >
      <ChevronDownIcon className={stylex.props(styles.sca3de968).className || ''} />
    </SelectPrimitive.ScrollDownButton>
  )
}
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

// Backward compatibility - wraps new components with old API
export interface SelectDropdownProps<
  T extends {
    value: string
    label: string
  },
> {
  options: readonly T[]
  value?: string
  onValue?: (value: string) => void
  width?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}
export type SelectOptions = {
  value: string
  label: string
}
export function SelectDropdown<
  T extends {
    value: string
    label: string
  },
>({options, value, onValue, width, placeholder, className, disabled, ...props}: SelectDropdownProps<T>) {
  return (
    <Select value={value} onValueChange={onValue} disabled={disabled} {...props}>
      <SelectTrigger
        className={className}
        style={{
          width,
        }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
