const GATEWAY_STORAGE_KEY = 'seed-playground-gateway'
export const DEFAULT_GATEWAY_HOST = 'https://hyper.media'

export function getGatewayHost(): string {
  return localStorage.getItem(GATEWAY_STORAGE_KEY) || DEFAULT_GATEWAY_HOST
}

export function setGatewayHost(host: string): void {
  localStorage.setItem(GATEWAY_STORAGE_KEY, host.replace(/\/+$/, ''))
}
