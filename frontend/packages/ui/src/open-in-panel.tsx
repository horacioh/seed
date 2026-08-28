import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {DocumentPanelRoute} from '@shm/shared'
import {useNavigate} from '@shm/shared/utils/navigation'
import {SquareChevronRight} from 'lucide-react'
import {Button} from './button'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles_2 = stylex.create({
  sea927280: {
    display: 'none',
    '@media ((min-width: 768px))': {
      display: 'inline-flex',
    },
  },
  s947842f9: {
    height: 'calc(var(--spacing) * 9)',
    borderTopLeftRadius: '0',
    borderBottomLeftRadius: '0',
    borderTopRightRadius: 'calc(infinity * 1px)',
    borderBottomRightRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 3)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--overlay-5-10)',
      },
    },
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
})
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function OpenInPanelButton({
  id,
  panelRoute,
  nested = false,
  accent = false,
}: {
  id: UnpackedHypermediaId
  panelRoute: DocumentPanelRoute
  /** When true, button is rendered inside an active tab pill — drop own bg, inherit text color, square the left edge. */
  nested?: boolean
  /** When true (and not nested), render as a full accent pill so the standalone button reads as the active tab. */
  accent?: boolean
}) {
  const replace = useNavigate('replace')
  return (
    <Tooltip content="Open in right panel">
      <Button
        variant={nested ? 'ghost' : accent ? 'accent' : 'ghost'}
        className={cn(
          stylex.props(styles_2.sea927280).className || '',
          stylex.props(nested ? styles_2.s947842f9 : styles_2.s775755af).className || '',
        )}
        onClick={() => {
          replace({
            key: 'document',
            id,
            panel: panelRoute,
          })
        }}
      >
        <SquareChevronRight className={stylex.props(styles.sca3de968).className || ''} />
      </Button>
    </Tooltip>
  )
}
