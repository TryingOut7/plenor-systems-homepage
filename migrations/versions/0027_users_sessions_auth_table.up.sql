-- Ensure Payload auth sessions table exists for users auth collection.
-- This table is queried by Payload when resolving authenticated users.
CREATE TABLE IF NOT EXISTS public.users_sessions (
  _order      integer           NOT NULL DEFAULT 0,
  _parent_id  integer           NOT NULL,
  id          character varying PRIMARY KEY,
  created_at  timestamptz       NOT NULL DEFAULT now(),
  expires_at  timestamptz       NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_sessions_parent_fk'
      AND conrelid = 'public.users_sessions'::regclass
  ) THEN
    ALTER TABLE public.users_sessions
      ADD CONSTRAINT users_sessions_parent_fk
      FOREIGN KEY (_parent_id)
      REFERENCES public.users(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS users_sessions_parent_order_idx
  ON public.users_sessions (_parent_id, _order);
