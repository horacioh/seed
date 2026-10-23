<script lang="ts">
  import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
  import {setContext, untrack} from 'svelte'
  import {KeyMapper, Svedit, type Session} from 'svedit'
  import {applyMarkdownShortcut} from '../commands'
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
</script>

<svelte:window onkeydown={(e) => key_mapper.handle_keydown(e)} />

<div class="seed-svedit" onbeforeinputcapture={onbeforeinput}>
  <Svedit {session} bind:editable path={[session.document_id]} class="seed-svedit-canvas" />
</div>
