import * as stylex from '@stylexjs/stylex'
import type {HTMLAttributes, ReactNode} from 'react'
import {widthValues} from './layout'
import {PageLayout} from './page-layout'
import {Spinner} from './spinner'
import {Text} from './text'
import {cn} from './utils'

/** GeneralPageSurface provides the shared page background for feed-like pages. */
const styles = stylex.create({
  se290a8f0: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingTop: 'calc(0.25rem * 8)',
  },
  sbbe27b51: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s7778dfea: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
})
export function GeneralPageSurface({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('dark:bg-background flex flex-1 flex-col bg-white', className)} {...props} />
}

/** GeneralPageContainer constrains and spaces feed-like page content. */
export function GeneralPageContainer({
  contentMaxWidth = widthValues.M,
  className,
  children,
}: {
  contentMaxWidth?: number
  className?: string
  children: ReactNode
}) {
  return (
    <PageLayout contentMaxWidth={contentMaxWidth}>
      <div className={cn(stylex.props(styles.se290a8f0).className || '', className)}>{children}</div>
    </PageLayout>
  )
}

/** GeneralPageHeader renders the shared title/action row for feed-like pages. */
export function GeneralPageHeader({
  title,
  loading = false,
  actions,
  className,
}: {
  title: ReactNode
  loading?: boolean
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn(stylex.props(styles.sbbe27b51).className || '', className)}>
      <div className="flex min-w-0 items-center gap-2">
        {typeof title === 'string' ? (
          <Text weight="bold" size="3xl" className={stylex.props(styles.s6e724d66).className || ''}>
            {title}
          </Text>
        ) : (
          title
        )}
        {loading ? <Spinner /> : null}
      </div>
      {actions ? <div className={stylex.props(styles.s7778dfea).className || ''}>{actions}</div> : null}
    </div>
  )
}
