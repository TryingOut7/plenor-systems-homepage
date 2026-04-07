-- Ensure users auth/admin read-path columns and enums exist.
-- Required by Payload queries for authenticated users in admin/runtime.

BEGIN;

DO $$
BEGIN
  IF to_regtype('public.enum_users_role') IS NULL THEN
    CREATE TYPE public.enum_users_role AS ENUM ('admin', 'editor', 'author');
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regtype('public.enum_users_cms_lane_preference') IS NULL THEN
    CREATE TYPE public.enum_users_cms_lane_preference AS ENUM ('simple', 'advanced');
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regtype('public.enum_users_role') IS NOT NULL THEN
    ALTER TYPE public.enum_users_role ADD VALUE IF NOT EXISTS 'admin';
    ALTER TYPE public.enum_users_role ADD VALUE IF NOT EXISTS 'editor';
    ALTER TYPE public.enum_users_role ADD VALUE IF NOT EXISTS 'author';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regtype('public.enum_users_cms_lane_preference') IS NOT NULL THEN
    ALTER TYPE public.enum_users_cms_lane_preference ADD VALUE IF NOT EXISTS 'simple';
    ALTER TYPE public.enum_users_cms_lane_preference ADD VALUE IF NOT EXISTS 'advanced';
  END IF;
END
$$;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS name character varying,
  ADD COLUMN IF NOT EXISTS role public.enum_users_role DEFAULT 'editor'::public.enum_users_role,
  ADD COLUMN IF NOT EXISTS cms_lane_preference public.enum_users_cms_lane_preference DEFAULT 'simple'::public.enum_users_cms_lane_preference,
  ADD COLUMN IF NOT EXISTS can_manage_system_fields boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_cms_training_hints boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_a_p_i_key boolean,
  ADD COLUMN IF NOT EXISTS api_key character varying,
  ADD COLUMN IF NOT EXISTS api_key_index character varying,
  ADD COLUMN IF NOT EXISTS reset_password_token character varying,
  ADD COLUMN IF NOT EXISTS reset_password_expiration timestamptz,
  ADD COLUMN IF NOT EXISTS salt character varying,
  ADD COLUMN IF NOT EXISTS hash character varying,
  ADD COLUMN IF NOT EXISTS login_attempts numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lock_until timestamptz;

CREATE INDEX IF NOT EXISTS users_created_at_idx
  ON public.users USING btree (created_at);

CREATE INDEX IF NOT EXISTS users_updated_at_idx
  ON public.users USING btree (updated_at);

COMMIT;
