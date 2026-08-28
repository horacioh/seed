import * as stylex from '@stylexjs/stylex'
import {Eye, EyeOff} from 'lucide-react'
import {useState} from 'react'
import {Button} from '../button'
import {Input} from './input'
import {Label} from './label'

/**
 * Rates a password 0 (weak) / 1 (medium) / 2 (strong). Shared with the web vault
 * so the desktop and vault enforce the same minimum strength.
 */
const strengthBarStyles = stylex.create({
  base: {
    height: '100%',
    transitionProperty: 'all',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: '300ms',
  },
  weak: {
    width: '33.3333%',
    backgroundColor: 'var(--destructive)',
  },
  medium: {
    width: '66.6667%',
    backgroundColor: '#eab308',
  },
  strong: {
    width: '100%',
    backgroundColor: '#22c55e',
  },
})
const styles_2 = stylex.create({
  sf07abff9: {
    position: 'absolute',
    top: 'calc(var(--spacing) * 0)',
    right: 'calc(var(--spacing) * 0)',
    height: '100%',
    width: 'calc(var(--spacing) * 10)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'transparent',
      },
    },
  },
})
const styles = stylex.create({
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s65ec9ca: {
    paddingRight: 'calc(0.25rem * 10)',
  },
  s3566be63: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sebad82b1: {
    backgroundColor: 'var(--muted)',
    marginTop: 'calc(0.25rem * 1)',
    height: 'calc(0.25rem * 1)',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 4px)',
  },
})
export function checkPasswordStrength(password: string): number {
  if (password.length < 8) return 0
  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score <= 1) return 0
  if (score <= 3) return 1
  return 2
}
/**
 * Password input with a visibility toggle and optional strength meter. Shared
 * between the desktop app and the web vault.
 */
export function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  autoFocus,
  showStrength,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  autoFocus?: boolean
  showStrength?: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)
  const strength = showStrength ? checkPasswordStrength(value) : 0
  const strengthStyle =
    strength === 0 ? strengthBarStyles.weak : strength === 1 ? strengthBarStyles.medium : strengthBarStyles.strong
  return (
    <div className={stylex.props(styles.sfbc6e28e).className || ''}>
      <Label htmlFor={id}>{label}</Label>
      <div className={stylex.props(styles.sdef3facc).className || ''}>
        <Input
          id={id}
          name={autoComplete === 'new-password' ? 'new-password' : 'password'}
          type={showPassword ? 'text' : 'password'}
          className={stylex.props(styles.s65ec9ca).className || ''}
          placeholder="Enter password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          autoFocus={autoFocus}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={stylex.props(styles_2.sf07abff9).className || ''}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className={stylex.props(styles.s3566be63).className || ''} />
          ) : (
            <Eye className={stylex.props(styles.s3566be63).className || ''} />
          )}
        </Button>
      </div>
      {showStrength && value ? (
        <div className={stylex.props(styles.sebad82b1).className || ''}>
          <div className={stylex.props(strengthBarStyles.base, strengthStyle).className || ''} />
        </div>
      ) : null}
    </div>
  )
}
