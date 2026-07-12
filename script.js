// --- Word bank: mixed difficulty for MVP testing ---
const words = [
    { word: "friend", difficulty: "easy" },
    { word: "garden", difficulty: "easy" },
    { word: "purple", difficulty: "easy" },
    { word: "jungle", difficulty: "easy" },
    { word: "pencil", difficulty: "easy" },
    { word: "whisper", difficulty: "easy" },
    { word: "necessary", difficulty: "medium" },
    { word: "occurred", difficulty: "medium" },
    { word: "definitely", difficulty: "medium" },
    { word: "business", difficulty: "medium" },
    { word: "vacuum", difficulty: "medium" },
    { word: "separate", difficulty: "medium" },
    { word: "rhythm", difficulty: "hard" },
    { word: "bureaucrat", difficulty: "hard" },
    { word: "conscientious", difficulty: "hard" },
    { word: "silhouette", difficulty: "hard" },
    { word: "mnemonic", difficulty: "hard" },
    { word: "questionnaire", difficulty: "hard" }
];
 
// --- App state ---
const state = {
    currentWord: null,
    correctCount: 0,
    totalAttempted: 0
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
 
// --- Pick a new word ---
function pickWord() {
    const entry = words[Math.floor(Math.random() * words.length)];
    state.currentWord = entry.word;
}
 
// --- Play word aloud ---
function playWord() {
    if (!state.currentWord) return;
    const utterance = new SpeechSynthesisUtterance(state.currentWord);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
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
 
    state.totalAttempted++;
    input.classList.remove('correct', 'incorrect');
 
    if (isCorrect) {
      state.correctCount++;
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
    } else {
      feedback.textContent = `Not quite — give it another try.`;
      feedback.className = 'feedback incorrect';
      input.classList.add('incorrect');
      updateStats();
      input.select();
    }
}
 
document.getElementById('submit-btn').addEventListener('click', handleSubmit);
 
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
});
 
form.addEventListener('submit', (e) => e.preventDefault());
 
// --- Update score display ---
function updateStats() {
    statCorrect.textContent = state.correctCount;
    statTotal.textContent = state.totalAttempted;
    const pct = state.totalAttempted === 0
      ? 0
      : Math.round((state.correctCount / state.totalAttempted) * 100);
    statPct.textContent = `${pct}%`;
}
 
// --- Init ---
pickWord();