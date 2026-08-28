import * as stylex from '@stylexjs/stylex'
import * as MenubarPrimitive from '@radix-ui/react-menubar'
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
  saa8fdca7: {
    ':is([data-state="open"])': {
      backgroundColor: 'var(--accent)',
    },
  },
  s4aa67251: {
    ':is([data-state="open"])': {
      color: 'var(--accent-foreground)',
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
  s2ffff9: {
    display: 'flex',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  s34b1ac: {
    paddingInline: 'calc(0.25rem * 1)',
  },
  s34b56d: {
    paddingBlock: 'calc(0.25rem * 1)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  s56bd391d: {
    backgroundColor: 'var(--popover)',
  },
  s9a29c60b: {
    color: 'var(--popover-foreground)',
  },
  s72975e8b: {
    transformOrigin: 'var(--radix-menubar-content-transform-origin)',
  },
  s3824ce: {
    zIndex: '50',
  },
  sf3a33fae: {
    minWidth: '12rem',
  },
  s92852dd5: {
    overflow: 'hidden',
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
  sdef3facc: {
    position: 'relative',
  },
  s3b7916ca: {
    cursor: 'default',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  sf7998a1b: {
    borderRadius: '0.125rem',
  },
  s3484a7: {
    paddingLeft: 'calc(0.25rem * 8)',
  },
  s349b27: {
    paddingRight: 'calc(0.25rem * 2)',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  s94be9ef1: {
    minWidth: '8rem',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
})
const styles = stylex.create({
  s86ff3e3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
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
function Menubar({className, ...props}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        // 'bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs',
        stylex.props(styles.s86ff3e3).className || '',
        className,
      )}
      {...props}
    />
  )
}
function MenubarMenu({...props}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}
function MenubarGroup({...props}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}
function MenubarPortal({...props}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}
function MenubarRadioGroup({...props}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}
function MenubarTrigger({className, ...props}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        stylex.props(
          styles_2.s3e3e7330,
          styles_2.s758c8268,
          styles_2.s254b9195,
          styles_2.s2ffff9,
          styles_2.sa145969,
          styles_2.sc6ed1702,
          styles_2.sf799897a,
          styles_2.s34b1ac,
          styles_2.s34b56d,
          styles_2.sab7cc6fa,
          styles_2.s129e46b3,
        ).className || '',
        stylex.props(styles_3.saa8fdca7, styles_3.s4aa67251).className || '',
        className,
      )}
      {...props}
    />
  )
}
function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          stylex.props(
            styles_2.s56bd391d,
            styles_2.s9a29c60b,
            styles_2.s72975e8b,
            styles_2.s3824ce,
            styles_2.sf3a33fae,
            styles_2.s92852dd5,
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
    </MenubarPortal>
  )
}
function MenubarItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
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
function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        stylex.props(
          styles_2.s3e3e7330,
          styles_2.s758c8268,
          styles_2.sf7998a1b,
          styles_2.s254b9195,
          styles_2.sdef3facc,
          styles_2.s2ffff9,
          styles_2.s3b7916ca,
          styles_2.sa145969,
          styles_2.sc6ed1702,
          styles_2.s5d936fb,
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
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className={stylex.props(styles.sca3de968).className || ''} />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}
function MenubarRadioItem({className, children, ...props}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        stylex.props(
          styles_2.s3e3e7330,
          styles_2.s758c8268,
          styles_2.sf7998a1b,
          styles_2.s254b9195,
          styles_2.sdef3facc,
          styles_2.s2ffff9,
          styles_2.s3b7916ca,
          styles_2.sa145969,
          styles_2.sc6ed1702,
          styles_2.s5d936fb,
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
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className={stylex.props(styles.s70543fa9).className || ''} />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}
function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
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
function MenubarSeparator({className, ...props}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn(stylex.props(styles.s2b9c850d).className || '', className)}
      {...props}
    />
  )
}
function MenubarShortcut({className, ...props}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(stylex.props(styles.s40833f27).className || '', className)}
      {...props}
    />
  )
}
function MenubarSub({...props}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}
function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        stylex.props(
          styles_2.s3e3e7330,
          styles_2.s758c8268,
          styles_2.s2ffff9,
          styles_2.s3b7916ca,
          styles_2.sa145969,
          styles_2.sc6ed1702,
          styles_2.sf799897a,
          styles_2.s34b1ad,
          styles_2.sc5dd13f4,
          styles_2.sab7cc6fa,
          styles_2.sa602a1e3,
        ).className || '',
        stylex.props(styles_3.saa8fdca7, styles_3.s4aa67251, styles_3.s2a9f2309).className || '',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className={stylex.props(styles.sd5d229cb).className || ''} />
    </MenubarPrimitive.SubTrigger>
  )
}
function MenubarSubContent({className, ...props}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        stylex.props(
          styles_2.s56bd391d,
          styles_2.s9a29c60b,
          styles_2.s72975e8b,
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
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
}
