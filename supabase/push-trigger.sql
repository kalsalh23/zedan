-- webhook via pg_net: call push-send on every new notification
create extension if not exists pg_net;

create or replace function public.notify_push() returns trigger
language plpgsql security definer set search_path = public, net as $$
begin
  perform net.http_post(
    url := 'https://vrpysszlsfymkyfllrdg.supabase.co/functions/v1/push-send',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  return NEW;
end $$;

drop trigger if exists notifications_push on public.notifications;
create trigger notifications_push
after insert on public.notifications
for each row execute function public.notify_push();
