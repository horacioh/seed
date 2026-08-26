import * as stylex from '@stylexjs/stylex'
import {Activity, ArrowRight, Globe, Monitor} from 'lucide-react'
import React from 'react'
import {Link} from 'react-router-dom'
import {loadPerformanceReports} from '../utils/data'
const styles = stylex.create({
  saf5ba32b: {
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s57678e4b: {
    textAlign: 'center',
    marginBottom: 'calc(0.25rem * 8)',
  },
  sf6c2bf03: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)',
    marginBottom: 'calc(0.25rem * 4)',
  },
  sf2567f3: {
    backgroundColor: '#fff',
    borderRadius: 'var(--radius)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-md)',
    overflow: 'hidden',
  },
  s1aa19: {
    padding: 'calc(0.25rem * 6)',
  },
  sd485e328: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'calc(0.25rem * 4)',
  },
  s380d63c9: {
    display: 'flex',
    alignItems: 'center',
  },
  sa48b6825: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    color: 'oklch(51.1% 0.262 276.966)',
    marginRight: 'calc(0.25rem * 2)',
  },
  s652cac74: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)',
  },
  s6079cf3b: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    marginLeft: 'calc(0.25rem * 1)',
  },
  s4204e085: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s4045cbe6: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)',
  },
  se15d36db: {
    backgroundColor: 'oklch(98.5% 0.002 247.839)',
    paddingInline: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s35208d1d: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    color: 'oklch(54.6% 0.245 262.881)',
    marginRight: 'calc(0.25rem * 2)',
  },
  s4ad1eba8: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    color: 'oklch(62.7% 0.194 149.214)',
    marginRight: 'calc(0.25rem * 2)',
  },
  se481a137: {
    backgroundColor: '#fff',
    borderRadius: 'var(--radius)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-md)',
    padding: 'calc(0.25rem * 6)',
  },
  s3fc6ee28: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)',
    marginBottom: 'calc(0.25rem * 4)',
  },
  saa841a0f: {
    overflowX: 'auto',
  },
  s1cf31f9: {
    paddingInline: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 3)',
    textAlign: 'left',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
    color: 'oklch(55.1% 0.027 264.364)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  s7459ef7a: {
    paddingInline: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 4)',
    whiteSpace: 'nowrap',
  },
  s1e05ad86: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(51.1% 0.262 276.966)',
    marginRight: 'calc(0.25rem * 2)',
  },
  sd471fddc: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
    color: 'oklch(21% 0.034 264.665)',
  },
  s780bec5f: {
    paddingInline: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 4)',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.1% 0.027 264.364)',
  },
  sf7f086ca: {
    paddingInline: 'calc(0.25rem * 2)',
    display: 'inline-flex',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 5)',
    fontWeight: '600',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(96.2% 0.044 156.743)',
    color: 'oklch(44.8% 0.119 151.328)',
  },
  s4d7eb6be: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(54.6% 0.245 262.881)',
    marginRight: 'calc(0.25rem * 2)',
  },
  s3e38f627: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(62.7% 0.194 149.214)',
    marginRight: 'calc(0.25rem * 2)',
  },
})
const Dashboard = () => {
  const [metrics, setMetrics] = React.useState<{
    electron: {
      totalReports: number
      latestReport: any
      avgStartupTime: number
      avgMemoryUsage: number
      avgCpuUsage: number
    }
    web: {
      totalReports: number
      latestReport: any
      avgLCP: number
      avgFID: number
      avgCLS: number
      performanceScore: number
    }
    landing: {
      totalReports: number
      latestReport: any
      avgLCP: number
      avgFID: number
      avgCLS: number
      performanceScore: number
    }
  } | null>(null)
  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Load reports for each app
        const electronReports = await loadPerformanceReports('electron')
        console.log(`== ~ fetchMetrics ~ electronReports:`, electronReports)
        // Note: You'll need to implement these functions in your data utils
        const webReports = await loadPerformanceReports('web')
        console.log(`== ~ fetchMetrics ~ webReports:`, webReports)
        const landingReports = await loadPerformanceReports('landing')

        // Calculate averages and get latest reports
        setMetrics({
          electron: {
            totalReports: electronReports.length,
            latestReport: electronReports[0],
            avgStartupTime: calculateAvgStartupTime(electronReports),
            avgMemoryUsage: calculateAvgMemoryUsage(electronReports),
            avgCpuUsage: calculateAvgCpuUsage(electronReports),
          },
          web: {
            totalReports: webReports.length,
            latestReport: webReports[0],
            ...calculateWebMetrics(webReports),
          },
          landing: {
            totalReports: landingReports.length,
            latestReport: landingReports[0],
            ...calculateWebMetrics(landingReports),
          },
        })
      } catch (error) {
        console.error('Error loading dashboard metrics:', error)
      }
    }
    fetchMetrics()
  }, [])

  // Helper functions to calculate averages
  const calculateAvgStartupTime = (reports: any[]) => {
    if (!reports.length) return 0
    const startupTimes = reports.map((r) => {
      const metrics = r.metrics?.['app-startup'] || {}
      return metrics.appStartupTime || 0
    })
    return startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length
  }
  const calculateAvgMemoryUsage = (reports: any[]) => {
    if (!reports.length) return 0
    const memoryUsages = reports.map((r) => {
      const metrics = Object.values(r.metrics || {}).find((m: any) => m.jsHeapUsedSize) as any
      return metrics?.jsHeapUsedSize || 0
    })
    return memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length
  }
  const calculateAvgCpuUsage = (reports: any[]) => {
    if (!reports.length) return 0
    const cpuUsages = reports.map((r) => {
      const metrics = Object.values(r.metrics || {}).find((m: any) => m.cpuUsage) as any
      return metrics?.cpuUsage?.percentCPUUsage || 0
    })
    return cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length
  }
  const calculateWebMetrics = (reports: any[]) => {
    if (!reports.length)
      return {
        avgLCP: 0,
        avgFID: 0,
        avgCLS: 0,
        performanceScore: 0,
      }
    const metrics = reports.map((r) => ({
      lcp: r.metrics?.LCP || 0,
      fid: r.metrics?.FID || 0,
      cls: r.metrics?.CLS || 0,
      score: r.metrics?.performanceScore || 0,
    }))
    return {
      avgLCP: metrics.reduce((a, b) => a + b.lcp, 0) / metrics.length,
      avgFID: metrics.reduce((a, b) => a + b.fid, 0) / metrics.length,
      avgCLS: metrics.reduce((a, b) => a + b.cls, 0) / metrics.length,
      performanceScore: metrics.reduce((a, b) => a + b.score, 0) / metrics.length,
    }
  }

  // Format helpers
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
  const formatMs = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
    return `${ms.toFixed(2)}ms`
  }
  if (!metrics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className={stylex.props(styles.saf5ba32b).className || ''}>Loading dashboard data…</div>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      <div className={stylex.props(styles.s57678e4b).className || ''}>
        <h1 className={stylex.props(styles.sf6c2bf03).className || ''}>Seed Frontend Performance Dashboard</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Monitor and analyze performance metrics across all applications. Track startup times, resource usage, and web
          vitals to ensure optimal user experience.
        </p>
      </div>

      {/* App Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Electron App Card */}
        <div className={stylex.props(styles.sf2567f3).className || ''}>
          <div className={stylex.props(styles.s1aa19).className || ''}>
            <div className={stylex.props(styles.sd485e328).className || ''}>
              <div className={stylex.props(styles.s380d63c9).className || ''}>
                <Monitor className={stylex.props(styles.sa48b6825).className || ''} />
                <h2 className={stylex.props(styles.s652cac74).className || ''}>Electron App</h2>
              </div>
              <Link to="/electron" className="flex items-center text-indigo-600 hover:text-indigo-700">
                View Details
                <ArrowRight className={stylex.props(styles.s6079cf3b).className || ''} />
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>Average Startup Time</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>
                  {formatMs(metrics.electron.avgStartupTime)}
                </p>
              </div>
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>Memory Usage</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>
                  {formatBytes(metrics.electron.avgMemoryUsage)}
                </p>
              </div>
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>CPU Usage</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>
                  {metrics.electron.avgCpuUsage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className={stylex.props(styles.se15d36db).className || ''}>
            <div className={stylex.props(styles.s4204e085).className || ''}>
              {metrics.electron.totalReports} reports •{' '}
              {new Date(metrics.electron.latestReport?.date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Web App Card */}
        <div className={stylex.props(styles.sf2567f3).className || ''}>
          <div className={stylex.props(styles.s1aa19).className || ''}>
            <div className={stylex.props(styles.sd485e328).className || ''}>
              <div className={stylex.props(styles.s380d63c9).className || ''}>
                <Activity className={stylex.props(styles.s35208d1d).className || ''} />
                <h2 className={stylex.props(styles.s652cac74).className || ''}>Web App</h2>
              </div>
              <Link to="/web" className="flex items-center text-blue-600 hover:text-blue-700">
                View Details
                <ArrowRight className={stylex.props(styles.s6079cf3b).className || ''} />
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>Avg LCP</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>{formatMs(metrics.web.avgLCP)}</p>
              </div>
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>Performance Score</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>
                  {metrics.web.performanceScore.toFixed(0)}
                </p>
              </div>
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>CLS</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>{metrics.web.avgCLS.toFixed(3)}</p>
              </div>
            </div>
          </div>
          <div className={stylex.props(styles.se15d36db).className || ''}>
            <div className={stylex.props(styles.s4204e085).className || ''}>
              {metrics.web.totalReports} reports • {new Date(metrics.web.latestReport?.date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Landing Page Card */}
        <div className={stylex.props(styles.sf2567f3).className || ''}>
          <div className={stylex.props(styles.s1aa19).className || ''}>
            <div className={stylex.props(styles.sd485e328).className || ''}>
              <div className={stylex.props(styles.s380d63c9).className || ''}>
                <Globe className={stylex.props(styles.s4ad1eba8).className || ''} />
                <h2 className={stylex.props(styles.s652cac74).className || ''}>Landing Page</h2>
              </div>
              <Link to="/landing" className="flex items-center text-green-600 hover:text-green-700">
                View Details
                <ArrowRight className={stylex.props(styles.s6079cf3b).className || ''} />
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>Avg LCP</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>{formatMs(metrics.landing.avgLCP)}</p>
              </div>
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>Performance Score</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>
                  {metrics.landing.performanceScore.toFixed(0)}
                </p>
              </div>
              <div>
                <p className={stylex.props(styles.s4204e085).className || ''}>CLS</p>
                <p className={stylex.props(styles.s4045cbe6).className || ''}>{metrics.landing.avgCLS.toFixed(3)}</p>
              </div>
            </div>
          </div>
          <div className={stylex.props(styles.se15d36db).className || ''}>
            <div className={stylex.props(styles.s4204e085).className || ''}>
              {metrics.landing.totalReports} reports •{' '}
              {new Date(metrics.landing.latestReport?.date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Reports Section */}
      <div className={stylex.props(styles.se481a137).className || ''}>
        <h2 className={stylex.props(styles.s3fc6ee28).className || ''}>Latest Performance Reports</h2>
        <div className={stylex.props(styles.saa841a0f).className || ''}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={stylex.props(styles.s1cf31f9).className || ''}>Application</th>
                <th className={stylex.props(styles.s1cf31f9).className || ''}>Date</th>
                <th className={stylex.props(styles.s1cf31f9).className || ''}>Key Metrics</th>
                <th className={stylex.props(styles.s1cf31f9).className || ''}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Electron Latest Report */}
              <tr>
                <td className={stylex.props(styles.s7459ef7a).className || ''}>
                  <div className={stylex.props(styles.s380d63c9).className || ''}>
                    <Monitor className={stylex.props(styles.s1e05ad86).className || ''} />
                    <div className={stylex.props(styles.sd471fddc).className || ''}>Electron App</div>
                  </div>
                </td>
                <td className={stylex.props(styles.s780bec5f).className || ''}>
                  {new Date(metrics.electron.latestReport?.date).toLocaleDateString()}
                </td>
                <td className={stylex.props(styles.s780bec5f).className || ''}>
                  Startup: {formatMs(metrics.electron.avgStartupTime)} • CPU: {metrics.electron.avgCpuUsage.toFixed(1)}%
                </td>
                <td className={stylex.props(styles.s7459ef7a).className || ''}>
                  <span className={stylex.props(styles.sf7f086ca).className || ''}>Healthy</span>
                </td>
              </tr>

              {/* Web App Latest Report */}
              <tr>
                <td className={stylex.props(styles.s7459ef7a).className || ''}>
                  <div className={stylex.props(styles.s380d63c9).className || ''}>
                    <Activity className={stylex.props(styles.s4d7eb6be).className || ''} />
                    <div className={stylex.props(styles.sd471fddc).className || ''}>Web App</div>
                  </div>
                </td>
                <td className={stylex.props(styles.s780bec5f).className || ''}>
                  {new Date(metrics.web.latestReport?.date).toLocaleDateString()}
                </td>
                <td className={stylex.props(styles.s780bec5f).className || ''}>
                  LCP: {formatMs(metrics.web.avgLCP)} • Score: {metrics.web.performanceScore.toFixed(0)}
                </td>
                <td className={stylex.props(styles.s7459ef7a).className || ''}>
                  <span className={stylex.props(styles.sf7f086ca).className || ''}>Healthy</span>
                </td>
              </tr>

              {/* Landing Page Latest Report */}
              <tr>
                <td className={stylex.props(styles.s7459ef7a).className || ''}>
                  <div className={stylex.props(styles.s380d63c9).className || ''}>
                    <Globe className={stylex.props(styles.s3e38f627).className || ''} />
                    <div className={stylex.props(styles.sd471fddc).className || ''}>Landing Page</div>
                  </div>
                </td>
                <td className={stylex.props(styles.s780bec5f).className || ''}>
                  {new Date(metrics.landing.latestReport?.date).toLocaleDateString()}
                </td>
                <td className={stylex.props(styles.s780bec5f).className || ''}>
                  LCP: {formatMs(metrics.landing.avgLCP)} • Score: {metrics.landing.performanceScore.toFixed(0)}
                </td>
                <td className={stylex.props(styles.s7459ef7a).className || ''}>
                  <span className={stylex.props(styles.sf7f086ca).className || ''}>Healthy</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default Dashboard
