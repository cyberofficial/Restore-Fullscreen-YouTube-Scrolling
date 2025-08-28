// Content script to remove deprecate-fullerscreen-ui attribute from YouTube elements

function removeDeprecatedAttribute() {
  // Find all elements with the deprecate-fullerscreen-ui attribute
  const elements = document.querySelectorAll('[deprecate-fullerscreen-ui]');

  elements.forEach(element => {
    // Remove the attribute
    element.removeAttribute('deprecate-fullerscreen-ui');
    console.log('Removed deprecate-fullerscreen-ui attribute from element:', element);
  });
}

// Function to initialize the MutationObserver
function initializeObserver() {
  // Make sure document.body exists before setting up observer
  if (!document.body) {
    console.log('document.body not available, retrying...');
    setTimeout(initializeObserver, 100);
    return;
  }

  // Use MutationObserver to handle dynamically added elements
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;

    mutations.forEach((mutation) => {
      // Check if new nodes were added
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldCheck = true;
      }
      // Check if attributes were modified
      else if (mutation.type === 'attributes' && mutation.attributeName === 'deprecate-fullerscreen-ui') {
        shouldCheck = true;
      }
    });

    if (shouldCheck) {
      // Debounce the check to avoid excessive calls
      clearTimeout(window.youtubeScrollCheck);
      window.youtubeScrollCheck = setTimeout(removeDeprecatedAttribute, 100);
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['deprecate-fullerscreen-ui']
  });

  console.log('MutationObserver initialized for YouTube scroll restoration');
}

// Run when the script loads (DOM should be ready now)
removeDeprecatedAttribute();

// Initialize the observer
initializeObserver();