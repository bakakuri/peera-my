# Peera.My — verification report (2026-11-28)

## Implementation

New modular site, built from an empty GitHub working tree and a blank `peeramy-learn` Supabase application schema. No code from Peera.My V2–V7 was reused.

## Verified

- `npm test` — 17 route render tests, 2 courses, 14 lessons, 132 words.
- Guest state starts at 0 XP, no fake streak or pre-completed lessons.
- Guest review grade writes an SRS due date and XP without double-counting previous lesson completion.
- Lesson draft persists; replay cannot award duplicate XP.
- Favorite toggle and JSON export handling implemented.
- All JS modules pass `node --check`.
- Chromium rendering of 7 major screens at 390px mobile and 1280px desktop: zero horizontal overflow.
- Supabase migration succeeded; 7 application tables have RLS; two public read functions carefully restricted by grants; catalog 2 courses, 14 lessons, 132 words with zero invalid lesson word IDs.
- Server-verified lesson results can only be written via authenticated RPC; ranking shows opted-in learners with verified XP only.

## Not yet verified / limitations

- Browser network policies block navigation to localhost and fake HTTPS origins (`ERR_BLOCKED_BY_ADMINISTRATOR`). Screenshots use browser-rendered **static view HTML** with the exact application CSS, not an interactive end-to-end browser session. The Node tests cover state logic and action methods.
- Real sign-up, email confirmation, authentication token refresh, remote write/read after login, and live RPC must be tested in a real deployed browser.
- Supabase Auth URL configuration and leaked password protection are dashboard settings and are not changed here.
- The app uses browser SpeechSynthesis; audio depends on installed browser voices. No speech-to-text scoring or notifications yet.
- Full CEFR A1–C2 content, content management admin UI, device conflict resolution, Service Worker offline cache and multi-user load testing remain future phases.
- `submit_lesson` and `public_leaderboard` intentionally use SECURITY DEFINER with explicit checks and grants. Supabase security advisors may warn about these RPCs; review periodically.

## Acceptance checks after hosting

1. Open homepage mobile and desktop and complete lesson `de-01` as a guest.
2. Reload, confirm the last stage and SRS ratings persist in IndexedDB.
3. Register a new account, confirm email if required, sign in, save profile, and reload on another device.
4. Complete a lesson signed-in, confirm one `lesson_results` row; repeat it and confirm no extra verified XP.
5. Opt in to the leaderboard; confirm display name and verified XP are visible only after opting in.
6. Try to read another user's `user_state` and write `lesson_results` directly; RLS/grants must deny access.
