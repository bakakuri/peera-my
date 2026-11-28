# Peera.My V7 — Premium Learning UX

A Georgian-language learning web app with a mobile-first, accessible interface, built with **plain HTML, CSS, JavaScript ES modules** and a Supabase backend. No React, Vue, Tailwind, Bootstrap or localStorage.

## Run locally

```bash
python -m http.server 8080
```

Open http://127.0.0.1:8080 (not `file://`). The app starts in guest mode (IndexedDB), loads JSON seeds, and uses the connected Supabase catalog when available. To sync progress, sign in with Supabase Auth in the profile screen.

## Navigation

- **Main five tabs:** Home `#/home`, Courses `#/learn`, Practice `#/practice`, Dictionary `#/dictionary`, Results `#/results`
- **Courses:** `#/lesson/<id>`, `#/grammar`
- **Practice:** `#/cards`, `#/listening`, `#/games`, `#/plan`
- **Results:** `#/progress`, `#/achievements`, `#/leaderboard`
- **Avatar:** `#/profile`, `#/auth`, `#/support`

All routes are reachable by an intuitive parent section; no ambiguous “More” menu.

## Features

- Lessons have vocabulary, spoken dialogue, a four-question quiz, a **75% pass threshold**, error feedback and saved in-progress draft; returning to the same lesson resumes the draft.
- Flashcards schedule spaced repetition, retain learning state locally or in the signed-in user's cloud JSON progress.
- Dictionary supports search, filters, examples, audio, favorites and recently viewed words.
- Progress and achievements are computed from stored user activity; **new guests have zero fabricated XP/streak**. Existing saved demo accounts are not reset without the user's action.
- Ranking is no longer invented JSON. Signed-in users may opt into a public display name; leaderboard XP comes only from validated server-side lesson completions. An empty list is shown when nobody opts in.
- Account-only support form inserts private messages into Supabase with row-level security.
- Cloud progress remains the user's original `peera_progress` JSON payload; there is no destructive data migration.

## Files

- `css/v7-product.css`: the new product UI, layout overrides and accessibility rules
- `js/views/home.js`, `practice.js`, `results.js`, `lesson.js`, `leaderboard.js`, `support.js`: the new and revised screens
- `js/components/chrome.js`: unified mobile navigation and desktop sidebar
- `js/core/cloud.js`: authentication, content and verified RPC integrations
- `js/core/store.js`: learning and draft state
- `supabase/20261128_v7_learning.sql`: backend migration
- `scripts/test-v7.mjs`: module smoke tests
- `scripts/qa-v7.py`: intercepted-browser route, layout and interaction tests

## Tests

```bash
node scripts/test-v7.mjs
python scripts/qa-v7.py
```

Browser test uses an intercepted offline domain and stubs Supabase network access. It verifies real rendered HTML/JS interactions, **not actual login, SMTP delivery, live network latency or multi-device sync**.

## Product boundaries

- Catalog currently contains 164 sample words and 20 sample lessons; not complete CEFR A1–C2 content.
- Live voice recognition is browser/device dependent; audio uses browser speech synthesis.
- Push reminders do not send notifications yet. The profile UI labels these preferences as demo.
- The backend accepts one verified lesson reward per user and lesson; clients cannot directly insert leaderboard XP. The answers are published in lesson material and a determined user can automate submissions, so the score system is not cheat-proof or appropriate for prizes.
- Review XP is still locally tracked in `peera_progress` and **does not count toward the verified public ranking**.
- External deployment and authenticated Supabase end-to-end testing must still be completed.
