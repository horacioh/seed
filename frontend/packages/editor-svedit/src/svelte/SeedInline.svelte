<script lang="ts">
  import {getContext} from 'svelte'
  import type {DocumentPath, SveditContext} from 'svedit'
  import type {SeedConfig} from '../session'

  let {path, content}: {path: DocumentPath; content: string} = $props()
  const svedit = getContext<SveditContext>('svedit')
  const node = $derived(svedit.session.get(path))
  const services = $derived((svedit.session.config.seed as SeedConfig).services)
  let label = $state<string | null>(null)

  $effect(() => {
    const link: string = node.embed
    if (!link || !services) return
    let live = true
    services.loadDocument(link).then((doc) => {
      if (live) label = doc?.title ?? null
    })
    return () => (live = false)
  })

  const isAccount = $derived(/^hm:\/\/[^/?#]+$/.test(node.embed ?? ''))
  const classes = $derived(['hm-inline', ...(node.styles ?? []).map((s: string) => `hm-${s.toLowerCase()}`)].join(' '))
</script>

{#if node.embed}<span
    id={node.id}
    data-node-id={node.id}
    class="{classes} hm-mention"
    class:hm-mention-account={isAccount}
    title={node.embed}
    data-label={(isAccount ? '@' : '') + (label ?? node.embed.replace('hm://', '').slice(0, 14))}>{content}</span
  >{:else if node.link}<a
    id={node.id}
    data-node-id={node.id}
    class={classes}
    href={node.link}
    target="_blank"
    rel="noreferrer">{content}</a
  >{:else}<span id={node.id} data-node-id={node.id} class={classes}>{content}</span>{/if}
