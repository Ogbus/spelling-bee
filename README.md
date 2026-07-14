Spell It

A single-page spelling practice web app. A word is spoken aloud via text-to-speech, and the user spells it back using a custom on-screen keyboard. Built as a lightweight, no-backend, single HTML file — no frameworks, no build step.

Features


Audio playback — words are read aloud using the Web Speech API (SpeechSynthesis), no audio files or backend required
Custom on-screen keyboard — a QWERTY layout built from scratch, used instead of the device's native keyboard
5 tries per word — a live counter shows tries remaining; running out reveals the word and moves on automatically
Score tracking — correct count, words played, and accuracy percentage, calculated per word (not per keystroke)
Responsive design — tested and tuned for both desktop and mobile screens
100-word bank — tiered across easy, medium, and hard difficulty


Tech Stack


Vanilla HTML, CSS, and JavaScript — single file, no dependencies
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

Deferred / Future Features


localStorage persistence — currently all progress resets on page refresh; persisting score and word history is planned for a later pass
Additional user stories beyond the initial MVP set (to be documented as they're implemented)
Possible difficulty-tier progression, using the difficulty tags already present in the word bank


Development Philosophy

Consistent with other projects in this portfolio (e.g. Mindpage), Spell It favors a single-file, dependency-free build — prioritizing simplicity and portability over framework overhead.
