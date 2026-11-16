import {beforeEach, describe, expect, it} from 'vitest'
import {expectNoAxeViolations} from '../src/dom'

describe('expectNoAxeViolations', () => {
  beforeEach(() => {
    document.documentElement.lang = 'en'
    document.title = 'Accessibility test'
    document.body.innerHTML = ''
  })

  it('rejects an image without alt text and a button without an accessible name', async () => {
    document.body.innerHTML = `
      <main>
        <h1>Example</h1>
        <button><svg aria-hidden="true"></svg></button>
        <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
      </main>
    `

    const rejection = expectNoAxeViolations(document)
    await expect(rejection).rejects.toThrow(/button-name/)
    await expect(rejection).rejects.toThrow(/image-alt/)
  })

  it('passes an accessible fixture', async () => {
    document.body.innerHTML = `
      <main>
        <h1>Example</h1>
        <button>Save</button>
        <img alt="A small example" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
      </main>
    `

    await expectNoAxeViolations(document)
  })

  it('disables requested rules', async () => {
    document.body.innerHTML = `
      <main>
        <h1>Example</h1>
        <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
      </main>
    `

    // This fixture intentionally disables image-alt to exercise the helper option.
    await expectNoAxeViolations(document, {disableRules: ['image-alt']})
  })
})
