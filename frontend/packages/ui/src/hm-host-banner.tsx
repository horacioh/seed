import * as stylex from '@stylexjs/stylex'
import {hostnameStripProtocol} from '@shm/shared'
import {useIsomorphicLayoutEffect} from '@shm/shared/utils/use-isomorphic-layout-effect'
import {useRef} from 'react'
const styles = stylex.create({
  sd6afd0ff: {
    backgroundColor: 'var(--primary)',
    width: '100%',
    padding: 'calc(0.25rem * 1)',
  },
  s5c0c74ae: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 1)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: '#fff',
  },
  sc2c9c6cc: {
    textDecorationLine: 'underline',
  },
})
export function HypermediaHostBanner({origin}: {origin?: string}) {
  const bannerRef = useRef<HTMLDivElement>(null)
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const updateBannerHeight = () => {
      const banners = Array.from(window.document.querySelectorAll<HTMLElement>('[data-hm-host-banner]'))
      const maxBannerHeight = banners.reduce((maxHeight, banner) => Math.max(maxHeight, banner.offsetHeight), 0)
      window.document.documentElement.style.setProperty('--hm-host-banner-h', `${maxBannerHeight}px`)
    }
    updateBannerHeight()
    const resizeObserver = new ResizeObserver(() => {
      updateBannerHeight()
    })
    if (bannerRef.current) {
      resizeObserver.observe(bannerRef.current)
    }
    return () => {
      resizeObserver.disconnect()
      updateBannerHeight()
    }
  }, [])
  return (
    <div ref={bannerRef} data-hm-host-banner="true" className={stylex.props(styles.sd6afd0ff).className || ''}>
      <p className={stylex.props(styles.s5c0c74ae).className || ''}>
        <span>Hosted on</span>
        <a href="/" className={stylex.props(styles.sc2c9c6cc).className || ''}>
          {hostnameStripProtocol(origin)}
        </a>
        <span>via the</span>
        <a href="https://hyper.media" target="_blank" className={stylex.props(styles.sc2c9c6cc).className || ''}>
          Hypermedia Protocol
        </a>
      </p>
    </div>
  )
}
