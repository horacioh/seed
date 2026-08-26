import * as stylex from '@stylexjs/stylex'
import BlueskyIcon from '../assets/BlueskyIcon'
import DiscordIcon from '../assets/DiscordIcon'
import GithubIcon from '../assets/GithubIcon'
import LinkedInIcon from '../assets/LinkedInIcon'
import SeedLogo from '../assets/SeedLogo'
import XIcon from '../assets/XIcon'
const styles = stylex.create({
  s78416c1f: {
    width: '100%',
    backgroundColor: '#fff',
    paddingBlock: 'calc(0.25rem * 6)',
    paddingInline: 'calc(0.25rem * 4)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(44.6% 0.03 256.802)',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  sdb7095a0: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '400',
  },
  sfe5bccc5: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    color: 'oklch(70.7% 0.022 261.325)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sf9b363c3: {
    display: 'flex',
    gap: 'calc(0.25rem * 4)',
    marginBottom: 'calc(0.25rem * 1)',
  },
  sca3de96a: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
})
export default function Footer() {
  return (
    <footer className={stylex.props(styles.s78416c1f).className || ''}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        {/* Logo + Text + Copyright */}
        <div className="flex w-full flex-col items-start text-center text-gray-400 md:w-auto md:items-start md:text-left">
          <div className="flex w-full items-center justify-center gap-2 md:justify-start">
            <SeedLogo className={stylex.props(styles.sca3de969).className || ''} />
            <span className={stylex.props(styles.sdb7095a0).className || ''}>Seed Hypermedia</span>
          </div>
          <p className="mt-1 w-full text-xs md:w-auto">
            seed.hyper.media {new Date().getFullYear()} © All rights reserved
          </p>
        </div>

        {/* Socials + Terms */}
        <div className={stylex.props(styles.sfe5bccc5).className || ''}>
          <div className={stylex.props(styles.sf9b363c3).className || ''}>
            <a
              href="https://github.com/seed-hypermedia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              <GithubIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
            <a
              href="https://discord.gg/mcUnKENdKX"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              <DiscordIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
            <a
              href="https://linkedin.com/company/seed-hypermedia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              <LinkedInIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
            <a
              href="https://x.com/seedhypermedia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              <XIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
            <a
              href="https://bsky.app/profile/seed.hyper.media"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              <BlueskyIcon className={stylex.props(styles.sca3de96a).className || ''} />
            </a>
          </div>
          {/* <a href="/terms" className="text-xs hover:underline">
            Terms and Conditions
           </a> */}
        </div>
      </div>
    </footer>
  )
}
