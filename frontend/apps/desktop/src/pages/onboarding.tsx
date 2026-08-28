import * as stylex from '@stylexjs/stylex'
import {useDesktopAuthDialog} from '@/components/desktop-auth-dialog'
import {useDesktopAccountIntent} from '@/components/desktop-intents'
import {MainWrapper} from '@/components/main-wrapper'
import {useSelectedAccountId} from '@/selected-account'
import {getOrCreateSiteHome} from '@/utils/create-site'
import {useNavigate} from '@/utils/useNavigate'
import {useTriggerWindowEvent} from '@/utils/window-events'
import {useResource} from '@shm/shared/models/entity'
import {hmId} from '@shm/shared/utils/entity-id-url'
import {Button} from '@shm/ui/button'
import {PanelContainer} from '@shm/ui/container'
import {GeneralPageSurface} from '@shm/ui/general-page'
import {toast} from '@shm/ui/toast'
import {Plus, Search, User} from 'lucide-react'
import {useState} from 'react'
const styles_3 = stylex.create({
  sbac0e4f: {
    backgroundColor: 'var(--surface)',
  },
  sf0a1ef1d: {
    color: 'var(--muted-foreground)',
    justifyContent: 'flex-start',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '0px',
    backgroundColor: 'var(--tone-neutral-100)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--tone-neutral-200)',
        borderColor: 'var(--tone-neutral-600)',
      },
    },
  },
  s5c4d64a: {
    borderColor: 'var(--tone-emerald-600)',
    color: 'var(--tone-emerald-700)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--tone-emerald-50)',
        color: 'var(--tone-emerald-700)',
      },
    },
  },
  s940b6441: {
    height: '1px',
    flex: '1',
    backgroundColor: 'var(--tone-neutral-200-2)',
  },
  s69ac63a7: {
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    color: 'var(--tone-neutral-400-2)',
  },
  s74f1f07e: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
    boxShadow: 'var(--shadow-sm)',
    transitionProperty: 'all',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':hover': {
      '@media (hover: hover)': {
        boxShadow: 'var(--shadow-lg)',
      },
    },
  },
})
const styles_2 = stylex.create({
  se584e8f4: {
    marginInline: 'auto',
    display: 'flex',
    height: '100%',
    maxWidth: '48rem',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 6)',
    padding: 'calc(0.25rem * 8)',
  },
  sa13d15e9: {
    backgroundColor: 'var(--brand-12)',
    display: 'flex',
    minHeight: 'calc(0.25rem * 12)',
    minWidth: 'calc(0.25rem * 12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) + 4px)',
  },
})
const styles = stylex.create({
  s4ba75b90: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  se658ac14: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
  s620123df: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 4)',
    boxShadow: 'var(--shadow-sm)',
  },
  se99caecb: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 4)',
  },
  se6226949: {
    backgroundColor: 'var(--brand-12)',
    display: 'flex',
    height: 'calc(0.25rem * 12)',
    width: 'calc(0.25rem * 12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) + 4px)',
  },
  sca3de96a: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  s97dafe42: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 1)',
  },
  sa16ea943: {
    fontWeight: '700',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  scc9904d1: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sa4ec7fbb: {
    display: 'flex',
    height: 'calc(0.25rem * 10)',
    width: 'calc(0.25rem * 10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'dotted',
    borderWidth: '2px',
    borderColor: 'oklch(70.8% 0 0)',
    backgroundColor: '#fff',
  },
  sf9aeb384: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    color: 'oklch(70.8% 0 0)',
  },
})
export default function OnboardingPage() {
  const createAccountDialog = useDesktopAuthDialog()
  const selectedAccountId = useSelectedAccountId()
  const selectedSite = useResource(selectedAccountId ? hmId(selectedAccountId) : undefined)
  const hasSelectedSite = selectedSite.data?.type === 'document' && selectedSite.data.document
  const triggerWindowEvent = useTriggerWindowEvent()
  const navigate = useNavigate()
  const createSiteIntent = useDesktopAccountIntent()
  const [isCreatingSite, setIsCreatingSite] = useState(false)
  const createSite = async (accountUid: string) => {
    setIsCreatingSite(true)
    try {
      const homeId = await getOrCreateSiteHome(accountUid)
      navigate({
        key: 'document',
        id: homeId,
      })
    } catch (error) {
      console.error('Failed to verify site before creating draft:', error)
      toast.error('Could not verify whether your space already exists. Please try again.')
    } finally {
      setIsCreatingSite(false)
    }
  }
  return (
    <PanelContainer className={stylex.props(styles_3.sbac0e4f).className || ''}>
      <MainWrapper scrollable>
        <GeneralPageSurface>
          <div className={stylex.props(styles_2.se584e8f4).className || ''}>
            <h1 className={stylex.props(styles.s4ba75b90).className || ''}>Welcome to Seed Hypermedia 👋</h1>
            <p>A place where people build spaces to share knowledge freely. Where would you like to start?</p>

            <div className={stylex.props(styles.se658ac14).className || ''}>
              <div className={stylex.props(styles.s620123df).className || ''}>
                <div className={stylex.props(styles.se99caecb).className || ''}>
                  <div className={stylex.props(styles.se6226949).className || ''}>
                    <Search className={stylex.props(styles.sca3de96a).className || ''} />
                  </div>
                  <div className={stylex.props(styles.s97dafe42).className || ''}>
                    <h3 className={stylex.props(styles.sa16ea943).className || ''}>Find and Join a Space</h3>
                    <p className={stylex.props(styles.sf2718385).className || ''}>
                      Paste a space link in the bar above
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className={stylex.props(styles_3.sf0a1ef1d).className || ''}
                  onClick={() =>
                    triggerWindowEvent({
                      type: 'focus_omnibar',
                      mode: 'search',
                    })
                  }
                >
                  <Search className={stylex.props(styles.sca3de968).className || ''} />
                  Input a Space URL
                </Button>
              </div>
              {!hasSelectedSite ? (
                <div className={stylex.props(styles.s620123df).className || ''}>
                  <div className={stylex.props(styles.se99caecb).className || ''}>
                    <div className={stylex.props(styles_2.sa13d15e9).className || ''}>
                      <Plus className={stylex.props(styles.sca3de96a).className || ''} />
                    </div>
                    <div className={stylex.props(styles.s97dafe42).className || ''}>
                      <h3 className={stylex.props(styles.sa16ea943).className || ''}>Create a Space</h3>
                      <p className={stylex.props(styles.sf2718385).className || ''}>
                        Start your own space to share knowledge
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className={stylex.props(styles_3.s5c4d64a).className || ''}
                    disabled={isCreatingSite}
                    onClick={() => createSiteIntent.requireAccount(createSite)}
                  >
                    Create my Space
                  </Button>
                </div>
              ) : null}
            </div>
            {!selectedAccountId ? (
              <>
                <div className={stylex.props(styles.scc9904d1).className || ''}>
                  <div className={stylex.props(styles_3.s940b6441).className || ''} />
                  <span className={stylex.props(styles_3.s69ac63a7).className || ''}>already have an identity?</span>
                  <div className={stylex.props(styles_3.s940b6441).className || ''} />
                </div>
                <button
                  onClick={() => createAccountDialog.open({})}
                  className={stylex.props(styles_3.s74f1f07e).className || ''}
                >
                  <div className={stylex.props(styles.sa4ec7fbb).className || ''}>
                    <User className={stylex.props(styles.sf9aeb384).className || ''} />
                  </div>

                  <div className={stylex.props(styles.s97dafe42).className || ''}>
                    <p className={stylex.props(styles.sa16ea943).className || ''}>
                      Sign in to Hypermedia or create an account
                    </p>
                    <p className={stylex.props(styles.sf2718385).className || ''}>
                      Bring your existing identity to this device, or create a new identity
                    </p>
                  </div>
                </button>
              </>
            ) : null}
          </div>
        </GeneralPageSurface>
      </MainWrapper>
      {createAccountDialog.content}
      {createSiteIntent.content}
    </PanelContainer>
  )
}
