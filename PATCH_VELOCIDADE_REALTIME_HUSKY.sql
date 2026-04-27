-- PATCH VELOCIDADE REALTIME HUSKY
-- Rode no Supabase > SQL Editor.

alter table public.products replica identity full;
alter table public.coupons replica identity full;
alter table public.store_settings replica identity full;
alter table public.chat_messages replica identity full;
alter table public.customer_orders replica identity full;

do $$ begin
  begin alter publication supabase_realtime add table public.products; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.coupons; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.store_settings; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.customer_orders; exception when duplicate_object then null; end;
end $$;

create index if not exists idx_coupons_active_updated on public.coupons(active, updated_at desc);
create index if not exists idx_products_client_updated on public.products(active, visible_on_client, updated_at desc);
create index if not exists idx_chat_messages_user_created on public.chat_messages(user_id, created_at desc);
create index if not exists idx_orders_user_created on public.customer_orders(user_id, created_at desc);
