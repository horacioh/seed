import type {DocumentA11yIssue} from '@shm/shared'
import {Button} from '../../src/button'
import {Popover, PopoverAnchor, PopoverContent} from '../../src/components/popover'
import {PublishAccessibilityIssues} from '../../src/publish-accessibility-issues'

const issues: DocumentA11yIssue[] = [
  {blockId: 'image-1', kind: 'image-missing-alt', message: 'Image 1: add alt text (flower.jpg)'},
  {
    blockId: 'image-2',
    kind: 'image-alt-is-filename',
    message: 'Image 2: replace filename "cat.png" with descriptive alt text',
  },
  {blockId: 'heading-3', kind: 'empty-heading', message: 'Heading 3 is empty'},
  {blockId: 'link-1', kind: 'vague-link-text', message: 'Link "click here" needs descriptive text'},
]

/** Real-browser fixture for the publish popover issue list and Cancel contrast. */
export function PublishPopoverA11y() {
  return (
    <main className="bg-background text-foreground min-h-screen p-8">
      <Popover open>
        <PopoverAnchor className="mx-auto block w-fit">
          <Button variant="brand">Publish</Button>
        </PopoverAnchor>
        <PopoverContent
          aria-labelledby="publish-title"
          className="w-[min(92vw,22rem)]"
          style={{backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)'}}
        >
          <div className="flex flex-col gap-5">
            <h2 id="publish-title" className="text-base font-medium">
              Publish document
            </h2>
            <p className="text-sm">Your document will be available at https://example.com/guide</p>
            <PublishAccessibilityIssues issues={issues} />
            <div className="flex flex-col gap-2 pt-1">
              <Button variant="brand" className="h-11 text-base font-semibold">
                Publish: Make it live now
              </Button>
              <Button size="default" variant="ghost" className="h-10 text-base">
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </main>
  )
}
