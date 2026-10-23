import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {EditorView} from '@codemirror/view'
import {useCallback, useMemo} from 'react'
import {type SeedEditorServices, seedEditorExtensions} from '../editor'
import {createSeedState, toHM} from '../state'
import './style.css'

/** Props for {@link SeedCodeMirrorEditor}. */
export type SeedCodeMirrorEditorProps = {
  /** The document content to load, as published (HM blocks). */
  initialContent: HMBlockNode[]
  /** Called with the HM blocks after every document change. */
  onChange?: (blocks: HMBlockNode[]) => void
  /** Search, loading and upload services (see {@link SeedEditorServices}). */
  services: SeedEditorServices
  /** Receives the underlying CodeMirror view once created (tests, devtools). */
  onView?: (view: EditorView) => void
}

/** A Seed document editor built on CodeMirror 6. Mount with a `key` to reload content. */
export function SeedCodeMirrorEditor({initialContent, onChange, services, onView}: SeedCodeMirrorEditorProps) {
  const view = useMemo(() => {
    const instance = new EditorView({
      state: createSeedState(initialContent, [
        seedEditorExtensions(services),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChange?.(toHM(update.state))
        }),
      ]),
    })
    onView?.(instance)
    return instance
    // The editor owns its state after mount; parents remount it to reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // A stable ref: a new callback per render would remount the view.
  const mountRef = useCallback((el: HTMLDivElement | null) => el?.append(view.dom), [view])
  return <div ref={mountRef} className="seed-codemirror" data-testid="codemirror-editor" />
}
