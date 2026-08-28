import * as stylex from '@stylexjs/stylex'
import {HMDocument, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {getDocumentTitle, hmId, unpackHmId} from '@shm/shared'
import {useAccount, useResource} from '@shm/shared/models/entity'
import {Button} from '@shm/ui/button'
import {useHighlighter} from '@shm/ui/highlight-context'
import {SizableText} from '@shm/ui/text'
import {Fragment, Node} from '@tiptap/pm/model'
import {useEffect, useMemo, useState} from 'react'
import {Pencil} from '../../ui/src/icons'
import {BlockNoteEditor, getBlockInfoFromPos, HyperlinkToolbarProps} from './blocknote'
import {getNodeById} from './blocknote/core/api/util/nodeUtil'
import {HypermediaLinkForm} from './hm-link-form'
import {HMBlockSchema} from './schema'
const styles = stylex.create({
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s620be2c4: {
    maxHeight: '60vh',
  },
  s561ad0c9: {
    width: '320px',
  },
  s21707c9a: {
    overflow: 'auto',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s34b1ac: {
    paddingInline: 'calc(0.25rem * 1)',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  s646c459b: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
      },
    },
  },
  s4d2890f8: {
    ':hover': {
      '@media (hover: hover)': {
        opacity: '80%',
      },
    },
  },
  s48a3ed91: {
    ':active': {
      backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
    },
  },
  s316038ee: {
    ':active': {
      opacity: '80%',
    },
  },
  sbf63c09a: {
    color: 'var(--link)',
  },
  s28e3580b: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--link-hover)',
      },
    },
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function HypermediaLinkPreview(
  props: HyperlinkToolbarProps & {
    url: string
    openUrl: (url?: string | undefined, newWindow?: boolean | undefined) => void
    stopEditing: boolean
    forceEditing?: boolean
    formComponents: () => React.JSX.Element
    type: 'link' | 'inline-embed' | 'embed' | 'card' | 'embed-link' | 'button'
    toolbarProps?: {
      alignment?: 'flex-start' | 'center' | 'flex-end'
      view?: string
      [key: string]: any
    }
  },
) {
  const [isEditing, setIsEditing] = useState(props.forceEditing || false)
  const unpackedRef = useMemo(() => unpackHmId(props.url), [props.url])
  const profileAccountUid = unpackedRef?.path?.[0] === ':profile' ? unpackedRef.path[1] || unpackedRef.uid : null
  const entity = useResource(profileAccountUid ? null : unpackedRef || undefined)
  const account = useAccount(profileAccountUid)
  // console.log('entity', entity)
  const document = entity.data?.type === 'document' ? entity.data.document : undefined
  useEffect(() => {
    if (props.stopEditing && isEditing) {
      setIsEditing(false)
    }
  }, [props.stopEditing, isEditing])
  const highlight = useHighlighter()
  function handleChangeBlockType(type: string) {
    const tiptap = props.editor._tiptapEditor
    const {state, view} = tiptap
    const unpackedRef = unpackHmId(props.url)
    const schema = state.schema
    const getTitle = () => {
      if (profileAccountUid) {
        return account.data?.metadata?.name || props.text || props.url
      }
      if (['inline-embed', 'embed'].includes(props.type)) {
        const title = getTitleFromEntity(unpackedRef, document)
        return title || props.text || props.url
      }
      return props.text || props.url
    }
    const title = getTitle()
    if (type === 'link') {
      const node = schema.text(title, [
        schema.marks['link'].create({
          href: props.url,
        }),
      ])
      insertNode(props.editor, props.id, props.url, props.text, props.type, node)
    } else if (type === 'inline-embed') {
      const node = schema.nodes['inline-embed'].create(
        {
          link: props.url,
        },
        schema.text(' '),
      )
      insertMentionNode(props.editor, props.text, node, props.id, props.type === 'link')
    } else if (type === 'button') {
      const node = schema.nodes.button.create({
        url: props.url,
        name: title,
      })
      insertNode(props.editor, props.id, props.url, props.text, props.type, node)
    } else if (type === 'embed' || type === 'card' || type === 'comments' || type === 'embed-link') {
      const node = schema.nodes.embed.create({
        url: props.url,
        view: type === 'embed' ? 'Content' : type === 'card' ? 'Card' : type === 'embed-link' ? 'Link' : 'Comments',
      })
      insertNode(props.editor, props.id, props.url, props.text, props.type, node)
    }
    props.resetHyperlink()
  }

  // Card and Link view embeds have their own action bar. Suppress toolbar for those types
  if (props.type === 'card' || props.type === 'embed-link') return null
  return (
    <div
      data-testid="hm-link-preview"
      className={
        stylex.props(
          styles.s5fd609e3,
          styles.s2ffff9,
          styles.s620be2c4,
          styles.s561ad0c9,
          styles.s21707c9a,
          styles.sf79988b7,
          styles.s1aa15,
          styles.s8a6c2948,
        ).className || ''
      }
    >
      {isEditing ? (
        <div
          data-testid="hm-link-form"
          className={stylex.props(styles.s2ffff9, styles.sb42feb5d, styles.s67e351ac, styles.s5d936fb).className || ''}
        >
          {/* <SizableText fontWeight="700">{`${
            props.type.charAt(0).toUpperCase() + props.type.slice(1)
           } settings`}</SizableText> */}

          {props.formComponents && props.formComponents()}

          <HypermediaLinkForm
            editor={props.editor}
            id={props.id}
            url={props.url}
            text={props.text}
            updateLink={props.updateHyperlink}
            // @ts-expect-error
            openUrl={props.openUrl}
            onChangeType={(type) => {
              handleChangeBlockType(type)
            }}
            type={props.type}
            hasName={props.type !== 'embed' && props.type !== 'inline-embed'}
            hasSearch={props.type !== 'link'}
            resetLink={props.resetHyperlink}
            isHmLink={!!unpackedRef}
            toolbarProps={props.toolbarProps}
          />
        </div>
      ) : (
        <div
          className={
            stylex.props(
              styles.s2ffff9,
              styles.scdbaf625,
              styles.sc6ed1702,
              styles.sc1a629cb,
              styles.s5d936fb,
              styles.s34b1ac,
            ).className || ''
          }
        >
          <div
            data-testid="hm-link-preview-open-button"
            className={
              stylex.props(
                styles.s2ffff9,
                styles.sb42feb5d,
                styles.sc7847ec6,
                styles.s92852dd5,
                styles.sf799889b,
                styles.s34b1ad,
                styles.sc5dd13f4,
                styles.s646c459b,
                styles.s4d2890f8,
                styles.s48a3ed91,
                styles.s316038ee,
              ).className || ''
            }
            onClick={() => props.openUrl(props.url)}
            {...highlight(profileAccountUid ? hmId(profileAccountUid) : unpackedRef)}
          >
            <SizableText
              size="lg"
              className={
                stylex.props(styles.sbf63c09a, styles.s28e3580b, styles.sb42feb5d, styles.s6e724d66).className || ''
              }
              data-testid="hm-link-preview-url"
            >
              {!!unpackedRef ? account.data?.metadata?.name ?? document?.metadata.name ?? props.url : props.url}
            </SizableText>
          </div>
          <Button
            data-testid="hm-link-preview-edit-button"
            className={stylex.props(styles.s646c459b, styles.s4d2890f8).className || ''}
            onClick={() => setIsEditing(true)}
          >
            <Pencil className={stylex.props(styles.sca3de968).className || ''} />
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Replace the embed/card block under `selectedId` with a different node type
 * pointing at the same URL.
 */
export function transformEmbedNode(
  editor: BlockNoteEditor<HMBlockSchema>,
  selectedId: string,
  url: string,
  toType: 'link' | 'button' | 'embed' | 'card',
  fallbackTitle: string,
) {
  const {state} = editor._tiptapEditor
  const schema = state.schema
  let node: Node
  if (toType === 'link') {
    node = schema.text(fallbackTitle || url, [
      schema.marks['link'].create({
        href: url,
      }),
    ])
  } else if (toType === 'button') {
    node = schema.nodes.button.create({
      url,
      name: fallbackTitle || url,
    })
  } else {
    node = schema.nodes.embed.create({
      url,
      view: toType === 'card' ? 'Card' : 'Content',
    })
  }
  insertNode(editor, selectedId, url, '', 'embed', node)
}
function getTitleFromEntity(unpackedId?: UnpackedHypermediaId | null, document?: HMDocument | null) {
  if (!document || !unpackedId) return
  let title
  if (unpackedId.blockRef) {
    // @ts-ignore
    const block = document.content.find((block) => {
      if (block.block) {
        return block.block.id === unpackedId.blockRef
      }
    })
    if (block?.block?.type === 'Heading') {
      title = block.block.text
    }
  }
  if (!title) {
    title = getDocumentTitle(document)
  }
  return title
}
function insertNode(
  editor: BlockNoteEditor<HMBlockSchema>,
  selectedId: string,
  link: string,
  text: string,
  prevType: string,
  node: Node,
) {
  const {state, view} = editor._tiptapEditor
  const {posBeforeNode} = getNodeById(selectedId, state.doc)
  const blockInfo = getBlockInfoFromPos(state, posBeforeNode + 1)
  let tr = state.tr

  // If mention or link is inline with other text the child count will be more than 1
  if (blockInfo.blockContent.node.content.childCount > 1) {
    const $pos = state.doc.resolve(posBeforeNode + 1)
    let startPos = $pos.start()
    let endPos = $pos.end()
    let endContent = Fragment.empty

    // Set start and end positions to the link or mention bounds instead of the whole block content
    if (prevType === 'link') {
      // @ts-ignore
      $pos.parent.descendants((node, pos, _parent, index) => {
        if (node.marks.length > 0 && node.marks[0].attrs.href === link) {
          startPos = index === 0 ? $pos.start() + pos - 2 : $pos.start() + pos
          // endPos = index === 0 ? $pos.end() : $pos.start() + pos + text.length
          endPos = $pos.start() + pos + text.length
        } else if (startPos !== $pos.start() && endPos !== $pos.end()) {
          endContent = endContent.addToEnd(node)
        }
      })
    } else if (prevType === 'inline-embed') {
      // @ts-ignore
      $pos.parent.descendants((node, pos, _parent, index) => {
        if (node.type.name === 'inline-embed' && node.attrs.link === link) {
          startPos = index === 0 ? $pos.start() - 1 : $pos.start() + pos
          // endPos = index === 0 ? $pos.end() : $pos.start() + pos + 1
          endPos = $pos.start() + pos + 1
        } else if (startPos !== $pos.start() && endPos !== $pos.end()) {
          endContent = endContent.addToEnd(node)
        }
      })
    }
    tr = tr.replaceRangeWith(startPos, endPos, node)

    // const newBlock = state.schema.nodes['blockNode'].createAndFill()!
    // const nextBlockPos = $pos.end() + 2
    // const nextBlockContentPos = nextBlockPos + 2
    // const $nextBlockPos = state.doc.resolve(nextBlockContentPos)
    // if (
    //   endContent.childCount &&
    //   !(
    //     endContent.childCount === 1 &&
    //     endContent.firstChild?.textContent.trim() === ''
    //   )
    // ) {
    //   tr = tr.insert(nextBlockPos, newBlock)

    //   const endNode = $pos.parent.copy(endContent)
    //   tr = tr.replaceWith(
    //     $nextBlockPos.before($nextBlockPos.depth),
    //     nextBlockContentPos + 1,
    //     endNode,
    //   )
    // }

    // tr = tr.insert(nextBlockPos, newBlock)
    // tr = tr.replaceWith(
    //   $nextBlockPos.before($nextBlockPos.depth),
    //   nextBlockContentPos + 1,
    //   node,
    // )
    // tr = tr.deleteRange(startPos, endPos)
  } else {
    const {posBeforeNode} = getNodeById(selectedId, state.doc)
    const blockInfo = getBlockInfoFromPos(state, posBeforeNode + 1)
    tr = tr.replaceRangeWith(blockInfo.blockContent.beforePos, blockInfo.blockContent.afterPos, node)
  }
  view.dispatch(tr)
  editor._tiptapEditor.commands.focus()
}
function insertMentionNode(
  editor: BlockNoteEditor<HMBlockSchema>,
  name: string,
  node: Node,
  selectedId: string,
  inline: boolean,
) {
  const {state, view} = editor._tiptapEditor
  let tr = state.tr
  const {posBeforeNode} = getNodeById(selectedId, state.doc)
  const $pos = state.doc.resolve(posBeforeNode + 1)
  let startPos = $pos.start()
  let endPos = $pos.start() + 2
  if (inline) {
    let offset = 0
    // @ts-ignore
    $pos.parent.descendants((node, pos) => {
      if (node.marks.length > 0) {
        offset = pos
      }
    })
    startPos = startPos + offset
    endPos = startPos + name.length
  }
  view.dispatch(tr.replaceRangeWith(startPos, endPos, node))
}
