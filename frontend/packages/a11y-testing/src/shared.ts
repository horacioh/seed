import type {AxeResults} from 'axe-core'

/** Tags used by every accessibility audit in the workspace. */
export const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'EN-301-549', 'best-practice']

/** The fields shared by axe violations and harness-generated findings. */
export type A11yViolation = Pick<AxeResults['violations'][number], 'id' | 'impact' | 'help' | 'helpUrl'> & {
  nodes: Array<Pick<AxeResults['violations'][number]['nodes'][number], 'target' | 'failureSummary'>>
}

/** Formats violations as one readable block per rule. */
export function formatViolations(violations: readonly A11yViolation[]): string {
  return violations
    .map((violation) => {
      const targets = violation.nodes.slice(0, 10).map((node) => {
        const selector = node.target.join(', ') || '(no target selector)'
        const summary = node.failureSummary ?? 'No failure summary provided.'
        return `  - ${selector}\n    ${summary}`
      })
      const remaining = violation.nodes.length - targets.length

      return [
        `${violation.id} (${violation.impact ?? 'unknown'} impact)`,
        `Help: ${violation.help}`,
        `Help URL: ${violation.helpUrl}`,
        ...targets,
        ...(remaining > 0 ? [`  - ${remaining} additional targets omitted`] : []),
      ].join('\n')
    })
    .join('\n\n')
}
