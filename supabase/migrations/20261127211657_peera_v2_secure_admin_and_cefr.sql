-- Peera.My V2: secure admin access, index CEFR, optimize ownership RLS.
-- Existing users, cards, XP, and lessons are preserved.
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA app_private TO authenticated;

CREATE OR REPLACE FUNCTION app_private.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT EXISTS (
   SELECT 1 FROM public.admins
   WHERE user_id = (SELECT auth.uid())
 );
$$;
REVOKE ALL ON FUNCTION app_private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.is_admin() TO authenticated;

-- Admin RLS policies use a private, non-Data-API helper, evaluated once per statement.
ALTER POLICY "admin can insert words" ON public.words TO authenticated
  WITH CHECK ((SELECT app_private.is_admin()));
ALTER POLICY "admin can update words" ON public.words TO authenticated
  USING ((SELECT app_private.is_admin()))
  WITH CHECK ((SELECT app_private.is_admin()));
ALTER POLICY "admin can delete words" ON public.words TO authenticated
  USING ((SELECT app_private.is_admin()));
ALTER POLICY "admin insert lessons" ON public.lessons TO authenticated
  WITH CHECK ((SELECT app_private.is_admin()));
ALTER POLICY "admin update lessons" ON public.lessons TO authenticated
  USING ((SELECT app_private.is_admin()))
  WITH CHECK ((SELECT app_private.is_admin()));
ALTER POLICY "admin delete lessons" ON public.lessons TO authenticated
  USING ((SELECT app_private.is_admin()));

-- Eliminate unsafe email-based automatic superuser assignment.
DROP TRIGGER IF EXISTS on_auth_user_make_admin ON auth.users;
DROP FUNCTION IF EXISTS public.make_first_admin();
DROP FUNCTION IF EXISTS public.is_admin();

-- Keep existing row ownership semantics; improve RLS query planning.
ALTER POLICY "admin can read own row" ON public.admins TO authenticated
  USING (user_id = (SELECT auth.uid()));
ALTER POLICY "own cards select" ON public.user_cards TO authenticated
  USING (user_id = (SELECT auth.uid()));
ALTER POLICY "own cards insert" ON public.user_cards TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "own cards update" ON public.user_cards TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "own stats select" ON public.user_stats TO authenticated
  USING (user_id = (SELECT auth.uid()));
ALTER POLICY "own stats insert" ON public.user_stats TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "own stats update" ON public.user_stats TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "own profile insert" ON public.profiles TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "own profile update" ON public.profiles TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Fill normalized CEFR from each word's JSON (A1/A2/B1/B2 etc).
UPDATE public.words
SET cefr = NULLIF(data #>> '{core,level,cefr}', '')
WHERE cefr IS DISTINCT FROM NULLIF(data #>> '{core,level,cefr}', '');

CREATE OR REPLACE FUNCTION app_private.words_set_cefr()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
 NEW.cefr := NULLIF(NEW.data #>> '{core,level,cefr}', '');
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.words_set_cefr() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS words_set_cefr_from_json ON public.words;
CREATE TRIGGER words_set_cefr_from_json
  BEFORE INSERT OR UPDATE OF data ON public.words
  FOR EACH ROW EXECUTE FUNCTION app_private.words_set_cefr();

CREATE INDEX IF NOT EXISTS words_language_cefr_position_idx
  ON public.words (language_code, cefr, position);
CREATE INDEX IF NOT EXISTS user_cards_word_id_idx
  ON public.user_cards (word_id);

-- Retain the existing DDL event trigger, but remove public RPC execution grants.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
