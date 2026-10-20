-- Admin kullanıcı listesi ve silme işlemleri.
-- Supabase SQL Editor'da bir kez çalıştırın.
-- Aşağıdaki INSERT satırındaki e-postayı gerçek admin hesabınızla değiştirin.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

-- Örnek yetkilendirme:
-- insert into public.admin_users(user_id)
-- select id from auth.users where email = 'admin@example.com'
-- on conflict (user_id) do nothing;

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
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'Admin yetkisi gerekli';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'Aktif admin hesabı silinemez';
  end if;

  -- İlişkili tabloların foreign key ON DELETE CASCADE kuralları çalışır.
  delete from auth.users where id = target_user_id;
  return found;
end;
$$;

revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
