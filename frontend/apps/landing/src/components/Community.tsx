import * as stylex from '@stylexjs/stylex'
import communityVideo from '../../public/community.mp4'
const styles = stylex.create({
  sdce15e61: {
    width: '100%',
    paddingTop: 'calc(0.25rem * 5)',
    paddingBottom: 'calc(0.25rem * 20)',
    backgroundColor: '#fff',
  },
  sb2c27eb9: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)',
  },
  s6e5a092c: {
    marginTop: 'calc(0.25rem * 4)',
    color: 'oklch(37.3% 0.034 259.733)',
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
  },
  sf792c66c: {
    flex: '1',
    borderRadius: 'calc(var(--radius) + 4px)',
    overflow: 'hidden',
  },
})
export default function Community() {
  return (
    <section className={stylex.props(styles.sdce15e61).className || ''}>
      <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-between gap-10 px-6 md:flex-row">
        {/* Text Content */}
        <div className="max-w-md flex-1">
          <h2 className={stylex.props(styles.sb2c27eb9).className || ''}>Community Preservation</h2>
          <p className={stylex.props(styles.s6e5a092c).className || ''}>
            Thanks to the local-first architecture, your knowledge is archived at your fingertips always there to search
            and retrieve.
          </p>
        </div>

        {/* Video */}
        <div className={stylex.props(styles.sf792c66c).className || ''}>
          <video
            src={communityVideo}
            autoPlay
            muted
            loop
            playsInline
            className="h-auto max-h-72 w-full md:max-h-80 lg:max-h-96"
          />
        </div>
      </div>
    </section>
  )
}
