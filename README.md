# Restore YouTube Fullscreen Scroll

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fpgafianbfgjhcdmghaoecfemndjpkbo.svg)](https://chrome.google.com/webstore/detail/fpgafianbfgjhcdmghaoecfemndjpkbo)
[![Firefox Add-ons](https://img.shields.io/amo/v/youtube-fullscreen-scroll.svg)](https://addons.mozilla.org/en-US/firefox/addon/youtube-fullscreen-scroll/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A lightweight Chrome and Firefox extension that restores scroll functionality in YouTube's fullscreen mode.

https://github.com/user-attachments/assets/59757621-5116-4a6c-8c87-40877ee0f00f

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

This extension automatically detects and removes the problematic `deprecate-fullscreen-ui` attribute from YouTube elements. It continuously monitors the page for changes and handles dynamically loaded content, ensuring smooth scrolling functionality is restored in fullscreen mode.

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

> **Note**: Firefox version is currently only available through GitHub Releases (not Mozilla Add-ons store).

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

## Privacy

This extension respects your privacy:

- 🔒 Only works on YouTube pages (`*.youtube.com`)
- 🚫 Does not collect any personal data
- 🚫 Does not track your browsing history
- 🔧 Makes changes locally in your browser only
- 📊 No analytics or telemetry

## Technical Details

The extension uses a content script that:

- Monitors the DOM for the `deprecate-fullscreen-ui` attribute
- Automatically removes this attribute when detected
- Uses `MutationObserver` to handle dynamically loaded content
- Runs with minimal performance impact
- Requires no special permissions beyond content script access

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
