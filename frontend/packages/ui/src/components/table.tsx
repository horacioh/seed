import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {cn} from '../utils'
const styles_3 = stylex.create({
  s95db2ff: {
    ':is([data-state="selected"])': {
      backgroundColor: 'var(--muted)',
    },
  },
})
const styles_2 = stylex.create({
  s8ce93e47: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
  },
  s7c401f13: {
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s9c668509: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
      },
    },
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: {
      default: '1px',
      ':is(tbody > tr:last-child, tfoot > tr:last-child)': '0px',
    },
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s2ff5a4: {
    height: 'calc(0.25rem * 10)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  s43a3ad5d: {
    verticalAlign: 'middle',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  checkboxCell: {
    ':has([role="checkbox"])': {
      paddingRight: '0',
    },
  },
})
const styles = stylex.create({
  sd7102eb3: {
    position: 'relative',
    width: '100%',
    overflow: 'auto',
  },
  sc29c0527: {
    width: '100%',
    captionSide: 'bottom',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s68ac2723: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 4)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({className, ...props}, ref) => (
    <div className={stylex.props(styles.sd7102eb3).className || ''}>
      <table
        ref={ref}
        data-slot="table"
        className={cn(stylex.props(styles.sc29c0527).className || '', className)}
        {...props}
      />
    </div>
  ),
)
Table.displayName = 'Table'
const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({className, ...props}, ref) => <thead ref={ref} className={className} {...props} />,
)
TableHeader.displayName = 'TableHeader'
const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({className, ...props}, ref) => <tbody ref={ref} className={className} {...props} />,
)
TableBody.displayName = 'TableBody'
const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({className, ...props}, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        stylex.props(styles_2.s8ce93e47, styles_2.s7c401f13, styles_2.s129e46b3).className || '',
        className,
      )}
      {...props}
    />
  ),
)
TableFooter.displayName = 'TableFooter'
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({className, ...props}, ref) => (
    <tr
      ref={ref}
      className={cn(
        stylex.props(styles_2.s1a01a0ed, styles_2.s9c668509, styles_2.s7c401f01, styles_2.sf7fb00e8).className || '',
        stylex.props(styles_3.s95db2ff).className || '',
        className,
      )}
      {...props}
    />
  ),
)
TableRow.displayName = 'TableRow'
const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({className, ...props}, ref) => (
    <th
      ref={ref}
      className={cn(
        stylex.props(
          styles_2.sf2718385,
          styles_2.s2ff5a4,
          styles_2.s34b1ad,
          styles_2.sbf63b0a7,
          styles_2.s43a3ad5d,
          styles_2.s129e46b3,
          styles_2.checkboxCell,
        ).className || '',
        className,
      )}
      {...props}
    />
  ),
)
TableHead.displayName = 'TableHead'
const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({className, ...props}, ref) => (
    <td
      ref={ref}
      className={cn(
        stylex.props(styles_2.s1aa15, styles_2.s43a3ad5d, styles_2.checkboxCell).className || '',
        className,
      )}
      {...props}
    />
  ),
)
TableCell.displayName = 'TableCell'
const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({className, ...props}, ref) => (
    <caption ref={ref} className={cn(stylex.props(styles.s68ac2723).className || '', className)} {...props} />
  ),
)
TableCaption.displayName = 'TableCaption'
export {Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption}
