-- Peera.My V7 additions. Existing catalog, auth and progress stay intact.
create schema if not exists peera_private;
revoke all on schema peera_private from public,anon;
grant usage on schema peera_private to authenticated;
create table if not exists public.peera_verified_lessons (
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id text not null,
 score integer not null check(score between 0 and 4),
 total integer not null check(total between 1 and 4),
 xp integer not null check(xp between 0 and 40),
 completed_at timestamptz not null default now(),
 primary key(user_id,lesson_id)
);
alter table public.peera_verified_lessons enable row level security;
create policy "select personal verified lessons" on public.peera_verified_lessons for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.peera_verified_lessons from public,anon,authenticated;
grant select on public.peera_verified_lessons to authenticated;

create table if not exists public.peera_ranking_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(char_length(display_name) between 2 and 40),
 visible boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.peera_ranking_profiles enable row level security;
create policy "select personal ranking profile" on public.peera_ranking_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "insert personal ranking profile" on public.peera_ranking_profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update personal ranking profile" on public.peera_ranking_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.peera_ranking_profiles from public,anon,authenticated;
grant select,insert,update on public.peera_ranking_profiles to authenticated;

create table if not exists public.peera_feedback (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 category text not null check(category in ('bug','content','idea','other')),
 message text not null check(char_length(message) between 20 and 3000),
 status text not null default 'open' check(status in ('open','resolved')),
 created_at timestamptz not null default now()
);
create index if not exists peera_feedback_user_created_idx on public.peera_feedback(user_id,created_at desc);
alter table public.peera_feedback enable row level security;
create policy "select personal feedback" on public.peera_feedback for select to authenticated using (user_id = (select auth.uid()));
create policy "insert personal feedback" on public.peera_feedback for insert to authenticated with check (user_id = (select auth.uid()) and status='open');
revoke all on public.peera_feedback from public,anon,authenticated;
grant select on public.peera_feedback to authenticated;
grant insert(user_id,category,message) on public.peera_feedback to authenticated;

create or replace function peera_private.score_lesson(p_lesson_id text,p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); lesson jsonb; ids jsonb; word jsonb; i integer; total integer; correct integer := 0; passed boolean; reward integer := 0;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_answers is null or jsonb_typeof(p_answers) <> 'object' then raise exception 'Invalid answer structure'; end if;
 select data into lesson from public.peera_catalog where kind='lessons' and id=p_lesson_id;
 if lesson is null then raise exception 'Unknown lesson'; end if;
 ids := lesson->'wordIds';
 if ids is null or jsonb_typeof(ids)<>'array' then raise exception 'Lesson has no vocabulary'; end if;
 total := least(4,jsonb_array_length(ids));
 if total=0 then raise exception 'Empty lesson'; end if;
 for i in 0..total-1 loop
   if not p_answers ? i::text then raise exception 'Missing answer'; end if;
   select data into word from public.peera_catalog where kind='words' and id=ids->>i;
   if word is null then raise exception 'Unknown word in lesson'; end if;
   if (p_answers ->> (i::text)) = (word ->> 'translation') then correct:=correct+1; end if;
 end loop;
 passed := correct >= ceil(total*0.75)::integer;
 if passed then
   with newly_inserted as (
    insert into public.peera_verified_lessons(user_id,lesson_id,score,total,xp)
    values(uid,p_lesson_id,correct,total,20+correct*5)
    on conflict(user_id,lesson_id) do nothing
    returning xp
   ) select coalesce(max(xp),0) into reward from newly_inserted;
   update public.peera_verified_lessons set score=greatest(score,correct)
   where user_id=uid and lesson_id=p_lesson_id;

 end if;
 return jsonb_build_object('score',correct,'total',total,'passed',passed,'xp',reward);
end; $$;
revoke all on function peera_private.score_lesson(text,jsonb) from public,anon;
grant execute on function peera_private.score_lesson(text,jsonb) to authenticated;
create or replace function public.peera_score_lesson(p_lesson_id text,p_answers jsonb)
returns jsonb language sql security invoker set search_path='' as $$
 select peera_private.score_lesson(p_lesson_id,p_answers);
$$;
revoke all on function public.peera_score_lesson(text,jsonb) from public,anon;
grant execute on function public.peera_score_lesson(text,jsonb) to authenticated;

create or replace function peera_private.read_leaderboard()
returns table(name text,xp bigint,lessons bigint)
language sql stable security definer set search_path='' as $$
  select p.display_name as name,coalesce(sum(l.xp),0)::bigint as xp,count(l.lesson_id)::bigint as lessons
  from public.peera_ranking_profiles p
  left join public.peera_verified_lessons l on l.user_id=p.user_id
  where p.visible is true
  group by p.user_id,p.display_name
  order by xp desc,lessons desc,p.display_name asc limit 50;
$$;
revoke all on function peera_private.read_leaderboard() from public,anon;
grant execute on function peera_private.read_leaderboard() to authenticated;
create or replace function public.peera_read_leaderboard()
returns table(name text,xp bigint,lessons bigint)
language sql stable security invoker set search_path='' as $$
 select * from peera_private.read_leaderboard();
$$;
revoke all on function public.peera_read_leaderboard() from public,anon;
grant execute on function public.peera_read_leaderboard() to authenticated;
