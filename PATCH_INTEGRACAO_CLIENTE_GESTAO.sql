-- PATCH DE INTEGRAÇÃO HUSKY CLIENTE + GESTÃO
-- Rode este arquivo no Supabase SQL Editor depois do SUPABASE_SQL_COMPLETO.sql.
-- Ele reforça: login por e-mail/código no cliente, perfil editável, chat conectado e gestão alterando cliente.

create extension if not exists "pgcrypto";

alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists birthday date;
alter table public.profiles add column if not exists notes text;
alter table public.profiles add column if not exists status text default 'active';

alter table public.products add column if not exists available boolean default true;
alter table public.products add column if not exists visible_on_client boolean default true;
alter table public.products add column if not exists featured boolean default false;
alter table public.products add column if not exists cost_estimate numeric(10,2) default 0;
alter table public.products add column if not exists min_stock integer default 0;

alter table public.chat_messages add column if not exists attachments jsonb default '[]'::jsonb;
alter table public.chat_messages add column if not exists read_at timestamptz;

create or replace function public.handle_new_husky_user()
returns trigger language plpgsql security definer set search_path = public as $$
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
  on conflict (id) do update set
    email=excluded.email,
    name=coalesce(public.profiles.name, excluded.name),
    phone=coalesce(nullif(public.profiles.phone,''), excluded.phone),
    address=coalesce(nullif(public.profiles.address,''), excluded.address);
  return new;
end $$;

drop trigger if exists on_auth_user_created_husky_profile on auth.users;
create trigger on_auth_user_created_husky_profile
after insert on auth.users
for each row execute function public.handle_new_husky_user();

alter table public.profiles enable row level security;
alter table public.chat_messages enable row level security;
alter table public.customer_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "Cliente le proprio perfil" on public.profiles;
create policy "Cliente le proprio perfil" on public.profiles for select using (auth.uid() = id or public.is_admin());
drop policy if exists "Cliente cria proprio perfil" on public.profiles;
create policy "Cliente cria proprio perfil" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Cliente atualiza proprio perfil" on public.profiles;
create policy "Cliente atualiza proprio perfil" on public.profiles for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

drop policy if exists "Cliente le proprio chat" on public.chat_messages;
create policy "Cliente le proprio chat" on public.chat_messages for select using (auth.uid()=user_id or public.is_admin());
drop policy if exists "Cliente envia chat" on public.chat_messages;
create policy "Cliente envia chat" on public.chat_messages for insert with check (auth.uid()=user_id and sender='customer');
drop policy if exists "Admin gerencia chat" on public.chat_messages;
create policy "Admin gerencia chat" on public.chat_messages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Cliente le produtos visiveis" on public.products;
create policy "Cliente le produtos visiveis" on public.products for select using (active = true and available = true and visible_on_client = true);
drop policy if exists "Admin gerencia produtos" on public.products;
create policy "Admin gerencia produtos" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Cliente le cupons ativos" on public.coupons;
create policy "Cliente le cupons ativos" on public.coupons for select using (active = true);

drop policy if exists "Cliente le proprios pedidos" on public.customer_orders;
create policy "Cliente le proprios pedidos" on public.customer_orders for select using (auth.uid()=user_id or public.is_admin());
drop policy if exists "Admin gerencia pedidos" on public.customer_orders;
create policy "Admin gerencia pedidos" on public.customer_orders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Cliente le itens dos proprios pedidos" on public.order_items;
create policy "Cliente le itens dos proprios pedidos" on public.order_items for select using (public.is_admin() or exists(select 1 from public.customer_orders o where o.id=order_items.order_id and o.user_id=auth.uid()));

do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null; when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.customer_orders;
exception when duplicate_object then null; when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null; when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null; when others then null; end $$;
