# Peera.My V6 — UX and source checks

- Reworked the navigation into 4 direct learning destinations plus a labelled More sheet on mobile; a persistent complete sidebar on desktop.
- Simplified home around one action, a next-lesson CTA, accurate course progress, and straightforward shortcuts.
- Replaced the decorative roadmap with a linear, scannable lesson list, retaining the unlocked/completed rules.
- Added a dictionary term-details modal and kept live search, pagination, favorites, and speech controls.
- Corrected progress visualizations to use real saved `user.daily` values instead of a fabricated random activity heatmap. Guest initial XP/streak are labelled demo.
- Left Supabase connection and `peera_catalog` / `peera_progress` unchanged.

## Tests performed

- `node --check` for all ES modules: passed.
- `node scripts/test-v6.mjs`: 13 route-render smoke tests, course switching, vocabulary details, favorites, card-flip/review persistence calculations: passed.
- Chromium offline static HTML rendering at 390px and 1280px for the dashboard and lessons, plus 7 further mobile screens: passed with zero document horizontal overflow.
- Exact JS rendering/click handlers tested in Node via simulated app data. Screenshots are actual Chromium static rendering of those components, with local PNG assets embedded in the test page.
- **Not tested:** the full browser app startup and live Supabase login/writes; Chromium refuses navigation to `localhost` (`ERR_BLOCKED_BY_ADMINISTRATOR`) in this execution environment.

## No backend changes

This is a UX/frontend-only redesign. The prior user data, Supabase catalog, RLS rules, authentication accounts, and cloud progress are not modified here.
