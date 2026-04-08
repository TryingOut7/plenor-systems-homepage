CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.registration_submissions (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  event_id TEXT,
  status TEXT NOT NULL CHECK (
    status IN (
      'submitted',
      'payment_pending',
      'payment_confirmation_submitted',
      'payment_confirmed',
      'registration_confirmed',
      'cancelled_rejected'
    )
  ),
  registration_payload JSONB NOT NULL,
  payment_confirmation_payload JSONB,
  internal_reason TEXT,
  user_facing_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_submissions_status_submitted_at
  ON public.registration_submissions (status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_registration_submissions_public_id
  ON public.registration_submissions (public_id);

CREATE INDEX IF NOT EXISTS idx_registration_submissions_event_id
  ON public.registration_submissions (event_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'enum_audit_logs_action'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE n.nspname = 'public'
      AND t.typname = 'enum_audit_logs_action'
      AND e.enumlabel = 'registration_status_update'
  ) THEN
    ALTER TYPE public.enum_audit_logs_action ADD VALUE 'registration_status_update';
  END IF;
END
$$;

ALTER TABLE IF EXISTS public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_key_id TEXT,
  ADD COLUMN IF NOT EXISTS target_id TEXT,
  ADD COLUMN IF NOT EXISTS old_status TEXT,
  ADD COLUMN IF NOT EXISTS new_status TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT;
