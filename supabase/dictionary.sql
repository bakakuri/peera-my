-- Peera.My — ლექსიკონი: ბოლო შეფასების შენახვა (0 ისევ, 1 რთული, 2 კარგი, 3 ადვილი).
-- გაუშვი ერთხელ Supabase → SQL Editor-ში. არსებულ მონაცემებს არ ეხება.
alter table public.user_cards add column if not exists last_grade smallint;
