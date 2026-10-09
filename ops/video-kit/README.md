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
`r.poll(name, { every, until, max })`, plus `r.dismissToasts()`. Guard exceptions (`allowLoading`, `allowToast`,
`allowBanner`, `allowEmpty`) are per call. Every click must have an `expect(page)` postcondition; capture stops on a
failed assertion or frame guard.

## Style rules

- Narrate only real actions; locate targets by role, label, href or stable attributes inside the appropriate container.
  Never use loose text matches. Assert the visible result after every click.
- Keep the frame guard enabled. Its generic skeleton, spinner, toast, banner and empty-state selectors can be replaced
  per tutorial with `options.frameGuard`, and `frameGuard.bigTextExempt` adds selectors for text the platform draws
  large on purpose (a dashboard clock, say); `allowToast`, `allowBanner` and `allowEmpty` are per-beat exceptions.
- Commit `beats.json`, `spec.js`, captions, `capture.mjs`, and the poster. Ignore `node_modules`, captured PNGs under
  `shots/<take>/`, and `out/`.
- Use the Seed theme by default: Seed icon from `ops/dokploy/seed/seed-icon.svg`, “Seed Hypermedia” wordmark, green
  accent `#54CD85`, and a rounded viewport card on `#F5F5F3`. The optional 9:16 and window-frame paths remain available.
- Use a 2 s opening hold, roughly 1.5–2 s settled holds, and eased camera moves no larger than 1.25×. Set `noZoom: true`
  to keep still beats wide, then opt action beats into a push with `zoom: true`.
- Captions are short dark pills at the bottom; keep them clear of the control being demonstrated. Long waits use
  `r.poll` and the automatic “Sped up” badge. Long forms drop in as a still rather than being typed
  character-by-character.
- Every video shares the same brand intro and outro cards (Seed-green background, Seed logo and wordmark, drawn by
  `drawIntro`/`drawOutro` in `render/draw.mjs`); don't restyle them per platform. A tutorial only supplies the copy in
  `captions.<lang>.json`: `intro` takes `title`, `subtitle` and an optional `kicker` (default “Tutorial”), and `outro`
  takes `takeaway`, `link` and an optional `cta`. The intro crossfades into the first app frame; the outro reveals over
  the last one.
- Audio is one subtle synthesized click per actual click: no music, voiceover, whooshes, typing ticks or caption sounds.
- Final video is 3840×2160 at 60 fps, H.264 High with AAC 48 kHz; `--preview` produces a 1080p review cut.

## Adding a platform

`ops/coolify/video/` is the reference tutorial. To add another platform:

1. Run the platform for real on the VM (self-hosted install, or a real account for hosted platforms) and follow
   `ops/<platform>/TUTORIAL.md` once by hand. If the UI no longer matches the tutorial, fix `TUTORIAL.md` as well.
2. Copy the Coolify folder's structure. Rewrite `capture.mjs` for the platform: `prepare()` deletes earlier Seed stacks
   through the platform's API, so every take starts from the same empty project. Keep tokens in files under
   `~/.config/<platform>/` with mode `600` and never log them.
3. Keep beat names identical across `capture.mjs`, `spec.js` and `captions.en.json`, in capture order.
4. Show the full flow: create the stack, paste `seed-site.yaml` (or the platform's equivalent), set the https domain,
   deploy, wait until healthy, find the registration secret, add the updater where the platform needs one, then show the
   live “Coming Soon” page. Registering the site from Seed desktop belongs in a separate video.
5. Base waits on the platform's API state or real Docker health, not page text, and reload the page before a status shot
   so it never shows stale state. Map `site.example.com` to `127.0.0.1` with Chromium host-resolver rules, and also map
   `localhost` to `127.0.0.1`: Chromium otherwise tries `::1`, which Docker-published ports may not answer.
6. Verify `curl --resolve site.example.com:443:127.0.0.1 -k https://site.example.com/hm/api/config` returns JSON, build
   the preview, and review a contact sheet (`--contact`) and stills for stale states, stray toasts, secrets on screen
   and zooms that miss their target before opening a PR.
