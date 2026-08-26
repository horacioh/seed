import * as stylex from '@stylexjs/stylex'
import clsx from 'clsx'
import {Activity, Globe, Monitor} from 'lucide-react'
import {createBrowserRouter, NavLink, Outlet, RouterProvider} from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import ElectronPerformance from './components/ElectronPerformance'
import {WebPerformance} from './components/WebPerformance'
const styles = stylex.create({
  s3fe9d68: {
    backgroundColor: '#fff',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-sm)',
  },
  s8c6cb8a6: {
    display: 'flex',
    justifyContent: 'space-between',
    height: 'calc(0.25rem * 16)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sb2df0385: {
    display: 'flex',
    columnGap: 'calc(0.25rem * 8)',
  },
  s622ebe61: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    marginRight: 'calc(0.25rem * 2)',
  },
})
export default function App() {
  return <RouterProvider router={router} />
}
const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className={stylex.props(styles.s3fe9d68).className || ''}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={stylex.props(styles.s8c6cb8a6).className || ''}>
            <div className={stylex.props(styles.s2ffff9).className || ''}>
              <div className={stylex.props(styles.sb2df0385).className || ''}>
                <NavLink
                  to="/"
                  className={({isActive}) =>
                    clsx(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    )
                  }
                  end
                >
                  <Activity className={stylex.props(styles.s622ebe61).className || ''} />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/electron"
                  className={({isActive}) =>
                    clsx(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    )
                  }
                >
                  <Monitor className={stylex.props(styles.s622ebe61).className || ''} />
                  Electron
                </NavLink>
                <NavLink
                  to="/web"
                  className={({isActive}) =>
                    clsx(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    )
                  }
                >
                  <Activity className={stylex.props(styles.s622ebe61).className || ''} />
                  Web App
                </NavLink>
                <NavLink
                  to="/landing"
                  className={({isActive}) =>
                    clsx(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    )
                  }
                >
                  <Globe className={stylex.props(styles.s622ebe61).className || ''} />
                  Landing
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'electron',
        element: <ElectronPerformance />,
      },
      {
        path: 'web',
        element: <WebPerformance app="web" />,
      },
      {
        path: 'landing',
        element: <WebPerformance app="landing" />,
      },
      {
        path: '/',
        element: <Dashboard />,
      },
    ],
  },
])
