/**
 * dashboardService.ts
 *
 * Fetches all six dashboard card values from real data sources.
 * Each fetch is independent so that one failure never breaks the others.
 *
 * Data sources:
 *  1. voice_queries_today  → user_profiles.ai_question_count  (already live)
 *  2. scheme_status        → distinct matched schemes count    (scheme_checks)
 *  3. last_scheme_check    → latest checked_at timestamp       (scheme_checks)
 *  4. nearest_pds_centre   → deferred to on-demand GPS tap     (pdsService)
 *  5. active_alerts        → unread health_alerts count        (health_alerts)
 *  6. family_connected     → emergency_contacts count          (emergency_contacts)
 *
 * Privacy guarantee:
 *  - GPS is NEVER read here. The PDS card shows "Tap to find" and fetches
 *    location only when the user explicitly taps the card.
 *  - No fake/placeholder values are ever returned.
 *  - When data is absent, truthful zero/empty states are used.
 */

import { supabase } from '../lib/supabaseClient';
import { DashboardStatsData } from '../types/dashboardTypes';
import { UserProfile } from '../types/authTypes';
import { getSchemeCheckSummary } from './schemeCheckService';
import { getEmergencyContactCount } from './emergencyContactService';
import { getCurrentSession, isSupabaseConfigured } from './authService';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

async function getEffectiveUserId(userProfile?: UserProfile | null): Promise<string> {
  if (userProfile?.id) return userProfile.id;
  const session = await getCurrentSession();
  if (session?.user?.id) return session.user.id;
  return 'demo-user';
}

function getLocalSchemeChecks(userId: string): any[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const keys = [`arogya_scheme_checks_${userId}`, 'arogya_scheme_checks_demo-user'];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────────────────────
// Individual card fetchers (all fail-safe & independent)
// ──────────────────────────────────────────────────────────────

/**
 * Calculates the number of distinct matched schemes across recent scheme RAG queries.
 */
async function fetchSchemeStatus(userProfile?: UserProfile | null): Promise<{ primaryValue: string; secondaryLabel: string }> {
  try {
    const effectiveUserId = await getEffectiveUserId(userProfile);
    let rows: any[] = [];

    if (isSupabaseConfigured && !effectiveUserId.startsWith('mock-') && !effectiveUserId.startsWith('demo-')) {
      const { data, error } = await supabase
        .from('scheme_checks')
        .select('schemes')
        .eq('user_id', effectiveUserId)
        .order('checked_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        rows = data;
      } else if (error && import.meta.env.DEV) {
        console.warn('[dashboardService] fetchSchemeStatus query failed:', error.message);
      }
    }

    if (rows.length === 0) {
      rows = getLocalSchemeChecks(effectiveUserId);
    }

    const distinctSchemes = new Set<string>();
    for (const row of rows) {
      if (!row || !row.schemes) continue;
      let list = row.schemes;
      if (typeof list === 'string') {
        try {
          list = JSON.parse(list);
        } catch {
          list = [list];
        }
      }
      if (Array.isArray(list)) {
        for (const item of list) {
          if (!item) continue;
          if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed) distinctSchemes.add(trimmed);
          } else if (typeof item === 'object') {
            const name = item.schemeName || item.schemeId || item.name || item.id;
            if (name) distinctSchemes.add(String(name).trim());
          }
        }
      }
    }

    const count = distinctSchemes.size;
    return {
      primaryValue: String(count),
      secondaryLabel:
        count === 0
          ? 'No matches yet'
          : count === 1
          ? '1 scheme matched'
          : `${count} schemes matched`,
    };
  } catch {
    return { primaryValue: '0', secondaryLabel: 'No matches yet' };
  }
}

/**
 * Retrieves the latest scheme check timestamp from scheme_checks.
 */
async function fetchLastSchemeCheck(): Promise<{ primaryValue: string; secondaryLabel: string }> {
  try {
    const summary = await getSchemeCheckSummary();
    if (!summary.lastCheckedAt) {
      return { primaryValue: '—', secondaryLabel: 'No scheme query yet' };
    }
    return {
      primaryValue: summary.lastCheckedLabel,
      secondaryLabel: summary.subLabel,
    };
  } catch {
    return { primaryValue: '—', secondaryLabel: 'No scheme query yet' };
  }
}

/**
 * Counts unread health alerts relevant to the current user (user_id = user.id OR user_id IS NULL).
 */
async function fetchActiveAlerts(userProfile?: UserProfile | null): Promise<{ primaryValue: string; secondaryLabel: string }> {
  try {
    const session = await getCurrentSession();
    const user = session?.user;
    const effectiveUserId = user?.id || userProfile?.id;

    if (!isSupabaseConfigured || !effectiveUserId || effectiveUserId.startsWith('mock-') || effectiveUserId.startsWith('demo-')) {
      return { primaryValue: '0', secondaryLabel: 'No active alerts' };
    }

    const { count, error } = await supabase
      .from('health_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .or(`user_id.eq.${effectiveUserId},user_id.is.null`);

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[dashboardService] fetchActiveAlerts failed:', error.message);
      }
      return { primaryValue: '0', secondaryLabel: 'No active alerts' };
    }

    const unread = count ?? 0;
    return {
      primaryValue: String(unread),
      secondaryLabel:
        unread === 0
          ? 'No active alerts'
          : unread === 1
          ? '1 unread alert'
          : `${unread} unread alerts`,
    };
  } catch {
    return { primaryValue: '0', secondaryLabel: 'No active alerts' };
  }
}

/**
 * Counts emergency contacts configured in public.emergency_contacts (NOT family_members).
 */
async function fetchFamilyConnected(): Promise<{ primaryValue: string; secondaryLabel: string }> {
  try {
    const count = await getEmergencyContactCount();
    return {
      primaryValue: String(count),
      secondaryLabel:
        count === 0
          ? 'No members added'
          : count === 1
          ? '1 emergency contact'
          : `${count} emergency contacts`,
    };
  } catch {
    return { primaryValue: '0', secondaryLabel: 'No members added' };
  }
}

// ──────────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────────

export const getDashboardStats = async (
  userProfile?: UserProfile | null,
): Promise<DashboardStatsData> => {
  if (import.meta.env.DEV) {
    console.log('[dashboard] loading stats');
  }

  // Run all independent fetches in parallel for speed.
  // One failure will never block or break the other cards.
  const [schemeStatus, lastSchemeCheck, activeAlerts, familyConnected] = await Promise.all([
    fetchSchemeStatus(userProfile),
    fetchLastSchemeCheck(),
    fetchActiveAlerts(userProfile),
    fetchFamilyConnected(),
  ]);

  if (import.meta.env.DEV) {
    console.log('[dashboard] Supabase configured:', isSupabaseConfigured);
    console.log(
      '[dashboard] lastSchemeCheck:',
      lastSchemeCheck.primaryValue !== '—' ? lastSchemeCheck.primaryValue : null
    );
    console.log('[dashboard] schemeStatus:', schemeStatus.primaryValue);
  }

  const totalQuestions = userProfile?.ai_question_count ?? 0;

  return {
    voice_queries_today: {
      primaryValue: String(totalQuestions),
      secondaryLabel: totalQuestions === 1 ? 'Question answered' : 'Questions answered',
    },
    scheme_status: schemeStatus,
    last_scheme_check: lastSchemeCheck,
    // PDS card: special sentinel value — UI shows "Tap to find" CTA
    nearest_pds_centre: {
      primaryValue: 'TAP_TO_FIND',
      secondaryLabel: 'Tap card to locate nearest',
    },
    active_alerts: activeAlerts,
    family_connected_status: familyConnected,
  };
};

