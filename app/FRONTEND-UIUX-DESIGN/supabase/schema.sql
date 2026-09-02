-- =====================================================
-- AROGYAVANI AI - DATABASE SCHEMA
-- =====================================================
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- Safe to re-run on existing databases (drops & recreates cleanly)
-- =====================================================

-- Step 1: Drop old trigger (if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop old function (if exists)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Drop and recreate table cleanly
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  village_district text,
  preferred_language text DEFAULT 'en',
  ai_question_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Step 4: Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 6: Atomic database-side increment function for normal Home AI questions
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

REVOKE ALL ON FUNCTION public.increment_ai_question_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_ai_question_count() TO authenticated;

-- Step 7: Auto-populate profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  raw_username text;
  raw_village_district text;
BEGIN
  raw_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  raw_village_district := coalesce(
    new.raw_user_meta_data->>'village_district',
    'Rural Health Center'
  );

  INSERT INTO public.user_profiles (id, username, village_district, preferred_language, ai_question_count)
  VALUES (
    new.id,
    lower(raw_username),
    raw_village_district,
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en'),
    0
  )
  ON CONFLICT (id) DO UPDATE
    SET username = excluded.username,
        village_district = excluded.village_district;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles (username);

