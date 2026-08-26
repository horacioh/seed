import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {cn} from '../utils'
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
    <div className={[stylex.props(styles.sd7102eb3).className || '', className].filter(Boolean).join(' ')}>
      <table ref={ref} className={cn(stylex.props(styles.sc29c0527).className || '', className)} {...props} />
    </div>
  ),
)
Table.displayName = 'Table'
const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({className, ...props}, ref) => <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />,
)
TableHeader.displayName = 'TableHeader'
const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({className, ...props}, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  ),
)
TableBody.displayName = 'TableBody'
const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({className, ...props}, ref) => (
    <tfoot ref={ref} className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)} {...props} />
  ),
)
TableFooter.displayName = 'TableFooter'
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({className, ...props}, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-border hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
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
        'text-muted-foreground h-10 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
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
      className={cn('p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', className)}
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
