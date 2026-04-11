ALTER TABLE IF EXISTS public.inquiry_submissions
  ADD COLUMN IF NOT EXISTS organization TEXT,
  ADD COLUMN IF NOT EXISTS inquiry_type TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS workflow_status TEXT NOT NULL DEFAULT 'submitted';

UPDATE public.inquiry_submissions
SET
  organization = COALESCE(organization, company),
  message = COALESCE(message, challenge),
  inquiry_type = COALESCE(inquiry_type, 'General inquiry'),
  workflow_status = COALESCE(workflow_status, 'submitted')
WHERE TRUE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiry_submissions_workflow_status_check'
  ) THEN
    ALTER TABLE public.inquiry_submissions
      ADD CONSTRAINT inquiry_submissions_workflow_status_check
      CHECK (workflow_status IN ('submitted', 'under_review', 'responded', 'closed'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_inquiry_submissions_workflow_status_submitted_at
  ON public.inquiry_submissions (workflow_status, submitted_at DESC);
