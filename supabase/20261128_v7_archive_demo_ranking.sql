-- Peera.My V7: archive the previous fabricated demo ranking without losing the seed data.
-- The app now uses public.peera_read_leaderboard() for real opted-in members.
CREATE TABLE IF NOT EXISTS peera_archive_20261127.demo_leaderboard_v4 AS
SELECT * FROM public.peera_catalog WHERE kind='leaderboard';
REVOKE ALL ON peera_archive_20261127.demo_leaderboard_v4 FROM public,anon,authenticated;
DELETE FROM public.peera_catalog WHERE kind='leaderboard';
