import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {createContext, useContext} from 'react'

/** A mention suggestion: an account or document the user can link inline. */
export type MentionItem = {link: string; title: string; subtitle?: string; kind: 'account' | 'document'}

/** A document resolved for display inside an `Embed` block or mention. */
export type EmbeddedDocument = {title: string; summary?: string; content: HMBlockNode[]}

/**
 * Everything the editor needs from the outside world. The app wires these to
 * the universal client (the same `MentionCandidates` / `Resource` requests the
 * BlockNote editor uses), keeping the editor free of app state. Media links
 * resolve through `@shm/ui/get-file-url`, so the editor must sit inside the
 * app's `UniversalAppProvider`.
 */
export interface SeedEditorServices {
  /** Search accounts (`@`) or documents (`[[`) for the mention menus. */
  searchMentions(query: string, kind: 'account' | 'document', signal?: AbortSignal): Promise<MentionItem[]>
  /** Load an `hm://` document for embeds and mention labels. */
  loadDocument(link: string): Promise<EmbeddedDocument | null>
  /**
   * Store a dropped, pasted or picked file and return the link to save in the
   * block (`ipfs://<cid>` in the app). Without it, media blocks take URLs only.
   */
  uploadFile?(file: File): Promise<string>
}

/** React context carrying {@link SeedEditorServices} to node views and menus. */
export const SeedServicesContext = createContext<SeedEditorServices | null>(null)

/** Read the editor services; throws outside a Seed ProseKit editor. */
export function useSeedServices(): SeedEditorServices {
  const services = useContext(SeedServicesContext)
  if (!services) throw new Error('useSeedServices must be used inside <SeedProseKitEditor>')
  return services
}
