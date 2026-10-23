import {LexicalComposer} from '@lexical/react/LexicalComposer'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import {ContentEditable} from '@lexical/react/LexicalContentEditable'
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary'
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin'
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin'
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin'
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import type {LexicalEditor} from 'lexical'
import {useEffect, useState} from 'react'
import {registerSeedEditing} from '../commands'
import {fromHM, toHM} from '../convert'
import {SEED_NODES} from '../nodes'
import {installSeedDecorators} from './decorators'
import {SeedEditorMenus} from './menus'
import {type SeedEditorServices, SeedServicesContext} from './services'
import './style.css'

installSeedDecorators()

/** CSS classes Lexical puts on formatted text, links and code blocks. */
const theme = {
  text: {
    bold: 'seed-bold',
    italic: 'seed-italic',
    underline: 'seed-underline',
    strikethrough: 'seed-strike',
    underlineStrikethrough: 'seed-underline-strike',
    code: 'seed-inline-code',
  },
  link: 'seed-link',
  code: 'seed-code-block',
}

function SeedEditingPlugin({onEditor}: {onEditor?: (editor: LexicalEditor) => void}) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => registerSeedEditing(editor), [editor])
  useEffect(() => {
    onEditor?.(editor)
  }, [editor, onEditor])
  return null
}

/** Props for {@link SeedLexicalEditor}. */
export type SeedLexicalEditorProps = {
  /** The document content to load, as published (HM blocks). */
  initialContent: HMBlockNode[]
  /** Called with the HM blocks after every document change. */
  onChange?: (blocks: HMBlockNode[]) => void
  /** Search and loading services (see {@link SeedEditorServices}). */
  services: SeedEditorServices
  /** Receives the underlying Lexical editor once created (tests, devtools). */
  onEditor?: (editor: LexicalEditor) => void
}

/** A Seed document editor built on Lexical. Mount with a `key` to reload content. */
export function SeedLexicalEditor({initialContent, onChange, services, onEditor}: SeedLexicalEditorProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [initialConfig] = useState(() => ({
    namespace: 'seed',
    nodes: SEED_NODES,
    theme,
    editorState: JSON.stringify(fromHM(initialContent)),
    onError: (error: Error) => console.error(error),
  }))
  return (
    <SeedServicesContext.Provider value={services}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="seed-lexical" ref={setContainer}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="seed-lexical-content" data-testid="lexical-editor" />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LinkPlugin />
          <SeedEditingPlugin onEditor={onEditor} />
          <SeedEditorMenus container={container} />
          {onChange ? (
            <OnChangePlugin ignoreSelectionChange onChange={(state) => onChange(toHM(state.toJSON()))} />
          ) : null}
        </div>
      </LexicalComposer>
    </SeedServicesContext.Provider>
  )
}
