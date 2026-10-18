import {ChevronDown, ChevronRight} from 'lucide-react'
import {useState} from 'react'
import {Block, BlockNoteEditor, defaultProps} from './blocknote/core'
import {createReactBlockSpec} from './blocknote/react'
import {HMBlockSchema} from './schema'

export const UnknownBlock = createReactBlockSpec({
  type: 'unknown',
  propSchema: {
    ...defaultProps,
    originalType: {
      default: '',
    },
    originalData: {
      default: '',
    },
  },
  containsInlineContent: true,
  render: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) => (
    <UnknownBlockRender block={block} editor={editor} />
  ),
})

/**
 * Blocks this client can't render degrade quietly: readers see the block's own
 * text (if any) and its children render as usual. Editors also get a small
 * neutral note that can expand to show the stored data.
 */
function UnknownBlockRender({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) {
  const [expanded, setExpanded] = useState(false)
  const originalType = (block.props as any).originalType || 'Unknown'
  const originalData = (block.props as any).originalData || '{}'

  let parsedData: any = {}
  try {
    parsedData = JSON.parse(originalData)
  } catch {
    parsedData = {raw: originalData}
  }
  const text = typeof parsedData?.text === 'string' ? parsedData.text.trim() : ''

  return (
    <div className="block-content block-unknown flex flex-1 flex-col" contentEditable={false}>
      {text ? <p className="whitespace-pre-wrap">{text}</p> : null}
      {editor.isEditable ? (
        <div className="text-muted-foreground flex flex-col font-sans text-xs">
          <button type="button" className="flex items-center gap-1 self-start" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            <span>{originalType} block (not supported in this app, kept as is)</span>
          </button>
          {expanded && (
            <pre className="bg-muted mt-1 overflow-auto rounded-md p-2">
              <code className="font-mono wrap-break-word">{JSON.stringify(parsedData, null, 2)}</code>
            </pre>
          )}
        </div>
      ) : null}
    </div>
  )
}
