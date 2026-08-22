import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Debug utility to test the Supabase connection against the user_profiles table.
 * Returns true if successful or false with detailed error message in console.
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('user_profiles').select('count')
    if (error) {
      console.error('Supabase connection error:', error.message)
      return false
    }
    console.log('Supabase connection successful!')
    return true
  } catch (err: any) {
    console.error('Supabase connection exception:', err?.message || err)
    return false
  }
}
