import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {hmId} from '@shm/shared'
import {IS_PROD_DESKTOP} from '@shm/shared/constants'
import {Button} from '@shm/ui/button'
import {useState} from 'react'
import {usePublishSite, useRemoveSiteDialog, useSeedHostDialog} from './publish-site'

// Mock data for testing - create proper UnpackedHypermediaId
// Using a valid-looking UID that matches the expected format
const styles = stylex.create({
  s1e2b1ef7: {
    position: 'fixed',
    right: 'calc(0.25rem * 4)',
    bottom: 'calc(0.25rem * 20)',
    zIndex: '50',
  },
  s97ff1ece: {
    marginBottom: 'calc(0.25rem * 2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  s28a873c2: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '700',
  },
  s3d075a5d: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    padding: 'calc(0.25rem * 0)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s7b266efb: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  sf686b5f9: {
    marginTop: 'calc(0.25rem * 2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s402349c2: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s83251ef7: {
    marginBottom: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '700',
  },
})
const MOCK_UID = 'z6MkhaXgBZDvotDkL5LzPvGhp5XAydZBz7LjJCRDmbo4bBgH'
const MOCK_DOCUMENT_ID: UnpackedHypermediaId = hmId(MOCK_UID)
const MOCK_DOCUMENT_ROUTE = {
  key: 'document' as const,
  id: MOCK_DOCUMENT_ID,
}
export function DebugDialogs() {
  const [showDebug, setShowDebug] = useState(false)
  const publishSiteDialog = usePublishSite()
  const seedHostDialog = useSeedHostDialog()
  const removeSiteDialog = useRemoveSiteDialog()

  // Don't show in production unless explicitly enabled
  if (!showDebug) {
    return IS_PROD_DESKTOP ? null : (
      <div className={stylex.props(styles.s1e2b1ef7).className || ''}>
        <Button size="sm" variant="ghost" onClick={() => setShowDebug(true)} className="opacity-30 hover:opacity-100">
          Debug Dialogs
        </Button>
      </div>
    )
  }
  return (
    <>
      <div className="bg-background/95 fixed right-4 bottom-20 z-50 flex max-w-xs flex-col gap-2 rounded-lg border p-4 shadow-lg backdrop-blur">
        <div className={stylex.props(styles.s97ff1ece).className || ''}>
          <span className={stylex.props(styles.s28a873c2).className || ''}>Debug Dialogs</span>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setShowDebug(false)}
            className={stylex.props(styles.s3d075a5d).className || ''}
          >
            ×
          </Button>
        </div>

        <div className={stylex.props(styles.sfbc6e28d).className || ''}>
          <span className={stylex.props(styles.s7b266efb).className || ''}>Publish Dialogs</span>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              publishSiteDialog.open({
                id: MOCK_DOCUMENT_ID,
              })
            }
          >
            Publish Space (Main)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              publishSiteDialog.open({
                id: MOCK_DOCUMENT_ID,
                step: 'seed-host-custom-domain',
              })
            }
          >
            Publish Space (Custom Domain)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('Opening Seed Host Dialog with:', {
                id: MOCK_DOCUMENT_ID,
                host: 'example.hyper.media',
              })
              seedHostDialog.open({
                id: MOCK_DOCUMENT_ID,
                host: 'example.hyper.media',
              })
            }}
          >
            Seed Host Published
          </Button>

          <Button size="sm" variant="outline" onClick={() => removeSiteDialog.open(MOCK_DOCUMENT_ID)}>
            Remove Space
          </Button>
        </div>

        <div className={stylex.props(styles.sf686b5f9).className || ''}>
          <span className={stylex.props(styles.s7b266efb).className || ''}>Test Specific Views</span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Test the dark background seed host container
              publishSiteDialog.open({
                id: MOCK_DOCUMENT_ID,
              })
              console.log('Testing dark background container')
            }}
          >
            Test Dark BG (Seed Host)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('Opening congrats dialog')
              seedHostDialog.open({
                id: MOCK_DOCUMENT_ID,
                host: 'mysite.hyper.media',
              })
            }}
          >
            Test Congrats Screen
          </Button>
        </div>

        <div className={stylex.props(styles.s402349c2).className || ''}>
          <div>Platform: {window.navigator.platform}</div>
          <div>Dark Mode: {document.documentElement.classList.contains('dark') ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Render dialog contents */}
      {publishSiteDialog.content}
      {seedHostDialog.content}
      {removeSiteDialog.content}
    </>
  )
}

// Additional debug component for testing specific dialog states
export function DebugPublishStates() {
  const publishDialog = usePublishSite()
  const [currentMode, setCurrentMode] = useState<string>('none')
  const modes = [
    {
      label: 'Initial Selection',
      value: 'initial',
    },
    {
      label: 'Self Host',
      value: 'self-host',
    },
    {
      label: 'Seed Host',
      value: 'seed-host',
    },
    {
      label: 'Input URL',
      value: 'input-url',
    },
    {
      label: 'Custom Domain',
      value: 'seed-host-custom-domain',
    },
  ]
  if (IS_PROD_DESKTOP) return null
  return (
    <div className="bg-background/95 fixed top-20 right-4 z-50 rounded-lg border p-4 shadow-lg backdrop-blur">
      <div className={stylex.props(styles.s83251ef7).className || ''}>Test Publish States</div>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        {modes.map((mode) => (
          <Button
            key={mode.value}
            size="sm"
            variant={currentMode === mode.value ? 'default' : 'outline'}
            onClick={() => {
              setCurrentMode(mode.value)
              if (mode.value === 'initial') {
                publishDialog.open({
                  id: MOCK_DOCUMENT_ID,
                })
              } else if (mode.value === 'seed-host-custom-domain') {
                publishDialog.open({
                  id: MOCK_DOCUMENT_ID,
                  step: 'seed-host-custom-domain',
                })
              } else {
                // For other modes, we'd need to modify the dialog to accept initial mode
                publishDialog.open({
                  id: MOCK_DOCUMENT_ID,
                })
                console.log(`Would open in ${mode.value} mode if supported`)
              }
            }}
          >
            {mode.label}
          </Button>
        ))}
      </div>
      {publishDialog.content}
    </div>
  )
}
