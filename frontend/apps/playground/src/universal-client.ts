import type {HMRequest} from '@seed-hypermedia/client/hm-types'
import {createSeedClient} from '@seed-hypermedia/client'
import {createWebUniversalClient, type WebClientDependencies} from '@shm/shared/create-web-universal-client'
import {createElement, Fragment} from 'react'
import {getGatewayHost} from './gateway'

const request: WebClientDependencies['request'] = ((key: HMRequest['key'], input: HMRequest['input']) => {
  const client = createSeedClient(getGatewayHost())
  return client.request(key as never, input as never)
}) as WebClientDependencies['request']

export const playgroundUniversalClient = createWebUniversalClient({
  request,
  publish: () => Promise.reject(new Error('read-only playground')),
  CommentEditor: () => createElement(Fragment),
})
