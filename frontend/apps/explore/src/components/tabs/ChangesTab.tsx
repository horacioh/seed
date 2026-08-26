import * as stylex from '@stylexjs/stylex'
import {packHmId, type UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {History} from 'lucide-react'
import React, {useMemo} from 'react'
import {useHmNavigate} from '../../utils/useHmNavigate'
import DataViewer from '../DataViewer'
import EmptyState from '../EmptyState'

/** Renders document changes with hypermedia-friendly IDs and links. */
const styles = stylex.create({
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
})
const ChangesTab: React.FC<{
  changes: any[] | undefined
  docId: UnpackedHypermediaId
}> = ({changes, docId}) => {
  const navigate = useHmNavigate()
  const preparedChanges = useMemo(() => {
    if (!Array.isArray(changes)) {
      console.warn('Changes is not an array:', changes)
      return []
    }
    return changes.map((change) => {
      const {id, author, deps, ...rest} = change
      const out = {
        ...rest,
      }
      if (author) {
        out.author = `hm://${author}`
      }
      if (id) {
        out.id = `ipfs://${id}`
        out.version = packHmId({
          ...docId,
          version: id,
        })
      }
      if (deps) {
        out.deps = deps.map((dep: string) => `ipfs://${dep}`)
        if (deps.length > 1) {
          out.mergedFrom = deps.length
        }
      }
      return out
    })
  }, [changes, docId])
  if (!Array.isArray(changes) || changes.length === 0) {
    return <EmptyState message="No changes available" icon={History} />
  }
  return (
    <div className={stylex.props(styles.sfbc6e290).className || ''}>
      {preparedChanges.map((change) => (
        <div key={change.id}>
          <DataViewer data={change} onNavigate={navigate} />
        </div>
      ))}
    </div>
  )
}
export default ChangesTab
