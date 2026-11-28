# Peera.My V7 — QA report

### Functional and user-experience changes
- Five explicit primary tabs, accessible subroutes, account settings from avatar.
- Course-first Home, resumable lesson drafts, objective quiz pass criteria, no synthetic progress for new guests.
- Dedicated Practice and Results hubs, keyboard focus indicators and responsive mobile / desktop layout.
- Functional support form and opt-in, SQL-validated lesson leaderboard; removed mock leaderboard JSON.

### Verification
- All ES module files parsed with `node --check`.
- `node scripts/test-v7.mjs`: routes, new guest state, navigation, course selection, dictionary details/favorites, SRS review, lesson draft passed.
- `python scripts/qa-v7.py`: 17 routes rendered in headless Chromium at 390px, no horizontal overflow, dictionary search/detail, flashcard flip/grade and lesson quiz all passed; Supabase was replaced by a local controlled stub.
- Supabase migration created four protected database functions (two private definer + two public invoker) and three RLS tables; verified SQL grant state and full quiz via rolled-back test transaction.

### Known limitations
- Real Supabase login/session, cloud writes, password reset and cross-device syncing were not tested in a live browser.
- Language level content is still sample only. Ranking includes server-validated lesson XP, not flashcard XP.
- Reminder notification delivery remains unimplemented and labelled as such in profile.
- Server-validated quiz scoring reduces easy client XP edits, but answers are publicly available so gamification is not fully anti-cheat.
