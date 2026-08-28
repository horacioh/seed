import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {SizableText, type SizableTextProps} from './text'
import {cn} from './utils'

const styles = stylex.create({
  wrapper: {
    zIndex: 50,
    margin: 'calc(var(--spacing) * 0)',
    display: 'flex',
    minHeight: '40px',
    width: '100%',
    flex: 'none',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingInline: 'calc(var(--spacing) * 0)',
    paddingBlock: 'calc(var(--spacing) * 0)',
  },
  row: {
    display: 'flex',
    flex: 'none',
    flexShrink: 0,
    flexGrow: 0,
    paddingRight: '0.5rem',
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    userSelect: 'none',
  },
  titleText: {
    color: 'var(--foreground)',
    margin: 0,
    maxWidth: '100%',
    cursor: 'default',
    width: '100%',
    borderRadius: '0.125rem',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textTransform: 'none',
    userSelect: 'none',
    ':hover': {
      textDecoration: 'underline',
      textDecorationColor: 'currentColor',
    },
  },
})

export const TitlebarWrapper = ({className, children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(stylex.props(styles.wrapper).className, className)} {...props}>
    {children}
  </div>
)

export const TitlebarRow = ({className, children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('window-drag', stylex.props(styles.row).className, className)} {...props}>
    {children}
  </div>
)

export const TitlebarSection = ({className, children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('no-window-drag', stylex.props(styles.section).className, className)} {...props}>
    {children}
  </div>
)

export const TitleText = ({className, ...props}: SizableTextProps) => (
  <SizableText size="sm" className={cn(stylex.props(styles.titleText).className, className)} {...props} />
)

export const TitleTextButton = ({className, children, ...props}: React.ComponentProps<'button'>) => (
  <button className={cn(stylex.props(styles.titleText).className, className)} {...props}>
    {children}
  </button>
)
