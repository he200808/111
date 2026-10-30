# dsh-plugin-social-preview

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that adds one
**Social preview** page to Settings: pick an image, get its size validated, and see the
2:1 card it will produce.

## What it does

- Upload by clicking the card or dragging a file onto it (PNG / JPG / WebP)
- Validates the 640 × 320 minimum and flags anything below the 1280 × 640 recommendation
- Previews the image as a 2:1 social card
- Generates a 1280 × 640 starter artwork on demand (**Download template**)
- Removes the current image

The chosen image is stored in the browser's `localStorage`, so it is per browser, not
shared between machines and not sent to the Host.

## Install

### From this GitHub repository

In the Harness Web UI open **Plugins → Add plugin** and paste the repository URL:

```
https://github.com/HE200808/111
```

### From a local checkout

Paste the absolute path of this directory into the same dialog, or use the agent tool:

```
plugin_manager install_bundle target="<absolute path to this directory>"
```

### From npm (if published)

```
plugin_manager install_bundle target="dsh-plugin-social-preview"
```

## Where it appears

**Settings → Social preview** (last entry in the settings navigation).

## Package layout

| File | Purpose |
|---|---|
| `index.js` | Host half; declares nothing, because the page is pure Client UI |
| `client.js` | Registers the `settings.section` entry and renders the page |
| `cordis.patch.yml` | Inserts the plugin row into the profile composition |
| `locale/en.json`, `locale/zh.json` | Title and description shown in the plugin list |
| `icon.svg` | Plugin icon |

## Notes

- Plain JavaScript; there is no build step, so a git install needs no `prepare` script.
- No Host services are required; the plugin only uses the Client `slots` and `locale` services.
- `package.json` intentionally has no `"private": true`, so you can also publish to npm.
  Add it back if you want to prevent accidental publishes.

## License

MIT
