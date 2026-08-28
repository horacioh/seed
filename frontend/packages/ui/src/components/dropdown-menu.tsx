import * as stylex from '@stylexjs/stylex'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import {CheckIcon, ChevronRightIcon, CircleIcon} from 'lucide-react'
import * as React from 'react'
import {floatingContent} from '../animation-keyframes'
import {cn} from '../utils'
const styles_4 = stylex.create({
  s107d54c6: {
    ':is(.dark *)': {
      ':is([data-variant="destructive"])': {
        ':focus': {
          backgroundColor: 'color-mix(in oklab, var(--destructive) 20%, transparent)',
        },
      },
    },
  },
})
const styles_3 = stylex.create({
  sb5495d44: {
    ':is([data-state="open"])': {
      opacity: '100%',
    },
  },
  s8c130211: {
    ':is([data-variant="destructive"])': {
      color: 'var(--destructive)',
    },
  },
  sabf0be23: {
    ':is([data-variant="destructive"])': {
      ':focus': {
        backgroundColor: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
      },
    },
  },
  sfa3b6533: {
    ':is([data-variant="destructive"])': {
      ':focus': {
        color: 'var(--destructive)',
      },
    },
  },
  sdca6904b: {
    ':is([data-disabled])': {
      pointerEvents: 'none',
    },
  },
  s2a9f2309: {
    ':is([data-inset])': {
      paddingLeft: 'calc(0.25rem * 8)',
    },
  },
  s56ed324e: {
    ':is([data-disabled])': {
      opacity: '50%',
    },
  },
})
const styles_2 = stylex.create({
  s56bd391d: {
    backgroundColor: 'var(--popover)',
  },
  s9a29c60b: {
    color: 'var(--popover-foreground)',
  },
  s5217f915: {
    maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
  },
  s9ce4c292: {
    transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
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
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
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
  sdef3facc: {
    position: 'relative',
  },
  s2ffff9: {
    display: 'flex',
  },
  s3b7916ca: {
    cursor: 'default',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s3484a7: {
    paddingLeft: 'calc(0.25rem * 8)',
  },
  s349b27: {
    paddingRight: 'calc(0.25rem * 2)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
})
const styles = stylex.create({
  scca54036: {
    pointerEvents: 'none',
    position: 'absolute',
    left: 'calc(0.25rem * 2)',
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
  s70543fa9: {
    width: 'calc(0.25rem * 2)',
    height: 'calc(0.25rem * 2)',
    fill: 'currentcolor',
    pointerEvents: 'none',
    flexShrink: 0,
  },
  s2b9c850d: {
    backgroundColor: 'var(--border)',
    marginInline: 'calc(0.25rem * -1)',
    marginBlock: 'calc(0.25rem * 1)',
    height: '1px',
  },
  s40833f27: {
    color: 'var(--muted-foreground)',
    marginLeft: 'auto',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    letterSpacing: '0.1em',
  },
  sd5d229cb: {
    marginLeft: 'auto',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'var(--muted-foreground)',
    pointerEvents: 'none',
    flexShrink: 0,
  },
})
function DropdownMenu({...props}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}
function DropdownMenuPortal({...props}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}
function DropdownMenuTrigger({className, ...props}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(stylex.props(styles_3.sb5495d44).className || '', className)}
      {...props}
    />
  )
}
export type DropdownMenuContentProps = React.ComponentProps<typeof DropdownMenuPrimitive.Content>
function DropdownMenuContent({className, sideOffset = 4, ...props}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          stylex.props(
            styles_2.s56bd391d,
            styles_2.s9a29c60b,
            styles_2.s5217f915,
            styles_2.s9ce4c292,
            styles_2.s3824ce,
            styles_2.s94be9ef1,
            styles_2.sac38f2ae,
            styles_2.s2527420a,
            styles_2.sf79988b7,
            styles_2.sad8c742c,
            styles_2.s1aa14,
            styles_2.s8a6c2964,
            floatingContent.base,
            floatingContent.bottom,
            floatingContent.left,
            floatingContent.right,
            floatingContent.top,
          ).className || '',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}
function DropdownMenuGroup({...props}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}
function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        stylex.props(
          styles_2.s3e3e7330,
          styles_2.s758c8268,
          styles_2.s254b9195,
          styles_2.sdef3facc,
          styles_2.s2ffff9,
          styles_2.s3b7916ca,
          styles_2.sa145969,
          styles_2.sc6ed1702,
          styles_2.s5d936fb,
          styles_2.sf799897a,
          styles_2.s34b1ad,
          styles_2.sc5dd13f4,
          styles_2.sab7cc6fa,
        ).className || '',
        stylex.props(
          styles_3.s8c130211,
          styles_3.sabf0be23,
          styles_3.sfa3b6533,
          styles_3.sdca6904b,
          styles_3.s2a9f2309,
          styles_3.s56ed324e,
        ).className || '',
        stylex.props(styles_4.s107d54c6).className || '',
        className,
      )}
      {...props}
    />
  )
}
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        stylex.props(
          styles_2.s3e3e7330,
          styles_2.s758c8268,
          styles_2.s254b9195,
          styles_2.sdef3facc,
          styles_2.s2ffff9,
          styles_2.s3b7916ca,
          styles_2.sa145969,
          styles_2.sc6ed1702,
          styles_2.s5d936fb,
          styles_2.sf799897a,
          styles_2.sc5dd13f4,
          styles_2.s3484a7,
          styles_2.s349b27,
          styles_2.sab7cc6fa,
        ).className || '',
        stylex.props(styles_3.sdca6904b, styles_3.s56ed324e).className || '',
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className={stylex.props(styles.scca54036).className || ''}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className={stylex.props(styles.sca3de968).className || ''} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}
function DropdownMenuRadioGroup({...props}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        stylex.props(
          styles_2.s3e3e7330,
          styles_2.s758c8268,
          styles_2.s254b9195,
          styles_2.sdef3facc,
          styles_2.s2ffff9,
          styles_2.s3b7916ca,
          styles_2.sa145969,
          styles_2.sc6ed1702,
          styles_2.s5d936fb,
          styles_2.sf799897a,
          styles_2.sc5dd13f4,
          styles_2.s3484a7,
          styles_2.s349b27,
          styles_2.sab7cc6fa,
        ).className || '',
        stylex.props(styles_3.sdca6904b, styles_3.s56ed324e).className || '',
        className,
      )}
      {...props}
    >
      <span className={stylex.props(styles.scca54036).className || ''}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className={stylex.props(styles.s70543fa9).className || ''} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        stylex.props(styles_2.s34b1ad, styles_2.sc5dd13f4, styles_2.sab7cc6fa, styles_2.s129e46b3).className || '',
        stylex.props(styles_3.s2a9f2309).className || '',
        className,
      )}
      {...props}
    />
  )
}
function DropdownMenuSeparator({className, ...props}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(stylex.props(styles.s2b9c850d).className || '', className)}
      {...props}
    />
  )
}
function DropdownMenuShortcut({className, ...props}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(stylex.props(styles.s40833f27).className || '', className)}
      {...props}
    />
  )
}
function DropdownMenuSub({...props}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        stylex.props(
          styles_2.s3e3e7330,
          styles_2.s758c8268,
          styles_2.s254b9195,
          styles_2.sdef3facc,
          styles_2.s2ffff9,
          styles_2.s3b7916ca,
          styles_2.sa145969,
          styles_2.sc6ed1702,
          styles_2.s5d936fb,
          styles_2.sf799897a,
          styles_2.s34b1ad,
          styles_2.sc5dd13f4,
          styles_2.sab7cc6fa,
        ).className || '',
        stylex.props(
          styles_3.s8c130211,
          styles_3.sabf0be23,
          styles_3.sfa3b6533,
          styles_3.sdca6904b,
          styles_3.s2a9f2309,
          styles_3.s56ed324e,
        ).className || '',
        stylex.props(styles_4.s107d54c6).className || '',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className={stylex.props(styles.sd5d229cb).className || ''} />
    </DropdownMenuPrimitive.SubTrigger>
  )
}
function DropdownMenuSubContent({className, ...props}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        stylex.props(
          styles_2.s56bd391d,
          styles_2.s9a29c60b,
          styles_2.s9ce4c292,
          styles_2.s3824ce,
          styles_2.s94be9ef1,
          styles_2.s92852dd5,
          styles_2.sf79988b7,
          styles_2.sad8c742c,
          styles_2.s1aa14,
          styles_2.s8a6c2948,
          floatingContent.base,
          floatingContent.bottom,
          floatingContent.left,
          floatingContent.right,
          floatingContent.top,
        ).className || '',
        className,
      )}
      {...props}
    />
  )
}
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
