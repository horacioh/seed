import * as stylex from '@stylexjs/stylex'
import {Link, NavLink, Outlet} from 'react-router-dom'
import HMLogo from '../assets/HMLogo.svg'

/** Shared page shell for the Explore app routes. */
const styles = stylex.create({
  sac43974f: {
    display: 'flex',
    alignItems: 'center',
    columnGap: 'calc(0.25rem * 2)',
  },
  s434fddf9: {
    display: 'flex',
    columnGap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
    color: 'oklch(37.3% 0.034 259.733)',
  },
  scdbaf625: {
    width: '100%',
  },
})
export default function Layout() {
  return (
    <div className="flex min-h-screen w-screen flex-col bg-gray-100">
      <header className="fixed top-0 right-0 left-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-8">
        <Link to="/" className={stylex.props(styles.sac43974f).className || ''}>
          <img src={HMLogo} alt="HM Logo" className="size-5 sm:h-6 sm:w-6" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-base font-semibold whitespace-nowrap text-transparent sm:text-lg">
            Hypermedia Explorer
          </span>
        </Link>

        <nav className={stylex.props(styles.s434fddf9).className || ''}>
          <NavLink to="/list" className={({isActive}) => getNavClassName(isActive)}>
            All Spaces
          </NavLink>
          <NavLink to="/feed" className={({isActive}) => getNavClassName(isActive)}>
            Feed
          </NavLink>
          <NavLink to="/api-lab" className={({isActive}) => getNavClassName(isActive)}>
            API Lab
          </NavLink>
        </nav>
      </header>

      {/* Add top padding to account for fixed header */}
      <main className="w-full flex-1 px-4 py-6 pt-20 sm:px-6 lg:px-8">
        <div className={stylex.props(styles.scdbaf625).className || ''}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
function getNavClassName(isActive: boolean) {
  return `rounded-full px-3 py-2 transition whitespace-nowrap ${
    isActive ? 'bg-gray-900 text-white shadow-sm' : 'hover:bg-gray-100 hover:text-black'
  }`
}
