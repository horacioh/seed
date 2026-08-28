import * as stylex from '@stylexjs/stylex'
import {fileUpload} from '@/utils/file-upload'
import {Button} from '@shm/ui/button'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {Trash} from 'lucide-react'
import {ChangeEvent} from 'react'
import appError from '../errors'
const styles_4 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34a2ad: {
    paddingTop: 'calc(0.25rem * 6)',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_3 = stylex.create({
  sa6650a61: {
    height: '25vh',
    opacity: '100%',
  },
})
const styles_2 = stylex.create({
  s856bab52: {
    backgroundColor: 'var(--accent)',
  },
})
const styles = stylex.create({
  sca2e147b: {
    position: 'relative',
    height: 'calc(0.25rem * 0)',
    width: '100%',
    backgroundColor: 'transparent',
    opacity: '0%',
    transitionProperty: 'all',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '300ms',
  },
  s6e9a2c6f: {
    position: 'absolute',
    top: 'calc(0.25rem * 0)',
    right: 'calc(0.25rem * 0)',
    left: 'calc(0.25rem * 0)',
    zIndex: '10',
    width: '100%',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s1b72923d: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
})
export function CoverImage({
  url,
  label,
  showOutline = true,
  show = true,
  onCoverUpload,
  onRemoveCover,
}: {
  label?: string
  url?: string
  showOutline?: boolean
  show: boolean
  onCoverUpload?: (avatar: string) => void
  onRemoveCover?: () => void
}) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    const file = fileList?.[0]
    if (!file || !onCoverUpload) return
    fileUpload(file)
      .then((data) => {
        onCoverUpload(data)
      })
      .catch((error) => {
        // @ts-expect-error
        appError(`Failed to upload avatar: ${e.message}`, {
          error,
        })
      })
      .finally(() => {
        event.target.value = ''
      })
  }
  const coverImage = (
    <div
      className={cn(
        stylex.props(styles.sca2e147b).className || '',
        stylex.props(show ? styles_3.sa6650a61 : null).className || '',
        stylex.props(url ? styles_2.s856bab52 : null).className || '',
      )}
    >
      {url ? (
        <img
          src={url}
          title={label}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            objectFit: 'cover',
          }}
        />
      ) : null}
    </div>
  )
  if (!onCoverUpload) return coverImage
  return (
    <div className="group">
      {show ? (
        <div className={stylex.props(styles.s6e9a2c6f).className || ''}>
          {showOutline ? <div /> : null}
          <div className={stylex.props(styles.s34b1ad).className || ''}>
            <div
              className={
                stylex.props(
                  styles_4.s2ffff9,
                  styles_4.sc6ed1702,
                  styles_4.s5d936fb,
                  styles_4.s34b1af,
                  styles_4.s34a2ad,
                  styles_4.s765a26ee,
                ).className || ''
              }
            >
              <Tooltip content="Remove Cover image">
                <Button variant="destructive" onClick={onRemoveCover}>
                  <Trash className={stylex.props(styles.sca3de968).className || ''} />
                </Button>
              </Tooltip>
              <div className={stylex.props(styles.s1b72923d).className || ''}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{
                    height: '100%',
                    opacity: 0,
                    display: 'flex',
                    position: 'absolute',
                    left: 0,
                    right: -12,
                    top: 0,
                    zIndex: 100,
                    backgroundColor: '#666666',
                  }}
                />
                <Button variant="ghost" className={stylex.props(styles.s436dc7b6).className || ''}>{`${
                  url ? 'CHANGE' : 'ADD'
                } COVER`}</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {coverImage}
    </div>
  )
}
