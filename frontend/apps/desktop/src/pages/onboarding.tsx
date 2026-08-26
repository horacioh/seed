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
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-sm)',
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
      toast.error('Could not verify whether your site already exists. Please try again.')
    } finally {
      setIsCreatingSite(false)
    }
  }
  return (
    <PanelContainer className="dark:bg-background bg-white">
      <MainWrapper scrollable>
        <GeneralPageSurface>
          <div className="mx-auto flex h-full max-w-3xl flex-col justify-center gap-6 p-8">
            <h1 className={stylex.props(styles.s4ba75b90).className || ''}>Welcome to Seed Hypermedia 👋</h1>
            <p>A place where people build sites to share knowledge freely. Where would you like to start?</p>

            <div className={stylex.props(styles.se658ac14).className || ''}>
              <div className={stylex.props(styles.s620123df).className || ''}>
                <div className={stylex.props(styles.se99caecb).className || ''}>
                  <div className={stylex.props(styles.se6226949).className || ''}>
                    <Search className={stylex.props(styles.sca3de96a).className || ''} />
                  </div>
                  <div className={stylex.props(styles.s97dafe42).className || ''}>
                    <h3 className={stylex.props(styles.sa16ea943).className || ''}>Find and Join a Site</h3>
                    <p className={stylex.props(styles.sf2718385).className || ''}>Paste a site link in the bar above</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="text-muted-foreground justify-start gap-2 rounded-full border-0 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  onClick={() =>
                    triggerWindowEvent({
                      type: 'focus_omnibar',
                      mode: 'search',
                    })
                  }
                >
                  <Search className={stylex.props(styles.sca3de968).className || ''} />
                  Input a Site URL
                </Button>
              </div>
              {!hasSelectedSite ? (
                <div className={stylex.props(styles.s620123df).className || ''}>
                  <div className={stylex.props(styles.se99caecb).className || ''}>
                    <div className="bg-brand-12 flex min-h-12 min-w-12 items-center justify-center rounded-xl">
                      <Plus className={stylex.props(styles.sca3de96a).className || ''} />
                    </div>
                    <div className={stylex.props(styles.s97dafe42).className || ''}>
                      <h3 className={stylex.props(styles.sa16ea943).className || ''}>Create a Site</h3>
                      <p className={stylex.props(styles.sf2718385).className || ''}>
                        Start your own space to share knowledge
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                    disabled={isCreatingSite}
                    onClick={() => createSiteIntent.requireAccount(createSite)}
                  >
                    Create my Site
                  </Button>
                </div>
              ) : null}
            </div>
            {!selectedAccountId ? (
              <>
                <div className={stylex.props(styles.scc9904d1).className || ''}>
                  <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                  <span className="text-sm text-neutral-400 dark:text-neutral-500">already have an identity?</span>
                  <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <button
                  onClick={() => createAccountDialog.open({})}
                  className="flex items-center gap-4 rounded-lg border p-4 shadow-sm transition-all hover:shadow-lg"
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
