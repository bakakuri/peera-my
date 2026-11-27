# Peera.My V2 — Deployment & Supabase verification

**Date:** 2026-11-27

## GitHub
- Repository: `bakakuri/peera-my`; main updated from exact V2 ZIP archive.
- 85 original V2 files, including 49 PNG assets, were uploaded and verified against a local Git tree hash.
- Before the database documentation updates, the deployed tree hash was `15e5b0c2b4077c033d4a76e6d95298e1e4ca82aa`.
- A restore point exists as branch `backup/pre-v2-2026-11-27` (original commit `6b1cce841b3d2e4e122368129a36c1f3ed9fb549`).
- The source now additionally includes the database migration and safe setup scripts.

## Supabase
- Project: `peeramy-learn` (`jgsorwixqrvgbhxmfspq`).
- Applied migration: `20261127211657_peera_v2_secure_admin_and_cefr`.
- Removed the email-based admin signup trigger; existing admin was preserved.
- Moved admin checks into private schema and limited grants; updated RLS policies.
- Backfilled CEFR from each word's JSON and added automatic synchronization trigger.
- Added indexes for `(language_code, cefr, position)` and `user_cards(word_id)`.
- Added 8 non-destructive example lessons (7 German, 1 English).

### Post-change verification
- Words: **7,591**, missing CEFR: **0**, JSON/column CEFR mismatch: **0**.
- German levels: A1 **2,070**, A2 **1,339**, B1 **1,273**, B2 **1,484**.
- English A1: **1,425**.
- Lessons: **8**, admins: **1**, Auth accounts: **1**.
- User stats XP: **670**; public profile XP: **670**. Existing values preserved.
- Admin auto-registration triggers remaining: **0**.
- Public admin helper functions remaining: **0**.
- Security Advisor: one remaining warning, leaked-password protection disabled in Supabase Auth.

## Known limitations
- Authenticated browser end-to-end testing of signup, login, SRS persistence, and admin uploads remains necessary.
- XP can still be modified by the signed-in user via the client; server-side verified rewards are not yet implemented.
- The original `user_cards` table was empty (0 rows) even though review statistics were present. This historical gap is not retroactively repaired.
- There are 8 demo lessons, **not** a complete A1–C2 curriculum.
- `public.profiles_xp_idx` and the newly created SRS index may be unused until more users/data arrive; do not prematurely remove them.
- Supabase Auth's leaked-password protection must be enabled in the project Dashboard; it is not exposed as an action through the current connector.
- GitHub main update does not by itself prove that an external domain/CDN has deployed or that live browser flows pass.

> No users, vocabulary records, XP values, or public profiles were deleted/reset during this deployment.
