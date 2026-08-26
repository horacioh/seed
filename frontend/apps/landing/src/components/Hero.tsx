import * as stylex from '@stylexjs/stylex'
import {Download} from 'lucide-react'
import appDemoVideo from '../../public/app-demo.mp4'
import DiscordIcon from '../assets/DiscordIcon'
const styles = stylex.create({
  s2c9185d9: {
    width: '100%',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 16)',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  s36f336cf: {
    color: 'var(--brand-5)',
  },
  s4c15bd56: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  s333e0a: {
    marginRight: 'calc(0.25rem * 2)',
  },
  sf30d30a9: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    marginRight: 'calc(0.25rem * 2)',
    color: '#fff',
  },
  s8eb76bf5: {
    objectFit: 'contain',
    width: '100%',
    height: 'auto',
  },
})
export default function Hero() {
  return (
    <section className={stylex.props(styles.s2c9185d9).className || ''}>
      <div className="mx-auto mb-12 max-w-4xl">
        <h1 className="text-3xl leading-tight font-bold text-gray-900 md:text-5xl">
          Humanity Deserves A <span className={stylex.props(styles.s36f336cf).className || ''}>Better Medium</span>{' '}
          <br />
          For <span className={stylex.props(styles.s36f336cf).className || ''}>Thinking</span> And{' '}
          <span className={stylex.props(styles.s36f336cf).className || ''}>Communication</span>
        </h1>
        <p className="mx-auto mt-5 mb-5 max-w-2xl pt-3 text-xl text-gray-700">
          Your website should be a dynamic space for ideas, projects, and community building.
        </p>
        <div className={stylex.props(styles.s4c15bd56).className || ''}>
          <a
            href="https://seed.hyper.media/hm/download"
            target="_blank"
            className={`bg-brand-4 hover:bg-brand-3 plausible-event-name=download inline-flex items-center rounded-md px-5 py-2 text-white transition plausible-event-os=${
              navigator.platform.toLowerCase().includes('mac')
                ? 'macos'
                : navigator.platform.toLowerCase().includes('win')
                  ? 'windows'
                  : 'linux'
            }`}
          >
            <Download size={17} className={stylex.props(styles.s333e0a).className || ''} />
            Download the Seed App
          </a>
          <a
            href="https://discord.gg/mcUnKENdKX"
            target="_blank"
            className={`plausible-event-name=discord inline-flex items-center rounded-md bg-gray-500 px-5 py-2 text-white transition hover:bg-gray-700`}
          >
            <DiscordIcon className={stylex.props(styles.sf30d30a9).className || ''} />
            Join Community Discord
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl overflow-hidden rounded-xl shadow-lg">
        <video
          src={appDemoVideo}
          autoPlay
          muted
          loop
          playsInline
          className={stylex.props(styles.s8eb76bf5).className || ''}
        />
      </div>
    </section>
  )
}
