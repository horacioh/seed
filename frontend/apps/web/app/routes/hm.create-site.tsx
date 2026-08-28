import * as stylex from '@stylexjs/stylex'
import {useLocalKeyPair} from '@/auth'
import {createSpaceHomeDraft} from '@/document-edit/web-create-space-draft'
import {makeWebFileUpload} from '@/document-edit/web-image-upload'
import {webUniversalClient} from '@/universal-client'
import {useHasExistingSpace} from '@/web-create-space-dialog'
import {useNavigate} from '@remix-run/react'
import {Button} from '@shm/ui/button'
import {useLocalKeyPairLoaded} from '@/auth'
import {createSpaceMetadata} from '@shm/ui/create-space-platform'
import {CreateSpaceForm, type CreateSpaceFormState} from '@shm/ui/create-space-form'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {useMemo, useState} from 'react'
const styles_2 = stylex.create({
  s9dae8284: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: 'var(--scrim)',
  },
  se80b762a: {
    backgroundColor: 'var(--background)',
    display: 'flex',
    width: '100%',
    maxWidth: '440px',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-xl)',
  },
})
const styles = stylex.create({
  sf48c8a4d: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 6)',
  },
  s21835089: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    padding: 'calc(0.25rem * 6)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s45db313e: {
    position: 'fixed',
    inset: 'calc(0.25rem * 0)',
    zIndex: '50',
    cursor: 'progress',
  },
})
function Panel({children}: {children: React.ReactNode}) {
  return (
    <div className={stylex.props(styles_2.s9dae8284).className || ''}>
      <div className={stylex.props(styles_2.se80b762a).className || ''}>{children}</div>
    </div>
  )
}

/**
 * "Create a space" entry point. The form writes a local home draft (anonymous
 * pending draft when signed out, or a real draft under the account when signed
 * in) and opens the editor; publishing that draft creates the space. Cover/logo
 * images are uploaded to IPFS here and referenced in the draft metadata.
 */
export default function CreateSiteRoute() {
  const navigate = useNavigate()
  const userKeyPair = useLocalKeyPair()
  const keyPairLoaded = useLocalKeyPairLoaded()
  const accountUid = userKeyPair?.delegatedAccountUid ?? userKeyPair?.id ?? null
  const [busy, setBusy] = useState(false)
  const fileUpload = useMemo(() => makeWebFileUpload(webUniversalClient), [])

  // When signed in, check whether this account already has a space.
  const existingSpace = useHasExistingSpace(accountUid)
  if (!keyPairLoaded) {
    return (
      <Panel>
        <div className={stylex.props(styles.sf48c8a4d).className || ''}>
          <Spinner />
        </div>
      </Panel>
    )
  }
  async function handleComplete(state: CreateSpaceFormState) {
    setBusy(true)
    try {
      // Upload cover/logo to IPFS and reference the resulting CIDs
      // in the metadata, mirroring the web draft image flow.
      const [coverCid, logoCid, faviconCid] = await Promise.all([
        state.cover ? fileUpload(state.cover) : Promise.resolve(undefined),
        state.logo ? fileUpload(state.logo) : Promise.resolve(undefined),
        state.favicon ? fileUpload(state.favicon) : Promise.resolve(undefined),
      ])
      const metadata = createSpaceMetadata(state, {
        coverCid,
        logoCid,
        faviconCid,
      })
      const {webPath} = await createSpaceHomeDraft(metadata, accountUid)
      navigate(webPath)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create space')
      setBusy(false)
    }
  }
  if (accountUid && existingSpace.isLoading) {
    return (
      <Panel>
        <div className={stylex.props(styles.sf48c8a4d).className || ''}>
          <Spinner />
        </div>
      </Panel>
    )
  }
  if (accountUid && existingSpace.data) {
    return (
      <Panel>
        <div className={stylex.props(styles.s21835089).className || ''}>
          <SizableText size="2xl" weight="bold" asChild>
            <h2>You already have a space</h2>
          </SizableText>
          <SizableText className={stylex.props(styles.sf2718385).className || ''}>
            This account already has a space, and each account can have one. To create another, sign in with a different
            identity.
          </SizableText>
          <Button variant="default" onClick={() => navigate(`/hm/${accountUid}`)}>
            Go to your space
          </Button>
        </div>
      </Panel>
    )
  }
  return (
    <Panel>
      <CreateSpaceForm onComplete={handleComplete} onClose={() => navigate('/')} />
      {busy ? <div className={stylex.props(styles.s45db313e).className || ''} aria-hidden /> : null}
    </Panel>
  )
}
