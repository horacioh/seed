import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {InlineMentionsResult, useInlineMentions} from '@shm/shared/models/inline-mentions'
import {Button} from '@shm/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@shm/ui/components/dialog'
import {Input} from '@shm/ui/components/input'
import {LoadedHMIcon} from '@shm/ui/hm-icon'
import {Search, X} from '@shm/ui/icons'
import {SizableText} from '@shm/ui/text'
import {useEffect, useState} from 'react'
const styles = stylex.create({
  safb60582: {
    height: '100dvh',
  },
  s243458b: {
    maxHeight: '100dvh',
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
  sb42244d4: {
    height: '100%',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s92852dd5: {
    overflow: 'hidden',
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
  sdef3facc: {
    position: 'relative',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s67010d77: {
    position: 'absolute',
  },
  sbe0abfed: {
    left: 'calc(0.25rem * 3)',
  },
  sbbfc415c: {
    top: '50%',
  },
  s65c0f90: {
    paddingLeft: 'calc(0.25rem * 10)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s34b574: {
    paddingBlock: 'calc(0.25rem * 8)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
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
  s34b56f: {
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s93b5f015: {
    alignItems: 'flex-start',
  },
})
interface MobileMentionsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mention: {id: UnpackedHypermediaId; label: string; type: string}) => void
  perspectiveAccountUid?: string | null | undefined
}
export function MobileMentionsDialog({isOpen, onClose, onSelect, perspectiveAccountUid}: MobileMentionsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<InlineMentionsResult>({
    Profiles: [],
    Documents: [],
    Recents: [],
    Contacts: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const {onMentionsQuery} = useInlineMentions(perspectiveAccountUid)
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setResults({
        Profiles: [],
        Documents: [],
        Recents: [],
        Contacts: [],
      })
      return
    }
    const search = async () => {
      setIsLoading(true)
      try {
        const mentionResults = await onMentionsQuery(searchQuery)
        setResults(mentionResults)
      } catch (error) {
        console.error('Failed to search mentions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, isOpen])
  const handleSelectMention = (item: any) => {
    onSelect({
      id: item.id,
      label: item.title || item.label || 'Unknown',
      type: item.type,
    })
    onClose()
  }
  const allResults = [...results.Contacts, ...results.Profiles, ...results.Documents, ...results.Recents]
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={
          stylex.props(
            styles.safb60582,
            styles.s243458b,
            styles.scdbaf625,
            styles.sfcf3a2ae,
            styles.s775ae258,
            styles.s1aa13,
          ).className || ''
        }
        showCloseButton={false}
      >
        <div
          className={stylex.props(styles.s2ffff9, styles.sb42244d4, styles.s67e351ac, styles.s92852dd5).className || ''}
        >
          <DialogHeader className={stylex.props(styles.s7c401f01, styles.s1aa17).className || ''}>
            <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sc1a629cb).className || ''}>
              <DialogTitle>Mention Contact, Profile, or Document</DialogTitle>
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

          <div className={stylex.props(styles.s7c401f01, styles.s1aa17).className || ''}>
            <div className={stylex.props(styles.sdef3facc).className || ''}>
              <Search
                className={
                  stylex.props(styles.sf2718385, styles.s67010d77, styles.sbe0abfed, styles.sbbfc415c, styles.sca3de968)
                    .className || ''
                }
              />
              <Input
                placeholder="Search for people, profiles, or documents…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={stylex.props(styles.s65c0f90).className || ''}
                autoFocus
              />
            </div>
          </div>

          <div className={stylex.props(styles.sb42feb5d, styles.sac38f2ae).className || ''}>
            {isLoading ? (
              <div
                className={
                  stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sce22ca32, styles.s34b574).className || ''
                }
              >
                <SizableText className={stylex.props(styles.sf2718385).className || ''}>Searching…</SizableText>
              </div>
            ) : allResults.length === 0 ? (
              <div
                className={
                  stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sce22ca32, styles.s34b574).className || ''
                }
              >
                <SizableText className={stylex.props(styles.sf2718385).className || ''}>
                  {searchQuery ? 'No results found' : 'Start typing to search…'}
                </SizableText>
              </div>
            ) : (
              <div data-slot="dialog-list">
                {results.Contacts.length > 0 && (
                  <MentionSection title="Contacts" items={results.Contacts} onSelect={handleSelectMention} />
                )}
                {results.Profiles.length > 0 && (
                  <MentionSection title="Profiles" items={results.Profiles} onSelect={handleSelectMention} />
                )}
                {results.Documents.length > 0 && (
                  <MentionSection title="Documents" items={results.Documents} onSelect={handleSelectMention} />
                )}
                {results.Recents.length > 0 && searchQuery === '' && (
                  <MentionSection title="Recent" items={results.Recents} onSelect={handleSelectMention} />
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
function MentionSection({title, items, onSelect}: {title: string; items: any[]; onSelect: (item: any) => void}) {
  if (items.length === 0) return null
  return (
    <div className={stylex.props(styles.s34b56e).className || ''}>
      <SizableText
        size="xs"
        weight="medium"
        className={stylex.props(styles.sf2718385, styles.s34b1af, styles.s34b56e).className || ''}
      >
        {title}
      </SizableText>
      {items.map((item) => (
        <Button
          key={item.id.id}
          variant="ghost"
          className={
            stylex.props(styles.sb41ffff4, styles.scdbaf625, styles.s626516e5, styles.s34b1af, styles.s34b56f)
              .className || ''
          }
          onClick={() => onSelect(item)}
        >
          <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fc).className || ''}>
            <LoadedHMIcon id={item.id} size={32} />
            <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s93b5f015).className || ''}>
              <SizableText>{item.title || 'Untitled'}</SizableText>
              {item.subtitle && (
                <SizableText size="xs" className={stylex.props(styles.sf2718385).className || ''}>
                  {item.subtitle}
                </SizableText>
              )}
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}
