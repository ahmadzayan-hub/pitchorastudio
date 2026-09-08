# Prompt ZAI@n — Browser extension

Manifest V3 extension for Chrome / Edge / Brave / Arc / Vivaldi. Adds a
"polish prompt" affordance directly inside ChatGPT, Claude, Copilot, and
Gemini, so you can rebuild a rough prompt without leaving the chat.

## Install (developer mode)

1. `chrome://extensions/` → toggle **Developer mode** (top-right).
2. Click **Load unpacked**, point at this `extension/` folder.
3. Pin the icon for one-click access.
4. Open the extension's **Options** to paste your `EXTENSION_API_KEY` (or
   leave blank to use the public local engine).

## Keyboard shortcut

- **Alt + P** — open the popup from any page (configurable in
  `chrome://extensions/shortcuts`).

## Files

| File             | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `manifest.json`  | MV3 declaration, permissions, content-script hosts, hotkey  |
| `background.js`  | Service worker — proxies API calls to the platform          |
| `content.js`     | Injects the "polish prompt" button on supported AI sites    |
| `content.css`    | Minimal styling for the injected button                     |
| `popup.html/js`  | Toolbar popup (paste a prompt → get a polished version)     |
| `popup.css`      | Popup styling                                               |
| `options.html/js`| Options page — API key, default target model                |

## Privacy

- The extension talks to **your** Prompt ZAI@n deployment only (set in
  Options). Nothing is sent to third parties.
- When no API key is configured, prompts are processed by the local
  engine running inside the popup — never leave your machine.

## Build a packaged `.crx` / `.zip`

```bash
cd extension
zip -r ../prompt-zaian-extension.zip . -x "*.DS_Store" "README.md"
```

Then upload the zip to the Chrome Web Store / Edge Add-ons.
