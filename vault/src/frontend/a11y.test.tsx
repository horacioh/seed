import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, describe, expect, test} from 'bun:test'
import axe from 'axe-core'
import {useState, type ComponentType} from 'react'
import {Link, MemoryRouter, Route, Routes} from 'react-router-dom'
import {AccountProfileDialog} from '@/frontend/components/AccountProfileDialog'
import {PasswordInput} from '@/frontend/components/PasswordInput'
import {CreateAccountDialog} from '@/frontend/components/CreateAccountDialog'
import {Header} from '@/frontend/components/Header'
import {NotificationEmailSettings} from '@shm/ui/components/notification-email-settings'
import {StoreContext, createStore} from '@/frontend/store'
import {createMockBlockstore, createSuccessMockClient} from '@/frontend/test-utils'
import {AccountSettingsView} from './views/AccountSettingsView'
import {ChooseAuthView} from './views/ChooseAuthView'
import {ConnectSuccessView} from './views/ConnectSuccessView'
import {ConnectView} from './views/ConnectView'
import {CreateProfileView} from './views/CreateProfileView'
import {DelegateView} from './views/DelegateView'
import {EnterRecoveryWordsView} from './views/EnterRecoveryWordsView'
import {IdentityRecoveredView} from './views/IdentityRecoveredView'
import {IdentitySecuredView} from './views/IdentitySecuredView'
import {InvitedView} from './views/InvitedView'
import {LoginView} from './views/LoginView'
import {NoRecoveryWordsView} from './views/NoRecoveryWordsView'
import {PasswordSignInView} from './views/PasswordSignInView'
import {PreLoginView} from './views/PreLoginView'
import {SaveRecoveryWordsView} from './views/SaveRecoveryWordsView'
import {SetPasswordView} from './views/SetPasswordView'
import {SettingsView} from './views/SettingsView'
import {VerifyPendingView} from './views/VerifyPendingView'
import {RootLayout} from './router'

const axeOptions = {rules: {'color-contrast': {enabled: false}}}

function createA11yStore() {
  const store = createStore(createSuccessMockClient(), createMockBlockstore(), '', 'https://notify.example.com')
  store.state.sessionChecked = true
  store.state.email = 'a11y@example.com'
  store.state.inviteStatus = 'valid'
  store.state.inviteEmail = 'a11y@example.com'
  store.state.inviteCode = 'test-invite-code'
  store.state.vaultData = {version: 2, accounts: []}
  store.state.backendHttpBaseUrl = 'https://daemon.example.com'
  store.state.recoveryWords = Array.from({length: 12}, (_, index) => `word${index + 1}`)
  store.state.delegationRequest = {
    originalUrl: 'https://vault.example.com/delegate',
    emailPrevalidation: false,
    clientId: 'https://site.example.com',
    redirectUri: 'https://site.example.com/callback',
    sessionKeyPrincipal: 'z6MkTest',
    state: 'AAAAAAAAAAAAAAAAAAAAAA',
    requestTs: Date.now(),
    proof: 'cA',
    vaultOrigin: 'https://vault.example.com',
  }
  return store
}

type ViewCase = {
  name: string
  View: ComponentType
  prepare?: (store: ReturnType<typeof createA11yStore>) => void
}

const authenticatedVault = (store: ReturnType<typeof createA11yStore>) => {
  store.state.session = {
    authenticated: true,
    relyingPartyOrigin: 'https://vault.example.com',
    email: 'a11y@example.com',
  }
  store.state.decryptedDEK = new Uint8Array(32)
}

const viewCases: ViewCase[] = [
  {name: 'account settings', View: AccountSettingsView, prepare: authenticatedVault},
  {name: 'choose authentication', View: ChooseAuthView},
  {name: 'connect success', View: ConnectSuccessView},
  {name: 'connect', View: ConnectView},
  {name: 'create profile', View: CreateProfileView, prepare: authenticatedVault},
  {name: 'delegate', View: DelegateView},
  {name: 'enter recovery words', View: EnterRecoveryWordsView},
  {name: 'identity recovered', View: IdentityRecoveredView},
  {name: 'identity secured', View: IdentitySecuredView, prepare: authenticatedVault},
  {name: 'invited', View: InvitedView},
  {name: 'login', View: LoginView},
  {name: 'no recovery words', View: NoRecoveryWordsView},
  {name: 'password sign-in', View: PasswordSignInView},
  {name: 'pre-login', View: PreLoginView},
  {name: 'save recovery words', View: SaveRecoveryWordsView, prepare: authenticatedVault},
  {name: 'set password', View: SetPasswordView},
  {name: 'identity settings', View: SettingsView, prepare: authenticatedVault},
  {name: 'verification', View: VerifyPendingView},
]

describe('vault accessibility', () => {
  afterEach(() => cleanup())

  test('every view renders one heading and has no axe violations', async () => {
    for (const {name, View, prepare} of viewCases) {
      const store = createA11yStore()
      prepare?.(store)
      if (View === PreLoginView) {
        store.actions.handleConditionalLogin = async () => {}
      }
      if (View === SaveRecoveryWordsView) {
        store.actions.prepareRecoveryWords = async () => {}
      }

      const {container} = render(
        <MemoryRouter initialEntries={['/']}>
          <StoreContext.Provider value={store}>
            <main>
              <View />
            </main>
          </StoreContext.Provider>
        </MemoryRouter>,
      )

      expect(container.querySelectorAll('h1').length, `${name} should have one h1`).toBe(1)
      const results = await axe.run(container, axeOptions)
      expect(
        results.violations.map(({id, impact}) => ({id, impact})),
        `${name} axe violations`,
      ).toEqual([])
      cleanup()
    }
  })

  test('inputs use autocomplete and field errors are linked and announced', async () => {
    const store = createA11yStore()
    store.state.error = 'Please check your email address'
    store.state.email = ''
    store.actions.handleConditionalLogin = async () => {}

    const {container} = render(
      <MemoryRouter>
        <StoreContext.Provider value={store}>
          <main>
            <PreLoginView />
          </main>
        </StoreContext.Provider>
      </MemoryRouter>,
    )

    const email = screen.getByLabelText('Enter your email to continue')
    expect(email?.getAttribute('autocomplete')).toBe('email')
    expect(email?.getAttribute('aria-invalid')).toBe('true')
    const emailError = container.querySelector('#email-error')
    expect(emailError).not.toBeNull()
    expect(emailError?.textContent).toBe('')
    const errorId = email?.getAttribute('aria-describedby')
    expect(errorId).toContain('pre-login-error')
    expect(errorId).not.toContain('email-error')
    expect(container.querySelector(`#${errorId}`)?.getAttribute('role')).toBe('alert')

    fireEvent.change(email, {target: {value: 'invalid-email'}})
    fireEvent.blur(email)
    await waitFor(() => {
      expect(email.getAttribute('aria-describedby')).toContain('email-error')
      expect(emailError?.textContent).toBe("That doesn't look like a valid email")
    })
    expect(container.querySelector('#email-error')).toBe(emailError)
  })

  test('password errors use a persistent live region linked only while present', () => {
    const props = {
      id: 'password',
      label: 'Password',
      value: '',
      onChange: () => {},
      autoComplete: 'current-password',
      describedBy: 'password-hint',
    }
    const {container, rerender} = render(<PasswordInput {...props} />)
    const password = screen.getByLabelText('Password')
    const error = container.querySelector('#password-error')
    expect(error).not.toBeNull()
    expect(error?.textContent).toBe('')
    expect(password.getAttribute('aria-describedby')).toBe('password-hint')

    rerender(<PasswordInput {...props} error="Incorrect password" />)

    expect(container.querySelector('#password-error')).toBe(error)
    expect(error?.textContent).toBe('Incorrect password')
    expect(password.getAttribute('aria-describedby')).toBe('password-hint password-error')
    expect(password.getAttribute('aria-invalid')).toBe('true')
  })

  test('route changes focus the single h1 and update the document title', async () => {
    const store = createA11yStore()
    store.actions.checkSession = async () => {}
    store.actions.parseDelegationFromUrl = () => {}
    store.actions.parseVaultConnectionFromUrl = () => {}
    store.actions.parseInviteFromUrl = () => false

    render(
      <MemoryRouter initialEntries={['/']}>
        <StoreContext.Provider value={store}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route
                index
                element={
                  <>
                    <h1 tabIndex={-1}>Sign-up email</h1>
                    <Link to="/password">Continue</Link>
                  </>
                }
              />
              <Route path="password" element={<h1 tabIndex={-1}>Choose password</h1>} />
            </Route>
          </Routes>
        </StoreContext.Provider>
      </MemoryRouter>,
    )

    const continueLink = screen.getByRole('link', {name: 'Continue'})
    fireEvent.click(continueLink)
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('heading', {level: 1, name: 'Choose password'}))
    })
    expect(document.querySelectorAll('main h1').length).toBe(1)
    expect(document.title).toBe('Choose password – Hypermedia Identity')
  })

  test('profile and notification dialogs are labelled and accessible', async () => {
    const store = createA11yStore()
    store.state.creatingAccount = true
    authenticatedVault(store)

    render(
      <MemoryRouter>
        <StoreContext.Provider value={store}>
          <CreateAccountDialog />
        </StoreContext.Provider>
      </MemoryRouter>,
    )

    const profileDialog = screen.getByRole('dialog')
    expect(profileDialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect((await axe.run(profileDialog, axeOptions)).violations).toEqual([])
    cleanup()

    render(
      <NotificationEmailSettings
        email={null}
        needsVerification={false}
        onSetEmail={() => {}}
        onRemoveEmail={() => {}}
      />,
    )
    fireEvent.click(screen.getByRole('switch'))
    const notificationDialog = await screen.findByRole('dialog')
    expect(notificationDialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect(screen.getByLabelText('Email address').getAttribute('autocomplete')).toBe('email')
    expect((await axe.run(notificationDialog, axeOptions)).violations).toEqual([])
  })

  test('Escape closes the profile dialog and restores focus to its opener', async () => {
    const store = createA11yStore()

    function DialogHarness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open account profile
          </button>
          <AccountProfileDialog
            open={open}
            onOpenChange={setOpen}
            title="Account profile"
            descriptionText="Edit account details."
            submitLabel="Save"
            onSubmit={() => {}}
          />
        </>
      )
    }

    render(
      <StoreContext.Provider value={store}>
        <DialogHarness />
      </StoreContext.Provider>,
    )
    const trigger = screen.getByRole('button', {name: 'Open account profile'})
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = await screen.findByRole('dialog')
    fireEvent.keyDown(dialog, {key: 'Escape', code: 'Escape'})
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  test('account dropdown follows the disclosure focus pattern', async () => {
    const store = createA11yStore()
    authenticatedVault(store)

    render(
      <MemoryRouter>
        <StoreContext.Provider value={store}>
          <Header />
          <button type="button">Outside</button>
        </StoreContext.Provider>
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', {name: 'Account a11y@example.com'})
    const controlledMenu = document.getElementById('account-menu-actions')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-controls')).toBe('account-menu-actions')
    expect(trigger.hasAttribute('aria-haspopup')).toBe(false)
    expect(controlledMenu).not.toBeNull()
    expect((await axe.run(screen.getByRole('banner'), axeOptions)).violations).toEqual([])

    fireEvent.click(trigger)
    const logOut = screen.getByRole('button', {name: 'Log out'})
    await waitFor(() => expect(document.activeElement).toBe(logOut))
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(logOut.getAttribute('type')).toBe('button')
    expect(logOut.className).toContain('focus-visible:ring-[var(--ring)]')
    expect((await axe.run(screen.getByRole('banner'), axeOptions)).violations).toEqual([])

    fireEvent.keyDown(logOut, {key: 'Escape', code: 'Escape'})
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      expect(document.activeElement).toBe(trigger)
    })

    fireEvent.click(trigger)
    await waitFor(() => expect(document.activeElement).toBe(logOut))
    const outside = screen.getByRole('button', {name: 'Outside'})
    outside.focus()
    fireEvent.click(outside)
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      expect(document.activeElement).toBe(outside)
    })
  })
})
