import * as stylex from '@stylexjs/stylex'
import React, {useEffect, useState} from 'react'
import type {WebPerformanceResult} from '../types'
import {loadWebPerformanceResults, transformWebResult} from '../utils/data'
import {formatBytes} from '../utils/format'
import WebPerformanceTrends from './WebPerformanceTrends'

/** Module-scoped Intl formatter reused across renders. */
const styles = stylex.create({
  sd471eed8: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s37006c4f: {
    marginTop: 'calc(0.25rem * 1)',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  s4045cbe6: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)',
  },
  sc4e9c291: {
    marginTop: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    color: 'oklch(55.1% 0.027 264.364)',
  },
  saf5ba32b: {
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s4957c1e5: {
    padding: 'calc(0.25rem * 4)',
    backgroundColor: 'oklch(97.1% 0.013 17.38)',
    borderRadius: 'var(--radius)',
  },
  s6f33fc9b: {
    color: 'oklch(50.5% 0.213 27.518)',
  },
  scc5e4477: {
    color: 'oklch(57.7% 0.245 27.325)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    marginTop: 'calc(0.25rem * 1)',
  },
  sc11f8f26: {
    padding: 'calc(0.25rem * 4)',
    backgroundColor: 'oklch(98.7% 0.026 102.212)',
    borderRadius: 'var(--radius)',
  },
  s27ec6fff: {
    color: 'oklch(47.6% 0.114 61.907)',
  },
  sdadb7393: {
    color: 'oklch(55.4% 0.135 66.442)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    marginTop: 'calc(0.25rem * 1)',
  },
  saad3fdd5: {
    backgroundColor: '#fff',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 6)',
  },
  s6869e2e0: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'calc(0.25rem * 6)',
  },
  s3fc6ee28: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)',
    marginBottom: 'calc(0.25rem * 4)',
  },
  s22c891d3: {
    color: 'oklch(55.1% 0.027 264.364)',
    marginBottom: 'calc(0.25rem * 6)',
  },
  saf5ba6ec: {
    color: 'oklch(44.6% 0.03 256.802)',
  },
  s82ff3a5: {
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingBlock: 'calc(0.25rem * 1)',
    paddingInline: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s334592: {
    marginTop: 'calc(0.25rem * 8)',
  },
  sd50dc147: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '600',
    color: 'oklch(57.7% 0.245 27.325)',
    marginBottom: 'calc(0.25rem * 4)',
  },
  sf780a8a5: {
    backgroundColor: 'oklch(97.1% 0.013 17.38)',
    padding: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
  },
  s3fc6ee2a: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)',
    marginBottom: 'calc(0.25rem * 6)',
  },
})
const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
})
interface MetricCardProps {
  title: string
  value: number
  threshold?: number
  unit?: string
  device: 'mobile' | 'desktop'
}
const MetricCard: React.FC<MetricCardProps> = ({title, value, threshold, unit, device}) => {
  const isOverThreshold = threshold && value > threshold
  const formattedValue =
    unit === 'bytes'
      ? formatBytes(value)
      : unit === 'ms'
        ? `${value.toFixed(0)}ms`
        : unit === 's'
          ? `${(value / 1000).toFixed(2)}s`
          : value.toString()
  return (
    <div className={`rounded-lg border p-4 ${isOverThreshold ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
      <h3 className={stylex.props(styles.sd471eed8).className || ''}>{title}</h3>
      <div className={stylex.props(styles.s37006c4f).className || ''}>
        <div className={stylex.props(styles.s4045cbe6).className || ''}>{formattedValue}</div>
        <div className={`text-sm ${device === 'mobile' ? 'text-blue-600' : 'text-purple-600'}`}>{device}</div>
      </div>
      {threshold && (
        <div className={stylex.props(styles.sc4e9c291).className || ''}>
          Threshold:{' '}
          {unit === 'bytes'
            ? formatBytes(threshold)
            : unit === 'ms'
              ? `${threshold}ms`
              : unit === 's'
                ? `${(threshold / 1000).toFixed(2)}s`
                : threshold}
        </div>
      )}
    </div>
  )
}
interface WebPerformanceProps {
  app: 'web' | 'landing'
}
export const WebPerformance: React.FC<WebPerformanceProps> = ({app}) => {
  const [results, setResults] = useState<WebPerformanceResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResultTimestamp, setSelectedResultTimestamp] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState<WebPerformanceResult | null>(null)
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        const data = await loadWebPerformanceResults(app)
        if (data) {
          setResults(data)
          // Auto-select most recent result
          if (data.length > 0) {
            setSelectedResultTimestamp(data[0].timestamp)
            setSelectedResult(data[0])
          }
        } else {
          setError(`Failed to load ${app} performance results`)
          throw new Error(`Failed to load ${app} performance results`)
        }
      } catch (error) {
        setError(`Failed to load ${app} performance results`)
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchResults()
  }, [app])

  // Update selected result when timestamp changes
  useEffect(() => {
    if (selectedResultTimestamp && results.length > 0) {
      const result = results.find((r) => r.timestamp === selectedResultTimestamp)
      setSelectedResult(result || null)
    }
  }, [selectedResultTimestamp, results])

  // Format date for display
  const formatDate = (dateString: string): string => {
    return fullDateFormatter.format(new Date(dateString))
  }
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className={stylex.props(styles.saf5ba32b).className || ''}>Loading {app} performance data…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className={stylex.props(styles.s4957c1e5).className || ''}>
        <div className={stylex.props(styles.s6f33fc9b).className || ''}>{error}</div>
        <div className={stylex.props(styles.scc5e4477).className || ''}>
          Check that performance test results exist and are accessible.
        </div>
      </div>
    )
  }
  if (results.length === 0) {
    return (
      <div className={stylex.props(styles.sc11f8f26).className || ''}>
        <div className={stylex.props(styles.s27ec6fff).className || ''}>No {app} performance test results found.</div>
        <div className={stylex.props(styles.sdadb7393).className || ''}>
          Run performance tests to generate data for the dashboard.
        </div>
      </div>
    )
  }
  const report = selectedResult ? transformWebResult(selectedResult) : null
  return (
    <div className="space-y-6">
      <div className={stylex.props(styles.saad3fdd5).className || ''}>
        <div className={stylex.props(styles.s6869e2e0).className || ''}>
          <div>
            <h2 className={stylex.props(styles.s3fc6ee28).className || ''}>
              {app === 'web' ? 'Web App' : 'Landing Page'} Performance Dashboard
            </h2>
            <p className={stylex.props(styles.s22c891d3).className || ''}>
              {selectedResult && `Latest results from ${formatDate(selectedResult.timestamp)}`}
            </p>
          </div>
          {results.length > 0 && (
            <div className="report-selector flex items-center gap-2">
              <label htmlFor="report-select" className={stylex.props(styles.saf5ba6ec).className || ''}>
                Report:
              </label>
              <select
                id="report-select"
                value={selectedResultTimestamp || ''}
                onChange={(e) => setSelectedResultTimestamp(e.target.value)}
                className={stylex.props(styles.s82ff3a5).className || ''}
              >
                {results.map((result) => (
                  <option key={result.timestamp} value={result.timestamp}>
                    {formatDate(result.timestamp)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedResult && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Core Web Vitals - Mobile */}
            <MetricCard
              title="Largest Contentful Paint (LCP)"
              value={selectedResult.mobile.lcp}
              threshold={4000}
              unit="ms"
              device="mobile"
            />
            <MetricCard
              title="Interaction to Next Paint (INP)"
              value={selectedResult.mobile.inp}
              threshold={500}
              unit="ms"
              device="mobile"
            />
            <MetricCard
              title="Cumulative Layout Shift (CLS)"
              value={selectedResult.mobile.cls}
              threshold={0.25}
              device="mobile"
            />

            {/* Core Web Vitals - Desktop */}
            <MetricCard
              title="Largest Contentful Paint (LCP)"
              value={selectedResult.desktop.lcp}
              threshold={2500}
              unit="ms"
              device="desktop"
            />
            <MetricCard
              title="Interaction to Next Paint (INP)"
              value={selectedResult.desktop.inp}
              threshold={200}
              unit="ms"
              device="desktop"
            />
            <MetricCard
              title="Cumulative Layout Shift (CLS)"
              value={selectedResult.desktop.cls}
              threshold={0.1}
              device="desktop"
            />

            {/* Other Metrics - Mobile */}
            <MetricCard
              title="Time to First Byte (TTFB)"
              value={selectedResult.mobile.ttfb}
              threshold={1000}
              unit="ms"
              device="mobile"
            />
            <MetricCard title="Page Load Time" value={selectedResult.mobile.pageLoadTime} unit="ms" device="mobile" />
            <MetricCard
              title="Page Size"
              value={selectedResult.mobile.pageSize}
              threshold={2000000}
              unit="bytes"
              device="mobile"
            />

            {/* Other Metrics - Desktop */}
            <MetricCard
              title="Time to First Byte (TTFB)"
              value={selectedResult.desktop.ttfb}
              threshold={600}
              unit="ms"
              device="desktop"
            />
            <MetricCard title="Page Load Time" value={selectedResult.desktop.pageLoadTime} unit="ms" device="desktop" />
            <MetricCard
              title="Page Size"
              value={selectedResult.desktop.pageSize}
              threshold={2000000}
              unit="bytes"
              device="desktop"
            />
          </div>
        )}

        {report && report.budgetViolations.length > 0 && (
          <div className={stylex.props(styles.s334592).className || ''}>
            <h2 className={stylex.props(styles.sd50dc147).className || ''}>Performance Budget Violations</h2>
            <div className={stylex.props(styles.sf780a8a5).className || ''}>
              <ul className="space-y-2">
                {report.budgetViolations.map((violation, index) => (
                  <li key={index} className={stylex.props(styles.s6f33fc9b).className || ''}>
                    {violation.metric} ({violation.device}): {violation.actual.toFixed(2)} (limit: {violation.limit})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Historical Trends Section */}
      <div className={stylex.props(styles.saad3fdd5).className || ''}>
        <h2 className={stylex.props(styles.s3fc6ee2a).className || ''}>Performance Trends</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Core Web Vitals Trends */}
          <WebPerformanceTrends
            results={results}
            metric="lcp"
            device="mobile"
            title="Largest Contentful Paint"
            unit="ms"
          />
          <WebPerformanceTrends
            results={results}
            metric="inp"
            device="mobile"
            title="Interaction to Next Paint"
            unit="ms"
          />
          <WebPerformanceTrends results={results} metric="cls" device="mobile" title="Cumulative Layout Shift" />
          <WebPerformanceTrends results={results} metric="ttfb" device="mobile" title="Time to First Byte" unit="ms" />
          <WebPerformanceTrends
            results={results}
            metric="pageLoadTime"
            device="mobile"
            title="Page Load Time"
            unit="ms"
          />
          <WebPerformanceTrends results={results} metric="pageSize" device="mobile" title="Page Size" unit="bytes" />
        </div>
      </div>
    </div>
  )
}
export default WebPerformance
