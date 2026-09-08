# ZAIan Studio — desktop app

Native macOS, Windows, and Linux app for ZAIan Studio, built on
[Electron 31](https://www.electronjs.org/). The shell wraps the live web
deployment so content updates ship instantly with each Vercel push, while
the desktop layer adds:

- Native menus and `Cmd/Ctrl+Shift+P` global shortcut to jump straight
  into the workspace.
- Standalone window with system-aware traffic lights / minimise / close.
- External links open in the system browser instead of inside the shell.
- macOS `.dmg`, Windows `.nsis` installer, Linux `.AppImage` and `.deb`.

---

## Prereqs

| Target  | Toolchain                                |
| ------- | ---------------------------------------- |
| macOS   | macOS 12+, Xcode CLI tools (for codesign)|
| Windows | Windows 10/11, no extra SDK              |
| Linux   | any modern distro                        |

```bash
cd desktop
npm install
```

---

## Run in development

```bash
npm start
```

Loads the production URL by default (`PROMPTSZAIAN_URL` env to override).

---

## Build a signed installer

```bash
npm run build:mac      # → dist/ZAIan Studio-x.y.z.dmg
npm run build:win      # → dist/ZAIan Studio Setup x.y.z.exe
npm run build:linux    # → dist/ZAIan Studio-x.y.z.AppImage
```

To codesign on macOS, set `CSC_LINK` and `CSC_KEY_PASSWORD` env vars
before `npm run build:mac` (electron-builder picks them up automatically).

---

## Updating the app

99% of releases are content-only — push to `main`, Vercel deploys, and
the next launch loads the new version. You only need a fresh installer
when:

- The Electron version changes (security patches).
- You add a native module or change menus / hotkeys.
- App icon, name, bundle id change.

When you ship a new installer, bump `desktop/package.json#version` so
electron-builder names the artifacts correctly.

---

## Privacy and security posture

- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` —
  the renderer cannot reach Node or the file system.
- `setWindowOpenHandler` blocks all `window.open` calls and routes them
  through the OS's default browser.
- The shell only ever loads the configured URL; it cannot be tricked into
  loading arbitrary sites.
- No telemetry. The shell is a passive viewer.
