# Pitchora on Google Play — TWA submission playbook

Ship Pitchora as an Android app on Google Play in about 90 minutes,
without duplicating the codebase. We use a **Trusted Web Activity
(TWA)**: Play distributes a thin Android wrapper, the actual UI is
served by the live PWA at `https://www.pitchora.ai/presentiq`.

Everything below is on the canonical `pitchora` branch already, except
the two things only you can create: the Android package on Play
Console and the app-signing certificate.

---

## What's already shipped in this repo

- **11 PNG launcher icons** at `public/icons/icon-{48,72,96,144,192,256,384,512}.png` plus maskable variants at 192 and 512. All regenerated from `src/app/icon.svg` by `npm run generate:icons`.
- **`public/apple-icon.png`** (180×180) for iOS home-screen.
- **`public/og-image.png`** (1200×630) for social share cards.
- **`public/manifest.webmanifest`** referencing every icon size, three PWA shortcuts (New / Templates / Dashboard) with their own icons, maskable purpose set, `id` + `scope` + `start_url` pinned to `/presentiq/`, and a `share_target` so Android's system share sheet can post text or URL straight into `/projects/new`.
- **`public/.well-known/assetlinks.json`** template. The single field you fill from Play Console is the SHA-256 fingerprint of your app-signing certificate.
- **HTTPS + HSTS + CSP + COOP/CORP + X-Frame-Options** already set in `next.config.mjs`. TWA verification refuses to run on anything less.
- **Service worker** at `public/sw.js` with an offline fallback so the Android launcher can open Pitchora even when the device is offline.

## What you still need to do — one-pass checklist

### 1. Deploy the PWA to production (~5 min, one-time)

Use the one-click button in the repo README, or the runbook in `DEPLOY.md`. TWA verification requires a public HTTPS URL, so a local dev server or a Vercel Preview URL will not work — the app must be on the domain listed in `assetlinks.json`.

Assumed production URL for the rest of this doc: `https://www.pitchora.ai`.

### 2. Create the Android TWA (~10 min)

Use Google's [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap):

```bash
# 1. Install once
npm i -g @bubblewrap/cli

# 2. Initialise the Android project from our live manifest
bubblewrap init --manifest https://www.pitchora.ai/manifest.webmanifest

# Bubblewrap will prompt for:
#   package name   → ai.pitchora.app  (keep this or your reverse-domain of choice)
#   host           → www.pitchora.ai
#   start URL      → /presentiq/
#   app name       → Pitchora
#   short name     → Pitchora
#   theme color    → #0a0e2a
#   background     → #0a0e2a
#   display mode   → standalone
#   orientation    → any

# 3. Build the .aab bundle for Play upload
bubblewrap build
```

Output: `app-release-bundle.aab` and the app-signing keystore.

### 3. Publish assetlinks.json (~2 min)

Bubblewrap will print your SHA-256 fingerprint at the end of `build`. Paste it into `public/.well-known/assetlinks.json` in this repo, replacing the `REPLACE_WITH_YOUR_PLAY_APP_SIGNING_SHA256` placeholder.

Commit and push. Vercel redeploys. Verify:

```bash
curl -sI https://www.pitchora.ai/.well-known/assetlinks.json
# Expect HTTP 200 and Content-Type: application/json.
```

Google's own verifier:
```
https://developers.google.com/digital-asset-links/tools/generator
```

If verification fails, the Android app will boot with the browser URL bar visible (a dead giveaway). Fix the fingerprint before submission.

### 4. Play Console submission (~45 min the first time)

1. **Create app** in Play Console → Package name `ai.pitchora.app`, category **Productivity**.
2. **App content** → Privacy Policy link → `https://www.pitchora.ai/presentiq/privacy` (add this route if it does not exist yet — it's linked from the footer).
3. **Store listing** — use the assets in `public/og-image.png` and generated screenshots. Play wants:
   - Feature graphic: 1024×500 (regenerate via `og-image` script or Figma).
   - Phone screenshots: at least 2, 320–3840 px.
   - Short description ≤ 80 chars: *AI boardroom presentation studio. Editable PPTX, Arabic RTL.*
   - Full description ≤ 4000 chars: expand from `/presentiq/about`.
4. **App signing** — enable Play App Signing (default). Copy the SHA-256 back into `assetlinks.json` if Google re-signed.
5. **Release** → **Production** → upload the `.aab` from step 2 → rollout 100 %.

Review typically clears within 24 h for a first submission with no policy issues.

### 5. Post-launch verification (~5 min per release)

```bash
# Fetch the manifest that Google actually parses:
curl -sL https://www.pitchora.ai/manifest.webmanifest | jq

# Check every icon size resolves:
for s in 48 72 96 144 192 256 384 512; do
  code=$(curl -so /dev/null -w "%{http_code}" https://www.pitchora.ai/icons/icon-$s.png)
  echo "$s: $code"
done

# Check maskables:
curl -so /dev/null -w "192-maskable %{http_code}\n" https://www.pitchora.ai/icons/icon-192-maskable.png
curl -so /dev/null -w "512-maskable %{http_code}\n" https://www.pitchora.ai/icons/icon-512-maskable.png
```

Every response should be `200`.

## Regenerating icons after a brand refresh

The single source of truth is `src/app/icon.svg`. Change it, then:

```bash
npm run generate:icons
git add public/icons public/apple-icon.png public/og-image.png public/favicon.png
git commit -m "chore(brand): regenerate icons"
git push origin pitchora
```

Vercel redeploys. Existing installed TWAs pick up the new icon at
next launch — no Play resubmission needed unless you also want to
update the Play Store listing icon.

## What we did NOT do (and why)

- **We did not build the `.aab`.** Requires an Android keystore that belongs to you, not the repo. Bubblewrap in Section 2 walks you through it in one command.
- **We did not submit to Play.** Requires your Play Console account and $25 developer fee (one-time).
- **We did not put a real SHA-256 in `assetlinks.json`.** The placeholder is intentional — you paste yours after `bubblewrap build`.

Everything on the web side is done. The three steps above are the only Android-specific work left.
