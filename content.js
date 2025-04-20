// content_script.js

// Debug: content script loaded
console.log('[Holistic-TTS] content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Holistic-TTS] onMessage received:', request);

  if (request.action === 'readSelection' && request.text) {
    // Use Web Speech API directly, using provided voiceURI if present
    const speakWebSpeech = (voiceURI) => {
      const utter = new SpeechSynthesisUtterance(request.text);
      // Fetch speed from storage (or default)
      chrome.storage.sync.get(['ttsSpeed'], prefs => {
        utter.rate = parseFloat(prefs.ttsSpeed) || 1.0;
        // Use provided voiceURI if present, otherwise use saved
        const voices = speechSynthesis.getVoices();
        const match = voices.find(v => v.voiceURI === (request.voiceURI || null));
        if (match) utter.voice = match;
        speechSynthesis.speak(utter);
        speechSynthesis.onvoiceschanged = null;
      });
    };
    if (speechSynthesis.getVoices().length) {
      speakWebSpeech(request.voiceURI);
    } else {
      speechSynthesis.onvoiceschanged = () => speakWebSpeech(request.voiceURI);
    }
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
  // Handle ElevenLabs audio ready from background
  else if (request.action === 'elevenAudioReady' && (request.audioBase64 || request.audioUrl)) {
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
    console.log('[Holistic-TTS] playing ElevenLabs audio:', audioUrl);
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
        console.error("[Holistic-TTS] audio playback failed:", err);
      }
    });
  }
});
