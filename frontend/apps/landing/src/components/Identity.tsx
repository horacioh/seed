import * as stylex from '@stylexjs/stylex'
import checkImage from '../../public/check.png'
import encryptionVideo from '../../public/encryption.mp4'
import keyImage from '../../public/key.png'
const styles = stylex.create({
  sec138f7a: {
    fontSize: '2.25rem',
    lineHeight: 'calc(2.5 / 2.25)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)',
  },
  s1160539b: {
    marginTop: 'calc(0.25rem * 4)',
    color: 'oklch(37.3% 0.034 259.733)',
  },
  s56a28899: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    flex: '1',
  },
  s5da97f19: {
    marginTop: 'calc(0.25rem * 2)',
    color: 'oklch(37.3% 0.034 259.733)',
  },
  s6356c05: {
    marginTop: 'calc(0.25rem * 10)',
  },
})
export default function Identity() {
  return (
    <section className="w-full bg-[#fdfdfd] px-4 py-14 md:px-8 md:py-20">
      {/* Own Your Identity Block */}
      <div className="mx-auto max-w-5xl">
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center max-w-3/4"> */}
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row">
          <div className="mt-8 flex-1 self-start md:self-center">
            <h2 className={stylex.props(styles.sec138f7a).className || ''}>Own Your Identity</h2>
            <p className={stylex.props(styles.s1160539b).className || ''}>
              Control your credentials—secure, decentralized, and independent of central authorities.
            </p>
          </div>

          <div className={stylex.props(styles.s56a28899).className || ''}>
            <img src={keyImage} alt="Crypto sign" className="mb-1 max-h-24 max-w-24" />
            <p className="max-w-[180px] text-sm text-gray-600">
              Content is cryptographically signed, so anyone can verify authenticity.
            </p>
          </div>

          <div className={stylex.props(styles.s56a28899).className || ''}>
            <img src={checkImage} alt="ID check" className="mb-1 max-h-24 max-w-24" />
            <p className="max-w-[250px] text-sm text-gray-600">
              Your identity is validated with your social graph and domain names, forming a robust web of trust.
            </p>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-auto my-16 w-full max-w-5xl border-t border-gray-200" />

      {/* Signed Versions Block */}
      <div className="mx-auto max-w-5xl text-center">
        <h3 className="text-2xl font-semibold text-gray-900 md:text-3xl">Signed Versions</h3>
        <p className={stylex.props(styles.s1160539b).className || ''}>
          Each change is cryptographically signed by the author. Leveraging the power of IPFS and CRDTs, each immutable
          version may be accurately referenced.
        </p>
        <p className={stylex.props(styles.s5da97f19).className || ''}>
          By delivering permanence, attribution, and versioning to the web, you can preserve the history of your
          community's knowledge.
        </p>

        {/* Video */}
        <div className={stylex.props(styles.s6356c05).className || ''}>
          <video
            src={encryptionVideo}
            autoPlay
            muted
            loop
            playsInline
            className="mx-auto w-full max-w-3xl rounded-xl object-contain"
          />
        </div>
      </div>
    </section>
  )
}
