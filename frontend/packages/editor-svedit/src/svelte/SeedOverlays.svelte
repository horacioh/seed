<script lang="ts">
  import {getContext, untrack} from 'svelte'
  import type {SveditContext, TextSelection, Transaction} from 'svedit'
  import {insertMention, selectionRange, setBlockType, setLink, setParentChildrenType, spliceText} from '../commands'
  import {formatsOf} from '../convert'
  import {videoEmbedLink} from '../media'
  import type {InlineStyle} from '../schema'
  import type {SeedConfig} from '../session'
  import type {MenuItem} from './menu-state.svelte'

  const svedit = getContext<SveditContext>('svedit')
  const session = $derived(svedit.session)
  const seed = svedit.session.config.seed as SeedConfig
  const menu = seed.menu
  const segmenter = new Intl.Segmenter()
  const length = (s: string) => [...segmenter.segment(s)].length

  let menuPos = $state<{left: number; top: number} | null>(null)
  let toolbarPos = $state<{left: number; top: number} | null>(null)
  let linkValue = $state<string | null>(null)
  let linkSelection = $state.raw<TextSelection | null>(null)
  let searchAbort: AbortController | null = null

  function apply(run: (tr: Transaction) => boolean | void) {
    const tr = svedit.session.tr
    if (run(tr) !== false) svedit.session.apply(tr)
    svedit.focus_canvas()
  }

  function domRect(): DOMRect | null {
    const sel = window.getSelection()
    if (!sel?.rangeCount) return null
    const range = sel.getRangeAt(0)
    const rect = range.getClientRects()[0] ?? range.getBoundingClientRect()
    return rect.width || rect.height
      ? rect
      : (sel.focusNode as Element | null)?.parentElement?.getBoundingClientRect() ?? null
  }

  const textSel = $derived(session.selection?.type === 'text' ? (session.selection as TextSelection) : null)
  const collapsed = $derived(!textSel || textSel.anchor_offset === textSel.focus_offset)

  const STYLES: [InlineStyle, string, string][] = [
    ['Bold', 'B', 'bold'],
    ['Italic', 'I', 'italic'],
    ['Underline', 'U', 'underline'],
    ['Strike', 'S', 'strike'],
    ['Code', '</>', 'code'],
  ]
  const active = $derived.by(() => {
    if (!textSel || collapsed) return {styles: new Set<string>(), link: ''}
    const [from, to] = selectionRange(textSel)
    const formats = formatsOf(session.doc.nodes, session.get(textSel.path)).slice(from, to)
    return {
      styles: new Set(STYLES.map(([s]) => s).filter((s) => formats.every((f) => f.styles.includes(s)))),
      link: formats.every((f) => f.link && f.link === formats[0]?.link) ? formats[0]!.link : '',
    }
  })

  $effect(() => {
    void session.selection
    void session.doc
    const show = !collapsed
    requestAnimationFrame(() => {
      const rect = show ? domRect() : null
      if (linkValue === null)
        toolbarPos = rect
          ? {left: Math.min(Math.max(rect.left + rect.width / 2, 170), window.innerWidth - 170), top: rect.top}
          : null
      const caret = menu.open ? domRect() : null
      menuPos = caret ? {left: caret.left, top: caret.bottom} : null
    })
  })

  type SlashEntry = {title: string; subtitle: string; run: (tr: Transaction) => boolean | void; prompt?: string}
  const setAttr = (tr: Transaction, patch: Record<string, unknown>) => {
    const block = tr.get((tr.selection as TextSelection).path.slice(0, -1))
    tr.set([block.id, 'attributes'], JSON.stringify({...JSON.parse(block.attributes || '{}'), ...patch}))
  }
  const withLink =
    (type: string, patch: Record<string, unknown> = {}) =>
    (tr: Transaction, link?: string) => {
      const block = tr.get((tr.selection as TextSelection).path.slice(0, -1))
      setBlockType(tr, type)
      tr.set([block.id, 'link'], link ?? '')
      if (Object.keys(patch).length) setAttr(tr, patch)
    }
  const SLASH: (SlashEntry & {link?: (tr: Transaction, link?: string) => boolean | void})[] = [
    {title: 'Heading', subtitle: 'Section title', run: (tr) => setBlockType(tr, 'Heading')},
    {title: 'Paragraph', subtitle: 'Plain text', run: (tr) => setBlockType(tr, 'Paragraph')},
    {
      title: 'Bullet list',
      subtitle: 'Parent childrenType Unordered',
      run: (tr) => setParentChildrenType(tr, 'Unordered'),
    },
    {
      title: 'Numbered list',
      subtitle: 'Parent childrenType Ordered',
      run: (tr) => setParentChildrenType(tr, 'Ordered'),
    },
    {
      title: 'Blockquote',
      subtitle: 'Parent childrenType Blockquote',
      run: (tr) => setParentChildrenType(tr, 'Blockquote'),
    },
    {title: 'Code block', subtitle: 'Monospace, Enter adds lines', run: (tr) => setBlockType(tr, 'Code')},
    {title: 'Math', subtitle: 'LaTeX source', run: (tr) => setBlockType(tr, 'Math')},
    {title: 'Button', subtitle: 'Link button', run: () => {}, prompt: 'Button link', link: withLink('Button')},
    {
      title: 'Embed',
      subtitle: 'Document content',
      run: () => {},
      prompt: 'hm:// link',
      link: withLink('Embed', {view: 'Content'}),
    },
    {
      title: 'Embed card',
      subtitle: 'Document card',
      run: () => {},
      prompt: 'hm:// link',
      link: withLink('Embed', {view: 'Card'}),
    },
    {title: 'Image', subtitle: 'Upload, drop or link', run: (tr) => setBlockType(tr, 'Image')},
    {title: 'Video', subtitle: 'Upload, drop or link', run: (tr) => setBlockType(tr, 'Video')},
    {
      title: 'YouTube / Vimeo',
      subtitle: 'Embed a video player',
      run: () => {},
      prompt: 'YouTube or Vimeo URL',
      link: (tr, link) => {
        const player = videoEmbedLink(link?.trim() ?? '')
        if (player) return withLink('Video')(tr, player)
        window.alert(`Unsupported video URL: ${link}`)
        return false
      },
    },
    {title: 'File', subtitle: 'Upload, drop or link', run: (tr) => setBlockType(tr, 'File')},
    {title: 'Web embed', subtitle: 'From URL', run: () => {}, prompt: 'Web URL', link: withLink('WebEmbed')},
  ]

  function slashItems(query: string): MenuItem[] {
    return SLASH.filter((e) => e.title.toLowerCase().includes(query.trim().toLowerCase())).map((e) => ({
      key: e.title,
      title: e.title,
      subtitle: e.subtitle,
      run: () => {
        const link = e.prompt ? window.prompt(e.prompt) : undefined
        if (e.prompt && !link) return
        apply((tr) => {
          const sel = tr.selection as TextSelection
          spliceText(tr, sel.path, 0, sel.focus_offset)
          tr.set_selection({...sel, anchor_offset: 0, focus_offset: 0})
          if (e.link) return e.link(tr, link ?? undefined)
          return e.run(tr)
        })
      },
    }))
  }

  function open(kind: 'account' | 'document' | 'slash', query: string, from: number, trigger: string) {
    if (menu.dismissed === trigger) return
    menu.dismissed = null
    const isNew = menu.trigger !== trigger || menu.kind !== kind
    menu.trigger = trigger
    menu.from = from
    menu.kind = kind
    if (isNew) menu.index = 0
    if (kind === 'slash') {
      menu.items = slashItems(query)
      menu.index = Math.min(menu.index, Math.max(menu.items.length - 1, 0))
      return
    }
    searchAbort?.abort()
    const abort = new AbortController()
    searchAbort = abort
    if (!seed.services) return
    menu.loading = true
    seed.services.searchMentions(query, kind, abort.signal).then(
      (results) => {
        if (abort.signal.aborted) return
        menu.loading = false
        menu.items = results.slice(0, 8).map((r) => ({
          key: r.link,
          title: r.title,
          subtitle: r.subtitle,
          run: () => apply((tr) => insertMention(tr, from, r.link)),
        }))
        menu.index = Math.min(menu.index, Math.max(menu.items.length - 1, 0))
      },
      () => {
        if (!abort.signal.aborted) menu.loading = false
      },
    )
  }

  $effect(() => {
    const sel = textSel
    const content: string | null = sel ? session.get(sel.path).content : null
    untrack(() => {
      if (!sel || sel.anchor_offset !== sel.focus_offset || content === null) {
        menu.trigger = null
        return menu.close()
      }
      const before = [...segmenter.segment(content)]
        .slice(0, sel.focus_offset)
        .map((s) => s.segment)
        .join('')
      const pathKey = sel.path.join('.')
      let m: RegExpMatchArray | null
      if ((m = before.match(/(?:^|\s)@([^\s@\uFFFC]{0,40})$/)))
        open('account', m[1]!, sel.focus_offset - length(m[1]!) - 1, `account:${pathKey}`)
      else if ((m = before.match(/\[\[([^\]\uFFFC]{0,60})$/)))
        open('document', m[1]!, sel.focus_offset - length(m[1]!) - 2, `document:${pathKey}`)
      else if ((m = before.match(/^\/([\w ]{0,20})$/))) open('slash', m[1]!, 0, `slash:${pathKey}`)
      else {
        menu.trigger = null
        menu.dismissed = null
        menu.close()
      }
    })
  })

  function runStyle(command: string) {
    ;(svedit.session.commands as any)[command]?.execute()
  }
  function openLink() {
    linkSelection = textSel
    linkValue = active.link
  }
  function commitLink(value: string) {
    const sel = linkSelection
    linkValue = null
    if (!sel) return
    apply((tr) => {
      tr.set_selection(sel)
      return setLink(tr, value.trim())
    })
  }
</script>

{#if menu.open && menuPos}
  <div class="seed-menu" role="listbox" style="left: {menuPos.left}px; top: {menuPos.top + 6}px">
    <div class="seed-menu-label">
      {menu.kind === 'account' ? 'Mention an account' : menu.kind === 'document' ? 'Link a document' : 'Insert block'}
    </div>
    {#if menu.loading && !menu.items.length}<div class="seed-menu-empty">Searching…</div>{/if}
    {#each menu.items as item, i (item.key)}
      <button
        type="button"
        role="option"
        aria-selected={i === menu.index}
        class="seed-menu-item"
        onmousedown={(e) => e.preventDefault()}
        onmouseenter={() => (menu.index = i)}
        onclick={() => {
          menu.index = i
          menu.choose()
        }}
      >
        <span class="seed-menu-title">{item.title}</span>
        {#if item.subtitle}<span class="seed-menu-subtitle">{item.subtitle}</span>{/if}
      </button>
    {/each}
  </div>
{/if}

{#if toolbarPos && (linkValue !== null || !collapsed)}
  <div class="seed-toolbar" style="left: {toolbarPos.left}px; top: {toolbarPos.top}px" role="toolbar">
    {#if linkValue === null}
      {#each STYLES as [style, label, command] (style)}
        <button
          type="button"
          class="seed-tool seed-tool-{command}"
          aria-pressed={active.styles.has(style)}
          title={style}
          onmousedown={(e) => e.preventDefault()}
          onclick={() => runStyle(command)}>{label}</button
        >
      {/each}
      <button
        type="button"
        class="seed-tool"
        aria-pressed={!!active.link}
        title="Link"
        onmousedown={(e) => e.preventDefault()}
        onclick={openLink}>Link</button
      >
    {:else}
      <input
        class="seed-link-input"
        placeholder="https:// or hm://"
        {@attach (el) => {
          requestAnimationFrame(() => el.focus())
        }}
        bind:value={linkValue}
        onkeydown={(e) => {
          e.stopPropagation()
          if (e.key === 'Enter') commitLink(linkValue ?? '')
          if (e.key === 'Escape') {
            linkValue = null
            svedit.focus_canvas()
          }
        }}
      />
      <button type="button" class="seed-tool" onclick={() => commitLink(linkValue ?? '')}>Apply</button>
      {#if active.link || linkSelection}
        <button type="button" class="seed-tool" title="Remove link" onclick={() => commitLink('')}>✕</button>
      {/if}
    {/if}
  </div>
{/if}
