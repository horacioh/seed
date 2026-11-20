# t3-mcp

A small [MCP](https://modelcontextprotocol.io) server that runs **inside the T3 Code container** and shells out to the
T3 CLI. It lets the Seed agents server (`apps/`) start T3 Code threads, read them, and receive a webhook when a run
finishes — so an agent can write the results into Seed documents.

Plain Node ESM, **zero runtime dependencies**. The single entry file `server.mjs` is fetched from
`raw.githubusercontent.com` and run with `node server.mjs` on Node 24.

## What it does

- Exposes six MCP tools over Streamable HTTP (`POST /mcp`, JSON-RPC 2.0): `list_threads`, `start_thread`,
  `send_message`, `get_thread`, `watch_thread`, `unwatch_thread`.
- Polls watched threads and POSTs a webhook (`thread.finished` / `thread.needs_input`) when a run completes or needs
  input.
- Persists watches to disk so a restart resumes them.
- Enforces a Bearer token, a project allowlist, and a webhook-prefix allowlist.

## Configuration

All settings come from environment variables (parsed once at startup):

| Variable                  | Default         | Description                                                                |
| ------------------------- | --------------- | -------------------------------------------------------------------------- |
| `T3_MCP_TOKEN`            | _required_      | Bearer token clients must present for `/mcp`.                              |
| `T3_MCP_HOST`             | `0.0.0.0`       | Bind hostname.                                                             |
| `T3_MCP_PORT`             | `3774`          | Bind port.                                                                 |
| `T3_MCP_T3_BIN`           | `t3`            | T3 CLI binary, or a JSON argv array (e.g. `["node","/path/fake-t3.mjs"]`). |
| `T3_MCP_PROJECTS`         | _required_      | Comma-separated T3 project ids the agent may use. First is the default.    |
| `T3_MCP_WEBHOOK_PREFIXES` | _(empty)_       | Comma-separated URL prefixes a notify webhook URL must start with.         |
| `T3_MCP_STATE_DIR`        | `$HOME/.t3-mcp` | Directory for `watches.json` (persists across restarts).                   |
| `T3_MCP_POLL_SECS`        | `15`            | Watcher poll interval.                                                     |

The server refuses to start without `T3_MCP_TOKEN` or `T3_MCP_PROJECTS`.

## Tools

1. `list_threads {project?, limit?}` → `{project, threads:[summary fields]}`.
2. `start_thread {message, title?, project?, worktree?, branch?, provider?, model?, notifyWebhookUrl?}` →
   `{threadId, title, link, status, watching}`. `provider`/`model` must be given together.
3. `send_message {threadId, message, notifyWebhookUrl?}` → `{threadId, status, watching}`.
4. `get_thread {threadId, messages?}` → `{thread, messages}`.
5. `watch_thread {threadId, notifyWebhookUrl}` → arms a notification for the thread's next finished run.
6. `unwatch_thread {threadId}` → `{threadId, removed}`.

Every tool taking a `threadId` first runs `thread show` and refuses unless `thread.projectId` is in the allowlist.
`project` inputs must be in the allowlist. `notifyWebhookUrl` must match an allowed prefix.

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
  "lastAssistantMessage": "…",
  "messages": [{"role": "assistant", "runId": "…", "text": "…"}]
}
```

`event` is `thread.finished` (a run that began after arming has finished) or `thread.needs_input` (the thread has a
pending request). A 2xx response removes the watch; a 4xx drops it; a 5xx/network error keeps it for a later retry.

## Security model

- **Bearer token**: every request to `/mcp` requires `Authorization: Bearer <T3_MCP_TOKEN>` (constant-time compare).
  `GET /health` is open.
- **Project allowlist**: only threads in `T3_MCP_PROJECTS` may be listed, read, started, sent, or watched.
- **Webhook prefix allowlist**: `notifyWebhookUrl` must start with one of `T3_MCP_WEBHOOK_PREFIXES` (https or http,
  normalized via `new URL()`). Empty disables notifications.
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

Both stacks (seed-agents and t3-code) get Coolify's **Connect To Predefined Network** so the agents server reaches the
MCP server at `http://t3code-<t3 stack uuid>:3774/mcp`.

In Seed: add an MCP server named `t3` (URL above, header `Authorization: Bearer <T3_MCP_TOKEN>`), enable it on the
agent, and create a webhook trigger whose delivery URL the agent passes as `notifyWebhookUrl`.

## Development

```sh
cd t3-mcp
mise x bun@1.3.10 -- bun install   # devDependency: @modelcontextprotocol/sdk for tests
mise x bun@1.3.10 -- bun test       # 24 tests
node --check server.mjs            # syntax check
```
