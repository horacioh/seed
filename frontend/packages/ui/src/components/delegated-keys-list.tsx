import * as stylex from '@stylexjs/stylex'
import {KeyRound} from 'lucide-react'
import {type ReactNode} from 'react'
import {SizableText} from '../text'
const styles_3 = stylex.create({
  s9d1e6bc5: {
    borderColor: 'var(--border)',
    display: 'flex',
    minHeight: '220px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 8)',
    textAlign: 'center',
  },
  sf608009e: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--overlay-10)',
    padding: 'calc(var(--spacing) * 4)',
  },
})
const styles_2 = stylex.create({
  s15930a39: {
    maxWidth: '24rem',
  },
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
})
const styles = stylex.create({
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s2e2893f4: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    width: 'calc(0.25rem * 10)',
    height: 'calc(0.25rem * 10)',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s69107d01: {
    display: 'flex',
    flexShrink: '0',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 'calc(0.25rem * 1)',
  },
})
export type DelegatedKeyItem = {
  id: string
  /** Primary label (e.g. a session/client name or capability label). */
  title: string
  /** Optional right-aligned date label. */
  dateLabel?: string
  /** Optional leading icon; defaults to a key glyph. */
  icon?: ReactNode
}

/**
 * Shared, cross-platform list of an account's delegated keys ("devices").
 *
 * Presentational and data-agnostic: each platform maps its own source into
 * `DelegatedKeyItem`s. The desktop app derives them from the daemon's
 * ListCapabilities (agent/writer grants on the home document); the web vault
 * derives them from the account's stored delegated sessions.
 */
export function DelegatedKeysList({
  items,
  emptyLabel = 'No Spaces Connected',
  emptyDescription = 'When you log into a Hypermedia space, your session will appear here.',
}: {
  items: DelegatedKeyItem[]
  emptyLabel?: string
  emptyDescription?: string
}) {
  if (!items.length) {
    return (
      <div className={stylex.props(styles_3.s9d1e6bc5).className || ''}>
        <SizableText weight="bold">{emptyLabel}</SizableText>
        <SizableText size="sm" color="muted" className={stylex.props(styles_2.s15930a39).className || ''}>
          {emptyDescription}
        </SizableText>
      </div>
    )
  }
  return (
    <div className={stylex.props(styles.sfbc6e28e).className || ''}>
      {items.map((item) => (
        <div key={item.id} className={stylex.props(styles_3.sf608009e).className || ''}>
          <div className={stylex.props(styles.s2e2893f4).className || ''}>
            {item.icon ?? <KeyRound className={stylex.props(styles.sca3de969).className || ''} />}
          </div>
          <div className={stylex.props(styles_2.se30fd43e).className || ''}>
            <SizableText size="sm" weight="bold" className={stylex.props(styles.s6e724d66).className || ''}>
              {item.title}
            </SizableText>
          </div>
          {item.dateLabel ? (
            <div className={stylex.props(styles.s69107d01).className || ''}>
              <SizableText size="xs" color="muted">
                {item.dateLabel}
              </SizableText>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
