import * as stylex from '@stylexjs/stylex';
import collaboratorsImage from '../../public/collaborators.png';
import commentsImage from '../../public/comments.png';
const styles_2 = stylex.create({
  scdbaf625: {
    "width": "100%"
  },
  s1effce54: {
    "backgroundImage": "linear-gradient(to bottom, #54cd8533 0%, #54cd8500 33%)"
  },
  s661f882: {
    "paddingBlock": "calc(0.25rem * 20)"
  },
  s5574c491: {
    "marginInline": "auto"
  },
  s9ccd55ea: {
    "maxWidth": "64rem"
  },
  s34b1b1: {
    "paddingInline": "calc(0.25rem * 6)"
  },
  s33458e: {
    "marginTop": "calc(0.25rem * 4)"
  },
  s1593095a: {
    "maxWidth": "32rem"
  },
  saf5baaad: {
    "color": "oklch(37.3% 0.034 259.733)"
  },
  s2ffff9: {
    "display": "flex"
  },
  s67e351ac: {
    "flexDirection": "column"
  },
  sb54da878: {
    "gap": "calc(0.25rem * 12)"
  },
  sd174fc89: {
    "@media ((min-width: 768px))": {
      "flexDirection": "row"
    }
  },
  s33458c: {
    "marginTop": "calc(0.25rem * 2)"
  },
  s7e479bb9: {
    "minHeight": "56px"
  },
  s8a50eba0: {
    "maxWidth": "320px"
  },
  sa7b0f957: {
    "height": "400px"
  },
  s4dd0fc46: {
    "objectFit": "contain"
  },
  s67010d77: {
    "position": "absolute"
  },
  se911cb2c: {
    "insetBlock": "calc(0.25rem * 0)"
  },
  s665a770e: {
    "left": "50%"
  },
  sb76e9daa: {
    "display": "none"
  },
  s36cf1e: {
    "width": "1px"
  },
  s5f844bd0: {
    "backgroundColor": "oklch(92.8% 0.006 264.531)"
  },
  s4d6018ea: {
    "@media ((min-width: 768px))": {
      "display": "block"
    }
  }
});
const styles = stylex.create({
  s62d3d5d: {
    marginBottom: 'calc(0.25rem * 16)'
  },
  sb2c27eb9: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)'
  },
  sd6fa498c: {
    position: 'relative',
    paddingBottom: 'calc(0.25rem * 16)'
  },
  s603d8e4e: {
    width: '100%',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
    marginBottom: 'calc(0.25rem * 10)'
  },
  s5aa1ab3a: {
    flex: '1',
    paddingTop: 'calc(0.25rem * 6)',
    paddingRight: 'calc(0.25rem * 10)'
  },
  s8e852a7b: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)'
  },
  s5a9ef100: {
    flex: '1',
    paddingTop: 'calc(0.25rem * 6)',
    paddingLeft: 'calc(0.25rem * 10)'
  },
  sbf129a57: {
    width: '100%',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)'
  }
});
export default function Collaboration() {
  return <section className={stylex.props(styles_2.scdbaf625, styles_2.s1effce54, styles_2.s661f882).className || ""}>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s9ccd55ea, styles_2.s34b1b1).className || ""}>
        <div className={stylex.props(styles.s62d3d5d).className || ''}>
          <h2 className={stylex.props(styles.sb2c27eb9).className || ''}>Distributed Collaboration</h2>
          <p className={stylex.props(styles_2.s33458e, styles_2.s1593095a, styles_2.saf5baaad).className || ""}>
            Once you publish, build deep knowledge by sparking open discussions.
          </p>
        </div>

        <div className={stylex.props(styles.sd6fa498c).className || ''}>
          {/* Horizontal Separator */}
          <div className={stylex.props(styles.s603d8e4e).className || ''} />
          <div className={stylex.props(styles_2.s2ffff9, styles_2.s67e351ac, styles_2.sb54da878, styles_2.sd174fc89).className || ""}>
            {/* Column 1 */}
            <div className={stylex.props(styles.s5aa1ab3a).className || ''}>
              <h3 className={stylex.props(styles.s8e852a7b).className || ''}>Collaborative Documents</h3>
              <p className={stylex.props(styles_2.s33458c, styles_2.s7e479bb9, styles_2.s8a50eba0, styles_2.saf5baaad).className || ""}>
                Engage with your community by inviting readers and collaborators to your space.
              </p>
              <img src={collaboratorsImage} alt="Collaborative Documents" className={stylex.props(styles_2.s33458e, styles_2.sa7b0f957, styles_2.scdbaf625, styles_2.s4dd0fc46).className || ""} />
            </div>

            {/* Vertical Divider */}
            <div className={stylex.props(styles_2.s67010d77, styles_2.se911cb2c, styles_2.s665a770e, styles_2.sb76e9daa, styles_2.s36cf1e, styles_2.s5f844bd0, styles_2.s4d6018ea).className || ""} />

            {/* Column 2 */}
            <div className={stylex.props(styles.s5a9ef100).className || ''}>
              <h3 className={stylex.props(styles.s8e852a7b).className || ''}>Open Discussions</h3>
              <p className={stylex.props(styles_2.s33458c, styles_2.s7e479bb9, styles_2.s8a50eba0, styles_2.saf5baaad).className || ""}>
                Connect directly peer-to-peer, with no centralized control.
              </p>
              <img src={commentsImage} alt="Open Discussions" className={stylex.props(styles_2.s33458e, styles_2.sa7b0f957, styles_2.scdbaf625, styles_2.s4dd0fc46).className || ""} />
            </div>
          </div>
        </div>
        {/* Horizontal Separator */}
        <div className={stylex.props(styles.sbf129a57).className || ''} />
      </div>
    </section>;
}