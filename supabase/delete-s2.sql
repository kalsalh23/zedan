delete from public.products where slug like 's2-%';
select count(*) as remaining from public.products;
