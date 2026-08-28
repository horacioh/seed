import * as stylex from '@stylexjs/stylex'
import {API_HTTP_URL} from '@shm/shared/constants'
import {ApiInspector} from '@shm/ui/api-inspector'
import {InspectorShell} from '@shm/ui/inspector-shell'

/** Renders the desktop-only API inspector route. */
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
export default function DesktopApiInspectorPage() {
  return (
    <div className={stylex.props(styles.sfa8786d5).className || ''}>
      <InspectorShell title="API Inspector" contentMaxWidth={1360}>
        <ApiInspector apiHost={API_HTTP_URL} />
      </InspectorShell>
    </div>
  )
}
