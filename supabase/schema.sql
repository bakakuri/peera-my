-- Peera.My — Supabase სქემა
-- გაუშვი Supabase Dashboard → SQL Editor-ში (ერთხელ).

-- 1) სიტყვები (საჯაროდ წასაკითხი). data სვეტში ინახება მთელი JSON სიტყვა.
create table if not exists public.words (
  id            text primary key,
  language_code text not null,
  cefr          text,
  position      int  not null default 0,
  data          jsonb not null,
  created_at    timestamptz not null default now()
);

alter table public.words enable row level security;

drop policy if exists "words are readable by everyone" on public.words;
create policy "words are readable by everyone"
  on public.words for select using (true);

-- 2) მომხმარებლის ბარათები (SRS მდგომარეობა)
create table if not exists public.user_cards (
  user_id       uuid not null references auth.users(id) on delete cascade,
  word_id       text not null references public.words(id) on delete cascade,
  interval_days int  not null default 0,
  ease          numeric not null default 2.5,
  reps          int  not null default 0,
  lapses        int  not null default 0,
  due_at        timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, word_id)
);

alter table public.user_cards enable row level security;

drop policy if exists "own cards select" on public.user_cards;
drop policy if exists "own cards insert" on public.user_cards;
drop policy if exists "own cards update" on public.user_cards;
create policy "own cards select" on public.user_cards for select using (auth.uid() = user_id);
create policy "own cards insert" on public.user_cards for insert with check (auth.uid() = user_id);
create policy "own cards update" on public.user_cards for update using (auth.uid() = user_id);

-- 3) მომხმარებლის სტატისტიკა
create table if not exists public.user_stats (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  xp               int  not null default 0,
  streak           int  not null default 0,
  best_streak      int  not null default 0,
  last_active      date,
  reviews_total    int  not null default 0,
  reviews_correct  int  not null default 0,
  lessons          int  not null default 0,
  activity         jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "own stats select" on public.user_stats;
drop policy if exists "own stats insert" on public.user_stats;
drop policy if exists "own stats update" on public.user_stats;
create policy "own stats select" on public.user_stats for select using (auth.uid() = user_id);
create policy "own stats insert" on public.user_stats for insert with check (auth.uid() = user_id);
create policy "own stats update" on public.user_stats for update using (auth.uid() = user_id);
