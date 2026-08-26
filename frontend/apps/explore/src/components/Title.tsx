import * as stylex from '@stylexjs/stylex'
import React from 'react'
const styles = stylex.create({
  s3af1a4d9: {
    display: 'flex',
    flexShrink: '0',
  },
})
interface TitleProps {
  title: string
  className?: string
  buttons?: React.ReactNode
}
export const Title: React.FC<TitleProps> = ({title, className = '', buttons}) => {
  // strip off trailing slash
  const displayTitle = title.replace(/\/$/, '')
  return (
    <div className={`flex w-full flex-wrap items-center gap-2 ${className}`}>
      <h1 className="min-w-0 flex-grow overflow-hidden text-2xl font-bold break-words">{displayTitle}</h1>
      {buttons && <div className={stylex.props(styles.s3af1a4d9).className || ''}>{buttons}</div>}
    </div>
  )
}
