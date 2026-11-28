-- Peera.My — fresh database, 2026-11-28
-- Never put service_role keys in the browser. Run as a database owner.
create table if not exists public.courses (
 id text primary key, name text not null, subtitle text not null,
 flag text not null, tag text not null, level text not null,
 color text not null, lesson_count int not null default 0
);
create table if not exists public.lessons (
 id text primary key,
 course_id text not null references public.courses(id) on delete cascade,
 sort int not null check (sort>0), level text not null,
 title text not null, summary text not null, goal text not null,
 word_ids jsonb not null default '[]'::jsonb,
 grammar text not null, dialogue jsonb not null default '[]'::jsonb,
 xp integer not null default 40,
 published boolean not null default true,
 unique(course_id,sort)
);
create table if not exists public.words (
 id text primary key,
 course_id text not null references public.courses(id) on delete cascade,
 lesson_id text not null references public.lessons(id) on delete cascade,
 sort int not null check(sort>0), level text not null,
 term text not null, phonetic text not null,
 translation text not null, example text not null, example_ge text not null
);
create index if not exists words_course_sort on public.words(course_id,lesson_id,sort);
create index if not exists words_lesson_id_idx on public.words(lesson_id);
create index if not exists lessons_course_sort on public.lessons(course_id,sort);
create table if not exists public.user_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{}'::jsonb check(jsonb_typeof(data)='object'),
 updated_at timestamptz not null default now()
);
create table if not exists public.learner_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(length(display_name) between 1 and 40),
 share_rank boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.lesson_results (
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id text not null references public.lessons(id),
 score smallint not null check(score between 0 and 5),
 total smallint not null check(total between 1 and 5),
 xp int not null check(xp between 0 and 40),
 completed_at timestamptz not null default now(),
 primary key(user_id,lesson_id)
);
create index if not exists lesson_results_user_xp on public.lesson_results(user_id,xp);
create index if not exists lesson_results_lesson_id_idx on public.lesson_results(lesson_id);
create table if not exists public.learner_feedback (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 message text not null check(length(message) between 10 and 1500),
 created_at timestamptz not null default now()
);
create index if not exists learner_feedback_user on public.learner_feedback(user_id,created_at desc);

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.words enable row level security;
alter table public.user_state enable row level security;
alter table public.learner_profiles enable row level security;
alter table public.lesson_results enable row level security;
alter table public.learner_feedback enable row level security;

create policy "Public course catalog" on public.courses for select to anon,authenticated using (true);
create policy "Public published lessons" on public.lessons for select to anon,authenticated using (published=true);
create policy "Public lesson words" on public.words for select to anon,authenticated using (true);
create policy "Read own state" on public.user_state for select to authenticated using (user_id=(select auth.uid()));
create policy "Insert own state" on public.user_state for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Update own state" on public.user_state for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "Read own profile" on public.learner_profiles for select to authenticated using(user_id=(select auth.uid()));
create policy "Insert own profile" on public.learner_profiles for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Update own profile" on public.learner_profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "Read own verified results" on public.lesson_results for select to authenticated using(user_id=(select auth.uid()));
create policy "Write own feedback" on public.learner_feedback for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Read own feedback" on public.learner_feedback for select to authenticated using(user_id=(select auth.uid()));

revoke all on public.courses,public.lessons,public.words,public.user_state,public.learner_profiles,public.lesson_results,public.learner_feedback from public,anon,authenticated;
grant select on public.courses,public.lessons,public.words to anon,authenticated;
grant select,insert,update on public.user_state,public.learner_profiles to authenticated;
grant select on public.lesson_results to authenticated;
grant insert,select on public.learner_feedback to authenticated;

-- One verified credit per lesson; client cannot update lesson_results directly.
create or replace function public.submit_lesson(lesson_key text, submitted_answers jsonb)
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 uid uuid := (select auth.uid());
 v_lesson public.lessons%rowtype;
 total_count int;
 correct_count int;
 existing boolean;
 earned int;
begin
 if uid is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select * into v_lesson from public.lessons where id=lesson_key and published=true;
 if not found then raise exception 'Lesson not found'; end if;
 if jsonb_typeof(submitted_answers) <> 'object' then raise exception 'Answers must be an object'; end if;
 with selected_ids as (
   select value as word_id from jsonb_array_elements_text(v_lesson.word_ids) with ordinality e(value,ord)
   where ord<=5
 ) select count(*), count(*) filter(where submitted_answers ? word_id)
 into total_count,correct_count from selected_ids;
 if total_count<1 or total_count<>correct_count then raise exception 'Incomplete answers'; end if;
 select count(*) into correct_count from (
  select value as word_id from jsonb_array_elements_text(v_lesson.word_ids) with ordinality e(value,ord) where ord<=5
 ) selected_ids join public.words w on w.id=selected_ids.word_id
 where submitted_answers->>w.id = w.translation;
 select exists(select 1 from public.lesson_results where user_id=uid and lesson_id=lesson_key) into existing;
 earned:=case when existing then 0 else 15+correct_count*5 end;
 insert into public.lesson_results(user_id,lesson_id,score,total,xp)
 values(uid,lesson_key,correct_count,total_count,earned)
 on conflict(user_id,lesson_id) do update
 set score=greatest(public.lesson_results.score,excluded.score),completed_at=now();
 return jsonb_build_object('score',correct_count,'total',total_count,'xp',earned);
end;
$$;
revoke all on function public.submit_lesson(text,jsonb) from public,anon,authenticated;
grant execute on function public.submit_lesson(text,jsonb) to authenticated;

create or replace function public.public_leaderboard()
returns table(display_name text,verified_xp bigint)
language sql stable security definer set search_path=''
as $$
 select p.display_name,coalesce(sum(r.xp),0)::bigint as verified_xp
 from public.learner_profiles p
 join public.lesson_results r on r.user_id=p.user_id
 where p.share_rank = true
 group by p.user_id,p.display_name
 having coalesce(sum(r.xp),0)>0
 order by verified_xp desc, p.display_name asc limit 50;
$$;
revoke all on function public.public_leaderboard() from public,anon,authenticated;
grant execute on function public.public_leaderboard() to anon,authenticated;
