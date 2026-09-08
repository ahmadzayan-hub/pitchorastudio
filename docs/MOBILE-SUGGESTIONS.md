# Native mobile "Grammarly-style" suggestions — architecture

This document is the technical design for shipping live, in-context prompt
suggestions across **any** AI app on iOS and Android — the same experience
Grammarly delivers for grammar today.

The web + browser-extension paths already work and are shipped in v0.12.
This document covers what's needed for the **native** path.

---

## 1. The shared brain — already done

The platform exposes a stable, anonymous, fast endpoint:

```
POST /api/v1/suggest
{
  "draft":         "string (≤ 20 KB)",
  "intent?":       "image | video | …",
  "target_model?": "chatgpt | claude | …",
  "locale?":       "en | ar",
  "limit?":        1..6
}

→ { api_version: "v1", suggestions: [{ id, kind, label, preview, append }] }
```

Every native surface below calls this same endpoint. Latency is single-digit
ms because the engine is pure-function — no LLM round-trip.

---

## 2. iOS — Custom Keyboard Extension

iOS allows third-party keyboards via the Keyboard extension target. Apple
restricts these heavily (no network access by default; "Allow Full Access"
toggle required for HTTP). The pragmatic shape:

```
ios/
└── App/
    ├── App/                 ← the existing Capacitor host app
    └── ZaianKeyboard/       ← new keyboard extension target
        ├── KeyboardViewController.swift
        ├── SuggestionView.swift
        └── Info.plist        (RequestsOpenAccess = YES)
```

`KeyboardViewController.swift` watches the document context via
`textDocumentProxy`; on every change (debounced 300 ms) it calls
`/api/v1/suggest` with the leading text and renders the result chips above
the keys. Tapping a chip calls `textDocumentProxy.insertText(append)`.

**Distribution constraints**

- The keyboard ships *inside* the host app (App Store reviews the bundle).
- Users enable it via Settings → General → Keyboard → Keyboards → Add New.
- "Allow Full Access" needs a clear privacy disclosure.

**Why this is correct, not heroic**

iOS does not allow floating overlays on top of other apps. A custom
keyboard is the only Apple-blessed way to suggest text inside other AI
apps. We pay the App Store review cost once.

---

## 3. Android — Floating bubble + IME (two-track)

Android offers two distinct paths; we recommend shipping **both**:

### 3a. Floating bubble (overlay) — fast win

Activated by a foreground service with `SYSTEM_ALERT_WINDOW`. A small
brand sphere floats on top of every app; tapping it opens a chip strip
that fetches `/api/v1/suggest` against the current clipboard contents
(or, if accessibility is on, the active text field's selection).

```
android/
└── app/
    └── src/main/
        ├── java/com/zaian/promptzaian/
        │   ├── BubbleService.kt    ← Foreground service + WindowManager
        │   ├── BubbleView.kt       ← The floating sphere + chip popup
        │   └── SuggestApi.kt       ← Retrofit client → /api/v1/suggest
        └── res/layout/bubble_view.xml
```

The bubble does **not** read other apps' text fields without the user
pasting / selecting — this avoids the Play Store's hard line on
accessibility-service abuse.

### 3b. Custom IME (keyboard) — long-tail polish

A full Input Method Editor offers in-place suggestions like Grammarly.
Android IMEs are well-supported and have no special review process.

```
android/
└── app/
    └── src/main/
        ├── java/com/zaian/promptzaian/ime/
        │   ├── ZaianInputMethodService.kt
        │   ├── KeyboardLayout.kt
        │   └── SuggestionStrip.kt
        └── res/xml/method.xml      ← <input-method> declaration
```

`onUpdateSelection()` and `onUpdateExtractedText()` provide the live
context; we POST a sliding window to `/api/v1/suggest` and render chips
above the keyboard layout. Tapping a chip calls
`getCurrentInputConnection().commitText(append, 1)`.

---

## 4. Why we chose the staged approach

| Layer | Ship date | Coverage | Cost |
| --- | --- | --- | --- |
| Browser extension floating bubble (v0.12) | shipped | Desktop ChatGPT, Claude, Gemini, Copilot | low |
| PWA Web Share Target (v0.12) | shipped | Any Android app → ZAI@n | low |
| iOS Keyboard Extension | next milestone | Any iOS app | medium-high (App Store review) |
| Android Floating Bubble | next milestone | Any Android app, no permissions controversy | medium |
| Android IME | follow-up | Polished, in-place suggestions | medium-high |

This gives users an immediate Grammarly-style win on the **web** today,
while we build the native pieces against the same `/api/v1/suggest`
contract — no rework when the keyboard ships.

---

## 5. Developer playbook — wiring the native pieces

```bash
# Add the iOS extension target inside Xcode:
#   File → New → Target → Custom Keyboard Extension
#   Name: ZaianKeyboard
#   Embed in: App
#   Then add NSAppTransportSecurity allow-insecure-loads = NO,
#   and toggle "RequestsOpenAccess" = YES so the keyboard can call our API.

# Build & sync:
cd mobile
npm run ios:sync
npm run ios:open
```

```bash
# Android side — create the IME service:
#   New → Service → ZaianInputMethodService
#   Add res/xml/method.xml, register in AndroidManifest.xml under
#   <service android:name=".ime.ZaianInputMethodService"
#            android:permission="android.permission.BIND_INPUT_METHOD">

# Build & sync:
cd mobile
npm run android:sync
npm run android:open
```

Both projects share `mobile/capacitor.config.ts` and the live web URL, so
content updates do not need a new app store build — only the native
keyboard / bubble code does.

---

## 6. Privacy contract

The `/api/v1/suggest` endpoint:

- Stores **no** request bodies.
- Logs only that *some* request happened (count, latency) — no draft text.
- Has a CORS-`*` policy so the extension and any future mobile shell can
  call it without a session.
- Returns no PII.

Native surfaces inherit these guarantees. The keyboard / bubble must
display a one-time consent screen on first use that says exactly:

> "Prompt ZAI@n sends what you type *only when you're typing in this
> keyboard* to its suggestion engine. Nothing else is stored or shared."
