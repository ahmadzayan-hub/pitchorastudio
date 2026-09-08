# Prompt ZAI@n / زيان ستوديو — Mobile Shells

Native iOS + Android wrappers around the live web app, built with
[Capacitor 6](https://capacitorjs.com). Both shells point at the
production URL by default, so any change you push to the web app is
**live in the apps within seconds** — no app-store review needed for
content updates.

When the device is offline, the bundled service worker keeps the local
engine running, so the workspace, voice input, file uploads, history,
quality score, token meter, and the whole local pipeline still work.

---

## Prerequisites

| Target  | Toolchain                                      | OS         |
| ------- | ---------------------------------------------- | ---------- |
| Android | Android Studio Hedgehog +, JDK 17, Gradle 8+   | any host   |
| iOS     | Xcode 15+, CocoaPods 1.13+, Apple Developer ID | macOS only |

```bash
cd mobile
npm install
```

---

## Android — first build

```bash
npm run android:init     # one-time: creates ./android
npm run android:sync     # copies web assets + plugins into the project
npm run android:open     # opens Android Studio so you can sign + build
```

To run on a connected device or emulator straight from CLI:

```bash
npm run android:run
```

Release APK / AAB (after configuring signing in `android/app/build.gradle`):

```bash
npm run android:build    # outputs to android/app/build/outputs/apk/release/
```

The Android shell is compatible with **API 22 (Android 5.1) and up** —
covers ≈99% of active devices.

---

## iOS — first build

iOS builds **must** be done on macOS with Xcode installed. From a
non-macOS host you can edit code, sync, and commit, but the actual
`xcodebuild` step requires Apple's toolchain.

```bash
npm run ios:init     # one-time: creates ./ios (requires CocoaPods)
npm run ios:sync     # copies web assets + plugins into the Pods project
npm run ios:open     # opens the Xcode workspace
```

To run on a connected iPhone or the iOS Simulator:

```bash
npm run ios:run
```

Before submitting to the App Store:

1. Add this line to `ios/App/App/Info.plist` so the in-app web view can
   request microphone permission for voice input:

   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>Prompt ZAI@n uses the microphone to transcribe your voice
   into a prompt.</string>
   ```

2. Replace the launcher icon in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   with the rendered versions of `public/icon.svg`.

3. Sign with your Apple Developer team and archive from
   **Product ▸ Archive** in Xcode, then upload via the Organizer.

---

## Updating the apps

For 99% of changes you do **not** need to ship a new app build:

1. Push to `main` and let Vercel deploy.
2. Users see the update on next launch (the service worker pulls the
   new shell within seconds, then refreshes).

You only need a new app-store build when you:

- change `appId`, `appName`, splash screen, or icon
- add a Capacitor plugin (then run `sync` and re-archive)
- bump the minimum OS version

---

## Sharing the app

Both shells expose the system share sheet via the in-app **Share** button
(uses [`@capacitor/share`](https://capacitorjs.com/docs/apis/share) on
native, falls back to `navigator.share` / clipboard on web). Users can
share the app to WhatsApp, Telegram, X, Mail, Messages, AirDrop, or any
other installed sharing target — no extra code needed per platform.
