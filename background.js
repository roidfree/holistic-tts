chrome.runtime.onInstalled.addListener(() => {
  console.log('Holistic-TTS background service worker installed.');
  // Initialize context menus or other setup here if needed

  // Remove previous menu items if they exist (useful during development)
  chrome.contextMenus.removeAll(() => {
      // Add context menu item
      chrome.contextMenus.create({
          id: "readSelectedText",
          title: "Read Selected Text with Holistic-TTS",
          contexts: ["selection"]
      });
  });
});

// Listener for messages from popup or content scripts (if needed later)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  // Example: Handle requests from popup if needed
  // if (request.action === "getSettings") { ... }
  return true; // Keep open for async response if needed
});

// Listener for Context Menu Click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readSelectedText" && info.selectionText) {
    console.log('Context menu sending text to popup:', info.selectionText);
    // Send a message to the popup script with the selected text
    chrome.runtime.sendMessage({
        action: "readContextMenuText",
        text: info.selectionText
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.log("Popup not open or ready to receive message.");
            // Optional: Store the text temporarily if popup wasn't open?
            // Or maybe just focus on the case where the popup IS open for now.
        } else {
            console.log("Message sent to popup, response:", response);
        }
    });
    // Note: Web Speech API cannot be reliably initiated directly from a background
    // service worker in Manifest V3 without an offscreen document or other workarounds.
    // Sending to the popup is the more straightforward approach for now.
  }
}); 