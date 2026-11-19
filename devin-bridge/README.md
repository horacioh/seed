# devin-bridge

An OpenAI-compatible HTTP server that drives `devin acp` (the Devin CLI's Agent Client Protocol stdio server). It lets
an application that speaks the OpenAI Chat Completions API — such as the Seed agents server's `custom`
(OpenAI-compatible) provider — use a signed-in Devin account as its model.

## How it works

- Each `POST /v1/chat/completions` request opens a fresh ACP session, renders the whole transcript into one prompt,
  drives it to completion, and parses the assistant's text back into an OpenAI response (plain text or tool calls).
- `GET /v1/models` probes a throwaway ACP session for the account's available models and caches the list for 10 minutes.
  `default` always maps to the account's current model.
- `GET /health` is unauthenticated and does not spawn the ACP child; use it for liveness checks.

The Devin CLI's own tools (shell, files, search, web) are denied via the bundled `devin-config.json`, so Devin acts as a
pure language model. Tool calling is emulated in the prompt: the request's function definitions are listed in a
`<functions>` block, and the assistant is told to reply with `<tool_call>` blocks, which the bridge parses back into
OpenAI `tool_calls`. Text after the last valid tool call is dropped.

## Configuration

All settings come from environment variables (parsed once at startup):

| Variable                      | Default              | Description                                            |
| ----------------------------- | -------------------- | ------------------------------------------------------ |
| `DEVIN_BRIDGE_API_KEY`        | _required_           | Bearer token clients must present for `/v1` endpoints. |
| `DEVIN_BRIDGE_HOSTNAME`       | `0.0.0.0`            | Bind hostname.                                         |
| `DEVIN_BRIDGE_PORT`           | `8787`               | Bind port.                                             |
| `DEVIN_BRIDGE_ACP_COMMAND`    | `["devin","acp"]`    | JSON array argv for the ACP child.                     |
| `DEVIN_BRIDGE_MAX_CONCURRENT` | `2`                  | Maximum concurrent ACP prompts.                        |
| `DEVIN_BRIDGE_TIMEOUT_SECS`   | `600`                | Per-prompt timeout.                                    |
| `DEVIN_BRIDGE_MODE`           | `ask`                | ACP mode id for new sessions.                          |
| `DEVIN_BRIDGE_WORK_DIR`       | `<tmp>/devin-bridge` | Root for per-request working directories.              |

The server refuses to start without `DEVIN_BRIDGE_API_KEY`.

## Running locally

```sh
bun install
DEVIN_BRIDGE_API_KEY=secret bun src/main.ts
```

Then from a client:

```sh
curl http://localhost:8787/v1/chat/completions \
  -H "Authorization: Bearer secret" \
  -H "Content-Type: application/json" \
  -d '{"model":"default","messages":[{"role":"user","content":"Hello"}]}'
```

The Devin CLI must be signed in (`devin auth login`) on the host running the bridge. Each model call is a fresh Devin
session billed to that account.

## Tests

```sh
bun test
bunx tsc --noEmit
```

Tests use `test/fake-acp-agent.ts`, a scripted ACP agent, so they do not need a real Devin session.

## Docker

The `Dockerfile` builds an image that installs the Devin CLI, relocates the binary to `/usr/local/bin/devin`, and runs
the bridge. A volume on `/home/devin/.local/share/devin` persists the Devin login across container recreation without
shadowing the binary.

```sh
docker build -t seed-devin-bridge:dev .
docker run --rm -e DEVIN_BRIDGE_API_KEY=secret -p 8787:8787 seed-devin-bridge:dev
```

Sign in once inside the container:

```sh
docker exec -it <container> devin auth login --force-manual-token-flow
```
