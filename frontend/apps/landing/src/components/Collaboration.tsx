import * as stylex from '@stylexjs/stylex'
import collaboratorsImage from '../../public/collaborators.png'
import commentsImage from '../../public/comments.png'
const styles = stylex.create({
  s62d3d5d: {
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
})
export default function Collaboration() {
  return (
    <section className="w-full bg-[linear-gradient(to_bottom,_#54cd8533_0%,_#54cd8500_33%)] py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className={stylex.props(styles.s62d3d5d).className || ''}>
          <h2 className={stylex.props(styles.sb2c27eb9).className || ''}>Distributed Collaboration</h2>
          <p className="mt-4 max-w-lg text-gray-700">
            Once you publish, build deep knowledge by sparking open discussions.
          </p>
        </div>

        <div className={stylex.props(styles.sd6fa498c).className || ''}>
          {/* Horizontal Separator */}
          <div className={stylex.props(styles.s603d8e4e).className || ''} />
          <div className="flex flex-col gap-12 md:flex-row">
            {/* Column 1 */}
            <div className={stylex.props(styles.s5aa1ab3a).className || ''}>
              <h3 className={stylex.props(styles.s8e852a7b).className || ''}>Collaborative Documents</h3>
              <p className="mt-2 min-h-[56px] max-w-[320px] text-gray-700">
                Engage with your community by inviting readers and collaborators to your space.
              </p>
              <img
                src={collaboratorsImage}
                alt="Collaborative Documents"
                className="mt-4 h-[400px] w-full object-contain"
              />
            </div>

            {/* Vertical Divider */}
            <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 transform bg-gray-200 md:block" />

            {/* Column 2 */}
            <div className={stylex.props(styles.s5a9ef100).className || ''}>
              <h3 className={stylex.props(styles.s8e852a7b).className || ''}>Open Discussions</h3>
              <p className="mt-2 min-h-[56px] max-w-[320px] text-gray-700">
                Connect directly peer-to-peer, with no centralized control.
              </p>
              <img src={commentsImage} alt="Open Discussions" className="mt-4 h-[400px] w-full object-contain" />
            </div>
          </div>
        </div>
        {/* Horizontal Separator */}
        <div className={stylex.props(styles.sbf129a57).className || ''} />
      </div>
    </section>
  )
}
