import * as stylex from '@stylexjs/stylex'
import {SizableText} from './text'
import {PropsWithChildren} from 'react'
import {FieldErrors, FieldValues} from 'react-hook-form'
import {Label} from './components/label'
import {cn} from './utils'
const styles = stylex.create({
  scdbaf625: {
    width: '100%',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  s3301fa: {
    marginBottom: 'calc(0.25rem * 2)',
  },
})
export function FormErrors<Fields extends FieldValues>({errors}: {errors: FieldErrors<Fields>}) {
  if (errors.root) {
    return <SizableText color="destructive">{errors.root.message}</SizableText>
  }
  return null
}
export function FormField<Fields extends FieldValues>({
  name,
  label,
  errors,
  children,
  width,
  className,
}: PropsWithChildren<
  React.HTMLAttributes<HTMLFieldSetElement> & {
    name: keyof Fields
    errors?: FieldErrors<Fields>
    label?: string
    width?: number | string
  }
>) {
  return (
    <div
      className={cn(
        stylex.props(styles.scdbaf625).className || '',
        width && `w-[${typeof width == 'number' ? `${width}px` : width}]`,
        className,
      )}
    >
      <div className={stylex.props(styles.s78289774).className || ''}>
        {label ? (
          <Label
            htmlFor={String(name)}
            className={cn(
              stylex.props(styles.s3301fa).className || '',
              errors && errors[name]?.message && 'text-red-500',
            )}
          >
            {label}
          </Label>
        ) : null}
        {errors && errors[name]?.message ? (
          <SizableText color="destructive">{errors[name]?.message as string}</SizableText>
        ) : null}
      </div>
      {children}
    </div>
  )
}
