CREATE TABLE IF NOT EXISTS public.guide_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guide_submissions_submitted_at
  ON public.guide_submissions (submitted_at DESC);

CREATE TABLE IF NOT EXISTS public.inquiry_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  challenge TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_submissions_submitted_at
  ON public.inquiry_submissions (submitted_at DESC);

CREATE TABLE IF NOT EXISTS public.backend_idempotency_keys (
  route TEXT NOT NULL,
  key TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  status INTEGER NOT NULL,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (route, key)
);

CREATE INDEX IF NOT EXISTS idx_backend_idempotency_created_at
  ON public.backend_idempotency_keys (created_at DESC);

CREATE TABLE IF NOT EXISTS public.backend_outbox_jobs (
  id UUID PRIMARY KEY,
  submission_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'processing', 'retrying', 'succeeded', 'dead_letter')
  ),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backend_outbox_jobs_submission_id
  ON public.backend_outbox_jobs (submission_id);

CREATE INDEX IF NOT EXISTS idx_backend_outbox_jobs_status_next_attempt
  ON public.backend_outbox_jobs (status, next_attempt_at);

CREATE INDEX IF NOT EXISTS idx_backend_outbox_jobs_created_at
  ON public.backend_outbox_jobs (created_at DESC);
