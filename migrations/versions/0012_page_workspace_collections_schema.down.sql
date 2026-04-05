-- Roll back page workspace collections schema.

DROP TABLE IF EXISTS public.page_presets_tags;
DROP TABLE IF EXISTS public.page_presets CASCADE;
DROP TABLE IF EXISTS public.page_drafts CASCADE;
DROP TABLE IF EXISTS public.page_playgrounds CASCADE;
