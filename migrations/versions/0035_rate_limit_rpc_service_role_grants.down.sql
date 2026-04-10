ALTER FUNCTION public.consume_backend_rate_limit(text, integer, integer)
  SECURITY INVOKER;

ALTER FUNCTION public.consume_backend_rate_limit(text, integer, integer)
  SET search_path = public, pg_temp;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    REVOKE EXECUTE ON FUNCTION public.consume_backend_rate_limit(text, integer, integer)
      FROM service_role;
  END IF;
END
$$;
