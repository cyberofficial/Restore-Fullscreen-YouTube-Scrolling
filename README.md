# Restore YouTube Fullscreen Scroll

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fpgafianbfgjhcdmghaoecfemndjpkbo.svg)](https://chrome.google.com/webstore/detail/fpgafianbfgjhcdmghaoecfemndjpkbo)
[![Firefox Add-ons](https://img.shields.io/amo/v/youtube-fullscreen-scroll.svg)](https://addons.mozilla.org/en-US/firefox/addon/youtube-fullscreen-scroll/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A lightweight Chrome and Firefox extension that restores scroll functionality in YouTube's fullscreen mode.

Note: YouTube changed the way fullscreen is handled which broke earlier approaches. This repository now implements a robust solution (introduced in v1.0.13) that neutralizes YouTube's fullscreen hijack and applies an emulated fullscreen that keeps scrolling functional.

## Experimental Status

This extension is currently considered experimental. YouTube's fullscreen implementation changed; decent updates will be made only after careful investigation and testing of page changes. Expect intermittent maintenance and delayed fixes. The extension will be updated when a reliable, well-researched solution is identified and verified. Contributions and bug reports are welcome to help prioritize and accelerate fixes.

## Table of Contents

- [Features](#features)
- [Problem](#problem)
- [Solution](#solution)
- [Installation](#installation)
- [Usage](#usage)
- [Compatibility](#compatibility)
- [Troubleshooting](#troubleshooting)
- [Privacy](#privacy)
- [Technical Details](#technical-details)
- [Contributing](#contributing)
- [Building from Source](#building-from-source)
- [License](#license)

## Features

- ✅ Automatic detection and fixing of scroll issues in YouTube fullscreen
- ✅ Works with comments, related videos, and other content
- ✅ No configuration required - works out of the box
- ✅ Lightweight and performant
- ✅ Cross-browser support (Chrome, Firefox, Edge, Opera)
- ✅ Open source and free

## Problem

YouTube's fullscreen mode sometimes prevents users from scrolling through comments, related videos, and other content. This occurs when YouTube adds a special attribute (`deprecate-fullscreen-ui`) to elements that breaks normal scrolling behavior, making it impossible to navigate the interface properly.

## Solution

Older versions of this extension removed problematic attributes (for example `deprecate-fullscreen-ui`) to restore scrolling. YouTube recently removed or changed the DOM and behavior that made that approach unreliable.

Current approach (v13):

- Monkey-patch the Fullscreen API early at document_start so YouTube's player cannot hijack native fullscreen behavior.
- Intercept the player's fullscreen button and emulate F11-style fullscreen using injected CSS and controlled inline styles.
- Preserve and restore original inline styles for critical elements (for example `#primary`, `#player`) so I don't permanently break page layout.
- Hide scrollbars visually while keeping the page scrollable, with cross-browser fallbacks (Chrome, Firefox, Edge).

This approach is more invasive but much more reliable across YouTube updates.

## Installation

### Chrome Web Store (Recommended)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/fpgafianbfgjhcdmghaoecfemndjpkbo.svg?color=blue)](https://chrome.google.com/webstore/detail/fpgafianbfgjhcdmghaoecfemndjpkbo)

Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/fpgafianbfgjhcdmghaoecfemndjpkbo) and click "Add to Chrome".

> **Note**: Chrome Web Store updates may be delayed due to review processes. For the latest version, use manual installation below.

### Firefox Add-ons (Recommended)

[![Firefox Add-ons](https://img.shields.io/amo/users/youtube-fullscreen-scroll.svg?color=orange)](https://addons.mozilla.org/en-US/developers/addon/youtube-fullscreen-scroll/)

Visit the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/youtube-fullscreen-scroll/) and click "Add to Firefox".

> **Note**: Firefox Add-ons updates may be delayed due to review processes. For the latest version, use manual installation below.

### Manual Installation (Latest Version)

#### Chrome/Edge/Opera

1. Go to [GitHub Releases](https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling/releases)
2. Download either the ZIP or CRX file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Drag the downloaded file onto the extensions page
6. The extension installs automatically

#### Firefox

1. Go to [GitHub Releases](https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling/releases)
2. Download the XPI file
3. Open Firefox and navigate to `about:addons`
4. Click the gear icon and select "Install Add-on From File..."
5. Choose the downloaded XPI file
6. Click "Add" when prompted

> **Note**: Firefox version is currently being reviewed and will be updated/release when reviewed.
> You'll have to load it temporarily.

## Usage

The extension works automatically once installed:

1. Visit any YouTube video
2. Enter fullscreen mode (press `F` or click the fullscreen button)
3. Scroll normally through comments and related videos
4. No settings or configuration needed

## Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 88+ | ✅ Fully Supported |
| Firefox | 109+ | ✅ Fully Supported |
| Edge | 88+ | ✅ Fully Supported |
| Opera | 74+ | ✅ Fully Supported |

## Troubleshooting

### Chrome/Edge/Opera

If scrolling doesn't work in fullscreen:

1. Ensure the extension is enabled in `chrome://extensions/`
2. Refresh the YouTube page
3. Try entering and exiting fullscreen mode
4. Check for YouTube updates that may have changed the interface

### Firefox

If scrolling doesn't work in fullscreen:

1. Ensure the add-on is enabled in `about:addons`
2. Refresh the YouTube page
3. Try entering and exiting fullscreen mode
4. Check for YouTube updates that may have changed the interface

### General Troubleshooting

- **Extension not working**: Try disabling and re-enabling the extension
- **YouTube updates**: YouTube frequently changes their interface; check for extension updates
- **Conflicts**: Disable other YouTube-related extensions temporarily to test
- **Report issues**: [Create an issue](https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling/issues) on GitHub

### If the extension no longer restores scrolling

- Ensure the extension is up-to-date (the current method was introduced in v1.0.13).
- Try reloading the page and entering fullscreen again.
- If scrolling partially works (e.g., mouse wheel but not touchpad), try toggling fullscreen with the video button once to reinitialize the emulation.
- If the layout looks broken after toggling, the extension stores and restores inline styles; report the URL and steps so I can add a targeted fix.

### Why I changed the method

YouTube started preventing the old attribute-removal trick by changing where and how fullscreen state is applied. The new method neutralizes the platform-level API and applies our own predictable layout changes so scrolling and keyboard interaction remain available.

## Privacy

This extension respects your privacy:

- 🔒 Only works on YouTube pages (`*.youtube.com`)
- 🚫 Does not collect any personal data
- 🚫 Does not track your browsing history
- 🔧 Makes changes locally in your browser only
- 📊 No analytics or telemetry

## Technical Details


The extension uses a content script that:

- Runs at document_start and monkey-patches the Fullscreen API functions (e.g., `requestFullscreen`) so the player cannot take exclusive control.
- Injects a CSS stylesheet and toggles a body activation class to emulate fullscreen layout (player fills viewport while page remains scrollable).
- Uses `MutationObserver` to detect the player's fullscreen button and attaches a click handler to toggle the emulated fullscreen.
- Stores original inline styles for elements like `#primary` and `#player` and restores them when exiting emulated fullscreen.
- Applies cross-browser scrollbar hiding (WebKit + Firefox + IE fallbacks) that hides visuals but preserves scrolling.

Files of interest:
- `content.js` - main content script implementing the fullscreen-API monkey-patch + CSS emulation
- `manifest.chrome.json` / `manifest.firefox.json` - browser manifests
- `build.ps1` - build script used to package the extension

**Files:**
- `content.js` - Main content script
- `manifest.json` - Extension manifest (browser-specific)
- `scroll-bar.png` - Extension icon

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling.git
   cd Restore-Fullscreen-YouTube-Scrolling
   ```

2. Make your changes

3. Test the extension:
   - Load as unpacked extension in Chrome/Firefox
   - Test on YouTube fullscreen mode

4. Submit a pull request

### Guidelines

- Follow the existing code style
- Test changes thoroughly
- Update documentation as needed
- Ensure cross-browser compatibility

## Building from Source

For developers who want to build the extension packages from source code:

### Prerequisites

- PowerShell (Windows) or PowerShell Core (cross-platform)
- Git (to clone the repository)

### Build Process

1. Clone the repository:
   ```bash
   git clone https://github.com/cyberofficial/Restore-Fullscreen-YouTube-Scrolling.git
   cd Restore-Fullscreen-YouTube-Scrolling
   ```

2. Run the build script:
   ```powershell
   .\build.ps1
   ```

   Optional: Clean existing builds first:
   ```powershell
   .\build.ps1 -Clean
   ```

### Build Output

The build script creates distribution packages for both browsers:
- `builds/chrome/[version].zip` - Chrome Web Store package
- `builds/firefox/[version].zip` - Firefox Add-ons package

### Build Script Features

- **Automated Packaging**: Creates ZIP files ready for store submission
- **Version Detection**: Automatically reads version from manifest files
- **Multi-Browser Support**: Separate packages for Chrome and Firefox
- **Security Transparency**: Fully documented with no external dependencies
- **File Verification**: Validates package contents and integrity

### What the Build Script Does

1. Reads version numbers from browser-specific manifests
2. Creates temporary staging directories
3. Copies extension files (`content.js`, `scroll-bar.png`, manifest)
4. Packages files into ZIP archives for distribution
5. Verifies package integrity and reports file sizes
6. Organizes outputs into browser-specific folders

The build script is fully documented and uses only standard PowerShell commands with no external downloads or network access.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the YouTube community**
