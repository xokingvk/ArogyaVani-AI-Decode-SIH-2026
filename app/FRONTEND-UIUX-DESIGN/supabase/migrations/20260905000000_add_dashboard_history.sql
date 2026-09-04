-- =====================================================
-- MIGRATION: DASHBOARD HISTORY TABLES
-- scheme_checks | health_alerts | family_members
-- =====================================================
-- Non-destructive: all statements use IF NOT EXISTS / OR REPLACE.
-- Safe to run multiple times on existing databases.
-- Run in: Supabase Dashboard -> SQL Editor -> Run
-- =====================================================

-- ── 1. SCHEME CHECKS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scheme_checks (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query_text  text,
  schemes     jsonb       DEFAULT '[]'::jsonb,
  checked_at  timestamptz DEFAULT now()
);

ALTER TABLE public.scheme_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheme checks"
  ON public.scheme_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheme checks"
  ON public.scheme_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_scheme_checks_user_checked
  ON public.scheme_checks (user_id, checked_at DESC);


-- ── 2. HEALTH ALERTS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  body         text,
  severity     text        NOT NULL DEFAULT 'info',
  district     text,
  is_read      boolean     NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or national alerts"
  ON public.health_alerts FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can mark own alerts read"
  ON public.health_alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_health_alerts_user_read
  ON public.health_alerts (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_alerts_national
  ON public.health_alerts (created_at DESC)
  WHERE user_id IS NULL;


-- ── 3. FAMILY MEMBERS ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_members (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          text        NOT NULL,
  relationship  text,
  age           integer,
  asha_linked   boolean     NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family members"
  ON public.family_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family members"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family members"
  ON public.family_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own family members"
  ON public.family_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_family_members_user_id
  ON public.family_members (user_id);


-- ── 4. HELPER: log_scheme_check RPC ──────────────────
CREATE OR REPLACE FUNCTION public.log_scheme_check(
  p_query_text  text     DEFAULT NULL,
  p_schemes     jsonb    DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.scheme_checks (user_id, query_text, schemes)
  VALUES (
    auth.uid(),
    left(coalesce(p_query_text, ''), 500),
    coalesce(p_schemes, '[]'::jsonb)
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_scheme_check(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_scheme_check(text, jsonb) TO authenticated;
