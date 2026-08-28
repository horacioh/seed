import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {ScrollArea} from '@shm/ui/components/scroll-area'
import {panelContainerStyles, windowContainerStyles} from '@shm/ui/container'
import {copyTextToClipboard} from '@shm/ui/copy-to-clipboard'
import {toast} from '@shm/ui/toast'
import {Check, Copy, RefreshCw, TriangleAlert} from 'lucide-react'
import {useState} from 'react'
import {FallbackProps, getErrorMessage} from 'react-error-boundary'
import {ErrorBar} from './error-bar'
const styles_3 = stylex.create({
  s9f58bc18: {
    display: 'flex',
    flex: '1',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'auto',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 16)',
    '@media ((min-width: 640px))': {
      paddingInline: 'calc(var(--spacing) * 8)',
    },
  },
  s251c6549: {
    backgroundColor: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
    color: 'var(--destructive)',
    display: 'flex',
    width: 'calc(var(--spacing) * 10)',
    height: 'calc(var(--spacing) * 10)',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  s995bfbdb: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s12497abb: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1.5)',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 1.5)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_2 = stylex.create({
  s7bcef575: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    margin: 'calc(0.25rem * 4)',
    display: 'flex',
    width: '100%',
    maxWidth: '48rem',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: 'var(--shadow-sm)',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  s158c310c: {
    maxHeight: 'calc(0.25rem * 64)',
  },
})
const styles = stylex.create({
  sc9792423: {
    borderColor: 'var(--border)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 4)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 5)',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  sc4a7bbdc: {
    color: 'var(--muted-foreground)',
    marginBottom: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  s7326a4a8: {
    color: 'var(--foreground)',
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '600',
  },
  sabdeda20: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s7adf1fb1: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 5)',
    paddingInline: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 5)',
  },
  sea9251bd: {
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s5e9d8349: {
    borderColor: 'var(--border)',
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s2c975dd6: {
    color: 'var(--muted-foreground)',
    padding: 'calc(0.25rem * 3)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: '1.625',
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
  },
  s1fa2d8e6: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function AppErrorPage({error}: FallbackProps) {
  return (
    <div className={windowContainerStyles}>
      <ErrorBar />
      <AppErrorContent message={getErrorMessage(error) ?? 'Unknown error'} />
    </div>
  )
}
export function RootAppError({error}: FallbackProps) {
  return <AppErrorContent message={getErrorMessage(error) ?? 'Unknown error'} />
}
export function AppErrorContent({
  message,
  details,
  exitCode,
  signal,
  title = 'Something went wrong',
  description = 'Try again or copy the details below when asking for help.',
  eyebrow = 'Application error',
}: {
  message: string
  details?: string
  exitCode?: number | null
  signal?: string | null
  title?: string
  description?: string
  eyebrow?: string
}) {
  const [copied, setCopied] = useState(false)
  const diagnostics = [
    message,
    exitCode != null ? `Exit code: ${exitCode}` : null,
    signal ? `Signal: ${signal}` : null,
    details,
  ]
    .filter(Boolean)
    .join('\n\n')
  const copyDiagnostics = async () => {
    try {
      await copyTextToClipboard(diagnostics)
      setCopied(true)
      toast.success('Diagnostics copied to clipboard')
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Could not copy diagnostics')
    }
  }
  return (
    <div className={panelContainerStyles}>
      <div className={stylex.props(styles_3.s9f58bc18).className || ''}>
        <div role="alertdialog" className={stylex.props(styles_2.s7bcef575).className || ''}>
          <div className={stylex.props(styles.sc9792423).className || ''}>
            <div className={stylex.props(styles_3.s251c6549).className || ''}>
              <TriangleAlert className={stylex.props(styles.sca3de969).className || ''} />
            </div>
            <div className={stylex.props(styles_2.s3f58665f).className || ''}>
              <p className={stylex.props(styles.sc4a7bbdc).className || ''}>{eyebrow}</p>
              <h2 className={stylex.props(styles.s7326a4a8).className || ''}>{title}</h2>
              <p className={stylex.props(styles.sabdeda20).className || ''}>{description}</p>
            </div>
          </div>
          <div className={stylex.props(styles.s7adf1fb1).className || ''}>
            <p className={stylex.props(styles.sea9251bd).className || ''}>{message}</p>
            {details ? (
              <div className={stylex.props(styles_3.s995bfbdb).className || ''}>
                <div className={stylex.props(styles.s5e9d8349).className || ''}>
                  <span>Recent daemon output</span>
                  <button
                    type="button"
                    onClick={copyDiagnostics}
                    className={stylex.props(styles_3.s12497abb).className || ''}
                  >
                    {copied ? (
                      <Check className={stylex.props(styles.s3269316e).className || ''} />
                    ) : (
                      <Copy className={stylex.props(styles.s3269316e).className || ''} />
                    )}
                    {copied ? 'Copied' : 'Copy diagnostics'}
                  </button>
                </div>
                <ScrollArea className={stylex.props(styles_2.s158c310c).className || ''}>
                  <pre className={stylex.props(styles.s2c975dd6).className || ''}>{details}</pre>
                </ScrollArea>
              </div>
            ) : null}
            <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className={stylex.props(styles.sca3de968).className || ''} />
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
