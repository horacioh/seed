import * as stylex from '@stylexjs/stylex'
import publishingDemoVideo from '../../public/publishing-demo.mp4'
const styles = stylex.create({
  s224c061c: {
    marginTop: 'calc(0.25rem * 4)',
    color: 'oklch(44.6% 0.03 256.802)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    textAlign: 'left',
  },
  s9fcf4984: {
    backgroundColor: 'var(--brand-5)',
    color: '#fff',
    padding: 'calc(0.25rem * 6)',
    borderRadius: 'calc(var(--radius) + 4px)',
    textAlign: 'left',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-md)',
  },
  sce0ec42f: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
    marginBottom: 'calc(0.25rem * 3)',
  },
  sd8e10478: {
    marginTop: 'calc(0.25rem * 16)',
    width: '100%',
    marginInline: 'auto',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-md)',
  },
  se2972e4f: {
    width: '100%',
    height: 'auto',
  },
})
export default function Publishing() {
  return (
    <section className="w-full bg-[linear-gradient(to_bottom,_#038e7a1a_0%,_#038e7a00_33%)] px-4 py-20 text-center">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-left text-3xl font-bold text-gray-900 md:text-4xl">Your Publications With No Barriers</h2>
        <p className={stylex.props(styles.s224c061c).className || ''}>
          Publish your content freely and effortlessly — no barriers, no limits.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          {[
            {
              title: 'Quick & Easy Publishing',
              points: ['No coding required.', 'No gatekeepers.', 'No hassle.'],
            },
            {
              title: 'Publish Freely, Without Censorship',
              points: ['All you need is a computer.', 'Share your ideas, stories, and creations without restrictions.'],
            },
            {
              title: 'Portable & Shareable',
              points: [
                'Publish directly to your own domain or hyper.media.',
                'Instantly share your work with friends, followers, and the world.',
              ],
            },
          ].map((card, i) => (
            <div key={i} className={stylex.props(styles.s9fcf4984).className || ''}>
              <h3 className={stylex.props(styles.sce0ec42f).className || ''}>{card.title}</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {card.points.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Demo Video */}
        <div className={stylex.props(styles.sd8e10478).className || ''}>
          <video
            src={publishingDemoVideo}
            autoPlay
            muted
            loop
            playsInline
            className={stylex.props(styles.se2972e4f).className || ''}
          />
        </div>
      </div>
    </section>
  )
}
