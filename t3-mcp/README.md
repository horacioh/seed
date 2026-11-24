# t3-mcp

A small [MCP](https://modelcontextprotocol.io) server that runs **inside the T3 Code container** and shells out to the
T3 CLI. It lets the Seed agents server (`apps/`) start T3 Code threads, read them, and receive a webhook when a run
finishes — so an agent can write the results into Seed documents.

Plain Node ESM, **zero runtime dependencies**. The single entry file `server.mjs` is fetched from
`raw.githubusercontent.com` and run with `node server.mjs` on Node 24.

## What it does

- Exposes six MCP tools over Streamable HTTP (`POST /mcp`, JSON-RPC 2.0): `list_threads`, `start_thread`,
  `send_message`, `get_thread`, `watch_thread`, `unwatch_thread`.
- `start_thread` creates an artifact directory for before/after evidence (screenshots, videos). The agent saves files
  there; the Seed agents server downloads them by plain URL via `GET /artifacts/<id>/<name>` (no auth header needed —
  Seed's `write ~/memory/x {fromUrl}` can't send headers).
- Polls watched threads and POSTs a webhook (`thread.finished` / `thread.needs_input`) when a run completes or needs
  input. The webhook payload includes the artifacts list.
- Subscribes to PR merges: with `notifyEvents: ["pull_request.merged"]` the server polls each subscribed project's
  threads and POSTs one event per associated PR that is merged, including PRs merged before subscribing. The
  subscription survives run completion and restarts.
- Persists watches, PR subscriptions, and artifact mappings to disk so a restart resumes them.
- Enforces a Bearer token, a project allowlist, and a webhook-prefix allowlist.

## Configuration

All settings come from environment variables (parsed once at startup):

| Variable                    | Default                       | Description                                                                                                                    |
| --------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `T3_MCP_TOKEN`              | _required_                    | Bearer token clients must present for `/mcp`.                                                                                  |
| `T3_MCP_HOST`               | `0.0.0.0`                     | Bind hostname.                                                                                                                 |
| `T3_MCP_PORT`               | `3774`                        | Bind port.                                                                                                                     |
| `T3_MCP_T3_BIN`             | `t3`                          | T3 CLI binary, or a JSON argv array (e.g. `["node","/path/fake-t3.mjs"]`).                                                     |
| `T3_MCP_PROJECTS`           | _required_                    | Comma-separated T3 project ids the agent may use. First is the default.                                                        |
| `T3_MCP_WEBHOOK_PREFIXES`   | _(empty)_                     | Comma-separated URL prefixes a notify webhook URL must start with.                                                             |
| `T3_MCP_STATE_DIR`          | `$HOME/.t3-mcp`               | Directory for `watches.json`, `pr-watches.json`, and `artifacts.json` (persist across restarts).                               |
| `T3_MCP_ARTIFACTS_DIR`      | `<state dir>/artifacts`       | Root directory for per-thread evidence files.                                                                                  |
| `T3_MCP_ARTIFACTS_BASE_URL` | _(derived from request Host)_ | Override the base URL for artifact download links. If unset, uses `http://<Host header of the /mcp request>`.                  |
| `T3_MCP_POLL_SECS`          | `15`                          | Run-watch poll interval.                                                                                                       |
| `T3_MCP_PR_POLL_SECS`       | `60`                          | PR-merge poll interval. One `thread list` per subscribed project per cycle.                                                    |
| `T3_MCP_DEFAULT_PROVIDER`   | _(none)_                      | Provider instance id for `start_thread` when it names none (set with the model). Needed when the project has no default model. |
| `T3_MCP_DEFAULT_MODEL`      | _(none)_                      | Model slug for `start_thread` when it names none.                                                                              |

The server refuses to start without `T3_MCP_TOKEN` or `T3_MCP_PROJECTS`.

## Tools

1. `list_threads {project?, limit?}` → `{project, threads:[summary fields]}`.
2. `start_thread {message, title?, project?, worktree?, branch?, provider?, model?, notifyWebhookUrl?, notifyEvents?}` →
   `{threadId, title, link, status, watching, notifyEvents, artifactsDir, artifactsUrl}`. `provider`/`model` must be
   given together. Creates an artifact directory and appends an evidence-block instructions to the message;
   `artifactsUrl` is the base URL the agents server can download evidence files from (no auth header needed).
   `notifyEvents` (default `["thread.finished"]`) selects which events to subscribe to.
3. `send_message {threadId, message, notifyWebhookUrl?, notifyEvents?}` → `{threadId, status, watching, notifyEvents}`.
4. `get_thread {threadId, messages?}` → `{thread, messages, artifacts}`. `artifacts` is an array of
   `{name, url, bytes, contentType}` for the thread's saved evidence files (empty if none).
5. `watch_thread {threadId, notifyWebhookUrl, notifyEvents?}` → `{threadId, watching, notifyEvents}`. Arms the selected
   events. With only `["pull_request.merged"]` it does NOT arm the run watch, so an idle thread gets no immediate
   `thread.finished`.
6. `unwatch_thread {threadId}` → `{threadId, removed}`. Removes the run watch AND every merge subscription for the
   thread. `removed` is true if anything was removed.

Every tool taking a `threadId` first runs `thread show` and refuses unless `thread.projectId` is in the allowlist.
`project` inputs must be in the allowlist. `notifyWebhookUrl` must match an allowed prefix.

`notifyEvents` is an array of `["thread.finished", "pull_request.merged"]` (minItems 1, uniqueItems). The default when
omitted is `["thread.finished"]`, which keeps the historical behavior. `thread.finished` arms the one-shot run watch
(which also sends `thread.needs_input`). `pull_request.merged` arms a merge subscription.

## Webhook payload

When a watched thread finishes a run (or needs input), the server POSTs JSON to the webhook URL with header
`Idempotency-Key: t3-<threadId>-<runId>-<event>` and `Content-Type: application/json`:

```json
{
  "event": "thread.finished",
  "threadId": "…",
  "title": "…",
  "link": "https://app.t3.codes/threads/…",
  "status": "completed",
  "runId": "run:thread:…:ordinal:N",
  "branch": "devin/…",
  "worktreePath": null,
  "pullRequests": [],
  "project": "…",
  "artifacts": [
    {"name": "after-1.png", "url": "http://…/artifacts/…/after-1.png", "bytes": 12345, "contentType": "image/png"}
  ],
  "lastAssistantMessage": "…",
  "messages": [{"role": "assistant", "runId": "…", "text": "…"}]
}
```

`event` is `thread.finished` (a run that began after arming has finished) or `thread.needs_input` (the thread has a
pending request). A 2xx response removes the watch. 408, 425, 429, 5xx, or a network error keeps it for a retry on a
later poll (the body is rebuilt from the thread's current state); any other 4xx drops it.

## `pull_request.merged` payload

When a subscribed thread has an associated PR that is merged, the server POSTs JSON to the webhook URL with header
`Idempotency-Key: <eventId>` and `Content-Type: application/json`:

```json
{
  "event": "pull_request.merged",
  "eventId": "t3-pr-merged-12-9f1c…",
  "threadId": "…",
  "title": "…",
  "link": "https://app.t3.codes/threads/…",
  "project": "…",
  "pullRequest": {
    "url": "https://github.com/owner/repo/pull/12",
    "repository": "owner/repo",
    "number": 12,
    "host": "github.com",
    "source": "created",
    "state": "merged"
  },
  "pullRequests": [{"url": "…", "repository": "…", "number": 12, "host": "…", "source": "…", "state": "merged"}]
}
```

The `eventId` is `t3-pr-merged-<number>-<sha256([threadId, host, repository, number]).hex.slice(0,32)>` (host and
repository lowercased because GitHub names are case-insensitive). Treat it as opaque. The same thread and PR always
yield the same id across retries, restarts, and re-subscriptions. It is the `Idempotency-Key` header, so the receiver
dedupes a redelivery as a duplicate.

**Detection rule.** Only `pullRequests[].state === 'merged'` counts. `settled`/`settledAt` is ignored: T3 settles a
thread at turn end and users settle threads by hand, which routinely happens before the PR merges, and settled threads
can still have open PRs. Closed-unmerged PRs and PRs with `source: 'stack-dismissed'` are not notified. PRs already
merged when you subscribe are notified.

**Associated PRs** are `pullRequests` items with `source !== 'stack-dismissed'`, a string `url`, and an integer
`number`. The `pullRequest` field is the merged PR; `pullRequests` is the same shape for every associated PR (so a
receiver can check other layers in a stack).

**Lifecycle.** A merge subscription survives run completion and restarts. It ends on `unwatch_thread`, a non-retryable
4xx, thread deletion, or once all associated PRs are merged or closed (with ≥1 merged and nothing pending). A sub with
only closed PRs, or no PRs, stays armed so a replacement PR is still caught.

**Delivery.** 2xx and 409 count as done (409 means the receiver already holds the key). 408/425/429/5xx/network errors
are retried every cycle with the identical body. Other 4xx drop the subscription.

## Security model

- **Bearer token**: every request to `/mcp` requires `Authorization: Bearer <T3_MCP_TOKEN>` (constant-time compare).
  `GET /health` is open.
- **Project allowlist**: only threads in `T3_MCP_PROJECTS` may be listed, read, started, sent, or watched.
- **Webhook prefix allowlist**: `notifyWebhookUrl` must start with one of `T3_MCP_WEBHOOK_PREFIXES` (https or http,
  normalized via `new URL()`). Empty disables notifications.
- **Artifact capability URLs**: `GET/HEAD /artifacts/<id>/<name>` requires no Bearer token — the 22-character base64url
  id is an unguessable capability URL. The port (3774) is only reachable on the internal Docker network, so only the
  agents server can download evidence files. Files are meant to be published (the agent is told not to put secrets in
  them). Allowed extensions: png, jpg, jpeg, gif, webp, webm, mp4; max 50 MB each, max 20 files per thread.
- **Threads run with the project's runtime mode** — full access for the seed project (the user chose that). The MCP
  server does not change it.
- The server never logs message contents, tokens, or the secret path segment of webhook URLs.

## Deployment recipe (T3 Code Coolify stack)

The T3 Code Coolify stack command becomes:

```sh
sh -c 'curl -fsSL https://t3.codes/install.sh | sh; mkdir -p "$HOME/t3-mcp" && curl -fsSL -o "$HOME/t3-mcp/server.mjs.new" https://raw.githubusercontent.com/horacioh/seed/custom-images/t3-mcp/server.mjs && mv "$HOME/t3-mcp/server.mjs.new" "$HOME/t3-mcp/server.mjs"; (while true; do node "$HOME/t3-mcp/server.mjs"; sleep 5; done) & exec t3 serve --host 0.0.0.0 --port 3773 --no-browser'
```

The existing file keeps working if the download fails. Add these environment variables to the T3 Code service:

- `T3_MCP_TOKEN=${SERVICE_PASSWORD_64_T3MCP}`
- `T3_MCP_PROJECTS=6d182a90-66f1-4da3-bb82-b7228b95dab2`
- `T3_MCP_WEBHOOK_PREFIXES=https://seed-agents.hhg.app/hm/api/apps/webhooks/,https://seed-agents.hhg.app/hm/api/agents/webhooks/`
- `T3_MCP_DEFAULT_PROVIDER=acpRegistry_devin` and `T3_MCP_DEFAULT_MODEL=fusion-claude-opus-5-5-medium-sidekick-glm-5-2`
  (the seed project has no default model)

Both stacks (seed-agents and t3-code) get Coolify's **Connect To Predefined Network** so the agents server reaches the
MCP server at `http://t3code-<t3 stack uuid>:3774/mcp`.

In Seed: add an MCP server named `t3` (URL above, header `Authorization: Bearer <T3_MCP_TOKEN>`), enable it on the
agent, and create a webhook trigger whose delivery URL the agent passes as `notifyWebhookUrl`.

## Seed issues: In Review → Done

Subscribe at `start_thread` with both events (`["thread.finished","pull_request.merged"]`). On `pull_request.merged`,
move the Seed issue tied to `threadId` to **Done** and dedupe on `eventId`. If the issue spans a stack, check the
payload's `pullRequests` array for layers still open before marking the issue Done.

For threads already In Review (started without a merge subscription), call
`watch_thread {threadId, notifyWebhookUrl, notifyEvents: ["pull_request.merged"]}`; a PR that already merged is notified
on the next cycle.

## Development

```sh
cd t3-mcp
mise x bun@1.3.10 -- bun install   # devDependency: @modelcontextprotocol/sdk for tests
mise x bun@1.3.10 -- bun test       # 62 tests
node --check server.mjs            # syntax check
```
