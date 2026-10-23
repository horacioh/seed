<script lang="ts">
  import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
  import {setContext, untrack} from 'svelte'
  import {KeyMapper, Svedit, type Session} from 'svedit'
  import {applyMarkdownShortcut, pasteVideoLink, uploadFiles} from '../commands'
  import {toHM, type SveditDocument} from '../convert'
  import {createSeedSession} from '../session'
  import type {SeedEditorServices} from '../services'
  import './seed-svedit.css'

  let {
    blocks,
    services = null,
    onchange,
    onsession,
  }: {
    blocks: HMBlockNode[]
    services?: SeedEditorServices | null
    onchange?: (blocks: HMBlockNode[]) => void
    onsession?: (session: Session<any>) => void
  } = $props()

  const key_mapper = new KeyMapper()
  setContext('key_mapper', key_mapper)
  const session = untrack(() => createSeedSession(blocks, {services}))
  untrack(() => onsession?.(session))
  let editable = $state(true)

  $effect(() => {
    const hm = toHM(session.doc as unknown as SveditDocument)
    untrack(() => onchange?.(hm))
  })

  // Svedit's keymap can't bind the space key, so markdown shortcuts hook beforeinput.
  function onbeforeinput(event: InputEvent) {
    if (event.inputType !== 'insertText' || event.data !== ' ') return
    const tr = session.tr
    if (!applyMarkdownShortcut(tr)) return
    event.preventDefault()
    event.stopPropagation()
    session.apply(tr)
  }

  function selectedBlockId(): string | null {
    const sel = session.selection
    if (sel?.type !== 'text') return null
    return session.get(sel.path.slice(0, -1))?.id ?? null
  }

  function lastBlockId(): string | null {
    return (session.get([session.document_id, 'body']).nodes as string[]).at(-1) ?? null
  }

  function onpaste(event: ClipboardEvent) {
    const files = [...(event.clipboardData?.files ?? [])]
    const target = selectedBlockId()
    if (files.length && services?.uploadFile && target) {
      event.preventDefault()
      event.stopPropagation()
      uploadFiles(session, services.uploadFile, target, files).catch(console.error)
      return
    }
    const tr = session.tr
    if (!pasteVideoLink(tr, event.clipboardData?.getData('text/plain') ?? '')) return
    event.preventDefault()
    event.stopPropagation()
    session.apply(tr)
  }

  function ondragover(event: DragEvent) {
    if (!services?.uploadFile || !event.dataTransfer?.types.includes('Files')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  function ondrop(event: DragEvent) {
    const files = [...(event.dataTransfer?.files ?? [])]
    if (!files.length || !services?.uploadFile) return
    event.preventDefault()
    event.stopPropagation()
    const over = (event.target as Element | null)?.closest?.('.hm-block[data-node-id]')?.getAttribute('data-node-id')
    const target = over ?? lastBlockId()
    if (target) uploadFiles(session, services.uploadFile, target, files).catch(console.error)
  }
</script>

<svelte:window onkeydown={(e) => key_mapper.handle_keydown(e)} />

<div
  class="seed-svedit"
  role="presentation"
  onbeforeinputcapture={onbeforeinput}
  onpastecapture={onpaste}
  ondragovercapture={ondragover}
  ondropcapture={ondrop}
>
  <Svedit {session} bind:editable path={[session.document_id]} class="seed-svedit-canvas" />
</div>
