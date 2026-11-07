/** Production revision audited by this pilot, independent of the lab's own revision. */
export const SOURCE_REVISION = '904c684d9fcf88e183e0a6bd061edb0da08c2e7f'

/** Extensible catalogue; only the vault pilot is executable in this first slice. */
export const journeys = [
  ['vault-account', 'Create a vault account', 'Identity'],
  ['publish-document', 'Publish a document', 'Publishing'],
  ['publish-comment', 'Publish a comment', 'Publishing'],
  ['join-site', 'Join a public site', 'Membership'],
  ['load-document', 'Load a document', 'Reading'],
  ['load-profile', 'Load a profile', 'Reading'],
  ['site-feed', 'Construct a site feed', 'Reading'],
  ['grant-writer', 'Add a site writer', 'Permissions'],
  ['peer-sync', 'Sync two peers', 'Network'],
  ['notifications', 'Deliver notifications', 'Delivery'],
] as const

/** A source anchor, never an arbitrary imported URL. */
export type Source = {path: string; line: number; symbol: string}

/** Immutable source links keep evidence tied to the modeled production code. */
export function sourceUrl(source: Source) {
  return `https://github.com/seed-hypermedia/seed/blob/${SOURCE_REVISION}/${source.path}#L${source.line}`
}

const store = (line: number, symbol: string): Source => ({path: 'vault/src/frontend/store.ts', line, symbol})
const service = (line: number, symbol: string): Source => ({path: 'vault/src/api-service.ts', line, symbol})

/** Coarse phases align meaningful milestones, not individual client screens. */
export const phases = [
  {
    id: 'email',
    title: 'Verify email',
    actor: 'Vault + mail',
    states: ['email', 'prelogin', 'challenging', 'code', 'expired', 'exhausted'],
    action: 'Bind a short-lived challenge to this browser; verify before creating a session.',
    guard: '15-minute expiry · 60-second resend · three attempts · binding required',
    sources: [service(201, 'EMAIL_CODE_EXPIRY_MS'), service(920, 'registerStart'), service(986, 'registerVerify')],
  },
  {
    id: 'credentials',
    title: 'Secure the vault',
    actor: 'Browser + authenticator',
    states: ['auth', 'password', 'recovery', 'passkey', 'unsupported'],
    action: 'Derive a wrapping key; persist only the wrapped DEK. Password setup adds a recovery credential.',
    guard: 'PRF support is required for passkeys. Current passkey signup skips recovery.',
    sources: [store(933, 'handleSetPassword'), store(1011, 'saveRecoveryCredential'), store(1071, 'handleSetPasskey')],
  },
  {
    id: 'identity',
    title: 'Persist the identity',
    actor: 'Browser → vault storage',
    states: ['identity', 'saving', 'reloading', 'saveFailed'],
    action: 'Generate an Ed25519 seed; encrypt vault state; save with optimistic versioning before publication.',
    guard: 'On 409, reload and merge by UID, then retry once. Other failures roll back the in-memory account.',
    sources: [store(1623, 'saveVaultData'), store(1692, 'createAccount')],
  },
  {
    id: 'profile',
    title: 'Publish the profile',
    actor: 'Browser → daemon',
    states: ['signing', 'storing', 'contact', 'notifying', 'partial'],
    action:
      'Sign a Profile blob, PUT it into the daemon, then attempt default-site Contact and optional notification registration.',
    guard:
      'Store acknowledgement does not prove indexing or remote availability. Post-save errors must not imply seed loss.',
    sources: [store(1769, 'publishProfile / publishDefaultJoinedSite'), store(1810, 'post-save publication handling')],
  },
  {
    id: 'signin',
    title: 'Prove recoverability',
    actor: 'Fresh browser → vault',
    states: ['fresh', 'signin', 'complete', 'recovering', 'recovered', 'mismatch'],
    action:
      'Discard the prior session; sign in and decrypt to the same identity. Verify recovery separately when supported.',
    guard: 'A fresh session and equality of the decrypted UID must be observed, not inferred from a success screen.',
    sources: [store(1129, 'handleLogin'), store(1011, 'recovery credential')],
  },
] satisfies {
  id: string
  title: string
  actor: string
  states: string[]
  action: string
  guard: string
  sources: Source[]
}[]
