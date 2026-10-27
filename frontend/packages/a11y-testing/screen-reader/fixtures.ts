import {test as base} from '@playwright/test'
import type {WebScreenReader} from './scenarios'

/** Creates browser tests with a lazily initialized VoiceOver screen reader. */
export const voiceOverTest = base.extend<{voiceOver: WebScreenReader}>({
  voiceOver: async ({}, use) => {
    await import('@guidepup/playwright')
    const {voiceOver} = await import('@guidepup/guidepup')
    await voiceOver.start()
    try {
      await use(voiceOver)
    } finally {
      await voiceOver.stop()
    }
  },
})

/** Creates browser tests with a lazily initialized NVDA screen reader. */
export const nvdaTest = base.extend<{nvda: WebScreenReader}>({
  nvda: async ({}, use) => {
    await import('@guidepup/playwright')
    const {nvda} = await import('@guidepup/guidepup')
    await nvda.start()
    try {
      await use(nvda)
    } finally {
      await nvda.stop()
    }
  },
})
