Spell It

A single-page spelling practice web app. A word is spoken aloud via text-to-speech, and the user spells it back using a custom on-screen keyboard. Built as a lightweight, no-backend static web app — no frameworks, no build step. The 1000-word bank lives in its own file (words.js) so data stays separate from app logic.

Features


Audio playback — words are read aloud using the Web Speech API (SpeechSynthesis), no audio files or backend required

Custom on-screen keyboard — a QWERTY layout built from scratch, used instead of the device's native keyboard

2 tries per word — a live counter shows tries remaining; running out reveals the word and moves on automatically

Score tracking — correct count, words played, and accuracy percentage, calculated per word (not per keystroke)

Responsive design — tested and tuned for both desktop and mobile screens

1000-word bank — tiered easy/medium/hard (333/334/333), generated programmatically from a public frequency word list, deduplicated and validated

Daily Word + Streak — one seeded word per day (deterministic by date, no backend), with a daily streak that grows if you spell the day's word correctly, resets otherwise, and preserves your best streak

Daily goal — a per-day word-count goal (5/10/20/30 words) with a progress bar; every resolved word counts (practice and the daily word), and reaching it locks in a satisfying "met" state

Difficulty selector — pick the practice word pool from All/Easy/Medium/Hard (each tier holds 100 words), persisted across reloads; hidden in Daily mode since the daily word is date-seeded identically for everyone


Tech Stack


Vanilla HTML, CSS, and JavaScript — three static files, no dependencies; the word bank is split into words.js (data only) so app logic in script.js stays separate (separation of concerns)
Web Speech API (SpeechSynthesis) for text-to-speech
No backend, no database — all state is in-memory for this MVP


Challenges & How They Were Resolved

1. Enter key not submitting

Initially, the Enter button was a type="submit" inside a <form>, relying on native form-submission behavior. This didn't reliably fire in all environments.

Fix: Changed the button to type="button" and wired both the button click and the input's Enter keydown directly to a single handleSubmit() function, removing the dependency on native form submission.

2. Unclear audio playback on desktop

Text-to-speech sounded clear on mobile but noticeably robotic on Windows + Chrome. This turned out to be a voice-selection issue — Chrome on Windows can use either a low-quality local SAPI voice or a clearer Google network voice, and the app wasn't explicitly requesting the better one.

Fix: Added a pickBestVoice() function that inspects available voices via speechSynthesis.getVoices() and prefers a Google network voice when available, falling back gracefully if not. Voice loading is asynchronous in some browsers, so this also hooks into the voiceschanged event to catch voices that load late.

3. Native keyboard autocorrect/suggestions undermining the spelling test

On mobile, the device's native keyboard showed word suggestions as the user typed — which defeats the purpose of a spelling app, since a suggestion can hint at the correct spelling.

Fix: Rather than patching this with HTML attributes alone (which only partially works, especially on Android), the text input was made readonly with inputmode="none", fully preventing the native keyboard from appearing. A custom on-screen QWERTY keyboard was built to replace it entirely, giving full control over the typing experience on every platform. Physical keyboard support was preserved for desktop users via a document-level keydown listener.

4. Custom keyboard layout breaking on some mobile devices

After building the custom keyboard, it rendered correctly on most screens but broke (overflowed/squished) on some narrower Android devices.

Fix: The keys originally used a fixed max-width in pixels, which didn't scale correctly across different screen widths. This was replaced with a fully fluid flex: 1; min-width: 0; approach, so each row always divides the exact available width evenly, regardless of device screen size.

5. Scoring semantics with retries

Once a tries-limit was introduced, the original scoring approach (incrementing a counter on every submission) no longer made sense — a single word attempted 4 times would inflate the "attempted" count.

Fix: Refactored scoring to track outcomes per word rather than per submission. A word only counts toward wordsPlayed once it's resolved — either spelled correctly, or missed after all tries are exhausted. Accuracy is calculated as correctCount / wordsPlayed.

6. Scaling the word bank without manual errors

Growing the word list by hand risked duplicate entries and miscounted difficulty tiers as the list got larger.

Fix: The word bank is generated and validated programmatically. For the expansion to 1000 words, a script pulled hermitdave's MIT-licensed en_50k frequency list (50k most common English words) and tiered it for spelling difficulty: a stopword/function-word list strips trivial everyday vocabulary ("that", "have", "help"), everyday verbs ("come", "tell"), contraction fragments, profanity, and proper-noun noise (names, places, months' surnames) so each tier is all real vocabulary; length bands + a frequency floor then separate the tiers — easy = common 5–7 letter words, medium = 7–10 letter words below a frequency cut-off (landing on genuinely tricky spellings like "necessary", "restaurant"), hard = the rarest 9–14 letter words, cross-checked against the WordNet-derived dwyl/english-words dictionary. Deduplication within and across tiers, exact tier counts (333/334/333), charset, and length were all verified by the script before insertion, rather than manually counted and typed.

7. Native confirm() dialog breaking visual consistency

The initial reset confirmation used the browser's native confirm() popup, which looks and feels inconsistent with the rest of the app's custom-styled interface.

Fix: Replaced it with an in-app modal (overlay + dialog box) styled to match the app's existing parchment/ink/gold theme, with dedicated Cancel and Reset buttons and backdrop-click-to-dismiss behavior.

8. Resetting progress meant losing it permanently

The original reset button simply zeroed out all stats, which meant a user couldn't track improvement across sessions over time.

Fix: Reset now saves a snapshot of the current session (date, correct count, words played, accuracy) to a localStorage-backed history log before clearing anything. A "View history" panel — reusing the same in-app modal pattern built for the reset confirmation — lets users review past sessions and see their progress over time.

9. Giving users a reason to return daily, without a backend

The app is fully client-side, so there was no server to coordinate a shared "word of the day" or track returning visits.

Fix: Added a Daily mode. The day's word is selected deterministically by hashing the local date (djb2) and indexing into the word bank, so it's stable per day and identical across devices with zero backend. A streak (localStorage-backed) increments when the daily word is spelled correctly, resets on a miss or a missed day, and preserves the best streak. The selected mode (practice/daily) is also persisted, and the app rolls over to a fresh word automatically at local midnight while open.

10. Turning consistency into a tangible daily target

A streak rewards returning, but offers no short-term target within a single sitting, making a session feel open-ended.

Fix: Added a daily goal (5/10/20/30 words, or none) stored per-day in localStorage with a progress bar. Every resolved word — correct or missed, in practice or the daily round — counts toward it, so a partial day is never wasted (the wider definitions are "resolved" and "same day", both matching how the game already resolves words). Reaching the target flips the bar into a "met" state with a payoff sound. The goal rolls over at local midnight alongside the daily word, and "Reset progress" also resets the day's goal.

11. Letting the word bank filter by difficulty without breaking the daily word

The 1000-word bank is tiered easy/medium/hard, but pickWord() drew from all of it, so a short practice session could serve only hard words. Filtering practice by difficulty was straightforward; the tricky part was that it must NOT apply to Daily mode — the daily word is seeded by date so it's identical across devices, and letting a per-device difficulty setting change it would break that guarantee.

Fix: A four-way "All / Easy / Medium / Hard" toggle in Practice mode filters the pool in pickWord(); the selection is persisted to localStorage like the mode. The toggle is hidden in Daily mode via a body.mode-daily rule, so there's no way for a stale difficulty to leak into the seeded daily word.



