# Seed web UI test harness

This is a pnpm workspace package for deterministic web application smoke tests. It is installed and run with pnpm like
the rest of the Seed repository.

## Run the green demo

```sh
pnpm install
pnpm --filter @shm/harness demo
```

The demo starts the bundled static sample app, attaches to the already-running Chrome CDP endpoint at
`http://localhost:29229`, runs the sample scenario, and writes a timestamped run directory under `artifacts/`.

## Run another web app

```sh
pnpm --filter @shm/harness harness:web -- --url https://example.com
```

The generic mode navigates to the URL, asserts that the body is visible and the title is non-empty, then produces the
same JSON, HTML, Markdown, screenshots, markers, and MP4 artifacts.

Useful options:

```text
--url <url>             URL to test
--scenario <file>       TypeScript scenario module
--cdp <url>             Chrome CDP URL (default http://localhost:29229)
--out <dir>             Artifact root (default artifacts)
```

The harness requires Node 20+, pnpm, a reachable Chrome CDP endpoint, and `ffmpeg` at `/usr/bin/ffmpeg` (or on `PATH`).
It uses Playwright's auto-waiting and event-based readiness; it does not use sleep-based synchronization.

## Electron target (untested)

The Electron driver is shipped but untested in this environment. The Seed desktop app cannot be built here because its
account and onboarding flows require the Go daemon plus a real Vault/keyring. Only renderer-level UI behavior is
meaningfully assertable once those prerequisites are available.

Build the desktop app with `pnpm desktop:package`; the resulting build is under `frontend/apps/desktop/out/`. Find the
Electron executable and the application main entry point in that build using `frontend/apps/desktop/test/utils.ts` as
the reference. The harness deliberately requires explicit paths and does not guess the build layout or parse an ASAR
automatically.

Run the Electron target with a scenario:

```sh
pnpm --filter @shm/harness harness:web -- \
  --electron-main /path/to/app.asar/main.js \
  --electron-executable /path/to/electron-executable \
  --scenario harness/scenarios/sample.electron.ts
```

Additional Electron arguments can be repeated with `--electron-arg <value>`. Do not combine Electron options with
`--url`; an Electron application loads its own entry point and typical Electron scenarios should not use renderer
navigation. The recorder captures renderer-window frames through Playwright, the same way it captures web frames.
