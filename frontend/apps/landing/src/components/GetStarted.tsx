import * as stylex from '@stylexjs/stylex';
import { Download } from 'lucide-react';
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
  s9ccd59ab: {
    "maxWidth": "72rem"
  },
  s34b1b1: {
    "paddingInline": "calc(0.25rem * 6)"
  },
  s62d3d59: {
    "marginBottom": "calc(0.25rem * 12)"
  },
  s2ffff9: {
    "display": "flex"
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
  s5d936fd: {
    "gap": "calc(0.25rem * 4)"
  },
  sd174fc89: {
    "@media ((min-width: 768px))": {
      "flexDirection": "row"
    }
  },
  scdbaf625: {
    "width": "100%"
  },
  sbf63b0a7: {
    "textAlign": "left"
  },
  sc41b2606: {
    "fontSize": "1.5rem",
    "lineHeight": "var(--text-2xl--line-height)"
  },
  sa16ea943: {
    "fontWeight": "700"
  },
  saf5bb22f: {
    "color": "oklch(21% 0.034 264.665)"
  },
  s7efae888: {
    "@media ((min-width: 768px))": {
      "width": "auto"
    }
  },
  s2dac9c4a: {
    "@media ((min-width: 768px))": {
      "fontSize": "1.875rem",
      "lineHeight": "var(--text-3xl--line-height)"
    }
  }
});
const styles = stylex.create({
  s7a47e1da: {
    width: '100%',
    paddingBlock: 'calc(0.25rem * 20)',
    backgroundColor: '#fff'
  },
  s333e0a: {
    marginRight: 'calc(0.25rem * 2)'
  }
});
export default function GetStarted() {
  return <section className={stylex.props(styles.s7a47e1da).className || ''}>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s9ccd59ab, styles_2.s34b1b1).className || ""}>
        {/* Heading and button */}
        <div className={stylex.props(styles_2.s62d3d59, styles_2.s2ffff9, styles_2.s67e351ac, styles_2.sc6ed1702, styles_2.sc1a629cb, styles_2.s5d936fd, styles_2.sd174fc89).className || ""}>
          <h2 className={stylex.props(styles_2.scdbaf625, styles_2.sbf63b0a7, styles_2.sc41b2606, styles_2.sa16ea943, styles_2.saf5bb22f, styles_2.s7efae888, styles_2.s2dac9c4a).className || ""}>
            It's Time To Get Started!
          </h2>
          <a href="https://seed.hyper.media/hm/download" target="_blank" className={stylex.props(styles_3.s767065e6, styles_3.s6eae3ee3, styles_3.s9b8736ad, styles_3.sc6ed1702, styles_3.sf79988b7, styles_3.s34b1b0, styles_3.s34b56e, styles_3.s2daecf89, styles_3.s993b6d55).className || ""}>
            <Download size={17} className={stylex.props(styles.s333e0a).className || ''} />
            Download the Seed App
          </a>
        </div>

        {/* <ResourceCards /> */}
      </div>
    </section>;
}
