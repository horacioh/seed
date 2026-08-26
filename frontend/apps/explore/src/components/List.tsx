import * as stylex from '@stylexjs/stylex'
import {useRootDocuments} from '@shm/shared'
import {useApiHost} from '../apiHostStore'
import {DocumentListItem} from './tabs/DocumentListItem'
const styles = stylex.create({
  s452fb49b: {
    marginBottom: 'calc(0.25rem * 6)',
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)',
  },
})
export default function List() {
  const {data, isLoading} = useRootDocuments()
  const apiHost = useApiHost()
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className={stylex.props(styles.s452fb49b).className || ''}>All Hypermedia Spaces</h1>
      {isLoading && <p>Loading…</p>}
      {data && (
        <div className="space-y-2">
          {data.accounts.map((doc) => {
            return <DocumentListItem key={doc.id.id} doc={doc} apiHost={apiHost} />
          })}
        </div>
      )}
    </div>
  )
}
