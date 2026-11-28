# Peera.My — Fresh Learning Platform

**Vanilla HTML + modular CSS/JS + JSON seed + IndexedDB + Supabase**. No React, no Vue, no Tailwind, no localStorage, no SVG assets.

## Run

```bash
python -m http.server 8080
```

Visit http://localhost:8080. Do not use `file://` because the app uses ES modules and `fetch`.

## Product

- 5 main destinations: Home, Courses, Practice, Dictionary, Results
- Lesson flow: vocabulary → grammar → dialogue → quiz → results. Draft progress stored between sessions.
- Spaced-repetition flashcards with four ratings (Again / Hard / Good / Easy)
- Word search, individual word detail, spoken examples, favourites
- Listening, grammar reference, 5-pair memory game, goal planner, achievements
- User profile with daily goal, language, export, reset, feedback
- Supabase Auth and RLS-protected progress sync; anonymous users use IndexedDB
- Opt-in ranking from server-verified lesson points, never client XP
- Empty/loading/error states, keyboard controls, reduced-motion support

## Data

| File | Content |
|---|---|
| `data/courses.json` | 2 A1 courses: German, English |
| `data/lessons.json` | 14 complete sample A1 lessons |
| `data/words.json` | 132 words with Georgian phonetics, translations, sentence pairs |

This is a **working foundation**, not a complete A1–C2 curriculum. The initial catalog contains only the explicitly supplied A1 units. Content requires teaching/editorial review, especially phonetic approximations.

## Supabase

Project: `peeramy-learn` (`jgsorwixqrvgbhxmfspq`). DDL: `sql/001_peera_fresh.sql`. If the SDK can't load, the app continues as a local guest. Browser only contains the public publishable key (never service_role). All seven `public` tables use RLS. `user_state` is readable/writable only by its owner. Only `public.submit_lesson` may write verified lesson results, and only once per lesson. Public ranking returns opted-in learners only.

**Important:** Auth > URL Configuration must include your real deployment domain and redirect URLs before using production email links. Auth > Leaked password protection should be enabled when available. These are dashboard settings, not frontend code.

## Deployment

Static files can be deployed to Vercel, GitHub Pages or another HTTPS server. Supabase URL/Publishable key are stored in `js/core/config.js`; these values are public by design. Changing the domain requires updating Supabase Auth URL Configuration.

## Limitations / security

- Guest state is device-specific and can be lost if IndexedDB is cleared; account sync requires a verified login.
- Offline catalog comes from bundled JSON. Offline authenticated edits are cached, but automatic conflict-free resync after losing the network is not yet guaranteed: the UI shows a sync error.
- Browser speech synthesis requires voice support. No voice recognition scoring or push notifications.
- Ranking points are server-written but quiz answers are readable in the public catalog. Not robust enough against determined quiz automation. A stronger challenge/attempt API is needed for competitions with prizes.
- Full live sign-up/login/on-device testing is needed after HTTPS deployment.
- Content admin UI, full A1–C2 coursework, automatic email notifications, offline Service Worker and advanced speech assessment are not implemented.
