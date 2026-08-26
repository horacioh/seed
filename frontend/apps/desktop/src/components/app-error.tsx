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
      <div className="flex flex-1 items-start justify-center overflow-auto px-4 py-16 sm:px-8">
        <div
          role="alertdialog"
          className="border-border bg-background m-4 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border shadow-sm"
        >
          <div className={stylex.props(styles.sc9792423).className || ''}>
            <div className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-full">
              <TriangleAlert className={stylex.props(styles.sca3de969).className || ''} />
            </div>
            <div className="min-w-0">
              <p className={stylex.props(styles.sc4a7bbdc).className || ''}>{eyebrow}</p>
              <h2 className={stylex.props(styles.s7326a4a8).className || ''}>{title}</h2>
              <p className={stylex.props(styles.sabdeda20).className || ''}>{description}</p>
            </div>
          </div>
          <div className={stylex.props(styles.s7adf1fb1).className || ''}>
            <p className={stylex.props(styles.sea9251bd).className || ''}>{message}</p>
            {details ? (
              <div className="border-border bg-muted/40 overflow-hidden rounded-lg border">
                <div className={stylex.props(styles.s5e9d8349).className || ''}>
                  <span>Recent daemon output</span>
                  <button
                    type="button"
                    onClick={copyDiagnostics}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded px-1.5 py-1 transition-colors"
                  >
                    {copied ? (
                      <Check className={stylex.props(styles.s3269316e).className || ''} />
                    ) : (
                      <Copy className={stylex.props(styles.s3269316e).className || ''} />
                    )}
                    {copied ? 'Copied' : 'Copy diagnostics'}
                  </button>
                </div>
                <ScrollArea className="max-h-64">
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
