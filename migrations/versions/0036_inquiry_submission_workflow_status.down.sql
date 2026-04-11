DROP INDEX IF EXISTS public.idx_inquiry_submissions_workflow_status_submitted_at;

ALTER TABLE IF EXISTS public.inquiry_submissions
  DROP CONSTRAINT IF EXISTS inquiry_submissions_workflow_status_check;

ALTER TABLE IF EXISTS public.inquiry_submissions
  DROP COLUMN IF EXISTS workflow_status,
  DROP COLUMN IF EXISTS message,
  DROP COLUMN IF EXISTS inquiry_type,
  DROP COLUMN IF EXISTS organization;
