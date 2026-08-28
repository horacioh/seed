import * as stylex from '@stylexjs/stylex'
import {useEffect, useState, type FormEvent} from 'react'
import {Button} from '../button'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from './dialog'
import {Input} from './input'
import {Label} from './label'

/**
 * Shared "change notification server URL" dialog used by both the desktop app
 * and the web vault. The dialog owns the form state, URL validation, and the
 * error/loading display; the platform persists the value inside `onSave` (the
 * web vault stores it in the encrypted vault data, the desktop app in its local
 * settings), so the UX stays identical. An empty value falls back to the
 * server default.
 */
const styles_2 = stylex.create({
  s8c21f341: {
    maxWidth: '440px',
  },
})
const styles = stylex.create({
  s129e46b3: {
    fontWeight: '500',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sa56e9200: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sfa692657: {
    color: 'var(--foreground)',
    fontFamily: 'var(--font-mono)',
    wordBreak: 'break-all',
  },
  s11c1d1bc: {
    color: 'var(--destructive)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
export function NotificationServerDialog({
  open,
  onOpenChange,
  currentUrl,
  defaultUrl,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The current override (empty string means "use the server default"). */
  currentUrl: string
  /** The server default, shown as a hint. */
  defaultUrl: string
  /** Persist the normalized URL ('' = use default). Throw to surface an error. */
  onSave: (url: string) => Promise<void>
}) {
  const [value, setValue] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  useEffect(() => {
    if (!open) return
    setValue(currentUrl)
    setError(null)
    setIsSaving(false)
  }, [open, currentUrl])
  const hasChanges = value.trim() !== currentUrl.trim()
  const effectiveUrl = currentUrl.trim() || defaultUrl
  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    const trimmed = value.trim()
    let normalized = ''
    if (trimmed) {
      try {
        normalized = new URL(trimmed).toString()
      } catch {
        setError(`Invalid notification server URL: ${trimmed}`)
        return
      }
    }
    setError(null)
    setIsSaving(true)
    try {
      await onSave(normalized)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notification server URL')
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={stylex.props(styles_2.s8c21f341).className || ''}>
        <DialogHeader>
          <DialogTitle>Change Notify Server URL</DialogTitle>
          <DialogDescription>
            Current URL: <span className={stylex.props(styles.s129e46b3).className || ''}>{effectiveUrl}</span>
          </DialogDescription>
        </DialogHeader>
        <form className={stylex.props(styles.sfbc6e290).className || ''} onSubmit={handleSubmit}>
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            <Label htmlFor="notify-server-url">Notify Server URL</Label>
            <Input
              id="notify-server-url"
              type="url"
              placeholder="Leave empty to use the server default"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
            <p className={stylex.props(styles.sa56e9200).className || ''}>
              Server default: <span className={stylex.props(styles.sfa692657).className || ''}>{defaultUrl}</span>
            </p>
          </div>
          {error ? <p className={stylex.props(styles.s11c1d1bc).className || ''}>{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !hasChanges}>
              {isSaving ? 'Saving…' : 'Save Notify Server URL'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
