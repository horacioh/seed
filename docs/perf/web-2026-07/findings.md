# Seed Web Performance Profiling — hyper.media

Measured against production (`https://hyper.media`) with Playwright/CDP. **Mobile** = Pixel 7 emulation, 4x CPU
throttling, Fast-4G network (100ms RTT, 9Mbps). Scenarios: document load, doc-to-doc navigation, commenting. Long doc
used: `/documentation-test`.

## Results summary

| Metric                   | Desktop                      | Mobile (throttled)                        | Verdict                     |
| ------------------------ | ---------------------------- | ----------------------------------------- | --------------------------- |
| TTFB (SSR)               | 0.7–1.7s (varies to 5.6s)    | ~4.0s                                     | **Bad — biggest problem**   |
| FCP / LCP                | 0.9s / 0.9s                  | 4.3s / 7.6s                               | Bad on mobile               |
| CLS                      | 0.27                         | 0.09                                      | Poor (desktop >0.25)        |
| JS transferred           | 1.4 MB compressed (19 files) | same                                      | Heavy                       |
| Long tasks during load   | 4 tasks, 430ms               | 5 tasks, 1.7s (max 683ms)                 | Hydration jank on mobile    |
| Client-side doc→doc nav  | 0.5s commit                  | ~1.0s commit / 1.5s settled               | OK                          |
| Scroll (long doc)        | p50 16.7ms, 0 dropped        | p50 16.7ms, 7 dropped frames, worst 217ms | Mostly fine                 |
| Comment editor open      | 95ms                         | **1.5s**                                  | Slow on mobile (lazy chunk) |
| Typing latency (comment) | p50 4ms                      | p50 10ms, p95 13ms                        | **Fine — not the problem**  |

## Key findings (in priority order)

### 1. SSR response time dominates document load — and it's highly variable

Repeated `curl` of the same document returned TTFB of **0.77s, 1.4s, 1.5s, 3.4s, 5.6s**. The HTML is
`cache-control: private, no-cache`, so every request pays full server render + daemon round-trips. Until this is fixed,
nothing client-side will make document load feel fast.

- Investigate the `$.tsx` loader (`loadSiteResource`, `loadSiteHeaderData`) — the variance suggests uncached daemon/gRPC
  calls, possibly serial. The repo already has `instrumentation.server.ts` — turn on its summary in production to see
  per-request breakdown.
- Add caching: at minimum `stale-while-revalidate` CDN caching keyed on document version (content-addressed versions
  make this safe), or an in-process LRU keyed on `id@version`.

### 2. 1.4MB compressed JS on every page + hydration long tasks

Document pages ship 19 JS files (~1.4MB compressed, ~5MB+ raw) including `document-editor`, ProseMirror, editor chunks —
on read-only pages. On mobile CPU this produces 1.7s of main-thread long tasks (worst 683ms), which is what makes load
feel janky and delays tap responsiveness.

- Audit with `npx vite-bundle-visualizer` — likely wins: don't ship the editor bundle to readers (it appears in the
  initial chunk graph: `document-editor-*.js` loads on tap of a link), split hover-card/preview machinery, drop
  `@emotion/react`+Radix duplication where shadcn equivalents exist.

### 3. Layout shift on load (CLS 0.27 desktop)

Content jumps as cover/images/header hydrate. Reserve dimensions for cover images, icons, and the site header; this is
cheap to fix and very visible.

### 4. Mobile tap on document links: fires ~14 API calls and doesn't navigate

On a Pixel-7 viewport, the **first tap** on an in-document link (`SeedLink`/hover-card pattern) triggered 14 API
requests — `Resource` + `Account`s + `ListCapabilities` (the same `ListCapabilities?targetId=...` was requested **4
times**) — and the URL never changed; a second tap is needed, and overlapping elements (list-item overlay, subscribe
banner) intercepted it in testing. This is likely the single worst _feel_ issue on mobile: links feel broken/laggy.

- Disable hover-card preview on touch devices (first tap should navigate).
- Deduplicate `ListCapabilities` (same query fired 4x — missing shared query key or four separate components each
  fetching).
- Check pointer-events on list-item overlays; they intercept taps meant for links.

### 5. Comment editor opens in ~1.5s on mobile

"Start a Discussion" lazily loads the editor chunk on demand. Prefetch the editor chunk after page idle (or on button
visibility) so the composer opens instantly.

### 6. What is NOT the problem

- **Typing latency is already good** (p50 4ms desktop / 10ms mobile, no long tasks while typing 120 chars). The "typing
  feels bad" perception is more likely the 1.5s composer open + load-time jank than per-keystroke cost.
- **Client-side navigation is fine** (~0.5s desktop / ~1s mobile) once the SPA is hydrated. The catch: any full page
  load (external entry, refresh, shared link) pays finding #1+#2.
- **Scrolling is near-60fps** in this test; only occasional 200ms hitches on mobile (likely lazy-mounting blocks).
  Virtualization is a nice-to-have, not the fire.

## Recommended order of work

1. Instrument + cache SSR document rendering (finding 1) — biggest, affects every load.
2. Bundle diet: stop shipping editor/heavy chunks to readers (finding 2).
3. Touch-device link behavior + request dedup (finding 4) — biggest _perceived_ mobile win.
4. Reserve layout space to fix CLS (finding 3).
5. Prefetch comment composer chunk (finding 5).

None of these depend on the UI layout-system project (PR #13); they can run in parallel. The layout project's "one
scroll container per page" will help the residual scroll hitches.

## Repro

Profiling script: Playwright + CDP throttling; measures nav timing, paint/LCP/CLS/long-task observers, rAF frame deltas
while scrolling, and per-keystroke latency in the comment composer. Script and raw results live alongside this file. Run
with `npm i playwright && npx playwright install chromium`, then `node profile.mjs` (desktop) /
`node profile.mjs --mobile`.
