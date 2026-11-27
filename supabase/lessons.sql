-- Peera.My — გაკვეთილები ბაზაში. გაუშვი ერთხელ Supabase → SQL Editor-ში (admin.sql-ის შემდეგ).
create table if not exists public.lessons (
  id            text primary key,
  language_code text not null,
  position      int  not null default 0,
  data          jsonb not null,
  created_at    timestamptz not null default now()
);
create index if not exists lessons_lang_idx on public.lessons (language_code, position);
alter table public.lessons enable row level security;

drop policy if exists "lessons readable" on public.lessons;
create policy "lessons readable" on public.lessons for select using (true);
drop policy if exists "admin insert lessons" on public.lessons;
create policy "admin insert lessons" on public.lessons for insert with check (public.is_admin());
drop policy if exists "admin update lessons" on public.lessons;
create policy "admin update lessons" on public.lessons for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete lessons" on public.lessons;
create policy "admin delete lessons" on public.lessons for delete using (public.is_admin());
