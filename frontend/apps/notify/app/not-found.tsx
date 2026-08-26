import * as stylex from '@stylexjs/stylex'
import {useTx} from '@shm/shared/translation'
import {SizableText} from '@shm/ui/text'
const styles = stylex.create({
  sceaed122: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    flexDirection: 'column',
  },
  se6224f5b: {
    display: 'flex',
    flex: '1',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 12)',
  },
})
export function NotFoundPage() {
  const tx = useTx()
  return (
    <div className={stylex.props(styles.sceaed122).className || ''}>
      <div className={stylex.props(styles.se6224f5b).className || ''}>
        <div className="border-border dark:bg-background flex w-full max-w-lg flex-1 flex-col gap-4 rounded-lg border bg-white p-6 shadow-lg">
          <SizableText size="3xl">☹️</SizableText>
          <SizableText size="2xl" weight="bold">
            {tx('Document Not Found')}
          </SizableText>

          <SizableText asChild>
            <p>
              {tx(
                'oops_document_not_found',
                `Oops! The document you're looking for doesn't seem to exist. It
              may have been moved, deleted, or the link might be incorrect.`,
              )}
            </p>
          </SizableText>
          <SizableText asChild>
            <p>
              {tx(
                'please_double_check_url',
                `Please double-check the URL or head back to the dashboard to find
              what you're looking for. If you need help, feel free to reach out
              to support.`,
              )}
            </p>
          </SizableText>
        </div>
      </div>
    </div>
  )
}
