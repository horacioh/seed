import * as stylex from '@stylexjs/stylex'
import {UpdateStatus} from '@/types/updater-types'
import {Button} from '@shm/ui/button'
import {Progress} from '@shm/ui/components/progress'
import {SizableText} from '@shm/ui/text'
import {useState} from 'react'
import {useEffect} from 'react'

// Add type declaration for window.autoUpdate
const styles_2 = stylex.create({
  scffbbed4: {
    position: 'absolute',
    right: 'calc(var(--spacing) * 5)',
    bottom: 'calc(var(--spacing) * 5)',
    zIndex: '40',
    display: 'flex',
    minHeight: '100px',
    minWidth: '360px',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: '0.25rem',
    backgroundColor: 'var(--surface-contrast)',
    padding: 'calc(var(--spacing) * 4)',
    boxShadow: 'var(--shadow-md)',
  },
})
const styles = stylex.create({
  se658ac14: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
})
declare global {
  interface Window {
    autoUpdate?: {
      checkForUpdates: () => void
      onUpdateStatus: (handler: (status: UpdateStatus) => void) => void
      setUpdateStatus: (status: UpdateStatus) => void
      downloadAndInstall: () => void
      releaseNotes: () => void
    }
  }
}
export function AutoUpdater() {
  const updateStatus = useUpdateStatus()
  const handleDownloadAndInstall = () => {
    window.autoUpdate?.downloadAndInstall()
  }
  function handleLater() {
    window.autoUpdate?.setUpdateStatus({
      type: 'idle',
    })
  }
  return (
    <div
      className={stylex.props(styles_2.scffbbed4).className || ''}
      style={{
        transform:
          updateStatus?.type == 'update-available' ||
          updateStatus?.type == 'downloading' ||
          updateStatus?.type == 'restarting'
            ? 'translateX(0)'
            : 'translateX(500px)',
        transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
        opacity:
          updateStatus?.type == 'update-available' ||
          updateStatus?.type == 'downloading' ||
          updateStatus?.type == 'restarting'
            ? 1
            : 0,
      }}
    >
      <SizableText>{getUpdateStatusLabel(updateStatus)}</SizableText>
      {updateStatus?.type == 'update-available' && updateStatus.updateInfo ? (
        <div className={stylex.props(styles.se658ac14).className || ''}>
          <Button variant="default" onClick={handleDownloadAndInstall}>
            Download and Install
          </Button>
          <Button
            variant="ghost"
            className={stylex.props(styles.sf2718385).className || ''}
            onClick={() => handleLater()}
          >
            Later
          </Button>
          {updateStatus?.type == 'update-available' && updateStatus.updateInfo.release_notes && (
            <Button variant="outline" onClick={() => window.autoUpdate?.releaseNotes()}>
              Release Notes
            </Button>
          )}
        </div>
      ) : updateStatus?.type == 'downloading' ? (
        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <Progress key="download-progress" value={updateStatus.progress} />
        </div>
      ) : null}
    </div>
  )
}
export function useUpdateStatus() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  useEffect(() => {
    window.autoUpdate?.onUpdateStatus((status) => {
      //   console.log('== UPDATE ON UPDATE AVAILABLE', updateInfo)
      setUpdateStatus(status)
    })
  }, [])
  return updateStatus
}
export function getUpdateStatusLabel(updateStatus: UpdateStatus | null) {
  if (updateStatus == null) return updateStatus
  switch (updateStatus.type) {
    case 'update-available':
      return `Update available (${updateStatus.updateInfo.name})`
    case 'checking':
      return 'Checking for updates…'
    case 'downloading':
      return `Downloading update... (${updateStatus.progress}%)`
    case 'restarting':
      return 'Restarting…'
    case 'error':
      return `Update error: ${updateStatus.error}`
    default:
      // idle
      return null
  }
}
