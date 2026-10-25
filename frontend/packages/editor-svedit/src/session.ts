import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {fill_document_defaults, Session} from 'svedit'
import {createSeedCommands, insertBlock} from './commands'
import {fromHM} from './convert'
import {generateNodeId, seedSchema} from './schema'
import type {SeedEditorServices} from './services'
import {SuggestionMenu} from './svelte/menu-state.svelte'
import SeedBlock from './svelte/SeedBlock.svelte'
import SeedDocument from './svelte/SeedDocument.svelte'
import SeedInline from './svelte/SeedInline.svelte'
import SeedOverlays from './svelte/SeedOverlays.svelte'

/** Seed-specific data hung off the Svedit session config (`session.config.seed`). */
export type SeedConfig = {services: SeedEditorServices | null; menu: SuggestionMenu}

/**
 * Create a Svedit session holding an HM document, with Seed's node
 * components, commands and keymap registered through Svedit's config hooks.
 */
export function createSeedSession(
  blocks: HMBlockNode[],
  {
    services = null,
    promptLink = () => window.prompt('Link URL'),
  }: {services?: SeedEditorServices | null; promptLink?: () => string | null} = {},
): Session<typeof seedSchema> {
  const seed: SeedConfig = {services, menu: new SuggestionMenu()}
  const config = {
    generate_id: generateNodeId,
    node_components: {hm_document: SeedDocument, hm_block: SeedBlock, hm_inline: SeedInline},
    system_components: {overlays: SeedOverlays},
    inserters: {hm_block: insertBlock},
    create_commands_and_keymap: (context: any) => createSeedCommands(context, seed.menu, promptLink),
    seed,
  }
  return new Session(seedSchema, fill_document_defaults(fromHM(blocks) as any, seedSchema), config as any)
}
