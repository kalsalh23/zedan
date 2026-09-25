-- Self-hosted images as blobs (served by the img Edge Function with immutable caching)
create table if not exists public.image_blobs (
  path text primary key,
  mime text not null default 'image/webp',
  data text not null,
  bytes int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.image_blobs enable row level security;
drop policy if exists "blobs_public_read" on public.image_blobs;
create policy "blobs_public_read" on public.image_blobs for select using (true);
drop policy if exists "blobs_public_insert" on public.image_blobs;
create policy "blobs_public_insert" on public.image_blobs for insert with check (true);
drop policy if exists "blobs_public_update" on public.image_blobs;
create policy "blobs_public_update" on public.image_blobs for update using (true) with check (true);
