import * as stylex from '@stylexjs/stylex'
import {type InputHTMLAttributes, useEffect, useRef, useState} from 'react'
const styles_3 = stylex.create({
  sf6d7961: {
    borderColor: 'var(--primary)',
  },
  s54a0b609: {
    borderColor: 'color-mix(in oklab, var(--primary) 50%, transparent)',
  },
})
const styles_2 = stylex.create({
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s2ff5a8: {
    height: 'calc(0.25rem * 14)',
  },
  s36c737: {
    width: 'calc(0.25rem * 12)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  sc41b2606: {
    fontSize: '1.5rem',
    lineHeight: 'var(--text-2xl--line-height)',
  },
  s62c182b1: {
    fontWeight: '600',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sc883a3d5: {
    boxShadow: '0 0 0 2px var(--ring-color, currentcolor)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
})
const styles = stylex.create({
  s4c15bd54: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 2)',
  },
})
interface CodeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  /** Called with the full code as soon as every cell is filled (typed or pasted). */
  onComplete?: (value: string) => void
  length?: number
}

/**
 * Multi-cell numeric verification-code input (e.g. a 4-digit email code).
 * Shared between the desktop app and the web vault so the email-change UX is
 * identical. Handles per-cell entry, backspace/arrow navigation, and full-code
 * paste.
 */
export function CodeInput({value, onChange, onComplete, length = 4, className, ...props}: CodeInputProps) {
  // We track focus state to visually highlight the active cell for better UX.
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  // We need refs to programmatically shift focus between cells as the user types.
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Autofocus the first cell when the input appears so the user can type right away.
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])
  const handleChange = (index: number, digit: string) => {
    // Restrict input to single digits. Prevents broken pasting into one cell.
    const cleaned = digit.replace(/\D/g, '').slice(-1)
    if (!cleaned) return
    const chars = value.split('')
    chars[index] = cleaned
    const newValue = chars.join('').slice(0, length)
    onChange(newValue)

    // Shift focus forward after entry. Maintains smooth typing flow.
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    if (newValue.length === length) {
      onComplete?.(newValue)
    }
  }
  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      const chars = value.split('')
      if (chars[index]) {
        // Wipe current cell. Let user retype without extra keystrokes.
        chars[index] = ''
        onChange(chars.join(''))
      } else if (index > 0) {
        // Step back to previous cell. Clear it so user can retype.
        const prevChars = value.split('')
        prevChars[index - 1] = ''
        onChange(prevChars.join(''))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault()
    // Allow full-code paste. Users expect to paste the entire code at once.
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted)
      // Jump to last filled cell. User can continue typing from there.
      const nextIndex = Math.min(pasted.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      if (pasted.length === length) {
        onComplete?.(pasted)
      }
    }
  }
  const handleFocus = (index: number) => {
    setFocusedIndex(index)
    // Pre-select content. User can replace the digit with a single keystroke.
    inputRefs.current[index]?.select()
  }
  return (
    <div className={stylex.props(styles.s4c15bd54).className || ''} onPaste={handlePaste}>
      {Array.from(
        {
          length,
        },
        (_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={value[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={() => handleFocus(i)}
            onBlur={() => setFocusedIndex(null)}
            className={
              (stylex.props(
                styles_2.s436dc7b6,
                styles_2.s2ff5a8,
                styles_2.s36c737,
                styles_2.sf79988b7,
                styles_2.sad8c742c,
                styles_2.s65e234f5,
                styles_2.sc41b2606,
                styles_2.s62c182b1,
                styles_2.sf7fb00e8,
              ).className || '') +
              ' ' +
              (focusedIndex === i
                ? (stylex.props(styles_2.sc883a3d5).className || '') +
                  ' ' +
                  (stylex.props(styles_3.sf6d7961).className || '')
                : stylex.props(styles_2.s1a01a0ed).className || '') +
              ' ' +
              (value[i] ? stylex.props(styles_3.s54a0b609).className || '' : '') +
              ' ' +
              (className || '')
            }
            aria-label={`Digit ${i + 1} of ${length}`}
            {...props}
          />
        ),
      )}
    </div>
  )
}
