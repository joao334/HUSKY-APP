
-- HUSKY CONFEITEIRO — BANCO COMPLETO CLIENTE + GESTÃO
-- Rode este arquivo no Supabase > SQL Editor.
-- Depois faça login uma vez na gestão e rode o bloco "CRIAR ADMIN" no fim com seu e-mail.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

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

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  role text not null default 'operador',
  permissions jsonb default '{}'::jsonb,
  active boolean default true,
  last_access_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists admin_users_updated_at on public.admin_users;
create trigger admin_users_updated_at before update on public.admin_users for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users a where a.user_id = auth.uid() and a.active = true);
$$;

create or replace function public.admin_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select a.role from public.admin_users a where a.user_id = auth.uid() and a.active = true limit 1), 'none');
$$;

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists store_settings_updated_at on public.store_settings;
create trigger store_settings_updated_at before update on public.store_settings for each row execute function public.set_updated_at();

insert into public.store_settings(key, value) values
('store', '{"name":"Husky Confeiteiro","open":true,"paused":false,"phone":"","whatsapp":"5511999999999","description":"Bolos de pote artesanais feitos em Embu das Artes","minimum_order":18,"delivery_fee":6.99,"free_delivery_from":45,"pickup_enabled":true,"delivery_enabled":true}'::jsonb),
('hours', '{"saturday":"19:00-23:00","sunday":"11:00-21:00","allow_scheduled":true}'::jsonb),
('theme', '{"blue":"#3b6da6","cream":"#edd8ab","paper":"#f5f5f0","brown":"#5f442e"}'::jsonb)
on conflict (key) do nothing;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  image_url text,
  active boolean default true,
  sort_order int default 0,
  schedule jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists product_categories_updated_at on public.product_categories;
create trigger product_categories_updated_at before update on public.product_categories for each row execute function public.set_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id),
  name text not null,
  internal_name text,
  slug text unique,
  description text,
  details text,
  ingredients text,
  allergens text,
  image_url text,
  gallery jsonb default '[]'::jsonb,
  price numeric(10,2) not null default 0,
  promo_price numeric(10,2),
  cost_estimate numeric(10,2) default 0,
  size text default '250 ml',
  weight text default '250g a 260g',
  active boolean default true,
  available boolean default true,
  visible_on_client boolean default true,
  stock integer default 0,
  min_stock integer default 0,
  sku text,
  preparation_minutes integer default 25,
  tag text,
  featured boolean default false,
  sort_order int default 0,
  allow_observation boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

create table if not exists public.product_addons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  group_name text default 'Adicionais',
  name text not null,
  price numeric(10,2) default 0,
  active boolean default true,
  required boolean default false,
  min_choices int default 0,
  max_choices int default 1,
  stock int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists product_addons_updated_at on public.product_addons;
create trigger product_addons_updated_at before update on public.product_addons for each row execute function public.set_updated_at();

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text,
  description text,
  discount_type text check (discount_type in ('value','percent','free_delivery','product')),
  discount_value numeric(10,2) default 0,
  min_subtotal numeric(10,2) default 0,
  min_items int default 0,
  max_uses int,
  uses_count int default 0,
  use_per_customer int default 1,
  first_purchase_only boolean default false,
  starts_at timestamptz,
  expires_at timestamptz,
  products jsonb default '[]'::jsonb,
  customers jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists coupons_updated_at on public.coupons;
create trigger coupons_updated_at before update on public.coupons for each row execute function public.set_updated_at();

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  gateway text default 'mercado_pago',
  gateway_payment_id text,
  status text default 'pending',
  payment_method text,
  amount numeric(10,2) not null,
  fee numeric(10,2) default 0,
  net_amount numeric(10,2),
  pix_qr_code text,
  pix_copy_paste text,
  expires_at timestamptz,
  raw_response jsonb,
  created_at timestamptz default now(),
  approved_at timestamptz,
  updated_at timestamptz default now()
);

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id),
  payment_id uuid references public.payments(id),
  status text default 'paid',
  payment_status text default 'approved',
  fulfillment text default 'delivery',
  channel text default 'app',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null,
  coupon_code text,
  customer_name text,
  customer_email text,
  customer_phone text,
  address_snapshot jsonb,
  estimated_at timestamptz,
  accepted_at timestamptz,
  delivered_at timestamptz,
  assigned_to uuid references auth.users(id),
  production_user uuid references auth.users(id),
  delivery_user uuid references auth.users(id),
  internal_notes text,
  customer_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists customer_orders_updated_at on public.customer_orders;
create trigger customer_orders_updated_at before update on public.customer_orders for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.customer_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_image text,
  quantity int not null,
  unit_price numeric(10,2) not null,
  addons jsonb default '[]'::jsonb,
  observation text,
  total numeric(10,2) not null,
  produced boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.order_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.customer_orders(id) on delete cascade,
  status text,
  note text,
  actor_id uuid references auth.users(id),
  actor_name text,
  created_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  order_id uuid references public.customer_orders(id),
  sender text check (sender in ('customer','store','system')) not null,
  message text not null,
  attachments jsonb default '[]'::jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  order_id uuid references public.customer_orders(id),
  product_id uuid references public.products(id),
  rating int check (rating between 1 and 5),
  comment text,
  tags text[],
  store_reply text,
  replied_at timestamptz,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  type text not null,
  quantity int not null,
  reason text,
  lot text,
  expiration_date date,
  order_id uuid references public.customer_orders(id),
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists public.production_batches (
  id uuid primary key default gen_random_uuid(),
  title text,
  product_id uuid references public.products(id),
  quantity int not null,
  sold_quantity int default 0,
  lost_quantity int default 0,
  leftover_quantity int default 0,
  lot text,
  expiration_date date,
  responsible_id uuid references auth.users(id),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee numeric(10,2) default 0,
  min_order numeric(10,2) default 0,
  estimated_minutes int default 30,
  active boolean default true,
  rules jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists delivery_zones_updated_at on public.delivery_zones;
create trigger delivery_zones_updated_at before update on public.delivery_zones for each row execute function public.set_updated_at();

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_type text,
  link_target text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean default true,
  sort_order int default 0,
  clicks int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists banners_updated_at on public.banners;
create trigger banners_updated_at before update on public.banners for each row execute function public.set_updated_at();

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  amount numeric(10,2) not null,
  date date default current_date,
  payment_method text,
  recurring boolean default false,
  quantity numeric,
  supplier_id uuid,
  receipt_url text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists expenses_updated_at on public.expenses;
create trigger expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  product_supplied text,
  average_value numeric(10,2),
  last_purchase_at date,
  notes text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists suppliers_updated_at on public.suppliers;
create trigger suppliers_updated_at before update on public.suppliers for each row execute function public.set_updated_at();

create table if not exists public.cancellations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.customer_orders(id),
  customer_reason text,
  store_reason text,
  requested_by text,
  payment_status text,
  refund_status text,
  responsible_id uuid references auth.users(id),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.customer_orders(id),
  payment_id uuid references public.payments(id),
  type text default 'total',
  amount numeric(10,2) not null,
  status text default 'requested',
  reason text,
  approved_by uuid references auth.users(id),
  raw_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists refunds_updated_at on public.refunds;
create trigger refunds_updated_at before update on public.refunds for each row execute function public.set_updated_at();

create table if not exists public.internal_tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.customer_orders(id),
  user_id uuid references auth.users(id),
  type text,
  priority text default 'normal',
  status text default 'open',
  title text not null,
  description text,
  responsible_id uuid references auth.users(id),
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists internal_tickets_updated_at on public.internal_tickets;
create trigger internal_tickets_updated_at before update on public.internal_tickets for each row execute function public.set_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text not null,
  message text,
  target text default 'admin',
  order_id uuid references public.customer_orders(id),
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text,
  action text not null,
  entity text,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.scheduled_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  scheduled_for timestamptz not null,
  payload jsonb default '{}'::jsonb,
  status text default 'scheduled',
  created_at timestamptz default now()
);

create table if not exists public.loyalty_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  value jsonb default '{}'::jsonb,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists loyalty_rules_updated_at on public.loyalty_rules;
create trigger loyalty_rules_updated_at before update on public.loyalty_rules for each row execute function public.set_updated_at();

create table if not exists public.sales_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.admin_records (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text,
  status text default 'active',
  data jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists admin_records_updated_at on public.admin_records;
create trigger admin_records_updated_at before update on public.admin_records for each row execute function public.set_updated_at();

-- Dados iniciais
insert into public.product_categories(name, slug, description, active, sort_order)
values ('Bolos de pote','bolos-de-pote','Bolos de pote artesanais 250ml',true,1)
on conflict (slug) do nothing;

insert into public.products(name, slug, description, details, image_url, price, stock, tag, allergens, active, available, visible_on_client, featured)
values
('Lambe Lambe Brigadeiro','lambe-lambe-brigadeiro','Bolo de chocolate com brigadeiro cremoso.','Bolo de chocolate molhadinho, recheio de brigadeiro cremoso e finalização artesanal.','assets/husky/IMG_7008.PNG',18,20,'Mais vendido','Contém leite, glúten e derivados de soja.',true,true,true,true),
('Abana Rabo','abana-rabo','Bolo de chocolate com maracujá.','Chocolate com creme de maracujá equilibrado: doce, ácido e perfeito.','assets/husky/IMG_6999.PNG',18,20,'Azedinho','Contém leite, glúten e derivados de soja.',true,true,true,true),
('Uivo de Prestígio','uivo-de-prestigio','Chocolate com coco.','Camadas de chocolate com creme de coco em uma combinação clássica.','assets/husky/IMG_7009.PNG',18,20,'Clássico','Contém leite, glúten, coco e derivados de soja.',true,true,true,true),
('Pata Crocante','pata-crocante','Oreo com creme de ninho.','Creme de ninho com Oreo crocante.','assets/husky/IMG_7028.PNG',18,0,'Esgotado','Contém leite, glúten e derivados de soja.',false,false,true,false)
on conflict (slug) do nothing;

insert into public.coupons(code,title,description,discount_type,discount_value,min_subtotal,min_items,active)
values
('PRIMEIRACOLHER','Primeira colher','R$ 5 de desconto acima de R$ 30.','value',5,30,0,true),
('HUSKY10','10% OFF','10% de desconto acima de R$ 50.','percent',10,50,0,true),
('FRETEGRATIS','Entrega grátis','Entrega grátis acima de R$ 35.','free_delivery',0,35,0,true),
('COMBO4','Combo 4 sabores','R$ 8 de desconto levando 4 bolos ou mais.','value',8,72,4,true)
on conflict (code) do nothing;

insert into public.sales_channels(name, active, config) values
('App próprio',true,'{}'),('WhatsApp',true,'{}'),('Instagram',true,'{}'),('iFood',true,'{}'),('Presencial',true,'{}'),('Manual',true,'{}')
on conflict do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.store_settings enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_addons enable row level security;
alter table public.coupons enable row level security;
alter table public.payments enable row level security;
alter table public.customer_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_history enable row level security;
alter table public.chat_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.production_batches enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.banners enable row level security;
alter table public.expenses enable row level security;
alter table public.suppliers enable row level security;
alter table public.cancellations enable row level security;
alter table public.refunds enable row level security;
alter table public.internal_tickets enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.scheduled_orders enable row level security;
alter table public.loyalty_rules enable row level security;
alter table public.sales_channels enable row level security;
alter table public.admin_records enable row level security;

-- Políticas públicas do app cliente
drop policy if exists "Cliente le produtos visiveis" on public.products;
create policy "Cliente le produtos visiveis" on public.products for select using (active = true and available = true and visible_on_client = true);
drop policy if exists "Cliente le categorias ativas" on public.product_categories;
create policy "Cliente le categorias ativas" on public.product_categories for select using (active = true);
drop policy if exists "Cliente le adicionais ativos" on public.product_addons;
create policy "Cliente le adicionais ativos" on public.product_addons for select using (active = true);
drop policy if exists "Cliente le cupons ativos" on public.coupons;
create policy "Cliente le cupons ativos" on public.coupons for select using (active = true);
drop policy if exists "Cliente le banners ativos" on public.banners;
create policy "Cliente le banners ativos" on public.banners for select using (active = true);
drop policy if exists "Cliente le configuracoes publicas" on public.store_settings;
create policy "Cliente le configuracoes publicas" on public.store_settings for select using (true);

-- Políticas do cliente autenticado
drop policy if exists "Cliente le proprio perfil" on public.profiles;
create policy "Cliente le proprio perfil" on public.profiles for select using (auth.uid() = id or public.is_admin());
drop policy if exists "Cliente cria proprio perfil" on public.profiles;
create policy "Cliente cria proprio perfil" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Cliente atualiza proprio perfil" on public.profiles;
create policy "Cliente atualiza proprio perfil" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Cliente le proprios pagamentos" on public.payments;
create policy "Cliente le proprios pagamentos" on public.payments for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "Cliente le proprios pedidos" on public.customer_orders;
create policy "Cliente le proprios pedidos" on public.customer_orders for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "Cliente le itens dos proprios pedidos" on public.order_items;
create policy "Cliente le itens dos proprios pedidos" on public.order_items for select using (public.is_admin() or exists(select 1 from public.customer_orders o where o.id=order_items.order_id and o.user_id=auth.uid()));
drop policy if exists "Cliente le historico dos proprios pedidos" on public.order_history;
create policy "Cliente le historico dos proprios pedidos" on public.order_history for select using (public.is_admin() or exists(select 1 from public.customer_orders o where o.id=order_history.order_id and o.user_id=auth.uid()));
drop policy if exists "Cliente le proprio chat" on public.chat_messages;
create policy "Cliente le proprio chat" on public.chat_messages for select using (public.is_admin() or auth.uid()=user_id);
drop policy if exists "Cliente envia chat" on public.chat_messages;
create policy "Cliente envia chat" on public.chat_messages for insert with check (auth.uid()=user_id and sender='customer');
drop policy if exists "Cliente cria review" on public.reviews;
create policy "Cliente cria review" on public.reviews for insert with check (auth.uid()=user_id);
drop policy if exists "Cliente le propria review" on public.reviews;
create policy "Cliente le propria review" on public.reviews for select using (auth.uid()=user_id or public.is_admin());

-- Políticas de admin: acesso total pelo app gestão
drop policy if exists "Admin ve admin_users" on public.admin_users;
create policy "Admin ve admin_users" on public.admin_users for select using (public.is_admin());
drop policy if exists "Admin gerencia admin_users" on public.admin_users;
create policy "Admin gerencia admin_users" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia store_settings" on public.store_settings;
create policy "Admin gerencia store_settings" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia categorias" on public.product_categories;
create policy "Admin gerencia categorias" on public.product_categories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia produtos" on public.products;
create policy "Admin gerencia produtos" on public.products for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia adicionais" on public.product_addons;
create policy "Admin gerencia adicionais" on public.product_addons for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia cupons" on public.coupons;
create policy "Admin gerencia cupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia pagamentos" on public.payments;
create policy "Admin gerencia pagamentos" on public.payments for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia pedidos" on public.customer_orders;
create policy "Admin gerencia pedidos" on public.customer_orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia itens" on public.order_items;
create policy "Admin gerencia itens" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia historico" on public.order_history;
create policy "Admin gerencia historico" on public.order_history for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia chat" on public.chat_messages;
create policy "Admin gerencia chat" on public.chat_messages for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia reviews" on public.reviews;
create policy "Admin gerencia reviews" on public.reviews for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia estoque" on public.inventory_movements;
create policy "Admin gerencia estoque" on public.inventory_movements for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia producao" on public.production_batches;
create policy "Admin gerencia producao" on public.production_batches for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia zonas" on public.delivery_zones;
create policy "Admin gerencia zonas" on public.delivery_zones for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia banners" on public.banners;
create policy "Admin gerencia banners" on public.banners for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia despesas" on public.expenses;
create policy "Admin gerencia despesas" on public.expenses for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia fornecedores" on public.suppliers;
create policy "Admin gerencia fornecedores" on public.suppliers for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia cancelamentos" on public.cancellations;
create policy "Admin gerencia cancelamentos" on public.cancellations for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia reembolsos" on public.refunds;
create policy "Admin gerencia reembolsos" on public.refunds for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia chamados" on public.internal_tickets;
create policy "Admin gerencia chamados" on public.internal_tickets for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia notificacoes" on public.notifications;
create policy "Admin gerencia notificacoes" on public.notifications for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia auditoria" on public.audit_logs;
create policy "Admin gerencia auditoria" on public.audit_logs for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia agendados" on public.scheduled_orders;
create policy "Admin gerencia agendados" on public.scheduled_orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia fidelidade" on public.loyalty_rules;
create policy "Admin gerencia fidelidade" on public.loyalty_rules for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia canais" on public.sales_channels;
create policy "Admin gerencia canais" on public.sales_channels for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin gerencia registros" on public.admin_records;
create policy "Admin gerencia registros" on public.admin_records for all using (public.is_admin()) with check (public.is_admin());

-- Ativa realtime nas tabelas principais
-- Se der erro de tabela já adicionada no realtime, ignore.
do $$ begin alter publication supabase_realtime add table public.products; exception when duplicate_object then null; when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.coupons; exception when duplicate_object then null; when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.customer_orders; exception when duplicate_object then null; when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.order_items; exception when duplicate_object then null; when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.store_settings; exception when duplicate_object then null; when others then null; end $$;

-- CRIAR ADMIN APÓS FAZER LOGIN UMA VEZ NA GESTÃO:
-- 1) Faça login em gestao.html com seu e-mail.
-- 2) Volte aqui e rode, trocando pelo seu e-mail:
-- insert into public.admin_users(user_id,email,name,role,permissions)
-- select id,email,'João','admin','{"all":true}'::jsonb from auth.users where email='SEU_EMAIL_AQUI'
-- on conflict (email) do update set role='admin', active=true, user_id=excluded.user_id;


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
