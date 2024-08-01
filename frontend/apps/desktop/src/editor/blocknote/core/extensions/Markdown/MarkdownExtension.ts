import {BlockNoteEditor, getBlockInfoFromPos, setGroupTypes} from '@/editor'
import {Extension} from '@tiptap/core'
import {Plugin} from 'prosemirror-state'
import {MarkdownToBlocks} from './MarkdownToBlocks'

const markdownRegex = new RegExp(
  [
    '^#{1,6} .+', // Headers
    '(\\*\\*|__)(.*?)\\1|(\\*|_)(.*?)\\3', // Bold/Italic
    '\\[([^\\]]+)\\]\\(([^)]+)\\)', // Links
    '!\\[([^\\]]*)\\]\\(([^)]+)\\)', // Images
    '`([^`]+)`', // Inline Code
    '^[-+*] .+', // Unordered Lists
    '^\\d+\\. .+', // Ordered Lists
    '^```[a-zA-Z]*\\n[\\s\\S]*?\\n```', // Code Blocks
  ].join('|'),
  'gm',
)

function isMarkdown(text: string) {
  return markdownRegex.test(text)
}

export const createMarkdownExtension = (bnEditor: BlockNoteEditor) => {
  const MarkdownExtension = Extension.create({
    name: 'MarkdownPasteHandler',
    priority: 99999,

    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            // @ts-ignore
            handlePaste: async (view, event, slice) => {
              const pastedText = event.clipboardData!.getData('text/plain')
              const pastedHtml = event.clipboardData!.getData('text/html')

              if (pastedHtml && !isMarkdown(pastedText)) {
                return false
              }

              // unified()
              //   .use(remarkParse)
              //   .use(remarkRehype)
              //   .use(rehypeStringify)
              //   .process(pastedText)
              //   .then((file) => {
              //     const parser = new DOMParser()
              //     const doc = parser.parseFromString(
              //       file.value.toString(),
              //       'text/html',
              //     )
              //     const fragment = ProseMirrorDOMParser.fromSchema(
              //       view.state.schema,
              //     ).parse(doc.body)

              //     const {state} = view
              //     let {tr} = state

              //     const newNodes: ProseMirrorNode[] = [] // Array to hold the final nodes
              //     let rootBlockGroup = state.schema.nodes['blockGroup'].create(
              //       {listType: 'div'},
              //       Fragment.empty,
              //     )
              //     const stack: {
              //       level: number
              //       blockContainer: ProseMirrorNode
              //     }[] = []

              //     const getHeadingLevel = (node: ProseMirrorNode) => {
              //       if (node.firstChild!.type.name.startsWith('heading')) {
              //         return parseInt(node.firstChild!.attrs.level, 10)
              //       }
              //       return 0
              //     }

              //     const createBlockContainer = (node: ProseMirrorNode) => {
              //       return state.schema.nodes['blockContainer'].create(
              //         {...node.attrs, id: createId()},
              //         node.content,
              //       )
              //     }

              //     const traverseNodes = (node: ProseMirrorNode) => {
              //       if (node.type.name === 'blockContainer') {
              //         const headingLevel = getHeadingLevel(node)

              //         if (headingLevel > 0) {
              //           while (
              //             stack.length &&
              //             stack[stack.length - 1].level >= headingLevel
              //           ) {
              //             stack.pop()
              //           }

              //           if (stack.length) {
              //             const parentBlockContainer =
              //               stack[stack.length - 1].blockContainer
              //             const newBlockContainer = createBlockContainer(node)
              //             if (
              //               parentBlockContainer.content.lastChild?.type.name ==
              //               'blockGroup'
              //             ) {
              //               const newBlockGroup =
              //                 parentBlockContainer.content.lastChild
              //               newBlockGroup.content =
              //                 newBlockGroup.content.append(
              //                   Fragment.from(newBlockContainer),
              //                 )
              //               parentBlockContainer.content =
              //                 parentBlockContainer.content.replaceChild(
              //                   parentBlockContainer.content.childCount - 1,
              //                   newBlockGroup,
              //                 )
              //             } else {
              //               const newBlockGroup = state.schema.nodes[
              //                 'blockGroup'
              //               ].create(
              //                 {
              //                   listType: 'div',
              //                   listLevel: String(stack.length),
              //                 },
              //                 Fragment.from(newBlockContainer),
              //               )
              //               parentBlockContainer.content =
              //                 parentBlockContainer.content.append(
              //                   Fragment.from([newBlockGroup]),
              //                 )
              //             }

              //             stack[stack.length - 1].blockContainer =
              //               parentBlockContainer
              //             stack.push({
              //               level: headingLevel,
              //               blockContainer: newBlockContainer,
              //             })
              //           } else {
              //             const newBlockContainer = createBlockContainer(node)
              //             rootBlockGroup = rootBlockGroup.copy(
              //               rootBlockGroup.content.append(
              //                 Fragment.from(newBlockContainer),
              //               ),
              //             )
              //             stack.push({
              //               level: headingLevel,
              //               blockContainer: newBlockContainer,
              //             })
              //           }
              //         } else {
              //           if (stack.length) {
              //             const parentBlockContainer =
              //               stack[stack.length - 1].blockContainer
              //             const newBlockContainer = createBlockContainer(node)
              //             const newBlockGroup = state.schema.nodes[
              //               'blockGroup'
              //             ].create(
              //               {
              //                 listType: 'div',
              //                 listLevel: String(stack.length),
              //               },
              //               Fragment.from(newBlockContainer),
              //             )
              //             if (
              //               parentBlockContainer.content.lastChild?.type.name ==
              //               'blockGroup'
              //             ) {
              //               parentBlockContainer.content =
              //                 parentBlockContainer.content.replaceChild(
              //                   parentBlockContainer.content.childCount - 1,
              //                   newBlockGroup,
              //                 )
              //             } else {
              //               parentBlockContainer.content =
              //                 parentBlockContainer.content.append(
              //                   Fragment.from([newBlockGroup]),
              //                 )
              //             }
              //             stack[stack.length - 1].blockContainer =
              //               parentBlockContainer
              //           } else {
              //             const newBlockContainer = createBlockContainer(node)
              //             rootBlockGroup = rootBlockGroup.copy(
              //               rootBlockGroup.content.append(
              //                 Fragment.from(newBlockContainer),
              //               ),
              //             )
              //           }
              //         }

              //         for (let i = 1; i < node.childCount; i++) {
              //           traverseNodes(node.child(i)) // Recursively process child nodes
              //         }
              //       } else if (node.type.name === 'blockGroup') {
              //         node.content.forEach((childNode) => {
              //           traverseNodes(childNode)
              //         })
              //       }
              //     }

              //     // Traverse the fragment's content
              //     fragment.content.forEach((childNode) => {
              //       traverseNodes(childNode)
              //     })

              //     newNodes.push(rootBlockGroup)

              //     try {
              //       if (
              //         $from.pos >= 0 &&
              //         $to.pos <= view.state.doc.content.size
              //       ) {
              //         const {$from, $to} = state.selection

              //         // tr = tr.replaceWith($from.pos, $to.pos, newFragment)
              //         tr = tr.insert($from.pos, newFragment.firstChild!.content)
              //         // tr = tr.setSelection(new TextSelection($from))
              //         view.dispatch(tr)
              //       } else {
              //         console.error('Invalid selection range:', {$from, $to})
              //       }
              //     } catch (error) {
              //       console.error('Error inserting fragment:', error)
              //     }
              //   })
              //   .catch((error) => {
              //     console.error('Error processing pasted text:', error)
              //   })

              const {state} = view
              const {selection} = state

              const organizedBlocks = await MarkdownToBlocks(
                pastedText,
                bnEditor,
              )

              const blockInfo = getBlockInfoFromPos(state.doc, selection.from)

              bnEditor.replaceBlocks(
                [blockInfo.node.attrs.id],
                // @ts-ignore
                organizedBlocks,
              )

              setGroupTypes(bnEditor._tiptapEditor, organizedBlocks)

              return true
            },
          },
        }),
      ]
    },
  })

  return MarkdownExtension
}
