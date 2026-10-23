<script lang="ts">
  import {getContext} from 'svelte'
  import {Node, NodeArrayProperty, TextProperty, type DocumentPath, type SveditContext} from 'svedit'
  import {fromNodeId} from '../schema'
  import type {SeedConfig} from '../session'
  import {flag, isVideoPlayerLink, videoIframeSrc} from '../media'
  import EmbedView from './EmbedView.svelte'
  import MediaPicker from './MediaPicker.svelte'

  let {path}: {path: DocumentPath} = $props()
  const svedit = getContext<SveditContext>('svedit')
  const node = $derived(svedit.session.get(path))
  const seed = $derived(svedit.session.config.seed as SeedConfig)
  const attrs = $derived.by((): Record<string, any> => {
    try {
      return JSON.parse(node.attributes || '{}')
    } catch {
      return {}
    }
  })
  const type: string = $derived(node.block_type)
  const known = $derived(
    ['Paragraph', 'Heading', 'Code', 'Math', 'Image', 'Video', 'File', 'Embed', 'WebEmbed', 'Button', 'Query'].includes(
      type,
    ),
  )
  const depth = $derived(path.filter((p) => p === 'children').length)
  const fileUrl = $derived(node.link ? seed.services?.fileUrl(node.link) ?? node.link : '')
  const mediaWidth = $derived(Number(attrs.width) > 0 ? `width: ${Number(attrs.width)}px` : undefined)
  const textTag = $derived(type === 'Heading' ? `h${Math.min(depth + 2, 6)}` : type === 'Code' ? 'pre' : 'p')
  const placeholder = $derived(
    type === 'Heading'
      ? 'Heading'
      : type === 'Image' || type === 'Video'
        ? 'Caption'
        : type === 'Code'
          ? 'Code'
          : type === 'Math'
            ? 'LaTeX'
            : type === 'Button'
              ? 'Button label'
              : depth === 0 && path.at(-1) === 0
                ? "Type '/' for commands, '@' to mention, '[[' to link a document"
                : '',
  )
</script>

<Node
  {path}
  class="hm-block"
  data-block-type={type}
  data-known={known}
  data-hm-id={fromNodeId(node.id)}
  data-hm-type={type}
>
  {#if (type === 'Image' || type === 'Video' || type === 'File') && !node.link}
    <MediaPicker nodeId={node.id} {type} />
  {:else if type === 'Image'}
    <figure class="hm-media" contenteditable="false" style={mediaWidth}>
      <img src={fileUrl} alt={node.content.content || attrs.name || ''} />
      {#if attrs.name}<figcaption class="hm-media-name">{attrs.name}</figcaption>{/if}
    </figure>
  {:else if type === 'Video' && isVideoPlayerLink(node.link)}
    <figure class="hm-media hm-media-player" contenteditable="false" style={mediaWidth}>
      <iframe
        src={videoIframeSrc(node.link)}
        title={attrs.name || node.content.content || 'Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </figure>
  {:else if type === 'Video'}
    <figure class="hm-media" contenteditable="false" style={mediaWidth}>
      <!-- svelte-ignore a11y_media_has_caption -->
      <video
        src={fileUrl}
        controls
        playsinline
        autoplay={flag(attrs.autoplay)}
        loop={flag(attrs.loop)}
        muted={flag(attrs.muted)}
      ></video>
      {#if attrs.name}<figcaption class="hm-media-name">{attrs.name}</figcaption>{/if}
    </figure>
  {:else if type === 'File'}
    <a class="hm-file" contenteditable="false" href={fileUrl} target="_blank" rel="noreferrer">
      <span aria-hidden="true">📎</span>
      {attrs.name || node.link || 'File'}
      {#if attrs.size}<small>{Math.round(Number(attrs.size) / 1024)} KB</small>{/if}
    </a>
  {:else if type === 'Embed'}
    <EmbedView link={node.link} view={attrs.view === 'Card' ? 'Card' : 'Content'} services={seed.services} />
  {:else if type === 'WebEmbed'}
    <a class="hm-webembed" contenteditable="false" href={node.link} target="_blank" rel="noreferrer">🌐 {node.link}</a>
  {:else if type === 'Query'}
    <div class="hm-query" contenteditable="false">
      <strong>Query</strong>
      <code>{JSON.stringify(attrs.query ?? attrs)}</code>
    </div>
  {/if}
  {#if type === 'Button'}
    <div class="hm-button-row">
      <TextProperty tag="span" class="hm-text hm-button" path={[...path, 'content']} {placeholder} />
    </div>
  {:else if !['Embed', 'Query', 'WebEmbed', 'File'].includes(type) || node.content.content}
    <TextProperty
      tag={textTag}
      class="hm-text hm-text-{known ? type : 'Unknown'}"
      data-hm-type={known ? undefined : type}
      path={[...path, 'content']}
      {placeholder}
    />
  {/if}
  {#if node.children.nodes.length}
    <NodeArrayProperty
      class="hm-children"
      data-children-type={node.children_type || 'Group'}
      path={[...path, 'children']}
    />
  {/if}
</Node>
