# Seed site on Coolify

New to Coolify? Follow the step-by-step [site tutorial](TUTORIAL.md). To self-host the Seed agents server with a
Devin-backed model, follow the [agents tutorial](AGENTS-TUTORIAL.md).

`seed-site.yaml` is a Coolify v4 docker-compose service template for one Seed site: `seed-daemon`, `seed-web`, an
internal Caddy (`seed-proxy`) that keeps the `/ipfs/*` → daemon routing of the standard deployment. Coolify's own proxy
terminates TLS for the domain. `seed-updater.yaml` is a separate stack, deployed once per server, that keeps every Seed
site on that server up to date.

## Deploy

1. In Coolify: **Project → New Resource → Docker Compose**, paste `seed-site.yaml`.
2. On the `seed-proxy` service set the domain, e.g. `https://site.example.com` (one domain, no path).
3. Optional environment variables (defaults in brackets):
   - `SEED_WEB_IMAGE` / `SEED_SITE_IMAGE` [`seedhypermedia/web:latest` / `seedhypermedia/site:latest`]. Use
     `ghcr.io/horacioh/seed-web:main` / `ghcr.io/horacioh/seed-site:main` for this fork's images.
   - `SEED_P2P_PORT` [`56000`]: host TCP+UDP port for P2P. Must be unique per server and open in the firewall.
   - `SEED_IS_GATEWAY` [`false`], `SEED_ENABLE_STATISTICS` [`false`], `SEED_LOG_LEVEL` [`info`], `SEED_P2P_TESTNET_NAME`
     [empty = mainnet; `dev` = testnet, also set `SEED_LIGHTNING_URL` to `https://ln.testnet.seed.hyper.media`],
     `SEED_NO_PULL` [`false`].
   - `SEED_APPS_ENVIRONMENT_URL` [`https://hyper.media/hm/api/apps`]: the app environment (agents server) the site
     advertises in `/hm/api/config`. For your own, use `https://<agents domain>/hm/api/apps` (see the
     [agents tutorial](AGENTS-TUTORIAL.md)).
4. Deploy. `seed-proxy` turns healthy once the site answers on `/hm/api/config` (checked inside the container).
5. Link the site from the Seed desktop app with `https://<domain>/hm/register?secret=<SERVICE_PASSWORD_SEEDLINK>` (copy
   the generated value from the stack's **Environment Variables**). The secret is written to the web data volume only on
   first start; it is consumed when the site is registered.
6. Once per server, deploy `seed-updater.yaml` the same way (no domain needed) to enable auto-update.

`SERVICE_URL_SEED_80` on `seed-proxy` tells Coolify to route the domain to its port 80. The site itself reads the
port-less `SERVICE_URL_SEED` / `SERVICE_FQDN_SEED` (the `_80` variants carry a literal `:80`, which breaks the base URL
and the P2P announce address).

## Auto-update

### From the fork's CI (follows `custom-images` immediately)

After every push to `custom-images`, `custom-ghcr-images.yml` (web and site images) and `custom-apps-images.yml` (agents
images) restart the listed Coolify stacks with freshly pulled images, through `.github/scripts/coolify-redeploy.sh`. A
plain Coolify deploy of a running stack keeps its current image, so the script uses
`POST /api/v1/services/<uuid>/restart?latest=true`. It needs, in the GitHub repository settings:

- secret `COOLIFY_API_TOKEN`: a Coolify API token (**Keys & Tokens → API Tokens**) with the `deploy` permission (API
  access must be on in **Settings → Advanced**);
- variable `COOLIFY_URL`, e.g. `https://coolify.example.com`;
- variable `COOLIFY_SITE_SERVICES`: UUIDs of the Seed site stacks to restart (space- or comma-separated; the UUID is in
  the stack's URL in Coolify, `…/service/<uuid>`);
- variable `COOLIFY_AGENTS_SERVICES`: the same for agents stacks.

When any of them is missing, the deploy job only prints a notice. Tag builds (`<version>-custom`) are not redeployed.

### From the server (Watchtower)

`seed-updater.yaml` runs [nickfedor/watchtower](https://github.com/nicholas-fedor/watchtower) (the maintained fork;
`containrrr/watchtower` is archived and fails against Docker 29). Every `SEED_UPDATE_INTERVAL` seconds (default `600`)
it checks the registry for the image tags of all containers labelled `com.centurylinklabs.watchtower.enable=true` and
`com.centurylinklabs.watchtower.scope=seed` (`seed-web` and `seed-daemon` of every Seed site stack), recreates those
whose digest changed, and removes the old images. Other apps on the server, and other watchtower instances, are
untouched. Only the updater mounts the Docker socket; the site stacks have no Docker access. One updater serves any
number of sites; without it, sites simply don't auto-update.

Which tag you follow decides what "update" means: `latest` follows upstream stable releases, `dev` follows upstream
`main`, and the fork's `ghcr.io/horacioh/seed-*:main` follows every push to `custom-images`. Pin an exact version tag to
disable updates for a site.

## Data

Named volumes `seed-daemon-data` (keys, database, blobs) and `seed-web-data` (`config.json`). Back up both; the daemon
keys in `seed-daemon-data/keys` are the node identity.
