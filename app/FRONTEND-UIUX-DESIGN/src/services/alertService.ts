/**
 * alertService.ts
 *
 * Reads unread health_alerts from Supabase for the authenticated user.
 * Alerts include both user-specific and national (user_id IS NULL) records,
 * which is enforced by the RLS policy on the table.
 *
 * Privacy: No GPS or health data is stored in alerts.
 */

import { supabase } from '../lib/supabaseClient';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface AlertSummary {
  /** Total unread alert count (0 if none). */
  unreadCount: number;
  /** Human-readable label, e.g. "2 Alerts" or "0". */
  primaryLabel: string;
  /** Sub-label for the dashboard card. */
  subLabel: string;
}

// ──────────────────────────────────────────────────────────────
// Fetch unread alerts for the dashboard card
// ──────────────────────────────────────────────────────────────

/**
 * Returns the unread health alert count for the current user.
 * Returns 0 counts if not authenticated or if the table is empty.
 */
export const getAlertSummary = async (): Promise<AlertSummary> => {
  const zero: AlertSummary = {
    unreadCount: 0,
    primaryLabel: '0',
    subLabel: 'No active alerts',
  };

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return zero;

    const { count, error } = await supabase
      .from('health_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .or(`user_id.eq.${user.id},user_id.is.null`);

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[alertService] Failed to fetch alert count:', error.message);
      }
      return zero;
    }

    const unread = count ?? 0;
    return {
      unreadCount: unread,
      primaryLabel: String(unread),
      subLabel: unread === 0 ? 'No active alerts' : unread === 1 ? '1 unread alert' : `${unread} unread alerts`,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[alertService] Unexpected error:', err);
    }
    return zero;
  }
};
