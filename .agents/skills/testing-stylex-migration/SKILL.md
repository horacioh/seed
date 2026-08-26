---
name: Test the StyleX migration in web and desktop apps
description: End-to-end visual regression workflow for the Seed web app (Remix + StyleX) and desktop app (Electron + StyleX) after the Tailwind -> StyleX migration.
---

# Testing the StyleX migration in Seed web and desktop apps

## Scope

Use this skill to verify that the Tailwind -> StyleX migration has not broken
buttons, typography, colors, spacing, dark mode, layout, dialogs, toasts,
inputs, account settings tabs, the editor chrome, or the main shell.

## Web app

1. Build the production app:
   ```bash
   cd frontend/apps/web
   pnpm --filter @shm/web build
   ```
2. Create a data directory and an empty `config.json` so the not-registered page
   can render without a daemon:
   ```bash
   export DATA_DIR=/tmp/seed-web-test
   mkdir -p "$DATA_DIR"
   echo '{}' > "$DATA_DIR/config.json"
   ```
3. Serve the built app:
   ```bash
   cd frontend/apps/web
   NODE_OPTIONS='--import ./instrumentation.server.mjs' DAEMON_HTTP_PORT=58001 DAEMON_FILE_URL="http://localhost:58001/ipfs" LIGHTNING_API_URL='https://ln.testnet.seed.hyper.media' npx remix-serve ./build/server/index.js
   ```
4. Key pages to inspect:
   - `http://localhost:3456/` (not-registered homepage)
   - `http://localhost:3456/hm/register`
   - `http://localhost:3456/hm/create-site`
   - `http://localhost:3456/hm/download` (error boundary)
5. Dark mode is toggled by the `dark` class on `document.documentElement`. In
   VMs without a working GNOME color-scheme setting, use the browser console:
   ```js
   document.documentElement.classList.add('dark')
   ```
6. The Chrome address bar may not accept typed URLs in this environment. Use
   the browser console to navigate:
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
   plz-out/bin/backend/seed-daemon-x86_64-unknown-linux-gnu \
     -data-dir="$SEED_FIXTURE_DATA_DIR/daemon" \
     -keystore-dir="$SEED_FIXTURE_DATA_DIR/daemon/keys" \
     -http.port=59001 -grpc.port=59002 -p2p.port=59000
   ```
3. Launch the desktop app with sandbox/GPU disabled and reuse the already
   running daemon:
   ```bash
   cd frontend/apps/desktop
   SEED_FIXTURE_DATA_DIR=/tmp/seed-desktop-test \
   VITE_DESKTOP_APPDATA=/tmp/seed-desktop-test \
   VITE_DESKTOP_HTTP_PORT=59001 \
   VITE_DESKTOP_GRPC_PORT=59002 \
   VITE_DESKTOP_P2P_PORT=59000 \
   SEED_NO_DAEMON_SPAWN=1 \
   pnpm dev -- --no-sandbox --disable-gpu
   ```
4. Common issues:
   - `VITE_DESKTOP_APPDATA` must be a writable path; the app may hang at startup
     without it.
   - A file keystore produces `useVaultStatus failed: ConnectError: ... not a
     vault.Vault` warnings. This is expected and does not block the shell from
     rendering, but some onboarding flows that require vault state may hang.
   - `Seed -> Preferences` loads `/src/pages/settings.tsx` dynamically. If that
     module has a bundler/hydration error, the settings window will show a
     "Failed to fetch dynamically imported module" error and account settings
     tabs cannot be reached without an identity.
5. Use `wmctrl -l` to discover open desktop windows (welcome, settings, etc.)
   and `wmctrl -i -a <WID>` to focus them for screenshots.

## Devin Secrets Needed

None for local testing. A GitHub token is normally provided by `gh auth`
through the `.envrc`/`mise` setup.

## Known limitations (out of scope)

- `frontend/apps/notify`, `frontend/apps/explore`, and
  `frontend/packages/editor/e2e` still use Tailwind and are not covered.
- Full backend sync and document editing require a registered identity/keys,
  which is beyond a visual regression check.

## Checklist

- [ ] Web homepage card renders with border, rounded corners, shadow, emoji,
      headings and body text.
- [ ] `/hm/register` and `/hm/create-site` render styled cards, inputs and
      buttons.
- [ ] Web dark mode changes background and text color.
- [ ] Desktop loading/onboarding window renders without a white/empty screen.
- [ ] Desktop main window shows a styled sidebar, title bar and welcome cards.
- [ ] Buttons, inputs, dialogs and toasts retain their migrated styling.
- [ ] No obviously unstyled Tailwind-only elements appear in `@shm/desktop` and
      `@shm/ui` surfaces.
