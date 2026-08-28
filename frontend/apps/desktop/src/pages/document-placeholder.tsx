import * as stylex from '@stylexjs/stylex'
import {Placeholder} from '@/components/placeholder-box'
const styles = stylex.create({
  sf599e7a4: {
    marginInline: 'auto',
    marginTop: 'calc(var(--spacing) * 7)',
    display: 'flex',
    width: '100%',
    maxWidth: '600px',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 6)',
  },
  s2be3f340: {
    display: 'flex',
    width: '100%',
    maxWidth: '600px',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
  },
})
export function DocumentPlaceholder() {
  return (
    <div className={stylex.props(styles.sf599e7a4).className || ''}>
      <BlockPlaceholder />
      <BlockPlaceholder />
      <BlockPlaceholder />
      <BlockPlaceholder />
      <BlockPlaceholder />
    </div>
  )
}
function BlockPlaceholder() {
  return (
    <div className={stylex.props(styles.s2be3f340).className || ''}>
      <Placeholder width="100%" />
      <Placeholder width="92%" />
      <Placeholder width="84%" />
      <Placeholder width="90%" />
    </div>
  )
}
