CREATE TABLE IF NOT EXISTS public.backend_rate_limit_counters (
  bucket_key TEXT NOT NULL,
  window_ms INTEGER NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (bucket_key, window_ms, window_started_at)
);

CREATE INDEX IF NOT EXISTS idx_backend_rate_limit_reset_at
  ON public.backend_rate_limit_counters (reset_at ASC);

CREATE OR REPLACE FUNCTION public.consume_backend_rate_limit(
  p_bucket_key TEXT,
  p_window_ms INTEGER,
  p_max_requests INTEGER
)
RETURNS TABLE(
  allowed BOOLEAN,
  retry_after_seconds INTEGER,
  request_count INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_window_started_at TIMESTAMPTZ;
  v_reset_at TIMESTAMPTZ;
BEGIN
  IF p_bucket_key IS NULL OR LENGTH(TRIM(p_bucket_key)) = 0 THEN
    RAISE EXCEPTION 'p_bucket_key is required';
  END IF;

  IF p_window_ms <= 0 THEN
    RAISE EXCEPTION 'p_window_ms must be positive';
  END IF;

  IF p_max_requests <= 0 THEN
    RAISE EXCEPTION 'p_max_requests must be positive';
  END IF;

  DELETE FROM public.backend_rate_limit_counters
  WHERE reset_at < (v_now - INTERVAL '5 minutes');

  v_window_started_at :=
    TO_TIMESTAMP(
      FLOOR((EXTRACT(EPOCH FROM v_now) * 1000) / p_window_ms) * p_window_ms / 1000.0
    );
  v_reset_at := v_window_started_at + (p_window_ms::TEXT || ' milliseconds')::INTERVAL;

  INSERT INTO public.backend_rate_limit_counters (
    bucket_key,
    window_ms,
    window_started_at,
    request_count,
    reset_at,
    updated_at
  )
  VALUES (
    p_bucket_key,
    p_window_ms,
    v_window_started_at,
    1,
    v_reset_at,
    v_now
  )
  ON CONFLICT (bucket_key, window_ms, window_started_at)
  DO UPDATE
    SET request_count = public.backend_rate_limit_counters.request_count + 1,
        reset_at = EXCLUDED.reset_at,
        updated_at = v_now
  RETURNING public.backend_rate_limit_counters.request_count
  INTO request_count;

  allowed := request_count <= p_max_requests;
  IF allowed THEN
    retry_after_seconds := 0;
  ELSE
    retry_after_seconds := GREATEST(
      1,
      CEIL(EXTRACT(EPOCH FROM (v_reset_at - v_now)))::INTEGER
    );
  END IF;

  RETURN NEXT;
END;
$$;
