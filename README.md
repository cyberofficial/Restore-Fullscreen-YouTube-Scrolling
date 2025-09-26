# Restore YouTube Fullscreen Scroll

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fpgafianbfgjhcdmghaoecfemndjpkbo.svg)](https://chrome.google.com/webstore/detail/fpgafianbfgjhcdmghaoecfemndjpkbo)
[![Firefox Add-ons](https://img.shields.io/amo/v/youtube-fullscreen-scroll.svg)](https://addons.mozilla.org/en-US/firefox/addon/youtube-fullscreen-scroll/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A privacy-respecting browser extension that restores scrolling, comments, and navigation while YouTube is in fullscreen. It neutralizes YouTube’s fullscreen hijack, emulates a stable F11-like experience, and keeps the page responsive to keyboard shortcuts you expect.

> Status: YouTube’s player is a moving target. Releases land after targeted testing, but breaking changes from YouTube can still slip through. If you spot a regression, open an issue with the video URL and reproduction steps.


https://github.com/user-attachments/assets/55fe1788-2a6a-4f72-a76f-583d2687e917



## Table of contents

- [Overview](#overview)
- [Highlights](#highlights)
- [How it works](#how-it-works)
- [Installation](#installation)
- [Using the extension](#using-the-extension)
- [Compatibility](#compatibility)
- [Troubleshooting](#troubleshooting)
- [Privacy](#privacy)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Overview

YouTube’s fullscreen mode often locks the player in place and blocks scrolling through comments or the Up Next rail. The legacy workaround of stripping a single attribute stopped working once YouTube shifted to script-driven fullscreen logic. This extension ships a more involved but reliable approach that keeps fullscreen usable and scrollable across Chrome-based browsers and Firefox.

## Highlights

- Restores scrolling for comments, related videos, and description panes in fullscreen
- Hooks the `F` key and the YouTube fullscreen control to trigger the extension’s emulated fullscreen
- Automatically falls back when other extensions or site experiments interfere
- Works out of the box, no configuration panels or background services
- Lightweight content script with no analytics, tracking, or remote calls

## How it works

1. **Fullscreen API shim** – At `document_start` the script stubs the native fullscreen API so the YouTube player cannot seize OS-level fullscreen.
2. **Emulated fullscreen** – The player container is restyled to occupy the viewport while the page stays scrollable. Scrollbars are hidden visually but remain functional for mouse, touchpad, and keyboard navigation.
3. **Control interception** – The standard fullscreen button and the `F` keyboard shortcut both run the extension’s toggle. The background service worker requests window-level fullscreen on Chromium browsers when allowed.
4. **State preservation** – Inline styles on key layout nodes are stored before activation and restored on exit to avoid long-term layout drift.

## Installation

### Chrome Web Store

[Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/fpgafianbfgjhcdmghaoecfemndjpkbo). Store reviews can lag behind GitHub releases, so check the version badge above to confirm you are on the latest build.

### Firefox Add-ons

[Install from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/youtube-fullscreen-scroll/). Mozilla reviews can take a few days; side-loading from a release package is available below if you need an update immediately.

### Manual installation (latest build)

<details>
<summary>Chrome, Edge, Opera</summary>

1. Download the Chrome package from the [GitHub Releases](https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling/releases) page.
2. Extract the archive if you pulled the ZIP variant.
3. Visit `chrome://extensions/`, enable Developer Mode, and choose “Load unpacked”.
4. Select the extracted directory; the extension loads immediately.

</details>

<details>
<summary>Firefox</summary>

1. Download the Firefox XPI from [GitHub Releases](https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling/releases).
2. Open `about:addons`, choose the gear icon, and click “Install Add-on From File…”.
3. Pick the XPI and approve the installation prompt.

Temporary installs disappear when Firefox restarts. Install from Add-ons once the listed build catches up.

</details>

## Using the extension

1. Open any YouTube video and enter fullscreen (press `F` or click the player control).
2. Scroll through comments, chapters, and related videos without leaving fullscreen.
3. Press `Esc` or `F` again to exit the emulated fullscreen. On Chromium browsers the entire window toggles fullscreen; on Firefox the player remains maximized inside the tab while scrolling continues to work.
4. The extension does not add UI or settings—everything happens automatically on `*.youtube.com`.

## Compatibility

| Browser | Minimum version | Notes |
| --- | --- | --- |
| Chrome | 88 | Requests actual window fullscreen when the `windows` API is available |
| Edge | 88 | Same behavior as Chrome builds |
| Opera | 74 | Requires manual install via Developer Mode |
| Firefox | 109 | Lacks the `windows` permission; runs in-page fullscreen emulation |

## Troubleshooting

Most issues trace back to a YouTube interface shift or another extension modifying the same DOM. Try the following before filing an issue:

- Reload the tab after installing or updating the extension.
- Disable other YouTube or fullscreen-related extensions temporarily.
- If keyboard scrolling fails but mouse wheel works, toggle fullscreen off and on to refresh styles.
- Capture reproduction steps, the video URL, and your browser version when reporting problems in the [issue tracker](https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling/issues).

## Privacy

- Runs only on `*.youtube.com` domains defined in the manifest
- Executes entirely in the browser with no network requests or telemetry
- Stores no user data, settings, or identifiers between sessions
- Source code is open for independent review and auditing

## Development

Clone the repository and load the extension as an unpacked build to experiment locally:

```bash
git clone https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling.git
cd Restore-Fullscreen-YouTube-Scrolling
```

### Building distributable packages

The PowerShell script creates zip archives for Chrome and Firefox submissions:

```powershell
./build.ps1        # builds into builds/chrome and builds/firefox
./build.ps1 -Clean # optional reset of the builds directory
```

Generated archives include `background.js`, `content.js`, and the browser-specific manifest that matches the version badge.

### Project layout

- `content.js` – document_start script that injects styles and intercepts controls
- `background.js` – lightweight service worker that syncs Chromium window fullscreen state
- `manifest.chrome.json` / `manifest.firefox.json` – platform-specific metadata
- `build.ps1` – packaging helper for CI or manual releases

## Contributing

Feedback, bug reports, and pull requests are welcome. If you plan a larger change, open an issue first so the approach can be discussed. Please test on both a Chromium browser and Firefox when possible and document any YouTube layout variants encountered during development.

## License

Licensed under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE) for the full text.
