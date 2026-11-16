import {Button} from '../../src/button'
import {Checkbox} from '../../src/components/checkbox'
import {Input} from '../../src/components/input'
import {Label} from '../../src/components/label'
import {RadioGroup, RadioGroupItem} from '../../src/components/radio-group'
import {Switch} from '../../src/components/switch'
import {Textarea} from '../../src/components/textarea'

const buttonVariants = [
  'default',
  'destructive',
  'danger',
  'outline',
  'secondary',
  'accent',
  'ghost',
  'link',
  'brand',
  'brand-12',
  'blue',
  'green',
  'orange',
  'inverse',
] as const

/** Renders shared UI controls for contrast and axe regression coverage. */
export function A11yFoundations() {
  return (
    <main className="bg-background text-foreground min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <h1 className="text-2xl font-semibold">Accessibility foundations</h1>

        <section aria-labelledby="buttons-heading">
          <h2 id="buttons-heading" className="mb-3 text-lg font-medium">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-3">
            {buttonVariants.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant} button
              </Button>
            ))}
          </div>
        </section>

        <section aria-labelledby="fields-heading" className="grid gap-4">
          <h2 id="fields-heading" className="text-lg font-medium">
            Fields
          </h2>
          <div className="grid gap-2">
            <Label htmlFor="foundations-input">Name</Label>
            <Input id="foundations-input" placeholder="Enter a name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="foundations-textarea">Description</Label>
            <Textarea id="foundations-textarea" placeholder="Enter a description" />
          </div>
        </section>

        <section aria-labelledby="checkboxes-heading">
          <h2 id="checkboxes-heading" className="mb-3 text-lg font-medium">
            Checkboxes
          </h2>
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id="brand-unchecked" aria-label="Brand checkbox unchecked" variant="brand" />
              <Label htmlFor="brand-unchecked">Brand unchecked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="brand-checked" aria-label="Brand checkbox checked" defaultChecked variant="brand" />
              <Label htmlFor="brand-checked">Brand checked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="primary-unchecked" aria-label="Primary checkbox unchecked" variant="primary" />
              <Label htmlFor="primary-unchecked">Primary unchecked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="primary-checked" aria-label="Primary checkbox checked" defaultChecked variant="primary" />
              <Label htmlFor="primary-checked">Primary checked</Label>
            </div>
          </div>
        </section>

        <section aria-labelledby="switches-heading">
          <h2 id="switches-heading" className="mb-3 text-lg font-medium">
            Switches
          </h2>
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Switch id="switch-off" aria-label="Notifications off" />
              <Label htmlFor="switch-off">Notifications off</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch-on" aria-label="Sound on" defaultChecked />
              <Label htmlFor="switch-on">Sound on</Label>
            </div>
          </div>
        </section>

        <section aria-labelledby="radio-heading">
          <h2 id="radio-heading" className="mb-3 text-lg font-medium">
            Radio group
          </h2>
          <RadioGroup aria-label="Reading preference" defaultValue="comfortable" className="gap-3">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="reading-comfortable" value="comfortable" />
              <Label htmlFor="reading-comfortable">Comfortable</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="reading-compact" value="compact" />
              <Label htmlFor="reading-compact">Compact</Label>
            </div>
          </RadioGroup>
        </section>

        <section aria-labelledby="links-heading" className="grid gap-3">
          <h2 id="links-heading" className="text-lg font-medium">
            Links and metadata
          </h2>
          <a href="https://hyper.media" className="text-link underline">
            Open Seed documentation
          </a>
          <p className="text-muted-foreground text-xs">Updated recently · Shared UI fixture</p>
        </section>
      </div>
    </main>
  )
}
