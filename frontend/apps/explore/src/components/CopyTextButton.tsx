import * as stylex from '@stylexjs/stylex'
import React from 'react'
import {Copy} from 'lucide-react'
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
interface CopyTextButtonProps {
  text: string
}
export const CopyTextButton: React.FC<CopyTextButtonProps> = ({text}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-2 text-gray-500 transition-colors hover:text-gray-700"
      title="Copy to clipboard"
    >
      <Copy className={stylex.props(styles.sca3de968).className || ''} />
    </button>
  )
}
