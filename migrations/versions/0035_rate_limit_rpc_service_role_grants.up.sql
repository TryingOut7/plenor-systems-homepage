ALTER FUNCTION public.consume_backend_rate_limit(text, integer, integer)
  SECURITY DEFINER;

ALTER FUNCTION public.consume_backend_rate_limit(text, integer, integer)
  SET search_path = public, pg_temp;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT USAGE ON SCHEMA public TO service_role;
    GRANT EXECUTE ON FUNCTION public.consume_backend_rate_limit(text, integer, integer)
      TO service_role;
  END IF;
END
$$;
