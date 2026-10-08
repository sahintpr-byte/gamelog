-- Run this in Supabase SQL Editor before deploying app.js.

alter table public.lists
  add column if not exists is_public boolean not null default false;

alter table public.lists enable row level security;
alter table public.profiles enable row level security;
alter table public.game_lists enable row level security;

drop policy if exists "users can publish own lists" on public.lists;
create policy "users can publish own lists"
on public.lists for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "public can read shared lists" on public.lists;
create policy "public can read shared lists"
on public.lists for select to anon, authenticated
using (is_public = true);

drop policy if exists "public can read owners of shared lists" on public.profiles;
create policy "public can read owners of shared lists"
on public.profiles for select to anon, authenticated
using (exists (
  select 1 from public.lists l
  where l.user_id = profiles.id and l.is_public = true
));

drop policy if exists "public can read shared games" on public.game_lists;
create policy "public can read shared games"
on public.game_lists for select to anon, authenticated
using (exists (
  select 1 from public.lists l
  where l.id = game_lists.list_id
    and l.user_id = game_lists.user_id
    and l.is_public = true
));
