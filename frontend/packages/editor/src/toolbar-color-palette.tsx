import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {Check} from 'lucide-react'
import {BlockNoteEditor, BlockSchema} from './blocknote'
const styles_3 = stylex.create({
  sf6144b3: {
    zIndex: '10001',
  },
})
const styles_2 = stylex.create({
  s68989642: {
    ':is(.dark *)': {
      borderColor: 'color-mix(in oklab, #fff 10%, transparent)',
    },
  },
})
const styles = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  sd52b2d2: {
    textTransform: 'uppercase',
  },
  s64e14c29: {
    letterSpacing: '0.025em',
  },
  s308b46: {
    display: 'grid',
  },
  s10768842: {
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  },
  s18c12: {
    height: 'calc(0.25rem * 7)',
  },
  s1c461: {
    width: 'calc(0.25rem * 7)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  se45bb2b0: {
    borderColor: 'color-mix(in oklab, #000 10%, transparent)',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
  s4d2890f8: {
    ':hover': {
      '@media (hover: hover)': {
        opacity: '80%',
      },
    },
  },
  s91ddbcb: {
    backgroundColor: 'var(--foreground)',
  },
  sc883a3d5: {
    boxShadow: '0 0 0 2px var(--ring-color, currentcolor)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sfaa26dce: {
    color: 'var(--background)',
  },
  s2daecf89: {
    color: '#fff',
  },
  sbcda378a: {
    mixBlendMode: 'difference',
  },
  s88a3565a: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  s9f8165e: {
    ':focus': {},
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sbecb6545: {
    ':focus': {
      outlineStyle: 'none',
    },
  },
  s4a7318b7: {
    ':focus': {
      boxShadow: '0 0 0 2px var(--ring-color, currentcolor)',
    },
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  s61da2a92: {
    color: 'oklch(26.9% 0 0)',
  },
  sa173a9a1: {
    fontFamily: 'var(--font-mono)',
  },
  sc2c9c6cc: {
    textDecorationLine: 'underline',
  },
})
export const TOOLBAR_COLOR_NAMES = [
  'default',
  // Neutral (gray) shades.
  'neutral-light',
  'neutral',
  'neutral-dark',
  // Chromatic shades.
  'red',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'fuchsia',
  'pink',
] as const
export type ToolbarColorName = (typeof TOOLBAR_COLOR_NAMES)[number]
/** Swatch backgrounds for the text-color palette, one per supported color. */
const textSwatchStyles = stylex.create({
  'neutral-light': {
    backgroundColor: {
      default: 'var(--color-neutral-400)',
      ':is(.dark *)': 'var(--color-neutral-600)',
    },
  },
  neutral: {
    backgroundColor: {
      default: 'var(--color-neutral-500)',
      ':is(.dark *)': 'var(--color-neutral-500)',
    },
  },
  'neutral-dark': {
    backgroundColor: {
      default: 'var(--color-neutral-600)',
      ':is(.dark *)': 'var(--color-neutral-400)',
    },
  },
  red: {
    backgroundColor: {
      default: 'var(--color-red-700)',
      ':is(.dark *)': 'var(--color-red-400)',
    },
  },
  amber: {
    backgroundColor: {
      default: 'var(--color-amber-700)',
      ':is(.dark *)': 'var(--color-amber-400)',
    },
  },
  yellow: {
    backgroundColor: {
      default: 'var(--color-yellow-700)',
      ':is(.dark *)': 'var(--color-yellow-400)',
    },
  },
  lime: {
    backgroundColor: {
      default: 'var(--color-lime-700)',
      ':is(.dark *)': 'var(--color-lime-400)',
    },
  },
  green: {
    backgroundColor: {
      default: 'var(--color-green-700)',
      ':is(.dark *)': 'var(--color-green-400)',
    },
  },
  emerald: {
    backgroundColor: {
      default: 'var(--color-emerald-700)',
      ':is(.dark *)': 'var(--color-emerald-400)',
    },
  },
  teal: {
    backgroundColor: {
      default: 'var(--color-teal-700)',
      ':is(.dark *)': 'var(--color-teal-400)',
    },
  },
  cyan: {
    backgroundColor: {
      default: 'var(--color-cyan-700)',
      ':is(.dark *)': 'var(--color-cyan-400)',
    },
  },
  sky: {
    backgroundColor: {
      default: 'var(--color-sky-700)',
      ':is(.dark *)': 'var(--color-sky-400)',
    },
  },
  blue: {
    backgroundColor: {
      default: 'var(--color-blue-700)',
      ':is(.dark *)': 'var(--color-blue-400)',
    },
  },
  indigo: {
    backgroundColor: {
      default: 'var(--color-indigo-700)',
      ':is(.dark *)': 'var(--color-indigo-400)',
    },
  },
  violet: {
    backgroundColor: {
      default: 'var(--color-violet-700)',
      ':is(.dark *)': 'var(--color-violet-400)',
    },
  },
  fuchsia: {
    backgroundColor: {
      default: 'var(--color-fuchsia-700)',
      ':is(.dark *)': 'var(--color-fuchsia-400)',
    },
  },
  pink: {
    backgroundColor: {
      default: 'var(--color-pink-700)',
      ':is(.dark *)': 'var(--color-pink-400)',
    },
  },
})

/** Swatch backgrounds for the highlight palette, one per supported color. */
const highlightSwatchStyles = stylex.create({
  'neutral-light': {
    backgroundColor: {
      default: 'var(--color-neutral-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-neutral-900) 40%, transparent)',
    },
  },
  neutral: {
    backgroundColor: {
      default: 'var(--color-neutral-200)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-neutral-800) 40%, transparent)',
    },
  },
  'neutral-dark': {
    backgroundColor: {
      default: 'var(--color-neutral-300)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-neutral-700) 40%, transparent)',
    },
  },
  red: {
    backgroundColor: {
      default: 'var(--color-red-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-red-900) 40%, transparent)',
    },
  },
  amber: {
    backgroundColor: {
      default: 'var(--color-amber-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-amber-900) 40%, transparent)',
    },
  },
  yellow: {
    backgroundColor: {
      default: 'var(--color-yellow-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-yellow-900) 40%, transparent)',
    },
  },
  lime: {
    backgroundColor: {
      default: 'var(--color-lime-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-lime-900) 40%, transparent)',
    },
  },
  green: {
    backgroundColor: {
      default: 'var(--color-green-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-green-900) 40%, transparent)',
    },
  },
  emerald: {
    backgroundColor: {
      default: 'var(--color-emerald-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-emerald-900) 40%, transparent)',
    },
  },
  teal: {
    backgroundColor: {
      default: 'var(--color-teal-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-teal-900) 40%, transparent)',
    },
  },
  cyan: {
    backgroundColor: {
      default: 'var(--color-cyan-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-cyan-900) 40%, transparent)',
    },
  },
  sky: {
    backgroundColor: {
      default: 'var(--color-sky-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-sky-900) 40%, transparent)',
    },
  },
  blue: {
    backgroundColor: {
      default: 'var(--color-blue-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-blue-900) 40%, transparent)',
    },
  },
  indigo: {
    backgroundColor: {
      default: 'var(--color-indigo-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-indigo-900) 40%, transparent)',
    },
  },
  violet: {
    backgroundColor: {
      default: 'var(--color-violet-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-violet-900) 40%, transparent)',
    },
  },
  fuchsia: {
    backgroundColor: {
      default: 'var(--color-fuchsia-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-fuchsia-900) 40%, transparent)',
    },
  },
  pink: {
    backgroundColor: {
      default: 'var(--color-pink-100)',
      ':is(.dark *)': 'color-mix(in oklab, var(--color-pink-900) 40%, transparent)',
    },
  },
})

/** Returns the swatch class for a text color. */
export function textSwatchClassName(name: Exclude<ToolbarColorName, 'default'>) {
  return stylex.props(textSwatchStyles[name]).className || ''
}

/** Returns the swatch class for a highlight color. */
function highlightSwatchClassName(name: Exclude<ToolbarColorName, 'default'>) {
  return stylex.props(highlightSwatchStyles[name]).className || ''
}

function applyColorStyle<BSchema extends BlockSchema>(
  editor: BlockNoteEditor<BSchema>,
  style: 'textColor' | 'backgroundColor',
  color: ToolbarColorName,
) {
  if (color === 'default') {
    editor.removeStyles({
      [style]: true,
    } as any)
  } else {
    editor.addStyles({
      [style]: color,
    } as any)
  }
}
function colorLabel(name: ToolbarColorName): string {
  if (name === 'default') return 'Default'
  return name.charAt(0).toUpperCase() + name.slice(1)
}
export function TextColorPalette<BSchema extends BlockSchema>({
  editor,
  current,
  onSelect,
}: {
  editor: BlockNoteEditor<BSchema>
  current: ToolbarColorName
  onSelect?: () => void
}) {
  return (
    <div
      className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s5d936fb).className || ''}
      data-testid="text-color-palette"
    >
      <div
        className={
          stylex.props(styles.sf2718385, styles.sab7cc79b, styles.s129e46b3, styles.sd52b2d2, styles.s64e14c29)
            .className || ''
        }
      >
        Text color
      </div>
      <div className={stylex.props(styles.s308b46, styles.s10768842, styles.s5d936fb).className || ''}>
        {TOOLBAR_COLOR_NAMES.map((name) => {
          const isDefault = name === 'default'
          return (
            <Tooltip
              key={name}
              content={colorLabel(name)}
              contentClassName={stylex.props(styles_3.sf6144b3).className || ''}
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                data-testid={`text-color-${name}`}
                className={cn(
                  stylex.props(
                    styles.s18c12,
                    styles.s1c461,
                    styles.s775755af,
                    styles.sad8c742c,
                    styles.se45bb2b0,
                    styles.s1aa13,
                    styles.s4d2890f8,
                  ).className || '',
                  stylex.props(styles_2.s68989642).className || '',
                  isDefault ? stylex.props(styles.s91ddbcb).className || '' : textSwatchClassName(name),
                  current === name ? stylex.props(styles.sc883a3d5).className || '' : '',
                )}
                onClick={() => {
                  // Clicking the currently selected color clears it.
                  applyColorStyle(editor, 'textColor', current === name ? 'default' : name)
                  onSelect?.()
                }}
              >
                {current === name ? (
                  <Check
                    className={cn(
                      stylex.props(styles.s3269316e).className || '',
                      isDefault
                        ? stylex.props(styles.sfaa26dce).className || ''
                        : stylex.props(styles.s2daecf89, styles.sbcda378a).className || '',
                    )}
                  />
                ) : (
                  <span className={stylex.props(styles.s88a3565a).className || ''}>{name}</span>
                )}
              </Button>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
export function HighlightPalette<BSchema extends BlockSchema>({
  editor,
  current,
  onSelect,
}: {
  editor: BlockNoteEditor<BSchema>
  current: ToolbarColorName
  onSelect?: () => void
}) {
  return (
    <div
      className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s5d936fa).className || ''}
      data-testid="highlight-palette"
    >
      <div
        className={
          stylex.props(styles.sf2718385, styles.sab7cc79b, styles.s129e46b3, styles.sd52b2d2, styles.s64e14c29)
            .className || ''
        }
      >
        Highlight
      </div>
      <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s5d936fa).className || ''}>
        {TOOLBAR_COLOR_NAMES.map((name) => {
          const isDefault = name === 'default'
          return (
            <Tooltip
              key={name}
              content={colorLabel(name)}
              contentClassName={stylex.props(styles_3.sf6144b3).className || ''}
              asChild
            >
              <button
                type="button"
                data-testid={`highlight-${name}`}
                className={cn(
                  stylex.props(
                    styles.s9f8165e,
                    styles.s2ffff9,
                    styles.sc6ed1702,
                    styles.s5d936fb,
                    styles.sf79988b7,
                    styles.sad8c742c,
                    styles.se45bb2b0,
                    styles.s34b1ae,
                    styles.sc5dd13f4,
                    styles.sbf63b0a7,
                    styles.sab7cc6fa,
                    styles.sf7fb00e8,
                    styles.sbecb6545,
                    styles.s4a7318b7,
                  ).className || '',
                  stylex.props(styles_2.s68989642).className || '',
                  isDefault
                    ? stylex.props(styles.s436dc7b6, styles.sc05281e3).className || ''
                    : highlightSwatchClassName(name),
                  !isDefault ? stylex.props(styles.s61da2a92).className || '' : '',
                  current === name ? stylex.props(styles.sc883a3d5).className || '' : '',
                )}
                onClick={() => {
                  // Clicking the currently selected highlight clears it.
                  applyColorStyle(editor, 'backgroundColor', current === name ? 'default' : name)
                  onSelect?.()
                }}
              >
                <span className={stylex.props(styles.sa173a9a1, styles.sab7cc79b, styles.sc2c9c6cc).className || ''}>
                  A
                </span>
                {isDefault && <span className={stylex.props(styles.sab7cc79b).className || ''}>No highlight</span>}
              </button>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
