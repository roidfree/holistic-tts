// content_script.js

// Debug: content script loaded
console.log('[Holistic-TTS] content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Holistic-TTS] onMessage received:', request);

  if (request.action === 'readSelection' && request.text) {
    // Fetch user preferences
    chrome.storage.sync.get(['ttsSpeed', 'ttsVoiceURI', 'ttsService'], prefs => {
      console.log('[Holistic-TTS] TTS service:', prefs.ttsService);

      // --- Web Speech API path ---
      if (!prefs.ttsService || prefs.ttsService === 'webSpeech') {
        const speakWebSpeech = () => {
          const utter = new SpeechSynthesisUtterance(request.text);
          utter.rate = parseFloat(prefs.ttsSpeed) || 1.0;

          // Use saved voice if available
          const voices = speechSynthesis.getVoices();
          const match = voices.find(v => v.voiceURI === prefs.ttsVoiceURI);
          if (match) utter.voice = match;

          speechSynthesis.speak(utter);
          // Clean up voiceschanged listener
          speechSynthesis.onvoiceschanged = null;
        };

        if (speechSynthesis.getVoices().length) {
          speakWebSpeech();
        } else {
          speechSynthesis.onvoiceschanged = speakWebSpeech;
        }
      }
      // --- Hume AI path ---
      else if (prefs.ttsService === 'humeAI') {
        chrome.runtime.sendMessage({ action: 'speakWithHumeAI', text: request.text });
      }
      // --- ElevenLabs placeholder ---
      else if (prefs.ttsService === 'elevenLabs') {
        chrome.runtime.sendMessage({ action: 'speakWithElevenLabs', text: request.text });
      }
    });

  }
  // Handle Hume AI audio ready from background
  else if (request.action === 'humeAudioReady' && (request.audioBase64 || request.audioUrl)) {
    let audioUrl = request.audioUrl;
    if (request.audioBase64) {
      // Convert base64 to Blob and create object URL
      const byteChars = atob(request.audioBase64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      audioUrl = URL.createObjectURL(blob);
    }
    console.log('[Holistic-TTS] playing Hume audio:', audioUrl);
    const audio = new Audio(audioUrl);

    // Apply saved playback speed
    chrome.storage.sync.get('ttsSpeed', prefs => {
      const speed = parseFloat(prefs.ttsSpeed) || 1.0;
      audio.playbackRate = speed;

      // Revoke URL after playback
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });

      // Play with error handling
      try {
        audio.play();
      } catch (err) {
        console.error('[Holistic-TTS] audio playback failed:', err);
      }
    });
  }
});
