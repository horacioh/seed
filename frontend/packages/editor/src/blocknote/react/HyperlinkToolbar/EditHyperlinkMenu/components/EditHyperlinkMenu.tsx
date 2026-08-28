import * as stylex from '@stylexjs/stylex'
import {hmId} from '@shm/shared'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {packHmId} from '@shm/shared/utils'
import {Button} from '@shm/ui/button'
import {Checkbox} from '@shm/ui/components/checkbox'
import {Input} from '@shm/ui/components/input'
import {Label} from '@shm/ui/components/label'
import {ExternalLink, Link as LinkIcon, TextCursorInput, Unlink} from '@shm/ui/icons'
import {Separator} from '@shm/ui/separator'
import {Tooltip} from '@shm/ui/tooltip'
import {HTMLAttributes, forwardRef} from 'react'
const styles = stylex.create({
  s5ff7227c: {
    backgroundColor: 'var(--panel)',
  },
  s67010d77: {
    position: 'absolute',
  },
  s808fc10e: {
    bottom: 'calc(0.25rem * 0)',
  },
  s382452: {
    zIndex: '10',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s8a6c2a27: {
    boxShadow: 'var(--shadow-sm)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sabb4662d: {
    minWidth: 'calc(0.25rem * 40)',
  },
})
export type EditHyperlinkMenuProps = {
  url: string
  text: string
  update: (url: string, text: string, latest: boolean) => void
  openUrl: (url?: string | undefined, newWindow?: boolean | undefined) => void
}

/**
 * Menu which opens when editing an existing hyperlink or creating a new one.
 * Provides input fields for setting the hyperlink URL and title.
 */
export const EditHyperlinkMenu = forwardRef<HTMLDivElement, EditHyperlinkMenuProps & HTMLAttributes<HTMLDivElement>>(
  ({url, text, update, className, ...props}, ref) => {
    const unpackedRef = null // Placeholder - should parse URL to extract HM link data

    return (
      <div
        className={
          stylex.props(
            styles.s5ff7227c,
            styles.s67010d77,
            styles.s808fc10e,
            styles.s382452,
            styles.s2ffff9,
            styles.s67e351ac,
            styles.s5d936fb,
            styles.s92852dd5,
            styles.sf79988b7,
            styles.s1aa15,
            styles.s8a6c2a27,
          ).className || ''
        }
      >
        <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fb, styles.s1aa14).className || ''}>
          <TextCursorInput className={stylex.props(styles.sca3de968).className || ''} />
          <Input
            className={stylex.props(styles.sb42feb5d).className || ''}
            placeholder="link text"
            id="link-text"
            // @ts-expect-error
            key={props.text}
            // @ts-expect-error
            value={props.text}
          />
        </div>
        <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fb, styles.s1aa14).className || ''}>
          <LinkIcon className={stylex.props(styles.sca3de968).className || ''} />
          {/* @ts-expect-error */}
          <Input className={stylex.props(styles.sb42feb5d).className || ''} key={props.url} value={props.url} />
        </div>
        <Separator />
        <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s1aa14).className || ''}>
          <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fb).className || ''}>
            {unpackedRef ? (
              <div
                className={
                  stylex.props(styles.s2ffff9, styles.sabb4662d, styles.sc6ed1702, styles.s5d936fb).className || ''
                }
              >
                <Checkbox
                  id="link-latest"
                  // @ts-expect-error
                  key={props.url}
                  // @ts-expect-error
                  defaultValue={!!unpackedRef.latest}
                  onCheckedChange={(newValue) => {
                    let unpacked = unpackedRef as UnpackedHypermediaId
                    let newUrl = packHmId(
                      hmId(unpacked.uid, {
                        version: unpacked.version,
                        blockRef: unpacked.blockRef,
                        blockRange: unpacked.blockRange,
                        latest: newValue != 'indeterminate' ? newValue : false,
                      }),
                    )

                    // @ts-expect-error
                    props.editHyperlink(newUrl, props.text, true)
                  }}
                />
                <Label htmlFor="link-latest" size="sm">
                  Link to Latest Version
                </Label>
              </div>
            ) : null}
            <Tooltip content="Remove link">
              {/* @ts-expect-error */}
              <Button size="iconSm" onClick={props.deleteHyperlink}>
                <Unlink className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
            </Tooltip>
            <Tooltip content="Open in a new Window">
              <Button size="iconSm" onClick={() => props.openUrl(url, true)}>
                <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  },
)
