-- Rode depois de fazer login uma vez em gestao.html
-- Troque pelo seu e-mail:
insert into public.admin_users(user_id,email,name,role,permissions)
select id,email,'João','admin','{"all":true}'::jsonb
from auth.users
where email='SEU_EMAIL_AQUI'
on conflict (email) do update set role='admin', active=true, user_id=excluded.user_id;
