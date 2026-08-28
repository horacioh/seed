import * as stylex from '@stylexjs/stylex'
import * as React from 'react'

/**
 * A labeled group of settings rows rendered as a bordered card. Used to group
 * related settings (e.g. authentication, notifications) under an uppercase label.
 */
const styles_4 = stylex.create({
  s46d743d4: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
  },
  s1bfab962: {
    color: 'var(--primary)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sca3de96d: {
    width: 'calc(0.25rem * 9)',
    height: 'calc(0.25rem * 9)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
})
const styles_3 = stylex.create({
  s46a762d: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
})
const styles_2 = stylex.create({
  s797b1794: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
  },
})
const styles = stylex.create({
  s6252515a: {
    color: 'var(--muted-foreground)',
    marginBottom: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  s87791731: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s9d4b128d: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  sa56e9200: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
})
export function SettingsSection({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <p className={stylex.props(styles.s6252515a).className || ''}>{label}</p>
      <div className={stylex.props(styles_3.s46a762d).className || ''}>{children}</div>
    </div>
  )
}

/**
 * A single settings entry: an icon, a label with optional description, and an
 * optional trailing action (typically a button). Render `Separator` between
 * consecutive rows.
 */
export function SettingsRow({
  icon,
  label,
  description,
  action,
}: {
  icon: React.ReactNode
  label: string
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className={stylex.props(styles.s87791731).className || ''}>
      <div className={stylex.props(styles.s86ff3e5).className || ''}>
        <div
          className={
            stylex.props(
              styles_4.s46d743d4,
              styles_4.s1bfab962,
              styles_4.s2ffff9,
              styles_4.sca3de96d,
              styles_4.sf032ed6c,
              styles_4.sc6ed1702,
              styles_4.sce22ca32,
              styles_4.s775755af,
            ).className || ''
          }
        >
          {icon}
        </div>
        <div className={stylex.props(styles_2.s797b1794).className || ''}>
          <p className={stylex.props(styles.s9d4b128d).className || ''}>{label}</p>
          {description ? <p className={stylex.props(styles.sa56e9200).className || ''}>{description}</p> : null}
        </div>
      </div>
      {action ? <div className={stylex.props(styles.sf032ed6c).className || ''}>{action}</div> : null}
    </div>
  )
}
