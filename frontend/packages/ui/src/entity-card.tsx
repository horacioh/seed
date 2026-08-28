import * as stylex from '@stylexjs/stylex'
import 'katex/dist/katex.min.css'
import {Button} from './button'
import {Spinner} from './spinner'
import {SizableText} from './text'
import {cn} from './utils'
const styles_3 = stylex.create({
  s948be48c: {
    flex: 'none',
  },
  s880858c0: {
    flexShrink: '0',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
})
const styles_2 = stylex.create({
  sf5f40c83: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 20%, transparent)',
    height: '180px',
    width: '100%',
  },
  sbe301420: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 20%, transparent)',
  },
})
const styles = stylex.create({
  s5cf3d507: {
    marginInline: 'calc(0.25rem * -2)',
    display: 'flex',
    width: '100%',
    flexWrap: 'wrap',
  },
  s9ecf71fb: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s556cad3e: {
    backgroundColor: 'var(--muted)',
    borderColor: 'var(--border)',
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s486e68e8: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
  },
  s21835087: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    padding: 'calc(0.25rem * 4)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s9f4cda1a: {
    overflow: 'hidden',
    borderRadius: 'calc(infinity * 1px)',
  },
  s2ff5a9: {
    height: 'calc(0.25rem * 15)',
  },
  s731a65c3: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sd06f99bc: {
    display: 'flex',
    width: '100%',
    gap: 'calc(0.25rem * 2)',
    overflow: 'hidden',
  },
  s2ffff9: {
    display: 'flex',
  },
  s535dddab: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 4)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s79cac5df: {
    fontFamily: 'var(--font-sans)',
    fontStyle: 'italic',
  },
})
export function QueryBlockPlaceholder({styleType}: {styleType: 'Card' | 'List'}) {
  if (styleType === 'Card') {
    return <QueryBlockCardPlaceholder />
  }
  return <QueryBlockListPlaceholder />
}
export function QueryBlockCardPlaceholder() {
  return (
    <div className={stylex.props(styles.s5cf3d507).className || ''}>
      <EntityCardPlaceholder />
      <EntityCardPlaceholder />
      <EntityCardPlaceholder />
    </div>
  )
}
export function QueryBlockListPlaceholder() {
  return (
    <div className={stylex.props(styles.s9ecf71fb).className || ''}>
      <ListItemSkeleton />
      <ListItemSkeleton />
      <ListItemSkeleton />
    </div>
  )
}
export function EntityCardPlaceholder() {
  return (
    <div className={stylex.props(styles_3.s948be48c, styles_3.s880858c0, styles_3.s1aa15).className || ''}>
      <div className={stylex.props(styles.s556cad3e).className || ''}>
        <CoverPlaceholder />
        <div className={stylex.props(styles.s486e68e8).className || ''}>
          <div className={stylex.props(styles.s21835087).className || ''}>
            {/* document name */}
            <div className={stylex.props(styles.sfbc6e28e).className || ''}>
              <TextPlaceholder height={24} />
              <TextPlaceholder height={24} width="70%" />
            </div>

            {/* location and author */}
            <TextPlaceholder height={14} width="35%" />

            <div className={stylex.props(styles.sfbc6e28e).className || ''}>
              <TextPlaceholder height={12} />
              <TextPlaceholder height={12} width="75%" />
              <TextPlaceholder height={12} width="80%" />
              <TextPlaceholder height={12} width="60%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
function CoverPlaceholder() {
  return <div className={stylex.props(styles_2.sf5f40c83).className || ''} />
}
function TextPlaceholder({
  height = 16,
  width = '100%',
  color = 'bg-muted-foreground/20',
}: {
  height?: number | string
  width?: number | string
  color?: string
}) {
  return (
    <div
      className={cn(stylex.props(styles.s9f4cda1a).className || '', color)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    />
  )
}
export function ListItemSkeleton() {
  return (
    <Button variant="ghost" disabled className={stylex.props(styles.s2ff5a9).className || ''}>
      <Skeleton width={28} height={28} borderRadius={28} />

      <div className={stylex.props(styles.s731a65c3).className || ''}>
        <div className={stylex.props(styles.s86ff3e4).className || ''}>
          <Skeleton w="100%" maxWidth={300} height={20} borderRadius="$1" />
        </div>
        <div className={stylex.props(styles.sd06f99bc).className || ''}>
          <Skeleton w="100%" maxWidth={200} height={14} borderRadius="$1" />
        </div>
      </div>
      <Skeleton w="100%" maxWidth={80} height={20} borderRadius="$1" />

      <div className={stylex.props(styles.s2ffff9).className || ''}>
        <Skeleton width={24} height={24} borderRadius={100} />
        <Skeleton width={24} height={24} borderRadius={100} marginLeft={-8} />
      </div>
    </Button>
  )
}
function Skeleton(
  props: React.HTMLAttributes<HTMLDivElement> & {
    w?: string | number
    width?: number
    height?: number
    maxWidth?: number
    borderRadius?: number | string
    marginLeft?: number
  },
) {
  const {w, width, height, maxWidth, borderRadius, marginLeft, className, style, ...rest} = props
  return (
    <div
      className={cn(stylex.props(styles_2.sbe301420).className || '', className)}
      style={{
        width: w || (width ? `${width}px` : undefined),
        height: height ? `${height}px` : undefined,
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        marginLeft: marginLeft ? `${marginLeft}px` : undefined,
        ...style,
      }}
      {...rest}
    />
  )
}
export function BlankQueryBlockMessage({message, loading = false}: {message: string; loading?: boolean}) {
  return (
    <div className={stylex.props(styles.s535dddab).className || ''}>
      {loading ? <Spinner size="small" className={stylex.props(styles.sf2718385).className || ''} /> : null}
      <SizableText size="lg" color="muted" weight="bold" className={stylex.props(styles.s79cac5df).className || ''}>
        {message}
      </SizableText>
    </div>
  )
}
