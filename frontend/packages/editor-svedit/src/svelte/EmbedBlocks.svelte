<script lang="ts">
  import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
  import EmbedBlocks from './EmbedBlocks.svelte'

  let {blocks}: {blocks: HMBlockNode[]} = $props()
  const textOf = (n: HMBlockNode) => ((n.block as any).text ?? '').replace(/\uFFFC/g, '◆')
</script>

{#each blocks as n (n.block.id)}
  {#if n.block.type === 'Heading'}
    <p class="embed-heading">{textOf(n)}</p>
  {:else if textOf(n)}
    <p class:embed-code={n.block.type === 'Code'}>{textOf(n)}</p>
  {/if}
  {#if n.children?.length}
    <div class="embed-children" data-children-type={(n.block as any).attributes?.childrenType ?? 'Group'}>
      <EmbedBlocks blocks={n.children} />
    </div>
  {/if}
{/each}
