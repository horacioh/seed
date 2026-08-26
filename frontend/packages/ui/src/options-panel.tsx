import * as stylex from '@stylexjs/stylex'
import {HMMetadata} from '@seed-hypermedia/client/hm-types'
import {useState} from 'react'
import {PanelContent} from './accessories'
import {Button} from './button'
import {DatePicker} from './components/date-picker'
import {Input} from './components/input'
import {Label} from './components/label'
import {SwitchField} from './form-fields'
import {getDaemonFileUrl} from './get-file-url'
import {IconForm} from './icon-form'
import {ImageForm} from './image-form'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './select-dropdown'
const styles = stylex.create({
  s21835087: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    padding: 'calc(0.25rem * 4)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
})
export function OptionsPanel({
  draftId,
  onMetadata,
  metadata,
  isHomeDoc,
  fileUpload,
}: {
  draftId: string
  onMetadata: (values: Partial<HMMetadata>) => void
  metadata: HMMetadata
  isHomeDoc: boolean
  fileUpload?: (file: File) => Promise<string>
}) {
  return (
    <PanelContent>
      <div className={stylex.props(styles.s21835087).className || ''}>
        {isHomeDoc ? (
          <>
            <NameInput metadata={metadata} onMetadata={onMetadata} />
            <DocumentIconForm draftId={draftId} metadata={metadata} onMetadata={onMetadata} fileUpload={fileUpload} />
            <HeaderLogo draftId={draftId} metadata={metadata} onMetadata={onMetadata} fileUpload={fileUpload} />
            <HeaderLayout metadata={metadata} onMetadata={onMetadata} />
            <OriginalPublishDate metadata={metadata} onMetadata={onMetadata} />
            <ContentWidth metadata={metadata} onMetadata={onMetadata} />
            <ActivityVisibility metadata={metadata} onMetadata={onMetadata} />
          </>
        ) : (
          <>
            <OriginalPublishDate metadata={metadata} onMetadata={onMetadata} />
            <OutlineVisibility metadata={metadata} onMetadata={onMetadata} />
            <ActivityVisibility metadata={metadata} onMetadata={onMetadata} />
            <ContentWidth metadata={metadata} onMetadata={onMetadata} />
          </>
        )}
      </div>
    </PanelContent>
  )
}
function NameInput({metadata, onMetadata}: {metadata: HMMetadata; onMetadata: (values: Partial<HMMetadata>) => void}) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <Label size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        Name
      </Label>
      <Input
        value={metadata.name}
        onChange={(e) => {
          const name = e.target.value
          onMetadata({
            name,
          })
        }}
      />
    </div>
  )
}
function DocumentIconForm({
  draftId,
  metadata,
  onMetadata,
  fileUpload,
}: {
  draftId: string
  metadata: HMMetadata
  onMetadata: (values: Partial<HMMetadata>) => void
  fileUpload?: (file: File) => Promise<string>
}) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <Label size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        Icon
      </Label>
      <IconForm
        size={100}
        id={`icon-${draftId}`}
        label={metadata.name}
        url={metadata.icon ? getDaemonFileUrl(metadata.icon) : ''}
        fileUpload={fileUpload}
        onIconUpload={(icon) => {
          if (icon) {
            onMetadata({
              icon: `ipfs://${icon}`,
            })
          }
        }}
        onRemoveIcon={() => {
          onMetadata({
            icon: '',
          })
        }}
      />
    </div>
  )
}
function ContentWidth({
  metadata,
  onMetadata,
}: {
  metadata: HMMetadata
  onMetadata: (values: Partial<HMMetadata>) => void
}) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <Label size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        Content Width
      </Label>
      <Select
        onValueChange={(contentWidth: 'S' | 'M' | 'L') =>
          onMetadata({
            contentWidth,
          })
        }
        value={metadata.contentWidth || 'M'}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a content width" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="S">Small</SelectItem>
          <SelectItem value="M">Medium</SelectItem>
          <SelectItem value="L">Large</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
function HeaderLayout({
  metadata,
  onMetadata,
}: {
  metadata: HMMetadata
  onMetadata: (values: Partial<HMMetadata>) => void
}) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <Label size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        Header Layout
      </Label>
      <Select
        onValueChange={(headerLayout: 'default' | 'Center') => {
          const layoutValue = headerLayout === 'default' ? '' : headerLayout
          onMetadata({
            theme: {
              headerLayout: layoutValue,
            },
          })
        }}
        value={metadata.theme?.headerLayout || 'default'}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a header layout" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="Center">Centered</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
function HeaderLogo({
  draftId,
  metadata,
  onMetadata,
  fileUpload,
}: {
  draftId: string
  metadata: HMMetadata
  onMetadata: (values: Partial<HMMetadata>) => void
  fileUpload?: (file: File) => Promise<string>
}) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <Label size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        Header Logo
      </Label>
      <ImageForm
        emptyLabel="Add Logo"
        suggestedSize="height: 100px"
        height={100}
        id={`logo-${draftId}`}
        label={metadata.seedExperimentalLogo}
        url={metadata.seedExperimentalLogo ? getDaemonFileUrl(metadata.seedExperimentalLogo) : ''}
        fileUpload={fileUpload}
        onImageUpload={(imgageCid) => {
          if (imgageCid) {
            onMetadata({
              seedExperimentalLogo: `ipfs://${imgageCid}`,
            })
          }
        }}
        onRemove={() => {
          onMetadata({
            seedExperimentalLogo: '',
          })
        }}
      />
    </div>
  )
}
function OriginalPublishDate({
  metadata,
  onMetadata,
}: {
  metadata: HMMetadata
  onMetadata: (values: Partial<HMMetadata>) => void
}) {
  const [isAdding, setIsAdding] = useState(false)
  if (!isAdding && !metadata.displayPublishTime) {
    return (
      <Button size="sm" variant="link" onClick={() => setIsAdding(true)}>
        Set Publication Display Date
      </Button>
    )
  }
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <Label size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        Publication Display Date
      </Label>
      <DatePicker
        value={
          metadata.displayPublishTime
            ? dateStringToDate(metadata.displayPublishTime).toDateString()
            : new Date().toDateString()
        }
        onValue={(displayPublishTime) => {
          onMetadata({
            displayPublishTime,
          })
        }}
        onReset={() => {
          setIsAdding(false)
          onMetadata({
            displayPublishTime: '',
          })
        }}
      />
    </div>
  )
}
function OutlineVisibility({
  metadata,
  onMetadata,
}: {
  metadata: HMMetadata
  onMetadata: (values: Partial<HMMetadata>) => void
}) {
  const checked = typeof metadata.showOutline == 'undefined' || metadata.showOutline
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <SwitchField
        label="Show Outline"
        id="outline"
        defaultChecked={checked}
        onCheckedChange={(value) => {
          onMetadata({
            showOutline: value,
          })
        }}
      />
    </div>
  )
}
function ActivityVisibility({
  metadata,
  onMetadata,
}: {
  metadata: HMMetadata
  onMetadata: (values: Partial<HMMetadata>) => void
}) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <SwitchField
        label="Enable Activity Tabs"
        id="activity"
        checked={metadata.showActivity !== false}
        onCheckedChange={(value) => {
          onMetadata({
            showActivity: value,
          })
        }}
      />
    </div>
  )
}
export function dateStringToDate(dateString: string) {
  return new Date(dateString)
}
