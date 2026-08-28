import * as stylex from '@stylexjs/stylex'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import {cn} from './utils'
const styles_2 = stylex.create({
  sfd403d13: {
    ':is([data-orientation="horizontal"])': {
      height: '1px',
    },
  },
  sc7b96c2b: {
    ':is([data-orientation="horizontal"])': {
      width: '100%',
    },
  },
  s709db9b6: {
    ':is([data-orientation="vertical"])': {
      width: '1px',
    },
  },
})
const styles = stylex.create({
  s87d06ab4: {
    backgroundColor: 'var(--border)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
})
export function Separator({vertical = false, className}: {vertical?: boolean; className?: string}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative
      orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn(
        stylex.props(styles.s87d06ab4, styles.sf032ed6c).className || '',
        stylex.props(styles_2.sfd403d13, styles_2.sc7b96c2b, styles_2.s709db9b6).className || '',
        className,
      )}
    />
  )
}
