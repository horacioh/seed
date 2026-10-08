# Install a Seed site on Umbrel

Seed Site runs a Seed daemon and web app on an Umbrel home server, installed from a community app store. The site is
LAN-only until you expose it with Cloudflare Tunnel or a similar reverse proxy.

## Before you start

- An amd64 Umbrel server. The Seed images are amd64-only.
- The URL of a Seed community app store, published as described in the
  [home-server store publishing guide](../home-server-stores.md), for example `https://github.com/<owner>/seed-apps`.
- Optionally, host port `56000` forwarded for both TCP and UDP to improve direct P2P connectivity.
- The Seed desktop app, which you will use to register the site.

## Step 1: Add the Seed app store

1. On the Umbrel home screen, open the **App Store** from the dock.
2. Click the **⋯** button next to the search field and choose **Community App Stores**.
3. Paste the store URL into the field and click **Add**. Umbrel clones the repository and lists **Seed Hypermedia app
   store** under the added community app stores.
4. Click **Open** on that store.

Once a community store has been added, **⋯ → Community App Stores** becomes a submenu: choose **Manage** to add or
remove stores, or the store's name to open it.

## Step 2: Install Seed Site

1. In the Seed Hypermedia app store, open **Seed Site** and click **Install**.
2. Wait for the install to finish. Umbrel pulls the images, runs the one-time init container, and starts the daemon and
   web app; the button then changes to **Open**.

## Step 3: Open the site

1. Click **Open**. Umbrel shows a **Default password** for the app. This password is the site's registration secret:
   copy it with the copy button and keep it private.
2. Click **Open Seed Site**. The site opens on the LAN at `http://<umbrel-host>:3567`, for example
   `http://umbrel.local:3567`, and shows the “Seed Hypermedia Space Coming Soon” page until it is registered.

## Register the site from Seed desktop

Set `SEED_BASE_URL` in the app's settings to the final public HTTPS URL of your tunnel or reverse proxy before
registering. Then use this registration link in the Seed desktop app:

```text
<SEED_BASE_URL>/hm/register?secret=<the password Umbrel shows>
```

## Check that it works

Run:

```sh
curl -fsS "http://umbrel.local:3567/hm/api/config"
```

The response should be JSON. See the [README](README.md) for P2P ports, backups and updates.
