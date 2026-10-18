import {createContext, useEffect, useSyncExternalStore, type ReactNode} from 'react'
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

function createFlagStore() {
  let value = false
  const subs = new Set<() => void>()
  return {
    set(next: boolean) {
      if (value === next) return
      value = next
      subs.forEach((listener) => listener())
    },
    subscribe(listener: () => void) {
      subs.add(listener)
      return () => {
        subs.delete(listener)
      }
    },
    get: () => value,
  }
}

const surface = createFlagStore()

/**
 * Report from the document page whether Page mode is currently on screen, so
 * app chrome outside the page (the desktop sidebar) can step aside.
 */
export function usePublishPageModeSurface(active: boolean) {
  useEffect(() => {
    surface.set(active)
    return () => surface.set(false)
  }, [active])
}

/** Whether a document page is currently showing Page mode. */
export function usePageModeSurface(): boolean {
  return useSyncExternalStore(surface.subscribe, surface.get, () => false)
}

const pageLayoutSurface = createFlagStore()

/**
 * Report whether the document page is laid out as a full-width page (Page
 * mode, or reading a document built from Sections), so outer chrome such as
 * the site's document browser can step aside.
 */
export function usePublishPageLayoutSurface(active: boolean) {
  useEffect(() => {
    pageLayoutSurface.set(active)
    return () => pageLayoutSurface.set(false)
  }, [active])
}

/** Whether a document page is currently laid out as a full-width page. */
export function usePageLayoutSurface(): boolean {
  return useSyncExternalStore(pageLayoutSurface.subscribe, pageLayoutSurface.get, () => false)
}

/**
 * App-provided controls for the Page mode dock. The document page fills this
 * with the app's existing publish flow; the editor renders it inside the dock.
 */
export type PageModeDockSlots = {
  /** The app's Publish control, styled for the dock. */
  publish?: ReactNode
}

/** Context that carries {@link PageModeDockSlots} from the page to the editor. */
export const PageModeDockContext = createContext<PageModeDockSlots>({})
