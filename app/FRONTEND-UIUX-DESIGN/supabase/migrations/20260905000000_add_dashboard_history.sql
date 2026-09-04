-- =====================================================
-- MIGRATION: DASHBOARD HISTORY TABLES (IDEMPOTENT)
-- scheme_checks | health_alerts | family_members | emergency_contacts
-- =====================================================
-- Non-destructive: All statements use IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS.
-- Completely safe to run multiple times without duplicating policies or losing data.
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

-- Drop existing policies before recreation to prevent error 42710
DROP POLICY IF EXISTS "Users can view own scheme checks" ON public.scheme_checks;
DROP POLICY IF EXISTS "Users can insert own scheme checks" ON public.scheme_checks;
DROP POLICY IF EXISTS "Users can update own scheme checks" ON public.scheme_checks;
DROP POLICY IF EXISTS "Users can delete own scheme checks" ON public.scheme_checks;

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

-- Drop existing policies before recreation
DROP POLICY IF EXISTS "Users can view own or national alerts" ON public.health_alerts;
DROP POLICY IF EXISTS "Users can mark own alerts read" ON public.health_alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.health_alerts;

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


-- ── 3. EMERGENCY CONTACTS ────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         text        NOT NULL,
  relationship text        NOT NULL,
  phone        text        NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreation
DROP POLICY IF EXISTS "Users can view own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can insert own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can update own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can delete own emergency contacts" ON public.emergency_contacts;

CREATE POLICY "Users can view own emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
  ON public.emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id
  ON public.emergency_contacts (user_id);


-- ── 4. FAMILY MEMBERS ────────────────────────────────
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

-- Drop existing policies before recreation
DROP POLICY IF EXISTS "Users can view own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can insert own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can update own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can delete own family members" ON public.family_members;

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


-- ── 5. HELPER: log_scheme_check RPC ──────────────────
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

  INSERT INTO public.scheme_checks (user_id, query_text, schemes, checked_at)
  VALUES (
    auth.uid(),
    left(coalesce(p_query_text, ''), 500),
    coalesce(p_schemes, '[]'::jsonb),
    now()
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_scheme_check(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_scheme_check(text, jsonb) TO authenticated;
