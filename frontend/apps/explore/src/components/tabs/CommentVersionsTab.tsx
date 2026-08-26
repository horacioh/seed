import * as stylex from '@stylexjs/stylex'
import {commentIdToHmId, packHmId} from '@shm/shared'
import {History} from 'lucide-react'
import React, {useMemo} from 'react'
import {useHmNavigate} from '../../utils/useHmNavigate'
import DataViewer from '../DataViewer'
import EmptyState from '../EmptyState'

/** Renders comment edit history with links to each exact comment version. */
const styles = stylex.create({
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
})
const CommentVersionsTab: React.FC<{
  versions: any[] | undefined
}> = ({versions}) => {
  const navigate = useHmNavigate()
  const preparedVersions = useMemo(() => {
    if (!Array.isArray(versions)) {
      console.warn('Comment versions is not an array:', versions)
      return []
    }
    return versions.map((version) => {
      const out: Record<string, any> = {
        ...version,
      }
      if (version.author) {
        out.author = `hm://${version.author}`
      }
      if (version.id && version.version) {
        out.exactVersion = packHmId(commentIdToHmId(version.id, version.version))
      }
      return out
    })
  }, [versions])
  if (!Array.isArray(versions) || versions.length === 0) {
    return <EmptyState message="No versions available" icon={History} />
  }
  return (
    <div className={stylex.props(styles.sfbc6e290).className || ''}>
      {preparedVersions.map((version) => (
        <div key={`${version.id}:${version.version}`}>
          <DataViewer data={version} onNavigate={navigate} />
        </div>
      ))}
    </div>
  )
}
export default CommentVersionsTab
