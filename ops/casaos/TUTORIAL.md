# Install a Seed site on CasaOS

This walkthrough installs Seed Hypermedia on CasaOS from a third-party app source. It was recorded on CasaOS v0.4.15;
the video is generated from `ops/casaos/video/`.

## Before you start

- A CasaOS server (official install script) with Docker, and an admin login.
- A Seed app source ZIP. CasaOS reads apps from `<top-level folder>/Apps/<App>/` inside the archive, so the ZIP must
  contain `Apps/Seed/docker-compose.yml` and `Apps/Seed/icon.png` (see `ops/home-server-stores.md`). Use the published
  store repo's ZIP URL, or serve one yourself while testing.
- Port 3567 (Seed Web) and 56000 TCP/UDP (Seed peer-to-peer) free on the server.

Use the app source rather than **Custom Install**: Custom Install imports only the first container of a Compose file.

## 1. Add the Seed app source

1. On the dashboard, open **App Store**.
2. Open the app source menu: the button next to the search field that shows the app count (for example **639 apps**).
3. Choose **More apps**. A source URL field and an **Add** button appear in its place.
4. Paste the ZIP URL and click **Add**. The source shows up in the same menu once CasaOS has downloaded it.

## 2. Install Seed Hypermedia

1. Type `Seed` in **Search an app...**.
2. Open **Seed Hypermedia** and click **Install**.
3. CasaOS pulls the images and starts three containers: `seed-init` (fixes data folder ownership, then exits),
   `seed-daemon` and `seed-web`. When it's done, a **Seed Hypermedia** tile appears on the dashboard.

## 3. Find the registration link

Seed Web prints the registration link once, on its first start:

1. Hover the **Seed Hypermedia** tile, open its **⋯** menu and choose **Settings**.
2. Switch to the **seed-web** tab and click the **Terminal and Logs** button in the dialog header.
3. Open the **Logs** tab and look for `Seed registration link: http://casaos.local:3567/hm/register?secret=…`.

Treat the secret as a password. It stays in `/DATA/AppData/seed/web/config.json`; it is not printed again after the
containers are recreated.

## 4. Set your site's URL

Still in **Settings** → **seed-web**, change both environment variables to the same URL, the one people will use to
reach the site:

- `SEED_BASE_URL`
- `SEED_ASSET_HOST`

They default to `http://casaos.local:3567`. If you publish the site through a tunnel or reverse proxy, use its public
`https://` URL. Do this before registering the site.

Then switch to the **seed-init** tab and set **Restart Policy** to **on-failure**. CasaOS saves seed-init's
`restart: "no"` as `unless-stopped`, which restarts it forever and keeps Seed Web from starting. With on-failure it runs
once and exits.

Click **Save**. CasaOS recreates the containers; wait for the tile to come back.

## 5. Check the site

Open `http://<your-server>:3567/`. Until the site is registered it shows the Seed Hypermedia “Coming Soon” page (served
with HTTP 404), and `http://<your-server>:3567/hm/api/config` returns JSON.

Registering the site from Seed desktop, and exposing it to the internet, are covered separately.
