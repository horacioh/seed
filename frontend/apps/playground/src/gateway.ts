const GATEWAY_STORAGE_KEY = 'seed-playground-gateway'

/** Default public gateway used by read-only preview components. */
export const DEFAULT_GATEWAY_HOST = 'https://hyper.media'

/** Returns the currently selected public gateway host. */
export function getGatewayHost(): string {
  return localStorage.getItem(GATEWAY_STORAGE_KEY) || DEFAULT_GATEWAY_HOST
}

/** Persists a gateway host after removing trailing slashes. */
export function setGatewayHost(host: string): void {
  localStorage.setItem(GATEWAY_STORAGE_KEY, host.replace(/\/+$/, ''))
}
