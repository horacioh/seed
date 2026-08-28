import * as stylex from '@stylexjs/stylex'
import {CheckedState} from '@radix-ui/react-checkbox'
import {useId} from 'react'
import {Control, FieldErrors, FieldValues, Path, useController} from 'react-hook-form'
import {Checkbox, CheckboxProps} from './components/checkbox'
import {Input} from './components/input'
import {Label} from './components/label'
import {Textarea} from './components/textarea'
import {Text} from './text'
const styles_2 = stylex.create({
  s54eab79d: {
    opacity: '50%',
  },
})
const styles = stylex.create({
  se658ac13: {
    display: 'flex',
    gap: 'calc(0.25rem * 1)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
})
export function FormInput<Fields extends FieldValues>({
  control,
  name,
  transformInput,
  ...props
}: React.ComponentProps<typeof Input> & {
  control: Control<Fields>
  name: Path<Fields>
  transformInput?: (input: string) => string
}) {
  const c = useController({
    control,
    name,
  })
  const {onChange, ...inputProps} = c.field
  return (
    <Input
      {...inputProps}
      id={name}
      onChange={(e) => {
        const text = e.target.value
        if (transformInput) {
          onChange(transformInput(text))
        } else {
          onChange(text)
        }
      }}
      {...props}
    />
  )
}
export function FormCheckbox<Fields extends FieldValues>({
  control,
  name,
  label,
  ...props
}: React.ComponentProps<typeof Checkbox> & {
  control: Control<Fields>
  name: Path<Fields>
  label: string
}) {
  const c = useController({
    control,
    name,
  })
  return (
    <div className={stylex.props(styles.se658ac13).className || ''}>
      <FullCheckbox
        // @ts-expect-error - react-hook-form field value type conflict with CheckedState
        value={c.field.value as CheckedState}
        label={label}
        onValue={c.field.onChange}
        {...props}
      />
    </div>
  )
}
export function FormTextArea<Fields extends FieldValues>({
  control,
  name,
  ...props
}: React.ComponentProps<typeof Textarea> & {
  control: Control<Fields>
  name: Path<Fields>
}) {
  const c = useController({
    control,
    name,
  })
  return <Textarea {...c.field} {...props} />
}
export function FormError<TFieldValues extends FieldValues>({
  errors,
  name,
}: {
  errors?: FieldErrors<TFieldValues> | undefined
  name: keyof FieldErrors<TFieldValues>
}) {
  const error = errors?.[name]
  if (!error) return null
  return (
    <Text family="default" className={stylex.props(styles.s8a2570e2).className || ''}>
      {error.message as string}
    </Text>
  )
}
export function FullCheckbox({
  value,
  onValue,
  isLoading,
  label,
  size = 'default',
}: {
  value: CheckedState
  onValue: (value: CheckedState) => void
  isLoading?: boolean
  label: string
} & CheckboxProps) {
  const id = useId()
  return (
    <div className={stylex.props(styles.se658ac13).className || ''}>
      <Checkbox
        className={stylex.props(isLoading ? styles_2.s54eab79d : null).className || ''}
        checked={value}
        onCheckedChange={onValue}
        id={id}
        size={size}
      />
      <Label htmlFor={id} size={size}>
        {label}
      </Label>
    </div>
  )
}
