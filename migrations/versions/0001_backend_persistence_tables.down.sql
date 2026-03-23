DROP INDEX IF EXISTS public.idx_backend_outbox_jobs_created_at;
DROP INDEX IF EXISTS public.idx_backend_outbox_jobs_status_next_attempt;
DROP INDEX IF EXISTS public.idx_backend_outbox_jobs_submission_id;
DROP TABLE IF EXISTS public.backend_outbox_jobs;

DROP INDEX IF EXISTS public.idx_backend_idempotency_created_at;
DROP TABLE IF EXISTS public.backend_idempotency_keys;

DROP INDEX IF EXISTS public.idx_inquiry_submissions_submitted_at;
DROP TABLE IF EXISTS public.inquiry_submissions;

DROP INDEX IF EXISTS public.idx_guide_submissions_submitted_at;
DROP TABLE IF EXISTS public.guide_submissions;
