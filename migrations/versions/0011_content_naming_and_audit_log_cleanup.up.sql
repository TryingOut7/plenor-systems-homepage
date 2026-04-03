-- Content naming normalization + audit log actor denormalization cleanup.
-- Safe to run multiple times.

BEGIN;

-- ---------------------------------------------------------------------------
-- Audit logs: move to relationship-derived actor identity and keep request IP.
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.audit_logs
  ADD COLUMN IF NOT EXISTS ip_address varchar;

ALTER TABLE IF EXISTS public.audit_logs
  DROP COLUMN IF EXISTS actor_id,
  DROP COLUMN IF EXISTS user_email,
  DROP COLUMN IF EXISTS actor_role;

-- ---------------------------------------------------------------------------
-- Testimonials: person_name -> name
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.testimonials
  ADD COLUMN IF NOT EXISTS name varchar;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'testimonials'
      AND column_name = 'person_name'
  ) THEN
    UPDATE public.testimonials
    SET name = person_name
    WHERE (name IS NULL OR name = '')
      AND person_name IS NOT NULL
      AND person_name <> '';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Team members: *_href -> *_url
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.team_members
  ADD COLUMN IF NOT EXISTS linkedin_url varchar,
  ADD COLUMN IF NOT EXISTS twitter_url varchar;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'team_members'
      AND column_name = 'linkedin_href'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'team_members'
      AND column_name = 'twitter_href'
  ) THEN
    UPDATE public.team_members
    SET linkedin_url = COALESCE(NULLIF(linkedin_url, ''), linkedin_href),
        twitter_url = COALESCE(NULLIF(twitter_url, ''), twitter_href)
    WHERE linkedin_href IS NOT NULL OR twitter_href IS NOT NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Logos: href -> url
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.logos
  ADD COLUMN IF NOT EXISTS url varchar;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'logos'
      AND column_name = 'href'
  ) THEN
    UPDATE public.logos
    SET url = COALESCE(NULLIF(url, ''), href)
    WHERE href IS NOT NULL;
  END IF;
END $$;

COMMIT;
