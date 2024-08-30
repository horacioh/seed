import appError from '@/errors'
import {ConnectError} from '@connectrpc/connect'
import {ConnectionStatus, GRPCClient, PeerInfo} from '@shm/shared'
import {
  FetchQueryOptions,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query'
import {useEffect, useRef, useState} from 'react'
import {useGRPCClient} from '../app-context'
import {useGatewayUrl} from './gateway-settings'
import {queryKeys} from './query-keys'

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    function setOnline() {
      setIsOnline(true)
    }
    function setOffline() {
      setIsOnline(false)
    }
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])
  return isOnline
}

async function checkGatewayConnected(gwUrl: string): Promise<0 | 1 | 2> {
  return await fetch(`${gwUrl}/hm/api/config`)
    .then(async (res) => {
      if (res.status === 200) return 2
      return 0
    })
    .catch((e) => {
      if (e.message.match('Failed to fetch')) return 1
      throw e
    })
}

export function useIsGatewayConnected() {
  const [isConnected, setIsConnected] = useState<0 | 1 | 2 | null>(null)
  const promise = useRef<Promise<unknown> | boolean>(true) // true is ready to start, false is stopped, promise is in progress
  const gwUrl = useGatewayUrl()
  useEffect(() => {
    if (!promise.current) promise.current = true
    function start() {
      if (!gwUrl.data) return
      if (promise.current === false) return
      promise.current = checkGatewayConnected(gwUrl.data)
        .then((status) => setIsConnected(status))
        .then(() => {
          return new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 2_000),
          )
        })
        .catch((error) => {
          appError('Unexpected checkGatewayConnected Error', {error})
        })
        .finally(() => {
          start()
        })
    }
    start()
    return () => {
      promise.current = false
    }
  }, [gwUrl.data])
  return isConnected
}

export function usePeers(
  filterConnected: boolean,
  options: UseQueryOptions<PeerInfo[] | null, ConnectError> = {},
) {
  const client = useGRPCClient()
  return useQuery<PeerInfo[] | null, ConnectError>({
    queryKey: [queryKeys.PEERS, filterConnected],
    queryFn: async () => {
      try {
        const listed = await client.networking.listPeers({})
        if (filterConnected)
          return listed.peers.filter((info) => {
            return info.connectionStatus === ConnectionStatus.CONNECTED
          })
        return listed.peers
      } catch (e) {
        return null
      }
    },
    enabled: true,
    ...options,
  })
}

export function useConnectedPeers(
  options: UseQueryOptions<PeerInfo[], ConnectError> = {},
) {
  return usePeers(true, options)
}

function queryPeerInfo(
  grpcClient: GRPCClient,
  deviceId?: string,
):
  | UseQueryOptions<PeerInfo, ConnectError>
  | FetchQueryOptions<PeerInfo, ConnectError> {
  return {
    queryKey: [queryKeys.GET_PEER_INFO, deviceId],
    enabled: !!deviceId,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    retry: true,
    queryFn: async () => {
      return await grpcClient.networking.getPeerInfo({deviceId: deviceId})
    },
    onError: (err) => {
      console.error(`queryPeerInfo Error: `, err)
    },
    refetchInterval: 15_000,
    // refetchIntervalInBackground: true,
  }
}

export function usePeerInfo(deviceId?: string) {
  const grpcClient = useGRPCClient()
  return useQuery<PeerInfo, ConnectError>(queryPeerInfo(grpcClient, deviceId))
}
