// =============================================================================
// RESTORE YOUTUBE FULLSCREEN SCROLL - CONTENT SCRIPT
// =============================================================================
//
// Project: Restore YouTube Fullscreen Scroll
// Purpose: Removes problematic attributes that break scrolling in YouTube fullscreen
// Author:  cyberofficial
// GitHub:  https://github.com/cyberofficial/restore-youtube-scroll
//
// WHAT THIS SCRIPT DOES:
// 1. Finds elements with the 'deprecate-fullerscreen-ui' attribute on YouTube pages
// 2. Removes this attribute to restore normal scrolling functionality
// 3. Monitors the page for dynamically added elements and processes them too
// 4. Works automatically without any user interaction required
//
// HOW IT WORKS:
// - YouTube sometimes adds 'deprecate-fullerscreen-ui' to elements in fullscreen mode
// - This attribute can break normal scrolling behavior (mouse wheel, touch, etc.)
// - The script searches for elements with this attribute and removes it
// - A MutationObserver watches for new elements added by YouTube's JavaScript
// - When new elements are detected, the script processes them automatically
//
// SECURITY & PRIVACY:
// - This script only modifies DOM attributes on YouTube pages
// - No data is collected, transmitted, or stored
// - No external network requests are made
// - All operations are local to the user's browser
// - Source code is fully visible and documented
//
// BROWSER COMPATIBILITY:
// - Works in Chrome, Firefox, Edge, and other modern browsers
// - Uses standard Web APIs available in all modern browsers
// - Fallback mechanisms for older browser versions
//
// =============================================================================

// =============================================================================
// MAIN ATTRIBUTE REMOVAL FUNCTION
// =============================================================================

/**
 * Finds and removes the 'deprecate-fullerscreen-ui' attribute from all elements
 * that currently have it on the page. This restores normal scrolling behavior.
 * 
 * The function uses document.querySelectorAll() which is a standard Web API
 * that searches the entire DOM tree for elements matching the specified selector.
 * 
 * @returns {void} No return value - performs DOM modifications in place
 */
function removeDeprecatedAttribute() {
  // Use CSS attribute selector to find all elements with the problematic attribute
  // The selector '[deprecate-fullerscreen-ui]' matches any element that has this attribute,
  // regardless of the attribute's value (which is typically empty anyway)
  const elements = document.querySelectorAll('[deprecate-fullerscreen-ui]');

  // Process each element that was found
  elements.forEach(element => {
    // Remove the problematic attribute using the standard removeAttribute() method
    // This is a safe DOM operation that only affects the specified attribute
    element.removeAttribute('deprecate-fullerscreen-ui');
    
    // Log the action for debugging and transparency
    // This helps developers and users understand what the extension is doing
    // The log message includes the actual element for inspection
    console.log('Removed deprecate-fullerscreen-ui attribute from element:', element);
  });
  
  // If elements were found and processed, log a summary
  if (elements.length > 0) {
    console.log(`YouTube Scroll Restore: Processed ${elements.length} element(s)`);
  }
}

// =============================================================================
// MUTATION OBSERVER INITIALIZATION
// =============================================================================

/**
 * Initializes a MutationObserver to monitor the page for dynamically added elements.
 * YouTube heavily uses JavaScript to modify the page content, especially during
 * navigation and UI updates. This observer ensures we catch new elements that
 * might get the problematic attribute added to them.
 * 
 * The function includes a safety check for document.body availability and will
 * retry initialization if the DOM isn't ready yet.
 * 
 * @returns {void} No return value - sets up ongoing page monitoring
 */
function initializeObserver() {
  // =============================================================================
  // DOM READINESS VERIFICATION
  // =============================================================================
  
  // Ensure document.body exists before attempting to set up the observer
  // In some cases, this script might run before the DOM is fully constructed
  if (!document.body) {
    console.log('YouTube Scroll Restore: document.body not available, retrying in 100ms...');
    // Retry after a short delay to allow the DOM to finish loading
    // 100ms is usually sufficient for basic DOM construction
    setTimeout(initializeObserver, 100);
    return;
  }

  // =============================================================================
  // MUTATION OBSERVER SETUP
  // =============================================================================
  
  /**
   * Create a MutationObserver to watch for DOM changes
   * MutationObserver is a modern Web API that efficiently monitors DOM modifications
   * without the performance overhead of polling or deprecated mutation events
   * 
   * @param {MutationRecord[]} mutations - Array of observed DOM changes
   */
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;

    // Analyze each mutation to determine if we need to check for new problematic attributes
    mutations.forEach((mutation) => {
      // =============================================================================
      // NEW NODE DETECTION
      // =============================================================================
      
      // Check if new elements were added to the DOM
      // YouTube frequently adds new elements during navigation, video loading, etc.
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Filter to only care about element nodes (not text nodes or comments)
        const newElements = Array.from(mutation.addedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE);
        if (newElements.length > 0) {
          shouldCheck = true;
          console.log(`YouTube Scroll Restore: Detected ${newElements.length} new element(s) added to DOM`);
        }
      }
      
      // =============================================================================
      // ATTRIBUTE MODIFICATION DETECTION
      // =============================================================================
      
      // Check if the specific attribute we care about was modified
      // This catches cases where YouTube adds the problematic attribute to existing elements
      else if (mutation.type === 'attributes' && mutation.attributeName === 'deprecate-fullerscreen-ui') {
        shouldCheck = true;
        console.log('YouTube Scroll Restore: Detected deprecate-fullerscreen-ui attribute modification');
      }
    });

    // =============================================================================
    // DEBOUNCED PROCESSING
    // =============================================================================
    
    // If we detected relevant changes, schedule a check for problematic attributes
    if (shouldCheck) {
      // Clear any existing timeout to avoid excessive function calls
      // This debouncing technique prevents the function from running too frequently
      // when many DOM changes happen in rapid succession
      clearTimeout(window.youtubeScrollCheck);
      
      // Schedule the attribute removal function to run after a short delay
      // 100ms debounce gives time for multiple related changes to complete
      window.youtubeScrollCheck = setTimeout(() => {
        console.log('YouTube Scroll Restore: Running scheduled attribute check...');
        removeDeprecatedAttribute();
      }, 100);
    }
  });

  // =============================================================================
  // OBSERVER CONFIGURATION AND ACTIVATION
  // =============================================================================
  
  // Configure the observer to monitor the entire document tree
  // These settings ensure we catch all relevant changes while maintaining good performance
  observer.observe(document.body, {
    childList: true,          // Monitor for added/removed child elements
    subtree: true,           // Monitor the entire document tree, not just direct children
    attributes: true,        // Monitor attribute changes
    attributeFilter: ['deprecate-fullerscreen-ui']  // Only watch for our specific attribute
  });

  console.log('YouTube Scroll Restore: MutationObserver initialized and monitoring page changes');
  console.log('YouTube Scroll Restore: Watching for childList, subtree, and deprecate-fullerscreen-ui attribute changes');
}

// =============================================================================
// SCRIPT INITIALIZATION AND EXECUTION
// =============================================================================

// Immediate execution when the script loads
// At this point, the DOM should be ready (run_at: "document_end" in manifest)
console.log('YouTube Scroll Restore: Content script loaded and initializing...');

// =============================================================================
// INITIAL PAGE SCAN
// =============================================================================

// Run an immediate scan for any elements that already have the problematic attribute
// This handles cases where YouTube has already added the attribute before our script loads
// or when navigating to a page that already has the attribute present
console.log('YouTube Scroll Restore: Performing initial scan for problematic attributes...');
removeDeprecatedAttribute();

// =============================================================================
// ONGOING MONITORING SETUP
// =============================================================================

// Initialize the MutationObserver to monitor for future changes
// This ensures we catch any new elements that get the problematic attribute
// during YouTube's dynamic page updates and navigation
console.log('YouTube Scroll Restore: Setting up continuous monitoring...');
initializeObserver();

// =============================================================================
// INITIALIZATION COMPLETE
// =============================================================================

console.log('YouTube Scroll Restore: Extension fully initialized and ready!');
console.log('YouTube Scroll Restore: Now monitoring for deprecate-fullerscreen-ui attributes...');

// =============================================================================
// ERROR HANDLING AND RECOVERY
// =============================================================================

// Set up a global error handler for this script
// This ensures that any unexpected errors don't break the extension permanently
window.addEventListener('error', function(event) {
  // Only handle errors from our extension code
  if (event.filename && event.filename.includes('content.js')) {
    console.error('YouTube Scroll Restore: Unexpected error occurred:', event.error);
    console.log('YouTube Scroll Restore: Attempting to reinitialize observer...');
    
    // Try to reinitialize the observer in case it was broken
    try {
      setTimeout(() => {
        initializeObserver();
        console.log('YouTube Scroll Restore: Observer reinitialized after error');
      }, 1000);
    } catch (reinitError) {
      console.error('YouTube Scroll Restore: Failed to reinitialize:', reinitError);
    }
  }
});

// =============================================================================
// PERFORMANCE MONITORING (DEVELOPMENT)
// =============================================================================

// Log performance information for debugging and optimization
// This helps identify if the extension is causing any performance issues
if (window.performance && window.performance.now) {
  const startTime = window.performance.now();
  
  // Schedule a performance check after initialization
  setTimeout(() => {
    const endTime = window.performance.now();
    const initTime = Math.round(endTime - startTime);
    console.log(`YouTube Scroll Restore: Initialization completed in ${initTime}ms`);
  }, 200);
}