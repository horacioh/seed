---
name: Seed Layout Playground
summary: A visual layout editor for composing real Seed UI components into device-sized artboards with live read-only Hypermedia data.
---

The Seed Layout Playground is a browser app for exploring Seed layouts without editing code. Compose real components into a window, arrange desktop and mobile artboards, and inspect live read-only documents from a public Seed site. Share links preserve the board as compressed URL state.

# Where the code is

The app lives in `frontend/apps/playground` as `@shm/playground`. `src/App.tsx` owns the board, editor and preview modes; `src/registry/` maps Puck components to real `@shm/ui` components; `src/frame.tsx` renders responsive previews in an iframe. `src/universal-client.ts` connects the app to the Seed API.

# How data loads

Data components expose a resource URL field. The default is the seedteamtalks Lobby document on `https://hyper.media`. `@shm/shared` React Query models load document and page data through the configured read-only universal client. The client rejects publish actions; comments and actions are not submitted. The gateway host can be changed from Settings.

Boards autosave to browser local storage. Share encodes the board JSON into the `#b=` URL fragment with `lz-string`; a valid share fragment takes precedence over local storage.

# Running it

```sh
pnpm --filter @shm/playground dev
pnpm --filter @shm/playground typecheck
pnpm --filter @shm/playground test
pnpm --filter @shm/playground build
```

Vite serves the app on port `5190`. It reads from the public gateway by default and does not need the local web app.

# Adding a registry component

Add a component to the category file in `src/registry/` and register it in `src/registry/index.tsx`. Data-backed components should provide a `resource` field and resolve it with `boundResource` from `content.tsx`. Use read-only `@shm/ui` components and avoid editor-machine or draft dependencies. The registry applies the shared theme-token Style field automatically. Add the component to a Puck category and to a template only when it belongs in a starter layout.
