<script lang="ts">
  import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
  import type {EmbeddedDocument, SeedEditorServices} from '../services'
  import EmbedBlocks from './EmbedBlocks.svelte'

  let {link, view, services}: {link: string; view: 'Content' | 'Card'; services: SeedEditorServices | null} = $props()
  let doc = $state<EmbeddedDocument | null | undefined>(undefined)

  $effect(() => {
    doc = undefined
    if (!link || !services) return void (doc = null)
    let live = true
    services.loadDocument(link).then(
      (d) => live && (doc = d),
      () => live && (doc = null),
    )
    return () => (live = false)
  })

  function find(blocks: HMBlockNode[], id: string): HMBlockNode | null {
    for (const n of blocks) {
      if (n.block.id === id) return n
      const found = find(n.children ?? [], id)
      if (found) return found
    }
    return null
  }
  const blockRef = $derived(link.split('#')[1]?.split(/[+[]/)[0] ?? '')
  const content = $derived.by(() => {
    if (!doc) return []
    const focused = blockRef ? find(doc.content, blockRef) : null
    return focused ? [focused] : doc.content
  })
  const firstText = $derived(
    (doc?.content ?? []).map((n) => (n.block as any).text as string).find((t) => t && t.trim()) ?? '',
  )
</script>

<div class="hm-embed" data-view={view} contenteditable="false">
  {#if doc === undefined}
    <p class="hm-embed-status">Loading {link}…</p>
  {:else if doc === null}
    <p class="hm-embed-status">Could not load {link || 'embed (no link)'}</p>
  {:else if view === 'Card'}
    <a class="hm-embed-card" href={link} title={link}>
      <strong>{doc.title}</strong>
      <span>{doc.summary || firstText}</span>
    </a>
  {:else}
    <div class="hm-embed-content">
      <p class="hm-embed-title">{doc.title}</p>
      <EmbedBlocks blocks={content} />
    </div>
  {/if}
</div>
