import * as stylex from '@stylexjs/stylex'
import {ReactNode} from 'react'
import {Text} from './text'

/**
 * Consistent layout wrapper for full-page content (activity, discussions, directory, etc.)
 * Parent component (ResourcePage) handles scrolling - this just provides layout structure.
 */
const styles = stylex.create({
  s486e68e8: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sb42feb5d: {
    flex: '1',
  },
})
export function PageLayout({
  title,
  headerRight,
  children,
  contentMaxWidth,
}: {
  title?: string
  headerRight?: ReactNode
  children: ReactNode
  contentMaxWidth?: number
}) {
  const hasHeader = title || headerRight
  const maxWidthStyle = contentMaxWidth
    ? {
        maxWidth: contentMaxWidth,
      }
    : undefined
  const maxWidthClass = contentMaxWidth ? '' : 'max-w-[calc(85ch+1em)]'
  return (
    <div className={stylex.props(styles.s486e68e8).className || ''}>
      {/* Header */}
      {hasHeader && (
        <div className={stylex.props(styles.sf032ed6c).className || ''}>
          <div className={`mx-auto flex w-full items-center gap-4 ${maxWidthClass}`} style={maxWidthStyle}>
            {title && (
              <Text weight="bold" size="2xl" className={stylex.props(styles.sb42feb5d).className || ''}>
                {title}
              </Text>
            )}
            {headerRight}
          </div>
        </div>
      )}
      {/* Content - no scroll, parent handles it */}
      <div className={stylex.props(styles.sb42feb5d).className || ''}>
        <div className={`mx-auto w-full ${maxWidthClass}`} style={maxWidthStyle}>
          {children}
        </div>
      </div>
    </div>
  )
}
