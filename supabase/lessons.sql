-- Peera.My — lessons table with access controlled by app_private.is_admin().
-- Run schema.sql and admin.sql first.
CREATE TABLE IF NOT EXISTS public.lessons (
  id text PRIMARY KEY,
  language_code text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lessons_lang_idx ON public.lessons (language_code, position);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons readable" ON public.lessons;
CREATE POLICY "lessons readable" ON public.lessons FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin insert lessons" ON public.lessons;
CREATE POLICY "admin insert lessons" ON public.lessons FOR INSERT
  TO authenticated WITH CHECK ((SELECT app_private.is_admin()));
DROP POLICY IF EXISTS "admin update lessons" ON public.lessons;
CREATE POLICY "admin update lessons" ON public.lessons FOR UPDATE
  TO authenticated USING ((SELECT app_private.is_admin()))
  WITH CHECK ((SELECT app_private.is_admin()));
DROP POLICY IF EXISTS "admin delete lessons" ON public.lessons;
CREATE POLICY "admin delete lessons" ON public.lessons FOR DELETE
  TO authenticated USING ((SELECT app_private.is_admin()));
