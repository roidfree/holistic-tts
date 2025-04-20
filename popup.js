// Logic for popup.html will go here

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const stopButton = document.getElementById('stop-button');
    const downloadButton = document.getElementById('download-button');
    const speedSlider = document.getElementById('speed-slider');
    const speedLabel = document.getElementById('speed-label');
    const voiceServiceSelect = document.getElementById('voice-service');
    const voiceSelect = document.getElementById('voice-select');
    const apiKeySection = document.getElementById('api-key-section');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKeyLabel = document.getElementById('api-key-label');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const pdfUpload = document.getElementById('pdf-upload');
    const snippetButton = document.getElementById('snippet-button');
    const apiAudioPlayer = document.getElementById('api-audio-player'); // Get the audio element

    let currentUtterance = null;
    let voices = [];
    const storage = chrome.storage.sync; // Use sync storage
    let currentApiAudioBlob = null; // Store blob for download
    let currentApiAudioUrl = null; // Store object URL

    // --- Preference Keys ---
    const PREF_SPEED = 'ttsSpeed';
    const PREF_SERVICE = 'ttsService';
    const PREF_VOICE_URI = 'ttsVoiceURI'; // Still used for WebSpeech
    const PREF_HUME_VOICE_ID = 'humeVoiceId'; // Placeholder for future Hume voice saving
    const PREF_API_KEY_HUME = 'humeApiKey';
    const PREF_API_KEY_ELEVEN = 'elevenLabsApiKey';

    // --- Load Preferences ---
    function loadPreferences() {
        console.log("Loading preferences...");
        storage.get(
            [PREF_SPEED, PREF_SERVICE, PREF_VOICE_URI, PREF_HUME_VOICE_ID, PREF_API_KEY_HUME, PREF_API_KEY_ELEVEN],
            (result) => {
                console.log("Loaded preferences:", result);
                
                // Set Speed
                const savedSpeed = result[PREF_SPEED] || 1.0;
                speedSlider.value = savedSpeed;
                speedLabel.textContent = parseFloat(savedSpeed).toFixed(1);
                apiAudioPlayer.playbackRate = savedSpeed; // Also set speed for API player

                // Set Service (and trigger change event to update UI)
                const savedService = result[PREF_SERVICE] || 'webSpeech';
                voiceServiceSelect.value = savedService;
                updateUIForService(savedService); // Call the function to update UI

                // Set Voice (defer selection until voices are loaded for the selected service)
                const savedVoiceURI = result[PREF_VOICE_URI];
                const savedHumeVoiceId = result[PREF_HUME_VOICE_ID]; // Load Hume voice preference

                // Set API Keys (update input fields if keys exist)
                if (result[PREF_API_KEY_HUME]) {
                     if (savedService === 'humeAI') apiKeyInput.value = result[PREF_API_KEY_HUME];
                }
                if (result[PREF_API_KEY_ELEVEN]) {
                     if (savedService === 'elevenLabs') apiKeyInput.value = result[PREF_API_KEY_ELEVEN];
                }

                // Now populate voices for the loaded service
                populateVoiceList(savedVoiceURI, savedHumeVoiceId); // Pass saved URIs/IDs
            }
        );
    }

    // --- Save Preferences ---
    function savePreference(key, value) {
        storage.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
                console.error(`Error saving preference ${key}:`, chrome.runtime.lastError);
            } else {
                console.log(`Preference saved: ${key} = ${value}`);
            }
        });
    }

    // --- Voice List Handling ---
    function populateVoiceList(savedVoiceURI = null, savedHumeVoiceId = null) {
        const selectedService = voiceServiceSelect.value;

        if (selectedService === 'webSpeech') {
             voiceSelect.disabled = false;
             // ... (existing WebSpeech voice loading) ...
             if (speechSynthesis.getVoices().length > 0) {
                 voices = speechSynthesis.getVoices();
                 // Only show 'Natural' voices
                 const naturalVoices = voices.filter(v =>
                     v.name.toLowerCase().includes('natural') || (v.voiceURI && v.voiceURI.toLowerCase().includes('natural'))
                 );
                 renderVoiceOptions(naturalVoices, savedVoiceURI);
             } else {
                 speechSynthesis.onvoiceschanged = () => {
                     voices = speechSynthesis.getVoices();
                     // Only show 'Natural' voices
                     const naturalVoices = voices.filter(v =>
                         v.name.toLowerCase().includes('natural') || (v.voiceURI && v.voiceURI.toLowerCase().includes('natural'))
                     );
                     renderVoiceOptions(naturalVoices, savedVoiceURI);
                 };
             }
        } else if (selectedService === 'humeAI') {
            // Hume AI doesn't have a standard voice *listing* API in the same way
            // We can create/save voices, but listing all isn't typical.
            // For now, disable voice selection or provide descriptive options.
            voiceSelect.innerHTML = '<option value="default">Default Voice</option>';
            // Option: Add descriptions that can be sent in the API call
            // const descriptiveOption = document.createElement('option');
            // descriptiveOption.value = 'description_aristocrat';
            // descriptiveOption.textContent = 'Descriptive: British Aristocrat';
            // voiceSelect.appendChild(descriptiveOption);
            voiceSelect.disabled = true; // Disable selection for now
             // TODO: Potentially load saved Hume voices if we implement that feature
             // if (savedHumeVoiceId) voiceSelect.value = savedHumeVoiceId;
        } else if (selectedService === 'elevenLabs'){
            // TODO: Implement ElevenLabs voice loading
            voiceSelect.innerHTML = '<option value="">ElevenLabs voices not loaded</option>';
            voiceSelect.disabled = true;
        } else {
             voiceSelect.innerHTML = '<option value="">Select service first</option>';
             voiceSelect.disabled = true;
        }
    }

    function renderVoiceOptions(voiceList, savedVoiceURI) {
        voiceSelect.innerHTML = ''; // Clear existing options

        if (voiceList.length === 0) {
            voiceSelect.innerHTML = '<option value="">No voices available for this service</option>';
            return;
        }

        let foundSaved = false;
        voiceList.forEach((voice) => {
            const option = document.createElement('option');
            option.value = voice.voiceURI || voice.name; // Use voiceURI for WebSpeech
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            if (savedVoiceURI && option.value === savedVoiceURI) {
                option.selected = true;
                foundSaved = true;
            }
            voiceSelect.appendChild(option);
        });

        if (!foundSaved && voiceSelect.options.length > 0) {
             voiceSelect.options[0].selected = true;
             if (savedVoiceURI) {
                 savePreference(PREF_VOICE_URI, voiceSelect.value);
             }
        }
         if (!savedVoiceURI && voiceSelect.value) {
             savePreference(PREF_VOICE_URI, voiceSelect.value);
         }
    }

    // --- UI Update Function ---
    function updateUIForService(service) {
         // Stop all playback when service changes
        stopAllPlayback();

        if (service === 'webSpeech') {
            apiKeySection.classList.add('hidden');
            downloadButton.disabled = true;
            downloadButton.title = "Download not available for Web Speech API";
            apiKeyInput.value = ''; // Clear API key field
            voiceSelect.disabled = false;
        } else {
            apiKeySection.classList.remove('hidden');
            apiKeyLabel.textContent = `${service === 'humeAI' ? 'Hume AI' : 'ElevenLabs'} API Key:`;
            downloadButton.disabled = true; // Disable until audio is ready
            downloadButton.title = "Download as MP3 (requires generation first)";
            voiceSelect.disabled = (service === 'humeAI'); // Keep disabled for Hume for now
            // Load the correct API key into the input field
            const keyToLoad = service === 'humeAI' ? PREF_API_KEY_HUME : PREF_API_KEY_ELEVEN;
            storage.get(keyToLoad, (result) => {
                apiKeyInput.value = result[keyToLoad] || '';
            });
        }
    }

    // --- Event Listeners ---

    // Speed Slider
    speedSlider.addEventListener('input', () => {
        const speed = parseFloat(speedSlider.value).toFixed(1);
        speedLabel.textContent = speed;
        savePreference(PREF_SPEED, speed);

        // Update WebSpeech speed immediately if playing
        if (voiceServiceSelect.value === 'webSpeech' && speechSynthesis.speaking && currentUtterance) {
            speechSynthesis.cancel();
            currentUtterance.rate = speed;
            speechSynthesis.speak(currentUtterance);
        }
        // Update API audio player speed
        apiAudioPlayer.playbackRate = speed;
    });

    // Play Button
    playButton.addEventListener('click', () => {
        const text = textInput.value.trim();
        const selectedService = voiceServiceSelect.value;

        if (!text) {
            alert('Please enter some text to speak.');
            return;
        }

        stopAllPlayback(); // Stop anything currently playing

        if (selectedService === 'webSpeech') {
             speakWebSpeech(text);
        } else if (selectedService === 'humeAI') {
            speakWithHumeAI(text);
        } else if (selectedService === 'elevenLabs') {
            alert('ElevenLabs service playback not yet implemented.');
            // TODO: Call speakWithElevenLabs(text);
        }
    });

    // Pause Button
    pauseButton.addEventListener('click', () => {
        const selectedService = voiceServiceSelect.value;
        if (selectedService === 'webSpeech') {
             if (speechSynthesis.speaking && !speechSynthesis.paused) {
                speechSynthesis.pause();
            }
        } else if (apiAudioPlayer.src && !apiAudioPlayer.paused) {
             apiAudioPlayer.pause();
        }
    });

    // Stop Button
    stopButton.addEventListener('click', stopAllPlayback); // Use the helper function

    // Download Button
    downloadButton.addEventListener('click', () => {
        if (!currentApiAudioBlob || !currentApiAudioUrl) {
            alert("No audio generated or available for download.");
            return;
        }

        const selectedService = voiceServiceSelect.value;
        let filename = `holistic-tts-${selectedService}-${Date.now()}.mp3`; // Assume mp3 for now
        // Hume might return wav by default, adjust if necessary
        if (selectedService === 'humeAI' && currentApiAudioBlob.type === 'audio/wav') {
             filename = `holistic-tts-${selectedService}-${Date.now()}.wav`;
        }

        const a = document.createElement('a');
        a.href = currentApiAudioUrl;
        a.download = filename;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a);
        // No need to revoke URL immediately if we want resume/seek capability,
        // but revoke if download is the final action:
        // URL.revokeObjectURL(currentApiAudioUrl);
        // currentApiAudioUrl = null;
        // currentApiAudioBlob = null;
    });

    // Voice Service Selection Change
    voiceServiceSelect.addEventListener('change', () => {
        const selectedService = voiceServiceSelect.value;
        savePreference(PREF_SERVICE, selectedService);
        updateUIForService(selectedService);
        populateVoiceList(); // Reload voices for the new service
        // Stop any ongoing speech handled within updateUIForService
    });

    // Voice Selection Change (Only relevant for WebSpeech currently)
    voiceSelect.addEventListener('change', () => {
         const selectedService = voiceServiceSelect.value;
         if (selectedService === 'webSpeech') {
            savePreference(PREF_VOICE_URI, voiceSelect.value);
            // If speaking, stop and restart with new voice (optional)
            if (speechSynthesis.speaking) {
                 const text = currentUtterance ? currentUtterance.text : textInput.value.trim();
                 speechSynthesis.cancel();
                 if (text) speakWebSpeech(text); // Restart with new voice
            }
         } else if (selectedService === 'humeAI') {
             // If we implement Hume voice selection, save PREF_HUME_VOICE_ID here
             // savePreference(PREF_HUME_VOICE_ID, voiceSelect.value);
         }
    });

    // Save API Key Button
    saveApiKeyButton.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        const service = voiceServiceSelect.value;
        if (!key) {
            alert("API Key cannot be empty.");
            return;
        }
        if (service === 'humeAI') {
            savePreference(PREF_API_KEY_HUME, key);
            alert('Hume AI API Key saved.');
        } else if (service === 'elevenLabs') {
            savePreference(PREF_API_KEY_ELEVEN, key);
            alert('ElevenLabs API Key saved.');
        }
    });

    // Listener for API Audio Player Events (e.g., to re-enable buttons)
    apiAudioPlayer.addEventListener('ended', () => {
        console.log("API audio playback finished.");
        playButton.disabled = false;
    });
    apiAudioPlayer.addEventListener('pause', () => {
        console.log("API audio paused.");
        playButton.disabled = false; // Allow resuming or playing new
    });
     apiAudioPlayer.addEventListener('play', () => {
        console.log("API audio playing.");
        playButton.disabled = true; // Disable play while API audio is active
    });

     // --- Helper Functions ---
     function stopAllPlayback() {
         // Stop WebSpeech
         if (speechSynthesis.speaking || speechSynthesis.paused) {
             speechSynthesis.cancel();
             currentUtterance = null;
         }
         // Stop API Audio Player
         if (apiAudioPlayer.src && !apiAudioPlayer.paused) {
             apiAudioPlayer.pause();
             apiAudioPlayer.currentTime = 0; // Reset time
         }
         if (currentApiAudioUrl) {
             URL.revokeObjectURL(currentApiAudioUrl); // Clean up old URL
         }
         apiAudioPlayer.src = ''; // Clear source
         currentApiAudioBlob = null;
         currentApiAudioUrl = null;
         downloadButton.disabled = true; // Disable download
         playButton.disabled = false; // Re-enable play button
     }

    // --- Hume AI Synthesis Function ---
    async function speakWithHumeAI(text) {
        storage.get(PREF_API_KEY_HUME, async (result) => {
            const apiKey = result[PREF_API_KEY_HUME];
            if (!apiKey) {
                alert('Hume AI API Key not set. Please set it in the options.');
                updateUIForService('humeAI'); // Ensure API key section is visible
                apiKeyInput.focus();
                return;
            }

            playButton.disabled = true; // Disable play while processing
            console.log('Requesting Hume AI synthesis...');
            // Add loading indicator maybe?

            const HUME_API_URL = 'https://api.hume.ai/v0/batch/jobs'; // Using Batch API endpoint as direct TTS isn't documented clearly
            const HUME_TTS_CONFIG_URL = 'https://api.hume.ai/v0/configs/voice'; // URL to get config ID? Needs verification

            // Hume's REST API endpoint for TTS is now confirmed as /v0/tts.
            // The quickstart uses the SDK which abstracts this.
            // Let's *assume* a possible payload structure based on common patterns
            // and the quickstart, but this **NEEDS VERIFICATION** against actual Hume REST API docs.
            // A more robust approach might involve their Batch API if direct TTS isn't available/documented via REST.

            // **** START - Placeholder/Assumed Payload - Needs Verification ****
            // This payload might be incorrect. Using the Job API might be necessary.
            const payload = {
                // Assuming a batch job structure might be needed if no direct /synthesize endpoint exists
                 "config": {
                     // Need to find how to specify TTS config, maybe via a predefined config ID or inline
                     "type": "tts",
                     "voice": { /* Options here? Default? */ },
                     "text": text
                 }
                 // OR, if a direct endpoint exists (e.g., /v0/tts/synthesize)
                 // "utterances": [{ "text": text }]
             };
             const requestUrl = 'https://api.hume.ai/v0/tts'; // Confirmed endpoint for Hume TTS
             const requestBody = JSON.stringify({ utterances: [{ text: text }] });
             const headers = {
                 'Content-Type': 'application/json',
                 'X-Hume-Api-Key': apiKey
             };
            // **** END - Placeholder/Assumed Payload ****

            try {
                // --- Making the API Call --- (This part uses the *assumed* direct endpoint)
                const response = await fetch(requestUrl, {
                    method: 'POST',
                    headers: headers,
                    body: requestBody
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error('Hume AI API Error:', response.status, errorBody);
                    throw new Error(`Hume AI API request failed: ${response.status} - ${errorBody || response.statusText}`);
                }

                const resultData = await response.json();
                console.log('Hume AI Response:', resultData);

                // --- Processing the Response --- (Assuming structure from quickstart)
                if (resultData.generations && resultData.generations.length > 0 && resultData.generations[0].audio) {
                    const base64Audio = resultData.generations[0].audio;
                    // Determine audio format (Assume WAV if not specified, Hume might return MP3 too)
                    const audioType = resultData.generations[0].content_type || 'audio/wav'; // Adjust based on actual API response

                    // Decode Base64 and create Blob
                    const audioBytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
                    currentApiAudioBlob = new Blob([audioBytes], { type: audioType });
                    currentApiAudioUrl = URL.createObjectURL(currentApiAudioBlob);

                    // --- Playback ---
                    apiAudioPlayer.src = currentApiAudioUrl;
                    apiAudioPlayer.playbackRate = parseFloat(speedSlider.value); // Ensure speed is set
                    apiAudioPlayer.play();
                    downloadButton.disabled = false; // Enable download now

                } else {
                    // Handle cases where the API response structure is different or generation failed
                    console.error('Hume AI response missing expected audio data:', resultData);
                    throw new Error('Hume AI generation failed or returned unexpected data.');
                }

            } catch (error) {
                console.error('Error during Hume AI synthesis:', error);
                alert(`Failed to synthesize speech with Hume AI: ${error.message}`);
                playButton.disabled = false; // Re-enable play on error
                downloadButton.disabled = true;
            }
        });
    }

    // --- Web Speech Synthesis Function ---
    function speakWebSpeech(text) {
        if (speechSynthesis.speaking) {
            console.warn('SpeechSynthesis is already speaking. Cancelling previous.');
            speechSynthesis.cancel();
            // Small delay to ensure cancellation completes before starting new utterance
            setTimeout(() => speakWebSpeech(text), 100);
            return;
        }
        if (!text) return; // Don't speak empty text

        currentUtterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceURI = voiceSelect.value;
        const selectedSpeed = parseFloat(speedSlider.value);

        // Find the selected voice object from the *currently loaded* voices
        const selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceURI);

        if (selectedVoice) {
            currentUtterance.voice = selectedVoice;
        } else {
            const webSpeechVoices = voices.filter(v => !v.voiceURI.includes('google'));
            if (webSpeechVoices.length > 0) {
                currentUtterance.voice = webSpeechVoices[0]; // Fallback to first available
                console.warn("Selected voice not found or invalid, using first available Web Speech voice.");
                // Update dropdown to reflect the fallback voice being used
                voiceSelect.value = webSpeechVoices[0].voiceURI;
                savePreference(PREF_VOICE_URI, voiceSelect.value);
            } else {
                console.error("No Web Speech voices available.");
                alert("No Web Speech voices available.");
                return;
            }
        }

        currentUtterance.rate = selectedSpeed;
        currentUtterance.pitch = 1;

        currentUtterance.onend = () => {
            console.log('Speech finished.');
            currentUtterance = null;
        };
        currentUtterance.onerror = (event) => {
            console.error('SpeechSynthesis Error:', event.error);
            alert(`Speech error: ${event.error}`);
            currentUtterance = null;
        };

        speechSynthesis.speak(currentUtterance);
    }

    // Load preferences when the DOM content is loaded
    loadPreferences();
});