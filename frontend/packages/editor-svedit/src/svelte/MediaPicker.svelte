<script lang="ts">
  import {getContext} from 'svelte'
  import type {SveditContext} from 'svedit'
  import {setMediaLink, uploadFiles} from '../commands'
  import {videoEmbedLink} from '../media'
  import type {SeedConfig} from '../session'

  let {nodeId, type}: {nodeId: string; type: 'Image' | 'Video' | 'File'} = $props()
  const svedit = getContext<SveditContext>('svedit')
  const seed = svedit.session.config.seed as SeedConfig
  const upload = seed.services?.uploadFile
  let busy = $state(false)
  let error = $state('')
  let input = $state<HTMLInputElement>()

  async function onfile() {
    const files = [...(input?.files ?? [])]
    if (!files.length || !upload) return
    busy = true
    error = ''
    try {
      await uploadFiles(svedit.session, upload, nodeId, files)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      busy = false
    }
  }

  function embedLink() {
    const url = window.prompt(type === 'Video' ? 'Video file, YouTube or Vimeo URL' : `${type} URL`)?.trim()
    if (!url) return
    if (type === 'Video' && /youtu|vimeo/.test(url) && !videoEmbedLink(url)) {
      error = `Unsupported video URL: ${url}`
      return
    }
    const tr = svedit.session.tr
    setMediaLink(tr, nodeId, type, url)
    svedit.session.apply(tr)
  }
</script>

<div class="hm-media-picker" contenteditable="false" data-media-picker={type}>
  <span class="hm-media-picker-icon" aria-hidden="true">{type === 'Image' ? '🖼' : type === 'Video' ? '🎬' : '📎'}</span
  >
  <span class="hm-media-picker-label">
    {busy ? 'Uploading…' : `Drop ${type === 'Image' ? 'an image' : type === 'Video' ? 'a video' : 'a file'} here, or`}
  </span>
  {#if upload}
    <button type="button" disabled={busy} onclick={() => input?.click()}>Upload</button>
    <input
      bind:this={input}
      type="file"
      hidden
      accept={type === 'Image' ? 'image/*' : type === 'Video' ? 'video/*' : undefined}
      onchange={onfile}
    />
  {/if}
  <button type="button" disabled={busy} onclick={embedLink}>{type === 'Video' ? 'Embed link' : 'Link'}</button>
  {#if error}<span class="hm-media-picker-error">{error}</span>{/if}
</div>
