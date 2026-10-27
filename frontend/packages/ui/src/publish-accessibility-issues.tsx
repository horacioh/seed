import type {DocumentA11yIssue} from '@shm/shared'

/** Renders advisory document accessibility findings as block navigation actions. */
export function PublishAccessibilityIssues({
  issues,
  onFocusBlock,
}: {
  issues: DocumentA11yIssue[]
  onFocusBlock?: (blockId: string) => void
}) {
  if (issues.length === 0) return null

  return (
    <section aria-labelledby="publish-accessibility-heading">
      <h3 id="publish-accessibility-heading" className="text-base font-medium">
        Accessibility
      </h3>
      <div aria-live="polite" className="mt-2 flex flex-col gap-1">
        {issues.map((issue) => (
          <button
            key={`${issue.blockId}:${issue.kind}`}
            type="button"
            aria-label={`Go to ${issue.message}`}
            className="hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background w-full rounded px-2 py-1.5 text-left text-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => onFocusBlock?.(issue.blockId)}
          >
            {issue.message}
          </button>
        ))}
      </div>
    </section>
  )
}
