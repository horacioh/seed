import {useSyncExternalStore} from 'react'
import {useUniversalAppContext} from './routing'

const STORAGE_KEY = 'seed.pageMode'
const listeners = new Set<() => void>()
let enabled = readStored()

function readStored(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Turn the draft "Page mode" view on or off. The choice is a local view
 * preference (persisted in localStorage), not part of the document.
 */
export function setPageMode(next: boolean) {
  enabled = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  } catch {
    // Storage unavailable (SSR, private mode): keep the in-memory value.
  }
  listeners.forEach((listener) => listener())
}

/**
 * Whether the user has Page mode switched on. Callers combine this with the
 * `pageMode` experiment flag and the editing state before changing the UI.
 */
export function usePageModePreference(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => enabled,
    () => false,
  )
}

/**
 * Whether Page mode is in effect: the `pageMode` experiment is enabled, the
 * user switched it on, and the draft is being edited.
 */
export function useIsPageModeActive(isEditing: boolean): boolean {
  const {experiments} = useUniversalAppContext()
  const preferred = usePageModePreference()
  return !!experiments?.pageMode && preferred && isEditing
}
