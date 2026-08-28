import * as stylex from '@stylexjs/stylex'
import isEqual from 'lodash/isEqual'
import {Button, ButtonProps} from './button'
import {cn} from './utils'
const styles_2 = stylex.create({
  s57ab1d06: {
    borderColor: 'var(--overlay-15)',
    backgroundColor: 'var(--overlay-10)',
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'var(--overlay-20)',
        backgroundColor: 'var(--overlay-15)',
      },
    },
  },
})
const styles = stylex.create({
  s6558a016: {
    marginInline: 'calc(0.25rem * -1)',
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s12331fc5: {
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(0.25rem * 2.5)',
  },
})
export function FeedFilters({filterEventType, onFilterChange}: {onFilterChange: any; filterEventType?: Array<string>}) {
  return (
    <div className={stylex.props(styles.s6558a016).className || ''}>
      <PredefinedFilter
        className={cn(
          stylex.props(!filterEventType || filterEventType.length === 0 ? styles_2.s57ab1d06 : null).className || '',
        )}
        onClick={() =>
          onFilterChange({
            filterEventType: [],
          })
        }
      >
        All
      </PredefinedFilter>
      <PredefinedFilter
        className={cn(stylex.props(isEqual(filterEventType, ['Comment']) ? styles_2.s57ab1d06 : null).className || '')}
        onClick={() =>
          onFilterChange({
            filterEventType: ['Comment'],
          })
        }
      >
        Comments
      </PredefinedFilter>
      <PredefinedFilter
        className={cn(stylex.props(isEqual(filterEventType, ['Ref']) ? styles_2.s57ab1d06 : null).className || '')}
        onClick={() =>
          onFilterChange({
            filterEventType: ['Ref'],
          })
        }
      >
        Updates
      </PredefinedFilter>
      <PredefinedFilter
        className={cn(
          stylex.props(
            isEqual(filterEventType, ['comment/Embed', 'doc/Embed', 'doc/Link', 'doc/Button'])
              ? styles_2.s57ab1d06
              : null,
          ).className || '',
        )}
        onClick={() =>
          onFilterChange({
            filterEventType: ['comment/Embed', 'doc/Embed', 'doc/Link', 'doc/Button'],
          })
        }
      >
        Citation
      </PredefinedFilter>
      {/* <MoreFilters /> */}
    </div>
  )
}
function PredefinedFilter({className, ...props}: ButtonProps) {
  return (
    <Button
      className={cn(stylex.props(styles.s12331fc5).className || '', className)}
      size="xs"
      variant="outline"
      {...props}
    >
      {props.children}
    </Button>
  )
}

// function MoreFilters() {
//   return (
//     <PredefinedFilter variant="ghost">
//       <Plus className="size-3" />
//       Filter
//       <Badge variant="default">3</Badge>
//     </PredefinedFilter>
//   )
// }
