import * as stylex from '@stylexjs/stylex'
import type {NavRoute} from '@shm/shared/routes'
import {useRouteLink} from '@shm/shared/routing'
import {memo, useState} from 'react'
const styles_4 = stylex.create({
  s21707c9a: {
    overflow: 'auto',
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  sf7998a14: {
    borderRadius: 'calc(var(--radius) + 4px)',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
})
const styles_3 = stylex.create({
  s6fb0ede4: {
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-blue-600)',
    textDecorationLine: 'underline',
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
  s80ddecfc: {
    display: 'flex',
    width: 'calc(var(--spacing) * 4)',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-black)',
      },
    },
  },
})
const styles_2 = stylex.create({
  s21707c9a: {
    overflow: 'auto',
  },
  s18e76f87: {
    overflow: 'auto',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
    paddingLeft: 'calc(0.25rem * 2)',
  },
  s581a54b3: {
    marginBlock: 'calc(0.25rem * 1)',
    display: 'flex',
    alignItems: 'center',
    overflow: 'auto',
  },
  sb326915d: {
    marginBlock: 'calc(0.25rem * 1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
})
const styles = stylex.create({
  saf5ba32b: {
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s8b977963: {
    color: 'oklch(54.6% 0.245 262.881)',
  },
  s6f33f8da: {
    color: 'oklch(57.7% 0.245 27.325)',
  },
  s126227c5: {
    color: 'oklch(55.8% 0.288 302.321)',
  },
  sb658156b: {
    overflow: 'auto',
    borderRadius: '0.25rem',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 2)',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'pre-wrap',
    color: '#000',
  },
  seeb0a33e: {
    fontFamily: 'var(--font-mono)',
    color: '#000',
  },
  sd459c8b3: {
    display: 'flex',
    overflow: 'auto',
  },
  sa257f517: {
    flex: '1',
    overflow: 'auto',
  },
  s630fa70b: {
    marginBlock: 'calc(0.25rem * 2)',
    overflow: 'auto',
  },
  s8582b27a: {
    marginRight: 'calc(0.25rem * 2)',
    fontWeight: '700',
    color: 'oklch(37.3% 0.034 259.733)',
  },
  sfe263580: {
    marginLeft: 'calc(0.25rem * 4)',
    overflow: 'auto',
  },
})
type DataViewerProps = {
  data: unknown
  level?: number
  onNavigate?: (url: string) => void
  getRouteForUrl?: (url: string) => NavRoute | string | null
}

/** Renders nested JSON-like document data using the shared explorer tree view. */
export const DataViewer = memo(function DataViewer({data, level = 0, onNavigate, getRouteForUrl}: DataViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const isTopLevel = level === 0
  if (data === null) return <span className={stylex.props(styles.saf5ba32b).className || ''}>null</span>
  if (data === undefined) return <span className={stylex.props(styles.saf5ba32b).className || ''}>undefined</span>
  if (data instanceof Uint8Array) {
    return <span className={stylex.props(styles.s8b977963).className || ''}>Binary Data ({data.length} bytes)</span>
  }
  if (typeof data === 'number') {
    return <span className={stylex.props(styles.s6f33f8da).className || ''}>{data}</span>
  }
  if (typeof data === 'boolean') {
    return <span className={stylex.props(styles.s126227c5).className || ''}>{String(data)}</span>
  }
  if (typeof data === 'string') {
    if (data.includes('\n')) {
      return <div className={stylex.props(styles.sb658156b).className || ''}>{data}</div>
    }
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return (
        <a
          href={data}
          target="_blank"
          rel="noopener noreferrer"
          className={stylex.props(styles_3.s6fb0ede4).className || ''}
        >
          {data}
        </a>
      )
    }
    if ((data.startsWith('hm://') || data.startsWith('ipfs://')) && (onNavigate || getRouteForUrl)) {
      return <DataViewerLink url={data} onNavigate={onNavigate} getRouteForUrl={getRouteForUrl} />
    }
    return <span className={stylex.props(styles.seeb0a33e).className || ''}>{data}</span>
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className={stylex.props(styles.saf5ba32b).className || ''}>[]</span>
    return (
      <div
        className={
          (stylex.props(styles_4.s21707c9a, styles_4.s529492ad, styles_4.s605ce4a1).className || '') +
          ' ' +
          (isTopLevel ? stylex.props(styles_4.sf7998a14, styles_4.s34b1af, styles_4.s34b56e).className || '' : '')
        }
      >
        <div className={stylex.props(styles.sd459c8b3).className || ''}>
          {!isTopLevel && (
            <div
              className={stylex.props(styles_3.s80ddecfc).className || ''}
              onClick={() => setIsExpanded((expanded) => !expanded)}
            />
          )}
          <div className={stylex.props(styles.sa257f517).className || ''}>
            {isExpanded ? (
              <div className={stylex.props(isTopLevel ? styles_2.s21707c9a : styles_2.s18e76f87).className || ''}>
                {data.map((item, index) => (
                  <div key={index} className={stylex.props(styles.s630fa70b).className || ''}>
                    <DataViewer data={item} level={level + 1} onNavigate={onNavigate} getRouteForUrl={getRouteForUrl} />
                  </div>
                ))}
              </div>
            ) : (
              <span className={stylex.props(styles.saf5ba32b).className || ''}>[{data.length} items]</span>
            )}
          </div>
        </div>
      </div>
    )
  }
  if (typeof data === 'object') {
    const objectData = data as Record<string, unknown>
    const keys = Object.keys(objectData)
    if (keys.length === 0) {
      return <span className={stylex.props(styles.saf5ba32b).className || ''}>Empty Object</span>
    }
    return (
      <div
        className={
          (stylex.props(styles_4.s21707c9a, styles_4.s529492ad, styles_4.s605ce4a1).className || '') +
          ' ' +
          (isTopLevel ? stylex.props(styles_4.sf7998a14, styles_4.s34b1af, styles_4.s34b56e).className || '' : '')
        }
      >
        <div className={stylex.props(styles.sd459c8b3).className || ''}>
          {!isTopLevel && (
            <div
              className={stylex.props(styles_3.s80ddecfc).className || ''}
              onClick={() => setIsExpanded((expanded) => !expanded)}
            />
          )}
          <div className={stylex.props(styles.sa257f517).className || ''}>
            {isExpanded ? (
              <div className={stylex.props(isTopLevel ? styles_2.s21707c9a : styles_2.s18e76f87).className || ''}>
                {keys.map((key) => {
                  const value = objectData[key]
                  const isSimpleValue =
                    typeof value === 'number' ||
                    typeof value === 'boolean' ||
                    (typeof value === 'string' && !value.includes('\n') && value.length <= 50)
                  return (
                    <div
                      key={key}
                      className={stylex.props(isSimpleValue ? styles_2.s581a54b3 : styles_2.sb326915d).className || ''}
                    >
                      <span className={stylex.props(styles.s8582b27a).className || ''}>{key}:</span>
                      {isSimpleValue ? (
                        <DataViewer
                          data={value}
                          level={level + 1}
                          onNavigate={onNavigate}
                          getRouteForUrl={getRouteForUrl}
                        />
                      ) : (
                        <div className={stylex.props(styles.sfe263580).className || ''}>
                          <DataViewer
                            data={value}
                            level={level + 1}
                            onNavigate={onNavigate}
                            getRouteForUrl={getRouteForUrl}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <span className={stylex.props(styles.saf5ba32b).className || ''}>{keys.join(', ')}</span>
            )}
          </div>
        </div>
      </div>
    )
  }
  return <span className={stylex.props(styles.saf5ba32b).className || ''}>{String(data)}</span>
})
function DataViewerLink({
  url,
  onNavigate,
  getRouteForUrl,
}: {
  url: string
  onNavigate?: (url: string) => void
  getRouteForUrl?: (url: string) => NavRoute | string | null
}) {
  const route = getRouteForUrl?.(url) || null
  const linkProps = useRouteLink(route)
  if (route) {
    return (
      <a {...linkProps} className={stylex.props(styles_3.s6fb0ede4).className || ''}>
        {url}
      </a>
    )
  }
  if (!onNavigate) {
    return <span className={stylex.props(styles.seeb0a33e).className || ''}>{url}</span>
  }
  return (
    <span className={stylex.props(styles_3.s6fb0ede4).className || ''} onClick={() => onNavigate(url)}>
      {url}
    </span>
  )
}
export default DataViewer
