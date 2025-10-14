'use strict';

const lastWindowStates = new Map();

function getExtensionApi() {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return chrome;
  }
  if (typeof browser !== 'undefined' && browser.runtime) {
    return browser;
  }
  return null;
}

const extensionApi = getExtensionApi();

if (extensionApi && extensionApi.runtime && extensionApi.windows) {
  extensionApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== 'set-browser-fullscreen') {
      return false;
    }

    const windowId = sender && sender.tab ? sender.tab.windowId : undefined;

    if (typeof windowId !== 'number') {
      sendResponse?.({ ok: false, reason: 'missing-window-id' });
      return false;
    }

    const api = extensionApi.windows;

    const onWindowInfo = (win) => {
      if (!win) {
        sendResponse?.({ ok: false, reason: 'window-not-found' });
        return;
      }

      const finish = (result) => {
        const err = extensionApi.runtime.lastError;
        if (err) {
          sendResponse?.({ ok: false, reason: err.message || 'update-failed' });
        } else {
          sendResponse?.({ ok: true, ...result });
        }
      };

      if (message.activate) {
        if (win.state !== 'fullscreen') {
          if (win.state && win.state !== 'fullscreen') {
            lastWindowStates.set(windowId, win.state);
          }
          api.update(windowId, { state: 'fullscreen' }, () => finish({ state: 'fullscreen' }));
        } else {
          // Already fullscreen, preserve this state
          lastWindowStates.set(windowId, 'fullscreen');
          finish({ state: 'fullscreen', already: true });
        }
      } else {
        const previousState = lastWindowStates.get(windowId) || 'normal';
        if (win.state === 'fullscreen') {
          api.update(windowId, { state: previousState }, () => finish({ state: previousState }));
        } else {
          // If not fullscreen anymore, still ensure we revert to previous stored state.
          if (previousState && win.state !== previousState) {
            api.update(windowId, { state: previousState }, () => finish({ state: previousState }));
          } else {
            finish({ state: win.state, already: true });
          }
        }
        if (!message.preserveState) {
          lastWindowStates.delete(windowId);
        }
      }
    };

    if (typeof api.get === 'function') {
      api.get(windowId, (win) => {
        const err = extensionApi.runtime.lastError;
        if (err) {
          sendResponse?.({ ok: false, reason: err.message || 'get-window-failed' });
          return;
        }
        onWindowInfo(win);
      });
    } else {
      sendResponse?.({ ok: false, reason: 'windows-api-unavailable' });
    }

    return true;
  });

  if (extensionApi.windows.onRemoved) {
    extensionApi.windows.onRemoved.addListener((windowId) => {
      lastWindowStates.delete(windowId);
    });
  }
} else {
  console.warn('[YT Scroll Fix] Background windows API unavailable.');
}
