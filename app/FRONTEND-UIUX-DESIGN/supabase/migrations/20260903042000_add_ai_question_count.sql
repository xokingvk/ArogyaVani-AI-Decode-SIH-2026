-- =====================================================
-- MIGRATION: ADD AI QUESTION COUNT & ATOMIC INCREMENT
-- =====================================================
-- Non-destructive migration to add a per-user counter for
-- successful normal Home AI assistant questions.
-- =====================================================

-- Step 1: Safely add ai_question_count column if not exists
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS ai_question_count integer NOT NULL DEFAULT 0;

-- Step 2: Atomic database-side increment function
-- Operates exclusively on auth.uid() from the authenticated JWT session.
-- Cannot be invoked with arbitrary third-party user IDs.
CREATE OR REPLACE FUNCTION public.increment_ai_question_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.user_profiles
  SET ai_question_count = coalesce(ai_question_count, 0) + 1
  WHERE id = auth.uid()
  RETURNING ai_question_count INTO new_count;

  RETURN new_count;
END;
$$;

-- Step 3: Configure RPC execution permissions
REVOKE ALL ON FUNCTION public.increment_ai_question_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_ai_question_count() TO authenticated;
