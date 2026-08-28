import * as stylex from '@stylexjs/stylex'
import {Plus} from 'lucide-react'
import {useEffect, useState, type FormEvent} from 'react'
import {Button} from '../button'
import {SizableText} from '../text'
import {Input} from './input'
import {Label} from './label'
import {Textarea} from './textarea'
const styles_2 = stylex.create({
  s291e7520: {
    backgroundColor: 'var(--muted)',
    ':focus-within': {
      boxShadow: '0 0 0 2px currentcolor',
    },
    position: 'relative',
    display: 'flex',
    width: 'calc(var(--spacing) * 16)',
    height: 'calc(var(--spacing) * 16)',
    flexShrink: '0',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '0.25rem',
  },
  s65d7e593: {
    minHeight: '80px',
    resize: 'none',
  },
})
const styles = stylex.create({
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  s11c1d1bc: {
    color: 'var(--destructive)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s5d7ceece: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  s3566be64: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  s6c60c43d: {
    position: 'absolute',
    inset: 'calc(0.25rem * 0)',
    cursor: 'pointer',
    opacity: '0%',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s2d68c57c: {
    textAlign: 'right',
  },
  s9075a4c8: {
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 4)',
  },
  se99caeca: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 3)',
  },
  s2c288d62: {
    marginTop: 'calc(0.25rem * 0.5)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
    borderRadius: '0.25rem',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sb17bd927: {
    marginTop: 'calc(0.25rem * 2)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 3)',
  },
})
const MAX_AVATAR_BYTES = 1024 * 1024
export type AccountProfileFormValues = {
  name: string
  description?: string
  /** Newly selected avatar image, if the user picked one. */
  imageFile?: File
}

/**
 * Shared, backend-agnostic account profile form (name + avatar + optional
 * description + optional email-notification opt-in). Used by both the web vault
 * and the desktop app so every create/edit account form is identical.
 *
 * Each platform wraps this in its own dialog chrome and handles persistence: it
 * passes the already-resolved `initialImageUrl` for an existing avatar and
 * receives the picked `imageFile` back on submit (to upload however it likes).
 * Uses only @shm/ui primitives — no app-context, router, or form-library deps —
 * so the lean vault can consume it.
 */
export function AccountProfileForm({
  initialName = '',
  initialDescription = '',
  initialImageUrl = '',
  showDescription = true,
  submitLabel = 'Save',
  loading,
  error,
  notificationOption,
  onCancel,
  onSubmit,
}: {
  initialName?: string
  initialDescription?: string
  /** Resolved URL of the existing avatar (the platform resolves it from its store). */
  initialImageUrl?: string
  showDescription?: boolean
  submitLabel?: string
  loading?: boolean
  error?: string
  notificationOption?: {
    label: string
    description: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
  }
  onCancel?: () => void
  onSubmit: (values: AccountProfileFormValues) => void | boolean | Promise<void> | Promise<boolean>
}) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [nameError, setNameError] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl)

  // Reset when the initial values change (dialog reopened for a different account).
  useEffect(() => {
    setName(initialName)
    setDescription(initialDescription)
    setNameError('')
    setAvatarError('')
    setImageFile(undefined)
    setPreviewUrl(initialImageUrl)
  }, [initialName, initialDescription, initialImageUrl])
  useEffect(() => {
    if (!imageFile) return
    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size >= MAX_AVATAR_BYTES) {
      setImageFile(undefined)
      setPreviewUrl(initialImageUrl)
      setAvatarError('Image must be smaller than 1 MiB')
      return
    }
    setAvatarError('')
    setImageFile(file)
  }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Name is required')
      return
    }
    if (avatarError) return
    setNameError('')
    await onSubmit({
      name: trimmedName,
      description: showDescription ? description.trim() || undefined : undefined,
      imageFile,
    })
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className={stylex.props(styles.sfbc6e290).className || ''}>
        {error ? <p className={stylex.props(styles.s11c1d1bc).className || ''}>{error}</p> : null}

        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <Label htmlFor="account-profile-name">Name</Label>
          <Input
            id="account-profile-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (nameError) setNameError('')
            }}
            placeholder="Display name"
            autoFocus
            disabled={loading}
          />
          {nameError ? <p className={stylex.props(styles.s11c1d1bc).className || ''}>{nameError}</p> : null}
        </div>

        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <div className={stylex.props(styles.s86ff3e5).className || ''}>
            <div className={stylex.props(styles_2.s291e7520).className || ''}>
              {previewUrl ? (
                <img src={previewUrl} className={stylex.props(styles.s5d7ceece).className || ''} alt="" />
              ) : (
                <Plus className={stylex.props(styles.s3566be64).className || ''} />
              )}
              <input
                id="account-profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className={stylex.props(styles.s6c60c43d).className || ''}
              />
            </div>
            <span className={stylex.props(styles.sa56e915f).className || ''}>
              {previewUrl ? 'Change photo (optional)' : 'Add a photo (optional)'}
            </span>
          </div>
          {avatarError ? <p className={stylex.props(styles.s11c1d1bc).className || ''}>{avatarError}</p> : null}
        </div>

        {showDescription ? (
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            <Label htmlFor="account-profile-description">Description (optional)</Label>
            <Textarea
              id="account-profile-description"
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, 512))}
              placeholder="A short bio or description"
              className={stylex.props(styles_2.s65d7e593).className || ''}
              disabled={loading}
            />
            <SizableText size="xs" color="muted" className={stylex.props(styles.s2d68c57c).className || ''}>
              {description.length}/512
            </SizableText>
          </div>
        ) : null}

        {notificationOption ? (
          <div className={stylex.props(styles.s9075a4c8).className || ''}>
            <div className={stylex.props(styles.se99caeca).className || ''}>
              <input
                id="account-profile-notification-email"
                type="checkbox"
                checked={notificationOption.checked}
                onChange={(event) => notificationOption.onCheckedChange(event.target.checked)}
                disabled={loading}
                className={stylex.props(styles.s2c288d62).className || ''}
              />
              <div className={stylex.props(styles.sfbc6e28d).className || ''}>
                <Label htmlFor="account-profile-notification-email">{notificationOption.label}</Label>
                <SizableText size="sm" color="muted">
                  {notificationOption.description}
                </SizableText>
              </div>
            </div>
          </div>
        ) : null}

        <div className={stylex.props(styles.sb17bd927).className || ''}>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" variant="default" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
