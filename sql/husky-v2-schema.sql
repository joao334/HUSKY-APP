-- Husky Confeitaria V2 - Supabase schema completo
-- Base compartilhada entre app do cliente e app da gestao.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  name text not null,
  email text unique,
  phone text,
  avatar_url text,
  birth_date date,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  label text not null default 'Casa',
  zipcode text,
  street text not null,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  reference text,
  latitude numeric,
  longitude numeric,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  creative_name text,
  slug text unique not null,
  description text,
  details text,
  price numeric(10,2) not null default 0,
  promotional_price numeric(10,2),
  cost numeric(10,2) not null default 0,
  image_url text,
  category_id uuid references public.categories(id),
  weight text,
  size text,
  ingredients text,
  allergens text,
  preparation_time_minutes int not null default 20,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  stock_quantity int not null default 0,
  minimum_stock int not null default 0,
  popularity_score int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  observation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('value', 'percent', 'free_delivery')),
  discount_value numeric(10,2) not null default 0,
  minimum_order_value numeric(10,2) not null default 0,
  max_uses int,
  uses_count int not null default 0,
  usage_limit_per_user int not null default 1,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  order_number text unique not null,
  status text not null default 'pending' check (status in (
    'pending', 'accepted', 'preparing', 'ready', 'waiting_pickup', 'out_for_delivery',
    'delivered', 'completed', 'cancelled', 'refused', 'payment_pending',
    'payment_failed', 'refund_requested', 'refunded'
  )),
  payment_status text not null default 'pending',
  delivery_type text not null default 'delivery' check (delivery_type in ('delivery', 'pickup', 'scheduled')),
  channel text not null default 'App proprio',
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_id uuid references public.coupons(id) on delete set null,
  customer_observation text,
  estimated_delivery_time timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  observation text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  description text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  method text not null,
  status text not null default 'pending',
  amount numeric(10,2) not null default 0,
  provider text,
  transaction_id text,
  pix_qrcode text,
  pix_copy_paste text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.coupon_usages (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  used_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  product_rating int check (product_rating between 1 and 5),
  delivery_rating int check (delivery_rating between 1 and 5),
  service_rating int check (service_rating between 1 and 5),
  response text,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  sender_id uuid,
  sender_type text not null check (sender_type in ('customer', 'store', 'system')),
  message text not null,
  image_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  order_id uuid references public.orders(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  logo_url text,
  banner_url text,
  is_open boolean not null default true,
  opening_hours jsonb not null default '{}'::jsonb,
  minimum_order_value numeric(10,2) not null default 18,
  default_delivery_fee numeric(10,2) not null default 6.99,
  free_delivery_minimum numeric(10,2) not null default 45,
  estimated_delivery_min int not null default 35,
  estimated_delivery_max int not null default 55,
  whatsapp_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Gestao

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  name text not null,
  email text unique not null,
  phone text,
  avatar_url text,
  role_id uuid references public.roles(id) on delete set null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  unit text not null,
  quantity numeric(12,3) not null default 0,
  minimum_quantity numeric(12,3) not null default 0,
  cost_per_unit numeric(10,2) not null default 0,
  supplier text,
  expiration_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  movement_type text not null check (movement_type in ('entrada', 'saida', 'perda', 'ajuste')),
  quantity numeric(12,3) not null,
  reason text,
  related_order_id uuid references public.orders(id) on delete set null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null,
  amount numeric(10,2) not null,
  quantity numeric(12,3) not null default 1,
  payment_method text,
  supplier text,
  receipt_url text,
  expense_date date not null default current_date,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('payment', 'expense', 'opening', 'closing', 'adjustment')),
  description text not null,
  amount numeric(10,2) not null,
  payment_method text,
  related_order_id uuid references public.orders(id) on delete set null,
  related_expense_id uuid references public.expenses(id) on delete set null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  neighborhood text,
  delivery_fee numeric(10,2) not null default 0,
  minimum_order_value numeric(10,2) not null default 0,
  estimated_min_minutes int,
  estimated_max_minutes int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.couriers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle_type text,
  vehicle_plate text,
  status text not null default 'available',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  courier_id uuid references public.couriers(id) on delete set null,
  assigned_by uuid,
  assigned_at timestamptz not null default now(),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  status text not null default 'assigned'
);

create table if not exists public.printer_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  printer_type text,
  paper_width text,
  auto_print_new_orders boolean not null default false,
  auto_print_accepted_orders boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_type text,
  link_target text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  instagram_id text unique,
  type text not null default 'Post',
  title text,
  caption text,
  image_url text,
  permalink text,
  status text not null default 'Rascunho',
  reach int not null default 0,
  clicks int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  module text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.store_hours (
  id uuid primary key default gen_random_uuid(),
  weekday int not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.special_hours (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices uteis

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active, is_available);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_chat_order on public.chat_messages(order_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);

-- Realtime recomendado no Supabase Dashboard:
-- orders, order_status_history, chat_messages, notifications, products, inventory_items.

-- RLS

alter table public.users enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usages enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.store_settings enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.admin_users enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.expenses enable row level security;
alter table public.cash_movements enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.couriers enable row level security;
alter table public.order_assignments enable row level security;
alter table public.printer_settings enable row level security;
alter table public.marketing_banners enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.store_hours enable row level security;
alter table public.special_hours enable row level security;

-- Politicas de prototipo. Endureca antes de producao.
-- O script derruba e recria as policies para poder ser rodado de novo.

drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories for select using (is_active = true);
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (is_active = true);
drop policy if exists "public read active coupons" on public.coupons;
create policy "public read active coupons" on public.coupons for select using (is_active = true);
drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings" on public.store_settings for select using (true);
drop policy if exists "public read active banners" on public.marketing_banners;
create policy "public read active banners" on public.marketing_banners for select using (is_active = true);
drop policy if exists "public read published instagram" on public.instagram_posts;
create policy "public read published instagram" on public.instagram_posts for select using (status = 'Publicado');
drop policy if exists "public read delivery zones" on public.delivery_zones;
create policy "public read delivery zones" on public.delivery_zones for select using (is_active = true);

-- Em producao, prefira funcoes RPC/Edge Functions para criar pedidos e pagamentos.
-- Estas policies liberam gerenciamento para usuarios autenticados durante o MVP.

drop policy if exists "authenticated manage all users" on public.users;
create policy "authenticated manage all users" on public.users for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all addresses" on public.addresses;
create policy "authenticated manage all addresses" on public.addresses for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all categories" on public.categories;
create policy "authenticated manage all categories" on public.categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all products" on public.products;
create policy "authenticated manage all products" on public.products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all carts" on public.carts;
create policy "authenticated manage all carts" on public.carts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all cart items" on public.cart_items;
create policy "authenticated manage all cart items" on public.cart_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all orders" on public.orders;
create policy "authenticated manage all orders" on public.orders for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all order items" on public.order_items;
create policy "authenticated manage all order items" on public.order_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all order history" on public.order_status_history;
create policy "authenticated manage all order history" on public.order_status_history for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all payments" on public.payments;
create policy "authenticated manage all payments" on public.payments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all coupons" on public.coupons;
create policy "authenticated manage all coupons" on public.coupons for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all coupon usages" on public.coupon_usages;
create policy "authenticated manage all coupon usages" on public.coupon_usages for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all favorites" on public.favorites;
create policy "authenticated manage all favorites" on public.favorites for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all reviews" on public.reviews;
create policy "authenticated manage all reviews" on public.reviews for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all chat" on public.chat_messages;
create policy "authenticated manage all chat" on public.chat_messages for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all notifications" on public.notifications;
create policy "authenticated manage all notifications" on public.notifications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage all settings" on public.store_settings;
create policy "authenticated manage all settings" on public.store_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage admin tables" on public.admin_users;
create policy "authenticated manage admin tables" on public.admin_users for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage roles" on public.roles;
create policy "authenticated manage roles" on public.roles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage permissions" on public.permissions;
create policy "authenticated manage permissions" on public.permissions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage role permissions" on public.role_permissions;
create policy "authenticated manage role permissions" on public.role_permissions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage inventory" on public.inventory_items;
create policy "authenticated manage inventory" on public.inventory_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage inventory movements" on public.inventory_movements;
create policy "authenticated manage inventory movements" on public.inventory_movements for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage expenses" on public.expenses;
create policy "authenticated manage expenses" on public.expenses for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage cash" on public.cash_movements;
create policy "authenticated manage cash" on public.cash_movements for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage zones" on public.delivery_zones;
create policy "authenticated manage zones" on public.delivery_zones for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage couriers" on public.couriers;
create policy "authenticated manage couriers" on public.couriers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage assignments" on public.order_assignments;
create policy "authenticated manage assignments" on public.order_assignments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage printers" on public.printer_settings;
create policy "authenticated manage printers" on public.printer_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage banners" on public.marketing_banners;
create policy "authenticated manage banners" on public.marketing_banners for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage instagram" on public.instagram_posts;
create policy "authenticated manage instagram" on public.instagram_posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage audit" on public.audit_logs;
create policy "authenticated manage audit" on public.audit_logs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage hours" on public.store_hours;
create policy "authenticated manage hours" on public.store_hours for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated manage special hours" on public.special_hours;
create policy "authenticated manage special hours" on public.special_hours for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
