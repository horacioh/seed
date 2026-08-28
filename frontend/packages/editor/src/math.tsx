import * as stylex from '@stylexjs/stylex'
import {Textarea} from '@shm/ui/components/textarea'
import {Separator} from '@shm/ui/separator'
import {cn} from '@shm/ui/utils'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {NodeSelection} from 'prosemirror-state'
import {useCallback, useEffect, useRef, useState} from 'react'
import {BlockSelectionWrapper} from './block-selection-wrapper'
import {findNextBlock, findPreviousBlock} from './block-utils'
import {BlockNoteEditor} from './blocknote/core/BlockNoteEditor'
import {selectableNodeTypes} from './blocknote/core/extensions/BlockManipulation/BlockManipulationExtension'
import {Block} from './blocknote/core/extensions/Blocks/api/blockTypes'
import {defaultProps} from './blocknote/core/extensions/Blocks/api/defaultBlocks'
import {getBlockInfoFromSelection} from './blocknote/core/extensions/Blocks/helpers/getBlockInfoFromPos'
import {createReactBlockSpec} from './blocknote/react/ReactBlockSpec'
import {HMBlockSchema} from './schema'
const styles_2 = stylex.create({
  s6a5b96c7: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'color-mix(in oklab, #fff 3%, transparent)',
      },
    },
  },
})
const styles = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s7c401ed1: {
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s6c2e6c9d: {
    backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  s646c4599: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 3%, transparent)',
      },
    },
  },
  sdef3facc: {
    position: 'relative',
  },
  s3f582e17: {
    minHeight: 'calc(0.25rem * 7)',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  se1ea359f: {
    paddingBlock: '10px',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s93b5f015: {
    alignItems: 'flex-start',
  },
  sa4fc76f8: {
    overflow: 'scroll',
  },
  sbf5f1771: {
    fontSize: '1rem',
    lineHeight: 'var(--text-base--line-height)',
  },
  s7a0bc2fa: {
    paddingInline: '16px',
  },
})
export const MathBlock = (type: 'math') =>
  createReactBlockSpec({
    type,
    propSchema: {
      ...defaultProps,
      text: {
        default: '',
      },
      src: {
        default: '',
      },
    },
    containsInlineContent: true,
    render: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) =>
      Render(block, editor),
  })
const Render = (block: Block<HMBlockSchema>, editor: BlockNoteEditor<HMBlockSchema>) => {
  const [opened, setOpened] = useState(false)
  const mathRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const tiptapEditor = editor._tiptapEditor
  const selection = tiptapEditor.state.selection
  const containerRef = useRef<HTMLDivElement>(null)
  const [isContentSmallerThanContainer, setIsContentSmallerThanContainer] = useState(true)
  // Snapshot at mousedown whether the block was already node-selected. PM's
  // handleClickOn selects the block on mouseup (before this React click), so
  // the first click is select-only and only a click on an already-selected
  // math block opens the LaTeX editor.
  const wasSelectedAtMouseDown = useRef(false)
  const commentStyle = editor.renderType === 'comment'

  // Close the LaTeX editor when the selection moves off this block.
  useEffect(() => {
    if (!opened) return
    const selectedNode = getBlockInfoFromSelection(tiptapEditor.state)
    if (selectedNode?.block.node.attrs.id !== block.id) {
      setOpened(false)
    }
  }, [selection, block.id, opened])
  useEffect(() => {
    if (mathRef.current) {
      if (block.content[0]) {
        try {
          mathRef.current.style.color = ''
          // @ts-expect-error
          katex.render(block.content[0].text, mathRef.current, {
            throwOnError: true,
            displayMode: true,
          })
        } catch (e) {
          if (e instanceof katex.ParseError) {
            mathRef.current.innerText =
              "Error in LaTeX '" +
              // @ts-expect-error
              block.content[0].text +
              "':\n" +
              e.message.split(':')[1]
            mathRef.current.style.color = 'red'
          } else {
            throw e
          }
        }
      } else {
        katex.render('\\color{gray} TeX math', mathRef.current, {
          throwOnError: false,
          displayMode: true,
        })
      }
    }
  }, [block.content])
  useEffect(() => {
    if (!opened) return
    // Defer the focus to the next macrotask: when the block is opened right
    // after insertion, `selectInsertedBlock` calls `view.focus()` on the
    // ProseMirror view synchronously, which would otherwise steal focus
    // back from the textarea. Running after that lets the textarea win.
    const timer = setTimeout(() => {
      const el = inputRef.current
      if (!el) return
      el.focus()
      const length = el.value.length
      el.setSelectionRange(length, length)
    }, 0)
    return () => clearTimeout(timer)
  }, [opened])

  // Function to measure content and container widths
  const measureContentAndContainer = useCallback(() => {
    if (mathRef.current && containerRef.current) {
      // Get the actual rendered content width from the first child of mathRef
      // (KaTeX creates nested elements)
      const contentElement = mathRef.current.firstElementChild as HTMLElement
      const contentWidth = contentElement ? contentElement.offsetWidth : mathRef.current.offsetWidth
      const containerWidth = containerRef.current.offsetWidth

      // Account for padding
      const containerPaddingHorizontal = 24
      const adjustedContainerWidth = containerWidth - containerPaddingHorizontal

      // Update state based on comparison
      const shouldCenter = contentWidth < adjustedContainerWidth
      if (shouldCenter !== isContentSmallerThanContainer) {
        setIsContentSmallerThanContainer(shouldCenter)
      }
    }
  }, [isContentSmallerThanContainer])

  // Update measurements when content changes
  // @ts-ignore
  useEffect(() => {
    // @ts-expect-error
    if (block.content[0] && block.content[0].text) {
      // Use a timeout to ensure KaTeX has finished rendering
      const timerId = setTimeout(() => {
        measureContentAndContainer()
      }, 50)
      return () => clearTimeout(timerId)
    }
  }, [block.content, measureContentAndContainer])

  // Also measure after mathRef updates (when KaTeX rendering is done)
  // @ts-ignore
  useEffect(() => {
    if (mathRef.current) {
      // Use MutationObserver to detect when KaTeX finishes rendering
      const observer = new MutationObserver((mutations) => {
        measureContentAndContainer()
      })
      observer.observe(mathRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      })
      return () => {
        observer.disconnect()
      }
    }
  }, [measureContentAndContainer])

  // Add resize observer to handle container size changes
  // @ts-ignore
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        measureContentAndContainer()
      })
      resizeObserver.observe(container)
      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [measureContentAndContainer])
  return (
    <BlockSelectionWrapper
      editor={editor}
      block={block}
      selectOnMouseDown
      // The wrapper's capture-phase handler selects the block BEFORE this
      // component's own mousedown fires, so the was-selected snapshot must
      // come from the wrapper (pre-dispatch), not from a local handler.
      onSelectMouseDown={(wasSelected) => {
        wasSelectedAtMouseDown.current = wasSelected
      }}
    >
      <div
        contentEditable={false}
        className={cn(
          block.type,
          stylex.props(
            styles.s2ffff9,
            styles.scdbaf625,
            styles.s67e351ac,
            styles.s92852dd5,
            styles.sf79988b7,
            styles.s7c401ed1,
            styles.sf7fb00e8,
          ).className || '',
          commentStyle
            ? stylex.props(styles.s1a01a0ed, styles.s6c2e6c9d).className || ''
            : stylex.props(styles.s5fd609e3, styles.s1a01a0ed).className || '',
          stylex.props(styles.s646c4599).className || '',
          stylex.props(styles_2.s6a5b96c7).className || '',
        )}
      >
        <div
          ref={containerRef}
          onClick={() => {
            // First click selects (PM handleClickOn makes the NodeSelection);
            // a click on an already-selected block opens the LaTeX editor.
            if (editor.isEditable && !opened && wasSelectedAtMouseDown.current) {
              setOpened(true)
            }
          }}
          className={cn(
            stylex.props(
              styles.sdef3facc,
              styles.s2ffff9,
              styles.s3f582e17,
              styles.scdbaf625,
              styles.sa145969,
              styles.s67e351ac,
              styles.s34b1ae,
              styles.se1ea359f,
            ).className || '',
            isContentSmallerThanContainer
              ? stylex.props(styles.sc6ed1702, styles.s92852dd5).className || ''
              : stylex.props(styles.s93b5f015, styles.sa4fc76f8).className || '',
          )}
        >
          <p ref={mathRef} className={stylex.props(styles.sa145969, styles.sbf5f1771).className || ''} />
        </div>
        {opened && editor.isEditable && (
          <div className={stylex.props(styles.s2ffff9, styles.s67e351ac).className || ''}>
            <Separator />
            <div
              className={
                stylex.props(
                  styles.sdef3facc,
                  styles.s2ffff9,
                  styles.s3f582e17,
                  styles.sc6ed1702,
                  styles.s7a0bc2fa,
                  styles.se1ea359f,
                ).className || ''
              }
            >
              <Textarea
                ref={inputRef}
                onBlur={() => setOpened(false)}
                onKeyDown={(e) => {
                  const key = e.key
                  if (key === 'ArrowUp') {
                    e.preventDefault()
                    const {state, view} = tiptapEditor
                    const prevBlockInfo = findPreviousBlock(view, state.selection.from)
                    if (prevBlockInfo) {
                      const {prevBlock, prevBlockPos} = prevBlockInfo
                      const prevNode = prevBlock.firstChild!
                      const prevNodePos = prevBlockPos + 1
                      if (selectableNodeTypes.includes(prevNode.type.name)) {
                        const selection = NodeSelection.create(state.doc, prevNodePos)
                        view.dispatch(state.tr.setSelection(selection))
                      } else {
                        editor.setTextCursorPosition(editor.getTextCursorPosition().prevBlock!, 'end')
                      }
                      view.focus()
                      setOpened(false)
                    }
                  } else if (key === 'ArrowDown') {
                    e.preventDefault()
                    const {state, view} = tiptapEditor
                    const nextBlockInfo = findNextBlock(view, state.selection.from)
                    if (nextBlockInfo) {
                      const {nextBlock, nextBlockPos} = nextBlockInfo
                      const nextNode = nextBlock.firstChild!
                      const nextNodePos = nextBlockPos + 1
                      if (selectableNodeTypes.includes(nextNode.type.name)) {
                        const selection = NodeSelection.create(state.doc, nextNodePos)
                        view.dispatch(state.tr.setSelection(selection))
                      } else {
                        editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!, 'start')
                      }
                      view.focus()
                      setOpened(false)
                    }
                  } else if (key === 'Backspace') {
                    const blockInfo = getBlockInfoFromSelection(tiptapEditor.state)
                    if (blockInfo.block.node.attrs.id === block.id && !blockInfo.blockContent.node.textContent.length) {
                      const {state, view} = tiptapEditor
                      view.dispatch(state.tr.delete(blockInfo.block.beforePos + 1, blockInfo.block.afterPos - 1))
                      editor.focus()
                    }
                  }
                }}
                placeholder="E = mc^2"
                // @ts-expect-error
                value={block.content[0]?.text ?? ''}
                onChange={(e) => {
                  const newText = e.target.value
                  // @ts-expect-error
                  if (newText !== block.content?.[0]?.text) {
                    editor.updateBlock(
                      block,
                      // @ts-ignore
                      {
                        ...block,
                        content: [
                          {
                            type: 'text',
                            text: newText,
                            styles: {},
                          },
                        ],
                      },
                      true,
                    )
                  }
                }}
                className={stylex.props(styles.scdbaf625).className || ''}
              />
            </div>
          </div>
        )}
      </div>
    </BlockSelectionWrapper>
  )
}
