select c.slug as cat, p.slug, p.name, p.brand
from public.products p
join public.categories c on c.id = p.category_id
where p.slug like 's2-%' and (c.slug in ('accessories','audio','chargers','cases') or p.slug like '%-%-%' and p.name ilike 'حامل%' or p.name ilike 'عصا%' or p.name ilike 'إضاءة%' or p.name ilike 'زجاج%' or p.name ilike 'حماية%' or p.name ilike 'حافظة%' or p.name ilike 'حامل%' or p.name ilike 'كابل%')
order by c.slug, p.slug
limit 60;
