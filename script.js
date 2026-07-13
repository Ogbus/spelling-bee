// --- Word bank: mixed difficulty, 100 words for MVP testing ---
const words = [
  // Easy (34)
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

  // Medium (33)
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

  // Hard (33)
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
  { word: "doppelganger", difficulty: "hard" }
];

// --- App state ---
const MAX_TRIES = 5;

const state = {
  currentWord: null,
  correctCount: 0,
  wordsPlayed: 0, // words resolved: correct OR missed after tries run out
  triesLeft: MAX_TRIES
};

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

    setTimeout(() => {
      input.value = '';
      input.classList.remove('correct');
      feedback.textContent = '';
      pickWord();
      input.focus();
    }, 1100);
    return;
  }

  // Incorrect attempt
  state.triesLeft--;
  input.classList.add('incorrect');

  if (state.triesLeft > 0) {
    feedback.textContent = `Not quite — ${state.triesLeft} ${state.triesLeft === 1 ? 'try' : 'tries'} left.`;
    feedback.className = 'feedback incorrect';
    updateTriesDisplay();
    setTimeout(() => {
      input.value = '';
      input.classList.remove('incorrect');
    }, 500);
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
    }, 1600);
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
}

// --- Init ---
pickWord();