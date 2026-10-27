import {Menu} from '@mantine/core'
import {PolymorphicComponentProps} from '@mantine/utils'

export const DragHandleMenuItem = (props: PolymorphicComponentProps<'button'>) => {
  const {children, ...remainingProps} = props
  return (
    <Menu.Item role="menuitem" {...remainingProps}>
      {children}
    </Menu.Item>
  )
}
