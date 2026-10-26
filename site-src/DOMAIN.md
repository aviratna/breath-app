# Moving Breath to its own domain

The site lives at **https://givebreath.app** (since October 2026; it was at
`https://aviratna.github.io/breath-app/` before, which now redirects). To move it again, say to
`https://breath.app`:

## 1. Buy the domain and point it at GitHub Pages

At your domain registrar's DNS settings:

- **Root domain** (`breath.app`): four `A` records to `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153` and `185.199.111.153`. Optionally, four `AAAA` records to
  `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` and `2606:50c0:8003::153`.
- **Or a subdomain** (`www.breath.app`): one `CNAME` record to `aviratna.github.io`.

Then go to GitHub → repo **Settings → Pages → Custom domain**, enter the domain, save, wait for
the DNS check, and tick **Enforce HTTPS**.

## 2. Change these three lines, then rebuild

| File | Change |
|---|---|
| `site-src/build.mjs` | `SITE = 'https://breath.app'` (links, canonical URLs, sitemap and 404 page follow) |
| `breath-app/src/lib/api.js` | `SITE_URL = 'https://breath.app'` (invite links and the Settings links in the app) |
| `site/CNAME` | a new file containing just `breath.app` |

Run `node site-src/build.mjs` and commit. The web app at `/app/` uses relative paths and needs
no change.

## 3. Keep old links working

Invite links already sent point at `aviratna.github.io/breath-app/join/?c=…`. GitHub
redirects a project site to its custom domain automatically, so they keep working.

The Android app writes invite links from `SITE_URL`, so new links use the new domain once the
next APK is installed. Older APKs keep sharing the old address, which still redirects.
