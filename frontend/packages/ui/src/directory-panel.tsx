import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {ReactNode} from 'react'
import {PanelContent} from './accessories'
import {DirectoryEmpty, DirectoryListViewWithActivity, useDirectoryDataWithActivity} from './directory-page'
import {Spinner} from './spinner'
const styles = stylex.create({
  se295dce0: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 4)',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  sa02df2af: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 3)',
  },
})
export function DirectoryPanel({docId, header}: {docId: UnpackedHypermediaId; header?: ReactNode}) {
  const {items, accountsMetadata, isInitialLoading} = useDirectoryDataWithActivity(docId)
  if (isInitialLoading) {
    return (
      <div className={stylex.props(styles.se295dce0).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className={stylex.props(styles.s1aa17).className || ''}>
        <DirectoryEmpty />
        {header ? <div className={stylex.props(styles.sa02df2af).className || ''}>{header}</div> : null}
      </div>
    )
  }
  return (
    <PanelContent header={header}>
      <DirectoryListViewWithActivity items={items} accountsMetadata={accountsMetadata} />
    </PanelContent>
  )
}
