import {createRequire} from 'node:module'
import {test as base} from '@playwright/test'
import type {nvdaTest as guidepupNvdaTest, voiceOverTest as guidepupVoiceOverTest} from '@guidepup/playwright'
import type {ScreenReader} from './scenarios'

const guidepupWebTests =
  (process.platform === 'darwin' || process.platform === 'win32') &&
  process.env.A11Y_SCREEN_READER_SURFACE !== 'desktop'
    ? createRequire(import.meta.url)('@guidepup/playwright')
    : undefined

/** Creates browser tests with a lazily initialized VoiceOver screen reader. */
export const voiceOverTest = base.extend<{voiceOver: ScreenReader}>({
  voiceOver: async ({}, use) => {
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
export const nvdaTest = base.extend<{nvda: ScreenReader}>({
  nvda: async ({}, use) => {
    const {nvda} = await import('@guidepup/guidepup')
    await nvda.start()
    try {
      await use(nvda)
    } finally {
      await nvda.stop()
    }
  },
})

/** Creates VoiceOver browser tests with Guidepup's web-content navigation fixture. */
export const voiceOverWebTest = (guidepupWebTests?.voiceOverTest ??
  voiceOverTest) as unknown as typeof guidepupVoiceOverTest

/** Creates NVDA browser tests with Guidepup's web-content navigation fixture. */
export const nvdaWebTest = (guidepupWebTests?.nvdaTest ?? nvdaTest) as unknown as typeof guidepupNvdaTest
