import * as stylex from '@stylexjs/stylex'
import {cn} from './utils'
const styles_4 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s600a0682: {
    width: '100vw',
  },
  s49d86571: {
    height: '100vh',
  },
  sca05f445: {
    minHeight: '100svh',
  },
  sfe77791f: {
    backgroundColor: 'var(--panel-background)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  scdbaf625: {
    width: '100%',
  },
  sb42244d4: {
    height: '100%',
  },
  s3f582e10: {
    minHeight: '0px',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  s5ff7227c: {
    backgroundColor: 'var(--panel)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
})
const styles_3 = stylex.create({
  s42ee60bb: {
    backgroundColor: 'var(--panel)',
    '@media ((min-width: 640px))': {
      borderColor: 'var(--border)',
      borderRadius: 'calc(var(--radius) - 2px)',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    height: '100%',
    overflow: 'hidden',
  },
  scdeed59b: {
    maxWidth: 'calc(85ch + 1em)',
  },
})
const styles_2 = stylex.create({
  s566ebbaa: {
    pointerEvents: 'none',
    opacity: '0%',
  },
  s34b56c: {
    paddingBlock: 'calc(0.25rem * 0)',
  },
})
const styles = stylex.create({
  s284c2f1: {
    height: '100%',
    width: '100%',
  },
  sede8610d: {
    marginInline: 'auto',
    display: 'flex',
    width: '100%',
    flexShrink: '0',
    flexDirection: 'column',
    paddingInline: 'calc(0.25rem * 4)',
    paddingTop: 'calc(0.25rem * 6)',
  },
})
export function PanelContainer({className, children, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={stylex.props(styles.s284c2f1).className || ''}>
      <div className={cn(stylex.props(styles_3.s42ee60bb).className || '', className)} {...props}>
        {children}
      </div>
    </div>
  )
}
export const Container = ({
  className,
  clearVerticalSpace = false,
  centered = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  hide?: boolean
  clearVerticalSpace?: boolean
  centered?: boolean
}) => {
  return (
    <div
      className={cn(
        stylex.props(styles.sede8610d).className || '',
        stylex.props(props.hide && styles_2.s566ebbaa).className || '',
        stylex.props(clearVerticalSpace && styles_2.s34b56c).className || '',
        stylex.props(centered ? styles_3.scdeed59b : null).className || '',
        className,
      )}
      {...props}
    />
  )
}
export const windowContainerStyles = cn(
  stylex.props(
    styles_4.s2ffff9,
    styles_4.s67e351ac,
    styles_4.s600a0682,
    styles_4.s49d86571,
    styles_4.sca05f445,
    styles_4.sfe77791f,
    styles_4.s1aa15,
  ).className || '',
)
export const panelContainerStyles = cn(
  stylex.props(
    styles_4.s2ffff9,
    styles_4.s67e351ac,
    styles_4.scdbaf625,
    styles_4.sb42244d4,
    styles_4.s3f582e10,
    styles_4.sf79988b7,
    styles_4.s92852dd5,
    styles_4.s5ff7227c,
    styles_4.sad8c742c,
    styles_4.s1a01a0ed,
  ).className || '',
)
