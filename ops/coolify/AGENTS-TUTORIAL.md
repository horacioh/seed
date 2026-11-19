# Deploy a self-hosted Seed agents server on Coolify

The agents stack runs the Seed agents server (`apps`) and a **devin-bridge** sidecar that exposes your signed-in Devin
account as an OpenAI-compatible model. Coolify's proxy handles HTTPS for the agents server; the bridge has no domain and
is reached only internally.

## Before you start

- A Coolify v4 server and a domain whose DNS points to that server (for example `agents.example.com`).
- The Seed desktop app, which you will use to connect to the agents server.
- A Devin account you can sign into from a browser, for the bridge.
- The fork's images must be public on GHCR, or you must add a GHCR registry credential in Coolify (see the last
  section).

## Step 1: Create the agents stack

1. In your Coolify project, add a new resource and choose **Docker Compose** (deploy a multi-container application from
   a Compose file, without a Git repository).

2. Paste the contents of `ops/coolify/seed-agents.yaml` into the Compose editor, then click **Create Service**.

   Coolify creates the stack with two resources: **seed-apps** and **devin-bridge**.

3. Open **Domains** in the seed-apps service and set the domain to `https://agents.example.com:3050`. The `:3050` only
   tells Coolify's proxy which container port to route to; the public URL stays `https://agents.example.com`. Use one
   domain with no path.

   The `SERVICE_URL_APPS_3050` environment variable is set automatically by Coolify from this domain and routes traffic
   to port `3050` of the container.

4. `SEED_APPS_IMAGE` and `DEVIN_BRIDGE_IMAGE` can pin an exact version tag (defaults are
   `ghcr.io/horacioh/seed-apps:main` and `ghcr.io/horacioh/seed-devin-bridge:main`).

## Step 2: Deploy the stack

1. Deploy the stack. Wait for the seed-apps service to become healthy.

2. If you already deployed the `seed-updater.yaml` stack (from the Seed site tutorial) on this server, it will also
   update these two containers: both services carry the `com.centurylinklabs.watchtower.scope=seed` label that the
   existing updater watches. No second updater is needed.

## Step 3: Sign Devin in once

The devin-bridge container ships the Devin CLI but is not signed in. Sign in once so the bridge can drive model calls:

1. In Coolify, open the **devin-bridge** service and start a **Terminal** session on the container. Alternatively, from
   your host:

   ```sh
   docker exec -it <devin-bridge-container> devin auth login --force-manual-token-flow
   ```

2. Run:

   ```sh
   devin auth login --force-manual-token-flow
   ```

   Follow the printed URL in your browser to authorize the container. The credentials are written to the
   `devin-bridge-home` volume and persist across container recreation.

3. Confirm the sign-in:

   ```sh
   devin auth status
   ```

4. Verify the model list is reachable from the Seed desktop app: after connecting the provider (Step 5), the app calls
   `/v1/models` to populate the model picker.

## Step 4: Check that it works

Run:

```sh
curl -fsS "https://<domain>/hm/api/apps/health"
```

The response should be JSON with a healthy status.

## Step 5: Connect from the Seed desktop app

1. Open the Seed desktop app's agent settings.
2. Add an app server. The app server URL is `https://<domain>/hm/api/apps` — for example
   `https://agents.example.com/hm/api/apps`.
3. Add a model provider. Choose type **Custom (OpenAI-compatible)**.
4. Set the **Base URL** to `http://devin-bridge:8787/v1` (the internal service name; the agents server reaches the
   bridge over the Docker network).
5. Set the **API key** to the value of `SERVICE_PASSWORD_64_DEVINBRIDGE` from the devin-bridge service's **Environment
   Variables** in Coolify.
6. Pick a model, for example `claude-sonnet-5-5-medium` or `default` (which uses the account's current model).

## Step 6: Auto-deploy on push (optional)

To redeploy the stack automatically when new images are pushed to `custom-images`, use Coolify's deploy API. A pasted
Docker Compose stack has no Git webhook, so the workflow calls the deploy endpoint directly.

1. Find the stack's UUID: open the stack in Coolify and copy the UUID from the browser URL (`…/service/<uuid>`), or copy
   the **Deploy Webhook URL** if your Coolify version shows one on the stack.
2. Set `COOLIFY_WEBHOOK_URL` to the deploy endpoint:
   `https://<your-coolify-host>/api/v1/deploy?uuid=<stack-uuid>&force=false`.
3. Create a Coolify API token: **Keys & Tokens → API Tokens**, with the `deploy` permission. API access must be enabled
   in Coolify **Settings → Advanced → API Access** (if not already on).
4. In your GitHub fork, add two repository secrets:
   - `COOLIFY_WEBHOOK_URL` — the deploy endpoint from step 2.
   - `COOLIFY_API_TOKEN` — the API token from step 3.

The `custom-apps-images.yml` workflow POSTs to the deploy endpoint after a successful image build on `custom-images`. It
also runs on `workflow_dispatch` for a manual redeploy. The Watchtower updater remains a fallback that pulls new image
digests on its own interval.

## GHCR package visibility

The new packages `ghcr.io/horacioh/seed-apps` and `ghcr.io/horacioh/seed-devin-bridge` are **private by default** after
the first build. To let Coolify pull them without a credential, make each package public in GitHub: **Packages** →
select the package → **Package settings** → **Change visibility** → **Public**. Alternatively, add a GHCR registry
credential in Coolify (**Servers** → your server → **Registries**) and reference it when deploying the stack.

## Limitations

- Each model call opens a fresh Devin session and is billed to the Devin account that signed in.
- Tool calling is emulated through the prompt: the bridge lists functions in a `<functions>` block and parses
  `<tool_call>` blocks back into OpenAI `tool_calls`.
- Devin's own tools (shell, files, search, web) are denied via the bundled `devin-config.json`, so Devin acts as a pure
  language model.
- The bridge image is amd64-only.
- The agents server is open to any signing Seed account. Restrict access at the network level if needed (see
  `hypermedia/operate/self-hosted-app-environment.md`, "Accounts").
