import {CodeHighlightNode, CodeNode} from '@lexical/code'
import {LinkNode} from '@lexical/link'
import {
  $applyNodeReplacement,
  $getState,
  $setState,
  createState,
  DecoratorNode,
  ElementNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type EditorConfig,
  type LexicalNode,
  type RangeSelection,
} from 'lexical'
import type {JSX} from 'react'

/** HM annotation without its `starts`/`ends` ranges. */
export type AnnotationBody = Record<string, any> & {type: string}

const anyState = <K extends string>(key: K) =>
  createState(key, {parse: (v) => (v === undefined ? null : (v as any)), resetOnCopyNode: true})

/** The HM block id of a {@link SeedBlockNode}. Copies (paste) drop it, so they get a fresh id. */
export const hmIdState = createState('hmId', {
  parse: (v) => (typeof v === 'string' ? v : ''),
  resetOnCopyNode: true,
})
/** The HM block as loaded, kept whole so unknown fields survive. */
export const hmOriginalState = anyState('hmOriginal')
/** JSON of the fields the editor modelled at load time; equal on save means "untouched". */
export const hmBaselineState = anyState('hmBaseline')
/** Key order of the loaded `{block, children}` node. */
export const hmNodeKeysState = anyState('hmNodeKeys')
/** `childrenType` of a {@link SeedGroupNode}; `null` means "no attribute". Unknown values are kept. */
export const childrenTypeState = createState('childrenType', {
  parse: (v) => (typeof v === 'string' ? v : null),
})
/** HM block type of a {@link SeedTextBlockNode}: `Paragraph`, `Heading` or any unknown type. */
export const hmTypeState = createState('hmType', {parse: (v) => (typeof v === 'string' ? v : 'Paragraph')})
/** Annotations this text carries that have no Lexical equivalent (unknown types, unknown attributes). */
export const hmExtraState = createState('hmExtra', {
  parse: (v) => (Array.isArray(v) ? (v as AnnotationBody[]) : []),
  isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
})

/** `link` of an atom block or mention. */
export const linkState = createState('link', {parse: (v) => (typeof v === 'string' ? v : '')})
/** `text` of an atom block (caption, button label) or the LaTeX of a math block. */
export const textState = createState('text', {parse: (v) => (typeof v === 'string' ? v : '')})
/** Every `attributes` entry of an atom block, kept whole. */
export const attributesState = createState('attributes', {
  parse: (v) => (v && typeof v === 'object' ? v : {}) as Record<string, any>,
})
/** The loaded `Embed` annotation of a mention, without ranges. */
export const annotationState = anyState('annotation')
/** Text formats (bold…) of the text a mention sits in. */
export const formatState = createState('format', {parse: (v) => (typeof v === 'number' ? v : 0)})
/** Colour style of the text a mention sits in. */
export const styleState = createState('style', {parse: (v) => (typeof v === 'string' ? v : '')})

/**
 * Decorators are rendered by the React layer; the core nodes stay framework
 * free, so the React package registers this renderer.
 */
export const decoratorRenderers: {
  atom?: (node: SeedAtomNode) => JSX.Element
  math?: (node: SeedMathNode) => JSX.Element
  mention?: (node: SeedMentionNode) => JSX.Element
} = {}

/** One HM block: its content node followed by an optional {@link SeedGroupNode} of children. */
export class SeedBlockNode extends ElementNode {
  $config() {
    return this.config('seed-block', {
      extends: ElementNode,
      stateConfigs: [
        {stateConfig: hmIdState},
        {stateConfig: hmOriginalState},
        {stateConfig: hmBaselineState},
        {stateConfig: hmNodeKeysState},
        {stateConfig: childrenTypeState},
      ],
    })
  }
  createDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'seed-block'
    dom.dataset.blockId = $getState(this, hmIdState)
    return dom
  }
  updateDOM(_prev: this, dom: HTMLElement): boolean {
    dom.dataset.blockId = $getState(this, hmIdState)
    return false
  }
  canBeEmpty(): false {
    return false
  }
}

/** The children of a block, with the HM `childrenType` (Group, Ordered, Unordered, Blockquote…). */
export class SeedGroupNode extends ElementNode {
  $config() {
    return this.config('seed-group', {extends: ElementNode, stateConfigs: [{stateConfig: childrenTypeState}]})
  }
  createDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'seed-group'
    setDataAttr(dom, 'childrenType', $getState(this, childrenTypeState))
    return dom
  }
  updateDOM(_prev: this, dom: HTMLElement): boolean {
    setDataAttr(dom, 'childrenType', $getState(this, childrenTypeState))
    return false
  }
  canBeEmpty(): false {
    return false
  }
}

function setDataAttr(dom: HTMLElement, key: string, value: string | null) {
  if (value) dom.dataset[key] = value
  else delete dom.dataset[key]
}

/** Editable inline text of a `Paragraph`, `Heading` or unknown block type. */
export class SeedTextBlockNode extends ElementNode {
  $config() {
    return this.config('seed-text', {extends: ElementNode, stateConfigs: [{stateConfig: hmTypeState}]})
  }
  createDOM(_config: EditorConfig): HTMLElement {
    const type = $getState(this, hmTypeState)
    const dom = document.createElement(type === 'Heading' ? 'h2' : type === 'Paragraph' ? 'p' : 'div')
    if (type !== 'Heading' && type !== 'Paragraph') {
      dom.className = 'seed-unknown'
      dom.dataset.hmType = type
    }
    return dom
  }
  updateDOM(prev: this): boolean {
    return $getState(prev, hmTypeState, 'direct') !== $getState(this, hmTypeState, 'direct')
  }
  static importDOM(): DOMConversionMap {
    const as = (hmType: string) => () => ({
      conversion: (): DOMConversionOutput => ({node: $createSeedTextBlockNode(hmType)}),
      priority: 1 as const,
    })
    return {
      p: as('Paragraph'),
      li: as('Paragraph'),
      h1: as('Heading'),
      h2: as('Heading'),
      h3: as('Heading'),
      h4: as('Heading'),
      h5: as('Heading'),
      h6: as('Heading'),
    }
  }
  /** Enter: a new sibling block, or the first child when the block has children and the caret is at the end. */
  insertNewAfter(selection: RangeSelection, restoreSelection = true): SeedTextBlockNode {
    const text = $createSeedTextBlockNode()
    const newBlock = $createSeedBlockNode().append(text)
    const block = this.getParent()
    const group = block?.getLastChild()
    const {anchor} = selection
    const anchorNode = anchor.getNode()
    const isAtEnd = anchorNode.is(this)
      ? anchor.offset === this.getChildrenSize()
      : !!this.getLastDescendant()?.is(anchorNode) && anchor.offset === anchorNode.getTextContentSize()
    if ($isSeedBlockNode(block) && $isSeedGroupNode(group)) {
      if (isAtEnd || this.isEmpty()) group.splice(0, 0, [newBlock])
      else {
        newBlock.append(group)
        block.insertAfter(newBlock, restoreSelection)
      }
    } else if ($isSeedBlockNode(block)) block.insertAfter(newBlock, restoreSelection)
    else this.insertAfter(newBlock, restoreSelection)
    return text
  }
  canBeEmpty(): true {
    return true
  }
}

/** A void (non-text) Seed block: Image, Video, File, Button, Embed, WebEmbed, Query, Nostr. */
export class SeedAtomNode extends DecoratorNode<JSX.Element> {
  $config() {
    return this.config('seed-atom', {
      extends: DecoratorNode,
      stateConfigs: [
        {stateConfig: hmTypeState},
        {stateConfig: linkState},
        {stateConfig: textState},
        {stateConfig: attributesState},
      ],
    })
  }
  createDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'seed-atom-host'
    return dom
  }
  updateDOM(): false {
    return false
  }
  isInline(): false {
    return false
  }
  decorate(): JSX.Element {
    return decoratorRenderers.atom?.(this) ?? (null as any)
  }
}

/** Math block: LaTeX source, rendered by the React layer. */
export class SeedMathNode extends DecoratorNode<JSX.Element> {
  $config() {
    return this.config('seed-math', {
      extends: DecoratorNode,
      stateConfigs: [{stateConfig: textState}],
    })
  }
  createDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'seed-math-host'
    return dom
  }
  updateDOM(): false {
    return false
  }
  isInline(): false {
    return false
  }
  getTextContent(): string {
    return $getState(this, textState)
  }
  decorate(): JSX.Element {
    return decoratorRenderers.math?.(this) ?? (null as any)
  }
}

/** Inline `Embed` annotation (`@account` / `[[document]]` mention) over the `\uFFFC` placeholder. */
export class SeedMentionNode extends DecoratorNode<JSX.Element> {
  $config() {
    return this.config('seed-mention', {
      extends: DecoratorNode,
      stateConfigs: [
        {stateConfig: linkState},
        {stateConfig: annotationState},
        {stateConfig: formatState},
        {stateConfig: styleState},
        {stateConfig: hmExtraState},
      ],
    })
  }
  createDOM(): HTMLElement {
    const dom = document.createElement('span')
    dom.className = 'seed-mention-host'
    return dom
  }
  updateDOM(): false {
    return false
  }
  isInline(): true {
    return true
  }
  isKeyboardSelectable(): boolean {
    return true
  }
  getTextContent(): string {
    return '\uFFFC'
  }
  decorate(): JSX.Element {
    return decoratorRenderers.mention?.(this) ?? (null as any)
  }
}

/** Create an empty block (fresh id is assigned by the id transform). */
export function $createSeedBlockNode(): SeedBlockNode {
  return $applyNodeReplacement(new SeedBlockNode())
}
/** Create a children group with the given `childrenType`. */
export function $createSeedGroupNode(childrenType: string | null = 'Group'): SeedGroupNode {
  return $setState($applyNodeReplacement(new SeedGroupNode()), childrenTypeState, childrenType)
}
/** Create a text block of the given HM type. */
export function $createSeedTextBlockNode(hmType = 'Paragraph'): SeedTextBlockNode {
  return $setState($applyNodeReplacement(new SeedTextBlockNode()), hmTypeState, hmType)
}
/** Type guard for {@link SeedBlockNode}. */
export const $isSeedBlockNode = (n: LexicalNode | null | undefined): n is SeedBlockNode => n instanceof SeedBlockNode
/** Type guard for {@link SeedGroupNode}. */
export const $isSeedGroupNode = (n: LexicalNode | null | undefined): n is SeedGroupNode => n instanceof SeedGroupNode
/** Type guard for {@link SeedTextBlockNode}. */
export const $isSeedTextBlockNode = (n: LexicalNode | null | undefined): n is SeedTextBlockNode =>
  n instanceof SeedTextBlockNode
/** Type guard for {@link SeedAtomNode}. */
export const $isSeedAtomNode = (n: LexicalNode | null | undefined): n is SeedAtomNode => n instanceof SeedAtomNode
/** Type guard for {@link SeedMathNode}. */
export const $isSeedMathNode = (n: LexicalNode | null | undefined): n is SeedMathNode => n instanceof SeedMathNode
/** Type guard for {@link SeedMentionNode}. */
export const $isSeedMentionNode = (n: LexicalNode | null | undefined): n is SeedMentionNode =>
  n instanceof SeedMentionNode
/** Whether a node can be the content (first child) of a {@link SeedBlockNode}. */
export const $isSeedContentNode = (n: LexicalNode | null | undefined) =>
  $isSeedTextBlockNode(n) || $isSeedAtomNode(n) || $isSeedMathNode(n) || n instanceof CodeNode

/** Every node class the Seed Lexical editor registers. */
export const SEED_NODES = [
  SeedBlockNode,
  SeedGroupNode,
  SeedTextBlockNode,
  SeedAtomNode,
  SeedMathNode,
  SeedMentionNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
]
