import * as stylex from '@stylexjs/stylex'
import {zodResolver} from '@hookform/resolvers/zod'
import {useTxString} from '@shm/shared/translation'
import {useEffect} from 'react'
import {Control, FieldValues, Path, useController, useForm} from 'react-hook-form'
import {z} from 'zod'
import {Button} from './button'
import {Field} from './form-fields'
import {FormError, FormInput} from './form-input'
import {getDaemonFileUrl} from './get-file-url'
import {SizableText} from './text'
const styles = stylex.create({
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  scdbaf625: {
    width: '100%',
  },
  sd6fbdd99: {
    position: 'absolute',
    inset: 'calc(0.25rem * 0)',
    zIndex: '10',
    cursor: 'pointer',
    opacity: '0%',
  },
  s2b57d061: {
    position: 'absolute',
    inset: 'calc(0.25rem * 0)',
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
  sb5bdb794: {
    textAlign: 'center',
    color: '#fff',
  },
})
export const siteMetaSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  icon: z.string().or(z.instanceof(Blob)).nullable(),
  description: z.string().optional(),
})
export type SiteMetaFields = z.infer<typeof siteMetaSchema>
export function EditProfileForm({
  onSubmit,
  defaultValues,
  submitLabel,
  processImage,
}: {
  onSubmit: (data: SiteMetaFields) => void
  defaultValues?: SiteMetaFields
  submitLabel?: string
  processImage?: (file: File) => Promise<Blob>
}) {
  const tx = useTxString()
  const form = useForm<SiteMetaFields>({
    resolver: zodResolver(siteMetaSchema),
    defaultValues: defaultValues || {
      name: '',
      icon: null,
      description: '',
    },
  })
  useEffect(() => {
    setTimeout(() => {
      form.setFocus('name', {
        shouldSelect: true,
      })
    }, 300) // wait for animation
  }, [form.setFocus])
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className={stylex.props(styles.sfbc6e28e).className || ''}>
        <Field id="name" label={tx('Account Name')}>
          <FormInput control={form.control} name="name" placeholder={tx('My New Public Name')} />
          <FormError errors={form.formState.errors} name="name" />
        </Field>
        <Field id="icon" label={tx('Profile Icon')}>
          <ImageField control={form.control} name="icon" label={tx('Profile Icon')} processImage={processImage} />
        </Field>
        <div>
          <Button type="submit" variant="default" size="lg" className={stylex.props(styles.scdbaf625).className || ''}>
            {submitLabel || tx('Save')}
          </Button>
        </div>
      </div>
    </form>
  )
}
function ImageField<Fields extends FieldValues>({
  control,
  name,
  label,
  processImage,
}: {
  control: Control<Fields>
  name: Path<Fields>
  label: string
  processImage?: (file: File) => Promise<Blob>
}) {
  const c = useController({
    control,
    name,
  })
  const tx = useTxString()
  const currentImgURL = c.field.value
    ? typeof c.field.value === 'string'
      ? getDaemonFileUrl(c.field.value)
      : URL.createObjectURL(c.field.value)
    : null
  return (
    <div className="group relative flex h-[128px] w-[128px] cursor-pointer overflow-hidden rounded-sm border-2 border-dashed border-neutral-300 hover:border-neutral-400 max-sm:h-16 max-sm:w-16 dark:border-neutral-600 dark:hover:border-neutral-500">
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          if (processImage) {
            processImage(file).then((blob) => {
              c.field.onChange(blob)
            })
          } else {
            c.field.onChange(file)
          }
        }}
        className={stylex.props(styles.sd6fbdd99).className || ''}
      />
      {!c.field.value && (
        <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <SizableText size="xs" className="text-center text-neutral-600 dark:text-neutral-400">
            {tx('add', ({what}: {what: string}) => `Add ${what}`, {
              what: label,
            })}
          </SizableText>
        </div>
      )}
      {c.field.value && (
        <img src={currentImgURL || undefined} alt={label} className={stylex.props(styles.s2b57d061).className || ''} />
      )}
      {c.field.value && (
        <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <SizableText size="xs" className={stylex.props(styles.sb5bdb794).className || ''}>
            Edit {label}
          </SizableText>
        </div>
      )}
    </div>
  )
}
