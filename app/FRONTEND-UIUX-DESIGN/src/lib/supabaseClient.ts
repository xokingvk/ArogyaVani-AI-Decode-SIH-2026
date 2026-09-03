import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client.
 *
 * Credentials come from environment variables only.
 * When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are absent (or contain
 * the placeholder strings), authService.ts detects isSupabaseConfigured=false
 * and automatically falls back to the offline/localStorage demo auth mode.
 *
 * Never commit real credentials to source. Use .env (git-ignored).
 */
const supabaseUrl      = import.meta.env.VITE_SUPABASE_URL      || '';
const supabaseAnonKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);
