-- The OpenRouter key for supabase/functions/ask, read from Vault. Only the
-- service role (the edge function) may call this. The key itself is stored
-- with vault.create_secret(<key>, 'openrouter_api_key') and never in git.
create or replace function public.ask_openrouter_key()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'openrouter_api_key' limit 1;
$$;

revoke all on function public.ask_openrouter_key() from public, anon, authenticated;
grant execute on function public.ask_openrouter_key() to service_role;
