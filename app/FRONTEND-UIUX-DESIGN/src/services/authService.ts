import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserProfile, AuthResult } from '../types/authTypes';

const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project-url-here') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
);

const LOCAL_STORAGE_SESSION_KEY = 'arogya_demo_user';
const LOCAL_STORAGE_USERS_KEY = 'arogya_registered_users';

// Pre-seeded offline mock users for immediate local testing if Supabase is not connected
const INITIAL_DEMO_USERS: Record<string, { password: string; profile: UserProfile }> = {
  ramesh: {
    password: 'password123',
    profile: {
      id: 'demo-ramesh-1',
      username: 'ramesh',
      village_district: 'Sundarpur, Varanasi',
      preferred_language: 'hi',
      created_at: new Date().toISOString(),
      ai_question_count: 0,
    },
  },
  anitha: {
    password: 'password123',
    profile: {
      id: 'demo-anitha-2',
      username: 'anitha',
      village_district: 'Melur, Madurai',
      preferred_language: 'ta',
      created_at: new Date().toISOString(),
      ai_question_count: 0,
    },
  },
  doctor_arun: {
    password: 'password123',
    profile: {
      id: 'demo-arun-3',
      username: 'doctor_arun',
      village_district: 'Anand District',
      preferred_language: 'en',
      created_at: new Date().toISOString(),
      ai_question_count: 0,
    },
  },
};

/**
 * Constructs internal email representation for username-based auth in Supabase
 * @param username Entered plain username
 * @returns Formatted email like `${username.toLowerCase().trim()}@arogyavani.local`
 */
export const constructInternalEmail = (username: string): string => {
  return `${username.toLowerCase().trim()}@arogyavani.local`;
};

/**
 * Helper to fetch mock users from localStorage when in offline/demo mode
 */
const getStoredMockUsers = (): Record<string, { password: string; profile: UserProfile }> => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (stored) {
      return { ...INITIAL_DEMO_USERS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse error
  }
  return INITIAL_DEMO_USERS;
};

/**
 * Fetches user profile from Supabase user_profiles table by user ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured) {
    const savedUserJson = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (savedUserJson) {
      try {
        return JSON.parse(savedUserJson) as UserProfile;
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('Failed to get user profile:', err);
    return null;
  }
};

/**
 * Gets the current active Supabase session (or mock session)
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (saved) {
      return {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh',
        user: {
          id: JSON.parse(saved).id,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as any,
      };
    }
    return null;
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (err) {
    console.error('Error getting current session:', err);
    return null;
  }
};

/**
 * Registers a new user with Supabase auth and inserts their record into user_profiles
 */
export const signUpNewUser = async (
  username: string,
  password: string,
  villageDistrict: string
): Promise<AuthResult> => {
  const cleanUsername = username.toLowerCase().trim();
  const email = constructInternalEmail(cleanUsername);

  if (isSupabaseConfigured) {
    try {
      // 1. Call supabase.auth.signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleanUsername,
            village_district: villageDistrict.trim(),
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
          return {
            success: false,
            errorType: 'USERNAME_TAKEN',
            errorMessage: 'Username already taken, please choose another',
          };
        }
        return {
          success: false,
          errorType: 'GENERIC_ERROR',
          errorMessage: error.message,
        };
      }

      if (data.user) {
        const newProfile: UserProfile = {
          id: data.user.id,
          username: cleanUsername,
          village_district: villageDistrict.trim(),
          created_at: new Date().toISOString(),
        };

        // 2. If signup succeeds and returns user id, insert row into user_profiles
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert(newProfile);

        if (profileError) {
          console.warn('Profile upsert warning (trigger may have handled it):', profileError);
        }

        const fetchedProfile = await getUserProfile(data.user.id);

        return {
          success: true,
          user: fetchedProfile || newProfile,
        };
      }

      return {
        success: false,
        errorType: 'GENERIC_ERROR',
        errorMessage: 'User creation failed. Please try again.',
      };
    } catch (err: any) {
      return {
        success: false,
        errorType: 'GENERIC_ERROR',
        errorMessage: err?.message || 'Network error during signup',
      };
    }
  } else {
    // Offline / Mock signup flow
    await new Promise((resolve) => setTimeout(resolve, 500));
    const allUsers = getStoredMockUsers();

    if (allUsers[cleanUsername]) {
      return {
        success: false,
        errorType: 'USERNAME_TAKEN',
        errorMessage: 'Username already taken, please choose another',
      };
    }

    const newProfile: UserProfile = {
      id: `mock-user-${Date.now()}`,
      username: cleanUsername,
      village_district: villageDistrict.trim() || 'Rural Health Center',
      created_at: new Date().toISOString(),
    };

    const updatedUsers = {
      ...allUsers,
      [cleanUsername]: {
        password,
        profile: newProfile,
      },
    };

    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newProfile));

    return {
      success: true,
      user: newProfile,
    };
  }
};

/**
 * Signs in an existing user with username and password via Supabase Auth
 */
export const signInExistingUser = async (
  username: string,
  password: string
): Promise<AuthResult> => {
  const cleanUsername = username.toLowerCase().trim();
  const email = constructInternalEmail(cleanUsername);

  if (isSupabaseConfigured) {
    try {
      // 1. Call supabase.auth.signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          errorType: 'INVALID_CREDENTIALS',
          errorMessage: 'Incorrect username or password',
        };
      }

      if (data.user) {
        // 2. On success, fetch matching row from user_profiles
        let profile = await getUserProfile(data.user.id);
        if (!profile) {
          profile = {
            id: data.user.id,
            username: cleanUsername,
            village_district: data.user.user_metadata?.village_district || 'Rural Health Center',
            created_at: data.user.created_at,
          };
        }

        return {
          success: true,
          user: profile,
        };
      }

      return {
        success: false,
        errorType: 'INVALID_CREDENTIALS',
        errorMessage: 'Incorrect username or password',
      };
    } catch (err: any) {
      return {
        success: false,
        errorType: 'GENERIC_ERROR',
        errorMessage: err?.message || 'Connection error',
      };
    }
  } else {
    // Offline / Mock sign-in flow
    await new Promise((resolve) => setTimeout(resolve, 500));
    const allUsers = getStoredMockUsers();
    const existing = allUsers[cleanUsername];

    if (!existing || existing.password !== password) {
      return {
        success: false,
        errorType: 'INVALID_CREDENTIALS',
        errorMessage: 'Incorrect username or password',
      };
    }

    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(existing.profile));
    return {
      success: true,
      user: existing.profile,
    };
  }
};

/**
 * Signs out current user and clears session storage
 */
export const signOutCurrentUser = async (): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during signOut:', err);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
};

/**
 * Subscribes to Supabase auth state changes
 */
export const subscribeToAuthState = (
  callback: (userProfile: UserProfile | null) => void
): { unsubscribe: () => void } => {
  if (isSupabaseConfigured) {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        callback(profile);
      } else {
        callback(null);
      }
    });

    return {
      unsubscribe: () => data.subscription.unsubscribe(),
    };
  }

  return {
    unsubscribe: () => {},
  };
};

/**
 * Atomically increments the AI question count for the currently authenticated Supabase user.
 * Invokes the atomic postgres RPC function `increment_ai_question_count()`.
 * In offline/demo mode, increments the mock user counter in localStorage.
 */
export const incrementAIQuestionCount = async (): Promise<number | null> => {
  if (!isSupabaseConfigured) {
    const savedUserJson = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (savedUserJson) {
      try {
        const user = JSON.parse(savedUserJson) as UserProfile;
        const newCount = (user.ai_question_count || 0) + 1;
        user.ai_question_count = newCount;
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
        return newCount;
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('increment_ai_question_count');
    if (error) {
      console.error('Error incrementing AI question count via RPC:', error);
      return null;
    }
    return typeof data === 'number' ? data : null;
  } catch (err) {
    console.error('Failed to invoke increment_ai_question_count RPC:', err);
    return null;
  }
};

