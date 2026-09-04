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
import { getCurrentSession, isSupabaseConfigured } from './authService';

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

export interface LogSchemeCheckResult {
  success: boolean;
  checkedAt: string | null;
}

/**
 * Normalizes input schemes to clean array of string names/IDs
 */
export function normalizeSchemes(
  schemes: (string | { schemeId?: string; schemeName?: string; name?: string; id?: string })[] = []
): string[] {
  return schemes
    .map((s) => {
      if (typeof s === 'string') return s.trim();
      if (s && typeof s === 'object') {
        return (s.schemeName || s.schemeId || s.name || s.id || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

// ──────────────────────────────────────────────────────────────
// Log a scheme query (called after a successful scheme RAG response)
// ──────────────────────────────────────────────────────────────

/**
 * Atomically inserts a new scheme_checks row via the DB-side RPC.
 * Falls back to direct table insert and local storage if offline or failed.
 */
export const logSchemeCheck = async (
  queryText: string,
  schemes: (string | { schemeId?: string; schemeName?: string; name?: string; id?: string })[] = [],
): Promise<LogSchemeCheckResult> => {
  const localTimestamp = new Date().toISOString();
  const normalizedSchemes = normalizeSchemes(schemes);

  if (import.meta.env.DEV) {
    console.log('[scheme-history] Scheme RAG result received');
    console.log('[dashboard] Supabase configured:', isSupabaseConfigured);
  }

  try {
    const session = await getCurrentSession();
    const user = session?.user;
    const effectiveUserId = user?.id || 'demo-user';

    // ──────────────────────────────────────────────────────────
    // 1. AUTHENTICATED SUPABASE PATH (if Supabase session exists)
    // ──────────────────────────────────────────────────────────
    if (isSupabaseConfigured && user && !user.id.startsWith('mock-') && !user.id.startsWith('demo-')) {
      // Step A: Call RPC
      let rpcSuccess = false;
      let returnedId: string | null = null;

      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('log_scheme_check', {
          p_query_text: queryText.slice(0, 500),
          p_schemes: normalizedSchemes,
        });

        if (!rpcError && rpcData) {
          rpcSuccess = true;
          returnedId = String(rpcData);
        } else if (rpcError && import.meta.env.DEV) {
          console.warn('[scheme-history] RPC failed:', rpcError.message);
        }
      } catch (rpcErr) {
        if (import.meta.env.DEV) {
          console.warn('[scheme-history] RPC invocation exception:', rpcErr);
        }
      }

      // Step B: If RPC succeeded, immediately read the created row
      if (rpcSuccess && returnedId) {
        try {
          const { data: row, error: readError } = await supabase
            .from('scheme_checks')
            .select('id, checked_at, query_text, schemes')
            .eq('id', returnedId)
            .single();

          if (!readError && row?.checked_at) {
            if (import.meta.env.DEV) {
              console.log('[scheme-history] persistence: rpc');
              console.log('[scheme-history] savedAt:', row.checked_at);
            }

            saveLocalSchemeCheck(effectiveUserId, queryText, normalizedSchemes, row.checked_at);

            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('arogya:scheme_check_logged', {
                  detail: { id: row.id, checkedAt: row.checked_at, source: 'rpc' },
                })
              );
            }

            return { success: true, checkedAt: row.checked_at };
          }
        } catch {
          // Fall through to direct insert or local fallback
        }
      }

      // Step C: If RPC failed, try direct table insert
      try {
        const { data: insertRow, error: insertError } = await supabase
          .from('scheme_checks')
          .insert({
            user_id: user.id,
            query_text: queryText.slice(0, 500),
            schemes: normalizedSchemes,
          })
          .select('id, checked_at')
          .single();

        if (!insertError && insertRow?.checked_at) {
          if (import.meta.env.DEV) {
            console.log('[scheme-history] persistence: direct');
            console.log('[scheme-history] savedAt:', insertRow.checked_at);
          }

          saveLocalSchemeCheck(effectiveUserId, queryText, normalizedSchemes, insertRow.checked_at);

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('arogya:scheme_check_logged', {
                detail: { id: insertRow.id, checkedAt: insertRow.checked_at, source: 'direct' },
              })
            );
          }

          return { success: true, checkedAt: insertRow.checked_at };
        } else if (insertError && import.meta.env.DEV) {
          console.warn('[scheme-history] Direct insert failed:', insertError.message);
        }
      } catch (insertErr) {
        if (import.meta.env.DEV) {
          console.warn('[scheme-history] Direct insert exception:', insertErr);
        }
      }
    }

    // ──────────────────────────────────────────────────────────
    // 2. LOCAL FALLBACK (Offline / Demo Mode / Both DB paths failed)
    // ──────────────────────────────────────────────────────────
    saveLocalSchemeCheck(effectiveUserId, queryText, normalizedSchemes, localTimestamp);

    if (import.meta.env.DEV) {
      console.log('[scheme-history] persistence: local');
      console.log('[scheme-history] savedAt:', localTimestamp);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('arogya:scheme_check_logged', {
          detail: { source: 'local', checkedAt: localTimestamp },
        })
      );
    }

    // If we're in demo/local auth mode, local storage is the primary storage mechanism
    if (!isSupabaseConfigured || effectiveUserId.startsWith('mock-') || effectiveUserId.startsWith('demo-')) {
      return { success: true, checkedAt: localTimestamp };
    }

    return { success: false, checkedAt: null };
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.warn('[scheme-history] Scheme check persistence failed:\n' + (err?.message || String(err)));
    }
    return { success: false, checkedAt: null };
  }
};

export function saveLocalSchemeCheck(
  userId: string,
  queryText: string,
  schemes: string[] | (string | { schemeId?: string; schemeName?: string; name?: string; id?: string })[],
  checkedAt?: string,
) {
  try {
    if (typeof localStorage === 'undefined') return;
    const key = `${LOCAL_SCHEME_CHECKS_KEY}${userId}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift({
      query_text: queryText.slice(0, 500),
      schemes: normalizeSchemes(schemes),
      checked_at: checkedAt || new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 30)));
  } catch {
    // Non-fatal
  }
}

// ──────────────────────────────────────────────────────────────
// Read the most recent scheme check for the dashboard card
// ──────────────────────────────────────────────────────────────

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysSince(isoString: string): number {
  const msPerDay = 86400000;
  return Math.floor((Date.now() - new Date(isoString).getTime()) / msPerDay);
}

export function formatSubLabel(isoString: string): string {
  const days = daysSince(isoString);
  if (days === 0) return 'Checked today';
  if (days === 1) return 'Checked yesterday';
  if (days > 1) return `${days} days ago`;
  return 'Checked today';
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
    const session = await getCurrentSession();
    const user = session?.user;
    const effectiveUserId = user?.id || 'demo-user';

    // Check Supabase if configured and user is real
    if (isSupabaseConfigured && user && !user.id.startsWith('mock-') && !user.id.startsWith('demo-')) {
      const { data, error } = await supabase
        .from('scheme_checks')
        .select('checked_at')
        .eq('user_id', user.id)
        .order('checked_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.checked_at) {
        return {
          lastCheckedAt: data.checked_at,
          lastCheckedLabel: formatDate(data.checked_at),
          subLabel: formatSubLabel(data.checked_at),
        };
      }

      if (error && import.meta.env.DEV) {
        console.warn('[scheme-history] Failed to fetch last scheme check from Supabase:', error.message);
      }
    }

    // Check local storage for the effective user
    if (typeof localStorage !== 'undefined') {
      const userKeys = [`${LOCAL_SCHEME_CHECKS_KEY}${effectiveUserId}`, `${LOCAL_SCHEME_CHECKS_KEY}demo-user`];
      for (const key of userKeys) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.length > 0 && list[0]?.checked_at) {
              const checkedAt = list[0].checked_at;
              return {
                lastCheckedAt: checkedAt,
                lastCheckedLabel: formatDate(checkedAt),
                subLabel: formatSubLabel(checkedAt),
              };
            }
          } catch {
            // Ignore parse error
          }
        }
      }
    }

    return empty;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[scheme-history] Unexpected error in getSchemeCheckSummary:', err);
    }
    return empty;
  }
};

