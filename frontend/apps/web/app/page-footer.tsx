import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {createOSProtocolUrl} from '@shm/shared'
import {useTx} from '@shm/shared/translation'
import {Button} from '@shm/ui/button'
import {SizableText} from '@shm/ui/text'
import {cn} from '@shm/ui/utils'
import {ExternalLink} from 'lucide-react'
import {ReactNode} from 'react'
import {AccountFooterActions} from './auth'
import {ClientOnly} from './client-lazy'
const styles = stylex.create({
  s1fa2d8e8: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  s944e25e3: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
})
export function PageFooter({id, className}: {id?: UnpackedHypermediaId | null; className?: string}) {
  const tx = useTx()
  return (
    <div data-page-footer="true" className={cn('border-border border-t px-3 py-2 sm:px-4 sm:py-2', className)}>
      <div className={stylex.props(styles.s1fa2d8e8).className || ''}>
        <ClientOnly>
          <div>
            <AccountFooterActions />
          </div>
        </ClientOnly>
        <div className={cn(stylex.props(styles.s944e25e3).className || '')}>
          <SizableText size="xs">
            {tx(
              'powered_by',
              ({seedLink}: {seedLink: ReactNode}) => (
                <>Powered by {seedLink}</>
              ),
              {
                seedLink: (
                  <a
                    className={stylex.props(styles.sab7cc79b).className || ''}
                    href="https://seed.hyper.media"
                    target="_blank"
                  >
                    Seed Hypermedia
                  </a>
                ),
              },
            )}
          </SizableText>
          {id ? (
            <Button className="hidden sm:flex" size="sm" variant="default" asChild>
              <a href={createOSProtocolUrl(id)}>
                <ExternalLink className={stylex.props(styles.sca3de967).className || ''} />
                {tx('Open App')}
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
