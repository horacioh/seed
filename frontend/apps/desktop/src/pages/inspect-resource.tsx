import * as stylex from '@stylexjs/stylex'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {InspectorPage} from '@shm/ui/inspector-page'

/** Renders the dedicated document inspector in the desktop app. */
const styles = stylex.create({
  sfa8786d5: {
    position: 'relative',
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    backgroundColor: 'oklch(96.7% 0.001 286.375)',
  },
})
export default function DesktopInspectResourcePage() {
  const route = useNavRoute()
  if (route.key !== 'inspect') {
    throw new Error(`DesktopInspectResourcePage: unsupported route ${route.key}`)
  }
  return (
    <div className={stylex.props(styles.sfa8786d5).className || ''}>
      <InspectorPage docId={route.id} />
    </div>
  )
}
