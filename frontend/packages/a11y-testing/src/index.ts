/** Shared axe tags used by the accessibility test helpers. */
export {axeTags} from './shared'
/** Formats axe violations for test failure messages. */
export {formatViolations} from './shared'
/** The violation shape accepted by the shared formatter. */
export type {A11yViolation} from './shared'
/** Registers the cross-adapter editor accessibility contract. */
export {runEditorA11yContract} from './playwright'
/** Editor-specific hooks consumed by the shared accessibility contract. */
export type {EditorA11yContractAdapter, EditorA11yContractSetup} from './playwright'
