import {expect, test, type Locator, type Page} from '@playwright/test'
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
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

async function settleAnimations(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    const transitions = document.getAnimations().filter((animation) => animation.constructor.name === 'CSSTransition')
    await Promise.all(transitions.map((transition) => transition.finished.catch(() => undefined)))
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
}

async function setTheme(page: Page, theme: 'light' | 'dark') {
  await page.emulateMedia({colorScheme: theme})
  await page.evaluate((isDark) => document.documentElement.classList.toggle('dark', isDark), theme === 'dark')
  await settleAnimations(page)
}

async function captureScreenshot(page: Page, filename: string, width: number, height: number) {
  await page.setViewportSize({width, height})
  await settleAnimations(page)
  await page.screenshot({path: join(artifactDir, filename), fullPage: true})
}

async function expectHeaderLayout(page: Page, titleVisible: boolean) {
  const brandLink = page.getByRole('link', {name: 'Hypermedia Identity'})
  const brandTitle = brandLink.locator('span')
  const accountTrigger = page.getByRole('button', {name: `Account ${vaultEmail}`, exact: true})
  const [brandBounds, accountBounds] = await Promise.all([brandLink.boundingBox(), accountTrigger.boundingBox()])
  expect(brandBounds).not.toBeNull()
  expect(accountBounds).not.toBeNull()
  expect(brandBounds!.x + brandBounds!.width).toBeLessThanOrEqual(accountBounds!.x)
  await expect(brandTitle).toHaveCSS('position', titleVisible ? 'static' : 'absolute')
  await expect(accountTrigger.locator('span')).toHaveCSS('white-space', 'nowrap')
  await expect(accountTrigger.locator('span')).toHaveCSS('text-overflow', 'ellipsis')
}

async function readContrast(locator: Locator) {
  return locator.evaluate((element) => {
    type Color = {r: number; g: number; b: number; a: number}
    const parseColor = (value: string): Color => {
      if (value.startsWith('oklch(')) {
        const channels = value.match(/[\d.]+%?/g)
        if (!channels || channels.length < 3) throw new Error(`Unsupported computed color: ${value}`)
        const lightness = parseFloat(channels[0]) / (channels[0].endsWith('%') ? 100 : 1)
        const chroma = parseFloat(channels[1])
        const hue = (parseFloat(channels[2]) * Math.PI) / 180
        const a = chroma * Math.cos(hue)
        const b = chroma * Math.sin(hue)
        const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b
        const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b
        const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b
        const l = lRoot ** 3
        const m = mRoot ** 3
        const s = sRoot ** 3
        const encode = (channel: number) => {
          const normalized = Math.max(0, Math.min(1, channel))
          return 255 * (normalized <= 0.0031308 ? 12.92 * normalized : 1.055 * normalized ** (1 / 2.4) - 0.055)
        }
        return {
          r: encode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
          g: encode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
          b: encode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
          a: channels[3] ? parseFloat(channels[3]) / (channels[3].endsWith('%') ? 100 : 1) : 1,
        }
      }
      const channels = value.match(/[\d.]+/g)?.map(Number)
      if (!channels || channels.length < 3) throw new Error(`Unsupported computed color: ${value}`)
      return {r: channels[0], g: channels[1], b: channels[2], a: channels[3] ?? 1}
    }
    const composite = (foreground: Color, background: Color): Color => {
      const alpha = foreground.a + background.a * (1 - foreground.a)
      return {
        r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
        g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
        b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
        a: alpha,
      }
    }
    const luminance = (color: Color) => {
      const channel = (value: number) => {
        const normalized = value / 255
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
    }

    const style = window.getComputedStyle(element)
    const backgroundLayers: Color[] = []
    let backgroundElement: Element | null = element
    while (backgroundElement) {
      const color = parseColor(window.getComputedStyle(backgroundElement).backgroundColor)
      if (color.a > 0) {
        backgroundLayers.push(color)
        if (color.a >= 1) break
      }
      backgroundElement = backgroundElement.parentElement
    }

    let background = parseColor(window.getComputedStyle(document.documentElement).backgroundColor)
    if (background.a < 1) background = {r: 255, g: 255, b: 255, a: 1}
    for (const layer of backgroundLayers.reverse()) background = composite(layer, background)

    const foreground = composite(parseColor(style.color), background)
    const ratio =
      (Math.max(luminance(foreground), luminance(background)) + 0.05) /
      (Math.min(luminance(foreground), luminance(background)) + 0.05)
    return {
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      color: style.color,
      background: `rgb(${Math.round(background.r)}, ${Math.round(background.g)}, ${Math.round(background.b)})`,
      ratio,
    }
  })
}

async function logOut(page: Page) {
  const accountTrigger = page.getByRole('button', {name: `Account ${vaultEmail}`, exact: true})
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
  await setTheme(page, 'light')
  await captureScreenshot(page, `${name}-desktop-light.png`, 1280, 900)
  if (name === 'signup-password') await expectHeaderLayout(page, true)
  await captureScreenshot(page, `${name}-mobile-light.png`, 375, 812)
  if (name === 'signup-password') await expectHeaderLayout(page, false)
  if (name === 'signup-email') {
    await captureScreenshot(page, 'signup-email-mobile-320-light.png', 320, 812)
  }
  if (name === 'signup-password') {
    await page.setViewportSize({width: 320, height: 812})
    await settleAnimations(page)
    await expectHeaderLayout(page, false)
    await setTheme(page, 'dark')
    await captureScreenshot(page, 'signup-password-mobile-dark.png', 375, 812)
    await setTheme(page, 'light')
  }
  await page.setViewportSize({width: 1280, height: 900})
  await settleAnimations(page)
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
  await setTheme(page, 'dark')
  const darkContrast = {
    emailTrigger: await readContrast(page.getByRole('button', {name: `Account ${vaultEmail}`, exact: true})),
    copyWords: await readContrast(page.getByRole('button', {name: 'Copy recovery words'})),
  }
  await writeFile(join(artifactDir, 'dark-contrast-review.json'), `${JSON.stringify(darkContrast, null, 2)}\n`)
  console.log(`Dark recovery contrast: ${JSON.stringify(darkContrast)}`)
  expect(darkContrast.emailTrigger.ratio).toBeGreaterThanOrEqual(4.5)
  expect(darkContrast.copyWords.ratio).toBeGreaterThanOrEqual(4.5)
  await page.screenshot({path: join(artifactDir, 'recovery-words-desktop-dark.png'), fullPage: true})
  await setTheme(page, 'light')
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
  await setTheme(page, 'dark')
  await page.screenshot({path: join(artifactDir, 'vault-settings-desktop-dark.png'), fullPage: true})
  await setTheme(page, 'light')

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
