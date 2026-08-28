import * as stylex from '@stylexjs/stylex'
import {useUniversalAppContext} from '@shm/shared/routing'
import {Button} from './button'
import {copyTextToClipboard} from './copy-to-clipboard'
import {Copy, ExternalLink} from './icons'
import {Text} from './text'
import {toast} from './toast'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles_2 = stylex.create({
  s2a2f6137: {
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 2.5)',
  },
  s78215fee: {
    gap: 'calc(0.25rem * 1)',
    padding: 'calc(0.25rem * 1)',
  },
})
const styles = stylex.create({
  s3e6ca6c7: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
  },
  s3b8925b9: {
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function CopyUrlField({url, label, size = 'md'}: {url: string; label: string; size?: 'sm' | 'md'}) {
  const {openUrl} = useUniversalAppContext()
  return (
    <div
      className={cn(
        stylex.props(styles.s3e6ca6c7).className || '',
        stylex.props(size == 'md' ? styles_2.s2a2f6137 : styles_2.s78215fee).className || '',
      )}
    >
      <div className={stylex.props(styles.s3b8925b9).className || ''}>
        <Text size={size} color="muted">
          {url}
        </Text>
      </div>
      <Tooltip content="Copy URL">
        <Button
          variant="ghost"
          size={size == 'md' ? 'sm' : 'xs'}
          onClick={() => {
            copyTextToClipboard(url).then(() => {
              toast.success(`Copied ${label} URL`)
            })
          }}
        >
          <Copy className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      </Tooltip>
      <Tooltip content="Open URL">
        <Button onClick={() => openUrl(url)} variant="ghost" size={size == 'md' ? 'sm' : 'xs'}>
          <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      </Tooltip>
    </div>
  )
}
