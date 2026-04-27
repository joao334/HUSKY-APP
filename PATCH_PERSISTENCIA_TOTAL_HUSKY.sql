
-- PATCH DE PERSISTÊNCIA TOTAL - HUSKY CLIENTE + GESTÃO
-- Rode no Supabase > SQL Editor > New query.
-- Objetivo: impedir que dados alterados no gestor/cliente sumam ao atualizar a página.

create extension if not exists "pgcrypto";

-- ADMIN DA GESTÃO
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

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and active = true
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- PRODUTOS / CARDÁPIO
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  category text default 'Bolos de pote',
  description text,
  details text,
  ingredients text,
  allergens text,
  image_url text,
  price numeric(10,2) default 0,
  promo_price numeric(10,2),
  cost_estimate numeric(10,2) default 0,
  stock integer default 0,
  min_stock integer default 0,
  active boolean default true,
  available boolean default true,
  visible_on_client boolean default true,
  featured boolean default false,
  size text default '250 ml',
  weight text default '250g a 260g',
  preparation_minutes integer default 20,
  tag text,
  sku text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products add column if not exists category text default 'Bolos de pote';
alter table public.products add column if not exists available boolean default true;
alter table public.products add column if not exists visible_on_client boolean default true;
alter table public.products add column if not exists featured boolean default false;
alter table public.products add column if not exists cost_estimate numeric(10,2) default 0;
alter table public.products add column if not exists min_stock integer default 0;
alter table public.products add column if not exists ingredients text;
alter table public.products add column if not exists updated_at timestamptz default now();

-- CONFIGURAÇÕES DA LOJA
create table if not exists public.store_settings (
  key text primary key,
  value jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CATEGORIAS / ADICIONAIS / CUPONS / BANNERS
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer default 0,
  image_url text,
  schedule jsonb default '{}'::jsonb,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.product_addons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  group_name text default 'Adicionais',
  name text not null,
  price numeric(10,2) default 0,
  stock integer default 0,
  required boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text,
  description text,
  discount_type text default 'value',
  discount_value numeric(10,2) default 0,
  min_subtotal numeric(10,2) default 0,
  min_items integer default 0,
  max_uses integer default 0,
  used_count integer default 0,
  first_purchase_only boolean default false,
  free_delivery boolean default false,
  active boolean default true,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.coupons add column if not exists used_count integer default 0;
alter table public.coupons add column if not exists first_purchase_only boolean default false;
alter table public.coupons add column if not exists free_delivery boolean default false;
alter table public.coupons add column if not exists updated_at timestamptz default now();

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  link_type text,
  link_value text,
  sort_order integer default 0,
  clicks integer default 0,
  active boolean default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PERFIL DO CLIENTE
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists birthday date;
alter table public.profiles add column if not exists notes text;
alter table public.profiles add column if not exists status text default 'active';
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- MÓDULOS DA GESTÃO
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  name text,
  category text,
  value numeric(10,2) default 0,
  date date,
  payment_method text,
  quantity numeric default 0,
  supplier text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  product text,
  avg_value numeric(10,2) default 0,
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.internal_tickets (
  id uuid primary key default gen_random_uuid(),
  order_number text,
  customer text,
  type text,
  priority text,
  responsible text,
  status text default 'aberto',
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_number text,
  customer text,
  value numeric(10,2) default 0,
  type text,
  status text default 'solicitado',
  reason text,
  approved_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CHAT / PEDIDOS
alter table public.chat_messages add column if not exists read_at timestamptz;
alter table public.chat_messages add column if not exists updated_at timestamptz default now();
alter table public.customer_orders add column if not exists updated_at timestamptz default now();
alter table public.order_items add column if not exists updated_at timestamptz default now();

-- ATIVAR RLS
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_addons enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;
alter table public.profiles enable row level security;
alter table public.chat_messages enable row level security;
alter table public.customer_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.expenses enable row level security;
alter table public.suppliers enable row level security;
alter table public.internal_tickets enable row level security;
alter table public.refunds enable row level security;

-- LIMPAR POLÍTICAS ANTIGAS COM ESTES NOMES
drop policy if exists "admin read own admin_users" on public.admin_users;
drop policy if exists "public read products" on public.products;
drop policy if exists "admin manage products" on public.products;
drop policy if exists "public read store_settings" on public.store_settings;
drop policy if exists "admin manage store_settings" on public.store_settings;
drop policy if exists "public read categories" on public.product_categories;
drop policy if exists "admin manage categories" on public.product_categories;
drop policy if exists "public read addons" on public.product_addons;
drop policy if exists "admin manage addons" on public.product_addons;
drop policy if exists "public read coupons" on public.coupons;
drop policy if exists "admin manage coupons" on public.coupons;
drop policy if exists "public read banners" on public.banners;
drop policy if exists "admin manage banners" on public.banners;
drop policy if exists "client own profile" on public.profiles;
drop policy if exists "admin manage profiles" on public.profiles;
drop policy if exists "client own chat" on public.chat_messages;
drop policy if exists "admin manage chat" on public.chat_messages;
drop policy if exists "client own orders" on public.customer_orders;
drop policy if exists "admin manage orders" on public.customer_orders;
drop policy if exists "client own order_items" on public.order_items;
drop policy if exists "admin manage order_items" on public.order_items;
drop policy if exists "admin manage expenses" on public.expenses;
drop policy if exists "admin manage suppliers" on public.suppliers;
drop policy if exists "admin manage tickets" on public.internal_tickets;
drop policy if exists "admin manage refunds" on public.refunds;

-- POLÍTICAS
create policy "admin read own admin_users"
on public.admin_users
for select
using (user_id = auth.uid() and active = true);

create policy "public read products"
on public.products
for select
using (active = true and visible_on_client = true);

create policy "admin manage products"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public read store_settings"
on public.store_settings
for select
using (true);

create policy "admin manage store_settings"
on public.store_settings
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public read categories"
on public.product_categories
for select
using (active = true);

create policy "admin manage categories"
on public.product_categories
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public read addons"
on public.product_addons
for select
using (active = true);

create policy "admin manage addons"
on public.product_addons
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public read coupons"
on public.coupons
for select
using (active = true);

create policy "admin manage coupons"
on public.coupons
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public read banners"
on public.banners
for select
using (active = true);

create policy "admin manage banners"
on public.banners
for all
using (public.is_admin())
with check (public.is_admin());

create policy "client own profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "admin manage profiles"
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

create policy "client own chat"
on public.chat_messages
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "admin manage chat"
on public.chat_messages
for all
using (public.is_admin())
with check (public.is_admin());

create policy "client own orders"
on public.customer_orders
for select
using (auth.uid() = user_id);

create policy "admin manage orders"
on public.customer_orders
for all
using (public.is_admin())
with check (public.is_admin());

create policy "client own order_items"
on public.order_items
for select
using (
  exists (
    select 1
    from public.customer_orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create policy "admin manage order_items"
on public.order_items
for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin manage expenses"
on public.expenses
for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin manage suppliers"
on public.suppliers
for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin manage tickets"
on public.internal_tickets
for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin manage refunds"
on public.refunds
for all
using (public.is_admin())
with check (public.is_admin());

-- CONFIGURAÇÃO INICIAL DA LOJA
insert into public.store_settings(key, value)
values (
  'store',
  jsonb_build_object(
    'name','Husky Confeiteiro',
    'description','Bolos de pote artesanais feitos em Embu das Artes.',
    'open', true,
    'delivery_fee', 6.99,
    'free_delivery_from', 45,
    'minimum_order', 18,
    'whatsapp','5511945198349',
    'hours', jsonb_build_object('saturday','19h às 23h','sunday','11h às 21h')
  )
)
on conflict (key) do nothing;
