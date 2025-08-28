# Restore YouTube Fullscreen Scroll

A Chrome extension that fixes YouTube's fullscreen mode scroll functionality.

## The Problem

YouTube's fullscreen mode sometimes prevents you from scrolling through comments, related videos, and other content. This happens when YouTube adds a special attribute to elements that breaks normal scrolling behavior.

## The Solution

This extension automatically detects and removes the problematic attribute, restoring normal scroll functionality in YouTube's fullscreen mode.

## Installation

### Chrome Web Store (Recommended)
Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/fpgafianbfgjhcdmghaoecfemndjpkbo) and click "Add to Chrome".

Note: Chrome Web Store updates may be delayed due to review processes. For the latest version, use manual installation below.

### Manual Installation (Latest Version)

#### Chrome/Edge/Opera
1. Go to [GitHub Releases](https://github.com/cyberofficial/restore-youtube-scroll/releases)
2. Download either the ZIP or CRX file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Drag the downloaded file onto the extensions page
6. The extension installs automatically

#### Firefox
1. Go to [GitHub Releases](https://github.com/cyberofficial/restore-youtube-scroll/releases)
2. Download the XPI file
3. Open Firefox and go to `about:addons`
4. Click the gear icon and select "Install Add-on From File..."
5. Choose the downloaded XPI file
6. Click "Add" when prompted

Note: Firefox version is currently only available through GitHub Releases (not Mozilla Add-ons store).

## How to Use

The extension works automatically once installed:
1. Visit any YouTube video
2. Enter fullscreen mode (press F or click the fullscreen button)
3. Scroll normally through comments and related videos
4. No settings or configuration needed

## Compatibility

**Chrome**: Works with Chrome 88+ and other Chromium-based browsers including Edge and Opera.

**Firefox**: Works with Firefox 109+ and other Gecko-based browsers.

## Troubleshooting

### Chrome/Edge/Opera
If scrolling doesn't work in fullscreen:
1. Make sure the extension is enabled in `chrome://extensions/`
2. Refresh the YouTube page
3. Try entering and exiting fullscreen mode

### Firefox
If scrolling doesn't work in fullscreen:
1. Make sure the add-on is enabled in `about:addons`
2. Refresh the YouTube page
3. Try entering and exiting fullscreen mode

## Privacy

This extension:
- Only works on YouTube pages
- Does not collect any personal data
- Does not track your browsing
- Makes changes locally in your browser only

## Technical Details

The extension removes the `deprecate-fullerscreen-ui` attribute from YouTube elements that break scrolling functionality. It monitors the page for changes and automatically handles dynamically loaded content.

## Building from Source

For developers who want to build the extension packages from source code:

### Prerequisites
- PowerShell (Windows) or PowerShell Core (cross-platform)
- Git (to clone the repository)

### Build Process
1. Clone the repository:
   ```bash
   git clone https://github.com/cyberofficial/restore-youtube-scroll.git
   cd restore-youtube-scroll
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