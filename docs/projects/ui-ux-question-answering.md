# Ask the Apps: a UI/UX question-answering system for desktop and web

## Problem

Answering a question about what our UI actually does today is slow and unreliable. To know whether the document card
dropdown shows every option it should, or whether publishing a child really adds a card to its parent, someone has to
build the app, get it into the right state, click through it, and remember what they saw. The answer lives in one
person's head for about a day.

Three things make this worse than ordinary manual QA:

- **Two apps, one product.** Desktop (Electron) and web (Remix) implement overlapping surfaces through partly shared
  packages. Questions like "is mobile showing the correct header icons?" are really questions about divergence between
  targets, and nobody checks both.
- **No predictable state.** Seed is p2p and content-addressed with cryptographic identity, so "open the app and look"
  starts from whatever local state that machine happens to have. Two people asking the same question can honestly get
  different answers.
- **Completeness questions can't be answered by looking.** "Do we show *all possible* options?" is unanswerable from a
  screenshot. A screenshot tells you what rendered; it cannot tell you what was supposed to render. The set of possible
  options only exists in code.

The existing test suites don't close this gap, because they answer questions someone already thought to ask. `tests/`
covers daemon/web integration and SSR, and `frontend/apps/desktop/tests/*.e2e.ts` covers onboarding and a few flows.
Neither can respond to a question posed for the first time this morning.

What's missing is the ability to *ask*: pose a question in plain language, and get back an answer grounded in the
running apps, with the screenshots, recording, or timings that justify it.

## Solution

A question-answering system over the running apps. You ask; it decides how to find out, drives desktop and/or web
against a known database, gathers evidence, and answers with that evidence attached — or explicitly says it could not
determine the answer.

The already-built harness (`harness/`, `@shm/harness`) is the substrate, not the product: it drives an app, resolves
locators, captures screenshots/DOM/console/network, records captioned video, and writes reports. It stays; the
question-answering layer sits on top. Its scenario files become one way to answer a question, not the interface.

### The load-bearing design decision

Different questions need genuinely different machinery. The six examples split into five kinds, and each kind needs a
capability the others don't:

| Question kind          | Example                                            | What it actually requires                                        |
| ---------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| **Inventory**          | "all possible options in the document card menu?"   | Code-defined option set ↔ rendered option set, diffed             |
| **Causal / workflow**  | "does publishing create an embed card in the parent?" | Seeded state, multi-step workflow, waiting out async side effects |
| **Visual / responsive**| "is web mobile showing the correct header icons?"   | A baseline of what "correct" means; diff, not judgment            |
| **Demonstration**      | "record the publishing workflow"                    | The recorder (already exists)                                     |
| **Performance**        | "how long does a search result take to load?"       | Timing instrumentation in the app; wall-clock screenshots lie     |

The inventory row is the one people underestimate. `useDocumentCardMenuItems` in
`frontend/packages/ui/src/newspaper.tsx` builds the menu by conditionally pushing entries based on ownership, whether
the doc has a path, private vs published, source permissions, feature flags, and predicates like
`canShowMoveDocumentAction`. So "all possible options" is not one array to compare against — it's a conditional state
space. Answering the question honestly means enumerating the conditions from code, driving the app into each one, and
reporting the matrix. That is the system's differentiator, and it's why this can't be built as "an LLM that looks at
screenshots".

Query blocks are the friendly case and worth doing first: `frontend/packages/client/src/hm-types.ts` has real zod
schemas (`HMQuerySchema`, `HMQuerySortSchema`, `HMQueryInclusionSchema`, `HMQueryStyleSchema`) that enumerate allowed
values machine-readably. The editor in `frontend/apps/desktop/src/editor/query-block.tsx` duplicates those options as
JSX labels. A three-way diff — domain schema ↔ editor property schema ↔ rendered controls — answers "show me the
possible options for query blocks" *and* surfaces drift, which is a more valuable answer than the question asked for.

### Determinism comes first

Your instinct about a default seed database is right, and it's further along than expected — the pieces exist but
aren't a product:

- `frontend/apps/cli/src/test/fixture-seed.ts` derives a deterministic account from `FIXTURE_ACCOUNT_MNEMONIC`,
  verifies it against a known `FIXTURE_ACCOUNT_ID`, and seeds a fixed document hierarchy from fixture Markdown.
- `tests/integration/test-env.ts` already stands up a daemon on explicit ports with an explicit `-data-dir` and
  `-keystore-dir`, starts the web server against it, and seeds it.
- Desktop honours `SEED_FIXTURE_DATA_DIR` to relocate its user-data root, and `VITE_DESKTOP_APPDATA` to isolate app
  data per run.

So the work is promotion and extension, not invention: make the fixture a named, versioned, checked-in artifact that
*both* apps can be pointed at, restored in seconds, and reset between questions.

One caveat that will bite if ignored: the snapshot boundary differs per target. For web, daemon data dir + file
keystore + web config is sufficient. For desktop, the daemon dir is *not* enough — Electron keeps settings, window
state, last selected identity, recents, bookmarks, onboarding state, drafts and pending document-card cleanup jobs
across `app-store.mts`, `app-settings.ts`, `app-onboarding-store.ts` and friends. A desktop fixture has to snapshot the
whole `userDataPath`. And this only works in fixture mode with the file keystore
(`backend/core/keystore/file.go`); a production profile may keep keys in the OS keyring, outside the data dir, and is
not portable.

### User stories

- As a product person, I ask "do we show all possible options in the document card dropdown?" and get back the
  code-defined option set, what rendered, the conditions under which each hidden option would appear, and screenshots
  of each state I didn't see.
- As a designer, I ask "is web mobile showing the correct site header icons?" and get the mobile and desktop header
  rendered side by side at defined viewports, with the icon inventory of each, and a diff against the last approved
  baseline.
- As an engineer, I ask "when a user creates a document and publishes it, do we create an embed card in its parent?"
  and get a recording of the workflow against the fixture DB plus the observed parent state after the async
  auto-link settles — for both desktop and web, since they take different code paths.
- As anyone, I ask "record the publishing workflow" and get a captioned video I can drop in a doc.
- As anyone, I get told "I couldn't determine this" with the reason, instead of a confident wrong answer.

### Answer contract

Every answer carries: a verdict, the evidence (screenshots, recording, DOM/a11y capture, timings), the fixture and app
versions it was produced against, and a confidence statement. Answers that can't be grounded in captured evidence are
reported as undetermined. An answer the system can't back up is worse than no answer, because it will be quoted.

Answered questions are freezable: any question that produced a definite answer can be pinned as a regression check
that re-runs later and reports if the answer changed. This is how the system compounds instead of becoming a toy —
today's question becomes tomorrow's test, without anyone writing a test.

## Scope

Phases are sequenced by dependency. Estimates assume one engineer and are deliberately coarse; Phases 1–3 are the
foundation and the rest genuinely depend on them.

### Phase 0 — Reframe the existing harness (0.5 week, no dependencies)

Reposition `@shm/harness` as the driver/evidence substrate. Documentation and framing only — the code is already
structured this way after the `PageDriver` refactor (shared page logic, `BrowserDriver` and `ElectronDriver` on top).
No new features. Deliverable: the harness README and blueprint describe it as the execution layer of this system
rather than as a test runner.

### Phase 1 — The default Seed database (1.5–2 weeks, depends on Phase 0)

The foundation everything else stands on.

- Promote `fixture-seed.ts` into a versioned, checked-in fixture with a documented content inventory (what documents,
  what hierarchy, what accounts) so questions can reference known objects by name.
- Define the snapshot boundary per target: daemon data dir + file keystore + web config for web; the entire Electron
  `userDataPath` for desktop.
- Build restore/reset that is fast and consistent — the daemon must be quiesced before copying SQLite/WAL state, or
  restores will be subtly corrupt.
- Point both apps at it reproducibly (daemon ports and URLs are already env-configurable via
  `VITE_DESKTOP_*` / `DAEMON_HTTP_*`; `SEED_FIXTURE_DATA_DIR` already relocates desktop state).
- Acceptance: the same question asked twice, on two machines, against the fixture, yields the same answer.

### Phase 2 — Desktop target parity (1–1.5 weeks, depends on Phase 1)

Closer than previously reported. `pnpm desktop:package` **succeeds** in a clean environment and produces
`frontend/apps/desktop/out/Seed-linux-x64/Seed`; the earlier `./dev build-desktop` failure was only Electron Forge's
`.deb` *make* step missing `dpkg`/`fakeroot`, which is packaging, not the app. The harness `ElectronDriver` launches
that binary under Xvfb and reaches Playwright's launcher — but `firstWindow()` times out after 30s and no renderer
window appears.

- Diagnose the `firstWindow()` timeout. Hypotheses, unverified: packaged daemon startup, identity/key setup blocking
  first paint, or packaged-runtime config. This is the single highest-uncertainty item in the plan.
- Reach parity on evidence capture (screenshots, a11y capture, console) between web and desktop.
- Acceptance: a trivial question answered identically against both targets.

### Phase 3 — UI inventory capture (1 week, depends on Phase 2)

Structured capture of what a screen *offers*, not just how it looks. Screenshots can't be diffed semantically.

- Capture the accessibility tree — roles, accessible names, expanded/selected state — as the primary inventory source.
- Reason: there is no globally enforced `data-testid` convention. Real ones exist (`document-card`, `embed-wrapper`,
  `query-row`, `search-result-*`) alongside real `aria-label`s (`Open options`, `Draft options`, `Account options`),
  but coverage is partial. Layer the strategy: a11y tree first, existing stable attributes second, existing test IDs
  third, and add test IDs only where no reliable semantic surface exists.
- Acceptance: "what options does this menu show?" answerable as structured data.

### Phase 4 — Code-side ground truth (1.5 weeks, depends on Phase 3)

The half that makes completeness questions answerable.

- Extract enumerable option sets from code. Start with query blocks (zod schemas — the easy, high-value case), then
  the document card menu (harder: conditional builder, so extract the conditions too).
- Diff code-defined against rendered, and report both the gap and the conditions under which unseen options appear.
- Acceptance: "do we show all possible options in the document card dropdown?" answered as a matrix of option ×
  condition × observed, not a yes/no.

### Phase 5 — The question loop (2 weeks, depends on Phase 4)

The actual interface. Question in, answer with evidence out.

- A tool API over the drivers — navigate, act, inventory, capture, assert — which the blueprint already specifies in
  `docs/harness-blueprint/BLUEPRINT.md` §14.4.
- Question classification into the five kinds above, routed to the right machinery.
- Start with read-only inventory questions, which are safe: they can't corrupt fixture state.
- Enforce the answer contract, including the "couldn't determine" path.

### Phase 6 — Workflow and causal questions (1.5 weeks, depends on Phase 5)

Multi-step questions that mutate state.

- Run workflows against a restored fixture, reset after each.
- Handle asynchronous side effects properly. The parent auto-link is the worked example and a genuine trap: desktop
  runs `autoLinkParentAfterPublish` (`frontend/apps/desktop/src/models/auto-link-parent.ts`) after first publish, while
  web *enqueues* a cleanup job (`web-document-card-cleanup.ts`). Both are suppressible — `shouldAutoLinkParent` skips
  private children, existing links, parents with a covering self-query, root paths, and missing signing accounts.
  Asserting immediately after the publish click will produce a confident wrong "no".
- Acceptance: the parent-embed-card question answered correctly for both targets, including the suppression cases.

### Phase 7 — Performance and visual questions (1.5 weeks, depends on Phase 5)

- Instrument timing boundaries in the app. None exist today. For desktop search the meaningful boundaries are: omnibar
  focus → input settled → 200 ms debounce elapsed → `useSearch` request start/end → results rendered → selection →
  `navigate(selectedRoute)` → destination query complete → destination rendered. Wall-clock screenshot timing conflates
  all of these and will not survive scrutiny.
- Responsive/visual questions need a baseline to diff against; "correct" is otherwise undefined and the system would
  be inventing an opinion. Approved baselines per viewport, diffed, with changes surfaced for review.

### Phase 8 — Freeze answers into regressions (1 week, depends on Phases 6–7)

Pin an answered question as a repeatable check; re-run on a schedule or in CI; report when an answer changes. This is
where the investment compounds.

**Total: roughly 11–13 weeks sequential**, though Phases 3–4 and 6–7 parallelize across two engineers. Phases 1–2 do
not parallelize and gate everything.

## Rabbit Holes

- **Diagnosing `firstWindow()` by rebuilding the desktop toolchain.** Time-box it. If the packaged app won't produce a
  window quickly, run desktop against a dev build instead and revisit packaging later.
- **A universal static analyzer for "all possible UI options".** Extracting options from arbitrary conditional JSX is
  an open-ended program-analysis project. Cover query blocks and the document card menu concretely; generalize only
  after two real cases work.
- **Standardizing `data-testid` across the entire frontend.** Tempting, large, and touches every component. The
  accessibility tree gets us most of the way; add test IDs only where a specific question is blocked.
- **Pixel-perfect visual regression.** Full screenshot diffing brings font rendering, animation and platform noise, and
  a permanent flake budget. Start with semantic inventory diffs (which icons/actions exist), not pixels.
- **Making the fixture cover every scenario.** The fixture will be tempting to grow without limit. Keep it small and
  documented; questions needing exotic state should build it as a setup step, not bloat the shared baseline.
- **Rebuilding the harness on a general agent framework.** The tool API and evidence model already exist. Swapping
  frameworks is motion, not progress.
- **P2P multi-peer determinism.** Sync between multiple peers is nondeterministic by nature. Single-node fixture only,
  until a question genuinely requires two peers.

## No Gos

- **No answers without evidence.** If it can't be grounded in captured artifacts, it reports "couldn't determine". No
  plausible-sounding inference from what a screenshot might have shown.
- **Not a replacement for the existing test suites.** `tests/` and the desktop e2e project keep their jobs. This
  answers new questions; it doesn't re-implement known-answer regression testing.
- **Never point it at production data or real user accounts.** Fixture identity only. This drives destructive
  workflows.
- **No judgments about whether the UI is *good*.** It reports what the UI does versus what the code defines or a
  baseline approves. "Correct" always resolves to a comparison against something explicit, never to taste.
- **No shipping the fixture with real credentials.** The fixture mnemonic is a test artifact; it must never be reused
  for anything with real value, and the fixture must stay in fixture-mode file-keystore territory.
- **Not a load or stress tool.** Performance questions here mean "how long does this take for one user", not capacity.
- **No auto-fixing.** The system answers questions and files findings; it does not open PRs to change the UI it just
  observed.

---

### Status of what already exists

Built and on PR #10 (`harness/`): the driver/evidence substrate — web driver over CDP, Electron driver, locator
resolution, actions, assertions, screenshot/DOM/console/network capture, captioned video, JSON/HTML/Markdown reports,
best-effort secret redaction. Phase 0 reframes it; nothing needs to be thrown away.

Verified during planning: `pnpm desktop:package` succeeds and produces a runnable Linux app; the Electron driver
launches it but `firstWindow()` times out (cause not yet isolated — Phase 2). Assumptions labelled as unverified
above are exactly that.
