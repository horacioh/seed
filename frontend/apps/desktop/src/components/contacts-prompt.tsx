import * as stylex from '@stylexjs/stylex'
import {useGatewayUrl} from '@/models/gateway-settings'
import {encode as cborEncode} from '@ipld/dag-cbor'
import {Button} from '@shm/ui/button'
import {DialogClose, DialogDescription, DialogTitle} from '@shm/ui/components/dialog'
import {Textarea} from '@shm/ui/components/textarea'
import {CopyUrlField} from '@shm/ui/copy-url-field'
import {UserPlus} from '@shm/ui/icons'
import {Spinner} from '@shm/ui/spinner'
import {toast} from '@shm/ui/toast'
import {base58btc} from 'multiformats/bases/base58'
import {useMemo, useState} from 'react'
import appError from '../errors'
import {useConnectPeer} from '../models/contacts'
import {useDaemonInfo} from '../models/daemon'
import {usePeerInfo} from '../models/networking'
const styles_2 = stylex.create({
  s158c30ca: {
    maxHeight: 'calc(0.25rem * 40)',
  },
})
const styles = stylex.create({
  s5f6cd3a4: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s9a378369: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export function AddConnectionDialog({input, onClose}: {onClose: () => void; input: true}) {
  const [peerText, setPeer] = useState('')
  const daemonInfo = useDaemonInfo()
  const deviceId = daemonInfo.data?.peerId
  const peerInfo = usePeerInfo(deviceId)
  const gatewayUrl = useGatewayUrl()
  const connect = useConnectPeer({
    onSuccess: () => {
      onClose()
      toast.success('Connection Added')
    },
    onError: (error) => {
      // @ts-expect-error
      appError(`Connect to peer error: ${error?.rawMessage}`, {
        error,
      })
    },
  })
  const connectInfo = useMemo(() => {
    if (!deviceId || !peerInfo.data?.addrs?.length) return null
    return base58btc.encode(
      cborEncode({
        a: peerInfo.data?.addrs.map((addr) => {
          return addr.split('/p2p/').slice(0, -1).join('/p2p/')
        }),
        d: deviceId,
      }),
    )
  }, [
    deviceId,
    peerInfo.data?.addrs?.length, // explicitly using addrs length because the address list is being polled and frequently changes order, which does not affect connecivity
  ])
  return (
    <>
      <DialogTitle>Direct Peer Connection</DialogTitle>
      <DialogClose />

      <DialogDescription>
        Share your device connection URL with someone who you want to connect with:{' '}
      </DialogDescription>
      {deviceId && <CopyUrlField label="Device Connection URL" url={`${gatewayUrl.data}/hm/connect#${connectInfo}`} />}
      <DialogDescription>Paste other people&apos;s connection URL here:</DialogDescription>
      <Textarea
        value={peerText}
        onChange={(e) => setPeer(e.target.value)}
        rows={4}
        data-testid="add-contact-input"
        className={stylex.props(styles_2.s158c30ca).className || ''}
      />
      <DialogDescription>You can also paste the full peer address here.</DialogDescription>

      <div className={stylex.props(styles.s5f6cd3a4).className || ''}>
        <Button onClick={() => connect.mutate(peerText)} disabled={!peerText} variant="default" size="sm">
          <UserPlus className={stylex.props(styles.sca3de967).className || ''} />
          Connect to Peer
        </Button>
        {connect.isLoading ? (
          <div className={stylex.props(styles.s9a378369).className || ''}>
            <Spinner />
          </div>
        ) : null}
      </div>
    </>
  )
}
