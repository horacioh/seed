import * as stylex from '@stylexjs/stylex'
import {FallbackProps, getErrorMessage, useErrorBoundary} from 'react-error-boundary'
const styles = stylex.create({
  s70eb276: {
    marginBottom: 'calc(0.25rem * 2)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
    color: 'oklch(44.4% 0.177 26.899)',
  },
  scb4f882d: {
    marginBottom: 'calc(0.25rem * 4)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(57.7% 0.245 27.325)',
  },
})
export function ErrorFallback({error}: FallbackProps) {
  const {resetBoundary} = useErrorBoundary()
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-lg border border-red-300 bg-red-50 p-6">
        <h2 className={stylex.props(styles.s70eb276).className || ''}>Something went wrong</h2>
        <pre className={stylex.props(styles.scb4f882d).className || ''}>{getErrorMessage(error)}</pre>
        <button onClick={resetBoundary} className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
          Try again
        </button>
      </div>
    </div>
  )
}
