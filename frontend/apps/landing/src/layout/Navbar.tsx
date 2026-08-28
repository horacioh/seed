import * as stylex from '@stylexjs/stylex';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import SeedLogo from '../assets/SeedLogo';
const styles_3 = stylex.create({
  s5cee774: {
    "position": "fixed"
  },
  s74a79380: {
    "inset": "calc(0.25rem * 0)"
  },
  s3824ce: {
    "zIndex": "50"
  },
  s2ffff9: {
    "display": "flex"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sce22ca32: {
    "justifyContent": "center"
  },
  s68b0d4ed: {
    "@media ((min-width: 768px))": {
      "display": "none"
    }
  },
  sd5b2c253: {
    "pointerEvents": "auto"
  },
  sd5b893dc: {
    "pointerEvents": "none"
  },
  s335492: {
    "marginInline": "calc(0.25rem * 4)"
  },
  scdbaf625: {
    "width": "100%"
  },
  s15930a39: {
    "maxWidth": "24rem"
  },
  sfb96b386: {
    "borderRadius": "1rem"
  },
  sad8c742c: {
    "borderStyle": "solid",
    "borderWidth": "1px"
  },
  se230602: {
    "borderColor": "color-mix(in oklab, oklch(96.7% 0.003 264.542) 50%, transparent)"
  },
  sda12834a: {
    "backgroundColor": "color-mix(in oklab, #fff 95%, transparent)"
  },
  sc3182879: {
    "boxShadow": "var(--shadow-2xl)"
  },
  s8880a929: {
    "transitionProperty": "all",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  s8c909dba: {
    "transitionDuration": "300ms"
  },
  sd0f5e0ef: {
    "transitionTimingFunction": "cubic-bezier(0, 0, 0.2, 1)"
  },
  s486c2d2f: {
    "opacity": "100%"
  },
  s765a26ee: {
    "opacity": "0%"
  }
});
const styles_2 = stylex.create({
  sb76e9daa: {
    "display": "none"
  },
  sf46870aa: {
    "columnGap": "calc(0.25rem * 6)"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  s129e46b3: {
    "fontWeight": "500"
  },
  saf5baaad: {
    "color": "oklch(37.3% 0.034 259.733)"
  },
  s340d2bfc: {
    "@media ((min-width: 768px))": {
      "display": "flex"
    }
  },
  s993b6d55: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  s24c66c5d: {
    ":hover": {
      "@media (hover: hover)": {
        "color": "#000"
      }
    }
  },
  sdef3facc: {
    "position": "relative"
  },
  s3824ce: {
    "zIndex": "50"
  },
  s68b0d4ed: {
    "@media ((min-width: 768px))": {
      "display": "none"
    }
  },
  s5cee774: {
    "position": "fixed"
  },
  s74a79380: {
    "inset": "calc(0.25rem * 0)"
  },
  s199f26d6: {
    "backgroundColor": "color-mix(in oklab, #000 20%, transparent)"
  },
  s67010d77: {
    "position": "absolute"
  },
  s696c5bc: {
    "top": "calc(0.25rem * 4)"
  },
  s478fb0c3: {
    "right": "calc(0.25rem * 4)"
  },
  s775755af: {
    "borderRadius": "calc(infinity * 1px)"
  },
  s1aa15: {
    "padding": "calc(0.25rem * 2)"
  },
  saf5ba32b: {
    "color": "oklch(55.1% 0.027 264.364)"
  },
  sf7fb00e8: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  se64b6a99: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "color-mix(in oklab, oklch(96.7% 0.003 264.542) 50%, transparent)"
      }
    }
  },
  sd4a248ef: {
    ":hover": {
      "@media (hover: hover)": {
        "color": "oklch(37.3% 0.034 259.733)"
      }
    }
  },
  s171ec84d: {
    ":hover": {
      "@media (hover: hover)": {
        "color": "var(--brand-5)"
      }
    }
  },
  s597c48d: {
    "display": "block"
  },
  sf7998a14: {
    "borderRadius": "calc(var(--radius) + 4px)"
  },
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  s34b570: {
    "paddingBlock": "calc(0.25rem * 4)"
  },
  sab7cc794: {
    "fontSize": "1.25rem",
    "lineHeight": "var(--text-xl--line-height)"
  },
  sa16ea943: {
    "fontWeight": "700"
  },
  saf5bae6e: {
    "color": "oklch(27.8% 0.033 256.848)"
  },
  s8880a929: {
    "transitionProperty": "all",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  s8c9099f9: {
    "transitionDuration": "200ms"
  },
  sb5117f6f: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "color-mix(in oklab, oklch(98.5% 0.002 247.839) 50%, transparent)"
      }
    }
  }
});
const styles = stylex.create({
  s292fe16c: {
    position: 'fixed',
    top: 'calc(0.25rem * 0)',
    right: 'calc(0.25rem * 0)',
    left: 'calc(0.25rem * 0)',
    zIndex: '40',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
    backgroundColor: '#fff',
    paddingInline: 'calc(0.25rem * 8)',
    paddingBlock: 'calc(0.25rem * 4)',
    boxShadow: 'var(--shadow-sm)'
  },
  sac43974f: {
    display: 'flex',
    alignItems: 'center',
    columnGap: 'calc(0.25rem * 2)'
  },
  s873ca3db: {
    color: 'var(--brand-5)',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)'
  },
  sf90270c: {
    backgroundImage: 'linear-gradient(to right in oklab, var(--brand-5) 0%, var(--brand-6) 100%)',
    backgroundClip: 'text',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    color: 'transparent'
  },
  sfbb1eac7: {
    position: 'relative',
    padding: 'calc(0.25rem * 8)'
  },
  s4156227: {
    marginTop: 'calc(0.25rem * 4)',
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'calc(0.25rem * 1)'
  }
});
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);
  const navLinks = [{
    href: 'https://seed.hyper.media/resources',
    label: 'Resources'
  }, {
    href: 'https://seed.hyper.media/blog',
    label: 'Blog'
  }, {
    href: 'https://seed.hyper.media/team',
    label: 'Team'
  }, {
    href: 'https://seed.hyper.media/community',
    label: 'Support'
  }, {
    href: 'https://seedteamtalks.hyper.media/',
    label: 'Development'
  }];
  return <header className={stylex.props(styles.s292fe16c).className || ''}>
      <a href="/" className={stylex.props(styles.sac43974f).className || ''}>
        <SeedLogo className={stylex.props(styles.s873ca3db).className || ''} />
        <span className={stylex.props(styles.sf90270c).className || ''}>Seed Hypermedia</span>
      </a>

      {/* Desktop nav links */}
      <nav className={stylex.props(styles_2.sb76e9daa, styles_2.sf46870aa, styles_2.sab7cc6fa, styles_2.s129e46b3, styles_2.saf5baaad, styles_2.s340d2bfc).className || ""}>
        {navLinks.map(link => <a key={link.label} href={link.href} className={stylex.props(styles_2.s993b6d55, styles_2.s24c66c5d).className || ""}>
            {link.label}
          </a>)}
      </nav>

      {/* Mobile menu button */}
      <button className={stylex.props(styles_2.sdef3facc, styles_2.s3824ce, styles_2.saf5baaad, styles_2.s993b6d55, styles_2.s24c66c5d, styles_2.s68b0d4ed).className || ""} onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && <div className={stylex.props(styles_2.s5cee774, styles_2.s74a79380, styles_2.s3824ce, styles_2.s199f26d6, styles_2.s68b0d4ed).className || ""} onClick={closeMobileMenu} />}

      {/* Mobile menu */}
      <nav className={(stylex.props(styles_3.s5cee774, styles_3.s74a79380, styles_3.s3824ce, styles_3.s2ffff9, styles_3.sc6ed1702, styles_3.sce22ca32, styles_3.s68b0d4ed).className || "") + " " + (isMobileMenuOpen ? stylex.props(styles_3.sd5b2c253).className || "" : stylex.props(styles_3.sd5b893dc).className || "")} onClick={closeMobileMenu}>
        <div className={(stylex.props(styles_3.s335492, styles_3.scdbaf625, styles_3.s15930a39, styles_3.sfb96b386, styles_3.sad8c742c, styles_3.se230602, styles_3.sda12834a, styles_3.sc3182879, styles_3.s8880a929, styles_3.s8c909dba, styles_3.sd0f5e0ef).className || "") + " " + (isMobileMenuOpen ? stylex.props(styles_3.s486c2d2f).className || "" : stylex.props(styles_3.s765a26ee).className || "")} onClick={e => e.stopPropagation()}>
          <div className={stylex.props(styles.sfbb1eac7).className || ''}>
            {/* Close button */}
            <button onClick={closeMobileMenu} className={stylex.props(styles_2.s67010d77, styles_2.s696c5bc, styles_2.s478fb0c3, styles_2.s775755af, styles_2.s1aa15, styles_2.saf5ba32b, styles_2.sf7fb00e8, styles_2.se64b6a99, styles_2.sd4a248ef).className || ""} aria-label="Close menu">
              <X size={20} />
            </button>

            <div className={stylex.props(styles.s4156227).className || ''}>
              {navLinks.map(link => <a key={link.label} href={link.href} className={stylex.props(styles_2.s171ec84d, styles_2.s597c48d, styles_2.sf7998a14, styles_2.s34b1af, styles_2.s34b570, styles_2.sab7cc794, styles_2.sa16ea943, styles_2.saf5bae6e, styles_2.s8880a929, styles_2.s8c9099f9, styles_2.sb5117f6f).className || ""} onClick={closeMobileMenu}>
                  {link.label}
                </a>)}
            </div>
          </div>
        </div>
      </nav>
    </header>;
}