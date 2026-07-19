// --- Word bank: mixed difficulty, 300 words for MVP testing ---
  const words = [
    // Easy (100)
    { word: "friend", difficulty: "easy" },
    { word: "garden", difficulty: "easy" },
    { word: "purple", difficulty: "easy" },
    { word: "jungle", difficulty: "easy" },
    { word: "pencil", difficulty: "easy" },
    { word: "whisper", difficulty: "easy" },
    { word: "animal", difficulty: "easy" },
    { word: "bottle", difficulty: "easy" },
    { word: "candle", difficulty: "easy" },
    { word: "dragon", difficulty: "easy" },
    { word: "forest", difficulty: "easy" },
    { word: "hammer", difficulty: "easy" },
    { word: "island", difficulty: "easy" },
    { word: "kitten", difficulty: "easy" },
    { word: "lemon", difficulty: "easy" },
    { word: "magnet", difficulty: "easy" },
    { word: "napkin", difficulty: "easy" },
    { word: "orange", difficulty: "easy" },
    { word: "pillow", difficulty: "easy" },
    { word: "rabbit", difficulty: "easy" },
    { word: "sandal", difficulty: "easy" },
    { word: "tunnel", difficulty: "easy" },
    { word: "umbrella", difficulty: "easy" },
    { word: "violet", difficulty: "easy" },
    { word: "window", difficulty: "easy" },
    { word: "yellow", difficulty: "easy" },
    { word: "zipper", difficulty: "easy" },
    { word: "blanket", difficulty: "easy" },
    { word: "chicken", difficulty: "easy" },
    { word: "dolphin", difficulty: "easy" },
    { word: "elephant", difficulty: "easy" },
    { word: "feather", difficulty: "easy" },
    { word: "giraffe", difficulty: "easy" },
    { word: "honey", difficulty: "easy" },
    { word: "apple", difficulty: "easy" },
    { word: "banana", difficulty: "easy" },
    { word: "basket", difficulty: "easy" },
    { word: "bicycle", difficulty: "easy" },
    { word: "blossom", difficulty: "easy" },
    { word: "breeze", difficulty: "easy" },
    { word: "bridge", difficulty: "easy" },
    { word: "bubble", difficulty: "easy" },
    { word: "bucket", difficulty: "easy" },
    { word: "butter", difficulty: "easy" },
    { word: "button", difficulty: "easy" },
    { word: "cactus", difficulty: "easy" },
    { word: "camera", difficulty: "easy" },
    { word: "candy", difficulty: "easy" },
    { word: "canyon", difficulty: "easy" },
    { word: "carpet", difficulty: "easy" },
    { word: "castle", difficulty: "easy" },
    { word: "circle", difficulty: "easy" },
    { word: "clover", difficulty: "easy" },
    { word: "cloud", difficulty: "easy" },
    { word: "coffee", difficulty: "easy" },
    { word: "comet", difficulty: "easy" },
    { word: "cookie", difficulty: "easy" },
    { word: "cotton", difficulty: "easy" },
    { word: "crayon", difficulty: "easy" },
    { word: "cricket", difficulty: "easy" },
    { word: "crystal", difficulty: "easy" },
    { word: "cushion", difficulty: "easy" },
    { word: "daisy", difficulty: "easy" },
    { word: "desert", difficulty: "easy" },
    { word: "diamond", difficulty: "easy" },
    { word: "dinner", difficulty: "easy" },
    { word: "doctor", difficulty: "easy" },
    { word: "eagle", difficulty: "easy" },
    { word: "engine", difficulty: "easy" },
    { word: "family", difficulty: "easy" },
    { word: "farmer", difficulty: "easy" },
    { word: "flower", difficulty: "easy" },
    { word: "follow", difficulty: "easy" },
    { word: "fossil", difficulty: "easy" },
    { word: "freeze", difficulty: "easy" },
    { word: "gentle", difficulty: "easy" },
    { word: "glacier", difficulty: "easy" },
    { word: "glitter", difficulty: "easy" },
    { word: "guitar", difficulty: "easy" },
    { word: "harbor", difficulty: "easy" },
    { word: "helmet", difficulty: "easy" },
    { word: "hockey", difficulty: "easy" },
    { word: "jacket", difficulty: "easy" },
    { word: "kettle", difficulty: "easy" },
    { word: "kingdom", difficulty: "easy" },
    { word: "ladder", difficulty: "easy" },
    { word: "lantern", difficulty: "easy" },
    { word: "lizard", difficulty: "easy" },
    { word: "lobster", difficulty: "easy" },
    { word: "market", difficulty: "easy" },
    { word: "meadow", difficulty: "easy" },
    { word: "melody", difficulty: "easy" },
    { word: "mirror", difficulty: "easy" },
    { word: "monkey", difficulty: "easy" },
    { word: "mountain", difficulty: "easy" },
    { word: "mustard", difficulty: "easy" },
    { word: "needle", difficulty: "easy" },
    { word: "ocean", difficulty: "easy" },
    { word: "orchid", difficulty: "easy" },
    { word: "oyster", difficulty: "easy" },
 
    // Medium (100)
    { word: "necessary", difficulty: "medium" },
    { word: "occurred", difficulty: "medium" },
    { word: "definitely", difficulty: "medium" },
    { word: "business", difficulty: "medium" },
    { word: "vacuum", difficulty: "medium" },
    { word: "separate", difficulty: "medium" },
    { word: "embarrass", difficulty: "medium" },
    { word: "privilege", difficulty: "medium" },
    { word: "occasion", difficulty: "medium" },
    { word: "existence", difficulty: "medium" },
    { word: "government", difficulty: "medium" },
    { word: "immediate", difficulty: "medium" },
    { word: "knowledge", difficulty: "medium" },
    { word: "receive", difficulty: "medium" },
    { word: "restaurant", difficulty: "medium" },
    { word: "schedule", difficulty: "medium" },
    { word: "tomorrow", difficulty: "medium" },
    { word: "calendar", difficulty: "medium" },
    { word: "chocolate", difficulty: "medium" },
    { word: "committee", difficulty: "medium" },
    { word: "discipline", difficulty: "medium" },
    { word: "environment", difficulty: "medium" },
    { word: "exercise", difficulty: "medium" },
    { word: "guarantee", difficulty: "medium" },
    { word: "harass", difficulty: "medium" },
    { word: "independent", difficulty: "medium" },
    { word: "jewelry", difficulty: "medium" },
    { word: "license", difficulty: "medium" },
    { word: "maintenance", difficulty: "medium" },
    { word: "mortgage", difficulty: "medium" },
    { word: "neighbor", difficulty: "medium" },
    { word: "opportunity", difficulty: "medium" },
    { word: "parallel", difficulty: "medium" },
    { word: "absence", difficulty: "medium" },
    { word: "accidentally", difficulty: "medium" },
    { word: "accommodate", difficulty: "medium" },
    { word: "acquire", difficulty: "medium" },
    { word: "aggressive", difficulty: "medium" },
    { word: "amateur", difficulty: "medium" },
    { word: "analysis", difficulty: "medium" },
    { word: "apparent", difficulty: "medium" },
    { word: "appreciate", difficulty: "medium" },
    { word: "argument", difficulty: "medium" },
    { word: "athlete", difficulty: "medium" },
    { word: "attendance", difficulty: "medium" },
    { word: "auxiliary", difficulty: "medium" },
    { word: "awkward", difficulty: "medium" },
    { word: "beginning", difficulty: "medium" },
    { word: "belief", difficulty: "medium" },
    { word: "beneficial", difficulty: "medium" },
    { word: "benefited", difficulty: "medium" },
    { word: "category", difficulty: "medium" },
    { word: "ceiling", difficulty: "medium" },
    { word: "changeable", difficulty: "medium" },
    { word: "colleague", difficulty: "medium" },
    { word: "column", difficulty: "medium" },
    { word: "commitment", difficulty: "medium" },
    { word: "comparative", difficulty: "medium" },
    { word: "competent", difficulty: "medium" },
    { word: "conscience", difficulty: "medium" },
    { word: "conscious", difficulty: "medium" },
    { word: "controversy", difficulty: "medium" },
    { word: "convenient", difficulty: "medium" },
    { word: "correspondence", difficulty: "medium" },
    { word: "criticize", difficulty: "medium" },
    { word: "curiosity", difficulty: "medium" },
    { word: "definite", difficulty: "medium" },
    { word: "dependent", difficulty: "medium" },
    { word: "desperate", difficulty: "medium" },
    { word: "develop", difficulty: "medium" },
    { word: "disappear", difficulty: "medium" },
    { word: "disastrous", difficulty: "medium" },
    { word: "eligible", difficulty: "medium" },
    { word: "embarrassment", difficulty: "medium" },
    { word: "equipment", difficulty: "medium" },
    { word: "exaggerate", difficulty: "medium" },
    { word: "exceed", difficulty: "medium" },
    { word: "excellent", difficulty: "medium" },
    { word: "exhausted", difficulty: "medium" },
    { word: "exhilarate", difficulty: "medium" },
    { word: "experience", difficulty: "medium" },
    { word: "explanation", difficulty: "medium" },
    { word: "familiar", difficulty: "medium" },
    { word: "fascinate", difficulty: "medium" },
    { word: "foreign", difficulty: "medium" },
    { word: "forty", difficulty: "medium" },
    { word: "fourth", difficulty: "medium" },
    { word: "generally", difficulty: "medium" },
    { word: "genuinely", difficulty: "medium" },
    { word: "grammar", difficulty: "medium" },
    { word: "grateful", difficulty: "medium" },
    { word: "guidance", difficulty: "medium" },
    { word: "humorous", difficulty: "medium" },
    { word: "hypocrisy", difficulty: "medium" },
    { word: "immediately", difficulty: "medium" },
    { word: "incredible", difficulty: "medium" },
    { word: "indispensable", difficulty: "medium" },
    { word: "inevitable", difficulty: "medium" },
    { word: "influential", difficulty: "medium" },
    { word: "intelligence", difficulty: "medium" },
 
    // Hard (100)
    { word: "rhythm", difficulty: "hard" },
    { word: "bureaucrat", difficulty: "hard" },
    { word: "conscientious", difficulty: "hard" },
    { word: "silhouette", difficulty: "hard" },
    { word: "mnemonic", difficulty: "hard" },
    { word: "questionnaire", difficulty: "hard" },
    { word: "pneumonia", difficulty: "hard" },
    { word: "entrepreneur", difficulty: "hard" },
    { word: "hierarchy", difficulty: "hard" },
    { word: "idiosyncrasy", difficulty: "hard" },
    { word: "onomatopoeia", difficulty: "hard" },
    { word: "phenomenon", difficulty: "hard" },
    { word: "psychiatrist", difficulty: "hard" },
    { word: "renaissance", difficulty: "hard" },
    { word: "surveillance", difficulty: "hard" },
    { word: "vengeance", difficulty: "hard" },
    { word: "xylophone", difficulty: "hard" },
    { word: "zeitgeist", difficulty: "hard" },
    { word: "unnecessary", difficulty: "hard" },
    { word: "subtlety", difficulty: "hard" },
    { word: "rendezvous", difficulty: "hard" },
    { word: "quintessential", difficulty: "hard" },
    { word: "paradigm", difficulty: "hard" },
    { word: "millennium", difficulty: "hard" },
    { word: "liaison", difficulty: "hard" },
    { word: "kaleidoscope", difficulty: "hard" },
    { word: "juxtaposition", difficulty: "hard" },
    { word: "innuendo", difficulty: "hard" },
    { word: "hemorrhage", difficulty: "hard" },
    { word: "gauge", difficulty: "hard" },
    { word: "fluorescent", difficulty: "hard" },
    { word: "exacerbate", difficulty: "hard" },
    { word: "doppelganger", difficulty: "hard" },
    { word: "acquiesce", difficulty: "hard" },
    { word: "anachronism", difficulty: "hard" },
    { word: "ancillary", difficulty: "hard" },
    { word: "annihilate", difficulty: "hard" },
    { word: "antithesis", difficulty: "hard" },
    { word: "apocalypse", difficulty: "hard" },
    { word: "apotheosis", difficulty: "hard" },
    { word: "archipelago", difficulty: "hard" },
    { word: "artifice", difficulty: "hard" },
    { word: "ascertain", difficulty: "hard" },
    { word: "asphyxiate", difficulty: "hard" },
    { word: "assiduous", difficulty: "hard" },
    { word: "auspicious", difficulty: "hard" },
    { word: "autonomous", difficulty: "hard" },
    { word: "belligerent", difficulty: "hard" },
    { word: "bourgeois", difficulty: "hard" },
    { word: "camaraderie", difficulty: "hard" },
    { word: "capitulate", difficulty: "hard" },
    { word: "catastrophe", difficulty: "hard" },
    { word: "caveat", difficulty: "hard" },
    { word: "charlatan", difficulty: "hard" },
    { word: "chicanery", difficulty: "hard" },
    { word: "chrysanthemum", difficulty: "hard" },
    { word: "circumlocution", difficulty: "hard" },
    { word: "clandestine", difficulty: "hard" },
    { word: "cognizant", difficulty: "hard" },
    { word: "colloquial", difficulty: "hard" },
    { word: "commiserate", difficulty: "hard" },
    { word: "connoisseur", difficulty: "hard" },
    { word: "conundrum", difficulty: "hard" },
    { word: "convalescence", difficulty: "hard" },
    { word: "copious", difficulty: "hard" },
    { word: "corroborate", difficulty: "hard" },
    { word: "credulous", difficulty: "hard" },
    { word: "curmudgeon", difficulty: "hard" },
    { word: "debacle", difficulty: "hard" },
    { word: "debilitate", difficulty: "hard" },
    { word: "deleterious", difficulty: "hard" },
    { word: "demagogue", difficulty: "hard" },
    { word: "denouement", difficulty: "hard" },
    { word: "despicable", difficulty: "hard" },
    { word: "deteriorate", difficulty: "hard" },
    { word: "diaphanous", difficulty: "hard" },
    { word: "diffident", difficulty: "hard" },
    { word: "dilettante", difficulty: "hard" },
    { word: "disingenuous", difficulty: "hard" },
    { word: "disparate", difficulty: "hard" },
    { word: "ebullient", difficulty: "hard" },
    { word: "egregious", difficulty: "hard" },
    { word: "eloquent", difficulty: "hard" },
    { word: "enigmatic", difficulty: "hard" },
    { word: "ephemeral", difficulty: "hard" },
    { word: "epitome", difficulty: "hard" },
    { word: "equanimity", difficulty: "hard" },
    { word: "equivocate", difficulty: "hard" },
    { word: "esoteric", difficulty: "hard" },
    { word: "euphemism", difficulty: "hard" },
    { word: "exculpate", difficulty: "hard" },
    { word: "exigent", difficulty: "hard" },
    { word: "extraneous", difficulty: "hard" },
    { word: "facetious", difficulty: "hard" },
    { word: "fastidious", difficulty: "hard" },
    { word: "fortuitous", difficulty: "hard" },
    { word: "garrulous", difficulty: "hard" },
    { word: "gregarious", difficulty: "hard" },
    { word: "harbinger", difficulty: "hard" },
    { word: "hegemony", difficulty: "hard" }
  ];

// --- App state ---
const MAX_TRIES = 2;

const state = {
  currentWord: null,
  correctCount: 0,
  wordsPlayed: 0, // words resolved: correct OR missed after tries run out
  triesLeft: MAX_TRIES
};

// --- Score persistence (localStorage) ---
const STORAGE_KEY = 'spellit-stats';

function loadStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (typeof parsed.correctCount === 'number' && typeof parsed.wordsPlayed === 'number') {
      state.correctCount = parsed.correctCount;
      state.wordsPlayed = parsed.wordsPlayed;
    }
  } catch (err) {
    // localStorage unavailable (private browsing, disabled, etc.) — fall back to in-memory only
    console.warn('Spell It: could not load saved stats.', err);
  }
}

function saveStats() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      correctCount: state.correctCount,
      wordsPlayed: state.wordsPlayed
    }));
  } catch (err) {
    console.warn('Spell It: could not save stats.', err);
  }
}

 // --- Session history (saved snapshots, taken each time progress is reset) ---
const HISTORY_KEY = 'spellit-history';
const MAX_HISTORY_ENTRIES = 50;

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Spell It: could not load history.', err);
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('Spell It: could not save history.', err);
  }
}

function saveSessionSnapshot() {
  if (state.wordsPlayed === 0) return;

  const history = loadHistory();
  const pct = Math.round((state.correctCount / state.wordsPlayed) * 100);
  history.unshift({
    date: new Date().toISOString(),
    correctCount: state.correctCount,
    wordsPlayed: state.wordsPlayed,
    pct
  });
  saveHistory(history.slice(0, MAX_HISTORY_ENTRIES));
}

function deleteHistoryEntry(index) {
  const history = loadHistory();
  history.splice(index, 1);
  saveHistory(history);
  renderHistory();
}

function clearAllHistory() {
  saveHistory([]);
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();
  const emptyMsg = document.getElementById('history-empty');
  const list = document.getElementById('history-list');
  const clearAllRow = document.getElementById('clear-all-row');
  const clearConfirmRow = document.getElementById('clear-confirm-row');

  list.innerHTML = '';
  clearConfirmRow.classList.remove('visible');

  if (history.length === 0) {
    emptyMsg.style.display = 'block';
    clearAllRow.style.display = 'none';
    return;
  }
  emptyMsg.style.display = 'none';
  clearAllRow.style.display = 'flex';

  history.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    const dateLabel = new Date(entry.date).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    item.innerHTML = `
      <span class="history-date">${dateLabel}</span>
      <span class="history-figures">
        <span class="history-raw">${entry.correctCount}/${entry.wordsPlayed}</span>
        <span class="history-pct">${entry.pct}%</span>
        <button class="history-item-delete" data-index="${index}" type="button" aria-label="Delete this session">×</button>
      </span>
    `;
    list.appendChild(item);
  });
}

// --- Sound effects (generated tones via Web Audio API, no audio files needed) ---
const SOUND_KEY = 'spellit-sound-enabled';
let soundEnabled = true;
let audioCtx = null;

function loadSoundPref() {
  try {
    const saved = localStorage.getItem(SOUND_KEY);
    soundEnabled = saved === null ? true : saved === 'true';
  } catch (err) {
    soundEnabled = true;
  }
}

function saveSoundPref() {
  try {
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  } catch (err) {
    console.warn('Spell It: could not save sound preference.', err);
  }
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, startOffset, duration, type = 'sine', peakGain = 0.15) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const startTime = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function playCorrectSound() {
  if (!soundEnabled) return;
  // Ascending arpeggio (C5-E5-G5) landing on a bright two-note "sparkle" chord (C6+E6)
  playTone(523.25, 0.00, 0.11, 'triangle', 0.13);  // C5
  playTone(659.25, 0.08, 0.11, 'triangle', 0.13);  // E5
  playTone(783.99, 0.16, 0.11, 'triangle', 0.13);  // G5
  playTone(1046.50, 0.25, 0.32, 'triangle', 0.16); // C6 — climax note, held longer & louder
  playTone(1318.51, 0.25, 0.32, 'sine', 0.09);      // E6 — layered harmony for sparkle
}

function playIncorrectSound() {
  if (!soundEnabled) return;
  playTone(220, 0, 0.22, 'sine', 0.1); // A3
}

// --- Elements ---
const playBtn = document.getElementById('play-btn');
const wave = document.getElementById('wave');
const form = document.getElementById('spell-form');
const input = document.getElementById('word-input');
const feedback = document.getElementById('feedback');
const statCorrect = document.getElementById('stat-correct');
const statTotal = document.getElementById('stat-total');
const statPct = document.getElementById('stat-pct');
const triesDisplay = document.getElementById('tries-display');

// --- Voice selection: prefer a clearer network voice (e.g. Google) over
// the default local voice, which on Windows is often a robotic SAPI voice ---
let preferredVoice = null;

function pickBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  preferredVoice =
    voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
    voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
    voices.find(v => v.lang === 'en-US') ||
    voices.find(v => v.lang.startsWith('en')) ||
    voices[0];
}

// Voices load asynchronously in some browsers (notably Chrome) —
// grab them once now, and again when the list becomes available.
pickBestVoice();
if ('onvoiceschanged' in window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = pickBestVoice;
}

// --- Pick a new word ---
function pickWord() {
  const entry = words[Math.floor(Math.random() * words.length)];
  state.currentWord = entry.word;
  state.triesLeft = MAX_TRIES;
  updateTriesDisplay();
}

// --- Play word aloud ---
function playWord() {
  if (!state.currentWord) return;
  const utterance = new SpeechSynthesisUtterance(state.currentWord);
  utterance.rate = 0.8;
  utterance.lang = 'en-US';
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.onstart = () => wave.classList.add('playing');
  utterance.onend = () => wave.classList.remove('playing');
  utterance.onerror = () => wave.classList.remove('playing');
  window.speechSynthesis.cancel(); // avoid overlapping calls
  window.speechSynthesis.speak(utterance);
}

playBtn.addEventListener('click', playWord);

// --- Handle submission ---
function handleSubmit() {
  const attempt = input.value.trim().toLowerCase();
  if (!attempt) return;

  const correctWord = state.currentWord.toLowerCase();
  const isCorrect = attempt === correctWord;

  input.classList.remove('correct', 'incorrect');

  if (isCorrect) {
    state.correctCount++;
    state.wordsPlayed++;
    feedback.textContent = `Correct — "${state.currentWord}" is spelled right.`;
    feedback.className = 'feedback correct';
    input.classList.add('correct');
    updateStats();
    playCorrectSound();

    setTimeout(() => {
      input.value = '';
      input.classList.remove('correct');
      feedback.textContent = '';
      pickWord();
      input.focus();
    }, 5000);
    return;
  }

  // Incorrect attempt
  state.triesLeft--;
  input.classList.add('incorrect');
  playIncorrectSound

  if (state.triesLeft > 0) {
    feedback.textContent = `Not quite — ${state.triesLeft} ${state.triesLeft === 1 ? 'try' : 'tries'} left.`;
    feedback.className = 'feedback incorrect';
    updateTriesDisplay();
    setTimeout(() => {
      input.value = '';
      input.classList.remove('incorrect');
    }, 5000);
  } else {
    // Out of tries — mark as missed, reveal the word, move on
    state.wordsPlayed++;
    feedback.textContent = `Out of tries — the word was "${state.currentWord}".`;
    feedback.className = 'feedback incorrect';
    updateStats();
    updateTriesDisplay();

    setTimeout(() => {
      input.value = '';
      input.classList.remove('incorrect');
      feedback.textContent = '';
      pickWord();
      input.focus();
    }, 5000);
  }
}

// --- Tries-remaining indicator ---
function updateTriesDisplay() {
  triesDisplay.textContent = `${state.triesLeft} / ${MAX_TRIES} tries left`;
}

document.getElementById('submit-btn').addEventListener('click', handleSubmit);

form.addEventListener('submit', (e) => e.preventDefault());

// --- Custom on-screen keyboard (avoids native mobile keyboard + autocorrect) ---
document.querySelectorAll('.key[data-key]').forEach(key => {
  key.addEventListener('click', () => {
    input.value += key.dataset.key;
    input.classList.remove('correct', 'incorrect');
    feedback.textContent = '';
    feedback.className = 'feedback';
  });
});

document.getElementById('kb-backspace').addEventListener('click', () => {
  input.value = input.value.slice(0, -1);
});

document.getElementById('kb-enter').addEventListener('click', handleSubmit);

// Physical keyboard still works too (handy on desktop) — the input is
// readonly to block the native mobile keyboard, but we intercept real
// key presses here and apply them the same way as on-screen taps.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    input.value = input.value.slice(0, -1);
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    e.preventDefault();
    input.value += e.key.toLowerCase();
    input.classList.remove('correct', 'incorrect');
    feedback.textContent = '';
    feedback.className = 'feedback';
  }
});

// --- Update score display ---
function updateStats() {
  statCorrect.textContent = state.correctCount;
  statTotal.textContent = state.wordsPlayed;
  const pct = state.wordsPlayed === 0
    ? 0
    : Math.round((state.correctCount / state.wordsPlayed) * 100);
  statPct.textContent = `${pct}%`;

  saveStats();
}

// --- Reset progress ---
const modalOverlay = document.getElementById('modal-overlay');

document.getElementById('reset-btn').addEventListener('click', () => {
  modalOverlay.classList.add('visible');
});

document.getElementById('modal-cancel').addEventListener('click', () => {
  modalOverlay.classList.remove('visible');
});

// Clicking the dark backdrop (outside the modal box) also cancels
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('visible');
});

document.getElementById('modal-confirm').addEventListener('click', () => {
  modalOverlay.classList.remove('visible');
  saveSessionSnapshot();

  state.correctCount = 0;
  state.wordsPlayed = 0;
  updateStats(); // also re-saves the cleared stats to localStorage

  input.value = '';
  input.classList.remove('correct', 'incorrect');
  feedback.textContent = '';
  feedback.className = 'feedback';

  pickWord();
  input.focus();
});

// --- View history panel ---
const historyOverlay = document.getElementById('history-overlay');

document.getElementById('history-btn').addEventListener('click', () => {
  renderHistory();
  historyOverlay.classList.add('visible');
});

document.getElementById('history-close').addEventListener('click', () => {
  historyOverlay.classList.remove('visible');
});

historyOverlay.addEventListener('click', (e) => {
  if (e.target === historyOverlay) historyOverlay.classList.remove('visible');
});

document.getElementById('history-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.history-item-delete');
  if (!btn) return;
  deleteHistoryEntry(Number(btn.dataset.index));
});

const clearConfirmRow = document.getElementById('clear-confirm-row');

document.getElementById('clear-all-btn').addEventListener('click', () => {
  clearConfirmRow.classList.add('visible');
});

document.getElementById('clear-cancel').addEventListener('click', () => {
  clearConfirmRow.classList.remove('visible');
});

document.getElementById('clear-confirm').addEventListener('click', () => {
  clearAllHistory();
});

// --- Sound mute toggle ---
const soundToggleBtn = document.getElementById('sound-toggle');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');

function updateSoundIcon() {
  soundIconOn.style.display = soundEnabled ? 'block' : 'none';
  soundIconOff.style.display = soundEnabled ? 'none' : 'block';
}

soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  saveSoundPref();
  updateSoundIcon();
  if (soundEnabled) playCorrectSound(); // quick audible confirmation that sound is back on
});

// --- Init ---
loadSoundPref();
updateSoundIcon();
loadStats();
updateStats();
pickWord();