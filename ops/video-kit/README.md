# Seed tutorial video kit

The kit captures real product flows with Playwright, writes a deterministic beat timeline, then renders the viewport
screenshots with a camera, cursor, captions and synthesized click audio. Each platform lives in its own folder; capture
logic, selectors, reset hooks and copy belong there, not in the shared kit.

## Requirements

- Node.js 20 or newer and npm.
- FFmpeg with H.264/AAC support.
- Chromium installed through Playwright.
- Inter and Noto Color Emoji fonts on Linux. On macOS and Windows, Inter is still used for the rendered overlays.

## Setup

Run from the Seed repository root:

```bash
cd ops/video-kit && npm install && npx playwright install chromium
```

Install the kit's Inter fonts and fontconfig alias on Linux:

```bash
bash ops/video-kit/tools/install-fonts.sh
```

The alias maps `system-ui`, `sans-serif`, and `-apple-system` to Inter. Install Noto Color Emoji from the OS package
manager as well (for example, `sudo apt install fonts-noto-color-emoji`); on a rootless machine, download and extract
the Ubuntu `fonts-noto-color-emoji` package into `~/.local/share/fonts`, then run `fc-cache -f`.

## Commands

Paths may be absolute or relative to the repository root:

```bash
node ops/video-kit/capture/run.mjs ops/coolify/video --lang en
bash ops/video-kit/tools/build.sh ops/coolify/video --preview
bash ops/video-kit/tools/build.sh ops/coolify/video
```

Capture writes screenshots under `shots/<take>/` and updates `shots/beats.json`. The preview is 1920×1080; the final
render is 3840×2160 at 60 fps. To inspect renders without encoding:

```bash
node ops/video-kit/render/render.mjs ops/coolify/video --lang en --still 6000 /path/to/frame.png
node ops/video-kit/render/render.mjs ops/coolify/video --lang en --contact /path/to/contact.png --every 2000
```

`--format 9x16` captures at phone width and keeps the renderer's iPhone frame. `--frame card|none|window` selects the
desktop composition; Seed tutorials default to `card`.

## Tutorial folder

```text
ops/<platform>/video/
├── capture.mjs          real user flow and optional repeatability/browser hooks
├── spec.js              title, theme, beat order and per-beat camera/pacing options
├── captions.en.json     intro, concise beat captions and outro copy
├── shots/beats.json     committed timeline, viewport, platform and beat metadata
├── shots/<take>/*.png   generated captures; ignored
├── poster-en.png        generated poster; committed
└── out/                 generated videos; ignored
```

`capture.mjs` exports a default async function `(r, ctx) => {}`. It may also export:

- `prepare(ctx)`, called before each take to reset the platform to a known state.
- `context(browser)`, returning Playwright browser-context options such as `storageState` or `ignoreHTTPSErrors`.
- `options = { baseUrl, browser, context, frameGuard, hideSelectors }` for static defaults. `browser` is passed to
  `chromium.launch`; `context` is passed to `browser.newContext`.
- `persona = 'desktop' | 'phone'` (desktop by default).

The recorder API is intentionally small: `r.nav(path, { waitFor })`, `r.shot(name, { target })`,
`r.click(locator, { name, expect, mark })`, `r.type(locator, text, { name, expect })`, and
`r.poll(name, { every, until, max })`. Every click must have an `expect(page)` postcondition; capture stops on a failed
assertion or frame guard.

## Style rules

- Narrate only real actions; locate targets by role, label, href or stable attributes inside the appropriate container.
  Never use loose text matches. Assert the visible result after every click.
- Keep the frame guard enabled. Its generic skeleton, spinner, toast, banner and empty-state selectors can be replaced
  per tutorial with `options.frameGuard`; `allowToast`, `allowBanner` and `allowEmpty` are per-beat exceptions.
- Commit `beats.json`, `spec.js`, captions, `capture.mjs`, and the poster. Ignore `node_modules`, captured PNGs under
  `shots/<take>/`, and `out/`.
- Use the Seed theme by default: Seed icon from `ops/dokploy/seed/seed-icon.svg`, “Seed Hypermedia” wordmark, green
  accent `#54CD85`, and a rounded viewport card on `#F5F5F3`. The optional 9:16 and window-frame paths remain available.
- Use a 2 s opening hold, roughly 1.5–2 s settled holds, and eased camera moves no larger than 1.25×. Set `noZoom: true`
  to keep still beats wide, then opt action beats into a push with `zoom: true`.
- Captions are short dark pills at the bottom; keep them clear of the control being demonstrated. Long waits use
  `r.poll` and the automatic “Sped up” badge. Long forms drop in as a still rather than being typed
  character-by-character.
- Start with the text intro from `captions.<lang>.json` and crossfade into the first app frame. End with an outro whose
  takeaway and link are provided by the tutorial's caption/spec data.
- Audio is one subtle synthesized click per actual click: no music, voiceover, whooshes, typing ticks or caption sounds.
- Final video is 3840×2160 at 60 fps, H.264 High with AAC 48 kHz; `--preview` produces a 1080p review cut.
