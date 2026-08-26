import * as stylex from '@stylexjs/stylex'
import {Github, Glasses} from 'lucide-react'
import protocolVideo from '../../public/protocol.mp4'
const styles = stylex.create({
  sb42feb5d: {
    flex: '1',
  },
  s452fb49b: {
    marginBottom: 'calc(0.25rem * 6)',
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)',
  },
  s8ef9ce05: {
    marginBottom: 'calc(0.25rem * 4)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    color: 'oklch(27.8% 0.033 256.848)',
  },
  s235d0087: {
    marginBottom: 'calc(0.25rem * 6)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    color: 'oklch(27.8% 0.033 256.848)',
  },
  se658ac16: {
    display: 'flex',
    gap: 'calc(0.25rem * 4)',
  },
  s333e0a: {
    marginRight: 'calc(0.25rem * 2)',
  },
  sfd8432a0: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
  },
})
export default function Protocol() {
  return (
    <section className="w-full bg-[#efefef] py-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-12 px-6 md:flex-row">
        {/* Text Content */}
        <div className={stylex.props(styles.sb42feb5d).className || ''}>
          <h2 className={stylex.props(styles.s452fb49b).className || ''}>Open Protocol And Software</h2>
          <p className={stylex.props(styles.s8ef9ce05).className || ''}>
            Seed Hypermedia is designed in two parts. Seed is the Open Source software developed by our team, while
            Hypermedia is the open protocol that enhances the web to build trust and collaboration.
          </p>
          <p className={stylex.props(styles.s8ef9ce05).className || ''}>
            Because our desktop app and server are Open Source, developers can join our community to expand the product
            for their needs.
          </p>
          <p className={stylex.props(styles.s235d0087).className || ''}>
            Anyone can participate in the hypermedia protocol and extend it beyond the current capabilities.
          </p>
          <div className={stylex.props(styles.se658ac16).className || ''}>
            <a
              href="https://github.com/seed-hypermedia"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-4 hover:bg-brand-3 inline-flex items-center rounded-md px-5 py-2 text-white transition"
            >
              <Github size={17} className={stylex.props(styles.s333e0a).className || ''} />
              GitHub
            </a>
            <a
              href="https://explore.hyper.media/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-gray-500 px-5 py-2 text-white transition hover:bg-gray-700"
            >
              <Glasses size={17} className={stylex.props(styles.s333e0a).className || ''} />
              Protocol Explorer
            </a>
          </div>
        </div>

        {/* Animation Video */}
        <div className={stylex.props(styles.sfd8432a0).className || ''}>
          <div className="relative h-[300px] w-[300px] overflow-hidden md:h-[400px] md:w-[400px]">
            <video
              src={protocolVideo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[2.2] transform object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
