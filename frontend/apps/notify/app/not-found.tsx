import * as stylex from '@stylexjs/stylex'
import {useTx} from '@shm/shared/translation'
import {SizableText} from '@shm/ui/text'
const styles_2 = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  s1593095a: {
    maxWidth: '32rem',
  },
  sb42feb5d: {
    flex: '1',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fd: {
    gap: 'calc(0.25rem * 4)',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s1aa19: {
    padding: 'calc(0.25rem * 6)',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
})
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
        <div
          className={
            stylex.props(
              styles_2.s1a01a0ed,
              styles_2.s2ffff9,
              styles_2.scdbaf625,
              styles_2.s1593095a,
              styles_2.sb42feb5d,
              styles_2.s67e351ac,
              styles_2.s5d936fd,
              styles_2.sf799889b,
              styles_2.sad8c742c,
              styles_2.s605ce4a1,
              styles_2.s1aa19,
              styles_2.s8a6c2948,
            ).className || ''
          }
        >
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
