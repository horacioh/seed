import * as stylex from '@stylexjs/stylex'
import {Label} from './components/label'
import {PropsWithChildren} from 'react'
import {Input} from './components/input'
import {Switch, SwitchProps} from './components/switch'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './select-dropdown'
const styles_2 = stylex.create({
  s6a21f7e: {
    width: '50%',
  },
})
const styles = stylex.create({
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s7c2ececa: {
    borderColor: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'calc(var(--radius) - 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s592e123c: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
  },
  sfff72421: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  s1f58c058: {
    color: 'var(--muted-foreground)',
    flex: '1',
  },
})
export function Field({
  id,
  label,
  children,
}: PropsWithChildren<{
  label: string
  id: string
}>) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <Label htmlFor={id} size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        {label}
      </Label>
      {children}
    </div>
  )
}
export function TextField({
  label,
  Icon,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  Icon?: any
  id: string
}) {
  let content = (
    <div className={stylex.props(styles.s7c2ececa).className || ''}>
      {Icon && <Icon className={stylex.props(styles.sca3de967).className || ''} size={14} />}
      <Input autoFocus {...props} />
    </div>
  )
  if (label) {
    return (
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <Label htmlFor={id} size="sm" className={stylex.props(styles.sf2718385).className || ''}>
          {label}
        </Label>
        {content}
      </div>
    )
  } else {
    return content
  }
}
export function SelectField({
  label,
  Icon,
  id,
  options,
  value,
  onValue,
  className,
  placeholder,
  ...props
}: {
  label?: string
  Icon?: any
  id: string
  options: Array<{
    value: string
    label: string
  }>
  value?: string
  onValue?: (value: string) => void
  className?: string
  placeholder?: string
} & React.ComponentProps<typeof Select>) {
  const content = (
    <Select value={value} onValueChange={onValue} {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
  if (label) {
    return (
      <div className={stylex.props(styles.s592e123c).className || ''}>
        <Label htmlFor={id} size="sm" className={stylex.props(styles.sf2718385).className || ''}>
          {label}
        </Label>
        <div className={stylex.props(styles_2.s6a21f7e).className || ''}>{content}</div>
      </div>
    )
  } else {
    return content
  }
}
export function SwitchField({
  label,
  id,
  ...props
}: SwitchProps & {
  label: string
  id: string
}) {
  return (
    <div className={stylex.props(styles.sfff72421).className || ''}>
      <Label htmlFor={id} size="sm" className={stylex.props(styles.s1f58c058).className || ''}>
        {label}
      </Label>
      <Switch {...props} />
    </div>
  )
}
