-- categories: add realistic image per category (editable from admin)
alter table public.categories add column if not exists image_url text;

update public.categories set image_url = case slug
  when 'smartphones' then 'https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp'
  when 'used' then 'https://cdn.dummyjson.com/product-images/smartphones/realme-xt/thumbnail.webp'
  when 'audio' then 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp'
  when 'chargers' then 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp'
  when 'cases' then 'https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp'
  when 'watches' then 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp'
  when 'accessories' then 'https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/thumbnail.webp'
  else image_url
end
where image_url is null or image_url = '';

select slug, name, image_url from public.categories order by sort_order;
