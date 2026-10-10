# UI Layout System: a layered, themeable foundation for web and desktop

## Problem

Both frontends (Electron desktop and Remix web) render the same hypermedia
surfaces, but their layout code has grown organically and is now hard to
reason about, hard to reuse, and hard to extend:

- **No explicit layout hierarchy.** There is no shared notion of
  "app shell → page → section → component". Desktop composes
  `main.tsx` + `TitleBar` + `AppSidebar` + `Footer` + `PanelGroup` inline;
  web composes `$.tsx` (a 650-line catch-all route) + `web-site-header` +
  per-page wrappers. The same conceptual regions (header, sidebar, content,
  accessory panel) are built differently in each app.
- **Layout primitives are scattered and overlapping.** `@shm/ui` exports
  `MainWrapper` (layout.tsx), `PageLayout` (page-layout.tsx),
  `PanelLayout` (panel-layout.tsx), `container.tsx`, `accessories.tsx`,
  plus per-app wrappers (`main-wrapper.tsx`, `titlebar-layout.tsx` on
  desktop). It's unclear which to use when; new pages tend to reinvent
  spacing/scroll/width logic (`max-w-[calc(85ch+1em)]` style constants
  appear inline).
- **Pages mix concerns.** Page files in `@shm/ui` (e.g. `feed.tsx`,
  `directory-page.tsx`, `notifications-page.tsx`) blend data hooks, layout
  scaffolding, and presentational markup, so a UI piece used in one page
  can't be lifted into another without dragging its data assumptions along.
- **Scroll/width/panel behavior is fragile.** ScrollArea hacks in
  `base.css`, `noScroll` flags, and ad-hoc `flex-1` chains mean sections
  "don't look right" and small changes break unrelated pages.
- **Agents and new contributors have no contract.** Despite good building
  blocks (Tailwind v4, shadcn/Radix in `ui/src/components`, shared theme
  tokens in `theme.css`), there is no documented answer to "what component
  do I reach for, and where does it go?" — so every feature risks
  reinventing the wheel or breaking layout invariants.

This slows down every feature in both apps and makes redesigns effectively
impossible without a rewrite.

## Solution

Build a **layered design-system contract in `@shm/ui`**, token-first so
theming and future redesigns sit on top of it, and migrate both apps to it
incrementally. The layers, from bottom to top:

1. **Tokens (theme layer).** Semantic CSS variables in `theme.css` (already
   started: `--background`, `--panel`, `--sidebar-*`, brand ramp, shadows,
   radius, fonts). Harden this into the *only* source of color/spacing/
   typography/radius. Rules: components consume tokens via Tailwind
   semantic utilities (`bg-background`, `text-muted-foreground`), never raw
   palette classes (`bg-gray-100`) or inline literals. Dark mode and
   per-site web themes are token remaps, nothing else. A redesign =
   swapping token values + theme files.

2. **Primitives.** The shadcn/Radix components in `ui/src/components`
   (Button, Input, Dialog, ScrollArea, Tabs, …). Unchanged API-wise, but
   audited to consume only tokens, with stories for each.

3. **Composites.** Reusable, data-free UI assemblies: cards, list items,
   empty/loading/error states (`page-message-states`), facepiles, form
   field groups. Props in, markup out — no hooks that fetch data.

4. **Layout system (the core of this project).** A small, named,
   slot-based vocabulary that every page in both apps is built from:
   - `AppShell` — top-level frame with named slots: `titlebar`/`header`,
     `sidebar`, `content`, `footer`. Desktop fills `titlebar` + `AppSidebar`;
     web fills `header` with the site header. Owns the resizable
     panel group and the accessory panel slot.
   - `Page` — one scroll container per page (replacing the
     MainWrapper/noScroll/ScrollArea patchwork), owns content width
     presets (S/M/L from `widthValues`) and page-level padding.
   - `PageHeader` — title, breadcrumbs, actions slot; one way to render a
     page heading (replaces ad-hoc `PageLayout` header, `document-header`
     duplication).
   - `Section` / `SectionHeader` — composable vertical regions inside a
     page with consistent spacing rhythm; sections are what make pages
     "look right" by default.
   - `AccessoryPanel` — the right-hand panel contract (activity, comments,
     directory, versions, options) built once on `PanelLayout`, used
     identically by both apps.
   - `Toolbar` / `ActionBar` — horizontal action groupings (editing
     toolbar, feed filters) with consistent height/spacing.

5. **App shells (thin).** Desktop `main.tsx` and web `root.tsx`/`$.tsx`
   become wiring only: route → data loading → pick a Page composed of
   layout components. No layout markup lives in app code.

Cross-cutting deliverables:

- **Story catalog + gates.** A Ladle (or Storybook) catalog inside
  `frontend/packages/ui` with a story per token set, primitive, composite,
  and layout component (including composed example pages). CI gates stay
  `pnpm typecheck` + `pnpm test`; the catalog is the visual smoke surface
  for every phase.
- **The contract doc.** `frontend/packages/ui/README.md` defining the
  layers, the decision tree ("building a page? start with `Page` +
  `PageHeader` + `Section`…"), and the token rules — plus an
  `.agents/skills/ui-layout/SKILL.md` so coding agents pick the contract
  up automatically.
- **Lint enforcement.** An ESLint rule/config forbidding raw palette
  classes and direct `react-resizable-panels` usage outside the layout
  layer, so the contract is enforced, not aspirational.

### User stories

- As a developer, when I build a new page I compose `Page`, `PageHeader`,
  and `Section` and it looks correct with zero custom spacing/scroll code.
- As an agent, I read the ui README/skill and know exactly which component
  to use for a header, a list, a panel — without scanning the codebase.
- As a designer, I change `theme.css` (or add a theme file) and both apps
  re-skin consistently.
- As a maintainer, I open the story catalog and see every layout state
  (narrow/wide, panel open/closed, dark/light) at a glance.

### Phases

**Phase 0 — Inventory & contract (foundation).**
Audit every page/route in both apps; map each to the regions it uses.
Write the layer contract (README + skill), define the layout component
APIs (names, slots, props) on paper, and set up the story catalog tooling.
No production code changes beyond tooling. *Exit: approved contract doc +
empty catalog running in CI.*

**Phase 1 — Tokens & primitives hardening.**
Sweep `@shm/ui` primitives and `theme.css`: remove raw palette usage,
fill token gaps (spacing rhythm, z-index scale, panel/sidebar tokens),
wire dark mode + web site-theme onto tokens only, add the lint rule,
write stories for tokens + primitives. *Exit: lint clean, catalog covers
primitives, both apps visually unchanged.*

**Phase 2 — Layout system components.**
Implement `AppShell`, `Page`, `PageHeader`, `Section`, `AccessoryPanel`,
`Toolbar` in `@shm/ui` (absorbing/deprecating `MainWrapper`, `PageLayout`,
`PanelLayout`, `container.tsx` behind the new APIs). Stories for every
component and for composed example pages. Nothing migrated yet. *Exit:
layout layer complete in the catalog with responsive + panel states.*

**Phase 3 — Core surfaces migration.**
Migrate the golden-path surfaces in both apps to the new system:
document/resource page (desktop `desktop-resource`, web `$.tsx` resource
rendering), feed, library, and the accessory panels (activity,
discussions, directory, versions). Desktop `main.tsx` and web `$.tsx`
shrink to shell wiring. *Exit: core surfaces on `AppShell`/`Page` in both
apps, old wrappers unused on those paths.*

**Phase 4 — Long-tail migration & cleanup.**
Settings, contacts, drafts, notifications, onboarding, inspector, agents
pages; delete deprecated layout exports; final README/skill polish; add a
"new page" checklist. *Exit: no page bypasses the layout system; deprecated
components removed.*

## Scope

Estimated in agent-session-sized chunks (one focused Devin session ≈ one
reviewable PR):

| Phase | Estimate | Depends on |
|---|---|---|
| 0 — Inventory & contract | 1–2 sessions | — |
| 1 — Tokens & primitives | 2–3 sessions | 0 |
| 2 — Layout components | 3–4 sessions | 1 |
| 3 — Core surfaces migration | 4–6 sessions (per-surface PRs) | 2 |
| 4 — Long tail & cleanup | 3–5 sessions (parallelizable per page) | 3 |

Phases 0–2 are strictly sequential. Phase 3 surfaces can proceed in
parallel once Phase 2 lands; Phase 4 pages are independently
parallelizable. Every phase keeps both apps shippable — no long-lived
branch.

## Rabbit Holes

- **Visual redesign.** Tempting to "fix the look" while touching every
  page. This project makes redesign *possible*; it does not do one. Pixel
  parity (within reason) is the migration bar.
- **Editor internals.** Tiptap/ProseMirror block rendering
  (`blocks-content`, `hm-prose.css`) has its own CSS world. Only its
  *container* (Page width/scroll) is in scope.
- **Full visual-regression infrastructure.** Playwright screenshot diffing
  is valuable but is its own project; the story catalog + typecheck/tests
  are the gate for now.
- **State-management refactors.** Navigation/XState/TanStack Query
  architecture stays as-is; only the layout/presentation layer moves.
- **Perfect component taxonomy.** Don't bikeshed composites endlessly in
  Phase 0 — the layout layer is the contract; composites can be promoted
  incrementally.
- **The vault app.** It shares `theme.css` and benefits from Phase 1, but
  migrating its screens is explicitly a follow-up.

## No Gos

- No new component library or CSS framework — Tailwind v4 + shadcn/Radix
  stay.
- No behavior changes to routing, data loading, or the hypermedia model.
- No big-bang rewrite branch; every PR must leave both apps releasable.
- No app-specific forks of layout components — if desktop and web need
  different behavior, it's a prop/slot on the shared component.
- No raw palette colors or one-off spacing in migrated code — tokens only,
  enforced by lint.
- No skipping the story catalog for "small" layout components; if it's in
  the layout layer, it has stories.
