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
        body.${ACTIVATION_CLASS} ytd-masthead,
        body.${ACTIVATION_CLASS} #secondary.ytd-watch-flexy {
          display: none !important;
        }
        body.${ACTIVATION_CLASS} #page-manager.ytd-app {
          margin-top: 0 !important;
        }
        body.${ACTIVATION_CLASS} #columns,
        body.${ACTIVATION_CLASS} #primary {
          max-width: none !important;
        }
        body.${ACTIVATION_CLASS} #player.ytd-watch-flexy {
          height: 100vh !important;
        }
        body.${ACTIVATION_CLASS} .html5-video-player,
        body.${ACTIVATION_CLASS} .html5-video-container,
        body.${ACTIVATION_CLASS} .video-stream.html5-main-video {
          width: 100% !important;
          height: 100% !important;
          left: 0 !important;
          top: 0 !important;
        }
      `;

      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
      console.log('[YT Scroll Fix] Definitive CSS styles injected.');
    }

    function toggleScrollMode() {
      document.body.classList.toggle(ACTIVATION_CLASS);
      const isActive = document.body.classList.contains(ACTIVATION_CLASS);
      console.log(`[YT Scroll Fix] F11-mode ${isActive ? 'activated' : 'deactivated'}.`);
      window.dispatchEvent(new Event('resize'));
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
    
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains(ACTIVATION_CLASS)) {
        toggleScrollMode();
      }
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