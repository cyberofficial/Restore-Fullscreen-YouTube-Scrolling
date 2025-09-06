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
        body.${ACTIVATION_CLASS} ytd-watch-flexy {
          --ytd-watch-flexy-max-player-width: 100% !important;
        }
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

    function toggleScrollMode() {
      const primary = document.querySelector('#primary');

      // Toggle activation class on body
      document.body.classList.toggle(ACTIVATION_CLASS);
      const isActive = document.body.classList.contains(ACTIVATION_CLASS);

  // If #primary exists, store/restore inline styles for margins and padding
  if (primary) {
        // Use dataset to temporarily store original inline styles
        if (isActive) {
          primary.dataset._origMarginLeft = primary.style.marginLeft || '';
          primary.dataset._origPaddingTop = primary.style.paddingTop || '';
          primary.dataset._origPaddingRight = primary.style.paddingRight || '';

          primary.style.marginLeft = '0px';
          primary.style.paddingTop = '0px';
          primary.style.paddingRight = '0px';
        } else {
          primary.style.marginLeft = primary.dataset._origMarginLeft || '';
          primary.style.paddingTop = primary.dataset._origPaddingTop || '';
          primary.style.paddingRight = primary.dataset._origPaddingRight || '';

          delete primary.dataset._origMarginLeft;
          delete primary.dataset._origPaddingTop;
          delete primary.dataset._origPaddingRight;
        }
      }

      // Also handle #player top offset
      const player = document.querySelector('#player');
      if (player) {
        if (isActive) {
          player.dataset._origTop = player.style.top || '';
          player.style.top = '50px';
        } else {
          player.style.top = player.dataset._origTop || '';
          delete player.dataset._origTop;
        }
      }

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