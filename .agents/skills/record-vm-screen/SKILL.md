---
name: record-vm-screen
description: Record a video of the machine's screen while developing or testing anything that renders on screen (a desktop/Electron app, a web UI, a game, an emulator, a CLI TUI). Produces a self-contained mp4 with plain ffmpeg — no Devin-specific tooling required. Use whenever you want video proof that something renders/works and want to hand the user a playable file.
---

# Record the Screen While Developing/Testing (generic)

Goal: capture one continuous mp4 of the desktop while an app runs, then hand the
user a playable file. This is app-agnostic — it records whatever is on the X
display, so it works for the Seed Electron app, a web UI in the browser, an
Android emulator window, a game, etc.

## Two ways to record — pick one

### A. Self-made ffmpeg recorder (preferred, portable)
A plain `ffmpeg` x11grab recorder lives next to this skill:
[`record-screen.sh`](./record-screen.sh). It needs no Devin-specific tools, so
you (or CI, or a teammate) can run it anywhere with an X display. It captures the
whole screen by default.

```bash
SKILL_DIR=.agents/skills/record-vm-screen

# 1) Start recording (returns immediately, records in the background)
$SKILL_DIR/record-screen.sh start /tmp/demo.mp4

# 2) Launch / drive the app you want to show (do your normal dev or test steps)

# 3) Stop — writes a valid, playable mp4 (waits for ffmpeg to flush the trailer)
$SKILL_DIR/record-screen.sh stop

$SKILL_DIR/record-screen.sh status   # optional: "recording ..." or "idle"
```

Options via env vars:
- `DISPLAY` — X display to grab (default `:0`).
- `FPS` — frame rate (default `25`; `15` is fine and smaller).
- `WINDOW=1` — record only the active window instead of the full screen
  (uses `xdotool getactivewindow`).
- `OUTDIR` — where to put the file when you don't pass a path.

How it works / gotchas:
- `start` launches `ffmpeg -f x11grab ... -codec:v libx264 -pix_fmt yuv420p` under
  `setsid nohup` and records the PID + output path under `$TMPDIR/vm-screen-rec`.
- `stop` sends **SIGINT** to ffmpeg and waits for it to exit so the mp4 trailer
  (`moov` atom) is written. **Never `kill -9`** the recorder — the file would be
  headerless and unplayable (a ~48-byte stub).
- Maximize the app window before starting so the whole app is visible. On this
  Ubuntu VM: `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`
  (avoid `xdotool key super+Up`, which half-tiles on many WMs).
- Requirements: `ffmpeg` (with `x11grab`), `xdpyinfo`; `xdotool` only for
  `WINDOW=1`. Screen here is display `:0` at 1600x1200 (query exact geometry with
  `xdpyinfo | grep dimensions`).
- To hand the file to the user: attach the mp4 path in a chat message.

## Driving interactions (mouse, keyboard, scroll)

Recording alone just captures whatever happens on screen — to actually *test* an
Electron app or a website you also need to drive it. Use `xdotool` (already on
this VM); it works identically for native/Electron windows and for browser pages.
Coordinates are in the **real display** resolution (here 1600x1200), with (0,0)
at the top-left. Always `export DISPLAY=:0` first.

```bash
export DISPLAY=:0

# Pointer
xdotool mousemove 640 400              # move to absolute x,y
xdotool mousemove_relative -- 40 -20   # move relative (-- allows negatives)
xdotool getmouselocation               # read current position
xdotool mousemove 640 400 click 1      # move then left-click (1=left,2=mid,3=right)
xdotool click --repeat 2 --delay 120 1 # double-click
xdotool click 3                        # right-click (context menu)

# Scroll (wheel = buttons 4=up, 5=down); repeat for longer scrolls
xdotool click --repeat 5 5             # scroll down 5 notches
xdotool click --repeat 5 4             # scroll up

# Drag (press, move, release) — e.g. select text or drag a slider
xdotool mousemove 300 300 mousedown 1 mousemove 500 300 mouseup 1

# Keyboard
xdotool type --delay 40 "hello world"  # type a string
xdotool key Return                     # named keys: Return, Tab, Escape, BackSpace,
xdotool key ctrl+a                     #   Up/Down/Left/Right, Page_Up, ctrl+c, etc.
xdotool key ctrl+l                     # focus browser address bar, then type a URL
```

Targeting a specific window (handy when several are open):
```bash
xdotool search --name "Seed" windowactivate            # focus the Electron window
xdotool search --name "Chrome" windowactivate          # focus the browser
xdotool getactivewindow getwindowname                  # confirm what's focused
xdotool getactivewindow windowsize 1280 800            # resize for a stable layout
```

Tips for reliable, testable interactions:
- Focus/raise the target window first (`windowactivate`), then interact — clicks
  go to whatever is under the pointer on the active window.
- Coordinates are absolute screen pixels. Prefer clicking predictable spots
  (buttons, menus) and, for the browser, navigate via `ctrl+l` + `type` + `Return`
  instead of guessing pixel positions of links.
- Add small `--delay`s (typing) and short `sleep`s between steps so the UI can
  react before the next action — and so the recording shows each step clearly.
- Typical test loop while recording: `record-screen.sh start` → activate window →
  `xdotool` click/type/scroll through the flow (with sleeps) → `record-screen.sh
  stop` → attach the mp4.
- Requirement: `xdotool` (present on this VM at `/opt/.devin/.../xdotool`).

### B. Devin's built-in recording tools (agent-only)
When *Devin itself* is doing the testing, it has three built-in tools that record
the screen and return an mp4 it attaches in chat: `recording_start`,
`annotate_recording` (adds setup/test_start/assertion markers that the player
slows down on), and `recording_stop`. These are only callable by the agent during
a session — you cannot invoke them from your own scripts or CI, which is why
option A exists. Typical agent flow: enter test mode (`test_mode` →
`test_planning` → `test_execution`), maximize the window, `recording_start`, drive
the app while adding `annotate_recording` markers, then `recording_stop` and
attach the returned mp4. Prefer option A for anything reproducible/portable.

### Devin Secrets Needed
None. Screen recording and local app runs require no external credentials.
