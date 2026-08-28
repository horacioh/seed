import * as stylex from '@stylexjs/stylex';
import communityVideo from '../../public/community.mp4';
const styles_2 = stylex.create({
  s5574c491: {
    "marginInline": "auto"
  },
  s2ffff9: {
    "display": "flex"
  },
  sb42244d4: {
    "height": "100%"
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
  sb54da876: {
    "gap": "calc(0.25rem * 10)"
  },
  s34b1b1: {
    "paddingInline": "calc(0.25rem * 6)"
  },
  sd174fc89: {
    "@media ((min-width: 768px))": {
      "flexDirection": "row"
    }
  },
  s15930976: {
    "maxWidth": "28rem"
  },
  sb42feb5d: {
    "flex": "1"
  },
  sb41ffff4: {
    "height": "auto"
  },
  s158c3129: {
    "maxHeight": "calc(0.25rem * 72)"
  },
  scdbaf625: {
    "width": "100%"
  },
  s7f1da3c9: {
    "@media ((min-width: 768px))": {
      "maxHeight": "calc(0.25rem * 80)"
    }
  },
  sc715448a: {
    "@media ((min-width: 1024px))": {
      "maxHeight": "calc(0.25rem * 96)"
    }
  }
});
const styles = stylex.create({
  sdce15e61: {
    width: '100%',
    paddingTop: 'calc(0.25rem * 5)',
    paddingBottom: 'calc(0.25rem * 20)',
    backgroundColor: '#fff'
  },
  sb2c27eb9: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)'
  },
  s6e5a092c: {
    marginTop: 'calc(0.25rem * 4)',
    color: 'oklch(37.3% 0.034 259.733)',
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)'
  },
  sf792c66c: {
    flex: '1',
    borderRadius: 'calc(var(--radius) + 4px)',
    overflow: 'hidden'
  }
});
export default function Community() {
  return <section className={stylex.props(styles.sdce15e61).className || ''}>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s2ffff9, styles_2.sb42244d4, styles_2.s9ccd55ea, styles_2.s67e351ac, styles_2.sc6ed1702, styles_2.sc1a629cb, styles_2.sb54da876, styles_2.s34b1b1, styles_2.sd174fc89).className || ""}>
        {/* Text Content */}
        <div className={stylex.props(styles_2.s15930976, styles_2.sb42feb5d).className || ""}>
          <h2 className={stylex.props(styles.sb2c27eb9).className || ''}>Community Preservation</h2>
          <p className={stylex.props(styles.s6e5a092c).className || ''}>
            Thanks to the local-first architecture, your knowledge is archived at your fingertips always there to search
            and retrieve.
          </p>
        </div>

        {/* Video */}
        <div className={stylex.props(styles.sf792c66c).className || ''}>
          <video src={communityVideo} autoPlay muted loop playsInline className={stylex.props(styles_2.sb41ffff4, styles_2.s158c3129, styles_2.scdbaf625, styles_2.s7f1da3c9, styles_2.sc715448a).className || ""} />
        </div>
      </div>
    </section>;
}