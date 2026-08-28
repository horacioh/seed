import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {HeadingIcon, OrderedList, Quote, Type, UnorderedList} from '@shm/ui/icons'
import {usePopoverState} from '@shm/ui/use-popover-state'
import {cn} from '@shm/ui/utils'
import {Check, Highlighter} from 'lucide-react'
import {ReactNode} from 'react'
import {BlockNoteEditor, BlockSchema} from './blocknote'
import {HighlightPalette, TextColorPalette, textSwatchClassName, ToolbarColorName} from './toolbar-color-palette'
const styles_2 = stylex.create({
  s68989642: {
    ':is(.dark *)': {
      borderColor: 'color-mix(in oklab, #fff 10%, transparent)',
    },
  },
  se117420b: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'color-mix(in oklab, #fff 10%, transparent)',
      },
    },
  },
})
const styles = stylex.create({
  s308b46: {
    display: 'grid',
  },
  s1076883f: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  s5d936fd: {
    gap: 'calc(0.25rem * 4)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s8d519a7f: {
    fontFamily: 'var(--font-serif)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
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
  sf4676641: {
    gap: 'calc(0.25rem * 1.5)',
  },
  s18c14: {
    height: 'calc(0.25rem * 9)',
  },
  scdbaf625: {
    width: '100%',
  },
  s626516e5: {
    justifyContent: 'flex-start',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  se45bb2b0: {
    borderColor: 'color-mix(in oklab, #000 10%, transparent)',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  s14e67425: {
    fontWeight: '400',
  },
  s646c459b: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
      },
    },
  },
  s6c2e6c9d: {
    backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  sf1212e4c: {
    color: 'oklch(62.7% 0.194 149.214)',
  },
  sf614494: {
    zIndex: '10000',
  },
  scdb8b145: {
    width: 'auto',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  s597c48d: {
    display: 'block',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s91ddbcb: {
    backgroundColor: 'var(--foreground)',
  },
  s16888303: {
    borderColor: 'color-mix(in oklab, var(--muted-foreground) 60%, transparent)',
  },
  s18c0f: {
    height: 'calc(0.25rem * 4)',
  },
  s1c45e: {
    width: 'calc(0.25rem * 4)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s7a78fea8: {
    gap: '1px',
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  s769e54c2: {
    padding: '1px',
  },
  sbe30149c: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 60%, transparent)',
  },
  sb42244d4: {
    height: '100%',
  },
  s72d9853f: {
    borderRadius: '1px',
  },
})
export const TEXT_SIZE_OPTIONS = [
  {
    label: 'Small',
    value: 'small',
  },
  {
    label: 'Medium',
    value: 'medium',
  },
  {
    label: 'Big',
    value: 'big',
  },
] as const
export const TEXT_FAMILY_OPTIONS = [
  {
    label: 'Sans serif',
    value: 'sans',
  },
  {
    label: 'Serif',
    value: 'serif',
  },
] as const
export type StyleOptionsPanelProps<BSchema extends BlockSchema> = {
  editor: BlockNoteEditor<BSchema>
  currentBlockType: string
  currentGroupType: string
  currentColumnCount: string
  currentTextColor: ToolbarColorName
  currentBackgroundColor: ToolbarColorName
  currentTextSize: string
  currentTextFamily: string
  onBlockTypeChange: (value: string) => void
  onGroupTypeChange: (value: string) => void
  onColumnCountChange: (value: string) => void
  onTextSizeChange: (value: string) => void
  onTextFamilyChange: (value: string) => void
}
const COLUMN_OPTIONS: {
  label: string
  value: string
}[] = [
  {
    label: '1 column',
    value: '1',
  },
  {
    label: '2 columns',
    value: '2',
  },
  {
    label: '3 columns',
    value: '3',
  },
]
export function StyleOptionsPanel<BSchema extends BlockSchema>(props: StyleOptionsPanelProps<BSchema>) {
  const {
    editor,
    currentBlockType,
    currentGroupType,
    currentColumnCount,
    currentTextColor,
    currentBackgroundColor,
    currentTextSize,
    currentTextFamily,
    onBlockTypeChange,
    onGroupTypeChange,
    onColumnCountChange,
    onTextSizeChange,
    onTextFamilyChange,
  } = props
  return (
    <div
      className={stylex.props(styles.s308b46, styles.s1076883f, styles.s5d936fd).className || ''}
      data-testid="style-options-panel"
    >
      <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s5d936fc).className || ''}>
        <Section title="Text">
          <PanelItem
            testId="block-type-heading"
            icon={<HeadingIcon className={stylex.props(styles.sca3de968).className || ''} />}
            label="Heading"
            active={currentBlockType === 'heading'}
            onClick={() => onBlockTypeChange(currentBlockType === 'heading' ? 'paragraph' : 'heading')}
          />
          <PanelItem
            testId="block-type-paragraph"
            icon={<Type className={stylex.props(styles.sca3de968).className || ''} />}
            label="Paragraph"
            active={currentBlockType === 'paragraph' && currentGroupType !== 'Blockquote'}
            onClick={() => onBlockTypeChange('paragraph')}
          />
          <PanelItem
            testId="group-type-blockquote"
            icon={<Quote className={stylex.props(styles.sca3de968).className || ''} />}
            label="Quote"
            active={currentGroupType === 'Blockquote'}
            onClick={() => onGroupTypeChange(currentGroupType === 'Blockquote' ? 'Group' : 'Blockquote')}
          />
          <ColorPaletteItem
            testId="text-color-trigger"
            icon={<TextColorSwatch color={currentTextColor} />}
            label="Color"
            active={currentTextColor !== 'default'}
          >
            {({close}) => <TextColorPalette editor={editor} current={currentTextColor} onSelect={close} />}
          </ColorPaletteItem>
          <ColorPaletteItem
            testId="highlight-trigger"
            icon={<Highlighter className={stylex.props(styles.sca3de968).className || ''} />}
            label="Highlight"
            active={currentBackgroundColor !== 'default'}
          >
            {({close}) => <HighlightPalette editor={editor} current={currentBackgroundColor} onSelect={close} />}
          </ColorPaletteItem>
        </Section>

        <Section title="List">
          <PanelItem
            testId="group-type-unordered"
            icon={<UnorderedList className={stylex.props(styles.sca3de968).className || ''} />}
            label="Bullet points"
            active={currentGroupType === 'Unordered'}
            onClick={() => onGroupTypeChange(currentGroupType === 'Unordered' ? 'Group' : 'Unordered')}
          />
          <PanelItem
            testId="group-type-ordered"
            icon={<OrderedList className={stylex.props(styles.sca3de968).className || ''} />}
            label="Numbered list"
            active={currentGroupType === 'Ordered'}
            onClick={() => onGroupTypeChange(currentGroupType === 'Ordered' ? 'Group' : 'Ordered')}
          />
        </Section>
      </div>

      <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s5d936fc).className || ''}>
        <Section title="Size">
          {TEXT_SIZE_OPTIONS.map((opt) => {
            // Default value is medium for text size
            const activeSize = currentTextSize || 'medium'
            return (
              <PanelItem
                key={opt.value}
                testId={`text-size-${opt.value}`}
                label={opt.label}
                active={activeSize === opt.value}
                onClick={() => onTextSizeChange(opt.value === 'medium' ? '' : opt.value)}
              />
            )
          })}
        </Section>

        <Section title="Font">
          {TEXT_FAMILY_OPTIONS.map((opt) => (
            <PanelItem
              key={opt.value}
              testId={`text-family-${opt.value}`}
              icon={<span className={stylex.props(styles.s8d519a7f, styles.sab7cc6fa).className || ''}>Aa</span>}
              label={opt.label}
              active={currentTextFamily === opt.value}
              onClick={() => onTextFamilyChange(currentTextFamily === opt.value ? '' : opt.value)}
            />
          ))}
        </Section>

        <Section title="Grid">
          {COLUMN_OPTIONS.map((opt) => {
            const isGrid = currentGroupType === 'Grid'
            const active = isGrid && currentColumnCount === opt.value
            return (
              <PanelItem
                key={opt.value}
                testId={`grid-cols-${opt.value}`}
                icon={<GridIcon count={Number(opt.value)} />}
                label={opt.label}
                active={active}
                onClick={() => {
                  if (!isGrid) onGroupTypeChange('Grid')
                  onColumnCountChange(opt.value)
                }}
              />
            )
          })}
        </Section>
      </div>
    </div>
  )
}
function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s5d936fb).className || ''}>
      <div
        className={
          stylex.props(styles.sf2718385, styles.sab7cc79b, styles.s129e46b3, styles.sd52b2d2, styles.s64e14c29)
            .className || ''
        }
      >
        {title}
      </div>
      <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.sf4676641).className || ''}>{children}</div>
    </div>
  )
}
function PanelItem({
  icon,
  label,
  active,
  onClick,
  testId,
}: {
  icon?: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  testId?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      data-testid={testId}
      className={cn(
        stylex.props(
          styles.s18c14,
          styles.scdbaf625,
          styles.s626516e5,
          styles.s5d936fb,
          styles.sf79988b7,
          styles.sad8c742c,
          styles.se45bb2b0,
          styles.s60f53bca,
          styles.s34b1ae,
          styles.sab7cc6fa,
          styles.s14e67425,
        ).className || '',
        stylex.props(styles_2.s68989642).className || '',
        stylex.props(styles.s646c459b).className || '',
        stylex.props(styles_2.se117420b).className || '',
        active ? stylex.props(styles.s6c2e6c9d).className || '' : '',
      )}
      onClick={onClick}
    >
      {icon && <span className={stylex.props(styles.sf2718385).className || ''}>{icon}</span>}
      <span className={stylex.props(styles.sb42feb5d, styles.s6e724d66, styles.sbf63b0a7).className || ''}>
        {label}
      </span>
      {active && <Check className={stylex.props(styles.sca3de968, styles.sf1212e4c).className || ''} />}
    </Button>
  )
}
function ColorPaletteItem({
  icon,
  label,
  active,
  testId,
  children,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  testId?: string
  children: (api: {close: () => void}) => ReactNode
}) {
  const popover = usePopoverState()
  return (
    <Popover {...popover}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-testid={testId}
          className={cn(
            stylex.props(
              styles.s18c14,
              styles.scdbaf625,
              styles.s626516e5,
              styles.s5d936fb,
              styles.sf79988b7,
              styles.sad8c742c,
              styles.se45bb2b0,
              styles.s60f53bca,
              styles.s34b1ae,
              styles.sab7cc6fa,
              styles.s14e67425,
            ).className || '',
            stylex.props(styles_2.s68989642).className || '',
            stylex.props(styles.s646c459b).className || '',
            stylex.props(styles_2.se117420b).className || '',
            active ? stylex.props(styles.s6c2e6c9d).className || '' : '',
          )}
        >
          <span className={stylex.props(styles.sf2718385).className || ''}>{icon}</span>
          <span className={stylex.props(styles.sb42feb5d, styles.s6e724d66, styles.sbf63b0a7).className || ''}>
            {label}
          </span>
          {active && <Check className={stylex.props(styles.sca3de968, styles.sf1212e4c).className || ''} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        collisionPadding={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDown={(e) => e.preventDefault()}
        className={stylex.props(styles.sf614494, styles.scdb8b145, styles.s1aa16).className || ''}
      >
        {children({
          close: () => popover.onOpenChange(false),
        })}
      </PopoverContent>
    </Popover>
  )
}

/** Small circle reflecting the currently applied text color. */
function TextColorSwatch({color}: {color: ToolbarColorName}) {
  return (
    <span
      className={cn(
        stylex.props(styles.s597c48d, styles.sca3de968, styles.s775755af, styles.sad8c742c, styles.se45bb2b0)
          .className || '',
        stylex.props(styles_2.s68989642).className || '',
        color === 'default' ? stylex.props(styles.s91ddbcb).className || '' : textSwatchClassName(color),
      )}
    />
  )
}
function GridIcon({count}: {count: number}) {
  return (
    <span
      className={
        stylex.props(
          styles.s16888303,
          styles.s2ffff9,
          styles.s18c0f,
          styles.s1c45e,
          styles.sc6ed1702,
          styles.s7a78fea8,
          styles.sf799897a,
          styles.sad8c742c,
          styles.s769e54c2,
        ).className || ''
      }
    >
      {Array.from(
        {
          length: count,
        },
        (_, i) => (
          <span
            key={i}
            className={
              stylex.props(styles.sbe30149c, styles.sb42244d4, styles.sb42feb5d, styles.s72d9853f).className || ''
            }
          />
        ),
      )}
    </span>
  )
}
