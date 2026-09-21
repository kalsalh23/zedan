select 'products' as t, count(*) from public.products
union all select 'new_phones', count(*) from public.products where condition='new' and category_id in (select id from public.categories where slug='smartphones')
union all select 'tablets', count(*) from public.products where category_id in (select id from public.categories where slug='tablets')
union all select 'used', count(*) from public.products where condition='used'
union all select 'audio', count(*) from public.products where category_id in (select id from public.categories where slug='audio')
union all select 'chargers', count(*) from public.products where category_id in (select id from public.categories where slug='chargers')
union all select 'cases', count(*) from public.products where category_id in (select id from public.categories where slug='cases')
union all select 'watches', count(*) from public.products where category_id in (select id from public.categories where slug='watches')
union all select 'accessories', count(*) from public.products where category_id in (select id from public.categories where slug='accessories')
union all select 'brands', count(distinct brand) from public.products
union all select 'notifications_table', 0;
