import * as stylex from '@stylexjs/stylex'
import {AlertCircle, ChevronDown, ChevronRight} from 'lucide-react'
import {useState} from 'react'
import {Block, BlockNoteEditor, defaultProps} from './blocknote/core'
import {createReactBlockSpec} from './blocknote/react'
import {HMBlockSchema} from './schema'
const styles = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  sb42feb5d: {
    flex: '1',
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
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s62a6ad96: {
    borderColor: 'oklch(80.8% 0.114 19.571)',
  },
  saeb1152d: {
    backgroundColor: 'oklch(93.6% 0.032 17.717)',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s6f33f8da: {
    color: 'oklch(57.7% 0.245 27.325)',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s6f33fc9b: {
    color: 'oklch(50.5% 0.213 27.518)',
  },
  s335490: {
    marginInline: 'calc(0.25rem * 2)',
  },
  s3301fa: {
    marginBottom: 'calc(0.25rem * 2)',
  },
  s21707c9a: {
    overflow: 'auto',
  },
  s62a6a9d5: {
    borderColor: 'oklch(88.5% 0.062 18.334)',
  },
  sc6f8deea: {
    backgroundColor: 'color-mix(in oklab, oklch(97.1% 0.013 17.38) 60%, transparent)',
  },
  s8e45c07b: {
    overflowWrap: 'break-word',
  },
  sa173a9a1: {
    fontFamily: 'var(--font-mono)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s6f34041d: {
    color: 'oklch(39.6% 0.141 25.723)',
  },
})
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
function UnknownBlockRender({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) {
  const [expanded, setExpanded] = useState(false)
  const originalType = (block.props as any).originalType || 'Unknown'
  const originalData = (block.props as any).originalData || '{}'
  let parsedData: any = {}
  try {
    parsedData = JSON.parse(originalData)
  } catch {
    parsedData = {
      raw: originalData,
    }
  }
  return (
    <div
      className={
        stylex.props(
          styles.s2ffff9,
          styles.sb42feb5d,
          styles.s67e351ac,
          styles.s92852dd5,
          styles.sf79988b7,
          styles.sad8c742c,
          styles.s62a6ad96,
          styles.saeb1152d,
        ).className || ''
      }
      contentEditable={false}
    >
      <div
        className={
          stylex.props(styles.s2ffff9, styles.sc7847ec6, styles.sc6ed1702, styles.s5d936fb, styles.s1aa15).className ||
          ''
        }
        onClick={() => setExpanded(!expanded)}
      >
        <AlertCircle className={stylex.props(styles.sca3de968, styles.s6f33f8da).className || ''} />
        <span
          className={
            stylex.props(styles.sb42feb5d, styles.sa1762f51, styles.sab7cc6fa, styles.s6f33fc9b).className || ''
          }
        >
          Unsupported Block: {originalType}
        </span>
        {expanded ? (
          <ChevronDown className={stylex.props(styles.sca3de968, styles.s6f33f8da).className || ''} />
        ) : (
          <ChevronRight className={stylex.props(styles.sca3de968, styles.s6f33f8da).className || ''} />
        )}
      </div>
      {expanded && (
        <pre
          className={
            stylex.props(
              styles.s335490,
              styles.s3301fa,
              styles.s21707c9a,
              styles.sf79988b7,
              styles.sad8c742c,
              styles.s62a6a9d5,
              styles.sc6f8deea,
              styles.s1aa15,
            ).className || ''
          }
        >
          <code
            className={
              stylex.props(styles.s8e45c07b, styles.sa173a9a1, styles.sab7cc79b, styles.s6f34041d).className || ''
            }
          >
            {JSON.stringify(parsedData, null, 2)}
          </code>
        </pre>
      )}
    </div>
  )
}
