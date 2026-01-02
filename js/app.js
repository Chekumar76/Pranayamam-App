const breathText = document.getElementById('breath-text');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const techniqueInput = document.getElementById('technique');
const totalTimeDisplay = document.getElementById('total-time');
const setTimeDisplay = document.getElementById('set-time');
const timerDisplay = document.getElementById('timer');
const currentSetDisplay = document.getElementById('current-set');
const totalSetsDisplay = document.getElementById('total-sets-display');
const setCountInput = document.getElementById('set-count');
const circles = document.getElementById('breath-circle');
const circlesContainer = null; // No longer used
const customSettings = document.getElementById('custom-settings');
const modeRadios = document.getElementsByName('mode');
const voiceToggle = document.getElementById('voice-toggle');
const stopBtn = document.getElementById('stop-btn');
const footerControls = document.getElementById('footer-controls');
const rippleContainer = document.getElementById('ripple-container');

let timerInterval;
let seconds = 0;
let setSeconds = 0;
let isRunning = false;
let currentStageIndex = 0;
let stages = [];
let timeLeft = 0;
let currentSet = 1;
let targetSets = 5;
let isSpeaking = false;
let wakeLock = null;
let currentLanguage = 'en';

const techniques = {
    pranayamam: { inhale: 4, hold1: 10, exhale: 8, hold2: 10 },
    nadi: { inhale: 4, hold1: 0, exhale: 8, hold2: 0 },
    box: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    '478': { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    equal: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
    custom: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }
};

const translations = {
    en: {
        app_title: "Breathing Exercise",
        btn_lang: "TA",
        label_set: "Set:",
        label_set_time: "Set Time:",
        label_total_time: "Total Time:",
        label_set_count: "Number of Sets:",
        label_mode: "Level:",
        start_btn: "Start",
        stop_btn: "Stop",
        reset_btn: "Reset",
        modal_title: "Breathing Technique",
        breath_start: "Start",
        inhale: "Inhale",
        hold: "Hold",
        exhale: "Exhale",
        complete: "Session Complete",
        pranayamam_name: "Pranayamam",
        pranayamam_desc: "Advanced Breath Control (4-10-8-10)",
        nadi_name: "Nadi Shuddhi",
        nadi_desc: "Simple Alternate Breathing (4-8)",
        box_name: "Sama Vritti (Box Breathing)",
        box_desc: "4-4-4-4 Rhythm",
        "478_name": "4-7-8 Technique",
        "478_desc": "Deep Relaxation",
        equal_name: "Equal Breathing",
        equal_desc: "Coherent Breathing",
        custom_name: "Custom (Set your own)",
        custom_desc: "Personalized pattern",
        inhale_l: "Inhale through LEFT",
        inhale_r: "Inhale through RIGHT",
        exhale_l: "Exhale through LEFT",
        exhale_r: "Exhale through RIGHT"
    },
    ta: {
        app_title: "மூச்சுப்பயிற்சி",
        btn_lang: "EN",
        label_set: "சுற்று:",
        label_set_time: "சுற்று நேரம்:",
        label_total_time: "மொத்த நேரம்:",
        label_set_count: "சுற்றுகளின் எண்ணிக்கை:",
        label_mode: "நிலை:",
        start_btn: "தொடங்கு",
        stop_btn: "நிறுத்து",
        reset_btn: "ரீசெட்",
        modal_title: "பயிற்சி முறை",
        breath_start: "Start",
        inhale: "உள்ளிழு",
        hold: "நிறுத்து",
        exhale: "வெளியிடு",
        complete: "பயிற்சி நிறைவடைந்தது",
        pranayamam_name: "பிராணாயாமம் (Pranayamam)",
        pranayamam_desc: "மேம்பட்ட மூச்சுப்பயிற்சி (4-10-8-10)",
        nadi_name: "நாடி சுத்தி (Nadi Shuddhi)",
        nadi_desc: "எளிய மூச்சுப்பயிற்சி (4:8 முறை)",
        box_name: "Sama Vritti (Box Breathing)",
        box_desc: "4-4-4-4 முறை",
        "478_name": "4-7-8 முறை",
        "478_desc": "ஆழ்ந்த தளர்வு",
        equal_name: "சம நிலை மூச்சு",
        equal_desc: "சீரான சுவாசம்",
        custom_name: "தனிப்பட்ட விருப்பம் (Custom)",
        custom_desc: "சொந்த நேரத்தை அமைத்தல்",
        inhale_l: "இடது நாசி வழியாக உள்ளிழு",
        inhale_r: "வலது நாசி வழியாக உள்ளிழு",
        exhale_l: "இடது நாசி வழியாக வெளிவிடு",
        exhale_r: "வலது நாசி வழியாக வெளிவிடு"
    }
};

let labels = {
    inhale: translations[currentLanguage].inhale,
    hold: translations[currentLanguage].hold,
    exhale: translations[currentLanguage].exhale
};

let voiceLabels = {
    inhale: translations[currentLanguage].inhale,
    hold: translations[currentLanguage].hold,
    exhale: translations[currentLanguage].exhale
};

function updateLanguageUI() {
    const t = translations[currentLanguage];

    labels = {
        inhale: t.inhale,
        hold: t.hold,
        exhale: t.exhale,
        inhale_l: t.inhale_l,
        inhale_r: t.inhale_r,
        exhale_l: t.exhale_l,
        exhale_r: t.exhale_r
    };

    voiceLabels = {
        inhale: t.inhale,
        hold: t.hold,
        exhale: t.exhale
    };

    document.getElementById('app-title').textContent = t.app_title;
    document.getElementById('lang-switch').textContent = t.btn_lang;
    document.getElementById('label-set').textContent = t.label_set;
    document.getElementById('label-set-time').textContent = t.label_set_time;
    document.getElementById('label-total-time').textContent = t.label_total_time;
    document.getElementById('label-set-count').textContent = t.label_set_count;
    document.getElementById('label-mode').textContent = t.label_mode;
    document.getElementById('modal-title').textContent = t.modal_title;

    if (!isRunning) {
        startBtn.textContent = t.start_btn;
        breathText.textContent = t.breath_start;
    }
    stopBtn.textContent = t.stop_btn;
    resetBtn.textContent = t.reset_btn;

    // Update modal options
    const techOptions = document.querySelectorAll('.technique-option');
    techOptions.forEach(opt => {
        const key = opt.getAttribute('data-value');
        const h3 = opt.querySelector('h3');
        const p = opt.querySelector('p');
        if (h3) h3.textContent = t[key + '_name'];
        if (p) p.textContent = t[key + '_desc'];

        if (opt.classList.contains('active')) {
            document.getElementById('selected-technique-name').textContent = t[key + '_name'];
        }
    });

    document.querySelector('.voice-icon-label').title = currentLanguage === 'en' ? "Voice Guidance" : "குரல் வழிகாட்டுதல்";

    // Add class for language specific styling
    document.body.classList.toggle('lang-ta', currentLanguage === 'ta');
}

document.getElementById('lang-switch').addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'ta' : 'en';
    updateLanguageUI();
});

// Web Audio API for Tick
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTick() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

let selectedVoice = null;

function loadVoices() {
    const voices = window.speechSynthesis.getVoices();
    // Try to find a Tamil voice, fallback to any available if not found
    selectedVoice = voices.find(v => v.lang === 'ta-IN' || v.lang.toLowerCase().includes('tamil')) || null;
}

// Early call and event listener for voices
loadVoices();
window.speechSynthesis.onvoiceschanged = loadVoices;

function speak(text) {
    return new Promise((resolve) => {
        if (!voiceToggle.checked || !text) {
            resolve();
            return;
        }

        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.onend = () => {
            isSpeaking = false;
            resolve();
        };

        const voices = window.speechSynthesis.getVoices();
        const targetLang = currentLanguage === 'ta' ? 'ta' : 'en';
        const langVoice = voices.find(v => v.lang.startsWith(targetLang)) || selectedVoice;

        if (langVoice) {
            msg.voice = langVoice;
            msg.lang = langVoice.lang;
        } else {
            msg.lang = targetLang === 'ta' ? 'ta-IN' : 'en-US';
        }

        isSpeaking = true;
        window.speechSynthesis.speak(msg);

        // Safety timeout in case onend doesn't fire
        setTimeout(() => {
            if (isSpeaking) {
                isSpeaking = false;
                resolve();
            }
        }, 5000);
    });
}

async function requestWakeLock() {
    if (!('wakeLock' in navigator)) {
        console.log('Wake Lock API not supported in this browser/context.');
        return;
    }

    try {
        wakeLock = await navigator.wakeLock.request('screen');

        wakeLock.addEventListener('release', () => {
            console.log('Screen Wake Lock was released');
            // If it was released by the system (not by us), try to re-acquire
            if (isRunning && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        });

        console.log('Screen Wake Lock is active');
    } catch (err) {
        console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => {
            wakeLock = null;
        });
    }
}

// Re-acquire wake lock whenever page becomes visible and practice is running
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isRunning) {
        await requestWakeLock();
    }
});

function updateVisuals(stage) {
    if (!stage) return;
    breathText.textContent = `${stage.label} ${timeLeft}`;

    // Simple Single Circle Animation (Zoom In / Zoom Out)
    circles.style.transition = `transform ${stage.duration}s ease-in-out`;
    // IMPORTANT: Maintain translate(-50%, -50%) to keep it centered while scaling
    circles.style.transform = `translate(-50%, -50%) scale(${stage.scale})`;
}


async function nextStage() {
    if (!isRunning) return;

    currentStageIndex = (currentStageIndex + 1) % stages.length;

    // Check if a full set is completed
    if (currentStageIndex === 0) {
        currentSet++;
        setSeconds = 0; // Reset set time for new set
        if (currentSet > targetSets) {
            await speak(translations[currentLanguage].complete);
            stopApp();
            return;
        }
        currentSetDisplay.textContent = currentSet;
    }

    const stage = stages[currentStageIndex];
    timeLeft = stage.duration;
    timerDisplay.textContent = timeLeft;

    // 1. Show the text immediately
    breathText.textContent = stage.label;

    // 2. Announce stage
    await speak(stage.vLabel || stage.label);

    // 3. Start visuals after announcement (or same time)
    updateVisuals(stage);
}

async function tick() {
    if (!isRunning || isSpeaking) return;

    if (timeLeft > 0) {
        timerDisplay.textContent = timeLeft;
        breathText.textContent = `${stages[currentStageIndex].label} ${timeLeft}`;
        playTick();
        timeLeft--;
    } else {
        await nextStage();
    }
}

const overlay = document.querySelector('.breath-content-overlay');

// Function to handle start Action (shared by button and overlay)
async function handleStartAction() {
    if (!isRunning) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        await requestWakeLock(); // Keep screen on

        const settings = getSettings();
        const tech = techniqueInput.value;
        // Calculate Scale Factor dynamically to fit screen width
        // Base size is 180px. Target is 90vw (90% of screen width).
        const baseSize = 180;
        const targetSize = Math.min(window.innerWidth, window.innerHeight) * 0.90; // 90% of min dimension
        const scaleMax = targetSize / baseSize;

        if (tech === 'nadi') {
            stages = [
                { type: 'inhale', duration: settings.inhale, label: labels.inhale_l, vLabel: labels.inhale_l, scale: scaleMax },
                { type: 'exhale', duration: settings.exhale, label: labels.exhale_r, vLabel: labels.exhale_r, scale: 1 },
                { type: 'inhale', duration: settings.inhale, label: labels.inhale_r, vLabel: labels.inhale_r, scale: scaleMax },
                { type: 'exhale', duration: settings.exhale, label: labels.exhale_l, vLabel: labels.exhale_l, scale: 1 }
            ];
        } else if (tech === 'pranayamam') {
            stages = [
                { type: 'inhale', duration: settings.inhale, label: labels.inhale_l, vLabel: labels.inhale_l, scale: scaleMax },
                { type: 'hold1', duration: settings.hold1, label: labels.hold, vLabel: labels.hold, scale: scaleMax },
                { type: 'exhale', duration: settings.exhale, label: labels.exhale_r, vLabel: labels.exhale_r, scale: 1 },
                { type: 'hold2', duration: settings.hold2, label: labels.hold, vLabel: labels.hold, scale: 1 },
                { type: 'inhale', duration: settings.inhale, label: labels.inhale_r, vLabel: labels.inhale_r, scale: scaleMax },
                { type: 'hold1', duration: settings.hold1, label: labels.hold, vLabel: labels.hold, scale: scaleMax },
                { type: 'exhale', duration: settings.exhale, label: labels.exhale_l, vLabel: labels.exhale_l, scale: 1 },
                { type: 'hold2', duration: settings.hold2, label: labels.hold, vLabel: labels.hold, scale: 1 }
            ].filter(s => s.duration > 0);
        } else {
            stages = [
                { type: 'inhale', duration: settings.inhale, label: labels.inhale, vLabel: labels.inhale, scale: scaleMax },
                { type: 'hold1', duration: settings.hold1, label: labels.hold, vLabel: labels.hold, scale: scaleMax },
                { type: 'exhale', duration: settings.exhale, label: labels.exhale, vLabel: labels.exhale, scale: 1 },
                { type: 'hold2', duration: settings.hold2, label: labels.hold, vLabel: labels.hold, scale: 1 }
            ].filter(s => s.duration > 0);
        }

        isRunning = true;

        currentStageIndex = 0;
        currentSet = 1;
        targetSets = parseInt(setCountInput.value) || 5;

        currentSetDisplay.textContent = currentSet;
        totalSetsDisplay.textContent = targetSets;

        const firstStage = stages[0];
        timeLeft = firstStage.duration;

        startBtn.classList.add('hidden'); // Hide center start button
        breathText.classList.remove('hidden'); // Show instructions
        footerControls.classList.remove('hidden'); // Show stop/reset

        // Initial announcement sequence
        breathText.textContent = firstStage.label;
        await speak(firstStage.vLabel || firstStage.label);

        // Start visuals and timer ONLY after speaking
        updateVisuals(firstStage);
        timerDisplay.textContent = timeLeft;

        // Accurate Timing Logic - Initialize AFTER speech
        let lastTick = Date.now();

        timerInterval = setInterval(() => {
            const now = Date.now();
            const delta = now - lastTick;

            // If speaking, just reset the tick anchor so we don't accumulate time
            if (isSpeaking) {
                lastTick = now;
                return;
            }

            if (delta >= 1000 && isRunning) {
                seconds++;
                setSeconds++;

                const format = (s) => Math.floor(s / 60).toString().padStart(2, '0') + ":" + (s % 60).toString().padStart(2, '0');
                totalTimeDisplay.textContent = format(seconds);
                setTimeDisplay.textContent = format(setSeconds);

                tick();

                // Reset for next stable second
                lastTick = now;
            }
        }, 100);
    }
}

startBtn.addEventListener('click', handleStartAction);
overlay.addEventListener('click', handleStartAction);

stopBtn.addEventListener('click', () => {
    stopApp();
});

function stopApp() {
    isRunning = false;
    isSpeaking = false;
    // circlesContainer.classList.add('pulse'); // Restore heartbeat
    startBtn.classList.remove('hidden'); // Show center start button
    breathText.classList.add('hidden'); // Hide instructions
    footerControls.classList.add('hidden'); // Hide stop/reset

    // Clear any remaining ripples
    if (rippleContainer) rippleContainer.querySelectorAll('.ripple').forEach(r => r.remove());

    releaseWakeLock(); // Allow screen to sleep
    clearInterval(timerInterval);
    window.speechSynthesis.cancel();
    breathText.textContent = labels.breath_start;
    // Reset Visual Circles
    circles.style.transition = 'all 0.5s ease-out';
    circles.style.transform = 'translate(-50%, -50%) scale(1)';
}

function getMultiplier() {
    let mode = 'beginner';
    modeRadios.forEach(r => { if (r.checked) mode = r.value; });
    return mode === 'pro' ? 2 : 1;
}

function getSettings() {
    const tech = techniqueInput.value;
    const mult = getMultiplier();
    if (tech === 'custom') {
        return {
            inhale: parseFloat(document.getElementById('custom-inhale').value) * mult,
            hold1: parseFloat(document.getElementById('custom-hold1').value) * mult,
            exhale: parseFloat(document.getElementById('custom-exhale').value) * mult,
            hold2: parseFloat(document.getElementById('custom-hold2').value) * mult
        };
    }
    const base = techniques[tech];
    return {
        inhale: base.inhale * mult,
        hold1: base.hold1 * mult,
        exhale: base.exhale * mult,
        hold2: base.hold2 * mult
    };
}

const techniqueModal = document.getElementById('technique-modal');
const techniqueTrigger = document.getElementById('technique-trigger');
const closeModal = document.getElementById('close-modal');
const selectedTechName = document.getElementById('selected-technique-name');
const techniqueOptions = document.querySelectorAll('.technique-option');

// Handle Modal Open/Close
techniqueTrigger.addEventListener('click', () => {
    techniqueModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    techniqueModal.classList.add('hidden');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === techniqueModal) {
        techniqueModal.classList.add('hidden');
    }
});

// Handle technique selection
techniqueOptions.forEach(option => {
    option.addEventListener('click', () => {
        const val = option.getAttribute('data-value');
        const name = option.querySelector('h3').textContent;

        // Update selection
        techniqueInput.value = val;
        selectedTechName.textContent = name;

        // Update active class
        techniqueOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // Show/Hide custom settings
        customSettings.classList.toggle('hidden', val !== 'custom');

        // Close modal
        techniqueModal.classList.add('hidden');
    });
});

resetBtn.addEventListener('click', () => {
    // 1. Stop everything
    isRunning = false;
    isSpeaking = false;
    window.speechSynthesis.cancel();
    clearInterval(timerInterval);
    releaseWakeLock();

    // 2. Reset time and progress variables
    seconds = 0;
    currentSet = 1;
    timeLeft = 0;
    currentStageIndex = 0;

    // 3. Reset UI Displays
    totalTimeDisplay.textContent = '00:00';
    setTimeDisplay.textContent = '00:00';
    timerDisplay.textContent = '0';
    currentSetDisplay.textContent = '1';
    breathText.textContent = translations[currentLanguage].breath_start;
    breathText.classList.add('hidden');
    startBtn.classList.remove('hidden');
    footerControls.classList.add('hidden');

    // 4. Clear Ripples
    if (rippleContainer) rippleContainer.querySelectorAll('.ripple').forEach(r => r.remove());

    // 5. Reset Technique Selection
    techniqueInput.value = 'pranayamam';
    selectedTechName.textContent = translations[currentLanguage].pranayamam_name;
    techniqueOptions.forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-value') === 'pranayamam');
    });
    customSettings.classList.add('hidden');

    // 5. Reset Visual Circles
    // 5. Reset Visual Circles
    // circlesContainer.classList.add('pulse'); // Restore heartbeat pulse
    circles.style.transition = 'all 0.5s ease-out';
    circles.style.transform = 'translate(-50%, -50%) scale(1)';
    // No need to reset classes as we use a single fixed class now
});

// Initialize the app with the default language
updateLanguageUI();
