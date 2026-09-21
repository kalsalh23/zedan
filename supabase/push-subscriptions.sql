create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
drop policy if exists "subs_anyone_insert" on public.push_subscriptions;
create policy "subs_anyone_insert" on public.push_subscriptions for insert with check (true);
