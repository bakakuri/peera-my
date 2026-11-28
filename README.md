# Peera.My — V6 Practical UX

A mobile-first language-learning website in Georgian, built with plain HTML, CSS, and JavaScript. The V6 update simplifies the interface and navigation without replacing its Supabase/IndexedDB integration.

## Run locally

```bash
python -m http.server 8080
```

Open `http://127.0.0.1:8080/`. Do not launch `index.html` from `file://` because the app uses ES modules and `fetch()`.

## Navigation

Mobile: **მთავარი**, **გაკვეთილები**, **ბარათები**, **ლექსიკონი**, **მეტი**. The **მეტი** sheet provides access to progress, achievements, leaderboard, grammar, listening, study plan, games, profile, and authentication. Desktop: the complete sidebar is always visible.

The home page prioritizes **გაგრძელება**, followed by today's goal/reviews, study tools, courses, and an account-sync link.

## Core screens

- `#/home` — resume next unlocked lesson and access study tools
- `#/learn` — select language and scan a linear, labelled lesson list
- `#/lesson/<id>` — word study, dialogue, quiz, and results
- `#/cards` — graded flashcards, spaced repetition, text/audio actions
- `#/dictionary` — live search, filters, favorites, spoken words, example details
- `#/progress` — XP, streak, learning metrics and actual daily activity
- `#/achievements`, `#/leaderboard`, `#/profile`, `#/auth`
- `#/grammar`, `#/listening`, `#/plan`, `#/games`

## Data and persistence

The client loads initial JSON from `data/`, then attempts the read-only Supabase catalog (`peera_catalog`). When Supabase is unavailable, it falls back to JSON. Authenticated users' `peera_progress` writes use RLS-restricted Supabase access. Guest progress stays in IndexedDB. No `localStorage` is used by this application code.

The Supabase project is `peeramy-learn` (`jgsorwixqrvgbhxmfspq`). **No database migration is required for the V6 UI redesign.** The prior archive and existing account records remain unchanged.

## Important limits

- The original demo catalog contains 164 words and 20 lessons, not a complete A1–C2 course.
- Guest accounts begin with sample achievements, XP, and streak to demonstrate the interface; they are explicitly labelled as demo. New authenticated users start without demo progress.
- Leaderboard remains sample JSON data, not an authoritative public user ranking.
- Push notifications are not implemented; the setting is cosmetic.
- XP is calculated client-side and is not suitable for a fraud-resistant competitive ranking.
- Full authenticated-browser E2E testing against live Supabase is still required; the dev environment blocks Chromium navigation to localhost and external webpages.

## Verification

```bash
node scripts/test-v6.mjs
```

This runs route rendering and module interaction smoke tests without changing the real database. See `QA-REPORT.md` for tested limits.
