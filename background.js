// Add context menu for selected text
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read-selected-text",
    title: "Read",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "read-selected-text" && info.selectionText) {
    handleHumeAIRequest(info.selectionText);
  }
});

// Helper to fetch preferences from storage
function getPrefs(keys) {
  return new Promise(resolve => {
    chrome.storage.sync.get(keys, resolve);
  });
}

async function handleHumeAIRequest(text) {
  // 1. Get prefs
  const { humeApiKey: apiKey, ttsSpeed } = await getPrefs(["humeApiKey","ttsSpeed"]);
  if (!apiKey) return console.error("No Hume key");
  if (!text || typeof text !== "string" || !text.trim()) {
    return console.error("No or empty text provided to Hume API");
  }
  if (text.length > 1000) {
    console.warn("Text too long for Hume API, truncating to 1000 characters");
    text = text.slice(0, 1000);
  }
  console.log("[Holistic-TTS] Hume API key present:", !!apiKey);
  console.log("[Holistic-TTS] Input text:", text);

  // 2. Build payload
  const payload = {
    utterances: [{ text, speed: parseFloat(ttsSpeed) || 1.0 }],
    format: { type: "mp3", sample_rate: 48000 },
    num_generations: 1
  };
  console.log("[Holistic-TTS] Hume API payload:", payload);

  try {
    // 3. Fetch
    const resp = await fetch("https://api.hume.ai/v0/tts", {
      method: "POST",
      headers: {
        "Content-Type":   "application/json",
        "X-Hume-Api-Key": apiKey
      },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      let errText = await resp.text();
      console.error("[Holistic-TTS] Hume API error response:", errText);
      throw new Error(`Hume ${resp.status}`);
    }

    // 4. Decode
    const { generations } = await resp.json();
    const gen = generations?.[0];
    if (!gen?.audio) throw new Error("No audio returned");

    // Send base64 audio to content script (URL.createObjectURL not available in service worker)
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action:   "humeAudioReady",
          audioBase64: gen.audio // base64 string
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn('[Holistic-TTS] Could not send audio to content script:', chrome.runtime.lastError.message);
          }
        }
      );
    });
  } catch (err) {
    console.error("Hume TTS error:", err);
    // TODO: chrome.notifications.create or messaging for UI feedback
  }
}
