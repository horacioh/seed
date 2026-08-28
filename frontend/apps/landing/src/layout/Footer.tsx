import * as stylex from '@stylexjs/stylex';
import BlueskyIcon from '../assets/BlueskyIcon';
import DiscordIcon from '../assets/DiscordIcon';
import GithubIcon from '../assets/GithubIcon';
import LinkedInIcon from '../assets/LinkedInIcon';
import SeedLogo from '../assets/SeedLogo';
import XIcon from '../assets/XIcon';
const styles_2 = stylex.create({
  s5574c491: {
    "marginInline": "auto"
  },
  s2ffff9: {
    "display": "flex"
  },
  s9ccd5d6c: {
    "maxWidth": "80rem"
  },
  s67e351ac: {
    "flexDirection": "column"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sc1a629cb: {
    "justifyContent": "space-between"
  },
  s5d936ff: {
    "gap": "calc(0.25rem * 6)"
  },
  sd174fc89: {
    "@media ((min-width: 768px))": {
      "flexDirection": "row"
    }
  },
  scdbaf625: {
    "width": "100%"
  },
  s93b5f015: {
    "alignItems": "flex-start"
  },
  s65e234f5: {
    "textAlign": "center"
  },
  saf5b9f6a: {
    "color": "oklch(70.7% 0.022 261.325)"
  },
  s7efae888: {
    "@media ((min-width: 768px))": {
      "width": "auto"
    }
  },
  sa892cab2: {
    "@media ((min-width: 768px))": {
      "alignItems": "flex-start"
    }
  },
  s88008e84: {
    "@media ((min-width: 768px))": {
      "textAlign": "left"
    }
  },
  sce22ca32: {
    "justifyContent": "center"
  },
  s5d936fb: {
    "gap": "calc(0.25rem * 2)"
  },
  sb375be42: {
    "@media ((min-width: 768px))": {
      "justifyContent": "flex-start"
    }
  },
  s33458b: {
    "marginTop": "calc(0.25rem * 1)"
  },
  sab7cc79b: {
    "fontSize": "0.75rem",
    "lineHeight": "var(--text-xs--line-height)"
  },
  s24c66c5d: {
    ":hover": {
      "@media (hover: hover)": {
        "color": "#000"
      }
    }
  }
});
const styles = stylex.create({
  s78416c1f: {
    width: '100%',
    backgroundColor: '#fff',
    paddingBlock: 'calc(0.25rem * 6)',
    paddingInline: 'calc(0.25rem * 4)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(44.6% 0.03 256.802)'
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)'
  },
  sdb7095a0: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '400'
  },
  sfe5bccc5: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    color: 'oklch(70.7% 0.022 261.325)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)'
  },
  sf9b363c3: {
    display: 'flex',
    gap: 'calc(0.25rem * 4)',
    marginBottom: 'calc(0.25rem * 1)'
  },
  sca3de96a: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)'
  }
});
export default function Footer() {
  return <footer className={stylex.props(styles.s78416c1f).className || ''}>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s2ffff9, styles_2.s9ccd5d6c, styles_2.s67e351ac, styles_2.sc6ed1702, styles_2.sc1a629cb, styles_2.s5d936ff, styles_2.sd174fc89).className || ""}>
        {/* Logo + Text + Copyright */}
        <div className={stylex.props(styles_2.s2ffff9, styles_2.scdbaf625, styles_2.s67e351ac, styles_2.s93b5f015, styles_2.s65e234f5, styles_2.saf5b9f6a, styles_2.s7efae888, styles_2.sa892cab2, styles_2.s88008e84).className || ""}>
          <div className={stylex.props(styles_2.s2ffff9, styles_2.scdbaf625, styles_2.sc6ed1702, styles_2.sce22ca32, styles_2.s5d936fb, styles_2.sb375be42).className || ""}>
            <SeedLogo className={stylex.props(styles.sca3de969).className || ''} />
            <span className={stylex.props(styles.sdb7095a0).className || ''}>Seed Hypermedia</span>
          </div>
          <p className={stylex.props(styles_2.s33458b, styles_2.scdbaf625, styles_2.sab7cc79b, styles_2.s7efae888).className || ""}>
            seed.hyper.media {new Date().getFullYear()} © All rights reserved
          </p>
        </div>

        {/* Socials + Terms */}
        <div className={stylex.props(styles.sfe5bccc5).className || ''}>
          <div className={stylex.props(styles.sf9b363c3).className || ''}>
            <a href="https://github.com/seed-hypermedia" target="_blank" rel="noopener noreferrer" className={stylex.props(styles_2.s24c66c5d).className || ""}>
              <GithubIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
            <a href="https://discord.gg/mcUnKENdKX" target="_blank" rel="noopener noreferrer" className={stylex.props(styles_2.s24c66c5d).className || ""}>
              <DiscordIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
            <a href="https://linkedin.com/company/seed-hypermedia" target="_blank" rel="noopener noreferrer" className={stylex.props(styles_2.s24c66c5d).className || ""}>
              <LinkedInIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
            <a href="https://x.com/seedhypermedia" target="_blank" rel="noopener noreferrer" className={stylex.props(styles_2.s24c66c5d).className || ""}>
              <XIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
            <a href="https://bsky.app/profile/seed.hyper.media" target="_blank" rel="noopener noreferrer" className={stylex.props(styles_2.s24c66c5d).className || ""}>
              <BlueskyIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
          </div>
          {/* <a href="/terms" className="text-xs hover:underline">
            Terms and Conditions
           </a> */}
        </div>
      </div>
    </footer>;
}