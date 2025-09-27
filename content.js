// =============================================================================
// RESTORE YOUTUBE FULLSCREEN SCROLL - (v17 - Definitive API Monkey-Patch)
// =============================================================================
//
// Project: Restore YouTube Fullscreen Scroll
// Purpose: Neuters the native Fullscreen API to prevent YouTube's player from
//          hijacking it, then applies a pure CSS F11-style emulation that
//          allows for scrolling. This is the definitive solution.
// Author:  cyberofficial
//
// =============================================================================

(function() {
  'use strict';

  console.log('[YT Scroll Fix] Script running at document_start.');

  const extensionApi = (() => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return chrome;
    }
    if (typeof browser !== 'undefined' && browser.runtime) {
      return browser;
    }
    return null;
  })();

  // --- STAGE 1: Monkey-Patch the Fullscreen API ---
  // This code runs immediately, before YouTube's scripts can load.
  // We replace the native fullscreen functions with a dummy that does nothing.
  Element.prototype.requestFullscreen = () => Promise.resolve();
  Element.prototype.webkitRequestFullscreen = () => Promise.resolve();
  Element.prototype.mozRequestFullScreen = () => Promise.resolve();
  Element.prototype.msRequestFullscreen = () => Promise.resolve();
  
  console.log('[YT Scroll Fix] Fullscreen API has been successfully neutered.');


  // --- STAGE 2: Wait for DOM to be ready to inject styles and listeners ---
  const onDOMContentLoaded = () => {
    const STYLE_ID = 'pure-css-fullscreen-style';
    const ACTIVATION_CLASS = 'scroll-fullscreen-active';

    function injectCss() {
      if (document.getElementById(STYLE_ID)) return;
      
      const css = `
        body.${ACTIVATION_CLASS} ytd-watch-flexy {
          --ytd-watch-flexy-max-player-width: 100% !important;
          --ytd-watch-flexy-space-below-player: 0 !important;
          --ytd-watch-flexy-panel-max-height: 100vh !important;
          --ytd-watch-flexy-chat-max-height: 100vh !important;
          --ytd-watch-flexy-structured-description-max-height: 100vh !important;
          --ytd-watch-flexy-comments-panel-max-height: 100vh !important;
          --ytd-comments-engagement-panel-content-height: 100vh !important;
          min-height: 100vh !important;
        }
        body.${ACTIVATION_CLASS} ytd-masthead,
        body.${ACTIVATION_CLASS} #secondary.ytd-watch-flexy {
          display: none !important;
        }
        body.${ACTIVATION_CLASS} #page-manager.ytd-app {
          margin-top: 0 !important;
        }
        body.${ACTIVATION_CLASS} #columns,
        body.${ACTIVATION_CLASS} #primary,
        body.${ACTIVATION_CLASS} #primary-inner {
          max-width: none !important;
          width: 100% !important;
        }
        body.${ACTIVATION_CLASS} #player.ytd-watch-flexy,
        body.${ACTIVATION_CLASS} #player-container-outer,
        body.${ACTIVATION_CLASS} #player-container-inner,
        body.${ACTIVATION_CLASS} #player-container,
        body.${ACTIVATION_CLASS} ytd-player,
        body.${ACTIVATION_CLASS} ytd-player #container {
          position: relative !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          margin: 0 auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        body.${ACTIVATION_CLASS} #player-container-inner {
          padding-top: 0 !important;
          flex-direction: column !important;
        }
        body.${ACTIVATION_CLASS} #player.ytd-watch-flexy {
          overflow: hidden !important;
        }
        body.${ACTIVATION_CLASS} #cinematics-container,
        body.${ACTIVATION_CLASS} #cinematics,
        body.${ACTIVATION_CLASS} .player-container-background {
          display: none !important;
        }
        body.${ACTIVATION_CLASS} .html5-video-player {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          padding-bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 100 !important;
        }
        body.${ACTIVATION_CLASS} .html5-video-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        body.${ACTIVATION_CLASS} .video-stream.html5-main-video {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
          border-radius: inherit !important;
        }
        body.${ACTIVATION_CLASS} #ytd-player,
        body.${ACTIVATION_CLASS} #ytd-player.style-scope.ytd-watch-flexy,
        body.${ACTIVATION_CLASS} #movie_player,
        body.${ACTIVATION_CLASS} #movie_player.ytp-fullscreen,
        body.${ACTIVATION_CLASS} .html5-video-player,
        body.${ACTIVATION_CLASS} .html5-video-container {
          border-radius: 0 !important;
        }
        body.${ACTIVATION_CLASS} .ytp-chrome-bottom,
        body.${ACTIVATION_CLASS} .ytp-chrome-top,
        body.${ACTIVATION_CLASS} .ytp-gradient-bottom,
        body.${ACTIVATION_CLASS} .ytp-gradient-top {
          opacity: 1 !important;
          visibility: visible !important;
          z-index: 200 !important;
        }
        body.${ACTIVATION_CLASS} .ytp-chrome-bottom {
          transition: opacity 0.2s ease !important;
        }
        /* Hide page scrollbar while in emulated fullscreen mode without disabling scroll */
        html.${ACTIVATION_CLASS},
        body.${ACTIVATION_CLASS},
        body.${ACTIVATION_CLASS} #primary,
        body.${ACTIVATION_CLASS} #page-manager,
        body.${ACTIVATION_CLASS} ytd-watch-flexy {
          /* Firefox: hide scrollbar visuals while keeping scrolling */
          scrollbar-width: none !important;
          /* IE 10+ */
          -ms-overflow-style: none !important;
        }
        /* For WebKit-based browsers: hide scrollbar but keep scrolling */
        html.${ACTIVATION_CLASS}::-webkit-scrollbar,
        body.${ACTIVATION_CLASS}::-webkit-scrollbar,
        body.${ACTIVATION_CLASS} #primary::-webkit-scrollbar,
        body.${ACTIVATION_CLASS} #page-manager::-webkit-scrollbar,
        body.${ACTIVATION_CLASS} ytd-watch-flexy::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `;

      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
      console.log('[YT Scroll Fix] Definitive CSS styles injected.');
    }

    function whenElementReady(selector, callback, timeout = 5000) {
      const existing = document.querySelector(selector);
      if (existing) {
        callback(existing);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          callback(element);
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });

      if (timeout > 0) {
        setTimeout(() => observer.disconnect(), timeout);
      }
    }

    function toggleScrollMode(forceState) {
      const currentlyActive = document.body.classList.contains(ACTIVATION_CLASS);
      const willActivate = typeof forceState === 'boolean' ? forceState : !currentlyActive;

      if (willActivate === currentlyActive) {
        return;
      }

      document.body.classList.toggle(ACTIVATION_CLASS, willActivate);
      document.documentElement.classList.toggle(ACTIVATION_CLASS, willActivate);

      const primaryHandler = (primary, explicitState) => {
        const active = typeof explicitState === 'boolean' ? explicitState : document.body.classList.contains(ACTIVATION_CLASS);

        if (active) {
          if (!('_origMarginLeft' in primary.dataset)) {
            primary.dataset._origMarginLeft = primary.style.marginLeft || '';
            primary.dataset._origPaddingTop = primary.style.paddingTop || '';
            primary.dataset._origPaddingRight = primary.style.paddingRight || '';
          }

          primary.style.marginLeft = '0px';
          primary.style.paddingTop = '0px';
          primary.style.paddingRight = '0px';
        } else if ('_origMarginLeft' in primary.dataset) {
          primary.style.marginLeft = primary.dataset._origMarginLeft || '';
          primary.style.paddingTop = primary.dataset._origPaddingTop || '';
          primary.style.paddingRight = primary.dataset._origPaddingRight || '';

          delete primary.dataset._origMarginLeft;
          delete primary.dataset._origPaddingTop;
          delete primary.dataset._origPaddingRight;
        }
      };

      const playerHandler = (player, explicitState) => {
        const active = typeof explicitState === 'boolean' ? explicitState : document.body.classList.contains(ACTIVATION_CLASS);

        if (active) {
          if (!('_origTop' in player.dataset)) {
            player.dataset._origTop = player.style.top || '';
          }
          player.style.top = '0px';
        } else if ('_origTop' in player.dataset) {
          player.style.top = player.dataset._origTop || '';
          delete player.dataset._origTop;
        }
      };

      const primary = document.querySelector('#primary');
      if (primary) {
        primaryHandler(primary, willActivate);
      } else if (willActivate) {
        whenElementReady('#primary', (el) => primaryHandler(el, willActivate));
      }

      const player = document.querySelector('#player');
      if (player) {
        playerHandler(player, willActivate);
      } else if (willActivate) {
        whenElementReady('#player', (el) => playerHandler(el, willActivate));
      }

      console.log(`[YT Scroll Fix] F11-mode ${willActivate ? 'activated' : 'deactivated'}.`);
      window.dispatchEvent(new Event('resize'));

      if (extensionApi && extensionApi.runtime && typeof extensionApi.runtime.sendMessage === 'function') {
        const message = { type: 'set-browser-fullscreen', activate: willActivate };

        try {
          const maybePromise = extensionApi.runtime.sendMessage(message, () => {
            const err = extensionApi.runtime && extensionApi.runtime.lastError;
            if (err) {
              console.warn('[YT Scroll Fix] Browser fullscreen sync failed:', err.message || err);
            }
          });

          if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.catch((error) => {
              console.warn('[YT Scroll Fix] Browser fullscreen sync failed:', error);
            });
          }
        } catch (error) {
          console.warn('[YT Scroll Fix] Browser fullscreen sync failed:', error);
        }
      }
    }

    function initializeObserver() {
      const observer = new MutationObserver((mutations, obs) => {
        const fullscreenButton = document.querySelector(".ytp-fullscreen-button.ytp-button");

        if (fullscreenButton) {
          obs.disconnect();

          fullscreenButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            toggleScrollMode();
          }, true);

          console.log('[YT Scroll Fix] Fullscreen button hijack successful.');
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    injectCss();

    const isTypingContext = (element) => {
      if (!element) return false;
      if (element.isContentEditable) return true;
      const tag = element.tagName;
      if (!tag) return false;
      const editableTags = ['INPUT', 'TEXTAREA'];
      if (editableTags.includes(tag)) return true;
      if (element.closest('[contenteditable="true"], [contenteditable=""]')) return true;
      if (tag === 'BUTTON' || tag === 'SELECT') return true;
      return false;
    };

    document.addEventListener('keydown', (event) => {
      const key = (event.key || '').toLowerCase();
      const modifierPressed = event.altKey || event.ctrlKey || event.metaKey;

      if (key === 'escape' && document.body.classList.contains(ACTIVATION_CLASS)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleScrollMode(false);
        return;
      }

      if (key === 'f' && !modifierPressed && !isTypingContext(event.target) && !event.repeat) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleScrollMode();
      }
    }, true);

    const exitFullscreenEmulation = () => {
      if (document.body.classList.contains(ACTIVATION_CLASS)) {
        toggleScrollMode(false);
      }
    };

    const isPlainNavigationClick = (event) => {
      if (event.defaultPrevented) return false;
      if (event.button !== 0) return false;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return false;

      const anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!anchor) return false;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return false;

      const target = (anchor.getAttribute('target') || '').toLowerCase();
      if (target === '_blank') return false;

      return true;
    };

    document.addEventListener('click', (event) => {
      if (!document.body.classList.contains(ACTIVATION_CLASS)) {
        return;
      }

      if (isPlainNavigationClick(event)) {
        exitFullscreenEmulation();
      }
    }, true);

    ['pagehide', 'beforeunload', 'popstate'].forEach((eventName) => {
      window.addEventListener(eventName, exitFullscreenEmulation);
    });

    ['yt-navigate-start', 'yt-navigate-finish', 'yt-page-data-updated'].forEach((eventName) => {
      document.addEventListener(eventName, exitFullscreenEmulation, { capture: true });
    });

    initializeObserver();
  };

  // The DOM may or may not be ready when a document_start script runs.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  } else {
    onDOMContentLoaded();
  }

})();