-- ============ Notifications ============
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'general' check (type in ('product','offer','general')),
  title text not null,
  body text default '',
  image_url text,
  product_id uuid references public.products(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists notifications_created_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;
create policy "notifications_public_read" on public.notifications for select using (true);
create policy "notifications_admin_insert" on public.notifications for insert to authenticated with check (public.is_admin());
create policy "notifications_admin_delete" on public.notifications for delete to authenticated using (public.is_admin());

-- stream inserts to connected clients in realtime
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
  when others then null;
end $$;
