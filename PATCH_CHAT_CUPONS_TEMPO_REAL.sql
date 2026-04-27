
-- PATCH CHAT + CUPONS EM TEMPO REAL - HUSKY
-- Rode no Supabase > SQL Editor > New query após subir este pacote.
-- Corrige:
-- 1) Chat cliente <-> gestão com persistência.
-- 2) Cupons alterados na gestão aparecendo no cliente.
-- 3) Realtime das tabelas principais.

create extension if not exists "pgcrypto";

-- Garantir colunas usadas pelo chat.
alter table public.chat_messages add column if not exists id uuid default gen_random_uuid();
alter table public.chat_messages add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.chat_messages add column if not exists order_id uuid references public.customer_orders(id) on delete set null;
alter table public.chat_messages add column if not exists sender text default 'customer';
alter table public.chat_messages add column if not exists message text;
alter table public.chat_messages add column if not exists read_at timestamptz;
alter table public.chat_messages add column if not exists created_at timestamptz default now();
alter table public.chat_messages add column if not exists updated_at timestamptz default now();

-- Garantir colunas usadas por cupons.
alter table public.coupons add column if not exists code text;
alter table public.coupons add column if not exists title text;
alter table public.coupons add column if not exists description text;
alter table public.coupons add column if not exists discount_type text default 'value';
alter table public.coupons add column if not exists discount_value numeric(10,2) default 0;
alter table public.coupons add column if not exists min_subtotal numeric(10,2) default 0;
alter table public.coupons add column if not exists min_items integer default 0;
alter table public.coupons add column if not exists max_uses integer default 0;
alter table public.coupons add column if not exists used_count integer default 0;
alter table public.coupons add column if not exists first_purchase_only boolean default false;
alter table public.coupons add column if not exists free_delivery boolean default false;
alter table public.coupons add column if not exists active boolean default true;
alter table public.coupons add column if not exists starts_at timestamptz;
alter table public.coupons add column if not exists expires_at timestamptz;
alter table public.coupons add column if not exists created_at timestamptz default now();
alter table public.coupons add column if not exists updated_at timestamptz default now();

-- Função admin segura.
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

grant execute on function public.is_admin() to anon, authenticated;

-- RLS
alter table public.chat_messages enable row level security;
alter table public.coupons enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "chat cliente ve proprias mensagens" on public.chat_messages;
drop policy if exists "chat cliente envia propria mensagem" on public.chat_messages;
drop policy if exists "chat cliente atualiza propria mensagem" on public.chat_messages;
drop policy if exists "chat admin gerencia tudo" on public.chat_messages;

create policy "chat cliente ve proprias mensagens"
on public.chat_messages
for select
using (auth.uid() = user_id);

create policy "chat cliente envia propria mensagem"
on public.chat_messages
for insert
with check (
  auth.uid() = user_id
  and sender = 'customer'
);

create policy "chat cliente atualiza propria mensagem"
on public.chat_messages
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "chat admin gerencia tudo"
on public.chat_messages
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "cupons ativos publicos" on public.coupons;
drop policy if exists "admin gerencia cupons" on public.coupons;

create policy "cupons ativos publicos"
on public.coupons
for select
using (active = true);

create policy "admin gerencia cupons"
on public.coupons
for all
using (public.is_admin())
with check (public.is_admin());

-- Produtos e configurações públicas para o cliente.
drop policy if exists "produtos publicos cliente" on public.products;
drop policy if exists "admin gerencia produtos" on public.products;
drop policy if exists "settings publicas cliente" on public.store_settings;
drop policy if exists "admin gerencia settings" on public.store_settings;

create policy "produtos publicos cliente"
on public.products
for select
using (active = true and visible_on_client = true);

create policy "admin gerencia produtos"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

create policy "settings publicas cliente"
on public.store_settings
for select
using (true);

create policy "admin gerencia settings"
on public.store_settings
for all
using (public.is_admin())
with check (public.is_admin());

-- Índices para chat rápido.
create index if not exists idx_chat_messages_user_created
on public.chat_messages(user_id, created_at desc);

create index if not exists idx_chat_messages_created
on public.chat_messages(created_at desc);

create index if not exists idx_coupons_active_code
on public.coupons(active, code);

-- Realtime: necessário para o cliente e gestor receberem mudanças.
alter table public.chat_messages replica identity full;
alter table public.coupons replica identity full;
alter table public.products replica identity full;
alter table public.store_settings replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='coupons') then
    alter publication supabase_realtime add table public.coupons;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='products') then
    alter publication supabase_realtime add table public.products;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='store_settings') then
    alter publication supabase_realtime add table public.store_settings;
  end if;
exception
  when undefined_object then
    raise notice 'Publicação supabase_realtime ainda não disponível neste projeto.';
end $$;

-- Cupons base, caso falte algum.
insert into public.coupons (
  code,title,description,discount_type,discount_value,min_subtotal,min_items,max_uses,first_purchase_only,free_delivery,active
)
values
('PRIMEIRACOLHER','Primeira colher','R$ 5 de desconto acima de R$ 30.','value',5,30,0,100,true,false,true),
('HUSKY10','10% OFF','10% de desconto acima de R$ 50.','percent',10,50,0,200,false,false,true),
('FRETEGRATIS','Entrega grátis','Entrega grátis acima de R$ 35.','free_delivery',0,35,0,100,false,true,true),
('COMBO4','Combo 4 sabores','R$ 8 de desconto levando 4 bolos ou mais.','value',8,72,4,100,false,false,true)
on conflict (code) do update
set
  title = excluded.title,
  description = excluded.description,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_subtotal = excluded.min_subtotal,
  min_items = excluded.min_items,
  max_uses = excluded.max_uses,
  first_purchase_only = excluded.first_purchase_only,
  free_delivery = excluded.free_delivery,
  active = excluded.active,
  updated_at = now();
