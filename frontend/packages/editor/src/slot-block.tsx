import {defaultProps} from './blocknote/core'
import {createReactBlockSpec} from './blocknote/react'
import {SectionFrame} from './section-block'

/**
 * An invisible container for root level lists and grids. With `layout` set it is
 * a page section and renders the section frame behind its children. Either way
 * the children are ordinary blocks and always render, whatever the attributes.
 */
export const SlotBlock = createReactBlockSpec({
  type: 'slot',
  propSchema: {
    ...defaultProps,
    columnCount: {default: ''},
    layout: {default: ''},
    background: {default: ''},
    focalX: {default: ''},
    focalY: {default: ''},
    padding: {default: ''},
    contentWidth: {default: ''},
    extraAttributes: {default: ''},
  },
  containsInlineContent: false,
  render: ({block, editor}) =>
    block.props.layout ? <SectionFrame block={block as any} editor={editor as any} /> : null,
})
