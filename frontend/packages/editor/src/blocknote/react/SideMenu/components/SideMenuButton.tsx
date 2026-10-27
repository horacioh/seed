import {ActionIcon, ActionIconProps, useMantineTheme} from '@mantine/core'
import {forwardRef, ReactNode} from 'react'

export const SideMenuButton = forwardRef<HTMLButtonElement, ActionIconProps & {children: ReactNode}>((props, ref) => {
  const theme = useMantineTheme()
  const {children, ...buttonProps} = props

  return (
    <ActionIcon
      {...buttonProps}
      ref={ref}
      type="button"
      size={24}
      sx={{
        '&:focus-visible': {
          outline: '2px solid var(--ring)',
          outlineOffset: 2,
        },
        '&:hover': {
          backgroundColor: theme.other.hovered?.background || theme.colors.gray[1],
          color: theme.other.hovered?.text || theme.black,
        },
      }}
    >
      {children}
    </ActionIcon>
  )
})
