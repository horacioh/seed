import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@shm/ui/components/dialog'
import {X} from '@shm/ui/icons'
import {SizableText} from '@shm/ui/text'
import {BlockNoteEditor} from './blocknote/core'
import {HMBlockSchema} from './schema'
import {getSlashMenuItems} from './slash-menu-items'
const styles = stylex.create({
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
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  sb41ffff4: {
    height: 'auto',
  },
  s626516e5: {
    justifyContent: 'flex-start',
  },
  s34b570: {
    paddingBlock: 'calc(0.25rem * 4)',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
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
  s93b5f015: {
    alignItems: 'flex-start',
  },
})
interface MobileSlashDialogProps {
  isOpen: boolean
  onClose: () => void
  editor: BlockNoteEditor<HMBlockSchema>
}
export function MobileSlashDialog({isOpen, onClose, editor}: MobileSlashDialogProps) {
  const slashMenuItems = getSlashMenuItems()
  const handleSelectBlockType = (item: any) => {
    item.execute(editor)
    onClose()
    setTimeout(() => {
      editor._tiptapEditor.commands.focus()
    }, 100)
  }
  const groupedItems = slashMenuItems.reduce(
    (acc, item) => {
      const group = item.group || 'Other'
      if (!acc[group]) acc[group] = []
      acc[group].push(item)
      return acc
    },
    {} as Record<string, typeof slashMenuItems>,
  )
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
      >
        <div className={stylex.props(styles.s2ffff9, styles.sb42244d4, styles.s67e351ac).className || ''}>
          <DialogHeader className={stylex.props(styles.s7c401f01, styles.s1aa17).className || ''}>
            <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sc1a629cb).className || ''}>
              <DialogTitle>Insert Block</DialogTitle>
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

          {/* Block Types List */}
          <div className={stylex.props(styles.sb42feb5d, styles.sac38f2ae).className || ''}>
            {Object.entries(groupedItems).map(([groupName, items]) => (
              <div key={groupName} className={stylex.props(styles.s34b56e).className || ''}>
                {groupName && (
                  <SizableText
                    size="xs"
                    weight="medium"
                    className={stylex.props(styles.sf2718385, styles.s34b1af, styles.s34b56e).className || ''}
                  >
                    {groupName}
                  </SizableText>
                )}
                <div data-slot="dialog-list">
                  {items.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={
                        stylex.props(
                          styles.sb41ffff4,
                          styles.scdbaf625,
                          styles.s626516e5,
                          styles.s34b1af,
                          styles.s34b570,
                        ).className || ''
                      }
                      onClick={() => handleSelectBlockType(item)}
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
                          {item.icon}
                        </div>
                        <div
                          className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s93b5f015).className || ''}
                        >
                          <SizableText weight="medium">{item.name}</SizableText>
                          {item.hint && (
                            <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
                              {item.hint}
                            </SizableText>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
