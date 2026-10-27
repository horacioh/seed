---
name: Accessibility testing
summary: How Seed tests its desktop, web, vault and email surfaces against WCAG 2.2 AA and EN 301 549.
---
# Accessibility testing

## Target and scope

Seed targets WCAG 2.2 AA and EN 301 549. The current program covers the desktop app, web reader and gateway, web editing and comments, vault sign-up and onboarding, and transactional emails. The marketing landing page, Explore and mobile are out of scope for now.

## Gate policy

The `pnpm lint:a11y` scan is a blocking CI gate and must report zero findings. Do not add baseline or allowlist files. A justified rule suppression must be line-scoped and include `-- reason`; reviewers reject suppressions without a clear, specific justification.

## Use the helpers

In the desktop app, press **F6** to cycle through the titlebar, sidebar, main content, and open side panels. Press **Shift+F6** to cycle in reverse. Hidden or closed regions are skipped.

The Playwright helper audits light and dark by default. It also supports forced colors, reduced motion, 320 CSS-pixel reflow and a 200% zoom-equivalent viewport.

```ts
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'

await expectNoA11yViolations(page, {modes: ['light', 'dark', 'reflow-320']})
```

Use the DOM helper for jsdom tests. It always disables axe's `color-contrast` rule because jsdom cannot calculate rendered contrast.

```ts
import {expectNoAxeViolations} from '@shm/a11y-testing/dom'

await expectNoAxeViolations(document)
```

Run the blocking jsx-a11y scan with `pnpm lint:a11y`. It scans the UI, editor, web, desktop, emails and vault frontend sources.

## Video captions

Uploaded video blocks can store an optional WebVTT captions file as an `ipfs://` link in `captions`, with an optional BCP 47 language tag in `captionsLang`. The editor provides Add, Replace and Remove captions actions, and the reader renders captions through a native `<track kind="captions">`. Before publishing, uploaded videos without captions are reported as accessibility issues; external video embeds are not checked. Raw agent-memory file previews remain justified exceptions because they have no caption source.

Run the published web reader gate against a running web gateway with:

```sh
A11Y_PATHS=/,/guide A11Y_BASE_URL=http://localhost:3000 pnpm --filter @shm/web test:a11y
```

## Editor adapter contract

Every editor adapter must pass `runEditorA11yContract` before merging. The contract covers named multiline text entry, keyboard block movement (including nested blocks), block options and focus restoration, insert-menu semantics, formatting-toolbar keyboard access and pressed state, image alt-text authoring, live announcements for move and delete, and zero axe violations in light, dark, and 320 CSS-pixel reflow modes. BlockNote runs the shared contract in the editor Playwright harness. ProseKit must run the same suite from `origin/devin/1793032977-editor-adapter-kit` before its adapter merges.

## Manual screen-reader matrix

Check representative flows with NVDA on Firefox and Chrome, JAWS on Chrome, VoiceOver on macOS Safari and iOS Safari, TalkBack, and Orca.

## Inventory

The test-file column is intentionally blank until each surface suite is added.

| Surface | Screen or state | Test file |
| --- | --- | --- |
| Desktop (`NavRoute` in `frontend/packages/shared/src/routes.ts`) | Onboarding, library, contacts, profile, site profile, contact, settings, account settings, site settings and site email settings | |
| Desktop | Document, draft, draft rebase, bookmarks and drafts; editor focused, menus open, empty documents and errors | |
| Desktop | Directory, all documents, feed, activity, comments, collaborators, document/IPFS inspection, schema and metadata; empty/error states and comments open | |
| Desktop | Agents, agent server, agent, agent session, agent run, API inspector, query documents and external web view | |
| Desktop | Explore route (`NavRoute`); out of scope for this effort | |
| Desktop onboarding | Welcome, profile, vault, recovery, existing account, import and ready (`frontend/apps/desktop/src/pages/onboarding.tsx`) | |
| Desktop dialogs | Create account/space, publish site, document destination, profile, network, imports, deletions and assistant; dialog open, focused control and validation/error states (`frontend/apps/desktop/src/components/`) | |
| Shared UI and editor dialogs | Account/key/email/password dialogs, document destination, assistant and publish-required flows; dialogs open and keyboard-dismissed (`frontend/packages/ui/src/`, `frontend/packages/editor/src/`) | |
| Web reader and gateway | Root and document routes (`frontend/apps/web/app/routes/_index.tsx`, `$.tsx`); loaded, empty, missing and error documents; menus open | `frontend/apps/web/e2e/a11y-reader.e2e.ts` |
| Web editing and comments | Document route and commenting UI (`frontend/apps/web/app/routes/$.tsx`, `frontend/apps/web/app/commenting.tsx`); editor focused, comment composer open, submit errors | |
| Web account and onboarding | Sign in, register, create site, connect, auth callback and email notification settings (`frontend/apps/web/app/routes/hm.sign-in.tsx`, `hm.register.tsx`, `hm.create-site.tsx`, `hm.connect.tsx`, `hm.auth.callback.tsx`, `hm.email-notifications.tsx`, `frontend/apps/web/app/web-create-space-dialog.tsx`); invalid and pending states | |
| Vault | `/`, `/login`, `/login/password`, `/login/recover`, `/login/no-recovery`, `/auth/choose`, `/password/set`, `/verify/pending`, `/connect` and `/connect/success` (`vault/src/frontend/router.tsx`); locked, empty and auth-error states | |
| Vault | `/recovery`, `/settings/recovery-words`, `/identity-secured`, `/login/recovered`, `/profile/create`, `/delegate` and `/settings`; recovery confirmation, focused forms and validation errors | |
| Emails | Confirmation and notification templates (`frontend/apps/emails/email-confirmation.tsx`, `notifier.tsx`) plus shared header, content, footer and notification settings components | |
