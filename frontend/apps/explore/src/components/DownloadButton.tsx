import * as stylex from '@stylexjs/stylex'
import React from 'react'
import {Download} from 'lucide-react'
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
interface DownloadButtonProps {
  url: string
}
export const DownloadButton: React.FC<DownloadButtonProps> = ({url}) => {
  const handleDownload = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <button
      onClick={handleDownload}
      className="ml-2 p-2 text-gray-500 transition-colors hover:text-gray-700"
      title="Download"
    >
      <Download className={stylex.props(styles.sca3de968).className || ''} />
    </button>
  )
}
