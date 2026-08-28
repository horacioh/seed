import * as stylex from '@stylexjs/stylex'
import {FolderTree} from 'lucide-react'
import {ReactNode, useEffect} from 'react'
import {Button} from './button'
import {Breadcrumbs, type BreadcrumbEntry} from './document-header'
import {useSiteFileBrowserControls} from './site-file-browser-layout'
import {Tooltip} from './tooltip'
import {cn} from './utils'

/**
 * Persistent bar above the document content: where you are on the left, what you
 * can do on the right, both at the edges of the pane. It is a sibling of the
 * scroll container on desktop, and sticks to the top of the viewport on mobile
 * once the site header scrolls away.
 */
const styles_4 = stylex.create({
  s608c79d2: {
    borderColor: 'var(--border)',
    display: 'flex',
    height: 'calc(var(--spacing) * 12)',
    width: '100%',
    flexShrink: '0',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    backgroundColor: 'var(--surface)',
    paddingInline: 'calc(var(--spacing) * 4)',
  },
})
const styles_3 = stylex.create({
  sa44f2c8f: {
    position: 'sticky',
    top: 'calc(0.25rem * 0)',
    zIndex: '30',
  },
})
const styles_2 = stylex.create({
  sdf91ad18: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
})
const styles = stylex.create({
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s7778dfe9: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
})
export function DocumentTopBar({
  breadcrumbs,
  status,
  actions,
  isMobile,
}: {
  breadcrumbs?: BreadcrumbEntry[]
  status?: ReactNode
  actions?: ReactNode
  isMobile?: boolean
}) {
  const fileBrowser = useSiteFileBrowserControls()
  const canRevealFileBrowser = !!fileBrowser?.collapsed
  useEffect(() => {
    if (!canRevealFileBrowser || !fileBrowser) return
    return fileBrowser.claimRevealButton()
  }, [canRevealFileBrowser, fileBrowser])
  return (
    <div
      data-document-top-bar=""
      className={cn(
        stylex.props(styles_4.s608c79d2).className || '',
        // The border is the only separator; nothing is elevated over the content.
        stylex.props(styles.s7c401f01).className || '',
        stylex.props(isMobile && styles_3.sa44f2c8f).className || '',
      )}
    >
      <div className={stylex.props(styles_2.sdf91ad18).className || ''}>
        {canRevealFileBrowser ? (
          <Tooltip content="Show file explorer">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open file browser"
              className={stylex.props(styles.sf032ed6c).className || ''}
              onClick={() => fileBrowser?.setCollapsed(false)}
            >
              <FolderTree className={stylex.props(styles.sca3de968).className || ''} />
            </Button>
          </Tooltip>
        ) : null}
        {breadcrumbs?.length ? <Breadcrumbs breadcrumbs={breadcrumbs} /> : null}
        {status ? (
          <div data-document-status="" className={stylex.props(styles.s7778dfe9).className || ''}>
            {status}
          </div>
        ) : null}
      </div>
      {actions ? <div className={stylex.props(styles.s7778dfe9).className || ''}>{actions}</div> : null}
    </div>
  )
}
