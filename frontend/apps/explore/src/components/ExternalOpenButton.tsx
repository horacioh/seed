import * as stylex from '@stylexjs/stylex'
import React from 'react'
import {ExternalLink} from 'lucide-react'
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
interface ExternalOpenButtonProps {
  url: string
}
export const ExternalOpenButton: React.FC<ExternalOpenButtonProps> = ({url}) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <button
      onClick={handleClick}
      className="ml-2 p-2 text-gray-500 transition-colors hover:text-gray-700"
      title="Open in new tab"
    >
      <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
    </button>
  )
}
export const OpenInAppButton: React.FC<ExternalOpenButtonProps> = ({url}) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <button
      onClick={handleClick}
      className="ml-2 p-2 text-green-500 transition-colors hover:text-green-700"
      title="Open in Seed App"
    >
      <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
    </button>
  )
}
