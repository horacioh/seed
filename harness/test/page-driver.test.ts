import assert from 'node:assert/strict'
import test from 'node:test'
import type {Locator as PlaywrightLocator, Page} from 'playwright-core'
import {PageDriver} from '../src/page-driver.js'

type FakeLocator = {
  waitFor: () => Promise<void>
  click: () => Promise<void>
  fill: (value: string) => Promise<void>
  selectOption: (value: string) => Promise<void>
  hover: () => Promise<void>
  press: (value: string) => Promise<void>
  dragTo: (target: PlaywrightLocator) => Promise<void>
}

class TestPageDriver extends PageDriver {
  public resolveCalls = 0

  public constructor(private readonly locator: FakeLocator) {
    super()
    this.page = {locator: () => this.locator} as unknown as Page
  }

  public async launch(): Promise<void> {}

  public async open(): Promise<Page> {
    return this.activePage()
  }

  public async close(): Promise<void> {}

  public override resolveLocator(): PlaywrightLocator {
    this.resolveCalls += 1
    return this.locator as unknown as PlaywrightLocator
  }
}

function step(action: 'click' | 'drag', value?: string) {
  return {action, locator: {css: '#target'}, ...(value === undefined ? {} : {value})} as const
}

test('act dispatches an action exactly once when dispatch throws', async () => {
  let waitCalls = 0
  let clickCalls = 0
  const driver = new TestPageDriver({
    waitFor: async () => {
      waitCalls += 1
    },
    click: async () => {
      clickCalls += 1
      throw new Error('click failed after dispatch')
    },
    fill: async () => undefined,
    selectOption: async () => undefined,
    hover: async () => undefined,
    press: async () => undefined,
    dragTo: async () => undefined,
  })

  await assert.rejects(driver.act(step('click')), /click failed after dispatch/)
  assert.equal(waitCalls, 1)
  assert.equal(clickCalls, 1)
})

test('act retries readiness and dispatches once after the target becomes ready', async () => {
  let waitCalls = 0
  let clickCalls = 0
  const driver = new TestPageDriver({
    waitFor: async () => {
      waitCalls += 1
      if (waitCalls === 1) throw new Error('not ready')
    },
    click: async () => {
      clickCalls += 1
    },
    fill: async () => undefined,
    selectOption: async () => undefined,
    hover: async () => undefined,
    press: async () => undefined,
    dragTo: async () => undefined,
  })

  await driver.act(step('click'))
  assert.equal(waitCalls, 2)
  assert.equal(clickCalls, 1)
})

test('act rejects a drag without a target before resolving or waiting', async () => {
  const driver = new TestPageDriver({
    waitFor: async () => {
      throw new Error('should not wait')
    },
    click: async () => undefined,
    fill: async () => undefined,
    selectOption: async () => undefined,
    hover: async () => undefined,
    press: async () => undefined,
    dragTo: async () => undefined,
  })

  await assert.rejects(driver.act(step('drag')), /Drag steps require a target CSS selector in value/)
  assert.equal(driver.resolveCalls, 0)
})
