import * as stylex from '@stylexjs/stylex'
import {useDaemonInfo} from '@/models/daemon'
import {grpcClient} from '@/grpc-client'
import {ConnectionStatus} from '@shm/shared/client/grpc-types'
import {Button} from '@shm/ui/button'
import {DialogTitle} from '@shm/ui/components/dialog'
import {ScrollArea} from '@shm/ui/components/scroll-area'
import {copyTextToClipboard} from '@shm/ui/copy-to-clipboard'
import {Copy, NoConnection} from '@shm/ui/icons'
import {OptionsDropdown} from '@shm/ui/options-dropdown'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {cn} from '@shm/ui/utils'
import {Route} from 'lucide-react'
import React from 'react'
import {HMPeerInfo, useDomainsByPeerId, usePeers} from '../models/networking'
import {AddConnectionDialog} from './contacts-prompt'
const styles_4 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s3f582e18: {
    minHeight: 'calc(0.25rem * 8)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s335491: {
    marginInline: 'calc(0.25rem * 3)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_3 = stylex.create({
  s35a00fab: {
    height: '500px',
    overflow: 'hidden',
  },
})
const styles_2 = stylex.create({
  sa4681c45: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sa4681c44: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s3378d108: {
    maxWidth: 'calc(0.25rem * 32)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
const styles = stylex.create({
  s9141e77: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sd24e1c2c: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 4)',
    padding: 'calc(0.25rem * 4)',
  },
  s77710df4: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 25)',
    height: 'calc(0.25rem * 25)',
  },
  sb9cfe110: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s9a378369: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
const EMPTY_DOMAINS: string[] = []
export function useNetworkDialog() {
  return useAppDialog<true>(NetworkDialog)
}
export function NetworkDialog() {
  const peers = usePeers(false, {
    refetchInterval: 5_000,
  })
  const domainsByPeerId = useDomainsByPeerId({
    refetchInterval: 30_000,
  })
  const {data: deviceInfo} = useDaemonInfo()
  const connectDialog = useAppDialog(AddConnectionDialog)
  return (
    <>
      <DialogTitle>Network Connections</DialogTitle>
      <div className={stylex.props(styles.s9141e77).className || ''}>
        <Button onClick={() => connectDialog.open(true)} size="sm">
          <Route className={stylex.props(styles.sca3de967).className || ''} />
          Add Connection
        </Button>
      </div>
      <div className={stylex.props(styles_3.s35a00fab).className || ''}>
        <ScrollArea>
          {peers.data && peers.data.length ? (
            peers.data.map((peer) => (
              <PeerRow
                key={peer.id}
                peer={peer}
                myProtocol={deviceInfo?.protocolId || ''}
                domains={domainsByPeerId.data?.get(peer.id) || EMPTY_DOMAINS}
              />
            ))
          ) : (
            <div className={stylex.props(styles.sd24e1c2c).className || ''}>
              <NoConnection className={stylex.props(styles.s77710df4).className || ''} />
              <SizableText color="muted" weight="medium" size="xl">
                there are no active connections
              </SizableText>
            </div>
          )}
          {connectDialog.content}
        </ScrollArea>
      </div>
    </>
  )
}
function getProtocolMessage(peer: HMPeerInfo, myProtocol: string) {
  if (!peer.protocol || peer.protocol === myProtocol) {
    return ''
  }
  return ` (Protocol: ${peer.protocol})`
}
const PeerRow = React.memo(function PeerRow({
  peer,
  myProtocol,
  domains,
}: {
  peer: HMPeerInfo
  myProtocol: string
  domains: string[]
}) {
  const {id, connectionStatus, protocol} = peer
  const visibleDomains = domains.slice(0, 2)
  const hiddenDomainCount = domains.length - visibleDomains.length
  // const isSite =
  //   account?.profile?.bio === 'Hypermedia Site. Powered by Mintter.'
  // const label = isSite
  //   ? hostnameStripProtocol(account?.profile?.alias)
  //   : account?.profile?.alias || 'Unknown Account'
  // const spawn = useNavigate('spawn')
  // const openUrl = useOpenUrl()
  // function handlePress() {
  //   if (isSite && account?.profile?.alias) openUrl(account?.profile?.alias)
  //   else if (!isSite && account?.id)
  //     spawn({key: 'document', id: hmId( account.id)})
  //   else toast.error('Could not open account')
  // }
  function handleCopyPeerId() {
    copyTextToClipboard(id)
    toast.success('Copied Peer ID')
  }
  const isConnected = connectionStatus === ConnectionStatus.CONNECTED && protocol === myProtocol
  return (
    <div
      className={
        stylex.props(
          styles_4.s2ffff9,
          styles_4.s3f582e18,
          styles_4.sb42feb5d,
          styles_4.sc6ed1702,
          styles_4.sc1a629cb,
          styles_4.s1aa15,
        ).className || ''
      }
    >
      <div className={stylex.props(styles_2.sa4681c45).className || ''}>
        <Tooltip content={getPeerStatus(connectionStatus) + getProtocolMessage(peer, myProtocol)}>
          <div
            className={cn(stylex.props(styles.sb9cfe110).className || '', getPeerStatusIndicator(peer, myProtocol))}
          />
        </Tooltip>
        <div className={stylex.props(styles_2.sa4681c45).className || ''}>
          <Tooltip content="Copy Peer ID">
            <SizableText onClick={handleCopyPeerId}>{id.substring(id.length - 10)}</SizableText>
          </Tooltip>
          {domains.length ? (
            <Tooltip content={domains.join(', ')}>
              <div className={stylex.props(styles_2.sa4681c44).className || ''}>
                {visibleDomains.map((domain) => (
                  <SizableText
                    key={domain}
                    size="xs"
                    color="muted"
                    className={stylex.props(styles_2.s3378d108).className || ''}
                  >
                    {domain}
                  </SizableText>
                ))}
                {hiddenDomainCount > 0 ? (
                  <SizableText size="xs" color="muted">
                    +{hiddenDomainCount}
                  </SizableText>
                ) : null}
              </div>
            </Tooltip>
          ) : null}
        </div>
      </div>
      <div
        className={
          stylex.props(styles_4.s335491, styles_4.s2ffff9, styles_4.sf032ed6c, styles_4.s5d936fc).className || ''
        }
      >
        {/* <XStack gap="$2">
          {account && !isSite ? (
            <UIAvatar
              size={20}
              onPress={handlePress}
              label={account.profile?.alias}
              url={
                account.profile?.avatar &&
                `${DAEMON_FILE_URL}/${account.profile?.avatar}`
              }
            />
          ) : null}
          <ButtonText
            color={isSite ? '$brand5' : '$gray10'}
            hoverStyle={{
              textDecorationLine: isSite ? 'underline' : 'none',
            }}
            onPress={handlePress}
          >
            {label}
          </ButtonText>
         </XStack> */}
        {isConnected && (
          <SizableText size="xs" color="muted" className={stylex.props(styles_4.s765a26ee).className || ''}>
            Connected
          </SizableText>
        )}
        {peer.protocol && peer.protocol !== myProtocol && (
          <SizableText size="xs" color="muted" className={stylex.props(styles_4.s765a26ee).className || ''}>
            Protocol: {peer.protocol.slice(12)}
          </SizableText>
        )}
        <OptionsDropdown
          hiddenUntilItemHover
          menuItems={[
            // {
            //   key: 'open',
            //   icon: isSite ? ExternalLink : ArrowUpRight,
            //   label: isSite ? 'Open Site' : 'Open Account',
            //   onPress: handlePress,
            // },
            // {
            //   key: 'copy',
            //   icon: Copy,
            //   label: 'Copy Peer ID',
            //   onPress: handleCopyPeerId,
            // },
            {
              key: 'copyAddress',
              icon: <Copy className={stylex.props(styles.sca3de968).className || ''} />,
              label: 'Copy Addresses',
              // Fetch addresses on demand via the per-peer endpoint.
              // The peers-list response no longer carries the multiaddr
              // column to keep that poll cheap; GetPeerInfo reads from
              // libp2p Peerstore and falls back to the peers DB row for
              // gossip-only peers.
              onClick: async () => {
                try {
                  const info = await grpcClient.networking.getPeerInfo({
                    deviceId: id,
                  })
                  if (info?.addrs?.length) {
                    copyTextToClipboard(info.addrs.join(','))
                    toast.success('Copied Peer Addresses')
                  } else {
                    toast.error('No addresses available for this peer')
                  }
                } catch (err) {
                  toast.error('Failed to fetch peer addresses')
                  console.error('Copy Addresses error:', err)
                }
              },
            },
          ]}
        />
      </div>
    </div>
  )
})
function getPeerStatus(status: ConnectionStatus) {
  if (status === ConnectionStatus.CONNECTED) return 'Connected'
  if (status === ConnectionStatus.CAN_CONNECT) return 'Can Connect'
  if (status === ConnectionStatus.CANNOT_CONNECT) return 'Cannot Connect'
  if (status === ConnectionStatus.LIMITED) return 'Limited'
  return 'Unknown'
}
/** Dot styles reflecting a peer's connection status. */
const peerStatusStyles = stylex.create({
  differentProtocol: {
    backgroundColor: 'var(--color-yellow-500)',
  },
  connected: {
    backgroundColor: 'var(--color-green-500)',
  },
  canConnect: {
    backgroundColor: 'transparent',
    borderWidth: '1px',
    borderStyle: 'dotted',
    borderColor: 'var(--color-green-500)',
  },
  cannotConnect: {
    backgroundColor: 'transparent',
    borderWidth: '1px',
    borderStyle: 'dotted',
    borderColor: 'var(--color-red-500)',
  },
  limited: {
    backgroundColor: 'transparent',
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: 'var(--color-green-500)',
  },
  unknown: {
    backgroundColor: 'var(--muted-foreground)',
  },
})
function getPeerStatusIndicator(peer: HMPeerInfo, myProtocol: string): string {
  const style =
    peer.connectionStatus === ConnectionStatus.CONNECTED
      ? peer.protocol && peer.protocol !== myProtocol
        ? peerStatusStyles.differentProtocol
        : peerStatusStyles.connected
      : peer.connectionStatus === ConnectionStatus.CAN_CONNECT
        ? peerStatusStyles.canConnect
        : peer.connectionStatus === ConnectionStatus.CANNOT_CONNECT
          ? peerStatusStyles.cannotConnect
          : peer.connectionStatus === ConnectionStatus.LIMITED
            ? peerStatusStyles.limited
            : peerStatusStyles.unknown
  return stylex.props(style).className || ''
}
function IndicationStatus({color}: {color: string}) {
  return (
    <div
      className={stylex.props(styles.sb9cfe110).className || ''}
      style={{
        backgroundColor: color,
      }}
    />
  )
}
function IndicationTag({label, status}: {label: string; status: null | 0 | 1 | 2}) {
  let statusDot = (
    <div className={stylex.props(styles.s9a378369).className || ''}>
      <Spinner />
    </div>
  )
  if (status === 0) statusDot = <IndicationStatus color="$red9" />
  if (status === 1) statusDot = <IndicationStatus color="$orange9" />
  if (status === 2) statusDot = <IndicationStatus color="$green9" />
  return (
    <Button disabled size="sm">
      {statusDot}
      {label}
    </Button>
  )
}
