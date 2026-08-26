import * as stylex from '@stylexjs/stylex'
import embedsVideo from '../../public/embeds.mp4'
import linkingImage from '../../public/linking.png'
import referencingImage from '../../public/referencing.png'
const styles = stylex.create({
  s70d8a8a4: {
    textAlign: 'left',
    marginBottom: 'calc(0.25rem * 16)',
  },
  sb2c27eb9: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)',
  },
  sd6fa498c: {
    position: 'relative',
    paddingBottom: 'calc(0.25rem * 16)',
  },
  s603d8e4e: {
    width: '100%',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
    marginBottom: 'calc(0.25rem * 10)',
  },
  s5aa1ab3a: {
    flex: '1',
    paddingTop: 'calc(0.25rem * 6)',
    paddingRight: 'calc(0.25rem * 10)',
  },
  s8e852a7b: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)',
  },
  sf7ec12d7: {
    marginTop: 'calc(0.25rem * 4)',
    width: '100%',
    height: 'auto',
    borderRadius: 'calc(var(--radius) + 4px)',
  },
  s5a9ef100: {
    flex: '1',
    paddingTop: 'calc(0.25rem * 6)',
    paddingLeft: 'calc(0.25rem * 10)',
  },
  sbf129a57: {
    width: '100%',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
  },
  s70e0d74c: {
    textAlign: 'left',
    marginTop: 'calc(0.25rem * 10)',
  },
  s552e9427: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '600',
    color: 'oklch(21% 0.034 264.665)',
  },
  sd49d8760: {
    marginTop: 'calc(0.25rem * 6)',
    overflow: 'hidden',
    width: '100%',
  },
  s17a8ce37: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
  },
})
export default function Linking() {
  return (
    <section className="w-full bg-[linear-gradient(to_bottom,_#e5f4ee_0%,_#fefefe_33%)] py-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Heading */}
        <div className={stylex.props(styles.s70d8a8a4).className || ''}>
          <h2 className={stylex.props(styles.sb2c27eb9).className || ''}>Powerful Links And Embeds</h2>
          <p className="mt-4 max-w-lg text-gray-700">
            Unlock the full potential of your content with advanced linking and embedding features.
          </p>
        </div>

        <div className={stylex.props(styles.sd6fa498c).className || ''}>
          {/* Horizontal Separator */}
          <div className={stylex.props(styles.s603d8e4e).className || ''} />
          <div className="flex flex-col gap-12 md:flex-row">
            {/* Column 1 */}
            <div className={stylex.props(styles.s5aa1ab3a).className || ''}>
              <h3 className={stylex.props(styles.s8e852a7b).className || ''}>Precise Linking</h3>
              <p className="mt-2 max-w-sm text-gray-700">
                Build precise knowledge structures by linking directly to specific sections, paragraphs, or even
                individual words.
              </p>
              <img
                src={linkingImage}
                alt="Precise Linking"
                className={stylex.props(styles.sf7ec12d7).className || ''}
              />
            </div>

            {/* Vertical Divider */}
            <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 transform bg-gray-200 md:block" />

            {/* Column 2 */}
            <div className={stylex.props(styles.s5a9ef100).className || ''}>
              <h3 className={stylex.props(styles.s8e852a7b).className || ''}>Bi-Directional References</h3>
              <p className="mt-2 max-w-sm text-gray-700">
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
          <p className="mt-5 max-w-xl text-gray-700">
            Embed external content into your space while preserving proper attribution, keeping your resources organized
            and accessible.
          </p>
          <div className={stylex.props(styles.sd49d8760).className || ''}>
            <video
              src={embedsVideo}
              autoPlay
              muted
              loop
              playsInline
              className={stylex.props(styles.s17a8ce37).className || ''}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
