/** One entry of a suggestion menu (mentions or slash commands). */
export type MenuItem = {key: string; title: string; subtitle?: string; run: () => void}

/**
 * Reactive state of the editor's single suggestion menu (`@`, `[[`, `/`).
 * Shared by the overlay that renders it and the keymap commands that drive it.
 */
export class SuggestionMenu {
  /** Which trigger opened the menu, or `null` when closed. */
  kind = $state<'account' | 'document' | 'slash' | null>(null)
  /** Current entries. */
  items = $state.raw<MenuItem[]>([])
  /** Highlighted entry. */
  index = $state(0)
  /** Whether a search is in flight. */
  loading = $state(false)
  /** Grapheme offset where the trigger (`@`, `[[`, `/`) starts. */
  from = 0
  /** Identity of the current trigger (`kind:from:path`). */
  trigger: string | null = null
  /** Trigger the user dismissed with Escape, so it stays closed while typing on. */
  dismissed: string | null = null

  /** True when the menu is shown and can take keys. */
  get open(): boolean {
    return this.kind !== null && (this.items.length > 0 || this.loading)
  }
  /** Move the highlight by `delta`, wrapping around. */
  move(delta: number): void {
    if (this.items.length) this.index = (this.index + delta + this.items.length) % this.items.length
  }
  /** Run the highlighted entry. */
  choose(): void {
    const item = this.items[this.index]
    this.close()
    item?.run()
  }
  /** Close the menu and keep it closed for the current trigger. */
  dismiss(): void {
    this.dismissed = this.trigger
    this.close()
  }
  /** Close the menu. */
  close(): void {
    this.kind = null
    this.items = []
    this.index = 0
  }
}
