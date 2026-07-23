---
name: record-vm-screen
description: Record a full-screen video of the VM desktop while testing the Seed desktop (Electron) app, and deliver it to the user as a playable attachment. Use whenever the user wants a screen recording / video proof of the app running or of a UI test — this reproduces exactly the recording workflow used when smoke-testing the Electron app.
---

# Record the VM Screen While Testing the App

Goal: produce one continuous, annotated full-screen video that a reviewer can watch
to confirm the app works, and attach it to a chat message so the user can play it.

This uses Devin's built-in **test mode + screen recording** (the same flow used to
record the Electron app smoke test). The recording captures the whole desktop, so
maximize the app window first. Recording tools capture GUI interactions only — do
setup (builds, daemon boot, terminal work) BEFORE you start recording.

## Prerequisites
- App already built and runnable — see the `testing-desktop-app` skill (toolchain via
  mise+direnv, `pnpm install`, `plz build //backend:seed-daemon`, launch with
  `SEED_KEYSTORE_DIR=<dir> pnpm dev`).
- Launch the app and wait for its window to render BEFORE recording.

## Procedure

1. **Enter test planning mode.** Call `test_mode` with `target_mode="test_planning"`.
   Cite the user's request to test/record as `user_approval_citation`. Write a short
   test-plan `.md` (the flow you'll demonstrate), then call `test_mode` with
   `target_mode="test_execution"` and the plan path.

2. **Maximize the app window** so the full app is visible (do NOT record a
   half-covered window). On this Ubuntu VM the reliable command is:
   ```bash
   wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz
   ```
   Do NOT use `xdotool key super+Up` (tiles to half-screen on many WMs).

3. **Start recording.** Call `recording_start` (defaults capture the whole screen).
   Start recording only AFTER setup is done and the window is up.

4. **Annotate as you go** with `annotate_recording` (~5+ annotations):
   - `type="setup"` before testing begins (e.g. "App launched, daemon booted").
   - `type="test_start"` with `test="It should ..."` when each named check begins.
   - `type="assertion"` with matching `test`, a `test_result`
     (`passed`/`failed`/`untested`), and a concise `assertion` after each check.
   Keep assertions consolidated and under ~80 chars.

5. **Drive the app through the primary flow** using the `computer` tool (click/type),
   taking a screenshot at each key state. For the Electron app the proven flow is:
   window renders onboarding → open the synced "Seed Hypermedia" site from the sidebar
   → open a document → navigate the Library.

6. **Stop recording.** Call `recording_stop` with a `title` and `summary`. It returns
   the video path (an `.mp4` under `~/screencasts/...`).

7. **Deliver the video.** Call `message_user` with the returned `.mp4` path in
   `attachments` so the user can watch it. Also attach a `test-report.md` if reporting
   results.

## Notes
- If the app UI itself needs changes during recording, exit with
  `test_mode target_mode="none"`, make the change, then re-enter planning/execution.
- Do not `kill -9` anything mid-recording; stop cleanly via `recording_stop`.
- Screen: display `:0`, 1600x1200 on this VM (query with `xdpyinfo | grep dimensions`
  if you need exact geometry).

### Devin Secrets Needed
None. Recording and local app testing require no external credentials.
