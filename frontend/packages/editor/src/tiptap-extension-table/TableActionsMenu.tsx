import * as stylex from '@stylexjs/stylex'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {SizableText} from '@shm/ui/text'
const styles = stylex.create({
  scdb8b145: {
    width: 'auto',
  },
  sf3a33fae: {
    minWidth: '12rem',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s95afba94: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
  },
  scdbaf625: {
    width: '100%',
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
  sbf63b0a7: {
    textAlign: 'left',
  },
  s933f49de: {
    ':disabled': {
      pointerEvents: 'none',
    },
  },
  s8658d75b: {
    ':disabled': {
      opacity: '50%',
    },
  },
})
export type TableMenuItem = {
  key: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

/**
 * Floating action menu for the table row / column strips.
 */
export function TableActionsMenu({
  open,
  onOpenChange,
  items,
  align = 'start',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: TableMenuItem[]
  align?: 'start' | 'center' | 'end'
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span
          aria-hidden
          style={{
            display: 'block',
            width: 1,
            height: 1,
            pointerEvents: 'none',
          }}
          data-table-menu-anchor
        />
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side="bottom"
        className={stylex.props(styles.scdb8b145, styles.sf3a33fae, styles.s1aa14).className || ''}
        // Keep focus in the editor.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className={stylex.props(styles.s2ffff9, styles.s67e351ac).className || ''}>
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              className={
                stylex.props(
                  styles.s95afba94,
                  styles.s2ffff9,
                  styles.scdbaf625,
                  styles.sc6ed1702,
                  styles.s5d936fb,
                  styles.sf799897a,
                  styles.s34b1ad,
                  styles.sc5dd13f4,
                  styles.sbf63b0a7,
                  styles.s933f49de,
                  styles.s8658d75b,
                ).className || ''
              }
              // Don't let the press blur the editor or move the caret.
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation()
                if (item.disabled) return
                item.onClick?.()
                onOpenChange(false)
              }}
            >
              {item.icon}
              <SizableText>{item.label}</SizableText>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
