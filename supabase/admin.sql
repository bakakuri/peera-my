-- Peera.My — ადმინის უფლებები. გაუშვი ერთხელ Supabase → SQL Editor-ში.
-- ადმინი: bakakurigiorgi1@gmail.com (ავტომატურად, რეგისტრაციის დროსაც და უკვე რეგისტრირებულიც).

-- 1) ადმინების ცხრილი
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

drop policy if exists "admin can read own row" on public.admins;
create policy "admin can read own row"
  on public.admins for select using (user_id = auth.uid());

-- 2) შემოწმების ფუნქცია
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 3) მხოლოდ ადმინს შეუძლია სიტყვების დამატება/შეცვლა/წაშლა (წაკითხვა ყველას შეუძლია)
drop policy if exists "admin can insert words" on public.words;
create policy "admin can insert words" on public.words for insert with check (public.is_admin());

drop policy if exists "admin can update words" on public.words;
create policy "admin can update words" on public.words for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin can delete words" on public.words;
create policy "admin can delete words" on public.words for delete using (public.is_admin());

-- 4) უკვე რეგისტრირებული მომხმარებელი ხდება ადმინი
insert into public.admins (user_id, email)
select id, email from auth.users
where lower(email) = 'bakakurigiorgi1@gmail.com'
on conflict (user_id) do nothing;

-- 5) თუ ეს ელფოსტა მომავალში თავიდან დარეგისტრირდება, ისევ ავტომატურად ადმინი იქნება
create or replace function public.make_first_admin()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if lower(new.email) = 'bakakurigiorgi1@gmail.com' then
    insert into public.admins (user_id, email) values (new.id, new.email) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_make_admin on auth.users;
create trigger on_auth_user_make_admin
  after insert on auth.users
  for each row execute function public.make_first_admin();

-- შემოწმება: უნდა დაბრუნდეს 1 ხაზი შენი ელფოსტით
select user_id, email from public.admins;
