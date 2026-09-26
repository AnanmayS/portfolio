-- Rate limits for the "Ask about me" edge function (supabase/functions/ask).
-- One row per answered request: an HMAC of the visitor's IP and a time,
-- nothing else, and nothing older than two days. Questions are never stored.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.ask_hits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  at timestamptz not null default now()
);
alter table private.ask_hits enable row level security;

create index if not exists ask_hits_at on private.ask_hits (at);
create index if not exists ask_hits_ip_at on private.ask_hits (ip_hash, at);

-- 'ok' records the request; 'hour' and 'day' mean a limit is reached.
create or replace function public.ask_allow(p_ip_hash text, p_per_hour int, p_per_day int)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  day_count int;
  hour_count int;
begin
  delete from private.ask_hits where at < now() - interval '2 days';

  select count(*) into day_count from private.ask_hits where at > now() - interval '1 day';
  if day_count >= p_per_day then
    return 'day';
  end if;

  select count(*) into hour_count
  from private.ask_hits
  where ip_hash = p_ip_hash and at > now() - interval '1 hour';
  if hour_count >= p_per_hour then
    return 'hour';
  end if;

  insert into private.ask_hits (ip_hash) values (p_ip_hash);
  return 'ok';
end;
$$;

revoke all on function public.ask_allow(text, int, int) from public, anon, authenticated;
grant execute on function public.ask_allow(text, int, int) to service_role;
