# Publishing Breath on Android

Builds run on Expo's cloud (EAS Build) and are triggered by the GitHub Actions
workflow at `.github/workflows/android.yml`. There are two outputs:

| Job    | Output | Where it ends up |
|--------|--------|------------------|
| `apk`  | `breath.apk` | Attached to a **GitHub Release**, so anyone can download and install it directly |
| `play` | signed `.aab` | Submitted to the **Google Play** internal testing track as a draft release |

Pushing a tag like `v1.0.0` runs both jobs. You can also run them by hand from
**Actions → Android release → Run workflow** and pick `apk`, `play` or `both`.

---

## One-time setup

### 1. Expo account + token (required for both jobs)

1. Sign in at https://expo.dev. The project is already linked
   (`extra.eas.projectId` in `app.json`).
2. Create the Android signing keystore once from your own machine. CI can't do
   this, because `--non-interactive` builds won't generate a keystore:
   ```
   cd breath-app
   npm install
   npx eas-cli@latest login
   npx eas-cli@latest credentials -p android   # → production → "Set up a new keystore"
   ```
   EAS stores the keystore. **Don't lose access to this Expo account**:
   Play updates must be signed with the same key.
3. Create a token at https://expo.dev/settings/access-tokens and add it as the
   repo secret `EXPO_TOKEN` (GitHub → Settings → Secrets and variables → Actions).

At this point the `apk` job works. Run it, then open the repo's **Releases**
page to get the download link.

### 2. Google Play (required for the `play` job only)

1. Create a Google Play developer account at https://play.google.com/console
   (one-time US$25 fee plus identity verification).
2. **Create app** → name "Breath", app, free. Fill in the store listing
   (description, screenshots, 512×512 icon, 1024×500 feature graphic), the
   content rating questionnaire, target audience, data safety form and a
   privacy policy URL.
3. **The first upload must be manual** (a Google API limitation). Run the
   workflow once with `play`. It builds the AAB, then the submit step fails.
   Download the `.aab` from the build page on expo.dev, and upload it in
   Play Console → Testing → Internal testing → Create release.
4. Create a service account so CI can upload later builds:
   - Google Cloud Console → IAM → Service accounts → create one → Keys →
     Add key → JSON. Enable the "Google Play Android Developer API" for the project.
   - Play Console → Users and permissions → Invite new user → the service
     account's email → grant **Release** permissions for the Breath app.
   - Paste the whole JSON key file into the repo secret
     `GOOGLE_SERVICE_ACCOUNT_JSON`.

After that, every `v*` tag (or a manual `play` run) builds a new AAB with an
auto-incremented `versionCode` and uploads it to the internal track as a
**draft**. Promote it in Play Console: internal → closed → production.
New personal developer accounts must run a closed test with at least 12 testers
for 14 days before production access is granted.

When the app is live, you can change `releaseStatus` in `eas.json` from
`"draft"` to `"completed"` to publish internal releases automatically.

---

## Building locally instead of from CI

```
npm run build:apk    # preview APK, prints a download link / QR code
npm run build:play   # production AAB + submit (needs ./google-service-account.json)
```
