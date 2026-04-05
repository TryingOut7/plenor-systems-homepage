ALTER TABLE IF EXISTS public.page_drafts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_playgrounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_presets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_presets_tags DISABLE ROW LEVEL SECURITY;

ALTER FUNCTION public.consume_backend_rate_limit(text, integer, integer)
  RESET search_path;
