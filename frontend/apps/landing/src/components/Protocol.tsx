import * as stylex from '@stylexjs/stylex';
import { Github, Glasses } from 'lucide-react';
import protocolVideo from '../../public/protocol.mp4';
const styles_2 = stylex.create({
  scdbaf625: {
    "width": "100%"
  },
  s45ad8fea: {
    "backgroundColor": "#efefef"
  },
  s661f882: {
    "paddingBlock": "calc(0.25rem * 20)"
  },
  s5574c491: {
    "marginInline": "auto"
  },
  s2ffff9: {
    "display": "flex"
  },
  s9ccd55ea: {
    "maxWidth": "64rem"
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
  sb54da878: {
    "gap": "calc(0.25rem * 12)"
  },
  s34b1b1: {
    "paddingInline": "calc(0.25rem * 6)"
  },
  sd174fc89: {
    "@media ((min-width: 768px))": {
      "flexDirection": "row"
    }
  },
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
  },
  s5f845713: {
    "backgroundColor": "oklch(55.1% 0.027 264.364)"
  },
  s6f01a557: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(37.3% 0.034 259.733)"
      }
    }
  },
  sdef3facc: {
    "position": "relative"
  },
  sa5fc20b8: {
    "height": "300px"
  },
  s55fea1c7: {
    "width": "300px"
  },
  s92852dd5: {
    "overflow": "hidden"
  },
  s704dd734: {
    "@media ((min-width: 768px))": {
      "height": "400px"
    }
  },
  s20505843: {
    "@media ((min-width: 768px))": {
      "width": "400px"
    }
  },
  s67010d77: {
    "position": "absolute"
  },
  sbbfc415c: {
    "top": "50%"
  },
  s665a770e: {
    "left": "50%"
  },
  s71d45fa9: {
    "objectFit": "cover"
  }
});
const styles = stylex.create({
  sb42feb5d: {
    flex: '1'
  },
  s452fb49b: {
    marginBottom: 'calc(0.25rem * 6)',
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)'
  },
  s8ef9ce05: {
    marginBottom: 'calc(0.25rem * 4)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    color: 'oklch(27.8% 0.033 256.848)'
  },
  s235d0087: {
    marginBottom: 'calc(0.25rem * 6)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    color: 'oklch(27.8% 0.033 256.848)'
  },
  se658ac16: {
    display: 'flex',
    gap: 'calc(0.25rem * 4)'
  },
  s333e0a: {
    marginRight: 'calc(0.25rem * 2)'
  },
  sfd8432a0: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1'
  }
});
export default function Protocol() {
  return <section className={stylex.props(styles_2.scdbaf625, styles_2.s45ad8fea, styles_2.s661f882).className || ""}>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s2ffff9, styles_2.s9ccd55ea, styles_2.s67e351ac, styles_2.sc6ed1702, styles_2.sc1a629cb, styles_2.sb54da878, styles_2.s34b1b1, styles_2.sd174fc89).className || ""}>
        {/* Text Content */}
        <div className={stylex.props(styles.sb42feb5d).className || ''}>
          <h2 className={stylex.props(styles.s452fb49b).className || ''}>Open Protocol And Software</h2>
          <p className={stylex.props(styles.s8ef9ce05).className || ''}>
            Seed Hypermedia is designed in two parts. Seed is the Open Source software developed by our team, while
            Hypermedia is the open protocol that enhances the web to build trust and collaboration.
          </p>
          <p className={stylex.props(styles.s8ef9ce05).className || ''}>
            Because our desktop app and server are Open Source, developers can join our community to expand the product
            for their needs.
          </p>
          <p className={stylex.props(styles.s235d0087).className || ''}>
            Anyone can participate in the hypermedia protocol and extend it beyond the current capabilities.
          </p>
          <div className={stylex.props(styles.se658ac16).className || ''}>
            <a href="https://github.com/seed-hypermedia" target="_blank" rel="noopener noreferrer" className={stylex.props(styles_2.s767065e6, styles_2.s6eae3ee3, styles_2.s9b8736ad, styles_2.sc6ed1702, styles_2.sf79988b7, styles_2.s34b1b0, styles_2.s34b56e, styles_2.s2daecf89, styles_2.s993b6d55).className || ""}>
              <Github size={17} className={stylex.props(styles.s333e0a).className || ''} />
              GitHub
            </a>
            <a href="https://explore.hyper.media/" target="_blank" rel="noopener noreferrer" className={stylex.props(styles_2.s9b8736ad, styles_2.sc6ed1702, styles_2.sf79988b7, styles_2.s5f845713, styles_2.s34b1b0, styles_2.s34b56e, styles_2.s2daecf89, styles_2.s993b6d55, styles_2.s6f01a557).className || ""}>
              <Glasses size={17} className={stylex.props(styles.s333e0a).className || ''} />
              Protocol Explorer
            </a>
          </div>
        </div>

        {/* Animation Video */}
        <div className={stylex.props(styles.sfd8432a0).className || ''}>
          <div className={stylex.props(styles_2.sdef3facc, styles_2.sa5fc20b8, styles_2.s55fea1c7, styles_2.s92852dd5, styles_2.s704dd734, styles_2.s20505843).className || ""}>
            <video src={protocolVideo} autoPlay loop muted playsInline className={stylex.props(styles_2.s67010d77, styles_2.sbbfc415c, styles_2.s665a770e, styles_2.s71d45fa9).className || ""} />
          </div>
        </div>
      </div>
    </section>;
}