// --- Word bank (data lives in words.js: 1000 words, tiered easy/medium/hard) ---
  // The word bank is kept in its own file so this one holds only app logic.
  const words = WORDS;



// --- App state ---
const MAX_TRIES = 2;

const state = {
  currentWord: null,
  correctCount: 0,
  wordsPlayed: 0, // words resolved: correct OR missed after tries run out
  triesLeft: MAX_TRIES
};

let resolving = false; // true while waiting to advance to the next word

// --- Daily Word + Streak ---
const DAILY_KEY = 'spellit-daily';
const STREAK_KEY = 'spellit-streak';
const MODE_KEY = 'spellit-mode';
const DIFFICULTY_KEY = 'spellit-difficulty';

let mode = 'practice'; // 'practice' | 'daily'
let difficulty = 'all'; // 'all' | 'easy' | 'medium' | 'hard'

const dailyState = {
  date: null,
  word: null,
  completed: false,
  correct: false,
  triesLeft: MAX_TRIES
};

const dailyStreak = {
  current: 0,
  best: 0,
  lastPlayedDate: null
};

// Local (not UTC) date, so the daily word rolls over at local midnight.
function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return localDateStr(new Date(y, m - 1, d + days));
}

function isYesterday(dateStr) {
  return dateStr === addDays(localDateStr(), -1);
}

// Deterministic per day, stable across devices and reloads — no backend needed.
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function dailyWordFor(dateStr) {
  let idx = djb2(dateStr) % words.length;
  const prevIdx = djb2(addDays(dateStr, -1)) % words.length;
  if (idx === prevIdx) idx = (idx + 1) % words.length; // avoid back-to-back repeats
  return words[idx].word;
}

function loadDaily() {
  try {
    const saved = localStorage.getItem(DAILY_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.warn('Spell It: could not load daily word.', err);
    return null;
  }
}

function saveDaily() {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({
      date: dailyState.date,
      word: dailyState.word,
      completed: dailyState.completed,
      correct: dailyState.correct
    }));
  } catch (err) {
    console.warn('Spell It: could not save daily word.', err);
  }
}

function loadStreak() {
  try {
    const saved = localStorage.getItem(STREAK_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (typeof parsed.current === 'number' && typeof parsed.best === 'number') {
      dailyStreak.current = parsed.current;
      dailyStreak.best = parsed.best;
      dailyStreak.lastPlayedDate = parsed.lastPlayedDate || null;
    }
  } catch (err) {
    console.warn('Spell It: could not load streak.', err);
  }
}

function saveStreak() {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify({
      current: dailyStreak.current,
      best: dailyStreak.best,
      lastPlayedDate: dailyStreak.lastPlayedDate
    }));
  } catch (err) {
    console.warn('Spell It: could not save streak.', err);
  }
}

function loadMode() {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === 'daily') mode = 'daily';
  } catch (err) { /* ignore */ }
}

function loadDifficulty() {
  try {
    const saved = localStorage.getItem(DIFFICULTY_KEY);
    if (saved === 'all' || saved === 'easy' || saved === 'medium' || saved === 'hard') {
      difficulty = saved;
    }
  } catch (err) { /* ignore */ }
}

function saveDifficulty() {
  try {
    localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch (err) { /* ignore */ }
}

// A streak only lives if you played today or yesterday — otherwise it's dead.
function streakAliveToday() {
  const today = localDateStr();
  return dailyStreak.lastPlayedDate === today || dailyStreak.lastPlayedDate === addDays(today, -1);
}

function initDaily() {
  const today = localDateStr();
  const saved = loadDaily();

  if (saved && saved.date === today && typeof saved.word === 'string') {
    dailyState.date = saved.date;
    dailyState.word = saved.word;
    dailyState.completed = Boolean(saved.completed);
    dailyState.correct = Boolean(saved.correct);
  } else {
    // New day (or first visit): roll today's word.
    dailyState.date = today;
    dailyState.word = dailyWordFor(today);
    dailyState.completed = false;
    dailyState.correct = false;
    saveDaily();
  }

  dailyState.triesLeft = dailyState.completed ? 0 : MAX_TRIES;

  loadStreak();
  if (!streakAliveToday()) dailyStreak.current = 0; // display "dead" streak as 0
}

function resolveDaily(correct) {
  const today = localDateStr();
  dailyState.completed = true;
  dailyState.correct = correct;
  dailyState.triesLeft = 0;
  saveDaily();

  if (correct) {
    dailyStreak.current = isYesterday(dailyStreak.lastPlayedDate) ? dailyStreak.current + 1 : 1;
    dailyStreak.best = Math.max(dailyStreak.best, dailyStreak.current);
  } else {
    dailyStreak.current = 0; // a miss breaks the streak immediately
  }
  dailyStreak.lastPlayedDate = today;
  saveStreak();

  incrementGoal(); // the daily word is also one practiced word
}

function renderDaily() {
  const today = localDateStr();
  const dayLabel = document.getElementById('daily-day');
  const streakLabel = document.getElementById('daily-streak');
  const msg = document.getElementById('daily-msg');
  const doneCard = document.getElementById('daily-done');
  const doneTitle = document.getElementById('daily-done-title');
  const doneBody = document.getElementById('daily-done-body');
  const interaction = document.getElementById('interaction');

  const alive = streakAliveToday();
  streakLabel.textContent = alive && dailyStreak.current > 0
    ? `${dailyStreak.current} 🔥 · best ${dailyStreak.best}`
    : `No streak${dailyStreak.best > 0 ? ` · best ${dailyStreak.best}` : ''}`;

  if (!dailyState.completed) {
    interaction.hidden = false;
    doneCard.hidden = true;
    dailyDoneHint.hidden = true;
    if (isYesterday(dailyStreak.lastPlayedDate) && dailyStreak.current > 0) {
      msg.textContent = 'Play today to keep your streak alive.';
    } else if (dailyStreak.current > 0) {
      msg.textContent = 'Spell it correctly to keep the streak going.';
    } else {
      msg.textContent = 'Spell today\'s word correctly to start a streak.';
    }
    updateTriesDisplay();
  } else {
    interaction.hidden = true;
    doneCard.hidden = false;
    showDailyHint(dailyState.word);
    if (dailyState.correct) {
      doneTitle.textContent = 'Correct — nice work!';
      doneBody.textContent = `You spelled “${dailyState.word}” right. Streak: ${dailyStreak.current} 🔥 (best ${dailyStreak.best}).`;
    } else {
      doneTitle.textContent = 'Out of tries';
      doneBody.textContent = `The word was “${dailyState.word}”. A miss breaks the streak — best is still ${dailyStreak.best}.`;
    }
  }
}

function handleDailySubmit() {
  if (dailyState.completed) return;

  const attempt = input.value.trim().toLowerCase();
  if (!attempt) return;

  input.classList.remove('correct', 'incorrect');

  if (attempt === dailyState.word) {
    resolveDaily(true);
    input.classList.add('correct');
    feedback.textContent = `Correct — “${dailyState.word}” is spelled right.`;
    feedback.className = 'feedback correct';
    playCorrectSound();
  } else {
    dailyState.triesLeft--;
    input.classList.add('incorrect');
    playIncorrectSound();
    if (dailyState.triesLeft > 0) {
      feedback.textContent = `Not quite — ${dailyState.triesLeft} ${dailyState.triesLeft === 1 ? 'try' : 'tries'} left.`;
      feedback.className = 'feedback incorrect';
    } else {
      resolveDaily(false);
      feedback.textContent = `Out of tries — the word was “${dailyState.word}”.`;
      feedback.className = 'feedback incorrect';
    }
  }
  updateTriesDisplay();
  renderDaily();
}

function setMode(next) {
  mode = next;
  saveMode();
  document.body.classList.toggle('mode-daily', mode === 'daily');

  document.getElementById('mode-practice').classList.toggle('active', mode === 'practice');
  document.getElementById('mode-practice').setAttribute('aria-pressed', String(mode === 'practice'));
  document.getElementById('mode-daily').classList.toggle('active', mode === 'daily');
  document.getElementById('mode-daily').setAttribute('aria-pressed', String(mode === 'daily'));

  document.getElementById('daily-panel').hidden = mode !== 'daily';

  // Reset the shared interaction input whenever switching modes.
  if (input) {
    input.value = '';
    input.classList.remove('correct', 'incorrect');
  }
  if (feedback) {
    feedback.textContent = '';
    feedback.className = 'feedback';
  }
  clearHintCard();

  if (mode === 'daily') {
    renderDaily();
  } else {
    document.getElementById('interaction').hidden = false;
    document.getElementById('daily-done').hidden = true;
    updateTriesDisplay();
  }
  if (input) input.focus();
}

function saveMode() {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch (err) { /* ignore */ }
}

document.getElementById('mode-practice').addEventListener('click', () => setMode('practice'));
document.getElementById('mode-daily').addEventListener('click', () => setMode('daily'));

function setDifficulty(next) {
  difficulty = next;
  saveDifficulty();
  document.querySelectorAll('#difficulty-toggle .mode-btn').forEach(btn => {
    const active = btn.dataset.difficulty === next;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  pickWord();
}

document.querySelectorAll('#difficulty-toggle .mode-btn').forEach(btn => {
  btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
});

// Roll over at local midnight (no reload needed) while in daily mode.
setInterval(() => {
  const today = localDateStr();
  if (dailyState.date !== today) {
    initDaily();
    if (mode === 'daily') renderDaily();
  }
  if (dailyGoal.date !== today) initGoal();
}, 60000);

// --- Daily goal (word-count, per local day) ---
const GOAL_KEY = 'spellit-goal';

const dailyGoal = {
  date: null,
  target: null, // null/0 = no goal set
  progress: 0,
  completed: false
};

function loadGoal() {
  try {
    const saved = localStorage.getItem(GOAL_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (typeof parsed.date === 'string' && typeof parsed.target === 'number') {
      dailyGoal.date = parsed.date;
      dailyGoal.target = parsed.target;
      dailyGoal.progress = typeof parsed.progress === 'number' ? parsed.progress : 0;
      dailyGoal.completed = Boolean(parsed.completed);
    }
  } catch (err) {
    console.warn('Spell It: could not load goal.', err);
  }
}

function saveGoal() {
  try {
    localStorage.setItem(GOAL_KEY, JSON.stringify(dailyGoal));
  } catch (err) {
    console.warn('Spell It: could not save goal.', err);
  }
}

function initGoal() {
  loadGoal();
  const today = localDateStr();

  // New day (or no stored goal): roll over today's progress.
  if (dailyGoal.date !== today) {
    dailyGoal.date = today;
    dailyGoal.progress = 0;
    dailyGoal.completed = false;
    saveGoal();
  }
  renderGoal();
}

function setGoal(target) {
  dailyGoal.date = localDateStr();
  dailyGoal.target = target; // 0 = no goal
  dailyGoal.progress = 0;
  dailyGoal.completed = false;
  saveGoal();
  renderGoal();
}

// One resolved word — correct or missed — counts toward the goal.
function incrementGoal() {
  if (!dailyGoal.target) return;

  const today = localDateStr();
  if (dailyGoal.date !== today) initGoal();

  dailyGoal.progress++;
  if (!dailyGoal.completed && dailyGoal.progress >= dailyGoal.target) {
    dailyGoal.completed = true;
    playCorrectSound(); // goal reached — rewarding payoff
  }
  saveGoal();
  renderGoal();
}

function resetGoalToday() {
  if (!dailyGoal.target) return;
  dailyGoal.date = localDateStr();
  dailyGoal.progress = 0;
  dailyGoal.completed = false;
  saveGoal();
  renderGoal();
}

function renderGoal() {
  const headEl = document.getElementById('goal-head');
  const trackEl = document.getElementById('goal-track');
  const captionEl = document.getElementById('goal-caption');

  if (!dailyGoal.target) {
    headEl.innerHTML = `
      <span class="goal-label">Daily goal</span>
      <button type="button" class="goal-set-btn" id="goal-set-btn">Set goal</button>
    `;
    trackEl.innerHTML = '';
    captionEl.textContent = 'Set a daily word goal to keep your practice consistent.';
    document.getElementById('goal-set-btn').addEventListener('click', openGoalModal);
    return;
  }

  const pct = dailyGoal.completed ? 100 : Math.min(100, Math.round((dailyGoal.progress / dailyGoal.target) * 100));
  headEl.innerHTML = `
    <span class="goal-label">Daily goal${dailyGoal.completed ? ' · met!' : ''}</span>
    <span class="goal-count">${dailyGoal.progress}/${dailyGoal.target}</span>
    <button type="button" class="goal-set-btn" id="goal-set-btn">Change</button>
  `;
  trackEl.innerHTML = `<div class="goal-fill${dailyGoal.completed ? ' complete' : ''}" style="width:${pct}%"></div>`;
  captionEl.textContent = dailyGoal.completed
    ? 'Goal met — set a higher one or call it a day.'
    : `${dailyGoal.target - dailyGoal.progress} ${dailyGoal.target - dailyGoal.progress === 1 ? 'word' : 'words'} to go.`;
  document.getElementById('goal-set-btn').addEventListener('click', openGoalModal);
}

const goalOverlay = document.getElementById('goal-overlay');

function openGoalModal() {
  document.querySelectorAll('.goal-option').forEach(opt => {
    opt.classList.toggle('active', Number(opt.dataset.goal) === dailyGoal.target);
  });
  goalOverlay.classList.add('visible');
}

document.getElementById('goal-cancel').addEventListener('click', () => {
  goalOverlay.classList.remove('visible');
});

document.getElementById('goal-none').addEventListener('click', () => {
  setGoal(0);
  goalOverlay.classList.remove('visible');
});

goalOverlay.addEventListener('click', (e) => {
  if (e.target === goalOverlay) goalOverlay.classList.remove('visible');
});

document.querySelectorAll('.goal-option').forEach(opt => {
  opt.addEventListener('click', () => {
    setGoal(Number(opt.dataset.goal));
    goalOverlay.classList.remove('visible');
  });
});

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
const hintCard = document.getElementById('hint-card');
const hintWord = document.getElementById('hint-word');
const hintMeaning = document.getElementById('hint-meaning');
const hintExample = document.getElementById('hint-example');
const dailyDoneHint = document.getElementById('daily-done-hint');
const dailyDoneHintWord = document.getElementById('daily-done-hint-word');
const dailyDoneHintMeaning = document.getElementById('daily-done-hint-meaning');
const dailyDoneHintExample = document.getElementById('daily-done-hint-example');

// --- Vocab hints (definitions + example sentences, offline word-bank) ---
function definitionFor(word) {
  return (typeof DEFINITIONS === 'object' && DEFINITIONS !== null)
    ? DEFINITIONS[word.toLowerCase()] || null
    : null;
}

function fillHintCard(cardWordEl, cardMeaningEl, cardExampleEl, word) {
  const def = definitionFor(word);
  if (!def) return false;
  cardWordEl.textContent = `“${word}”`;
  cardMeaningEl.textContent = def.meaning;
  cardExampleEl.textContent = `Example: ${def.example}`;
  return true;
}

function showPracticeHint(word) {
  if (fillHintCard(hintWord, hintMeaning, hintExample, word)) hintCard.hidden = false;
}

function clearHintCard() {
  hintCard.hidden = true;
  hintWord.textContent = '';
  hintMeaning.textContent = '';
  hintExample.textContent = '';
}

function showDailyHint(word) {
  if (fillHintCard(dailyDoneHintWord, dailyDoneHintMeaning, dailyDoneHintExample, word)) {
    dailyDoneHint.hidden = false;
  }
}

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
  const pool = difficulty === 'all' ? words : words.filter(w => w.difficulty === difficulty);
  if (!pool.length) return; // no words match the selected difficulty (shouldn't happen)
  const entry = pool[Math.floor(Math.random() * pool.length)];
  state.currentWord = entry.word;
  state.triesLeft = MAX_TRIES;
  updateTriesDisplay();
}

// --- Play word aloud ---
function playWord() {
  const word = mode === 'daily' ? dailyState.word : state.currentWord;
  if (!word) return;
  const utterance = new SpeechSynthesisUtterance(word);
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
  if (mode === 'daily') {
    handleDailySubmit();
    return;
  }

  if (resolving) return;

  const attempt = input.value.trim().toLowerCase();
  if (!attempt) return;

  const correctWord = state.currentWord.toLowerCase();
  const isCorrect = attempt === correctWord;

  input.classList.remove('correct', 'incorrect');

  if (isCorrect) {
    state.correctCount++;
    state.wordsPlayed++;
    resolving = true;
    feedback.textContent = `Correct — "${state.currentWord}" is spelled right.`;
    feedback.className = 'feedback correct';
    input.classList.add('correct');
    showPracticeHint(state.currentWord);
    updateStats();
    playCorrectSound();
    incrementGoal();

    setTimeout(() => {
      input.value = '';
      input.classList.remove('correct');
      feedback.textContent = '';
      clearHintCard();
      resolving = false;
      pickWord();
      input.focus();
    }, 5000);
    return;
  }

  // Incorrect attempt
  state.triesLeft--;
  input.classList.add('incorrect');
  playIncorrectSound();

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
    resolving = true;
    feedback.textContent = `Out of tries — the word was "${state.currentWord}".`;
    feedback.className = 'feedback incorrect';
    showPracticeHint(state.currentWord);
    updateStats();
    updateTriesDisplay();
    incrementGoal();

    setTimeout(() => {
      input.value = '';
      input.classList.remove('incorrect');
      feedback.textContent = '';
      clearHintCard();
      resolving = false;
      pickWord();
      input.focus();
    }, 5000);
  }
}

// --- Tries-remaining indicator ---
function updateTriesDisplay() {
  const triesLeft = mode === 'daily' ? dailyState.triesLeft : state.triesLeft;
  triesDisplay.textContent = `${triesLeft} / ${MAX_TRIES} tries left`;
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
    clearHintCard();
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
  if (mode === 'daily' && dailyState.completed) return; // daily word already resolved

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
    clearHintCard();
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
  resetGoalToday();

  input.value = '';
  input.classList.remove('correct', 'incorrect');
  feedback.textContent = '';
  feedback.className = 'feedback';
  clearHintCard();

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

// --- Dark mode toggle ---
const THEME_KEY = 'spellit-theme';
const themeToggleBtn = document.getElementById('theme-toggle');
const themeMoon = document.getElementById('theme-moon');
const themeSun = document.getElementById('theme-sun');
let darkMode = false;

function loadThemePref() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    darkMode = saved === 'dark';
  } catch (err) {
    darkMode = false;
  }
}

function saveThemePref() {
  try {
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  } catch (err) {
    console.warn('Spell It: could not save theme preference.', err);
  }
}

function applyTheme() {
  document.body.classList.toggle('dark', darkMode);
  themeMoon.style.display = darkMode ? 'none' : 'block';
  themeSun.style.display = darkMode ? 'block' : 'none';
}

themeToggleBtn.addEventListener('click', () => {
  darkMode = !darkMode;
  saveThemePref();
  applyTheme();
});

// --- PWA: service worker + install prompt ---
const installBtn = document.getElementById('install-btn');
const installOverlay = document.getElementById('install-overlay');
const installTitle = document.getElementById('install-title');
const installBody = document.getElementById('install-body');
const installConfirm = document.getElementById('install-confirm');
const installCancel = document.getElementById('install-cancel');

let deferredPrompt = null;
let installOffered = false;

try {
  installOffered = localStorage.getItem('spellit-install-offered') === '1';
} catch (err) { /* ignore */ }

// The app needs a secure context + service worker before the browser will offer install.
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.warn('Spell It: service worker registration failed.', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.add('hint-glint');
  // Once per browser: nudge toward installing in Daily mode, where predictability matters.
  if (!installOffered) {
    setTimeout(() => {
      if (deferredPrompt && mode === 'daily') {
        showInstallInfo();
        installOffered = true;
        try { localStorage.setItem('spellit-install-offered', '1'); } catch (err) { /* ignore */ }
      }
    }, 6000);
  }
});

installBtn.addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      installBtn.classList.remove('hint-glint');
    });
  } else {
    showInstallInfo();
  }
});

installConfirm.addEventListener('click', () => {
  installOverlay.classList.remove('visible');
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      installBtn.classList.remove('hint-glint');
    });
  }
});

installCancel.addEventListener('click', () => {
  installOverlay.classList.remove('visible');
});

installOverlay.addEventListener('click', (e) => {
  if (e.target === installOverlay) installOverlay.classList.remove('visible');
});

function showInstallInfo() {
  const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    installTitle.textContent = 'Add Spell It to your Home Screen';
    installBody.textContent = 'Tap the Share button in Safari (the box with the up arrow), then choose "Add to Home Screen". It opens like an app on your home screen.';
    installConfirm.textContent = 'Got it';
    installConfirm.style.display = '';
  } else {
    installTitle.textContent = 'Install Spell It';
    installBody.textContent = 'Install it as an app so it works offline and opens in its own window — like a native app.';
    installConfirm.textContent = deferredPrompt ? 'Install now' : 'Got it';
    installConfirm.style.display = '';
  }
  installOverlay.classList.add('visible');
}

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  installBtn.classList.remove('hint-glint');
});

registerServiceWorker();

// --- Share daily result & export history ---
function buildDailyShareText() {
  const word = dailyState.word;
  const correct = dailyState.correct;
  const emoji = correct ? '✅' : '🔁';
  const meaningLine = definitionFor(word);
  const defText = meaningLine
    ? `"${word}": ${meaningLine.meaning}`
    : `Today's word: ${word}`;

  return [
    `Spell It — daily word ${emoji}`,
    defText,
    correct
      ? `Spelled it right! Streak: ${dailyStreak.current} 🔥 (best ${dailyStreak.best}).`
      : `Missed it — streak is back to ${dailyStreak.current} (best ${dailyStreak.best}).`,
    'Try today\'s word: https://spelling-bee-one-flax.vercel.app/'
  ].join('\n');
}

function shareDailyResult() {
  const text = buildDailyShareText();

  if (navigator.share) {
    return navigator.share({ title: 'Spell It — daily word', text }).catch(() => {});
  }
  copyToClipboard(text);
  return Promise.resolve();
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) { /* ignore */ }
    document.body.removeChild(ta);
  }
  const shareBtn = document.getElementById('daily-share-btn');
  const original = shareBtn.textContent;
  shareBtn.textContent = 'Copied!';
  setTimeout(() => { shareBtn.textContent = original; }, 2000);
}

document.getElementById('daily-share-btn').addEventListener('click', shareDailyResult);

function exportHistory() {
  const history = loadHistory();
  if (!history.length) {
    copyToClipboard('No Spell It history to export yet — play a session, then reset to save it.');
    return;
  }
  const esc = (cell) => `"${String(cell).replace(/"/g, '""')}"`;
  const rows = history.map((entry) => [
    new Date(entry.date).toISOString(),
    entry.correctCount,
    entry.wordsPlayed,
    entry.pct
  ]);
  const csv = 'Date,Correct,Attempted,Accuracy (%)\n' + rows.map((r) => r.map(esc).join(',')).join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spell-it-history-${localDateStr()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById('export-history-btn').addEventListener('click', exportHistory);

// --- Init ---
loadSoundPref();
updateSoundIcon();
loadThemePref();
applyTheme();
loadStats();
updateStats();
loadDifficulty();
setDifficulty(difficulty);
initDaily();
initGoal();
loadMode();
setMode(mode);