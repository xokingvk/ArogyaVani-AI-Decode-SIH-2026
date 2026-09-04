/**
 * schemeCheckService.ts
 *
 * Logs a scheme-related RAG query to the `scheme_checks` Supabase table
 * via the `log_scheme_check` RPC function (with direct insert fallback),
 * and reads back the last check timestamp for the dashboard card.
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

const LOCAL_SCHEME_CHECKS_KEY = 'arogya_scheme_checks_';

// ──────────────────────────────────────────────────────────────
export interface LogSchemeCheckResult {
  success: boolean;
  checkedAt: string | null;
}

// ──────────────────────────────────────────────────────────────
// Log a scheme query (called after a successful scheme RAG response)
// ──────────────────────────────────────────────────────────────

/**
 * Atomically inserts a new scheme_checks row via the DB-side RPC.
 * Falls back to direct table insert and local storage if offline.
 */
export const logSchemeCheck = async (
  queryText: string,
  schemes: (string | { schemeId?: string; schemeName?: string })[] = [],
): Promise<LogSchemeCheckResult> => {
  const timestamp = new Date().toISOString();
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      // In demo/guest mode, save locally so UI still functions
      saveLocalSchemeCheck('demo-user', queryText, schemes);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('arogya:scheme_check_logged'));
      }
      return { success: true, checkedAt: timestamp };
    }

    // Normalize schemes to clean array of names/IDs
    const normalizedSchemes: string[] = schemes.map((s) => {
      if (typeof s === 'string') return s.trim();
      return (s.schemeName || s.schemeId || '').trim();
    }).filter(Boolean);

    // 1. Try Supabase RPC first (passes array directly as JSONB)
    const { error: rpcError } = await supabase.rpc('log_scheme_check', {
      p_query_text: queryText.slice(0, 500),
      p_schemes: normalizedSchemes,
    });

    if (!rpcError) {
      if (import.meta.env.DEV) {
        console.log('[schemeCheckService] Scheme check logged successfully via RPC');
      }
      saveLocalSchemeCheck(user.id, queryText, normalizedSchemes);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('arogya:scheme_check_logged'));
      }
      return { success: true, checkedAt: timestamp };
    }

    if (import.meta.env.DEV) {
      console.warn('[schemeCheckService] RPC failed:\n' + rpcError.message);
    }

    // 2. Direct table insert fallback
    const { error: insertError } = await supabase.from('scheme_checks').insert({
      user_id: user.id,
      query_text: queryText.slice(0, 500),
      schemes: normalizedSchemes,
      checked_at: timestamp,
    });

    if (insertError) {
      if (import.meta.env.DEV) {
        console.warn('[schemeCheckService] Scheme check persistence failed:\n' + insertError.message);
      }
      saveLocalSchemeCheck(user.id, queryText, normalizedSchemes);
      return { success: false, checkedAt: null };
    } else {
      if (import.meta.env.DEV) {
        console.log('[schemeCheckService] Scheme check logged successfully via direct insert');
      }
      saveLocalSchemeCheck(user.id, queryText, normalizedSchemes);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('arogya:scheme_check_logged'));
      }
      return { success: true, checkedAt: timestamp };
    }
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.warn('[schemeCheckService] Scheme check persistence failed:\n' + (err?.message || String(err)));
    }
    return { success: false, checkedAt: null };
  }
};

function saveLocalSchemeCheck(
  userId: string,
  queryText: string,
  schemes: string[] | (string | { schemeId?: string; schemeName?: string })[],
) {
  try {
    if (typeof localStorage === 'undefined') return;
    const key = `${LOCAL_SCHEME_CHECKS_KEY}${userId}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift({
      query_text: queryText.slice(0, 500),
      schemes,
      checked_at: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 30)));
  } catch {
    // Non-fatal
  }
}

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
 * Returns truthful empty values if no checks have been recorded.
 */
export const getSchemeCheckSummary = async (): Promise<SchemeCheckSummary> => {
  const empty: SchemeCheckSummary = {
    lastCheckedAt: null,
    lastCheckedLabel: '—',
    subLabel: 'No scheme query yet',
  };

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      // Check local cache
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(`${LOCAL_SCHEME_CHECKS_KEY}demo-user`);
        if (raw) {
          const list = JSON.parse(raw);
          if (list && list.length > 0 && list[0].checked_at) {
            const days = daysSince(list[0].checked_at);
            const subLabel =
              days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `${days} days ago`;
            return {
              lastCheckedAt: list[0].checked_at,
              lastCheckedLabel: formatDate(list[0].checked_at),
              subLabel,
            };
          }
        }
      }
      return empty;
    }

    const { data, error } = await supabase
      .from('scheme_checks')
      .select('checked_at')
      .eq('user_id', user.id)
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[schemeCheckService] Failed to fetch last scheme check from Supabase:', error.message);
      }
      // Check local cache
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(`${LOCAL_SCHEME_CHECKS_KEY}${user.id}`);
        if (raw) {
          const list = JSON.parse(raw);
          if (list && list.length > 0 && list[0].checked_at) {
            const days = daysSince(list[0].checked_at);
            const subLabel =
              days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `${days} days ago`;
            return {
              lastCheckedAt: list[0].checked_at,
              lastCheckedLabel: formatDate(list[0].checked_at),
              subLabel,
            };
          }
        }
      }
      return empty;
    }

    if (!data?.checked_at) {
      // DB is reachable but may be empty (e.g. RPC/insert unavailable).
      // Fall back to the locally persisted successful Scheme RAG record so
      // the dashboard remains accurate in demo/offline mode.
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(`${LOCAL_SCHEME_CHECKS_KEY}${user.id}`);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list[0]?.checked_at) {
              const days = daysSince(list[0].checked_at);
              return {
                lastCheckedAt: list[0].checked_at,
                lastCheckedLabel: formatDate(list[0].checked_at),
                subLabel: days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `${days} days ago`,
              };
            }
          }
        } catch {
          // Ignore local cache parse failures.
        }
      }
      return empty;
    }

    const days = daysSince(data.checked_at);
    const subLabel =
      days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `${days} days ago`;

    return {
      lastCheckedAt: data.checked_at,
      lastCheckedLabel: formatDate(data.checked_at),
      subLabel,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[schemeCheckService] Unexpected error in getSchemeCheckSummary:', err);
    }
    return empty;
  }
};
