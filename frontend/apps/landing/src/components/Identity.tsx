import * as stylex from '@stylexjs/stylex';
import checkImage from '../../public/check.png';
import encryptionVideo from '../../public/encryption.mp4';
import keyImage from '../../public/key.png';
const styles_2 = stylex.create({
  scdbaf625: {
    "width": "100%"
  },
  s77374c33: {
    "backgroundColor": "#fdfdfd"
  },
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  s661f867: {
    "paddingBlock": "calc(0.25rem * 14)"
  },
  s3411ddb6: {
    "@media ((min-width: 768px))": {
      "paddingInline": "calc(0.25rem * 8)"
    }
  },
  s4e2a4cdf: {
    "@media ((min-width: 768px))": {
      "paddingBlock": "calc(0.25rem * 20)"
    }
  },
  s5574c491: {
    "marginInline": "auto"
  },
  s9ccd55ea: {
    "maxWidth": "64rem"
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
  sb54da876: {
    "gap": "calc(0.25rem * 10)"
  },
  sd174fc89: {
    "@media ((min-width: 768px))": {
      "flexDirection": "row"
    }
  },
  s334592: {
    "marginTop": "calc(0.25rem * 8)"
  },
  sb42feb5d: {
    "flex": "1"
  },
  s760cfea1: {
    "alignSelf": "flex-start"
  },
  s4454b493: {
    "@media ((min-width: 768px))": {
      "alignSelf": "center"
    }
  },
  s3301f9: {
    "marginBottom": "calc(0.25rem * 1)"
  },
  s158c3090: {
    "maxHeight": "calc(0.25rem * 24)"
  },
  s15930221: {
    "maxWidth": "calc(0.25rem * 24)"
  },
  s873bc768: {
    "maxWidth": "180px"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  saf5ba6ec: {
    "color": "oklch(44.6% 0.03 256.802)"
  },
  s88c65984: {
    "maxWidth": "250px"
  },
  s637b1e6: {
    "marginBlock": "calc(0.25rem * 16)"
  },
  s7c401f13: {
    "borderTopStyle": "solid",
    "borderTopWidth": "1px"
  },
  s2a40d7c9: {
    "borderColor": "oklch(92.8% 0.006 264.531)"
  },
  s65e234f5: {
    "textAlign": "center"
  },
  sc41b2606: {
    "fontSize": "1.5rem",
    "lineHeight": "var(--text-2xl--line-height)"
  },
  s62c182b1: {
    "fontWeight": "600"
  },
  saf5bb22f: {
    "color": "oklch(21% 0.034 264.665)"
  },
  s2dac9c4a: {
    "@media ((min-width: 768px))": {
      "fontSize": "1.875rem",
      "lineHeight": "var(--text-3xl--line-height)"
    }
  },
  s9ccd4e68: {
    "maxWidth": "48rem"
  },
  sf7998a14: {
    "borderRadius": "calc(var(--radius) + 4px)"
  },
  s4dd0fc46: {
    "objectFit": "contain"
  }
});
const styles = stylex.create({
  sec138f7a: {
    fontSize: '2.25rem',
    lineHeight: 'calc(2.5 / 2.25)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)'
  },
  s1160539b: {
    marginTop: 'calc(0.25rem * 4)',
    color: 'oklch(37.3% 0.034 259.733)'
  },
  s56a28899: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    flex: '1'
  },
  s5da97f19: {
    marginTop: 'calc(0.25rem * 2)',
    color: 'oklch(37.3% 0.034 259.733)'
  },
  s6356c05: {
    marginTop: 'calc(0.25rem * 10)'
  }
});
export default function Identity() {
  return <section className={stylex.props(styles_2.scdbaf625, styles_2.s77374c33, styles_2.s34b1af, styles_2.s661f867, styles_2.s3411ddb6, styles_2.s4e2a4cdf).className || ""}>
      {/* Own Your Identity Block */}
      <div className={stylex.props(styles_2.s5574c491, styles_2.s9ccd55ea).className || ""}>
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center max-w-3/4"> */}
        <div className={stylex.props(styles_2.s5574c491, styles_2.s2ffff9, styles_2.s9ccd55ea, styles_2.s67e351ac, styles_2.sc6ed1702, styles_2.sb54da876, styles_2.sd174fc89).className || ""}>
          <div className={stylex.props(styles_2.s334592, styles_2.sb42feb5d, styles_2.s760cfea1, styles_2.s4454b493).className || ""}>
            <h2 className={stylex.props(styles.sec138f7a).className || ''}>Own Your Identity</h2>
            <p className={stylex.props(styles.s1160539b).className || ''}>
              Control your credentials—secure, decentralized, and independent of central authorities.
            </p>
          </div>

          <div className={stylex.props(styles.s56a28899).className || ''}>
            <img src={keyImage} alt="Crypto sign" className={stylex.props(styles_2.s3301f9, styles_2.s158c3090, styles_2.s15930221).className || ""} />
            <p className={stylex.props(styles_2.s873bc768, styles_2.sab7cc6fa, styles_2.saf5ba6ec).className || ""}>
              Content is cryptographically signed, so anyone can verify authenticity.
            </p>
          </div>

          <div className={stylex.props(styles.s56a28899).className || ''}>
            <img src={checkImage} alt="ID check" className={stylex.props(styles_2.s3301f9, styles_2.s158c3090, styles_2.s15930221).className || ""} />
            <p className={stylex.props(styles_2.s88c65984, styles_2.sab7cc6fa, styles_2.saf5ba6ec).className || ""}>
              Your identity is validated with your social graph and domain names, forming a robust web of trust.
            </p>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className={stylex.props(styles_2.s5574c491, styles_2.s637b1e6, styles_2.scdbaf625, styles_2.s9ccd55ea, styles_2.s7c401f13, styles_2.s2a40d7c9).className || ""} />

      {/* Signed Versions Block */}
      <div className={stylex.props(styles_2.s5574c491, styles_2.s9ccd55ea, styles_2.s65e234f5).className || ""}>
        <h3 className={stylex.props(styles_2.sc41b2606, styles_2.s62c182b1, styles_2.saf5bb22f, styles_2.s2dac9c4a).className || ""}>Signed Versions</h3>
        <p className={stylex.props(styles.s1160539b).className || ''}>
          Each change is cryptographically signed by the author. Leveraging the power of IPFS and CRDTs, each immutable
          version may be accurately referenced.
        </p>
        <p className={stylex.props(styles.s5da97f19).className || ''}>
          By delivering permanence, attribution, and versioning to the web, you can preserve the history of your
          community's knowledge.
        </p>

        {/* Video */}
        <div className={stylex.props(styles.s6356c05).className || ''}>
          <video src={encryptionVideo} autoPlay muted loop playsInline className={stylex.props(styles_2.s5574c491, styles_2.scdbaf625, styles_2.s9ccd4e68, styles_2.sf7998a14, styles_2.s4dd0fc46).className || ""} />
        </div>
      </div>
    </section>;
}