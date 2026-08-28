import * as stylex from '@stylexjs/stylex'
import type {HMMetadata} from '@seed-hypermedia/client/hm-types'
import {FileText, ImagePlus, Plus, Smile} from 'lucide-react'
import {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react'
import {Button} from './button'
import {MenuItemType, OptionsDropdown} from './options-dropdown'
import {cn} from './utils'
const styles_5 = stylex.create({
  s454e1135: {
    '--ring-color': 'transparent',
  },
})
const styles_4 = stylex.create({
  sa0080bc5: {
    boxShadow: 'none',
  },
})
const styles_3 = stylex.create({
  s486c2d2f: {
    opacity: '100%',
  },
  scdbaf625: {
    width: '100%',
  },
  sc9aa04b1: {
    resize: 'none',
  },
  s29df1839: {
    borderStyle: 'none',
  },
  sc5a0131: {
    borderColor: 'transparent',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  sc41b2606: {
    fontSize: '1.5rem',
    lineHeight: 'var(--text-2xl--line-height)',
  },
  sa16ea943: {
    fontWeight: '700',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  sc883a3d3: {
    boxShadow: '0 0 0 0px var(--ring-color, currentcolor)',
  },
  s4a7318b5: {
    ':focus': {
      boxShadow: '0 0 0 0px var(--ring-color, currentcolor)',
    },
  },
  sbf4d903d: {
    '@media ((max-width: 767px))': {
      lineHeight: '1.25',
    },
  },
  s2daca00b: {
    '@media ((min-width: 768px))': {
      fontSize: '2.25rem',
      lineHeight: 'var(--text-4xl--line-height)',
    },
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s8d519a7f: {
    fontFamily: 'var(--font-serif)',
  },
  sab7cc794: {
    fontSize: '1.25rem',
    lineHeight: 'var(--text-xl--line-height)',
  },
  s14e67425: {
    fontWeight: '400',
  },
})
const styles_2 = stylex.create({
  s68b0d4ed: {
    '@media ((min-width: 768px))': {
      display: 'none',
    },
  },
  s96f9d721: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'var(--overlay-5-10)',
        opacity: '100%',
      },
    },
    height: 'calc(var(--spacing) * 7)',
    flexShrink: '0',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    opacity: '80%',
    ':active': {
      scale: '0.98',
    },
  },
  s46d9a5a5: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1.5)',
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: '200ms',
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
    },
  },
  s486c2d2f: {
    opacity: '100%',
  },
  s3500d61e: {
    position: 'absolute',
    bottom: '100%',
    left: 'calc(var(--spacing) * 0)',
    zIndex: '10',
    marginBottom: 'calc(var(--spacing) * 1)',
    marginLeft: 'calc(var(--spacing) * -2)',
    '@media ((max-width: 767px))': {
      display: 'none',
    },
  },
  s6067231c: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingTop: 'calc(var(--spacing) * 5)',
    '@media ((min-width: 640px))': {
      paddingInline: 'calc(var(--spacing) * 6)',
    },
  },
  s95dbea35: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'var(--overlay-5-10)',
        opacity: '100%',
      },
    },
    height: 'calc(var(--spacing) * 7)',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    opacity: '80%',
    ':active': {
      scale: '0.98',
    },
  },
})
const styles = stylex.create({
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s88a3565a: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
  s41184b3a: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
})
type MetadataAffordanceKey = 'icon' | 'cover'
/** Visibility states for the metadata affordance row: always shown, hover-revealed, or mobile-only. */
const visibilityStyles = stylex.create({
  visible: {
    opacity: 1,
  },
  hover: {
    pointerEvents: 'none',
    opacity: 0,
  },
  mobileVisible: {
    opacity: {
      default: 1,
      '@media (min-width: 48rem)': 0,
    },
    pointerEvents: {
      default: null,
      '@media (min-width: 48rem)': 'none',
    },
  },
})

export type DocumentMetadataAffordanceButtonsProps = {
  metadata?: Pick<HMMetadata, 'icon' | 'cover' | 'summary'> | null
  visible: boolean
  onMetadata: (values: Partial<HMMetadata>) => void
  onRequestSummary: () => void
  fileUpload?: (file: File) => Promise<string>
  className?: string
  onBeforeMetadataChange?: () => void
  showSummary?: boolean
  keepSummaryButtonVisible?: boolean
  hideSummaryButton?: boolean
  alwaysVisibleOnMobile?: boolean
  mobileOnly?: boolean
}
export type EditableDocumentMetadataFieldsProps = {
  name: string
  summary: string
  metadata?: Pick<HMMetadata, 'icon' | 'cover' | 'summary'> | null
  onMetadata: (values: Partial<HMMetadata>) => void
  onBeginEdit: () => void
  fileUpload?: (file: File) => Promise<string>
  className?: string
  titleClassName?: string
  summaryClassName?: string
  focusTitleOnMount?: boolean
  onCancelEdit?: () => void
  onSummaryEnter?: () => void
  summaryRequested: boolean
  onSummaryRequestedChange: (requested: boolean) => void
}
export type HomeDocumentMetadataAffordanceBarProps = {
  metadata?: Pick<HMMetadata, 'icon' | 'cover' | 'summary'> | null
  onMetadata: (values: Partial<HMMetadata>) => void
  onBeginEdit: () => void
  fileUpload?: (file: File) => Promise<string>
  className?: string
}
function toIpfsUrl(cidOrUrl: string) {
  return cidOrUrl.startsWith('ipfs://') ? cidOrUrl : `ipfs://${cidOrUrl}`
}

/** Subtle inline buttons that hint at optional document metadata fields. */
export function DocumentMetadataAffordanceButtons({
  metadata,
  visible,
  onMetadata,
  onRequestSummary,
  fileUpload,
  className,
  onBeforeMetadataChange,
  showSummary = true,
  keepSummaryButtonVisible = false,
  hideSummaryButton = false,
  alwaysVisibleOnMobile = false,
  mobileOnly = false,
}: DocumentMetadataAffordanceButtonsProps) {
  const iconInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const summaryMenuRequestedRef = useRef(false)
  const [uploading, setUploading] = useState<MetadataAffordanceKey | null>(null)
  const hasIcon = !!metadata?.icon
  const hasCover = !!metadata?.cover
  const hasSummary = !!metadata?.summary
  const showIconButton = !hasIcon && !!fileUpload
  const showSummaryButton = showSummary && !hideSummaryButton && (!hasSummary || keepSummaryButtonVisible)
  const showCoverButton = !hasCover && !!fileUpload
  const visibility = visible ? 'visible' : alwaysVisibleOnMobile ? 'mobile-visible' : 'hover'
  const rowIsAccessible = visible || alwaysVisibleOnMobile
  const tabIndex = rowIsAccessible ? undefined : -1
  async function handleFileChange(field: MetadataAffordanceKey, event: ChangeEvent<HTMLInputElement>) {
    event.stopPropagation()
    const file = event.target.files?.[0]
    if (!file || !fileUpload) return
    setUploading(field)
    try {
      const cid = await fileUpload(file)
      onBeforeMetadataChange?.()
      onMetadata({
        [field]: toIpfsUrl(cid),
      } as Partial<HMMetadata>)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Failed to upload document ${field}: ${message}`, error)
    } finally {
      setUploading(null)
      event.target.value = ''
    }
  }
  if (!showIconButton && !showSummaryButton && !showCoverButton) {
    return null
  }
  if (mobileOnly) {
    const menuItems: (MenuItemType | null)[] = [
      showIconButton
        ? {
            key: 'icon',
            label: 'Add icon',
            icon: <Smile className={stylex.props(styles.s3269316e).className || ''} />,
            onClick: () => iconInputRef.current?.click(),
          }
        : null,
      showSummaryButton
        ? {
            key: 'summary',
            label: 'Add Summary',
            icon: <FileText className={stylex.props(styles.s3269316e).className || ''} />,
            onClick: () => {
              summaryMenuRequestedRef.current = true
              onBeforeMetadataChange?.()
            },
          }
        : null,
      showCoverButton
        ? {
            key: 'cover',
            label: 'Add cover image',
            icon: <ImagePlus className={stylex.props(styles.s3269316e).className || ''} />,
            onClick: () => coverInputRef.current?.click(),
          }
        : null,
    ]
    return (
      <div className={[stylex.props(styles_2.s68b0d4ed).className || '', className].filter(Boolean).join(' ')}>
        {showIconButton ? (
          <input
            ref={iconInputRef}
            type="file"
            accept="image/*"
            aria-label="Choose document icon"
            className={stylex.props(styles.s88a3565a).className || ''}
            tabIndex={-1}
            onChange={(event) => void handleFileChange('icon', event)}
          />
        ) : null}
        {showCoverButton ? (
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            aria-label="Choose document cover image"
            className={stylex.props(styles.s88a3565a).className || ''}
            tabIndex={-1}
            onChange={(event) => void handleFileChange('cover', event)}
          />
        ) : null}
        <OptionsDropdown
          menuItems={menuItems}
          align="end"
          side="bottom"
          button={
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className={stylex.props(styles_2.s96f9d721).className || ''}
              aria-label="Add document metadata"
            >
              <Plus className={stylex.props(styles.s3269316e).className || ''} />
              <span>Add</span>
            </Button>
          }
          onCloseAutoFocus={(event) => {
            if (summaryMenuRequestedRef.current) {
              event.preventDefault()
              onRequestSummary()
            }
            summaryMenuRequestedRef.current = false
          }}
        />
      </div>
    )
  }
  return (
    <div
      data-document-metadata-affordances
      data-visibility={visibility}
      className={cn(
        stylex.props(styles_2.s46d9a5a5).className || '',
        stylex.props(
          visibility === 'visible'
            ? visibilityStyles.visible
            : visibility === 'mobile-visible'
              ? visibilityStyles.mobileVisible
              : visibilityStyles.hover,
        ).className || '',
        className,
      )}
      aria-hidden={!rowIsAccessible}
    >
      {showIconButton ? (
        <>
          <input
            ref={iconInputRef}
            type="file"
            accept="image/*"
            aria-label="Choose document icon"
            className={stylex.props(styles.s88a3565a).className || ''}
            tabIndex={-1}
            onChange={(event) => void handleFileChange('icon', event)}
          />
          <MetadataHintButton
            aria-label="Add document icon"
            icon={<Smile className={stylex.props(styles.s3269316e).className || ''} />}
            loading={uploading === 'icon'}
            tabIndex={tabIndex}
            onClick={() => iconInputRef.current?.click()}
          >
            Add icon
          </MetadataHintButton>
        </>
      ) : null}
      {showSummaryButton ? (
        <MetadataHintButton
          aria-label="Add document summary"
          icon={<FileText className={stylex.props(styles.s3269316e).className || ''} />}
          tabIndex={tabIndex}
          onClick={() => {
            onBeforeMetadataChange?.()
            onRequestSummary()
          }}
        >
          Add Summary
        </MetadataHintButton>
      ) : null}
      {showCoverButton ? (
        <>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            aria-label="Choose document cover image"
            className={stylex.props(styles.s88a3565a).className || ''}
            tabIndex={-1}
            onChange={(event) => void handleFileChange('cover', event)}
          />
          <MetadataHintButton
            aria-label="Add document cover image"
            icon={<ImagePlus className={stylex.props(styles.s3269316e).className || ''} />}
            loading={uploading === 'cover'}
            tabIndex={tabIndex}
            onClick={() => coverInputRef.current?.click()}
          >
            Add cover image
          </MetadataHintButton>
        </>
      ) : null}
    </div>
  )
}

/** Editable title/summary fields with subtle metadata add buttons. */
export function EditableDocumentMetadataFields({
  name,
  summary,
  metadata,
  onMetadata,
  onBeginEdit,
  fileUpload,
  className,
  titleClassName,
  summaryClassName,
  focusTitleOnMount,
  onCancelEdit,
  onSummaryEnter,
  summaryRequested,
  onSummaryRequestedChange,
}: EditableDocumentMetadataFieldsProps) {
  const titleRef = useRef<HTMLTextAreaElement | null>(null)
  const summaryRef = useRef<HTMLTextAreaElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const [summaryFocused, setSummaryFocused] = useState(false)
  const summaryText = summary ?? ''
  const showSummaryInput = !!summaryText || summaryRequested || summaryFocused
  const showAffordances = hovered || summaryRequested
  const reflowTextareas = useCallback(() => {
    const resize = () => {
      if (titleRef.current) resizeTextarea(titleRef.current)
      if (summaryRef.current) resizeTextarea(summaryRef.current)
    }
    resize()
    requestAnimationFrame(resize)
    ;(
      document as Document & {
        fonts?: FontFaceSet
      }
    ).fonts?.ready
      .then(resize)
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (titleRef.current) resizeTextarea(titleRef.current)
  }, [name])
  useEffect(() => {
    const resizeTextareas = () => {
      if (titleRef.current) resizeTextarea(titleRef.current)
      if (summaryRef.current) resizeTextarea(summaryRef.current)
    }
    resizeTextareas()
    window.addEventListener('resize', resizeTextareas)
    return () => window.removeEventListener('resize', resizeTextareas)
  }, [])
  useEffect(() => {
    if (focusTitleOnMount) titleRef.current?.focus()
  }, [focusTitleOnMount])
  useEffect(() => {
    if (summaryRef.current) resizeTextarea(summaryRef.current)
  }, [summaryText, showSummaryInput])
  useEffect(() => {
    reflowTextareas()
    window.addEventListener('resize', reflowTextareas)
    const container = titleRef.current?.parentElement
    const observer = container && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(reflowTextareas) : null
    observer?.observe(container!)
    return () => {
      window.removeEventListener('resize', reflowTextareas)
      observer?.disconnect()
    }
  }, [reflowTextareas])
  useEffect(() => {
    if (!summaryRequested) return
    summaryRef.current?.focus()
  }, [summaryRequested])
  function requestSummary() {
    onSummaryRequestedChange(true)
  }
  return (
    <div
      className={cn(stylex.props(styles.s41184b3a).className || '', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <DocumentMetadataAffordanceButtons
        metadata={metadata}
        visible={showAffordances}
        fileUpload={fileUpload}
        className={stylex.props(styles_2.s3500d61e).className || ''}
        onBeforeMetadataChange={onBeginEdit}
        onMetadata={onMetadata}
        onRequestSummary={requestSummary}
        keepSummaryButtonVisible={summaryRequested}
        hideSummaryButton={summaryFocused && !summaryRequested && !summaryText}
        alwaysVisibleOnMobile
      />
      <textarea
        ref={titleRef}
        rows={1}
        aria-label="Document title"
        className={cn(
          stylex.props(
            styles_3.scdbaf625,
            styles_3.sc9aa04b1,
            styles_3.s29df1839,
            styles_3.sc5a0131,
            styles_3.s60f53bca,
            styles_3.sc41b2606,
            styles_3.sa16ea943,
            styles_3.sa602a1e3,
            styles_3.sc883a3d3,
            styles_3.s4a7318b5,
            styles_3.sbf4d903d,
            styles_3.s2daca00b,
          ).className || '',
          stylex.props(styles_4.sa0080bc5).className || '',
          stylex.props(styles_5.s454e1135).className || '',
          titleClassName,
        )}
        value={name}
        onFocus={onBeginEdit}
        onInput={(event) => {
          resizeTextarea(event.currentTarget)
          onMetadata({
            name: event.currentTarget.value,
          })
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onCancelEdit?.()
            event.currentTarget.blur()
            return
          }
          if (event.key === 'Enter') {
            event.preventDefault()
            requestSummary()
          }
        }}
        placeholder="Document Title"
      />
      {showSummaryInput ? (
        <textarea
          ref={summaryRef}
          rows={1}
          aria-label="Document summary"
          className={cn(
            stylex.props(
              styles_3.sf2718385,
              styles_3.scdbaf625,
              styles_3.sc9aa04b1,
              styles_3.s29df1839,
              styles_3.sc5a0131,
              styles_3.s60f53bca,
              styles_3.s8d519a7f,
              styles_3.sab7cc794,
              styles_3.s14e67425,
              styles_3.sa602a1e3,
              styles_3.sc883a3d3,
              styles_3.s4a7318b5,
            ).className || '',
            stylex.props(styles_4.sa0080bc5).className || '',
            stylex.props(styles_5.s454e1135).className || '',
            summaryClassName,
          )}
          value={summaryText}
          onFocus={() => {
            setSummaryFocused(true)
            onBeginEdit()
          }}
          onInput={(event) => {
            const nextSummary = event.currentTarget.value.replace(/\n/g, '')
            resizeTextarea(event.currentTarget)
            onMetadata({
              summary: nextSummary,
            })
          }}
          onBlur={(event) => {
            const relatedTarget = event.relatedTarget
            if (
              relatedTarget instanceof Element &&
              relatedTarget.closest('[role="menu"], [data-radix-menu-content], [data-radix-popover-content]')
            ) {
              return
            }
            onSummaryRequestedChange(false)
            setSummaryFocused(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onCancelEdit?.()
              event.currentTarget.blur()
              return
            }
            if (event.key === 'Enter') {
              event.preventDefault()
              onSummaryEnter?.()
            }
          }}
          placeholder="Document Summary"
        />
      ) : null}
    </div>
  )
}

/** Metadata affordance area used by home documents, which have no document header. */
export function HomeDocumentMetadataAffordanceBar({
  metadata,
  onMetadata,
  onBeginEdit,
  fileUpload,
  className,
}: HomeDocumentMetadataAffordanceBarProps) {
  const showAffordances = true
  return (
    <div
      data-home-document-metadata-affordances
      className={cn(stylex.props(styles_2.s6067231c).className || '', className)}
    >
      <DocumentMetadataAffordanceButtons
        metadata={metadata}
        visible={showAffordances}
        fileUpload={fileUpload}
        onBeforeMetadataChange={onBeginEdit}
        onMetadata={onMetadata}
        onRequestSummary={() => {}}
        showSummary={false}
      />
    </div>
  )
}
function MetadataHintButton({
  children,
  icon,
  ...props
}: React.ComponentProps<'button'> & {
  icon: React.ReactNode
  loading?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className={stylex.props(styles_2.s95dbea35).className || ''}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </Button>
  )
}
function resizeTextarea(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
