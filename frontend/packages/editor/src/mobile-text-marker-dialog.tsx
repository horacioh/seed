import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@shm/ui/components/dialog'
import {Check, OrderedList, Quote, UnorderedList, X} from '@shm/ui/icons'
import {SizableText} from '@shm/ui/text'
import {cn} from '@shm/ui/utils'
const styles = stylex.create({
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  sb42244d4: {
    height: '100%',
  },
  se35af15d: {
    maxHeight: '100%',
  },
  scdbaf625: {
    width: '100%',
  },
  sfcf3a2ae: {
    maxWidth: '100%',
  },
  s775ae258: {
    borderRadius: '0',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  sca3de96c: {
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  sb41ffff4: {
    height: 'auto',
  },
  s626516e5: {
    justifyContent: 'flex-start',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b570: {
    paddingBlock: 'calc(0.25rem * 4)',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s7d7f436b: {
    width: 'calc(0.25rem * 10)',
    height: 'calc(0.25rem * 10)',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
})
interface MobileTextMarkerDialogProps {
  isOpen: boolean
  onClose: () => void
  currentValue: string
  onChange: (value: string) => void
}
const textMarkerOptions = [
  {
    label: 'No Marker',
    value: 'Group',
    icon: <X className={stylex.props(styles.sca3de969).className || ''} />,
  },
  {
    label: 'Bullets',
    value: 'Unordered',
    icon: <UnorderedList className={stylex.props(styles.sca3de969).className || ''} />,
  },
  {
    label: 'Numbers',
    value: 'Ordered',
    icon: <OrderedList className={stylex.props(styles.sca3de969).className || ''} />,
  },
  {
    label: 'Block Quote',
    value: 'Blockquote',
    icon: <Quote className={stylex.props(styles.sca3de969).className || ''} />,
  },
]
export function MobileTextMarkerDialog({isOpen, onClose, currentValue, onChange}: MobileTextMarkerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className={
          stylex.props(
            styles.sb42244d4,
            styles.se35af15d,
            styles.scdbaf625,
            styles.sfcf3a2ae,
            styles.s775ae258,
            styles.s1aa13,
          ).className || ''
        }
        showCloseButton={false}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          onClose()
        }}
        onInteractOutside={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <div className={stylex.props(styles.s2ffff9, styles.sb42244d4, styles.s67e351ac).className || ''}>
          <DialogHeader className={stylex.props(styles.s7c401f01, styles.s1aa17).className || ''}>
            <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sc1a629cb).className || ''}>
              <DialogTitle>Text Marker</DialogTitle>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className={stylex.props(styles.sca3de96c).className || ''}
              >
                <X className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
            </div>
          </DialogHeader>

          <div className={stylex.props(styles.sb42feb5d, styles.sac38f2ae).className || ''}>
            <div data-slot="dialog-list">
              {textMarkerOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className={cn(
                    stylex.props(styles.sb41ffff4, styles.scdbaf625, styles.s626516e5, styles.s34b1af, styles.s34b570)
                      .className || '',
                    currentValue === option.value ? stylex.props(styles.s5fd609e3).className || '' : '',
                  )}
                  onClick={() => onChange(option.value)}
                >
                  <div
                    className={
                      stylex.props(styles.s2ffff9, styles.scdbaf625, styles.sc6ed1702, styles.sc1a629cb).className || ''
                    }
                  >
                    <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fc).className || ''}>
                      <div
                        className={
                          stylex.props(
                            styles.s5fd609e3,
                            styles.s2ffff9,
                            styles.s7d7f436b,
                            styles.sc6ed1702,
                            styles.sce22ca32,
                            styles.sf79988b7,
                          ).className || ''
                        }
                      >
                        {option.icon}
                      </div>
                      <SizableText weight="medium">{option.label}</SizableText>
                    </div>
                    {currentValue === option.value && <Check size={20} color="currentColor" />}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
