import type {Scenario} from '../src/types.js'

/**
 * Template Electron scenario.
 *
 * Replace the placeholder locators with selectors from the built desktop app.
 * Do not treat these generic locators as verified Seed desktop behavior.
 */
export const scenario: Scenario = {
  name: 'Electron renderer template',
  description: 'Template for renderer-level Electron assertions.',
  setup: 'Electron application is ready',
  steps: [
    {
      action: 'assert',
      kind: 'visible',
      locator: {css: 'body'},
      expected: true,
      description: 'Replace this placeholder with a verified app-root locator',
    },
  ],
}
