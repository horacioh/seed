import * as stylex from '@stylexjs/stylex'
import {Menu, X} from 'lucide-react'
import {useEffect, useState} from 'react'
import SeedLogo from '../assets/SeedLogo'
const styles = stylex.create({
  s292fe16c: {
    position: 'fixed',
    top: 'calc(0.25rem * 0)',
    right: 'calc(0.25rem * 0)',
    left: 'calc(0.25rem * 0)',
    zIndex: '40',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
    backgroundColor: '#fff',
    paddingInline: 'calc(0.25rem * 8)',
    paddingBlock: 'calc(0.25rem * 4)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-sm)',
  },
  sac43974f: {
    display: 'flex',
    alignItems: 'center',
    columnGap: 'calc(0.25rem * 2)',
  },
  s873ca3db: {
    color: 'var(--brand-5)',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  sf90270c: {
    backgroundImage: 'linear-gradient(to right in oklab, var(--brand-5) 0%, var(--brand-6) 100%)',
    backgroundClip: 'text',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    color: 'transparent',
  },
  sfbb1eac7: {
    position: 'relative',
    padding: 'calc(0.25rem * 8)',
  },
  s4156227: {
    marginTop: 'calc(0.25rem * 4)',
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'calc(0.25rem * 1)',
  },
})
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMobileMenuOpen])
  const navLinks = [
    {
      href: 'https://seed.hyper.media/resources',
      label: 'Resources',
    },
    {
      href: 'https://seed.hyper.media/blog',
      label: 'Blog',
    },
    {
      href: 'https://seed.hyper.media/team',
      label: 'Team',
    },
    {
      href: 'https://seed.hyper.media/community',
      label: 'Support',
    },
    {
      href: 'https://seedteamtalks.hyper.media/',
      label: 'Development',
    },
  ]
  return (
    <header className={stylex.props(styles.s292fe16c).className || ''}>
      <a href="/" className={stylex.props(styles.sac43974f).className || ''}>
        <SeedLogo className={stylex.props(styles.s873ca3db).className || ''} />
        <span className={stylex.props(styles.sf90270c).className || ''}>Seed Hypermedia</span>
      </a>

      {/* Desktop nav links */}
      <nav className="hidden gap-x-6 text-sm font-medium text-gray-700 md:flex">
        {navLinks.map((link) => (
          <a key={link.label} href={link.href} className="transition hover:text-black">
            {link.label}
          </a>
        ))}
      </nav>

      {/* Mobile menu button */}
      <button
        className="relative z-50 text-gray-700 transition hover:text-black md:hidden"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md md:hidden" onClick={closeMobileMenu} />
      )}

      {/* Mobile menu */}
      <nav
        className={`fixed inset-0 z-50 flex items-center justify-center md:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        } `}
        onClick={closeMobileMenu}
      >
        <div
          className={`mx-4 w-full max-w-sm transform rounded-2xl border border-gray-100/50 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
            isMobileMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          } `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={stylex.props(styles.sfbb1eac7).className || ''}>
            {/* Close button */}
            <button
              onClick={closeMobileMenu}
              className="absolute top-4 right-4 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100/50 hover:text-gray-700"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>

            <div className={stylex.props(styles.s4156227).className || ''}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-brand-5 block rounded-xl px-4 py-4 text-xl font-bold text-gray-800 transition-all duration-200 hover:bg-gray-50/50"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
