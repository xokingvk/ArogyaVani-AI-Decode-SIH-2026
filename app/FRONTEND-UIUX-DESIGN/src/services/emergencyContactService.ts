import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from './authService';

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

const LOCAL_STORAGE_PREFIX = 'arogya_emergency_contacts_';

const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project-url-here') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
);

function getLocalContacts(userId: string): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalContacts(userId: string, contacts: EmergencyContact[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify(contacts));
  } catch {
    // Non-fatal
  }
}

/**
 * Sanitizes phone numbers for tel: URL schemes
 */
export function formatPhoneForCall(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Fetches all emergency contacts for the authenticated user
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  if (isSupabaseConfigured && !user.id.startsWith('demo-')) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[emergencyContactService] Supabase fetch error, falling back to local:', error.message);
        }
        return getLocalContacts(user.id);
      }
      return (data as EmergencyContact[]) || [];
    } catch {
      return getLocalContacts(user.id);
    }
  }

  return getLocalContacts(user.id);
}

/**
 * Creates a new emergency contact for the active user
 */
export async function createEmergencyContact(contact: {
  name: string;
  relationship: string;
  phone: string;
}): Promise<{ success: boolean; contact?: EmergencyContact; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const name = contact.name.trim();
  const relationship = contact.relationship.trim();
  const phone = contact.phone.trim();

  if (!name || !relationship || !phone) {
    return { success: false, error: 'All fields are required.' };
  }

  const newContact: EmergencyContact = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `contact-${Date.now()}`,
    user_id: user.id,
    name,
    relationship,
    phone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && !user.id.startsWith('demo-')) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name,
          relationship,
          phone,
        })
        .select()
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[emergencyContactService] Supabase insert error, saving locally:', error.message);
        }
        const local = getLocalContacts(user.id);
        const updated = [...local, newContact];
        saveLocalContacts(user.id, updated);
        return { success: true, contact: newContact };
      }

      return { success: true, contact: data as EmergencyContact };
    } catch {
      const local = getLocalContacts(user.id);
      const updated = [...local, newContact];
      saveLocalContacts(user.id, updated);
      return { success: true, contact: newContact };
    }
  }

  const local = getLocalContacts(user.id);
  const updated = [...local, newContact];
  saveLocalContacts(user.id, updated);
  return { success: true, contact: newContact };
}

/**
 * Updates an existing emergency contact
 */
export async function updateEmergencyContact(
  id: string,
  contact: { name: string; relationship: string; phone: string }
): Promise<{ success: boolean; contact?: EmergencyContact; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const name = contact.name.trim();
  const relationship = contact.relationship.trim();
  const phone = contact.phone.trim();

  if (!name || !relationship || !phone) {
    return { success: false, error: 'All fields are required.' };
  }

  if (isSupabaseConfigured && !user.id.startsWith('demo-')) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update({
          name,
          relationship,
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[emergencyContactService] Supabase update error, updating locally:', error.message);
        }
        const local = getLocalContacts(user.id);
        const updated = local.map((c) => (c.id === id ? { ...c, name, relationship, phone } : c));
        saveLocalContacts(user.id, updated);
        return { success: true, contact: { id, user_id: user.id, name, relationship, phone } };
      }

      return { success: true, contact: data as EmergencyContact };
    } catch {
      const local = getLocalContacts(user.id);
      const updated = local.map((c) => (c.id === id ? { ...c, name, relationship, phone } : c));
      saveLocalContacts(user.id, updated);
      return { success: true, contact: { id, user_id: user.id, name, relationship, phone } };
    }
  }

  const local = getLocalContacts(user.id);
  const updated = local.map((c) => (c.id === id ? { ...c, name, relationship, phone } : c));
  saveLocalContacts(user.id, updated);
  return { success: true, contact: { id, user_id: user.id, name, relationship, phone } };
}

/**
 * Deletes an emergency contact
 */
export async function deleteEmergencyContact(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  if (isSupabaseConfigured && !user.id.startsWith('demo-')) {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[emergencyContactService] Supabase delete error, deleting locally:', error.message);
        }
        const local = getLocalContacts(user.id);
        const updated = local.filter((c) => c.id !== id);
        saveLocalContacts(user.id, updated);
        return { success: true };
      }

      return { success: true };
    } catch {
      const local = getLocalContacts(user.id);
      const updated = local.filter((c) => c.id !== id);
      saveLocalContacts(user.id, updated);
      return { success: true };
    }
  }

  const local = getLocalContacts(user.id);
  const updated = local.filter((c) => c.id !== id);
  saveLocalContacts(user.id, updated);
  return { success: true };
}
