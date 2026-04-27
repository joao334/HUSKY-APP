-- PATCH INFINITEPAY - Husky Confeiteiro
-- Rode este arquivo no Supabase SQL Editor antes de publicar as Edge Functions.

create extension if not exists "pgcrypto";

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_nsu text unique not null,
  gateway text default 'infinitepay',
  status text default 'pending',
  checkout_url text,
  gateway_slug text,
  transaction_nsu text,
  capture_method text,
  receipt_url text,
  total numeric(10,2) not null default 0,
  subtotal numeric(10,2) default 0,
  delivery_fee numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  paid_amount numeric(10,2),
  coupon_code text,
  fulfillment text default 'delivery',
  customer_name text,
  customer_email text,
  customer_phone text,
  address_snapshot jsonb default '{}'::jsonb,
  items jsonb default '[]'::jsonb,
  raw_request jsonb default '{}'::jsonb,
  raw_response jsonb default '{}'::jsonb,
  raw_webhook jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  paid_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.payments add column if not exists fee numeric(10,2) default 0;
alter table public.payments add column if not exists net_amount numeric(10,2);
alter table public.payments add column if not exists updated_at timestamptz default now();
alter table public.payments add column if not exists expires_at timestamptz;

alter table public.customer_orders add column if not exists channel text default 'app';
alter table public.customer_orders add column if not exists updated_at timestamptz default now();
alter table public.customer_orders add column if not exists customer_notes text;
alter table public.customer_orders add column if not exists internal_notes text;

alter table public.products add column if not exists available boolean default true;
alter table public.products add column if not exists visible_on_client boolean default true;
alter table public.products add column if not exists featured boolean default false;
alter table public.products add column if not exists updated_at timestamptz default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists checkout_sessions_updated_at on public.checkout_sessions;
create trigger checkout_sessions_updated_at
before update on public.checkout_sessions
for each row execute function public.set_updated_at();

alter table public.checkout_sessions enable row level security;

drop policy if exists "Cliente ve proprios checkouts" on public.checkout_sessions;
create policy "Cliente ve proprios checkouts"
on public.checkout_sessions
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admin gerencia checkouts" on public.checkout_sessions;
create policy "Admin gerencia checkouts"
on public.checkout_sessions
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Cliente le proprios pagamentos" on public.payments;
create policy "Cliente le proprios pagamentos"
on public.payments
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Cliente le proprios pedidos" on public.customer_orders;
create policy "Cliente le proprios pedidos"
on public.customer_orders
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Cliente le itens dos proprios pedidos" on public.order_items;
create policy "Cliente le itens dos proprios pedidos"
on public.order_items
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.customer_orders o
    where o.id = order_items.order_id
    and o.user_id = auth.uid()
  )
);

do $$
begin
  alter publication supabase_realtime add table public.checkout_sessions;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- Conferência rápida:
select 'checkout_sessions pronta para InfinitePay' as status;
