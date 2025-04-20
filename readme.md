# HolisticTTS

Transform your reading experience with HolisticTTS, the Microsoft Edge extension that brings your text to life with a variety of engaging voices.

Reading large blocks of text can be daunting, especially for those with ADHD. HolisticTTS offers a solution by letting you choose from a range of natural, human-like voices powered by cutting-edge AI services like ElevenLabs. This not only makes the content more engaging but also reduces the friction of reading, turning a once tedious task into an enjoyable experience. Whether you're studying, working, or just browsing, HolisticTTS helps keep you focused and entertained by activating more of your senses.

---

A versatile, modern text-to-speech (TTS) browser extension for Microsoft Edge (and compatible browsers) that supports multiple voice services and convenient features for reading text and PDFs aloud.

## Features

- **Multiple Voice Services:**
  - **Web Speech API**: Uses built-in browser voices for instant TTS.
  - **Hume AI**: Connect your Hume AI API key for advanced neural voices.
  - **ElevenLabs**: (Planned) Support for ElevenLabs API voices.
- **PDF Support:** Upload a PDF and have its text read aloud (using [pdf.js](https://mozilla.github.io/pdf.js/)).
- **Context Menu:** Right-click selected text on any webpage and choose "Read Selected Text with Holistic-TTS" for instant playback.
- **Customizable Playback:** Adjust voice, speed, and service. Download generated audio (for API-based voices).
- **Screen Snippet Capture:** Capture and read text from a screen snippet (planned/experimental).
- **Persistent Preferences:** Remembers your last-used service, voice, and speed.

## Installation

1. **Clone or Download** this repository.
2. In Edge (or Chrome):
    - Go to `edge://extensions` (or `chrome://extensions`).
    - Enable "Developer mode".
    - Click "Load unpacked" and select this project folder.
3. The Holistic-TTS icon should appear in your browser toolbar.

## Usage

1. Click the Holistic-TTS icon to open the popup.
2. Enter or paste text, or upload a PDF.
3. Select your preferred voice service and voice.
4. Adjust speed if desired.
5. Click **Play** to listen, **Pause/Stop** as needed.
6. (Optional) Download the audio (API voices only).

### Using API Voices
- For **Hume AI** or **ElevenLabs** (when available), paste your API key in the provided field and click "Save Key".
- Some features (like download) are only available for API-based voices.

### Context Menu
- Select any text on a webpage, right-click, and choose "Read Selected Text with Holistic-TTS".

## Supported Browsers
- Microsoft Edge (fully supported)
- Google Chrome (should work, but tested primarily on Edge)

## File Overview
- `manifest.json` — Extension manifest (MV3)
- `popup.html` — Main popup UI (Tailwind CSS)
- `popup.js` — All popup logic, TTS handling, API calls, PDF parsing, etc.
- `background.js` — Handles context menu and background tasks
- `content.js` — For future content script features
- `pdf.js` / `pdf.worker.js` — PDF parsing (via pdf.js)
- `icons/` — Extension icons

## Roadmap / TODO
- ElevenLabs API integration
- Improved PDF text extraction
- OCR for screen snippets
- More advanced voice settings
- Options/settings page

## License
MIT License

---

**Holistic-TTS** is not affiliated with Hume AI, ElevenLabs, or any other TTS provider. API keys are stored only in your browser's extension storage.
