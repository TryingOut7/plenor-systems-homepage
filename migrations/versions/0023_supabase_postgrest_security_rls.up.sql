-- PostgREST exposure: these workspace tables had RLS disabled (Supabase security advisor ERROR).
-- With RLS enabled and no policies for anon/authenticated, PostgREST access is denied.
-- Payload and direct Postgres connections use roles that bypass RLS (standard for this setup).
ALTER TABLE IF EXISTS public.page_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_playgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_presets_tags ENABLE ROW LEVEL SECURITY;

-- Harden RPC used by shared rate limiter (Supabase advisor: function_search_path_mutable).
ALTER FUNCTION public.consume_backend_rate_limit(text, integer, integer)
  SET search_path = public, pg_temp;
