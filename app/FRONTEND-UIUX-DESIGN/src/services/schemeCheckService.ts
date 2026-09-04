/**
 * schemeCheckService.ts
 *
 * Logs a scheme-related RAG query to the `scheme_checks` Supabase table
 * via the `log_scheme_check` RPC function, and reads back the last check
 * timestamp for the dashboard card.
 *
 * Privacy: Only the query text (truncated) and matched scheme names are stored.
 * No GPS, no audio, no personal health data.
 */

import { supabase } from '../lib/supabaseClient';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface SchemeCheckSummary {
  /** ISO timestamp of the most recent scheme check, or null if none. */
  lastCheckedAt: string | null;
  /** Human-readable date string, e.g. "5 Sep 2026". */
  lastCheckedLabel: string;
  /** Secondary sub-label for the dashboard card. */
  subLabel: string;
}

// ──────────────────────────────────────────────────────────────
// Log a scheme query (called after a successful scheme RAG response)
// ──────────────────────────────────────────────────────────────

/**
 * Atomically inserts a new scheme_checks row via the DB-side RPC.
 * Silently no-ops if the user is not authenticated (offline/demo mode).
 */
export const logSchemeCheck = async (
  queryText: string,
  schemes: string[] = [],
): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return; // offline/demo mode — skip silently

    const { error } = await supabase.rpc('log_scheme_check', {
      p_query_text: queryText.slice(0, 500),
      p_schemes: JSON.stringify(schemes),
    });

    if (error) {
      console.warn('[schemeCheckService] RPC log_scheme_check failed:', error.message);
    }
  } catch (err) {
    // Never crash the caller
    console.warn('[schemeCheckService] Unexpected error:', err);
  }
};

// ──────────────────────────────────────────────────────────────
// Read the most recent scheme check for the dashboard card
// ──────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysSince(isoString: string): number {
  const msPerDay = 86400000;
  return Math.floor((Date.now() - new Date(isoString).getTime()) / msPerDay);
}

/**
 * Fetches the SchemeCheckSummary for the authenticated user.
 * Returns null values if no checks have been recorded or if offline.
 */
export const getSchemeCheckSummary = async (): Promise<SchemeCheckSummary> => {
  const empty: SchemeCheckSummary = {
    lastCheckedAt: null,
    lastCheckedLabel: '—',
    subLabel: 'No scheme query yet',
  };

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return empty;

    const { data, error } = await supabase
      .from('scheme_checks')
      .select('checked_at')
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[schemeCheckService] Failed to fetch last scheme check:', error.message);
      return empty;
    }

    if (!data?.checked_at) return empty;

    const days = daysSince(data.checked_at);
    const subLabel =
      days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `${days} days ago`;

    return {
      lastCheckedAt: data.checked_at,
      lastCheckedLabel: formatDate(data.checked_at),
      subLabel,
    };
  } catch (err) {
    console.warn('[schemeCheckService] Unexpected error:', err);
    return empty;
  }
};
