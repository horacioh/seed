import * as stylex from '@stylexjs/stylex'
import {HyperlinkToolbarProps} from './blocknote'
import {SizableText} from '@shm/ui/text'
import {useEffect, useState} from 'react'
import {HypermediaLinkForm} from './hm-link-form'
const styles = stylex.create({
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  s67010d77: {
    position: 'absolute',
  },
  s808fc10e: {
    bottom: 'calc(0.25rem * 0)',
  },
  s3824ce: {
    zIndex: '50',
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
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  s34b570: {
    paddingBlock: 'calc(0.25rem * 4)',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
})
export function HypermediaLinkToolbar(
  props: HyperlinkToolbarProps & {
    openUrl: (url?: string | undefined, newWindow?: boolean | undefined) => void
    onClose: (bool: boolean) => void
    type: string
    isFocused: boolean
    setIsFocused: (focused: boolean) => void
  },
) {
  const [_url, setUrl] = useState(props.url || '')
  const [_text, setText] = useState(props.text || '')
  // const unpackedRef = useMemo(() => unpackHmId(_url), [_url])
  // const _latest = unpackedRef?.latest || false

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key == 'Enter') {
      event.preventDefault()
      // @ts-expect-error
      props.editHyperlink(_url, _text)
    }
  }
  useEffect(() => {
    props.editor.hyperlinkToolbar!.on('update', (state) => {
      if (!state.show) props.onClose(false)
      setText(state.text || '')
      setUrl(state.url || '')
    })
  }, [props.editor])
  useEffect(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [])
  return (
    <div
      className={
        stylex.props(
          styles.s5fd609e3,
          styles.s67010d77,
          styles.s808fc10e,
          styles.s3824ce,
          styles.s2ffff9,
          styles.s67e351ac,
          styles.s5d936fb,
          styles.s92852dd5,
          styles.sf79988b7,
          styles.s34b1ae,
          styles.s34b570,
          styles.s8a6c2964,
        ).className || ''
      }
    >
      <SizableText weight="bold">{`${props.type.charAt(0).toUpperCase() + props.type.slice(1)} settings`}</SizableText>
      <HypermediaLinkForm
        url={props.url}
        text={props.text}
        updateLink={props.updateHyperlink}
        // @ts-expect-error
        editLink={props.editHyperlink}
        openUrl={props.openUrl}
        type={props.type}
        // @ts-expect-error
        hasName={props.type !== 'mention'}
        // @ts-expect-error
        hasSearch={props.type === 'mention'}
        // @ts-expect-error
        isHmLink={!!unpackedRef}
      />
    </div>
  )
}
