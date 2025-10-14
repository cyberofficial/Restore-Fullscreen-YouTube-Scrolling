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
    const debugMode = (() => {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get('debugscrollext') === 'true';
      } catch (error) {
        return false;
      }
    })();

  const debugLogBuffer = [];
  const DEBUG_LOG_BUFFER_LIMIT = 2000;
  const SAVE_LOG_BUTTON_ID = 'yt-scroll-save-log-button';

    const stringifyDebugArg = (value) => {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
      if (value instanceof Error) {
        return `${value.name}: ${value.message}`;
      }
      try {
        return JSON.stringify(value);
      } catch (error) {
        return Object.prototype.toString.call(value);
      }
    };

    const appendDebugLogEntry = (args) => {
      const timestamp = new Date().toISOString();
      const message = args.map(stringifyDebugArg).join(' ');
      debugLogBuffer.push(`[${timestamp}] ${message}`);
      if (debugLogBuffer.length > DEBUG_LOG_BUFFER_LIMIT) {
        debugLogBuffer.splice(0, debugLogBuffer.length - DEBUG_LOG_BUFFER_LIMIT);
      }
    };

    const getDebugLogText = () => debugLogBuffer.join('\n');

    const downloadDebugLog = () => {
      const content = getDebugLogText();
      const blob = new Blob([content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      anchor.href = url;
      anchor.download = `yt-scroll-log-${timestamp}.log`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      requestAnimationFrame(() => URL.revokeObjectURL(url));
      debugLog('Log download triggered', { entries: debugLogBuffer.length });
    };

    const debugLog = (...args) => {
      if (!debugMode) return;
      appendDebugLogEntry(args);
      console.log('[YT Scroll Fix][debug]', ...args);
    };

    const computeXPath = (element) => {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }
      const segments = [];
      let node = element;
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.localName;
        if (!tagName) {
          break;
        }
        let index = 1;
        let sibling = node.previousElementSibling;
        while (sibling) {
          if (sibling.localName === tagName) {
            index += 1;
          }
          sibling = sibling.previousElementSibling;
        }
        segments.unshift(`${tagName}[${index}]`);
        node = node.parentElement;
      }
      return segments.length ? `/${segments.join('/')}` : null;
    };

    const DEBUG_METRIC_SELECTORS = [
      '.ytp-chrome-bottom',
      '.ytp-progress-bar-container',
      '.ytp-progress-bar',
      '.ytp-progress-list',
      '.ytp-chapter-hover-container',
      '.ytp-play-progress',
      '.ytp-load-progress',
      '.ytp-hover-progress',
      '.ytp-scrubber-container',
      '.ytp-scrubber-button',
      '.ytp-fine-scrubbing-draggable'
    ];

    const collectControlMetrics = () => {
      return DEBUG_METRIC_SELECTORS.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) {
          return { selector, exists: false };
        }
        const rect = element.getBoundingClientRect();
        return {
          selector,
          exists: true,
          xpath: computeXPath(element),
          rect: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom)
          },
          inlineStyle: element.getAttribute('style') || '',
          dataset: { ...element.dataset }
        };
      });
    };

    const createSaveLogButton = () => {
      const container = document.createElement('div');
      container.className = 'item style-scope ytd-watch-metadata yt-scroll-save-log-container';

      const button = document.createElement('button');
      button.id = SAVE_LOG_BUTTON_ID;
      button.type = 'button';
      button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--enable-backdrop-filter-experiment';
      button.textContent = 'Save Log';
      button.title = 'Download debug log';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        downloadDebugLog();
      });

      container.appendChild(button);
      return container;
    };

    const ensureSaveLogButton = () => {
      if (!debugMode) {
        return;
      }
      whenElementReady('#top-row', (topRow) => {
        if (!topRow || topRow.querySelector(`#${SAVE_LOG_BUTTON_ID}`)) {
          return;
        }
        const buttonContainer = createSaveLogButton();
        topRow.appendChild(buttonContainer);
        debugLog('Save Log button injected');
      }, 8000);
    };

    if (debugMode) {
      debugLog('Debug mode enabled via debugscrollext URL parameter.');
      window.YTScrollDebug = {
        collectControlMetrics,
        logControlMetrics: () => debugLog('Control metrics snapshot', collectControlMetrics()),
        computeXPath,
        getLogText: getDebugLogText,
        downloadLog: downloadDebugLog
      };
      debugLog('Initial control metrics', collectControlMetrics());
      ensureSaveLogButton();
    }

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
        body.${ACTIVATION_CLASS} ytd-masthead {
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
        body.${ACTIVATION_CLASS} #columns.ytd-watch-flexy {
          display: grid !important;
          grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr) !important;
          grid-template-rows:
            [player-start] auto
            [player-end metadata-start] auto
            [metadata-end comments-start] auto
            [comments-end] !important;
          grid-auto-rows: auto !important;
          align-items: flex-start !important;
          column-gap: 24px !important;
          row-gap: 24px !important;
        }
        body.${ACTIVATION_CLASS} #primary.ytd-watch-flexy,
        body.${ACTIVATION_CLASS} #primary-inner.ytd-watch-flexy {
          display: contents !important;
          min-width: 0 !important;
        }
        body.${ACTIVATION_CLASS} #primary-inner.ytd-watch-flexy > *:not(#comments) {
          grid-column: 1 / -1 !important;
        }
        body.${ACTIVATION_CLASS} #below {
          display: contents !important;
        }
        body.${ACTIVATION_CLASS} #below > *:not(ytd-comments) {
          grid-column: 1 / -1 !important;
        }
        body.${ACTIVATION_CLASS} ytd-watch-metadata.watch-active-metadata {
          grid-column: 1 / -1 !important;
          grid-row: metadata-start / metadata-end !important;
          padding: 22px !important;
          box-sizing: border-box !important;
        }
        body.${ACTIVATION_CLASS} #comments,
        body.${ACTIVATION_CLASS} ytd-comments {
          grid-column: 1 / 2 !important;
          grid-row: comments-start / comments-end !important;
          min-width: 0 !important;
          min-height: 0 !important;
          align-self: stretch !important;
          overflow-y: auto !important;
          scrollbar-width: thin !important;
          padding: 22px !important;
          box-sizing: border-box !important;
        }
        body.${ACTIVATION_CLASS} #comments::-webkit-scrollbar,
        body.${ACTIVATION_CLASS} ytd-comments::-webkit-scrollbar {
          width: 6px !important;
        }
        body.${ACTIVATION_CLASS} #comments::-webkit-scrollbar-thumb,
        body.${ACTIVATION_CLASS} ytd-comments::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.3) !important;
          border-radius: 3px !important;
        }
        body.${ACTIVATION_CLASS} #secondary.ytd-watch-flexy {
          grid-column: 2 / 3 !important;
          grid-row: comments-start / comments-end !important;
          min-width: 0 !important;
          min-height: 0 !important;
          align-self: start !important;
          overflow-y: auto !important;
          padding: 22px !important;
          box-sizing: border-box !important;
        }
        body.${ACTIVATION_CLASS} #secondary-inner,
        body.${ACTIVATION_CLASS} #related {
          min-height: 0 !important;
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
          background-color: #000 !important;
        }
        body.${ACTIVATION_CLASS} #ytd-player,
        body.${ACTIVATION_CLASS} #ytd-player.style-scope.ytd-watch-flexy,
        body.${ACTIVATION_CLASS} #movie_player,
        body.${ACTIVATION_CLASS} #movie_player.ytp-fullscreen,
        body.${ACTIVATION_CLASS} .html5-video-player,
        body.${ACTIVATION_CLASS} .html5-video-container {
          border-radius: 0 !important;
        }
        body.${ACTIVATION_CLASS} .ytp-progress-bar-padding {
          margin: 0 !important;
        }
        body.${ACTIVATION_CLASS} .ytp-fine-scrubbing-draggable {
          padding: 0 !important;
        }
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

    const isWatchUrl = (value) => {
      try {
        const url = new URL(value, window.location.origin);
        return url.hostname.includes('youtube.com') && url.pathname === '/watch';
      } catch (error) {
        return false;
      }
    };

    const isShortsUrl = (value) => {
      try {
        const url = new URL(value, window.location.origin);
        return url.hostname.includes('youtube.com') && url.pathname.startsWith('/shorts');
      } catch (error) {
        return false;
      }
    };

    const CONTROL_DATA_KEY = 'fullscreenControlSnapshot';
    const CHROME_TARGETS = [
      {
        selector: '.ytp-chrome-bottom',
        styles: () => ({ left: '0px', right: '0px', width: '100%', maxWidth: '100%' })
      },
      {
        selector: '.ytp-chrome-top',
        styles: () => ({ left: '0px', right: '0px', width: '100%', maxWidth: '100%' })
      }
    ];
    const STATIC_CONTROL_TARGETS = [
      {
        selector: '.ytp-progress-bar-padding',
        styles: () => ({ margin: '0px' })
      },
      {
        selector: '.ytp-fine-scrubbing-draggable',
        styles: () => ({ padding: '0px' })
      }
    ];
    const PROGRESS_CONTAINER_SELECTOR = '.ytp-progress-bar-container';
  const PROGRESS_STYLE_PROPERTIES = ['left', 'right', 'width', 'max-width', 'transform', 'transform-origin'];
    const PROGRESS_SCALE_ATTR = 'fullscreenProgressScale';
    const PROGRESS_BASE_WIDTH_ATTR = 'fullscreenProgressBaseWidth';
    const PROGRESS_BASE_LEFT_ATTR = 'fullscreenProgressBaseLeft';
    const PROGRESS_PREFERRED_BASE_SELECTORS = [
      '.ytp-progress-list',
      '.ytp-chapter-hover-container',
      '.ytp-progress-bar'
    ];

    let controlResizeHandler = null;
    let resizeQueued = false;
    let skipNextResize = false;
    let syntheticResizePending = false;

    const captureOriginalStyles = (element, styles) => {
      if (element.dataset[CONTROL_DATA_KEY]) {
        return;
      }
      const snapshot = {};
      Object.keys(styles).forEach((property) => {
        snapshot[property] = {
          value: element.style.getPropertyValue(property) || '',
          priority: element.style.getPropertyPriority(property) || ''
        };
      });
      element.dataset[CONTROL_DATA_KEY] = JSON.stringify(snapshot);
    };

    const restoreOriginalStyles = (element) => {
      const snapshotRaw = element.dataset[CONTROL_DATA_KEY];
      if (!snapshotRaw) {
        return;
      }
      try {
        const snapshot = JSON.parse(snapshotRaw);
        Object.entries(snapshot).forEach(([property, info]) => {
          const { value, priority } = info || {};
          if (value) {
            element.style.setProperty(property, value, priority || undefined);
          } else {
            element.style.removeProperty(property);
          }
        });
      } catch (error) {
        console.warn('[YT Scroll Fix] Failed to restore control styles:', error);
      }
      delete element.dataset[CONTROL_DATA_KEY];
    };

    const getPlayerWidth = () => {
      const playerContainer = document.querySelector('#player-container');
      if (playerContainer) {
        const rect = playerContainer.getBoundingClientRect();
        if (rect && rect.width) {
          return Math.round(rect.width);
        }
      }
      return Math.round(window.innerWidth || document.documentElement.clientWidth || 0);
    };

    const applyProgressScaling = (playerWidth) => {
      document.querySelectorAll(PROGRESS_CONTAINER_SELECTOR).forEach((element) => {
        const captureTemplate = PROGRESS_STYLE_PROPERTIES.reduce((acc, property) => {
          acc[property] = '';
          return acc;
        }, {});
        captureOriginalStyles(element, captureTemplate);

        const rect = element.getBoundingClientRect();
        const previousScale = parseFloat(element.dataset[PROGRESS_SCALE_ATTR] || '1') || 1;
        let baseWidth = parseFloat(element.dataset[PROGRESS_BASE_WIDTH_ATTR] || '');
        let effectiveWidth = 0;
        if (!baseWidth || Number.isNaN(baseWidth)) {
          for (const selector of PROGRESS_PREFERRED_BASE_SELECTORS) {
            const internal = element.querySelector(selector);
            if (internal) {
              const internalRect = internal.getBoundingClientRect();
              if (internalRect && internalRect.width) {
                effectiveWidth = internalRect.width;
                break;
              }
            }
          }
          if (!effectiveWidth) {
            effectiveWidth = rect.width || 0;
          }
          baseWidth = previousScale > 0 ? effectiveWidth / previousScale : effectiveWidth;
          if (!baseWidth || Number.isNaN(baseWidth)) {
            baseWidth = effectiveWidth || playerWidth;
          }
          element.dataset[PROGRESS_BASE_WIDTH_ATTR] = String(baseWidth);
        } else {
          effectiveWidth = baseWidth;
        }

        let baseLeft = element.dataset[PROGRESS_BASE_LEFT_ATTR];
        if (baseLeft === undefined || baseLeft === null || baseLeft === '') {
          const computedLeft = parseFloat(getComputedStyle(element).left) || 0;
          baseLeft = String(computedLeft);
          element.dataset[PROGRESS_BASE_LEFT_ATTR] = baseLeft;
        }

        const numericBaseLeft = parseFloat(baseLeft) || 0;

        if (!baseWidth) {
          return;
        }

        const computedScale = baseWidth > 0 ? playerWidth / baseWidth : 1;

        element.style.setProperty('left', '0px', 'important');
        element.style.setProperty('right', 'auto', 'important');
        element.style.setProperty('width', `${playerWidth}px`, 'important');
        element.style.setProperty('max-width', `${playerWidth}px`, 'important');
        element.style.setProperty('transform-origin', 'left center', 'important');
        element.style.setProperty('transform', 'none', 'important');

        element.dataset[PROGRESS_BASE_WIDTH_ATTR] = String(playerWidth);
        baseWidth = playerWidth;
        effectiveWidth = playerWidth;
        element.dataset[PROGRESS_SCALE_ATTR] = '1';

        debugLog('Progress container scaled', {
          selector: PROGRESS_CONTAINER_SELECTOR,
          playerWidth,
          baseWidth,
          effectiveWidth,
          baseLeft: numericBaseLeft,
          scale: computedScale,
          rectWidth: rect.width
        });

        if (debugMode) {
          debugLog('Control metrics snapshot', collectControlMetrics());
        }
      });
    };

    const scheduleSyntheticResize = () => {
      if (syntheticResizePending) {
        return;
      }
      syntheticResizePending = true;
      requestAnimationFrame(() => {
        syntheticResizePending = false;
        skipNextResize = true;
        window.dispatchEvent(new Event('resize'));
      });
    };

    const applyControlAdjustments = ({ suppressRemeasure = false } = {}) => {
      const playerWidth = getPlayerWidth();
      debugLog('Applying control adjustments', { playerWidth });

      applyProgressScaling(playerWidth);

      [...CHROME_TARGETS, ...STATIC_CONTROL_TARGETS].forEach(({ selector, styles }) => {
        const computedStyles = typeof styles === 'function' ? styles(playerWidth) : styles;
        document.querySelectorAll(selector).forEach((element) => {
          captureOriginalStyles(element, computedStyles);
          Object.entries(computedStyles).forEach(([property, value]) => {
            element.style.setProperty(property, value, 'important');
          });
        });
      });

      if (!suppressRemeasure) {
        scheduleSyntheticResize();
      }

      debugLog('Control adjustments complete');
    };

    const clearControlAdjustments = () => {
      debugLog('Clearing control adjustments');
      [...CHROME_TARGETS, ...STATIC_CONTROL_TARGETS].forEach(({ selector }) => {
        document.querySelectorAll(selector).forEach((element) => {
          restoreOriginalStyles(element);
        });
      });

      document.querySelectorAll(PROGRESS_CONTAINER_SELECTOR).forEach((element) => {
        restoreOriginalStyles(element);
        delete element.dataset[PROGRESS_SCALE_ATTR];
        delete element.dataset[PROGRESS_BASE_WIDTH_ATTR];
        delete element.dataset[PROGRESS_BASE_LEFT_ATTR];
      });
    };

    const setControlAdjustmentState = (active) => {
      debugLog('setControlAdjustmentState invoked', { active });
      if (active) {
        applyControlAdjustments();
        if (!controlResizeHandler) {
          controlResizeHandler = () => {
            if (!document.body.classList.contains(ACTIVATION_CLASS)) {
              return;
            }
            if (skipNextResize) {
              skipNextResize = false;
              return;
            }
            if (resizeQueued) {
              return;
            }
            resizeQueued = true;
            requestAnimationFrame(() => {
              resizeQueued = false;
              debugLog('Resize triggered reapplication of control adjustments.');
              applyControlAdjustments({ suppressRemeasure: true });
            });
          };
          window.addEventListener('resize', controlResizeHandler);
        }
      } else {
        if (controlResizeHandler) {
          window.removeEventListener('resize', controlResizeHandler);
          controlResizeHandler = null;
        }
        clearControlAdjustments();
      }
    };

    let pendingWatchNavigation = false;
    let pendingWatchTimeout = null;

    const markPendingWatchNavigation = () => {
      pendingWatchNavigation = true;
      if (pendingWatchTimeout) {
        clearTimeout(pendingWatchTimeout);
      }
      pendingWatchTimeout = setTimeout(() => {
        pendingWatchNavigation = false;
        pendingWatchTimeout = null;
      }, 5000);
    };

    const clearPendingWatchNavigation = () => {
      if (pendingWatchTimeout) {
        clearTimeout(pendingWatchTimeout);
        pendingWatchTimeout = null;
      }
      pendingWatchNavigation = false;
    };

    function toggleScrollMode(forceState) {
      const currentlyActive = document.body.classList.contains(ACTIVATION_CLASS);
      const willActivate = typeof forceState === 'boolean' ? forceState : !currentlyActive;

      debugLog('toggleScrollMode call', {
        forceState,
        currentlyActive,
        willActivate,
        url: window.location.href
      });

      if (willActivate === currentlyActive) {
        return;
      }

      if (willActivate && (!isWatchUrl(window.location.href) || isShortsUrl(window.location.href))) {
        return;
      }

      document.body.classList.toggle(ACTIVATION_CLASS, willActivate);
      document.documentElement.classList.toggle(ACTIVATION_CLASS, willActivate);

      debugLog('Activation class toggled', {
        bodyHasClass: document.body.classList.contains(ACTIVATION_CLASS)
      });

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

      setControlAdjustmentState(willActivate);
      if (willActivate) {
        whenElementReady('.ytp-chrome-bottom', () => {
          if (document.body.classList.contains(ACTIVATION_CLASS)) {
            debugLog('Progress controls ready; applying adjustments.');
            applyControlAdjustments();
          }
        });
      }

  console.log(`[YT Scroll Fix] F11-mode ${willActivate ? 'activated' : 'deactivated'}.`);
  scheduleSyntheticResize();

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

    document.addEventListener('dblclick', (event) => {
      if (!isWatchUrl(window.location.href) || isShortsUrl(window.location.href) || isTypingContext(event.target)) {
        return;
      }
      const videoElement = event.target.closest('.html5-main-video, .video-stream');
      if (videoElement) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleScrollMode();
      }
    }, true);

    document.addEventListener('keydown', (event) => {
      const key = (event.key || '').toLowerCase();
      const modifierPressed = event.altKey || event.ctrlKey || event.metaKey;

      if (key === 'escape' && document.body.classList.contains(ACTIVATION_CLASS)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleScrollMode(false);
        return;
      }

      if (key === 'f' && !modifierPressed && !event.repeat) {
        if (!isWatchUrl(window.location.href) || isShortsUrl(window.location.href) || isTypingContext(event.target)) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleScrollMode();
      }
    }, true);

    const exitFullscreenEmulation = (options = {}) => {
      const { ignorePersistence = false } = options;

      if (!ignorePersistence) {
        if (pendingWatchNavigation) {
          return;
        }

        if (isWatchUrl(window.location.href)) {
          return;
        }
      }

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
        const href = event.target.closest('a[href]').href;

        if (href && isWatchUrl(href)) {
          markPendingWatchNavigation();
        } else {
          clearPendingWatchNavigation();
          exitFullscreenEmulation({ ignorePersistence: true });
        }
      }
    }, true);

    window.addEventListener('pagehide', () => {
      exitFullscreenEmulation();
    });

    window.addEventListener('beforeunload', () => {
      exitFullscreenEmulation({ ignorePersistence: true });
    });

    window.addEventListener('popstate', () => {
      if (isWatchUrl(window.location.href)) {
        markPendingWatchNavigation();
      } else {
        clearPendingWatchNavigation();
        exitFullscreenEmulation({ ignorePersistence: true });
      }
    });

    const handleYoutubeNavigation = () => {
      if (isWatchUrl(window.location.href)) {
        markPendingWatchNavigation();
        if (debugMode) {
          ensureSaveLogButton();
        }
      } else {
        if (isShortsUrl(window.location.href)) {
          exitFullscreenEmulation({ ignorePersistence: true });
          return;
        }
        clearPendingWatchNavigation();
        exitFullscreenEmulation({ ignorePersistence: true });
      }
    };

    document.addEventListener('yt-navigate-finish', handleYoutubeNavigation, { capture: true });
    document.addEventListener('yt-page-data-updated', handleYoutubeNavigation, { capture: true });

    initializeObserver();
  };

  // The DOM may or may not be ready when a document_start script runs.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  } else {
    onDOMContentLoaded();
  }

})();