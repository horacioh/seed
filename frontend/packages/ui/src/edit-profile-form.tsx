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
const styles_3 = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s2ffff9: {
    display: 'flex',
  },
  sa2b24174: {
    height: '128px',
  },
  s52b4c283: {
    width: '128px',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  s7c401ed1: {
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  s1ca68c72: {
    borderStyle: 'dashed',
  },
  sdddec04c: {
    borderColor: 'oklch(87% 0 0)',
  },
  s22aabf0b: {
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'oklch(70.8% 0 0)',
      },
    },
  },
  s38ab0761: {
    '@media ((max-width: 639px))': {
      height: 'calc(0.25rem * 16)',
    },
  },
  s38b1d8f2: {
    '@media ((max-width: 639px))': {
      width: 'calc(0.25rem * 16)',
    },
  },
  sd5b893dc: {
    pointerEvents: 'none',
  },
  s67010d77: {
    position: 'absolute',
  },
  s74a79380: {
    inset: 'calc(0.25rem * 0)',
  },
  sb42244d4: {
    height: '100%',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s199f2733: {
    backgroundColor: 'color-mix(in oklab, #000 50%, transparent)',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_2 = stylex.create({
  se1945d92: {
    pointerEvents: 'none',
    position: 'absolute',
    inset: 'calc(var(--spacing) * 0)',
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--tone-neutral-100)',
  },
  sa9f2178d: {
    textAlign: 'center',
    color: 'var(--tone-neutral-600)',
  },
})
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
    <div
      className={
        stylex.props(
          styles_3.sdef3facc,
          styles_3.s2ffff9,
          styles_3.sa2b24174,
          styles_3.s52b4c283,
          styles_3.sc7847ec6,
          styles_3.s92852dd5,
          styles_3.sf799897a,
          styles_3.s7c401ed1,
          styles_3.s1ca68c72,
          styles_3.sdddec04c,
          styles_3.s22aabf0b,
          styles_3.s38ab0761,
          styles_3.s38b1d8f2,
        ).className || ''
      }
    >
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
        <div className={stylex.props(styles_2.se1945d92).className || ''}>
          <SizableText size="xs" className={stylex.props(styles_2.sa9f2178d).className || ''}>
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
        <div
          className={
            stylex.props(
              styles_3.sd5b893dc,
              styles_3.s67010d77,
              styles_3.s74a79380,
              styles_3.s2ffff9,
              styles_3.sb42244d4,
              styles_3.scdbaf625,
              styles_3.sc6ed1702,
              styles_3.sce22ca32,
              styles_3.s199f2733,
              styles_3.s765a26ee,
              styles_3.s83442393,
            ).className || ''
          }
        >
          <SizableText size="xs" className={stylex.props(styles.sb5bdb794).className || ''}>
            Edit {label}
          </SizableText>
        </div>
      )}
    </div>
  )
}
