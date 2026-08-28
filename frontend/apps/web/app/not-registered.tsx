import * as stylex from '@stylexjs/stylex'
import {Link} from '@remix-run/react'
import {SizableText} from '@shm/ui/text'
import {Container} from './ui/container'
const styles_2 = stylex.create({
  s58dae040: {
    borderColor: 'var(--border)',
    width: '100%',
    maxWidth: '36rem',
    gap: 'calc(0.25rem * 5)',
    alignSelf: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 5)',
    boxShadow: 'var(--shadow-md)',
  },
})
const styles = stylex.create({
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s33458d: {
    marginTop: 'calc(0.25rem * 3)',
  },
})
export function NotRegisteredPage({}: {}) {
  return (
    <div>
      <Container>
        <div className={stylex.props(styles_2.s58dae040).className || ''}>
          <div className={stylex.props(styles.s86ff3e5).className || ''}>
            <SizableText size="3xl">🚧</SizableText>
            <SizableText size="2xl" weight="bold">
              Seed Hypermedia Space Coming Soon
            </SizableText>
          </div>
          <div>
            <SizableText>
              Welcome! We're excited to have you onboard. It looks like your content has not been published to this new
              space.
            </SizableText>
            <SizableText className={stylex.props(styles.s33458d).className || ''}>
              To complete your setup, please follow the remaining steps from your secret setup URL. Reach out to the
              Seed Hypermedia team if you need any help.
            </SizableText>
          </div>
        </div>
      </Container>
    </div>
  )
}
export function NoSitePage({}: {}) {
  return (
    <div>
      <Container>
        <div className={stylex.props(styles_2.s58dae040).className || ''}>
          <div className={stylex.props(styles.s86ff3e5).className || ''}>
            <SizableText size="3xl">☁️</SizableText>
            <SizableText size="2xl" weight="bold">
              Nothing Here, (yet!)
            </SizableText>
          </div>
          <div>
            <SizableText>
              You can create Hypermedia content and publish it to your network for free by{' '}
              <Link to="https://seed.hyper.media/hm/download">downloading the Seed Hypermedia app</Link>.
            </SizableText>
            <SizableText className={stylex.props(styles.s33458d).className || ''}>
              To publish something here, <Link to="https://discord.com/invite/xChFt8WPN8">join our Discord server</Link>{' '}
              and ask about our hosting service. If you have a domain and a server, you can also{' '}
              <Link to="https://seed.hyper.media/resources/self-host-seed">self-host your space</Link>.
            </SizableText>
          </div>
        </div>
      </Container>
    </div>
  )
}
