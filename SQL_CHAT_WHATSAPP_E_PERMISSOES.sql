-- CORREÇÃO DO CHAT CLIENTE <-> GESTÃO HUSKY
-- Rode este arquivo no Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  address text,
  birthday date,
  notes text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists birthday date;
alter table public.profiles add column if not exists notes text;
alter table public.profiles add column if not exists status text default 'active';
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

insert into public.profiles(id, email, name, status)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', split_part(u.email,'@',1)), 'active'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text,
  email text,
  role text default 'admin',
  permissions jsonb default '["all"]'::jsonb,
  active boolean default true,
  last_access timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.admin_users add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.admin_users add column if not exists name text;
alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists role text default 'admin';
alter table public.admin_users add column if not exists permissions jsonb default '["all"]'::jsonb;
alter table public.admin_users add column if not exists active boolean default true;
alter table public.admin_users add column if not exists last_access timestamptz;
alter table public.admin_users add column if not exists created_at timestamptz default now();
alter table public.admin_users add column if not exists updated_at timestamptz default now();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
      and a.active = true
  );
$$;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid null,
  sender text not null check (sender in ('customer','store','system')),
  message text not null,
  attachments jsonb default '[]'::jsonb,
  read_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.chat_messages add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.chat_messages add column if not exists order_id uuid;
alter table public.chat_messages add column if not exists sender text;
alter table public.chat_messages add column if not exists message text;
alter table public.chat_messages add column if not exists attachments jsonb default '[]'::jsonb;
alter table public.chat_messages add column if not exists read_at timestamptz;
alter table public.chat_messages add column if not exists created_at timestamptz default now();
alter table public.chat_messages add column if not exists updated_at timestamptz default now();

create index if not exists idx_chat_messages_user_created on public.chat_messages(user_id, created_at);
create index if not exists idx_chat_messages_order_created on public.chat_messages(order_id, created_at);

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

drop policy if exists "admin_users_select_self_or_admin" on public.admin_users;
create policy "admin_users_select_self_or_admin" on public.admin_users for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "chat_select_own_or_admin" on public.chat_messages;
create policy "chat_select_own_or_admin" on public.chat_messages for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "chat_customer_insert" on public.chat_messages;
create policy "chat_customer_insert" on public.chat_messages for insert with check (auth.uid() = user_id and sender = 'customer');

drop policy if exists "chat_admin_insert" on public.chat_messages;
create policy "chat_admin_insert" on public.chat_messages for insert with check (public.is_admin() and sender in ('store','system'));

drop policy if exists "chat_admin_update" on public.chat_messages;
create policy "chat_admin_update" on public.chat_messages for update using (public.is_admin() or auth.uid() = user_id) with check (public.is_admin() or auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.chat_messages to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.admin_users to authenticated;

alter table public.chat_messages replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null; when others then null; end $$;

create or replace function public.handle_new_husky_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,email,name,phone,address,status)
  values(
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'phone',''),
    coalesce(new.raw_user_meta_data->>'address',''),
    'active'
  )
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end $$;

drop trigger if exists on_auth_user_created_husky_profile on auth.users;
create trigger on_auth_user_created_husky_profile
after insert on auth.users
for each row execute function public.handle_new_husky_user();
