-- Admin kullanıcı listesi ve silme işlemleri.
-- Supabase SQL Editor'da bir kez çalıştırın.
-- Admin hesabı: sahintoper@hotmail.com

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

insert into public.admin_users(user_id)
select id from auth.users where email = 'sahintoper@hotmail.com'
on conflict (user_id) do nothing;

create or replace function public.admin_list_users()
returns table (
  id uuid,
  username text,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'Admin yetkisi gerekli';
  end if;

  return query
  select u.id, coalesce(p.username, ''), u.email::text, u.created_at, u.last_sign_in_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

create or replace function public.admin_delete_user(target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  fk record;
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'Admin yetkisi gerekli';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'Aktif admin hesabı silinemez';
  end if;

  delete from public.comments where user_id = target_user_id or game_list_owner_id = target_user_id;
  delete from public.book_comments where user_id = target_user_id or book_list_owner_id = target_user_id;
  delete from public.follows where follower_id = target_user_id or following_id = target_user_id;
  -- Bu tablo için açık temizlik, mevcut projedeki temel kullanıcı FK'sını
  -- garanti altına alır.
  delete from public.game_lists where user_id = target_user_id;
  delete from public.lists where user_id = target_user_id;
  delete from public.book_lists where user_id = target_user_id;
  delete from public.book_lists_meta where user_id = target_user_id;
  delete from public.profiles where id = target_user_id;

  -- Auth kullanıcısına doğrudan bağlı tüm public kayıtlarını önce temizle.
  -- Böylece game_lists, book_lists, follows vb. tablolardaki FK kısıtları
  -- auth.users silme işlemini engellemez.
  for fk in
    select distinct kcu.table_schema, kcu.table_name, kcu.column_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema = kcu.table_schema
    join information_schema.constraint_column_usage ccu
      on tc.constraint_name = ccu.constraint_name
     and tc.constraint_schema = ccu.constraint_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and ccu.table_schema = 'auth'
      and ccu.table_name = 'users'
      and ccu.column_name = 'id'
  loop
    execute format('delete from %I.%I where %I = $1', fk.table_schema, fk.table_name, fk.column_name)
      using target_user_id;
  end loop;

  delete from auth.users where id = target_user_id;
  return found;
end;
$$;

revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
