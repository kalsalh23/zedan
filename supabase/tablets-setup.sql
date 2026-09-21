-- tablets category + allow Wi-Fi network for tablets
insert into public.categories (slug, name, icon, sort_order)
values ('tablets', 'تابلت', 'tablet', 2)
on conflict (slug) do nothing;

update public.categories set sort_order = 3 where slug = 'used';
update public.categories set sort_order = 4 where slug = 'audio';
update public.categories set sort_order = 5 where slug = 'chargers';
update public.categories set sort_order = 6 where slug = 'cases';
update public.categories set sort_order = 7 where slug = 'watches';
update public.categories set sort_order = 8 where slug = 'accessories';

alter table public.products drop constraint if exists products_network_check;
alter table public.products add constraint products_network_check check (network in ('4G','5G','Wi-Fi'));

select slug, name, sort_order from public.categories order by sort_order;
