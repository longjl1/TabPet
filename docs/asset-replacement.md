# Asset Replacement Guide

TabPet is being prepared for custom art assets.

## Current Strategy

The pet can render in two modes:

- fallback face mode using text
- image mode using a user-provided asset URL

## Design Goals

- keep the behavior system independent from the art layer
- allow the same logic to work with emoji, PNG, SVG, or sprite sheets
- make it easy to test a new pet image without rebuilding the extension

## Future Extension Ideas

- built-in preset skins
- local file upload support
- sprite-sheet frame selection
- separate art for idle, walk, sleep, and happy states
