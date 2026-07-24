# UI Test Harness — Design & Build Plan

A plan for a robust, portable harness to **drive, verify, and record** any UI we
build (Electron desktop app + web sites), replacing the open-loop
`ffmpeg`+`xdotool` skill with a closed-loop system that produces both pass/fail
results and a watchable video.

> Scope note: the current `record-vm-screen` skill stays useful for quick demos and
> raw capture. This plan is the "real regression harness" it hands off to.

---

## 1. Goals & non-goals

**Goals**
- Closed-loop testing: every action can be verified (DOM/selectors + screenshots),
  not fired blindly at pixel coordinates.
- One harness for both targets: **web** (browser) and **Electron** (desktop app).
- Deterministic waits (wait-for-element/condition), no `sleep`-based timing.
- Structured assertions with a machine-readable + human-readable report.
- A recording of each run, ideally with markers for each step/assertion.
- Runs locally on the dev VM **and** headless in CI (no physical display).

**Non-goals**
- Replacing unit tests. This is E2E/integration + visual evidence.
- Cross-browser matrix (start with Chromium; add later if needed).
- Load/perf testing.

---

## 2. Why closed-loop (the core problem with today's skill)

`xdotool` sends input at absolute screen coordinates with **no feedback**: nothing
confirms the click landed, the element existed, or the view changed. `ffmpeg`
records whatever happened but has no notion of assertions. Result: brittle,
un-verifiable tests. The harness fixes this by driving through an automation API
that has **selectors, auto-waiting, and assertions**, and layering recording +
reporting on top.

---

## 3. Technology choice

**Playwright** as the core driver, because it covers both targets from one API:
- **Web**: attach to the already-running Chrome via the CDP endpoint the repo
  exposes (`http://localhost:29229`), or launch its own Chromium.
- **Electron**: Playwright's `_electron` launcher drives the actual app
  (main + renderer), and the repo **already has** a Playwright e2e project
  (`frontend/apps/desktop`, `pnpm desktop:test`, `--project=e2e`). Build on that
  instead of reinventing input with `xdotool`.

Playwright gives us for free the pieces that are "missing" today: auto-waiting,
robust selectors (role/text/test-id), `expect` assertions with retry, tracing,
screenshots, and video capture. `xdotool` remains only as an escape hatch for
things outside the DOM (native OS menus, window-manager actions).

---

## 4. Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              test runner                  │
                    │        (Playwright test + config)         │
                    └───────────────┬───────────────┬──────────┘
                                    │               │
                 web target ┌───────▼──────┐  ┌─────▼─────────┐ electron target
                            │ browser ctx  │  │ _electron app │
                            │ (CDP :29229  │  │ (launches the │
                            │  or launch)  │  │  built app)   │
                            └───────┬──────┘  └─────┬─────────┘
                                    │               │
        ┌───────────────────────────┼───────────────┼───────────────────────┐
        │ shared harness libraries                                          │
        │  • fixtures: app boot, daemon (SEED_KEYSTORE_DIR), teardown       │
        │  • waits: waitForReady / waitForNetworkIdle / waitForSelector     │
        │  • assertions: expect wrappers + custom matchers                  │
        │  • screenshotter: named checkpoints -> artifacts/                 │
        │  • recorder: whole-screen ffmpeg OR Playwright video             │
        │  • reporter: JSON + HTML + markers manifest                      │
        └───────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  artifacts/  (per run, git-ignored)             │
                    │   ├─ video.mp4 / *.webm                         │
                    │   ├─ shots/<test>/<step>.png                    │
                    │   ├─ trace.zip (Playwright trace)               │
                    │   ├─ report.html                                │
                    │   └─ results.json + markers.json                │
                    └────────────────────────────────────────────────┘
```

---

## 5. Components (the tools to build)

### 5.1 Recorder (`record-screen.sh` — already built, keep)
- `start`/`stop`/`status`, ffmpeg x11grab, SIGINT-flush → valid mp4.
- Add: `shot <name>` single-frame grab; optional per-window capture; time-sync a
  `t=0` timestamp so markers can be aligned to the video.
- Two modes: **whole-screen** (ffmpeg, shows OS chrome / native dialogs) vs
  **in-app** (Playwright `recordVideo`, per-context, cleaner for web/Electron
  renderer). Harness picks based on what the test needs.

### 5.2 Screenshotter / checkpoint helper
- `checkpoint("name")` → Playwright `page.screenshot()` into
  `artifacts/shots/<test>/<name>.png`, plus (optional) full-screen via ffmpeg for
  parity with the video.
- Foundation for optional **visual regression** (compare vs baseline with a pixel
  diff; store baselines under `tests/__screenshots__/`).

### 5.3 Web driver
- Connect: `chromium.connectOverCDP('http://localhost:29229')` to reuse the live,
  logged-in browser, or `chromium.launch()` for isolated runs.
- Navigation via URL + role/text selectors; no pixel math.

### 5.4 Electron driver
- `_electron.launch({ args: [mainEntry], env: { SEED_KEYSTORE_DIR, VITE_* ports }})`.
- Reuse the repo's existing e2e setup/fixtures; add a boot fixture that also
  starts/points at the Go daemon and cleans the `SingletonLock`.

### 5.5 Wait / synchronization helpers
- `waitForReady(page)`: app-specific readiness (e.g. main window painted, a known
  root element/testid visible, daemon health check green).
- `waitForNetworkIdle`, `waitForSelector`, `expect(...).toBeVisible()` (all
  auto-retry). **No `sleep`** — this directly addresses the AGENTS.md rule against
  fixing timing with sleeps.

### 5.6 Assertions & custom matchers
- Thin wrappers over Playwright `expect` so each assertion also emits a **marker**
  (name, result, timestamp) for the report + video overlay.
- A few domain matchers (e.g. `toHaveRenderedDocument`, `toBeOnRoute('/overview')`).

### 5.7 Reporter
- Emit `results.json` (test, steps, assertions, pass/fail, timings) and
  `markers.json` (timestamp → label/result) aligned to the recording.
- Human-readable `report.html` (Playwright's HTML reporter) + a short generated
  `RUN-REPORT.md` with inline checkpoint screenshots — mirrors the report I hand
  users today.
- Stretch: burn markers into the mp4 (ffmpeg `drawtext`) so the video is
  self-describing, echoing Devin's annotate-and-slow-down behavior.

### 5.8 Fixtures / lifecycle
- Global setup: activate mise+direnv env, ensure daemon built
  (`plz build //backend:seed-daemon`), start daemon with file keystore, wait
  healthy.
- Per-test: fresh context/app, maximize window
  (`wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`), attach recorder.
- Teardown: stop recorder (flush mp4), collect artifacts, kill app/daemon, clear
  `SingletonLock`/sockets, remove stale recorder pidfile.

### 5.9 Headless / CI support
- Wrap runs in `xvfb-run` (virtual X display) so the same harness works with no
  physical screen. Document Wayland caveat (use Xvfb/X11).
- Cache toolchain via the existing blueprint; expose `agent-ci` workflow entry.

### 5.10 CLI / entrypoints
- `pnpm harness:web`, `pnpm harness:desktop`, `pnpm harness:all`.
- Flags: `--record` (whole-screen vs video-off), `--headed/--headless`,
  `--update-snapshots`, `--grep <test>`.

---

## 6. Proposed file layout

```
frontend/apps/desktop/
  e2e/                         # (exists) Playwright Electron tests — extend
harness/                       # new shared harness package
  playwright.config.ts         # projects: web (CDP/launch) + electron
  src/
    fixtures.ts                # app/daemon boot, maximize, recorder attach
    waits.ts                   # waitForReady, waitForNetworkIdle, ...
    assert.ts                  # expect wrappers + custom matchers + markers
    recorder.ts                # wraps record-screen.sh + Playwright video
    screenshot.ts              # checkpoint(name)
    report.ts                  # results.json + markers.json + RUN-REPORT.md
  scripts/
    record-screen.sh           # moved/shared from the skill
    with-xvfb.sh               # xvfb-run wrapper for CI
  tests/
    web/*.spec.ts
    desktop/*.spec.ts
    __screenshots__/           # visual baselines (opt-in)
artifacts/                     # git-ignored run outputs
```

---

## 7. Phased delivery

**Phase 0 — Foundations (½–1 day)**
- Stand up `harness/` + `playwright.config.ts` with a web project (CDP connect)
  and an electron project (reuse existing e2e fixtures).
- Port `record-screen.sh` in; add `shot`. One smoke test per target
  (open → assert a known element visible → checkpoint).

**Phase 1 — Verification loop (1–2 days)**
- `waits.ts` + `assert.ts` (marker-emitting assertions).
- Checkpoint screenshots wired into artifacts. Replace all `sleep`s.

**Phase 2 — Reporting + recording alignment (1 day)**
- `report.ts`: JSON + HTML + `RUN-REPORT.md` with inline shots.
- Align markers to the recording; stretch: burn-in overlay via ffmpeg.

**Phase 3 — Real flows (1–2 days)**
- Desktop golden path (window renders → open synced site → open document →
  Library) as asserted steps.
- One representative web flow.

**Phase 4 — CI/headless (1 day)**
- `with-xvfb.sh`, `agent-ci` workflow entry, artifact upload, toolchain caching
  via blueprint. Make it gate PRs.

**Phase 5 — Hardening (ongoing)**
- Flake controls (retries, trace-on-failure), optional visual-regression baselines,
  richer domain matchers.

---

## 8. Risks & mitigations
- **Flakiness** → auto-waiting + retries + trace-on-failure; never `sleep`.
- **Electron identity/Vault gap on headless VM** → file keystore boots but isn't a
  Vault, so onboarding/account flows can't be asserted here; either provide a real
  Vault/keyring in CI or scope those tests out (as done in the manual run).
- **Coordinate/native bits** (OS menus, WM) → keep `xdotool` as a narrow escape
  hatch, everything else through Playwright selectors.
- **Wayland/headless** → standardize on Xvfb/X11 for runs.
- **Artifact size** → cap FPS/resolution, git-ignore `artifacts/`, upload only on
  failure in CI.

---

## 9. Definition of done
- `pnpm harness:web` and `pnpm harness:desktop` run locally and under `xvfb`,
  producing: pass/fail `results.json`, `report.html`, `RUN-REPORT.md` with
  screenshots, and a playable `video.mp4` per run.
- Golden-path desktop + one web flow are asserted (not just recorded).
- Wired into CI (agent-ci) and gating PRs.
- The `record-vm-screen` skill links here as the "robust harness" upgrade path.
