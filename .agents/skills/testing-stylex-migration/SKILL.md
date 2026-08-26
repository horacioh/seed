---
name: Test the StyleX migration in web and desktop apps
description:
  End-to-end visual regression workflow for the Seed web app (Remix + StyleX) and desktop app (Electron + StyleX) after
  the Tailwind -> StyleX migration.
---

# Testing the StyleX migration in Seed web and desktop apps

## Scope

Use this skill to verify that the Tailwind -> StyleX migration has not broken buttons, typography, colors, spacing, dark
mode, layout, dialogs, toasts, inputs, account settings tabs, the editor chrome, radio groups, `ImageForm`, or the main
shell.

## Web app

1. Build the production app under Node 22 to avoid ESM loader issues:
   ```bash
   cd /home/ubuntu/repos/seed
   NODE_OPTIONS='--experimental-require-module' \
     mise exec node@22.22.0 -- pnpm --filter @shm/web build
   ```
2. Create a data directory and an empty `config.json` so the not-registered page can render without a daemon:
   ```bash
   export DATA_DIR=/tmp/seed-web-test
   mkdir -p "$DATA_DIR"
   echo '{}' > "$DATA_DIR/config.json"
   ```
3. Serve the built app:
   ```bash
   cd /home/ubuntu/repos/seed/frontend/apps/web
   PORT=3456 DATA_DIR=/tmp/seed-web-test NODE_OPTIONS='--import ./instrumentation.server.mjs' \
     DAEMON_HTTP_PORT=56001 DAEMON_FILE_URL='http://localhost:56001/ipfs' \
     LIGHTNING_API_URL='https://ln.testnet.seed.hyper.media' \
     nohup /home/ubuntu/repos/seed/node_modules/.bin/remix-serve ./build/server/index.js
   ```
4. Key pages to inspect:
   - `http://localhost:3456/` (not-registered homepage)
   - `http://localhost:3456/hm/register`
   - `http://localhost:3456/hm/create-site`
   - `http://localhost:3456/hm/download` (error boundary)
5. Use Playwright `page.fill('input#space-name', '...')` to reliably type in the React-controlled `Space name` input.
   The `Continue` button is reached with `page.getByRole('button', {name: 'Continue'}).click()`; direct mouse
   coordinates in the test VM may not hit the exact clickable area.
6. Watch the browser console for hydration errors and `Failed to load resource` 404s; the latter are usually a missing
   favicon/static asset, not a route failure. Inspect network `response` events to confirm.
7. Dark mode is toggled by the `dark` class on `document.documentElement`. In VMs without a working GNOME color-scheme
   setting, use the browser console:
   ```js
   document.documentElement.classList.add('dark')
   ```
8. The Chrome address bar may not accept typed URLs in this environment. Use the browser console to navigate:
   ```js
   window.location.href = 'http://localhost:3456/hm/register'
   ```

## Desktop app

1. Build the daemon once:
   ```bash
   direnv exec . plz build //backend:seed-daemon --nolock
   ```
2. Prepare a fixture data directory and start the daemon:
   ```bash
   export SEED_FIXTURE_DATA_DIR=/tmp/seed-desktop-test
   mkdir -p "$SEED_FIXTURE_DATA_DIR"
   /home/ubuntu/repos/seed/plz-out/bin/backend/seed-daemon-x86_64-unknown-linux-gnu \
     -data-dir="$SEED_FIXTURE_DATA_DIR/daemon" \
     -keystore-dir="$SEED_FIXTURE_DATA_DIR/daemon/keys" \
     -http.port=56001 -grpc.port=56002 -p2p.port=56000
   ```
3. Launch the desktop app with sandbox/GPU disabled, remote debugging enabled, and reuse the already running daemon:
   ```bash
   cd /home/ubuntu/repos/seed/frontend/apps/desktop
   SEED_FIXTURE_DATA_DIR=/tmp/seed-desktop-test \
   VITE_DESKTOP_APPDATA=/tmp/seed-desktop-test \
   VITE_DESKTOP_HTTP_PORT=56001 \
   VITE_DESKTOP_GRPC_PORT=56002 \
   VITE_DESKTOP_P2P_PORT=56000 \
   SEED_NO_DAEMON_SPAWN=1 \
     nohup pnpm dev:debug
   ```
   `dev:debug` starts Electron with `--remote-debugging-port=9222`, which makes the renderer pages controllable with
   Playwright's CDP connector.
4. Connect to the running Electron renderer from Node:
   ```js
   import {chromium} from 'playwright-core'
   const browser = await chromium.connectOverCDP('http://localhost:9222')
   // Two pages usually appear: 'Settings' and 'Identity Settings'
   for (const ctx of browser.contexts()) {
     for (const p of ctx.pages()) {
       console.log(await p.title(), p.url())
     }
   }
   ```
5. Common issues:
   - `VITE_DESKTOP_APPDATA` must be a writable path; the app may hang at startup without it.
   - A file keystore produces `useVaultStatus failed: ConnectError: ... not a vault.Vault` warnings. This is expected
     and does not block the shell from rendering, but some onboarding flows that require vault state may hang.
   - `Seed -> Preferences` loads `/src/pages/settings.tsx` dynamically. If that module has a bundler/hydration error,
     the settings window will show a "Failed to fetch dynamically imported module" error and account settings tabs
     cannot be reached without an identity.
   - If `Seed -> Preferences` does not open from the menu, try the `Ctrl+,` shortcut or use `wmctrl` to focus the
     "Settings" window that Electron opens.
   - If the Vite renderer dev server binds to `127.0.0.1`, Electron can fail to resolve `localhost` for IPv6; ensure
     `host: '::'` is set in `frontend/apps/desktop/vite.renderer.config.mts`.
   - Sync-options radio groups (`On publish`, `On copy`) and the General theme radio should respond to both the radio
     circle and the associated label text. If direct mouse clicks on a radio circle are hard to hit in a fixture-only
     setup, click the label text or use `page.locator('label[for="theme-dark"]').click()`; keyboard navigation (`Tab` to
     focus, `Left`/`Right` to change) remains a fallback.
   - The onboarding `ImageForm` at `frontend/apps/desktop/src/pages/image-form.tsx` is only rendered inside
     `OnboardingDialog` in `frontend/apps/desktop/src/components/onboarding.tsx`. In the current source tree
     `OnboardingDialog` is dispatched but not mounted, so that exact surface is not reachable through normal UI. The
     shared `ImageForm` in `frontend/packages/ui/src/image-form.tsx` (used by both web `/hm/create-site` and the desktop
     `CreateSpaceFlow` dialog) should be tested as the authoritative component.
   - `/hm/create-site` Step 2 `ImageForm` blocks should show the placeholder and size hint stacked, not concatenated. If
     `emptyLabel` is supplied (logo/favicon), check that it is not duplicated by both the empty placeholder and the
     overlay.
6. Use `wmctrl -l` to discover open desktop windows (welcome, settings, etc.) and `wmctrl -i -a <WID>` to focus them for
   screenshots.
7. The settings window may open as a modal overlay inside the main window (`Seed -> Preferences` or `Ctrl+,`); account
   settings are reached from the top-right account profile dropdown or from `Identity Settings` in the sidebar.

## Devin Secrets Needed

None for local testing. A GitHub token is normally provided by `gh auth` through the `.envrc`/`mise` setup.

## Known limitations (out of scope)

- `frontend/apps/notify`, `frontend/apps/explore`, and `frontend/packages/editor/e2e` still use Tailwind and are not
  covered.
- Full backend sync and document editing require a registered identity/keys, which is beyond a visual regression check.
- The onboarding `ImageForm` (`apps/desktop/src/pages/image-form.tsx`) cannot be reached unless `<OnboardingDialog />`
  is mounted in the app shell.

## Checklist

- [ ] Web homepage card renders with border, rounded corners, shadow, emoji, headings and body text.
- [ ] `/hm/register` and `/hm/create-site` render styled cards, inputs and buttons.
- [ ] `/hm/create-site` Step 2 `ImageForm` labels are not duplicated and sizes are clearly separated.
- [ ] Web dark mode changes background and text color.
- [ ] Desktop loading/onboarding window renders without a white/empty screen.
- [ ] Desktop main window shows a styled sidebar, title bar and welcome cards.
- [ ] Desktop Settings > General theme radio updates immediately and the app theme follows.
- [ ] Desktop Settings > Sync `On publish` and `On copy` radios update immediately.
- [ ] `ImageForm` file upload triggers a preview and hovering shows a clickable remove button.
- [ ] Buttons, inputs, dialogs and toasts retain their migrated styling.
- [ ] No obviously unstyled Tailwind-only elements appear in `@shm/desktop` and `@shm/ui` surfaces.
