import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {useEffect, useRef} from 'react'
import type {Session} from 'svedit'
import {mount, unmount} from 'svelte'
import type {SeedEditorServices} from '../services'
import SeedEditor from '../svelte/SeedEditor.svelte'

/** Props of {@link SeedSveditEditor}. */
export type SeedSveditEditorProps = {
  initialContent: HMBlockNode[]
  services: SeedEditorServices | null
  onChange?: (blocks: HMBlockNode[]) => void
  onSession?: (session: Session<any>) => void
}

/**
 * React bridge for the Svelte editor: mounts `SeedEditor.svelte` into a div
 * with Svelte's `mount()` and remounts when the document or services change.
 * This is the whole cost of hosting Svedit inside Seed's React apps.
 */
export function SeedSveditEditor({initialContent, services, onChange, onSession}: SeedSveditEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const callbacks = useRef({onChange, onSession})
  callbacks.current = {onChange, onSession}

  useEffect(() => {
    const app = mount(SeedEditor, {
      target: host.current!,
      props: {
        blocks: initialContent,
        services,
        onchange: (blocks: HMBlockNode[]) => callbacks.current.onChange?.(blocks),
        onsession: (session: Session<any>) => callbacks.current.onSession?.(session),
      },
    })
    return () => {
      unmount(app)
    }
  }, [initialContent, services])

  return <div ref={host} />
}
