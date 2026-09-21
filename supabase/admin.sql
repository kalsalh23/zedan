-- create/update the admin account (idempotent)
do $$
declare
  uid uuid;
begin
  select id into uid from auth.users where email = 'admin@mobilybro.com';
  if uid is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'admin@mobilybro.com', crypt('Mobily@2026', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"مدير Mobily Bro"}'::jsonb,
      now(), now(), '', '', '', ''
    ) returning id into uid;
  else
    update auth.users set encrypted_password = crypt('Mobily@2026', gen_salt('bf')), email_confirmed_at = now(), updated_at = now()
    where id = uid;
  end if;
  insert into public.admin_users (user_id) values (uid) on conflict (user_id) do nothing;
end $$;

-- sanity checks
select 'categories' as t, count(*) from public.categories
union all select 'products', count(*) from public.products
union all select 'offers', count(*) from public.offers
union all select 'admins', count(*) from public.admin_users;
