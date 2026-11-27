-- Peera.My — secure administration bootstrap.
-- Run after schema.sql; for an existing project use supabase/migrations/20261127211657_peera_v2_secure_admin_and_cefr.sql.
-- Never assign admin rights from an email supplied at signup.
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin can read own row" ON public.admins;
CREATE POLICY "admin can read own row" ON public.admins
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA app_private TO authenticated;

CREATE OR REPLACE FUNCTION app_private.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT EXISTS (
   SELECT 1 FROM public.admins
   WHERE user_id = (SELECT auth.uid())
 );
$$;
REVOKE ALL ON FUNCTION app_private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.is_admin() TO authenticated;

DROP POLICY IF EXISTS "admin can insert words" ON public.words;
CREATE POLICY "admin can insert words" ON public.words FOR INSERT
  TO authenticated WITH CHECK ((SELECT app_private.is_admin()));
DROP POLICY IF EXISTS "admin can update words" ON public.words;
CREATE POLICY "admin can update words" ON public.words FOR UPDATE
  TO authenticated USING ((SELECT app_private.is_admin()))
  WITH CHECK ((SELECT app_private.is_admin()));
DROP POLICY IF EXISTS "admin can delete words" ON public.words;
CREATE POLICY "admin can delete words" ON public.words FOR DELETE
  TO authenticated USING ((SELECT app_private.is_admin()));

-- A verified, trusted user must be made admin explicitly by the project owner.
-- Example (do not run without supplying an exact verified user UUID):
-- INSERT INTO public.admins (user_id)
-- SELECT id FROM auth.users WHERE id = '<verified-user-uuid>';
