# Restore YouTube Scroll

A Chrome extension that removes the `deprecate-fullerscreen-ui` attribute from YouTube elements to restore scroll functionality.

## What This Does

YouTube sometimes adds a `deprecate-fullerscreen-ui` attribute to elements that breaks normal scrolling behavior. This extension automatically removes that attribute, restoring the expected scroll functionality on YouTube pages.

## Installation

### Method 1: Load Unpacked Extension (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" button
5. Select the folder containing this extension (the folder with `manifest.json`)
6. The extension should now be installed and active

### Method 2: Package as CRX (for distribution)

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Pack extension"
4. Select the extension folder
5. Choose a location for the `.crx` file
6. The extension can now be distributed and installed

## Usage

Once installed, the extension will automatically:
- Remove the `deprecate-fullerscreen-ui` attribute from YouTube elements
- Monitor for dynamically added elements and remove the attribute from those too
- Work on all YouTube pages (`www.youtube.com`)

The extension runs in the background and requires no user interaction. Simply visit YouTube and the scroll functionality should work as expected.

## How It Works

The extension uses a content script that:
1. Runs on all YouTube pages
2. Finds elements with the `deprecate-fullerscreen-ui` attribute
3. Removes the attribute from those elements
4. Uses a MutationObserver to handle elements added dynamically by YouTube's JavaScript

## Original uBlock Filter

This extension replicates the functionality of this uBlock Origin filter:
```
www.youtube.com##[deprecate-fullerscreen-ui]:remove-attr(deprecate-fullerscreen-ui)
```

## Troubleshooting

If the extension doesn't seem to work:
1. Check that it's enabled in `chrome://extensions/`
2. Try refreshing the YouTube page
3. Check the browser console for any error messages
4. Make sure you're on `www.youtube.com` (not a different YouTube domain)

## Development

To modify the extension:
- Edit `manifest.json` for extension configuration
- Edit `content.js` for the main functionality
- Reload the extension in `chrome://extensions/` after making changes

## Permissions

This extension requires:
- `activeTab`: To access the current tab
- Host permissions for `www.youtube.com`: To run content scripts on YouTube

## License

This project is open source. Feel free to modify and distribute.