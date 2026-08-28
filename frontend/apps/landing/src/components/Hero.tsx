import * as stylex from '@stylexjs/stylex';
import { Download } from 'lucide-react';
import appDemoVideo from '../../public/app-demo.mp4';
import DiscordIcon from '../assets/DiscordIcon';
const styles_3 = stylex.create({
  s767065e6: {
    "backgroundColor": "var(--brand-4)"
  },
  s6eae3ee3: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "var(--brand-3)"
      }
    }
  },
  s9b8736ad: {
    "display": "inline-flex"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sf79988b7: {
    "borderRadius": "calc(var(--radius) - 2px)"
  },
  s34b1b0: {
    "paddingInline": "calc(0.25rem * 5)"
  },
  s34b56e: {
    "paddingBlock": "calc(0.25rem * 2)"
  },
  s2daecf89: {
    "color": "#fff"
  },
  s993b6d55: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  }
});
const styles_2 = stylex.create({
  s5574c491: {
    "marginInline": "auto"
  },
  s62d3d59: {
    "marginBottom": "calc(0.25rem * 12)"
  },
  s9ccd5229: {
    "maxWidth": "56rem"
  },
  sc41b29c7: {
    "fontSize": "1.875rem",
    "lineHeight": "var(--text-3xl--line-height)"
  },
  s8e879397: {
    "lineHeight": "1.25"
  },
  sa16ea943: {
    "fontWeight": "700"
  },
  saf5bb22f: {
    "color": "oklch(21% 0.034 264.665)"
  },
  s2daca3cc: {
    "@media ((min-width: 768px))": {
      "fontSize": "3rem",
      "lineHeight": "var(--text-5xl--line-height)"
    }
  },
  s33458f: {
    "marginTop": "calc(0.25rem * 5)"
  },
  s3301fd: {
    "marginBottom": "calc(0.25rem * 5)"
  },
  s9ccd4aa7: {
    "maxWidth": "42rem"
  },
  s34a2aa: {
    "paddingTop": "calc(0.25rem * 3)"
  },
  sab7cc794: {
    "fontSize": "1.25rem",
    "lineHeight": "var(--text-xl--line-height)"
  },
  saf5baaad: {
    "color": "oklch(37.3% 0.034 259.733)"
  },
  s9b8736ad: {
    "display": "inline-flex"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sf79988b7: {
    "borderRadius": "calc(var(--radius) - 2px)"
  },
  s5f845713: {
    "backgroundColor": "oklch(55.1% 0.027 264.364)"
  },
  s34b1b0: {
    "paddingInline": "calc(0.25rem * 5)"
  },
  s34b56e: {
    "paddingBlock": "calc(0.25rem * 2)"
  },
  s2daecf89: {
    "color": "#fff"
  },
  s993b6d55: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  s6f01a557: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(37.3% 0.034 259.733)"
      }
    }
  },
  s9ccd55ea: {
    "maxWidth": "64rem"
  },
  s92852dd5: {
    "overflow": "hidden"
  },
  sf7998a14: {
    "borderRadius": "calc(var(--radius) + 4px)"
  },
  s8a6c2948: {
    "boxShadow": "var(--shadow-lg)"
  }
});
const styles = stylex.create({
  s2c9185d9: {
    width: '100%',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 16)',
    textAlign: 'center',
    backgroundColor: '#fff'
  },
  s36f336cf: {
    color: 'var(--brand-5)'
  },
  s4c15bd56: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 4)'
  },
  s333e0a: {
    marginRight: 'calc(0.25rem * 2)'
  },
  sf30d30a9: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    marginRight: 'calc(0.25rem * 2)',
    color: '#fff'
  },
  s8eb76bf5: {
    objectFit: 'contain',
    width: '100%',
    height: 'auto'
  }
});
export default function Hero() {
  return <section className={stylex.props(styles.s2c9185d9).className || ''}>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s62d3d59, styles_2.s9ccd5229).className || ""}>
        <h1 className={stylex.props(styles_2.sc41b29c7, styles_2.s8e879397, styles_2.sa16ea943, styles_2.saf5bb22f, styles_2.s2daca3cc).className || ""}>
          Humanity Deserves A <span className={stylex.props(styles.s36f336cf).className || ''}>Better Medium</span>{' '}
          <br />
          For <span className={stylex.props(styles.s36f336cf).className || ''}>Thinking</span> And{' '}
          <span className={stylex.props(styles.s36f336cf).className || ''}>Communication</span>
        </h1>
        <p className={stylex.props(styles_2.s5574c491, styles_2.s33458f, styles_2.s3301fd, styles_2.s9ccd4aa7, styles_2.s34a2aa, styles_2.sab7cc794, styles_2.saf5baaad).className || ""}>
          Your website should be a dynamic space for ideas, projects, and community building.
        </p>
        <div className={stylex.props(styles.s4c15bd56).className || ''}>
          <a href="https://seed.hyper.media/hm/download" target="_blank" className={stylex.props(styles_3.s767065e6, styles_3.s6eae3ee3, styles_3.s9b8736ad, styles_3.sc6ed1702, styles_3.sf79988b7, styles_3.s34b1b0, styles_3.s34b56e, styles_3.s2daecf89, styles_3.s993b6d55).className || ""}>
            <Download size={17} className={stylex.props(styles.s333e0a).className || ''} />
            Download the Seed App
          </a>
          <a href="https://discord.gg/mcUnKENdKX" target="_blank" className={stylex.props(styles_2.s9b8736ad, styles_2.sc6ed1702, styles_2.sf79988b7, styles_2.s5f845713, styles_2.s34b1b0, styles_2.s34b56e, styles_2.s2daecf89, styles_2.s993b6d55, styles_2.s6f01a557).className || ""}>
            <DiscordIcon className={stylex.props(styles.sf30d30a9).className || ''} />
            Join Community Discord
          </a>
        </div>
      </div>

      <div className={stylex.props(styles_2.s5574c491, styles_2.s9ccd55ea, styles_2.s92852dd5, styles_2.sf7998a14, styles_2.s8a6c2948).className || ""}>
        <video src={appDemoVideo} autoPlay muted loop playsInline className={stylex.props(styles.s8eb76bf5).className || ''} />
      </div>
    </section>;
}