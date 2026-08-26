import * as stylex from '@stylexjs/stylex'
import {Quote} from 'lucide-react'
import React, {useMemo} from 'react'
import {useHmNavigate} from '../../utils/useHmNavigate'
import DataViewer from '../DataViewer'
import EmptyState from '../EmptyState'
const styles = stylex.create({
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
})
const CitationsTab: React.FC<{
  citations: any[] | undefined
}> = ({citations}) => {
  const navigate = useHmNavigate()
  const preparedCitations = useMemo(() => {
    if (!Array.isArray(citations)) {
      console.warn('Citations is not an array:', citations)
      return []
    }
    return citations.map((citation) => {
      const {sourceBlob, ...rest} = citation
      const out = {
        ...rest,
      }
      if (sourceBlob) {
        const {cid, author, ...rest} = sourceBlob
        out.sourceBlob = {
          id: `ipfs://${cid}`,
          author: `hm://${author}`,
          ...rest,
        }
      }
      return out
    })
  }, [citations])
  if (!Array.isArray(citations) || citations.length === 0) {
    return <EmptyState message="No citations available" icon={Quote} />
  }
  return (
    <div className={stylex.props(styles.sfbc6e290).className || ''}>
      {preparedCitations.map((citation) => (
        <div key={citation.id}>
          <DataViewer data={citation} onNavigate={navigate} />
        </div>
      ))}
    </div>
  )
}
export default CitationsTab
