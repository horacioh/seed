import * as stylex from '@stylexjs/stylex';
import clsx from 'clsx';
import { Activity, Globe, Monitor } from 'lucide-react';
import { createBrowserRouter, NavLink, Outlet, RouterProvider } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import ElectronPerformance from './components/ElectronPerformance';
import { WebPerformance } from './components/WebPerformance';
const styles_4 = stylex.create({
  s1858f14c: {
    ":hover": {
      "borderColor": "oklch(87.2% 0.01 258.338)"
    }
  },
  sd4a248ef: {
    ":hover": {
      "color": "oklch(37.3% 0.034 259.733)"
    }
  }
});
const styles_3 = stylex.create({
  s9b8736ad: {
    "display": "inline-flex"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  s6cb46866: {
    "borderBottomStyle": "solid",
    "borderBottomWidth": "2px"
  },
  s34b1ac: {
    "paddingInline": "0.25rem"
  },
  s34a2a8: {
    "paddingTop": "0.25rem"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  s129e46b3: {
    "fontWeight": "500"
  },
  s847e6bbb: {
    "borderColor": "oklch(58.5% 0.233 277.117)"
  },
  saf5bb22f: {
    "color": "oklch(21% 0.034 264.665)"
  },
  sc5a0131: {
    "borderColor": "transparent"
  },
  saf5ba32b: {
    "color": "oklch(55.1% 0.027 264.364)"
  }
});
const styles_2 = stylex.create({
  sa9df3e8c: {
    "minHeight": "100vh"
  },
  s7ef3c0bd: {
    "backgroundColor": "oklch(98.5% 0.002 247.839)"
  },
  s5574c491: {
    "marginInline": "auto"
  },
  s9ccd5d6c: {
    "maxWidth": "80rem"
  },
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  s80d2ded1: {
    "@media ((min-width: 640px))": {
      "paddingInline": "calc(0.25rem * 6)"
    }
  },
  s44a2c52: {
    "@media ((min-width: 1024px))": {
      "paddingInline": "calc(0.25rem * 8)"
    }
  },
  s34b572: {
    "paddingBlock": "calc(0.25rem * 6)"
  }
});
const styles = stylex.create({
  s3fe9d68: {
    backgroundColor: '#fff',
    boxShadow: 'var(--shadow-sm)'
  },
  s8c6cb8a6: {
    display: 'flex',
    justifyContent: 'space-between',
    height: 'calc(0.25rem * 16)'
  },
  s2ffff9: {
    display: 'flex'
  },
  sb2df0385: {
    display: 'flex',
    columnGap: 'calc(0.25rem * 8)'
  },
  s622ebe61: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    marginRight: 'calc(0.25rem * 2)'
  }
});
export default function App() {
  return <RouterProvider router={router} />;
}
const Layout = () => {
  return <div className={stylex.props(styles_2.sa9df3e8c, styles_2.s7ef3c0bd).className || ""}>
      <nav className={stylex.props(styles.s3fe9d68).className || ''}>
        <div className={stylex.props(styles_2.s5574c491, styles_2.s9ccd5d6c, styles_2.s34b1af, styles_2.s80d2ded1, styles_2.s44a2c52).className || ""}>
          <div className={stylex.props(styles.s8c6cb8a6).className || ''}>
            <div className={stylex.props(styles.s2ffff9).className || ''}>
              <div className={stylex.props(styles.sb2df0385).className || ''}>
                <NavLink to="/" className={({
                isActive
              }) => clsx(stylex.props(styles_3.s9b8736ad, styles_3.sc6ed1702, styles_3.s6cb46866, styles_3.s34b1ac, styles_3.s34a2a8, styles_3.sab7cc6fa, styles_3.s129e46b3).className || "", isActive ? stylex.props(styles_3.s847e6bbb, styles_3.saf5bb22f).className || "" : (stylex.props(styles_3.sc5a0131, styles_3.saf5ba32b).className || "") + " " + (stylex.props(styles_4.s1858f14c, styles_4.sd4a248ef).className || ""))} end>
                  <Activity className={stylex.props(styles.s622ebe61).className || ''} />
                  Dashboard
                </NavLink>
                <NavLink to="/electron" className={({
                isActive
              }) => clsx(stylex.props(styles_3.s9b8736ad, styles_3.sc6ed1702, styles_3.s6cb46866, styles_3.s34b1ac, styles_3.s34a2a8, styles_3.sab7cc6fa, styles_3.s129e46b3).className || "", isActive ? stylex.props(styles_3.s847e6bbb, styles_3.saf5bb22f).className || "" : (stylex.props(styles_3.sc5a0131, styles_3.saf5ba32b).className || "") + " " + (stylex.props(styles_4.s1858f14c, styles_4.sd4a248ef).className || ""))}>
                  <Monitor className={stylex.props(styles.s622ebe61).className || ''} />
                  Electron
                </NavLink>
                <NavLink to="/web" className={({
                isActive
              }) => clsx(stylex.props(styles_3.s9b8736ad, styles_3.sc6ed1702, styles_3.s6cb46866, styles_3.s34b1ac, styles_3.s34a2a8, styles_3.sab7cc6fa, styles_3.s129e46b3).className || "", isActive ? stylex.props(styles_3.s847e6bbb, styles_3.saf5bb22f).className || "" : (stylex.props(styles_3.sc5a0131, styles_3.saf5ba32b).className || "") + " " + (stylex.props(styles_4.s1858f14c, styles_4.sd4a248ef).className || ""))}>
                  <Activity className={stylex.props(styles.s622ebe61).className || ''} />
                  Web App
                </NavLink>
                <NavLink to="/landing" className={({
                isActive
              }) => clsx(stylex.props(styles_3.s9b8736ad, styles_3.sc6ed1702, styles_3.s6cb46866, styles_3.s34b1ac, styles_3.s34a2a8, styles_3.sab7cc6fa, styles_3.s129e46b3).className || "", isActive ? stylex.props(styles_3.s847e6bbb, styles_3.saf5bb22f).className || "" : (stylex.props(styles_3.sc5a0131, styles_3.saf5ba32b).className || "") + " " + (stylex.props(styles_4.s1858f14c, styles_4.sd4a248ef).className || ""))}>
                  <Globe className={stylex.props(styles.s622ebe61).className || ''} />
                  Landing
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className={stylex.props(styles_2.s5574c491, styles_2.s9ccd5d6c, styles_2.s34b572, styles_2.s80d2ded1, styles_2.s44a2c52).className || ""}>
        <Outlet />
      </main>
    </div>;
};
const router = createBrowserRouter([{
  path: '/',
  element: <Layout />,
  children: [{
    path: 'electron',
    element: <ElectronPerformance />
  }, {
    path: 'web',
    element: <WebPerformance app="web" />
  }, {
    path: 'landing',
    element: <WebPerformance app="landing" />
  }, {
    path: '/',
    element: <Dashboard />
  }]
}]);