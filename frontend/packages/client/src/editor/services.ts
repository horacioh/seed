/**
 * What an editor needs from the app, as a framework-free interface. Each
 * editor package passes it to its UI its own way (React context, Svelte
 * context, a constructor argument); the app wires it once.
 */

import type {HMBlockNode} from '../hm-types'

/** A mention suggestion: an account or document the user can link inline. */
export type MentionItem = {link: string; title: string; subtitle?: string; kind: 'account' | 'document'}

/** A document resolved for display inside an `Embed` block or mention. */
export type EmbeddedDocument = {title: string; summary?: string; content: HMBlockNode[]}

/**
 * Everything an editor needs from the outside world, wired by the app to the
 * universal client (the same `MentionCandidates` / `Resource` requests the
 * BlockNote editor uses) and to IPFS uploads.
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
