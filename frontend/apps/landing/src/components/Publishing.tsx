import * as stylex from '@stylexjs/stylex';
import publishingDemoVideo from '../../public/publishing-demo.mp4';
const styles_2 = stylex.create({
  scdbaf625: {
    "width": "100%"
  },
  sdaedf7fe: {
    "backgroundImage": "linear-gradient(to bottom, #038e7a1a 0%, #038e7a00 33%)"
  },
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  s661f882: {
    "paddingBlock": "calc(0.25rem * 20)"
  },
  s65e234f5: {
    "textAlign": "center"
  },
  s5574c491: {
    "marginInline": "auto"
  },
  s9ccd55ea: {
    "maxWidth": "64rem"
  },
  sbf63b0a7: {
    "textAlign": "left"
  },
  sc41b29c7: {
    "fontSize": "1.875rem",
    "lineHeight": "var(--text-3xl--line-height)"
  },
  sa16ea943: {
    "fontWeight": "700"
  },
  saf5bb22f: {
    "color": "oklch(21% 0.034 264.665)"
  },
  s2daca00b: {
    "@media ((min-width: 768px))": {
      "fontSize": "2.25rem",
      "lineHeight": "var(--text-4xl--line-height)"
    }
  },
  s6356c07: {
    "marginTop": "calc(0.25rem * 12)"
  },
  s308b46: {
    "display": "grid"
  },
  s5d936ff: {
    "gap": "calc(0.25rem * 6)"
  },
  sd321571e: {
    "@media ((min-width: 640px))": {
      "gridTemplateColumns": "repeat(1, minmax(0, 1fr))"
    }
  },
  s255362dd: {
    "@media ((min-width: 768px))": {
      "gridTemplateColumns": "repeat(3, minmax(0, 1fr))"
    }
  },
  sb54a3c0b: {
    "listStylePosition": "inside"
  },
  sb4423164: {
    "listStyleType": "disc"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  }
});
const styles = stylex.create({
  s224c061c: {
    marginTop: 'calc(0.25rem * 4)',
    color: 'oklch(44.6% 0.03 256.802)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    textAlign: 'left'
  },
  s9fcf4984: {
    backgroundColor: 'var(--brand-5)',
    color: '#fff',
    padding: 'calc(0.25rem * 6)',
    borderRadius: 'calc(var(--radius) + 4px)',
    textAlign: 'left',
    boxShadow: 'var(--shadow-md)'
  },
  sce0ec42f: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
    marginBottom: 'calc(0.25rem * 3)'
  },
  sd8e10478: {
    marginTop: 'calc(0.25rem * 16)',
    width: '100%',
    marginInline: 'auto',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    boxShadow: 'var(--shadow-md)'
  },
  se2972e4f: {
    width: '100%',
    height: 'auto'
  }
});
export default function Publishing() {
  return <section className={stylex.props(styles_2.scdbaf625, styles_2.sdaedf7fe, styles_2.s34b1af, styles_2.s661f882, styles_2.s65e234f5).className || ""}>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s9ccd55ea).className || ""}>
        <h2 className={stylex.props(styles_2.sbf63b0a7, styles_2.sc41b29c7, styles_2.sa16ea943, styles_2.saf5bb22f, styles_2.s2daca00b).className || ""}>Your Publications With No Barriers</h2>
        <p className={stylex.props(styles.s224c061c).className || ''}>
          Publish your content freely and effortlessly — no barriers, no limits.
        </p>

        <div className={stylex.props(styles_2.s6356c07, styles_2.s308b46, styles_2.s5d936ff, styles_2.sd321571e, styles_2.s255362dd).className || ""}>
          {[{
          title: 'Quick & Easy Publishing',
          points: ['No coding required.', 'No gatekeepers.', 'No hassle.']
        }, {
          title: 'Publish Freely, Without Censorship',
          points: ['All you need is a computer.', 'Share your ideas, stories, and creations without restrictions.']
        }, {
          title: 'Portable & Shareable',
          points: ['Publish directly to your own domain or hyper.media.', 'Instantly share your work with friends, followers, and the world.']
        }].map((card, i) => <div key={i} className={stylex.props(styles.s9fcf4984).className || ''}>
              <h3 className={stylex.props(styles.sce0ec42f).className || ''}>{card.title}</h3>
              <ul className={stylex.props(styles_2.sb54a3c0b, styles_2.sb4423164, styles_2.sab7cc6fa).className || ""}>
                {card.points.map((pt, idx) => <li key={idx}>{pt}</li>)}
              </ul>
            </div>)}
        </div>

        {/* Demo Video */}
        <div className={stylex.props(styles.sd8e10478).className || ''}>
          <video src={publishingDemoVideo} autoPlay muted loop playsInline className={stylex.props(styles.se2972e4f).className || ''} />
        </div>
      </div>
    </section>;
}