-- PATCH FINAL - Pedidos manuais + chat instantâneo + realtime
-- Rode no Supabase > SQL Editor depois de subir o pacote.

create extension if not exists "pgcrypto";

alter table public.customer_orders add column if not exists channel text default 'app';
alter table public.customer_orders add column if not exists payment_method text;
alter table public.customer_orders add column if not exists updated_at timestamptz default now();
alter table public.order_items add column if not exists observation text;
alter table public.order_items add column if not exists addons jsonb default '[]'::jsonb;
alter table public.chat_messages add column if not exists read_at timestamptz;
alter table public.chat_messages add column if not exists updated_at timestamptz default now();

create index if not exists chat_messages_user_created_idx on public.chat_messages(user_id, created_at desc);
create index if not exists chat_messages_order_created_idx on public.chat_messages(order_id, created_at desc);
create index if not exists customer_orders_channel_created_idx on public.customer_orders(channel, created_at desc);
create index if not exists customer_orders_status_created_idx on public.customer_orders(status, created_at desc);

alter table public.chat_messages replica identity full;
alter table public.customer_orders replica identity full;
alter table public.order_items replica identity full;
alter table public.coupons replica identity full;
alter table public.products replica identity full;
alter table public.store_settings replica identity full;

do $$ begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.customer_orders; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.order_items; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.coupons; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.products; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.store_settings; exception when duplicate_object then null; when undefined_object then null; end $$;

alter table public.customer_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "admin manage orders final" on public.customer_orders;
create policy "admin manage orders final"
on public.customer_orders
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage order items final" on public.order_items;
create policy "admin manage order items final"
on public.order_items
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage chat final" on public.chat_messages;
create policy "admin manage chat final"
on public.chat_messages
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "client own chat final" on public.chat_messages;
create policy "client own chat final"
on public.chat_messages
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
