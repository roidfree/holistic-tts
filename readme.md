# 🎙️ HolisticTTS – Browser Extension for Natural Text-to-Speech

**Transform your reading experience with engaging, natural-sounding voices.**  
_HolisticTTS is a Microsoft Edge extension designed to reduce reading friction—perfect for students, professionals, and particularly helpful for users with ADHD._

---

## 🚀 Key Features

- 🌐 **Multiple Voice Services**
  - **Web Speech API**: Instantly available, offline support in your browser.
  - **Hume AI**: Emotionally expressive, high-quality neural voices.
  - **ElevenLabs**: Realistic voices, multilingual support, and custom voice cloning.

- 📚 **PDF Support**
  - Upload PDFs to have HolisticTTS read them aloud for easy studying or document review.

- 🖱️ **Context Menu Integration**
  - Right-click selected text on any webpage to instantly hear it read aloud.

- 🎛️ **Customizable Playback**
  - Adjust voice selection, speech speed, and choose your preferred TTS service.
  - Download audio files (available for API-based voices).

- 📸 **Screen Snippet Capture (experimental)**
  - Capture and instantly read text snippets from your screen (OCR integration coming soon).

- 🔒 **Persistent Preferences**
  - Remembers your last-used voice, speed, and preferred service automatically.

---

## 🛠️ Installation

1. **Clone or download** the repository:

    ```bash
    git clone https://github.com/your-username/holistic-tts.git
    ```

2. In **Microsoft Edge** (or Chrome):
    - Navigate to `edge://extensions` (or `chrome://extensions`).
    - Enable **Developer mode**.
    - Click **"Load unpacked"** and select your downloaded repository folder.

3. The HolisticTTS icon will appear in your browser's toolbar. 🎉

---

## 🔑 Acquiring Your API Key

To utilize advanced neural voices (Hume AI or ElevenLabs), you’ll need to set up API keys.

### 🧠 Hume AI API Key

1. Sign up at [Hume AI](https://hume.ai).
2. Visit your dashboard and locate the **API Keys** section.
3. Generate an API key, copy it, and paste it into the HolisticTTS extension under:
   - **Voice Service → Hume AI → API Key**

### 🔈 ElevenLabs API Key

1. Create an account at [ElevenLabs](https://elevenlabs.io).
2. Go to your **Profile → API** tab.
3. Generate a new API key, copy it, and paste it into HolisticTTS settings:
   - **Voice Service → ElevenLabs → API Key**

---

## 🚦 Quick Start

1. Click the HolisticTTS icon in your browser toolbar.
2. Paste or type text (or upload a PDF).
3. Select your TTS service, voice, and preferred speed.
4. Click **Play** ▶️ and enjoy hands-free listening!

---

## 🎧 Downloading Audio (Premium Voices)

Audio generated via **Hume AI** or **ElevenLabs** can be directly downloaded from the extension popup—great for podcasts, audiobooks, or offline listening.

---

## 🌟 Supported Browsers

- ✅ **Microsoft Edge** (Fully Supported)
- ✅ **Google Chrome** (Tested, Compatible)

---

## 💖 Support & Contribute

- Found this helpful? Consider starring ⭐ the repository.
- **Pull requests**, **issues**, and **feature suggestions** are warmly welcomed!

---

## 📂 Project Structure

holistic-tts/
├── background.js # Handles context menus & background tasks
├── content.js # Injected content script for page interaction
├── manifest.json # Extension manifest (MV3)
├── popup.html # Main UI of the extension
├── popup.js # Popup logic (voices, API calls, PDF handling)
├── pdf.js # PDF text extraction (via pdf.js)
├── pdf.worker.js # PDF.js worker script
├── icons/ # Extension icons 
└── README.md # Project overview (this file)

---

## 🗓️ Roadmap

Upcoming features planned:

- ✅ Improved PDF text extraction
- ⏳ OCR support for screen snippet capture
- ⏳ More advanced voice customization settings
- ⏳ Dedicated options/settings page

---

## 📄 License

MIT License – see the [`LICENSE`](LICENSE) file for details.

---

**HolisticTTS** is not affiliated with Hume AI or ElevenLabs. All API keys remain securely stored locally in your browser extension storage.