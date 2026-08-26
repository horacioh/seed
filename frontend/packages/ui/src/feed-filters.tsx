import * as stylex from '@stylexjs/stylex'
import isEqual from 'lodash/isEqual'
import {Button, ButtonProps} from './button'
import {cn} from './utils'
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
          (!filterEventType || filterEventType.length === 0) &&
            'border-black/15 bg-black/10 hover:border-black/20 hover:bg-black/15 dark:border-white/15 dark:bg-white/10 dark:hover:border-white/20 hover:dark:bg-white/15',
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
        className={cn(
          isEqual(filterEventType, ['Comment']) &&
            'border-black/15 bg-black/10 hover:border-black/20 hover:bg-black/15 dark:border-white/15 dark:bg-white/10 dark:hover:border-white/20 hover:dark:bg-white/15',
        )}
        onClick={() =>
          onFilterChange({
            filterEventType: ['Comment'],
          })
        }
      >
        Comments
      </PredefinedFilter>
      <PredefinedFilter
        className={cn(
          isEqual(filterEventType, ['Ref']) &&
            'border-black/15 bg-black/10 hover:border-black/20 hover:bg-black/15 dark:border-white/15 dark:bg-white/10 dark:hover:border-white/20 hover:dark:bg-white/15',
        )}
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
          isEqual(filterEventType, ['comment/Embed', 'doc/Embed', 'doc/Link', 'doc/Button']) &&
            'border-black/15 bg-black/10 hover:border-black/20 hover:bg-black/15 dark:border-white/15 dark:bg-white/10 dark:hover:border-white/20 hover:dark:bg-white/15',
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
