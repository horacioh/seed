import type {SeedEditorServices} from '@seed-hypermedia/client/editor/services'
import {createContext, useContext} from 'react'

export type {EmbeddedDocument, MentionItem, SeedEditorServices} from '@seed-hypermedia/client/editor/services'

/** React context carrying {@link SeedEditorServices} to node views and menus. */
export const SeedServicesContext = createContext<SeedEditorServices | null>(null)

/** Read the editor services; throws outside a Seed ProseKit editor. */
export function useSeedServices(): SeedEditorServices {
  const services = useContext(SeedServicesContext)
  if (!services) throw new Error('useSeedServices must be used inside <SeedProseKitEditor>')
  return services
}
