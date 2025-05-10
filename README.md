# TabPet

`TabPet` is a Chrome extension built with `Vite + React + TypeScript`.

It injects a small browser pet into web pages, provides a popup for quick toggles, and exposes a simple options page backed by `chrome.storage.local`.

## First Version

- content script that mounts the pet on pages
- popup with quick enable and speech toggles
- options page for basic settings
- Manifest V3 structure
- shared settings storage helpers

## Development

```bash
npm install
npm run build
```

Then load the generated `dist/` folder as an unpacked extension in Chrome.
