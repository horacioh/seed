import * as stylex from '@stylexjs/stylex'
import {useCID} from '@shm/shared'
import {base58btc} from 'multiformats/bases/base58'
import React, {useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {useHmNavigate} from '../utils/useHmNavigate'
import {useApiHost} from '../apiHostStore'
import {CopyTextButton} from './CopyTextButton'
import {DataViewer} from './DataViewer'
import {DownloadButton} from './DownloadButton'
import {Title} from './Title'
const styles = stylex.create({
  s33458e: {
    marginTop: 'calc(0.25rem * 4)',
  },
})
const IPFS: React.FC = () => {
  const {cid} = useParams()
  const apiHost = useApiHost()
  const {data} = useCID(cid)
  const navigate = useHmNavigate()
  const revisedData = useMemo(() => {
    if (!data?.value) return null
    const cleaned = cleanIPLDData(data.value)
    if (cleaned.signer && cleaned.signer instanceof Uint8Array) {
      cleaned.signer = `hm://${base58btc.encode(cleaned.signer)}`
    }
    return cleaned
  }, [data])
  return (
    <div className="container mx-auto p-4">
      <Title
        buttons={
          <>
            <CopyTextButton text={`ipfs://${cid}`} />
            <DownloadButton url={`${apiHost}/ipfs/${cid}`} />
          </>
        }
        title={`ipfs://${cid}`}
      />
      {revisedData && (
        <div className={stylex.props(styles.s33458e).className || ''}>
          <DataViewer data={revisedData} onNavigate={navigate} />
        </div>
      )}
    </div>
  )
}
function cleanIPLDData(data: any): any {
  if (!data) return null
  if (typeof data === 'object' && data['/']) {
    if (typeof data['/'] === 'object' && data['/'].bytes) {
      const binaryString = atob(data['/'].bytes)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes
    }
    return `ipfs://${data['/']}`
  }
  if (Array.isArray(data)) {
    return data.map((item) => cleanIPLDData(item))
  }
  if (typeof data === 'object') {
    const result: Record<string, any> = {}
    for (const key in data) {
      result[key] = cleanIPLDData(data[key])
    }
    return result
  }
  return data
}
export default IPFS
