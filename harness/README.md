# Seed web UI test harness

This is a standalone, npm-installed TypeScript harness for deterministic web
application smoke tests. It deliberately does not use the Seed repository's
pnpm, mise, or build system.

This package deliberately uses `npm`, not the repository's `pnpm`, as a temporary
intentional exception to the root AGENTS.md rule. It must remain decoupled from
the mise/pnpm toolchain while GitHub 429s block it and attach to Chrome over CDP;
it can be folded into the pnpm workspace once that toolchain is reliable.

## Run the green demo

```sh
cd harness
npm install
npm run demo
```

The demo starts the bundled static sample app, attaches to the already-running
Chrome CDP endpoint at `http://localhost:29229`, runs the sample scenario, and
writes a timestamped run directory under `artifacts/`.

## Run another web app

```sh
npm run harness:web -- --url https://example.com
```

The generic mode navigates to the URL, asserts that the body is visible and the
title is non-empty, then produces the same JSON, HTML, Markdown, screenshots,
markers, and MP4 artifacts.

Useful options:

```text
--url <url>             URL to test
--scenario <file>       TypeScript scenario module
--cdp <url>             Chrome CDP URL (default http://localhost:29229)
--out <dir>             Artifact root (default artifacts)
```

The harness requires Node 20+, npm, a reachable Chrome CDP endpoint, and
`ffmpeg` at `/usr/bin/ffmpeg` (or on `PATH`). It uses Playwright's auto-waiting
and event-based readiness; it does not use sleep-based synchronization.
