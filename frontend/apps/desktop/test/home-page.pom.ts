import {AppData} from './types'

export class HomePage {
  readonly appData: AppData
  alias: string

  constructor(data: AppData, alias = 'testAlias') {
    this.appData = data
    this.alias = alias
  }

  async goto() {
    const page = this.appData.appWindow
    const main = page.locator('#main-content')
    await main.waitFor({state: 'visible'})

    const onboarding = page.getByRole('heading', {name: 'Welcome to Seed Hypermedia'})
    if (await onboarding.isVisible()) {
      const homeLink = page
        .locator('[data-a11y-region="sidebar"] button')
        .filter({hasText: /Seed|Hypermedia|Untitled/i})
        .first()
      await homeLink.click()
      await onboarding.waitFor({state: 'detached'})
    }

    await main.waitFor({state: 'visible'})
  }
}
