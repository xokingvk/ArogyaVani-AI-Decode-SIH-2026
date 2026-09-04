-- =====================================================
-- SEED / TEST SCRIPT: DASHBOARD HEALTH ALERTS
-- =====================================================
-- SAFE FOR MANUAL DEVELOPER/ADMIN TESTING ONLY
-- DO NOT RUN AUTOMATICALLY IN PRODUCTION.
-- Run in: Supabase Dashboard -> SQL Editor -> Run
-- =====================================================

-- ── 1. INSERT A TEST NATIONAL ALERT (Visible to all users) ──
-- Uncomment the block below to test "1 unread alert" on the History card:

/*
INSERT INTO public.health_alerts (
  user_id,
  title,
  body,
  severity,
  district,
  is_read
) VALUES (
  NULL, -- NULL user_id makes this a National/Regional broadcast alert
  'Seasonal Dengue Prevention Advisory',
  'Health department advisory: Ensure no standing water around homes. Visit nearest PHC for free testing if experiencing persistent fever.',
  'warning',
  'Bengaluru Urban',
  false
);
*/

-- ── 2. INSERT A TEST USER-SPECIFIC ALERT ─────────────────
-- Replace '<TARGET_USER_UUID>' with your actual auth user ID:

/*
INSERT INTO public.health_alerts (
  user_id,
  title,
  body,
  severity,
  district,
  is_read
) VALUES (
  '<TARGET_USER_UUID>'::uuid,
  'Maternal Health Checkup Reminder',
  'Your second trimester checkup is due this week at your nearest Primary Health Centre.',
  'info',
  'Bengaluru Urban',
  false
);
*/

-- ── 3. MARK ALERTS AS READ (Returns dashboard count to 0) ──

/*
UPDATE public.health_alerts
SET is_read = true
WHERE is_read = false;
*/

-- ── 4. CLEAN UP / DELETE TEST ALERTS ─────────────────────

/*
DELETE FROM public.health_alerts
WHERE title IN (
  'Seasonal Dengue Prevention Advisory',
  'Maternal Health Checkup Reminder'
);
*/

