import * as stylex from '@stylexjs/stylex';
import { FallbackProps, getErrorMessage, useErrorBoundary } from 'react-error-boundary';
const styles_2 = stylex.create({
  s2ffff9: {
    "display": "flex"
  },
  sa9df3e8c: {
    "minHeight": "100vh"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sce22ca32: {
    "justifyContent": "center"
  },
  s1aa1b: {
    "padding": "calc(0.25rem * 8)"
  },
  scdbaf625: {
    "width": "100%"
  },
  s1593095a: {
    "maxWidth": "32rem"
  },
  sf799889b: {
    "borderRadius": "var(--radius)"
  },
  sad8c742c: {
    "borderStyle": "solid",
    "borderWidth": "1px"
  },
  s62a6ad96: {
    "borderColor": "oklch(80.8% 0.114 19.571)"
  },
  sa289d7df: {
    "backgroundColor": "oklch(97.1% 0.013 17.38)"
  },
  s1aa19: {
    "padding": "calc(0.25rem * 6)"
  },
  s529492ad: {
    "borderRadius": "0.25rem"
  },
  saeb127f2: {
    "backgroundColor": "oklch(57.7% 0.245 27.325)"
  },
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  s34b56e: {
    "paddingBlock": "calc(0.25rem * 2)"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  s2daecf89: {
    "color": "#fff"
  },
  sa6ef04b1: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(50.5% 0.213 27.518)"
      }
    }
  }
});
const styles = stylex.create({
  s70eb276: {
    marginBottom: 'calc(0.25rem * 2)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
    color: 'oklch(44.4% 0.177 26.899)'
  },
  scb4f882d: {
    marginBottom: 'calc(0.25rem * 4)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(57.7% 0.245 27.325)'
  }
});
export function ErrorFallback({
  error
}: FallbackProps) {
  const {
    resetBoundary
  } = useErrorBoundary();
  return <div className={stylex.props(styles_2.s2ffff9, styles_2.sa9df3e8c, styles_2.sc6ed1702, styles_2.sce22ca32, styles_2.s1aa1b).className || ""}>
      <div className={stylex.props(styles_2.scdbaf625, styles_2.s1593095a, styles_2.sf799889b, styles_2.sad8c742c, styles_2.s62a6ad96, styles_2.sa289d7df, styles_2.s1aa19).className || ""}>
        <h2 className={stylex.props(styles.s70eb276).className || ''}>Something went wrong</h2>
        <pre className={stylex.props(styles.scb4f882d).className || ''}>{getErrorMessage(error)}</pre>
        <button onClick={resetBoundary} className={stylex.props(styles_2.s529492ad, styles_2.saeb127f2, styles_2.s34b1af, styles_2.s34b56e, styles_2.sab7cc6fa, styles_2.s2daecf89, styles_2.sa6ef04b1).className || ""}>
          Try again
        </button>
      </div>
    </div>;
}