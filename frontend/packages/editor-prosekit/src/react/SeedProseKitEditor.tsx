import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {createEditor, type Editor, union} from 'prosekit/core'
import {ProseKit, useDocChange} from 'prosekit/react'
import {useCallback, useMemo} from 'react'
import {defineSeedCommands} from '../commands'
import {fromHM, toHM} from '../convert'
import {defineSeedEditorBase} from '../schema'
import {SeedEditorMenus} from './menus'
import {defineSeedNodeViews} from './node-views'
import {type SeedEditorServices, SeedServicesContext} from './services'
import './style.css'

/** The full Seed ProseKit extension: schema, editing behaviour and React views. */
export function defineSeedEditorExtension() {
  return union(defineSeedEditorBase(), defineSeedCommands(), defineSeedNodeViews())
}

function ChangeListener({onChange}: {onChange: (blocks: HMBlockNode[]) => void}) {
  useDocChange((doc) => onChange(toHM(doc)))
  return null
}

/** Props for {@link SeedProseKitEditor}. */
export type SeedProseKitEditorProps = {
  /** The document content to load, as published (HM blocks). */
  initialContent: HMBlockNode[]
  /** Called with the HM blocks after every document change. */
  onChange?: (blocks: HMBlockNode[]) => void
  /** Search and loading services (see {@link SeedEditorServices}). */
  services: SeedEditorServices
  /** Receives the underlying ProseKit editor once created (tests, devtools). */
  onEditor?: (editor: Editor) => void
}

/** A Seed document editor built on ProseKit. Mount with a `key` to reload content. */
export function SeedProseKitEditor({initialContent, onChange, services, onEditor}: SeedProseKitEditorProps) {
  const editor = useMemo(() => {
    const extension = defineSeedEditorExtension()
    const instance = createEditor({extension})
    instance.setContent(fromHM(initialContent, instance.schema))
    onEditor?.(instance)
    return instance
    // The editor owns its state after mount; parents remount it to reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // A stable ref: a new callback per render would unmount and remount the view.
  const mountRef = useCallback(
    (el: HTMLDivElement | null) => {
      editor.mount(el)
    },
    [editor],
  )
  return (
    <SeedServicesContext.Provider value={services}>
      <ProseKit editor={editor}>
        <div className="seed-prosekit">
          <div ref={mountRef} className="seed-prosekit-content" data-testid="prosekit-editor" />
          <SeedEditorMenus />
        </div>
        {onChange ? <ChangeListener onChange={onChange} /> : null}
      </ProseKit>
    </SeedServicesContext.Provider>
  )
}
