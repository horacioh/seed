import axe from 'axe-core'
import {axeTags, formatViolations} from './shared'

/** Runs axe-core against a DOM node and rejects when any configured rule fails. */
export async function expectNoAxeViolations(node: Element | Document, opts?: {disableRules?: string[]}): Promise<void> {
  const rulesToDisable = ['color-contrast', ...(opts?.disableRules ?? [])]
  const rules = Object.fromEntries(rulesToDisable.map((id) => [id, {enabled: false}]))
  const {violations} = await axe.run(node, {
    runOnly: {type: 'tag', values: axeTags},
    rules,
  })

  if (violations.length > 0) {
    throw new Error(formatViolations(violations))
  }
}
