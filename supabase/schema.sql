-- ============ Mobily Bro — Supabase schema ============
create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text default 'box',
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  condition text not null default 'new' check (condition in ('new','used')),
  network text not null default '4G' check (network in ('4G','5G')),
  price numeric(12,2) not null default 0,
  old_price numeric(12,2),
  stock int not null default 0,
  description text default '',
  specs jsonb not null default '{}'::jsonb,
  used_details jsonb,
  main_image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_condition_idx on public.products(condition);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty int not null default 1 check (qty > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city text not null,
  area text not null,
  details text not null,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  fulfillment text not null default 'pickup' check (fulfillment in ('pickup','delivery')),
  city text, area text, address text, notes text,
  total numeric(12,2) not null default 0,
  status text not null default 'new' check (status in ('new','preparing','ready','delivered')),
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(12,2) not null default 0,
  qty int not null default 1
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  discount text default '',
  image_url text,
  starts_at date,
  ends_at date,
  product_ids uuid[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- helper: is current user an admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admin_users a where a.user_id = auth.uid()) $$;

-- ============ RLS ============
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.favorites enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.offers enable row level security;
alter table public.admin_users enable row level security;

-- categories: public read, admin write
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_insert" on public.categories for insert to authenticated with check (public.is_admin());
create policy "categories_admin_update" on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "categories_admin_delete" on public.categories for delete to authenticated using (public.is_admin());

-- products
create policy "products_public_read" on public.products for select using (true);
create policy "products_admin_insert" on public.products for insert to authenticated with check (public.is_admin());
create policy "products_admin_update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products for delete to authenticated using (public.is_admin());

-- product images
create policy "images_public_read" on public.product_images for select using (true);
create policy "images_admin_insert" on public.product_images for insert to authenticated with check (public.is_admin());
create policy "images_admin_delete" on public.product_images for delete to authenticated using (public.is_admin());

-- favorites: owner only
create policy "fav_owner_all" on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- cart items: owner only
create policy "cart_owner_all" on public.cart_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- addresses: owner only
create policy "addr_owner_all" on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders: anyone can create (guest checkout via WhatsApp), owner/admin can read, admin can manage
create policy "orders_anyone_insert" on public.orders for insert with check (true);
create policy "orders_owner_read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "orders_admin_delete" on public.orders for delete to authenticated using (public.is_admin());

-- order items
create policy "items_anyone_insert" on public.order_items for insert with check (true);
create policy "items_readable" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
create policy "items_admin_update" on public.order_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "items_admin_delete" on public.order_items for delete to authenticated using (public.is_admin());

-- offers: public read, admin write
create policy "offers_public_read" on public.offers for select using (true);
create policy "offers_admin_insert" on public.offers for insert to authenticated with check (public.is_admin());
create policy "offers_admin_update" on public.offers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "offers_admin_delete" on public.offers for delete to authenticated using (public.is_admin());

-- admin_users: read own row only
create policy "admin_read_own" on public.admin_users for select using (user_id = auth.uid());

-- ============ Storage ============
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "images_bucket_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "images_bucket_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "images_bucket_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "images_bucket_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
