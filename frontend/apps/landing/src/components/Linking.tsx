import * as stylex from '@stylexjs/stylex';
import embedsVideo from '../../public/embeds.mp4';
import linkingImage from '../../public/linking.png';
import referencingImage from '../../public/referencing.png';
const styles_2 = stylex.create({
  scdbaf625: {
    "width": "100%"
  },
  s53b46f15: {
    "backgroundImage": "linear-gradient(to bottom, #e5f4ee 0%, #fefefe 33%)"
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
  s15930a39: {
    "maxWidth": "24rem"
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
  },
  s33458f: {
    "marginTop": "calc(0.25rem * 5)"
  },
  s15930ad3: {
    "maxWidth": "36rem"
  }
});
const styles = stylex.create({
  s70d8a8a4: {
    textAlign: 'left',
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
  sf7ec12d7: {
    marginTop: 'calc(0.25rem * 4)',
    width: '100%',
    height: 'auto',
    borderRadius: 'calc(var(--radius) + 4px)'
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
  },
  s70e0d74c: {
    textAlign: 'left',
    marginTop: 'calc(0.25rem * 10)'
  },
  s552e9427: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)'
  },
  sd49d8760: {
    marginTop: 'calc(0.25rem * 6)',
    overflow: 'hidden',
    width: '100%'
  },
  s17a8ce37: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain'
  }
});
export default function Linking() {
  return <section className={stylex.props(styles_2.scdbaf625, styles_2.s53b46f15, styles_2.s661f882).className || ""}>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s9ccd55ea, styles_2.s34b1b1).className || ""}>
        {/* Heading */}
        <div className={stylex.props(styles.s70d8a8a4).className || ''}>
          <h2 className={stylex.props(styles.sb2c27eb9).className || ''}>Powerful Links And Embeds</h2>
          <p className={stylex.props(styles_2.s33458e, styles_2.s1593095a, styles_2.saf5baaad).className || ""}>
            Unlock the full potential of your content with advanced linking and embedding features.
          </p>
        </div>

        <div className={stylex.props(styles.sd6fa498c).className || ''}>
          {/* Horizontal Separator */}
          <div className={stylex.props(styles.s603d8e4e).className || ''} />
          <div className={stylex.props(styles_2.s2ffff9, styles_2.s67e351ac, styles_2.sb54da878, styles_2.sd174fc89).className || ""}>
            {/* Column 1 */}
            <div className={stylex.props(styles.s5aa1ab3a).className || ''}>
              <h3 className={stylex.props(styles.s8e852a7b).className || ''}>Precise Linking</h3>
              <p className={stylex.props(styles_2.s33458c, styles_2.s15930a39, styles_2.saf5baaad).className || ""}>
                Build precise knowledge structures by linking directly to specific sections, paragraphs, or even
                individual words.
              </p>
              <img src={linkingImage} alt="Precise Linking" className={stylex.props(styles.sf7ec12d7).className || ''} />
            </div>

            {/* Vertical Divider */}
            <div className={stylex.props(styles_2.s67010d77, styles_2.se911cb2c, styles_2.s665a770e, styles_2.sb76e9daa, styles_2.s36cf1e, styles_2.s5f844bd0, styles_2.s4d6018ea).className || ""} />

            {/* Column 2 */}
            <div className={stylex.props(styles.s5a9ef100).className || ''}>
              <h3 className={stylex.props(styles.s8e852a7b).className || ''}>Bi-Directional References</h3>
              <p className={stylex.props(styles_2.s33458c, styles_2.s15930a39, styles_2.saf5baaad).className || ""}>
                All references are bi-directional, allowing you to explore other perspectives by tracking links back to
                your content.
              </p>
              <img src={referencingImage} alt="References" className={stylex.props(styles.sf7ec12d7).className || ''} />
            </div>
          </div>
        </div>

        {/* Horizontal Separator */}
        <div className={stylex.props(styles.sbf129a57).className || ''} />

        {/* Bottom Video Block */}
        <div className={stylex.props(styles.s70e0d74c).className || ''}>
          <h3 className={stylex.props(styles.s552e9427).className || ''}>Seamless Embeds</h3>
          <p className={stylex.props(styles_2.s33458f, styles_2.s15930ad3, styles_2.saf5baaad).className || ""}>
            Embed external content into your space while preserving proper attribution, keeping your resources organized
            and accessible.
          </p>
          <div className={stylex.props(styles.sd49d8760).className || ''}>
            <video src={embedsVideo} autoPlay muted loop playsInline className={stylex.props(styles.s17a8ce37).className || ''} />
          </div>
        </div>
      </div>
    </section>;
}