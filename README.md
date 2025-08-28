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
1. Go to [GitHub Releases](https://github.com/cyberofficial/restore-youtube-scroll/releases)
2. Download either the ZIP or CRX file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Drag the downloaded file onto the extensions page
6. The extension installs automatically

## How to Use

The extension works automatically once installed:
1. Visit any YouTube video
2. Enter fullscreen mode (press F or click the fullscreen button)
3. Scroll normally through comments and related videos
4. No settings or configuration needed

## Compatibility

Works with Chrome 88+ and other Chromium-based browsers including Edge and Opera.

## Troubleshooting

If scrolling doesn't work in fullscreen:
1. Make sure the extension is enabled in `chrome://extensions/`
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