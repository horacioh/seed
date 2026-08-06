import type {Scenario} from '../src/types.js'

/** The deterministic login and todo-list demo scenario. */
export const scenario: Scenario = {
  name: 'Sample todo workflow',
  description: 'Login, add two todos, and complete one item.',
  setup: 'Sample app is ready',
  steps: [
    {action: 'goto', url: 'http://127.0.0.1:39777', description: 'Open the sample app'},
    {
      action: 'assert',
      kind: 'visible',
      locator: {testId: 'login-form'},
      expected: true,
      description: 'Login form is visible',
    },
    {action: 'type', locator: {testId: 'username'}, value: 'demo-user', description: 'Enter the demo username'},
    // Real scenarios should source credentials from the environment or a secret broker, not commit them.
    {
      action: 'type',
      locator: {testId: 'password'},
      value: process.env.HARNESS_SAMPLE_PASSWORD ?? 'demo-password',
      secret: true,
      description: 'Enter the demo password',
    },
    {action: 'click', locator: {testId: 'login-submit'}, description: 'Submit the login form'},
    {
      action: 'assert',
      kind: 'visible',
      locator: {testId: 'todo-view'},
      expected: true,
      description: 'Todo view is visible',
    },
    {action: 'type', locator: {testId: 'todo-input'}, value: 'Prepare demo', description: 'Type the first todo'},
    {action: 'click', locator: {testId: 'todo-add'}, description: 'Add the first todo'},
    {action: 'type', locator: {testId: 'todo-input'}, value: 'Review findings', description: 'Type the second todo'},
    {action: 'click', locator: {testId: 'todo-add'}, description: 'Add the second todo'},
    {
      action: 'assert',
      kind: 'text',
      locator: {testId: 'todo-count'},
      expected: '2 items · 0 completed',
      description: 'Two todos are shown',
    },
    {action: 'click', locator: {testId: 'todo-check-0'}, description: 'Complete the first todo'},
    {
      action: 'assert',
      kind: 'text',
      locator: {testId: 'todo-count'},
      expected: '2 items · 1 completed',
      description: 'Completed count updates',
    },
    {
      action: 'assert',
      kind: 'attr',
      locator: {testId: 'todo-0'},
      expected: 'class=todo completed',
      description: 'Completed todo has completed styling',
    },
  ],
}
