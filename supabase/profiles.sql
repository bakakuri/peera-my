-- Peera.My — რეიტინგი. გაუშვი ერთხელ Supabase → SQL Editor-ში.
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text,
  xp         int  not null default 0,
  streak     int  not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists profiles_xp_idx on public.profiles (xp desc);
alter table public.profiles enable row level security;

drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select using (true);
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles for insert with check (user_id = auth.uid());
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
