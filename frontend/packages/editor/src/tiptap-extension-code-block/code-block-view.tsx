import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {NodeViewProps} from '@tiptap/core'
import {NodeViewContent} from '@tiptap/react'
import {Check, ChevronDown, Eye, EyeOff} from 'lucide-react'
import mermaid from 'mermaid'
import {ReactNode, useCallback, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

// Initialize mermaid
const styles_2 = stylex.create({
  s597c48d: {
    display: 'block',
  },
})
const styles = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s2ffff9: {
    display: 'flex',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sd5b2c253: {
    pointerEvents: 'auto',
  },
  s67010d77: {
    position: 'absolute',
  },
  s478fb0c3: {
    right: 'calc(0.25rem * 4)',
  },
  s696c5b9: {
    top: 'calc(0.25rem * 1)',
  },
  s3824ce: {
    zIndex: '50',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s11bd0ee9: {
    borderColor: 'var(--input)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s8a6c2a27: {
    boxShadow: 'var(--shadow-sm)',
  },
  s646c459b: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
      },
    },
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s52b11f8b: {
    width: '120px',
  },
  scdbaf625: {
    width: '100%',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s54eab79d: {
    opacity: '50%',
  },
  s11f8a88a: {
    borderColor: 'var(--muted)',
  },
  s56bd391d: {
    backgroundColor: 'var(--popover)',
  },
  s5f469b5b: {
    MsoverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  s6c4ecf55: {
    zIndex: '9999',
  },
  s33458b: {
    marginTop: 'calc(0.25rem * 1)',
  },
  s52db660e: {
    width: '150px',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
  s95afba94: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  s1bfab962: {
    color: 'var(--primary)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s8ce93e09: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
  },
  s3301fa: {
    marginBottom: 'calc(0.25rem * 2)',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  saeb1152d: {
    backgroundColor: 'oklch(93.6% 0.032 17.717)',
  },
  s6f33f8da: {
    color: 'oklch(57.7% 0.245 27.325)',
  },
  sa173a9a1: {
    fontFamily: 'var(--font-mono)',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s21707c9a: {
    overflow: 'auto',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  sfcf3a2ae: {
    maxWidth: '100%',
  },
  s237e4b3a: {
    touchAction: 'pan-x',
  },
  s237e4b3b: {
    touchAction: 'pan-y',
  },
  saa841a0f: {
    overflowX: 'auto',
  },
  sc4929253: {
    overscrollBehaviorX: 'contain',
  },
  s19ed0: {
    margin: 'calc(0.25rem * 0)',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s34b56f: {
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sd5276459: {
    display: 'inline-block',
  },
  s904b5a00: {
    minWidth: '100%',
  },
  s349b2b: {
    paddingRight: 'calc(0.25rem * 6)',
  },
})
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})
export const CodeBlockView = ({props, languages}: {props: NodeViewProps; languages: string[]}) => {
  const {node, updateAttributes} = props
  const [hovered, setHovered] = useState(false)
  const [language, setLanguage] = useState(node.attrs.language ? node.attrs.language : 'plaintext')
  const [open, setOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
  })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showMermaidPreview, setShowMermaidPreview] = useState(false)
  const [mermaidSvg, setMermaidSvg] = useState<string>('')
  const [mermaidError, setMermaidError] = useState<string | null>(null)
  const isMermaid = language === 'mermaid'
  const codeContent = node.textContent || ''

  // Ensure mermaid is in the languages list
  const allLanguages = languages.includes('mermaid')
    ? languages
    : [...languages, 'mermaid'].sort((a, b) => a.localeCompare(b))
  const renderMermaid = useCallback(async () => {
    if (!isMermaid || !codeContent.trim()) {
      setMermaidSvg('')
      setMermaidError(null)
      return
    }
    try {
      const id = `mermaid-preview-${Date.now()}`
      const {svg} = await mermaid.render(id, codeContent)
      setMermaidSvg(svg)
      setMermaidError(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid diagram'
      setMermaidError(errorMessage)
      setMermaidSvg('')
    }
  }, [isMermaid, codeContent])
  useEffect(() => {
    if (showMermaidPreview && isMermaid) {
      renderMermaid()
    }
  }, [showMermaidPreview, isMermaid, renderMermaid])
  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
      setHovered(false)
    }, 120)
  }
  useEffect(() => {
    return () => cancelClose()
  }, [])
  const handleChange = (newLanguage: string) => {
    updateAttributes({
      language: newLanguage,
    })
    setLanguage(newLanguage)
    setOpen(false)
    // Reset mermaid preview when language changes
    if (newLanguage !== 'mermaid') {
      setShowMermaidPreview(false)
      setMermaidSvg('')
      setMermaidError(null)
    }
  }
  const handleToggleDropdown = (e?: React.MouseEvent<HTMLButtonElement>) => {
    const isOpening = !open

    // When opening dropdown, calculate position from event target or ref
    if (isOpening) {
      const buttonElement = (e?.currentTarget as HTMLElement) || buttonRef.current
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + 3,
          left: rect.left,
        })
      } else {
        // Use requestAnimationFrame to wait for DOM
        requestAnimationFrame(() => {
          const buttonElement = buttonRef.current
          if (buttonElement) {
            const rect = buttonElement.getBoundingClientRect()
            setDropdownPosition({
              top: rect.bottom + 5,
              left: rect.left,
            })
          }
        })
      }
    }
    setOpen(isOpening)
  }

  // Update position when button moves on horizontal scroll
  useEffect(() => {
    if (!open || !buttonRef.current) return
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + 5,
          left: rect.left,
        })
      }
    }

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])
  return (
    <div
      className={
        stylex.props(styles.sdef3facc, styles.s2ffff9, styles.s3f58665f, styles.s67e351ac, styles.s92852dd5)
          .className || ''
      }
      onMouseEnter={() => {
        cancelClose()
        setHovered(true)
      }}
      onMouseLeave={() => {
        if (open) {
          scheduleClose()
        } else {
          setHovered(false)
        }
      }}
    >
      {/* Show language button on hover or when dropdown is open */}
      {(hovered || open) && (
        <div
          className={
            stylex.props(
              styles.sd5b2c253,
              styles.s67010d77,
              styles.s478fb0c3,
              styles.s696c5b9,
              styles.s3824ce,
              styles.s2ffff9,
              styles.sc6ed1702,
              styles.s5d936fb,
              styles.s1aa14,
            ).className || ''
          }
          contentEditable={false}
        >
          {/* Mermaid-specific buttons */}
          {isMermaid && (
            <>
              <Button
                className={
                  stylex.props(
                    styles.s11bd0ee9,
                    styles.s436dc7b6,
                    styles.s2ffff9,
                    styles.sc6ed1702,
                    styles.s5d936fa,
                    styles.sf79988b7,
                    styles.sad8c742c,
                    styles.s34b1ad,
                    styles.sc5dd13f4,
                    styles.sab7cc79b,
                    styles.s8a6c2a27,
                    styles.s646c459b,
                  ).className || ''
                }
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowMermaidPreview(!showMermaidPreview)
                }}
                type="button"
                title={showMermaidPreview ? 'Hide Preview' : 'Preview Diagram'}
              >
                {showMermaidPreview ? (
                  <EyeOff className={stylex.props(styles.sca3de967).className || ''} />
                ) : (
                  <Eye className={stylex.props(styles.sca3de967).className || ''} />
                )}
                <span>{showMermaidPreview ? 'Hide' : 'Preview'}</span>
              </Button>
            </>
          )}
          <div className={stylex.props(styles.sdef3facc, styles.s52b11f8b).className || ''}>
            <Button
              ref={buttonRef}
              className={
                stylex.props(
                  styles.s11bd0ee9,
                  styles.s436dc7b6,
                  styles.s2ffff9,
                  styles.scdbaf625,
                  styles.sc6ed1702,
                  styles.sc1a629cb,
                  styles.sf79988b7,
                  styles.sad8c742c,
                  styles.s34b1ae,
                  styles.sc5dd13f4,
                  styles.sab7cc6fa,
                  styles.s8a6c2a27,
                  styles.s646c459b,
                ).className || ''
              }
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleToggleDropdown(e)
              }}
              type="button"
            >
              <span className={stylex.props(styles.s6e724d66).className || ''}>{language || 'plaintext'}</span>
              <ChevronDown className={stylex.props(styles.sca3de968, styles.s54eab79d).className || ''} />
            </Button>
          </div>
        </div>
      )}

      {/* Portaled dropdown list */}
      {open ? (
        <>
          {createPortal(
            <div
              className={
                stylex.props(
                  styles.s11f8a88a,
                  styles.s56bd391d,
                  styles.s5f469b5b,
                  styles.s67010d77,
                  styles.s6c4ecf55,
                  styles.s33458b,
                  styles.s52db660e,
                  styles.sac38f2ae,
                  styles.sf79988b7,
                  styles.sad8c742c,
                  styles.s1aa14,
                  styles.s8a6c2964,
                ).className || ''
              }
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                maxHeight: '60vh',
              }}
              onMouseEnter={() => cancelClose()}
              onMouseLeave={() => scheduleClose()}
              onMouseDown={(e) => {
                // Don't blur editor when clicking options
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {allLanguages.map((item) => (
                <Button
                  key={item}
                  onClick={() => handleChange(item)}
                  className={
                    stylex.props(
                      styles.s95afba94,
                      styles.s2ffff9,
                      styles.scdbaf625,
                      styles.sc6ed1702,
                      styles.sc1a629cb,
                      styles.sf799897a,
                      styles.s34b1ad,
                      styles.sc5dd13f4,
                      styles.sab7cc6fa,
                    ).className || ''
                  }
                >
                  <span className={stylex.props(styles.s6e724d66).className || ''}>{item}</span>
                  {language === item && (
                    <Check className={stylex.props(styles.s1bfab962, styles.sca3de968).className || ''} />
                  )}
                </Button>
              ))}
            </div>,
            document.body,
          )}
        </>
      ) : null}

      {/* Mermaid preview area */}
      {isMermaid && showMermaidPreview && (
        <div
          className={
            stylex.props(
              styles.s1a01a0ed,
              styles.s8ce93e09,
              styles.s3301fa,
              styles.sf79988b7,
              styles.sad8c742c,
              styles.s1aa16,
            ).className || ''
          }
          contentEditable={false}
        >
          {mermaidError ? (
            <div
              className={
                stylex.props(styles.sf79988b7, styles.saeb1152d, styles.s1aa16, styles.s6f33f8da).className || ''
              }
            >
              <p className={stylex.props(styles.sa173a9a1, styles.sab7cc6fa).className || ''}>Error: {mermaidError}</p>
            </div>
          ) : mermaidSvg ? (
            <div
              className={
                stylex.props(styles.s2ffff9, styles.scdbaf625, styles.sc6ed1702, styles.sce22ca32, styles.s21707c9a)
                  .className || ''
              }
              dangerouslySetInnerHTML={{
                __html: mermaidSvg,
              }}
            />
          ) : (
            <p className={stylex.props(styles.sf2718385, styles.s65e234f5, styles.sab7cc6fa).className || ''}>
              Enter diagram code to preview
            </p>
          )}
        </div>
      )}

      <CodeBlockScroller language={language}>
        <NodeViewContent
          style={{
            whiteSpace: 'pre',
          }}
        />
      </CodeBlockScroller>
    </div>
  )
}

/**
 * The static pre/code chrome of a code block. Shared by the live node view
 * above and the server renderer (ssr-render.tsx) so both emit identical
 * markup.
 */
export function CodeBlockScroller({language, children}: {language: string; children: ReactNode}) {
  return (
    <div
      className={
        stylex.props(
          styles.sdef3facc,
          styles.scdbaf625,
          styles.sfcf3a2ae,
          styles.s237e4b3a,
          styles.s237e4b3b,
          styles.saa841a0f,
          styles.sac38f2ae,
          styles.sc4929253,
        ).className || ''
      }
    >
      <pre
        className={
          stylex.props(styles.s19ed0, styles.sf79988b7, styles.s60f53bca, styles.s34b1ae, styles.s34b56f).className ||
          ''
        }
      >
        <code className={stylex.props(styles_2.s597c48d).className || ''}>
          <div
            className={stylex.props(styles.sd5276459, styles.s904b5a00, styles.s349b2b).className || ''}
            style={{
              whiteSpace: 'pre',
            }}
          >
            {children}
          </div>
        </code>
      </pre>
    </div>
  )
}
