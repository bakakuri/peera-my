# Peera.My V5 — database deployment record

Project: `jgsorwixqrvgbhxmfspq`. Supabase migration history:
- `peera_archive_legacy_before_json_rebuild`: snapshots of the six legacy public tables were copied into **non-exposed** `peera_archive_20261127`. The copy was verified to match row counts prior to cleanup.
- `peera_json_catalog_and_private_progress`: six legacy public tables were dropped; `peera_catalog` and `peera_progress` were created with RLS and minimal grants.

Initial catalog seeded from ten files in `data/*.json`: 217 rows total. Re-running data seeding requires authenticated administrative access; the browser is read-only on the catalog.

`peera_catalog(kind,id,language_code,position,data)`:
- `SELECT` allowed for `anon` and `authenticated` via public read RLS.
- Client `INSERT/UPDATE/DELETE` denied.

`peera_progress(user_id,data,version,updated_at)`:
- `SELECT`, `INSERT`, `UPDATE` permitted to the signed-in owner only (RLS `user_id=(select auth.uid())`).
- Anonymous access denied.

The old Auth account was **retained** to avoid locking out the owner. All previous XP and learning records were archived, not imported into the new progress table.

**Cautions:** Never put `service_role`/secret keys into frontend JavaScript. XP is currently part of a client-writable JSON record: do not use this table as an authoritative competitive leaderboard until server-side validation is implemented. The seeded leaderboard is explicitly demo data. Configure authentication Site URL and redirect allowlist for the eventual domain in Supabase Dashboard. Do not rerun destructive migration on a live populated database.

The browser currently uses the public legacy anon JWT with the pinned supabase-js 2.45.4 UMD build for compatibility. Both legacy anon and new publishable keys are currently enabled on the project. This must be migrated to the supported current SDK and publishable key before legacy anon retirement (planned early 2027). The anon JWT is a *public low-privilege browser key*, not a secret.
