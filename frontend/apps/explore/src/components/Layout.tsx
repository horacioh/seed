import * as stylex from '@stylexjs/stylex';
import { Link, NavLink, Outlet } from 'react-router-dom';
import HMLogo from '../assets/HMLogo.svg';

/** Shared page shell for the Explore app routes. */
const styles_2 = stylex.create({
  s2ffff9: {
    "display": "flex"
  },
  sa9df3e8c: {
    "minHeight": "100vh"
  },
  s600a0682: {
    "width": "100vw"
  },
  s67e351ac: {
    "flexDirection": "column"
  },
  s5f84480f: {
    "backgroundColor": "oklch(96.7% 0.003 264.542)"
  },
  s5cee774: {
    "position": "fixed"
  },
  s696c5b8: {
    "top": "calc(0.25rem * 0)"
  },
  s478fb0bf: {
    "right": "calc(0.25rem * 0)"
  },
  sbe0abfea: {
    "left": "calc(0.25rem * 0)"
  },
  s3824af: {
    "zIndex": "40"
  },
  scdbaf625: {
    "width": "100%"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sc1a629cb: {
    "justifyContent": "space-between"
  },
  s7c401f01: {
    "borderBottomStyle": "solid",
    "borderBottomWidth": "1px"
  },
  s2a40d7c9: {
    "borderColor": "oklch(92.8% 0.006 264.531)"
  },
  s605ce4a1: {
    "backgroundColor": "#fff"
  },
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  s34b570: {
    "paddingBlock": "calc(0.25rem * 4)"
  },
  s8a6c2a27: {
    "boxShadow": "var(--shadow-sm)"
  },
  s80d2ded3: {
    "@media ((min-width: 640px))": {
      "paddingInline": "calc(0.25rem * 8)"
    }
  },
  sca3de969: {
    "width": "calc(0.25rem * 5)",
    "height": "calc(0.25rem * 5)"
  },
  sca593af1: {
    "@media ((min-width: 640px))": {
      "height": "calc(0.25rem * 6)"
    }
  },
  sca597340: {
    "@media ((min-width: 640px))": {
      "width": "calc(0.25rem * 6)"
    }
  },
  s68a17202: {
    "backgroundClip": "text"
  },
  sbf5f1771: {
    "fontSize": "1rem",
    "lineHeight": "var(--text-base--line-height)"
  },
  s62c182b1: {
    "fontWeight": "600"
  },
  sf8e652db: {
    "whiteSpace": "nowrap"
  },
  s905558b2: {
    "color": "transparent"
  },
  s12a204fb: {
    "@media ((min-width: 640px))": {
      "fontSize": "1.125rem",
      "lineHeight": "var(--text-lg--line-height)"
    }
  },
  sb42feb5d: {
    "flex": "1"
  },
  s34b572: {
    "paddingBlock": "calc(0.25rem * 6)"
  },
  s65fb2a7: {
    "paddingTop": "calc(0.25rem * 20)"
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
  }
});
const styles = stylex.create({
  sac43974f: {
    display: 'flex',
    alignItems: 'center',
    columnGap: 'calc(0.25rem * 2)'
  },
  s434fddf9: {
    display: 'flex',
    columnGap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
    color: 'oklch(37.3% 0.034 259.733)'
  },
  scdbaf625: {
    width: '100%'
  },
  navBase: {
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    transitionProperty: 'all',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    whiteSpace: 'nowrap'
  },
  navActive: {
    backgroundColor: 'var(--color-gray-900)',
    color: '#fff',
    boxShadow: 'var(--shadow-sm)'
  },
  navHover: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-gray-100)',
        color: '#000'
      }
    }
  }
});
export default function Layout() {
  return <div className={stylex.props(styles_2.s2ffff9, styles_2.sa9df3e8c, styles_2.s600a0682, styles_2.s67e351ac, styles_2.s5f84480f).className || ""}>
      <header className={stylex.props(styles_2.s5cee774, styles_2.s696c5b8, styles_2.s478fb0bf, styles_2.sbe0abfea, styles_2.s3824af, styles_2.s2ffff9, styles_2.scdbaf625, styles_2.sc6ed1702, styles_2.sc1a629cb, styles_2.s7c401f01, styles_2.s2a40d7c9, styles_2.s605ce4a1, styles_2.s34b1af, styles_2.s34b570, styles_2.s8a6c2a27, styles_2.s80d2ded3).className || ""}>
        <Link to="/" className={stylex.props(styles.sac43974f).className || ''}>
          <img src={HMLogo} alt="HM Logo" className={stylex.props(styles_2.sca3de969, styles_2.sca593af1, styles_2.sca597340).className || ""} />
          <span className={stylex.props(styles_2.s68a17202, styles_2.sbf5f1771, styles_2.s62c182b1, styles_2.sf8e652db, styles_2.s905558b2, styles_2.s12a204fb).className || ""}>
            Hypermedia Explorer
          </span>
        </Link>

        <nav className={stylex.props(styles.s434fddf9).className || ''}>
          <NavLink to="/list" className={({
          isActive
        }) => stylex.props(styles.navBase, isActive ? styles.navActive : styles.navHover).className || ''}>
            All Spaces
          </NavLink>
          <NavLink to="/feed" className={({
          isActive
        }) => stylex.props(styles.navBase, isActive ? styles.navActive : styles.navHover).className || ''}>
            Feed
          </NavLink>
          <NavLink to="/api-lab" className={({
          isActive
        }) => stylex.props(styles.navBase, isActive ? styles.navActive : styles.navHover).className || ''}>
            API Lab
          </NavLink>
        </nav>
      </header>

      {/* Add top padding to account for fixed header */}
      <main className={stylex.props(styles_2.scdbaf625, styles_2.sb42feb5d, styles_2.s34b1af, styles_2.s34b572, styles_2.s65fb2a7, styles_2.s80d2ded1, styles_2.s44a2c52).className || ""}>
        <div className={stylex.props(styles.scdbaf625).className || ''}>
          <Outlet />
        </div>
      </main>
    </div>;
}