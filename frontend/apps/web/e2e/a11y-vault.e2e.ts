import {expect, test, type Locator, type Page} from '@playwright/test'
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'
import {mkdir, readFile} from 'node:fs/promises'
import {join} from 'node:path'

const webUrl = process.env.A11Y_WEB_URL || process.env.A11Y_BASE_URL || 'http://localhost:3000/'
const vaultUrl = process.env.A11Y_VAULT_URL || 'http://localhost:3030/vault'
const artifactDir = process.env.A11Y_ARTIFACTS || '/home/ubuntu/a11y-pr5-artifacts'
const vaultEmail = process.env.A11Y_VAULT_EMAIL || `a11y-${Date.now()}@example.com`
const vaultPassword = process.env.A11Y_VAULT_PASSWORD || `A11y-Test-${Date.now()}!`
const modes = ['light', 'dark', 'reflow-320', 'zoom-200'] as const

async function tabTo(page: Page, locator: Locator) {
  for (let index = 0; index < 80; index += 1) {
    if (await locator.evaluate((element) => element === document.activeElement).catch(() => false)) return
    await page.keyboard.press('Tab')
  }
  throw new Error('Keyboard navigation did not reach the requested control')
}

async function scan(page: Page) {
  await expectNoA11yViolations(page, {modes: [...modes]})
}

async function logOut(page: Page) {
  const accountTrigger = page.getByRole('button', {name: vaultEmail, exact: true})
  await expect(accountTrigger).toBeVisible()
  await tabTo(page, accountTrigger)
  await page.keyboard.press('Enter')
  const logOutButton = page.locator('#account-menu-actions').getByRole('button', {name: 'Log out'})
  await expect(logOutButton).toBeVisible()
  await scan(page)
  await tabTo(page, logOutButton)
  await page.keyboard.press('Enter')
}

async function captureStep(page: Page, name: string) {
  await page.emulateMedia({colorScheme: 'light'})
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  await page.setViewportSize({width: 1280, height: 900})
  await page.screenshot({path: join(artifactDir, `${name}-desktop-light.png`), fullPage: true})
  await page.setViewportSize({width: 375, height: 812})
  await page.screenshot({path: join(artifactDir, `${name}-mobile-light.png`), fullPage: true})
  await page.setViewportSize({width: 1280, height: 900})
}

async function readVerificationCode() {
  if (process.env.A11Y_VAULT_CODE) return process.env.A11Y_VAULT_CODE
  const logPath = process.env.A11Y_VAULT_LOG
  if (!logPath) throw new Error('Set A11Y_VAULT_CODE or A11Y_VAULT_LOG for the local vault verification code')

  const escapedEmail = vaultEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const codePattern = new RegExp(`Verification code for ${escapedEmail}: (\\d+)`, 'g')
  let verificationCode: string | null = null
  await expect
    .poll(
      async () => {
        const contents = await readFile(logPath, 'utf8').catch(() => '')
        verificationCode = Array.from(contents.matchAll(codePattern), (match) => match[1]).at(-1) ?? null
        return verificationCode
      },
      {timeout: 30_000, message: `Vault log did not contain a verification code for ${vaultEmail}`},
    )
    .not.toBeNull()
  if (!verificationCode) throw new Error(`Vault log did not contain a verification code for ${vaultEmail}`)
  return verificationCode
}

test('keyboard-only vault signup, recovery, and settings are accessible', async ({page}) => {
  test.setTimeout(600_000)
  await mkdir(artifactDir, {recursive: true})
  await page.setViewportSize({width: 1280, height: 900})
  await page.goto(webUrl)

  const joinButton = page.getByRole('button', {name: /join/i}).first()
  await expect(joinButton).toBeVisible()
  await tabTo(page, joinButton)
  await page.keyboard.press('Enter')
  const createIdentityButton = page.getByRole('button', {name: /create identity in hypermedia/i})
  await expect(createIdentityButton).toBeVisible()
  await scan(page)
  await tabTo(page, createIdentityButton)
  await page.keyboard.press('Enter')
  await page.waitForURL(/\/vault(?:\/|$)/, {timeout: 30_000})

  const emailInput = page.getByRole('textbox', {name: /email/i}).first()
  await expect(emailInput).toBeVisible()
  await scan(page)
  await captureStep(page, 'signup-email')
  await tabTo(page, emailInput)
  await page.keyboard.type(vaultEmail)
  await page.keyboard.press('Enter')

  const verificationInput = page.locator('input[inputmode="numeric"]').first()
  await expect(verificationInput).toBeVisible()
  await scan(page)
  const verificationCode = await readVerificationCode()
  await tabTo(page, verificationInput)
  await page.keyboard.type(verificationCode)

  const usePassword = page.getByRole('button', {name: /use a password/i})
  await expect(usePassword).toBeVisible()
  await scan(page)
  await tabTo(page, usePassword)
  await page.keyboard.press('Enter')

  const passwordInputs = page.locator('input[type="password"]')
  await expect(passwordInputs.first()).toBeVisible()
  await scan(page)
  await captureStep(page, 'signup-password')
  await tabTo(page, passwordInputs.first())
  await page.keyboard.type(vaultPassword)
  if ((await passwordInputs.count()) > 1) {
    await tabTo(page, passwordInputs.nth(1))
    await page.keyboard.type(vaultPassword)
  }
  await tabTo(page, page.getByRole('button', {name: 'Continue'}))
  await page.keyboard.press('Enter')

  await expect(page.getByRole('heading', {name: /save your recovery words/i})).toBeVisible()
  await scan(page)
  await captureStep(page, 'recovery-words')
  await page.emulateMedia({colorScheme: 'dark'})
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.screenshot({path: join(artifactDir, 'recovery-words-desktop-dark.png'), fullPage: true})
  await page.emulateMedia({colorScheme: 'light'})
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  const recoveryWords = await page.locator('ol li').allTextContents()
  expect(recoveryWords).toHaveLength(12)
  const continueFromRecovery = page.getByRole('button', {name: /continue|saved/i})
  await tabTo(page, continueFromRecovery)
  await page.keyboard.press('Enter')

  await expect(page.getByRole('heading', {name: /identity is secured/i})).toBeVisible()
  await scan(page)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', {name: /create your profile/i})).toBeVisible()
  const profileName = page.getByRole('textbox', {name: /name/i}).first()
  await tabTo(page, profileName)
  await page.keyboard.type('A11y Test User')
  const createProfile = page.getByRole('button', {name: /create profile/i})
  await tabTo(page, createProfile)
  await page.keyboard.press('Enter')
  await page.waitForURL((url) => url.origin === new URL(webUrl).origin, {timeout: 30_000})
  await scan(page)

  await page.goto(vaultUrl)
  const unlockPassword = page.getByRole('textbox', {name: 'Password'})
  await expect(unlockPassword).toBeVisible()
  await scan(page)
  await tabTo(page, unlockPassword)
  await page.keyboard.type(vaultPassword)
  const unlockButton = page.getByRole('button', {name: 'Unlock'})
  await tabTo(page, unlockButton)
  await page.keyboard.press('Enter')
  const identitySettingsButton = page.getByRole('button', {name: /identity settings/i})
  await expect(identitySettingsButton).toBeVisible({timeout: 30_000})
  await identitySettingsButton.click()
  await expect(page.getByRole('heading', {name: /identity settings/i})).toBeVisible()
  await scan(page)
  await page.emulateMedia({colorScheme: 'dark'})
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.screenshot({path: join(artifactDir, 'vault-settings-desktop-dark.png'), fullPage: true})

  await logOut(page)
  await page.goto(vaultUrl)

  const signInEmail = page.getByRole('textbox', {name: /email/i}).first()
  await expect(signInEmail).toBeVisible()
  await tabTo(page, signInEmail)
  await page.keyboard.type(vaultEmail)
  await page.keyboard.press('Enter')
  const signInWithPassword = page.getByRole('button', {name: 'Sign in with password'})
  await expect(signInWithPassword).toBeVisible()
  await scan(page)
  await tabTo(page, signInWithPassword)
  await page.keyboard.press('Enter')
  const passwordSignIn = page.locator('input[type="password"]').first()
  await expect(passwordSignIn).toBeVisible()
  await scan(page)
  await tabTo(page, passwordSignIn)
  await page.keyboard.type(vaultPassword)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', {name: /connected devices/i})).toBeVisible({timeout: 30_000})

  await logOut(page)
  await page.goto(vaultUrl)
  const useAnotherEmail = page.getByRole('button', {name: /use another email/i})
  if (await useAnotherEmail.count()) {
    await tabTo(page, useAnotherEmail)
    await page.keyboard.press('Enter')
  }
  const recoveryEmail = page.getByRole('textbox', {name: /email/i}).first()
  await expect(recoveryEmail).toBeVisible()
  await tabTo(page, recoveryEmail)
  await page.keyboard.type(vaultEmail)
  await page.keyboard.press('Enter')
  const recoveryPasswordMethod = page.getByRole('button', {name: 'Sign in with password'})
  await expect(recoveryPasswordMethod).toBeVisible()
  await scan(page)
  await tabTo(page, recoveryPasswordMethod)
  await page.keyboard.press('Enter')
  const recoverLink = page.getByRole('button', {name: 'Forgot password?'})
  await expect(recoverLink).toBeVisible()
  await tabTo(page, recoverLink)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', {name: /forgot your password/i})).toBeVisible()
  const recoveryInput = page.getByRole('textbox', {name: 'Recovery word 1', exact: true})
  await tabTo(page, recoveryInput)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  const phrase = recoveryWords.map((word) => word.replace(/^\d+\.\s*/, '')).join(' ')
  await page.evaluate(async (text) => navigator.clipboard.writeText(text), phrase)
  await page.keyboard.press('Control+V')
  await expect(page.getByRole('textbox', {name: 'Recovery word 12'})).toHaveValue(/.+/)
  await scan(page)
  const recoverContinue = page.getByRole('button', {name: 'Continue'})
  await tabTo(page, recoverContinue)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', {name: /identity is recovered/i})).toBeVisible({timeout: 30_000})
  await scan(page)
  const continueRecoveredSignIn = page.getByRole('button', {name: /^continue as/i})
  await tabTo(page, continueRecoveredSignIn)
  await page.keyboard.press('Enter')
  const postRecoverySettings = page.getByRole('button', {name: /identity settings/i})
  await expect(postRecoverySettings).toBeVisible({timeout: 30_000})
  await scan(page)
  await tabTo(page, postRecoverySettings)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', {name: /identity settings/i})).toBeVisible()
  await scan(page)
})
