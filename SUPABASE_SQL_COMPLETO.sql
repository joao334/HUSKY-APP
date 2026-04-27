-- HUSKY CONFEITEIRO - BANCO DO APP DO CLIENTE
-- Rode este arquivo no Supabase > SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  details text,
  image_url text,
  price numeric(10,2) not null default 0,
  size text default '250 ml',
  weight text default '250g a 260g',
  active boolean default true,
  stock integer default 0,
  tag text,
  allergens text,
  created_at timestamptz default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text,
  description text,
  discount_type text check (discount_type in ('value','percent','free_delivery')),
  discount_value numeric(10,2) default 0,
  min_subtotal numeric(10,2) default 0,
  min_items integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  address text,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  gateway text,
  gateway_payment_id text,
  status text default 'pending',
  payment_method text,
  amount numeric(10,2) not null,
  pix_qr_code text,
  pix_copy_paste text,
  raw_response jsonb,
  created_at timestamptz default now(),
  approved_at timestamptz
);

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id),
  payment_id uuid references public.payments(id),
  status text default 'paid',
  payment_status text default 'approved',
  fulfillment text default 'delivery',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null,
  coupon_code text,
  customer_name text,
  customer_email text,
  customer_phone text,
  address_snapshot jsonb,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.customer_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  observation text,
  addons jsonb default '[]'::jsonb,
  total numeric(10,2) not null
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  order_id uuid references public.customer_orders(id),
  sender text check (sender in ('customer','store','system')) not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.customer_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.chat_messages enable row level security;

-- Limpa políticas antigas, se você rodar mais de uma vez
DO $$
DECLARE r record;
BEGIN
  FOR r IN (select schemaname, tablename, policyname from pg_policies where schemaname='public') LOOP
    EXECUTE format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

create policy "Produtos ativos aparecem no app"
on public.products for select
using (active = true);

create policy "Cupons ativos aparecem no app"
on public.coupons for select
using (active = true);

create policy "Cliente vê próprio perfil"
on public.profiles for select
using (auth.uid() = id);

create policy "Cliente cria próprio perfil"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Cliente atualiza próprio perfil"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Cliente vê próprios pagamentos"
on public.payments for select
using (auth.uid() = user_id);

create policy "Cliente vê próprios pedidos"
on public.customer_orders for select
using (auth.uid() = user_id);

create policy "Cliente vê itens dos próprios pedidos"
on public.order_items for select
using (
  exists (
    select 1 from public.customer_orders o
    where o.id = order_items.order_id
    and o.user_id = auth.uid()
  )
);

create policy "Cliente vê próprias mensagens"
on public.chat_messages for select
using (auth.uid() = user_id);

create policy "Cliente envia mensagem"
on public.chat_messages for insert
with check (auth.uid() = user_id and sender = 'customer');

insert into public.products (name, slug, description, details, image_url, price, stock, tag, allergens, active)
values
('Lambe Lambe Brigadeiro','lambe-lambe-brigadeiro','Bolo de chocolate com brigadeiro cremoso.','Bolo de chocolate molhadinho, recheio de brigadeiro cremoso e finalização artesanal.','assets/husky/IMG_7008.PNG',18.00,20,'Mais vendido','Contém leite, glúten e derivados de soja.',true),
('Abana Rabo','abana-rabo','Bolo de chocolate com maracujá.','Chocolate com creme de maracujá equilibrado: doce, ácido e perfeito.','assets/husky/IMG_6999.PNG',18.00,20,'Azedinho','Contém leite, glúten e derivados de soja.',true),
('Uivo de Prestígio','uivo-de-prestigio','Chocolate com coco.','Camadas de chocolate com creme de coco em uma combinação clássica.','assets/husky/IMG_7009.PNG',18.00,20,'Clássico','Contém leite, glúten, coco e derivados de soja.',true),
('Pata Crocante','pata-crocante','Oreo com creme de ninho.','Creme de ninho com Oreo crocante.','assets/husky/IMG_7028.PNG',18.00,0,'Esgotado','Contém leite, glúten e derivados de soja.',false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  details = excluded.details,
  image_url = excluded.image_url,
  price = excluded.price,
  stock = excluded.stock,
  tag = excluded.tag,
  allergens = excluded.allergens,
  active = excluded.active;

insert into public.coupons (code, title, description, discount_type, discount_value, min_subtotal, min_items, active)
values
('PRIMEIRACOLHER','Primeira colher','R$ 5 de desconto acima de R$ 30.','value',5,30,0,true),
('HUSKY10','10% OFF','10% de desconto acima de R$ 50.','percent',10,50,0,true),
('FRETEGRATIS','Entrega grátis','Entrega grátis acima de R$ 35.','free_delivery',0,35,0,true),
('COMBO4','Combo 4 sabores','R$ 8 de desconto levando 4 bolos ou mais.','value',8,72,4,true)
on conflict (code) do update set
  title = excluded.title,
  description = excluded.description,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_subtotal = excluded.min_subtotal,
  min_items = excluded.min_items,
  active = excluded.active;
