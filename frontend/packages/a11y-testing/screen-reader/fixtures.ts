import {execFileSync} from 'node:child_process'
import {createRequire} from 'node:module'
import {test as base} from '@playwright/test'
import type {nvdaTest as guidepupNvdaTest, voiceOverTest as guidepupVoiceOverTest} from '@guidepup/playwright'
import {appendNavigationTrace, startNavigationTrace, type ScreenReader} from './scenarios'

const guidepupWebTests =
  (process.platform === 'darwin' || process.platform === 'win32') &&
  process.env.A11Y_SCREEN_READER_SURFACE !== 'desktop'
    ? createRequire(import.meta.url)('@guidepup/playwright')
    : undefined

function dismissPortablePreferences(reader: ScreenReader) {
  if (process.platform !== 'darwin') {
    appendNavigationTrace(reader, 'diagnostic: Guidepup Portable Preferences lookup skipped outside macOS')
    return
  }

  const script = `
tell application "System Events"
  set observations to ""
  repeat with attempt from 1 to 10
    try
      set voiceOverProcesses to every process whose name contains "VoiceOver"
      repeat with voiceOverProcess in voiceOverProcesses
        set processName to name of voiceOverProcess
        try
          set voiceOverWindows to windows of voiceOverProcess
          repeat with voiceOverWindow in voiceOverWindows
            try
              set windowName to name of voiceOverWindow
              set buttonNames to name of every button of voiceOverWindow
              set observations to observations & "poll " & attempt & ": " & processName & " / " & windowName & " buttons=" & (buttonNames as text) & "; "
              if buttonNames contains "Always Use" then
                click button "Always Use" of voiceOverWindow
                return "clicked Always Use in " & processName & " / " & windowName & "; observed " & observations
              end if
            on error errorMessage number errorNumber
              set observations to observations & "poll " & attempt & ": " & processName & " window inspection error " & errorNumber & ": " & errorMessage & "; "
            end try
          end repeat
        on error errorMessage number errorNumber
          set observations to observations & "poll " & attempt & ": " & processName & " window query error " & errorNumber & ": " & errorMessage & "; "
        end try
      end repeat
    on error errorMessage number errorNumber
      set observations to observations & "poll " & attempt & ": VoiceOver process query error " & errorNumber & ": " & errorMessage & "; "
    end try
    delay 1
  end repeat
end tell
return "no Always Use button found after 10 polls; observed " & observations
`

  try {
    const output = execFileSync('osascript', ['-e', script], {encoding: 'utf8', timeout: 15_000}).trim()
    appendNavigationTrace(
      reader,
      `diagnostic: Guidepup Portable Preferences: ${output || 'osascript returned no output'}`,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stdout = error instanceof Error && 'stdout' in error ? String(error.stdout ?? '').trim() : ''
    const stderr = error instanceof Error && 'stderr' in error ? String(error.stderr ?? '').trim() : ''
    const output = [message, stdout && `stdout: ${stdout}`, stderr && `stderr: ${stderr}`].filter(Boolean).join('; ')
    appendNavigationTrace(reader, `diagnostic: Guidepup Portable Preferences: osascript failed; ${output}`)
  }
}

/** Creates browser tests with a lazily initialized VoiceOver screen reader. */
export const voiceOverTest = base.extend<{voiceOver: ScreenReader}>({
  voiceOver: async ({}, use) => {
    const {voiceOver} = await import('@guidepup/guidepup')
    startNavigationTrace(voiceOver)
    await voiceOver.start()
    dismissPortablePreferences(voiceOver)
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
const guidepupVoiceOverWebTest = guidepupWebTests?.voiceOverTest as typeof guidepupVoiceOverTest | undefined
export const voiceOverWebTest = (guidepupVoiceOverWebTest
  ? guidepupVoiceOverWebTest.extend<{voiceOverSetup: undefined}>({
      voiceOverSetup: [
        async ({voiceOver}, use) => {
          startNavigationTrace(voiceOver)
          dismissPortablePreferences(voiceOver)
          await use(undefined)
        },
        {auto: true},
      ],
    })
  : voiceOverTest) as unknown as typeof guidepupVoiceOverTest

/** Creates NVDA browser tests with Guidepup's web-content navigation fixture. */
export const nvdaWebTest = (guidepupWebTests?.nvdaTest ?? nvdaTest) as unknown as typeof guidepupNvdaTest
