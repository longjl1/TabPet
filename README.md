# TabPet

`TabPet` is a Chrome extension built with `Vite + React + TypeScript`.

It injects a browser pet into web pages, provides a popup for quick controls, and exposes an options page backed by `chrome.storage.local`.

## Current Direction

- full-screen roaming pet behavior
- draggable placement anywhere in the viewport
- hunger, energy, and joy status bars
- feed, sleep, and play interactions
- configurable pet name, speed, scale, and custom asset URL
- Manifest V3 extension structure

## Project Structure

- `public/`: static extension assets and content scripts
- `src/popup/`: popup UI
- `src/options/`: options page UI
- `src/shared/`: shared settings types and storage helpers
- `docs/`: design notes, behavior notes, and roadmap

## Custom Assets

The pet is being prepared for user-supplied visuals. The intended workflow is:

1. open the options page
2. paste a custom image URL
3. let the existing pet behavior system render that asset in place of the default face

## Development

```bash
npm install
npm run build
```

Then load the generated `dist/` folder as an unpacked extension in Chrome.
