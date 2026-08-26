import * as stylex from '@stylexjs/stylex'
import {HelpCircle, X} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import {Button} from './button'
import {Badge} from './components/badge'
import {Input} from './components/input'
import {Label} from './components/label'
import {ScrollArea} from './components/scroll-area'
import {Switch} from './components/switch'
import {ImageForm} from './image-form'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './select-dropdown'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
const styles = stylex.create({
  sd6dded7f: {
    display: 'flex',
    height: '100%',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sfaef8fa5: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 'calc(0.25rem * 4)',
    paddingBottom: 'calc(0.25rem * 0)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s21916808: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 5)',
    padding: 'calc(0.25rem * 4)',
  },
  s734cb80b: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 4)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sa444c464: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  se658ac15: {
    display: 'flex',
    gap: 'calc(0.25rem * 3)',
  },
  s731a65c2: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  saa44949d: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 3)',
  },
  sac428cea: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
  },
  s76b0b3a9: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
})
export const SPACE_NAME_MAX_LENGTH = 60
const TOTAL_STEPS = 3

// Values for the header layout select. `stored` is the value persisted in
// home doc metadata.
export const CREATE_SPACE_HEADER_LAYOUTS = [
  {
    value: 'horizontal',
    label: 'Horizontal',
    stored: '' as const,
  },
  {
    value: 'center',
    label: 'Center',
    stored: 'Center' as const,
  },
] as const
export type CreateSpaceHeaderLayout = (typeof CREATE_SPACE_HEADER_LAYOUTS)[number]['value']

// Values the form collects before an account or space exists.
export type CreateSpaceFormState = {
  name: string
  cover: File | null
  logo: File | null
  favicon: File | null
  headerLayout: CreateSpaceHeaderLayout
  contentWidth: 'S' | 'M' | 'L'
  showActivity: boolean
}
export const defaultCreateSpaceFormState: CreateSpaceFormState = {
  name: '',
  cover: null,
  logo: null,
  favicon: null,
  headerLayout: 'horizontal',
  contentWidth: 'L',
  showActivity: true,
}
type StepProps = {
  state: CreateSpaceFormState
  update: (values: Partial<CreateSpaceFormState>) => void
}

/**
 * Create a space panel. Collects a CreateSpaceFormState and passes it to
 * onComplete callback.
 */
export function CreateSpaceForm({
  onComplete,
  onClose,
  initialState,
}: {
  onComplete: (state: CreateSpaceFormState) => void
  onClose?: () => void
  initialState?: Partial<CreateSpaceFormState>
}) {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<CreateSpaceFormState>({
    ...defaultCreateSpaceFormState,
    ...initialState,
  })
  function update(values: Partial<CreateSpaceFormState>) {
    setState((prev) => ({
      ...prev,
      ...values,
    }))
  }
  const isLastStep = step === TOTAL_STEPS - 1
  const canContinue = step > 0 || state.name.trim().length > 0
  function goNext() {
    if (isLastStep) onComplete(state)
    else setStep(step + 1)
  }
  return (
    <div className={stylex.props(styles.sd6dded7f).className || ''}>
      <div className={stylex.props(styles.sfaef8fa5).className || ''}>
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
          Step {step + 1}/{TOTAL_STEPS}
        </Badge>
        {onClose ? (
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className={stylex.props(styles.sca3de968).className || ''} />
          </Button>
        ) : null}
      </div>
      <ScrollArea className={stylex.props(styles.sb42feb5d).className || ''}>
        <div className={stylex.props(styles.s21916808).className || ''}>
          {step === 0 ? <NameStep state={state} update={update} /> : null}
          {step === 1 ? <IdentityStep state={state} update={update} /> : null}
          {step === 2 ? <AppearanceStep state={state} update={update} /> : null}
        </div>
      </ScrollArea>
      <div className={stylex.props(styles.s734cb80b).className || ''}>
        {step === 1 ? (
          <Button
            variant="outline"
            size="lg"
            className={stylex.props(styles.sb42feb5d).className || ''}
            onClick={goNext}
          >
            Skip for now
          </Button>
        ) : null}
        <Button
          variant="default"
          size="lg"
          className={stylex.props(styles.sb42feb5d).className || ''}
          disabled={!canContinue}
          onClick={goNext}
        >
          {isLastStep ? 'Create space' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
function StepHeader({title, description}: {title: string; description: string}) {
  return (
    <div className={stylex.props(styles.sfbc6e28e).className || ''}>
      <SizableText size="2xl" weight="bold" asChild>
        <h2>{title}</h2>
      </SizableText>
      <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        {description}
      </SizableText>
    </div>
  )
}
function NameStep({state, update}: StepProps) {
  return (
    <>
      <StepHeader
        title="Let's start! Name your space"
        description="This is how your space appears in links and search. You can always change it later from space settings."
      />
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <div className={stylex.props(styles.sa444c464).className || ''}>
          <Label htmlFor="space-name">Space name</Label>
          <SizableText size="xs" className={stylex.props(styles.sf2718385).className || ''}>
            {state.name.length}/{SPACE_NAME_MAX_LENGTH}
          </SizableText>
        </div>
        <Input
          id="space-name"
          value={state.name}
          maxLength={SPACE_NAME_MAX_LENGTH}
          onChange={(e) =>
            update({
              name: e.target.value,
            })
          }
        />
      </div>
    </>
  )
}

// Object URL for previewing an in memory image file, revoked on change/unmount.
function useFilePreviewUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])
  return url
}
function IdentityStep({state, update}: StepProps) {
  const coverUrl = useFilePreviewUrl(state.cover)
  const logoUrl = useFilePreviewUrl(state.logo)
  const faviconUrl = useFilePreviewUrl(state.favicon)
  return (
    <>
      <StepHeader
        title="Add the main identity elements of your space"
        description="You can skip this and do it later from space settings if you prefer."
      />
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <Label>Home cover image</Label>
        <ImageForm
          id="space-cover"
          height={120}
          url={coverUrl}
          uploadOnChange={false}
          suggestedSize="1600 × 400px"
          onImageUpload={(file) => {
            if (file instanceof File)
              update({
                cover: file,
              })
          }}
          onRemove={() =>
            update({
              cover: null,
            })
          }
        />
      </div>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <Label>Space logo</Label>
        <ImageForm
          id="space-logo"
          height={100}
          width={320}
          url={logoUrl}
          uploadOnChange={false}
          emptyLabel="Add Logo"
          suggestedSize="100px height JPG or PNG"
          onImageUpload={(file) => {
            if (file instanceof File)
              update({
                logo: file,
              })
          }}
          onRemove={() =>
            update({
              logo: null,
            })
          }
        />
      </div>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <Label>Favicon</Label>
        <ImageForm
          id="space-favicon"
          height={100}
          width={100}
          url={faviconUrl}
          uploadOnChange={false}
          emptyLabel="Add Favicon"
          suggestedSize="512 × 512px JPG or PNG"
          onImageUpload={(file) => {
            if (file instanceof File)
              update({
                favicon: file,
              })
          }}
          onRemove={() =>
            update({
              favicon: null,
            })
          }
        />
      </div>
    </>
  )
}
function AppearanceStep({state, update}: StepProps) {
  return (
    <>
      <StepHeader
        title="Navigation & Appearance"
        description="Set up how your space and documents look. You can skip this and do it later from space settings if you prefer."
      />
      <div className={stylex.props(styles.se658ac15).className || ''}>
        <div className={stylex.props(styles.s731a65c2).className || ''}>
          <Label>Header layout</Label>
          <Select
            value={state.headerLayout}
            onValueChange={(headerLayout: CreateSpaceFormState['headerLayout']) =>
              update({
                headerLayout,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CREATE_SPACE_HEADER_LAYOUTS.map((layout) => (
                <SelectItem key={layout.value} value={layout.value}>
                  {layout.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={stylex.props(styles.s731a65c2).className || ''}>
          <Label>Content width</Label>
          <Select
            value={state.contentWidth}
            onValueChange={(contentWidth: CreateSpaceFormState['contentWidth']) =>
              update({
                contentWidth,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S">Small</SelectItem>
              <SelectItem value="M">Medium</SelectItem>
              <SelectItem value="L">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={stylex.props(styles.saa44949d).className || ''}>
        <div className={stylex.props(styles.sac428cea).className || ''}>
          <Label htmlFor="space-activity-tabs">Show activity tabs</Label>
          <Tooltip content="Show the People, Comments, and Citations tabs on your space's pages.">
            <HelpCircle className={stylex.props(styles.s76b0b3a9).className || ''} />
          </Tooltip>
        </div>
        <Switch
          id="space-activity-tabs"
          checked={state.showActivity}
          onCheckedChange={(showActivity) =>
            update({
              showActivity,
            })
          }
        />
      </div>
    </>
  )
}
