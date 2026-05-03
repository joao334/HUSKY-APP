-- Correção rápida para o erro:
-- ERROR: 42703: column "category_id" does not exist

create extension if not exists "pgcrypto";

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

alter table public.products add column if not exists category_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_category_id_fkey'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id) references public.categories(id);
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'category'
  ) then
    insert into public.categories (name, slug, icon, sort_order, is_active)
    select distinct
      initcap(trim(category::text)) as name,
      regexp_replace(lower(trim(category::text)), '[^a-z0-9]+', '-', 'g') as slug,
      'circle' as icon,
      0 as sort_order,
      true as is_active
    from public.products
    where category is not null
      and trim(category::text) <> ''
    on conflict (slug) do nothing;

    update public.products p
    set category_id = c.id
    from public.categories c
    where p.category_id is null
      and c.slug = regexp_replace(lower(trim(p.category::text)), '[^a-z0-9]+', '-', 'g');
  end if;
end $$;

create index if not exists idx_products_category on public.products(category_id);
