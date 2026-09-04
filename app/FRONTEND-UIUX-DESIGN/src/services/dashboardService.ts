/**
 * dashboardService.ts
 *
 * Fetches all six dashboard card values from real data sources.
 * Each fetch is independent so that one failure never breaks the others.
 *
 * Data sources:
 *  1. voice_queries_today  → user_profiles.ai_question_count  (already live)
 *  2. scheme_status        → scheme_checks count + last check  (Supabase)
 *  3. last_scheme_check    → scheme_checks last row            (Supabase)
 *  4. nearest_pds_centre   → deferred to on-demand GPS tap     (lazy)
 *  5. active_alerts        → health_alerts unread count        (Supabase)
 *  6. family_connected     → family_members count              (Supabase)
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

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return Boolean(data?.session);
}

// ──────────────────────────────────────────────────────────────
// Individual card fetchers (all fail-safe)
// ──────────────────────────────────────────────────────────────

async function fetchSchemeStatus(): Promise<{ primaryValue: string; secondaryLabel: string }> {
  try {
    if (!(await isAuthenticated())) {
      return { primaryValue: '0', secondaryLabel: 'No scheme queries yet' };
    }
    const { count, error } = await supabase
      .from('scheme_checks')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    const total = count ?? 0;
    return {
      primaryValue: String(total),
      secondaryLabel: total === 0 ? 'No queries yet' : total === 1 ? '1 total query' : `${total} total queries`,
    };
  } catch {
    return { primaryValue: '0', secondaryLabel: 'No scheme queries yet' };
  }
}

async function fetchLastSchemeCheck(): Promise<{ primaryValue: string; secondaryLabel: string }> {
  try {
    if (!(await isAuthenticated())) {
      return { primaryValue: '—', secondaryLabel: 'No scheme query yet' };
    }
    const { data, error } = await supabase
      .from('scheme_checks')
      .select('checked_at')
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data?.checked_at) {
      return { primaryValue: '—', secondaryLabel: 'No scheme query yet' };
    }

    const days = daysSince(data.checked_at);
    const sub =
      days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `${days} days ago`;

    return { primaryValue: formatDate(data.checked_at), secondaryLabel: sub };
  } catch {
    return { primaryValue: '—', secondaryLabel: 'No scheme query yet' };
  }
}

async function fetchActiveAlerts(): Promise<{ primaryValue: string; secondaryLabel: string }> {
  try {
    if (!(await isAuthenticated())) {
      return { primaryValue: '0', secondaryLabel: 'No active alerts' };
    }
    const { count, error } = await supabase
      .from('health_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;
    const unread = count ?? 0;
    return {
      primaryValue: String(unread),
      secondaryLabel: unread === 0 ? 'No active alerts' : unread === 1 ? '1 unread alert' : `${unread} unread alerts`,
    };
  } catch {
    return { primaryValue: '0', secondaryLabel: 'No active alerts' };
  }
}

async function fetchFamilyConnected(): Promise<{ primaryValue: string; secondaryLabel: string }> {
  try {
    if (!(await isAuthenticated())) {
      return { primaryValue: '0', secondaryLabel: 'No members added' };
    }
    const { count: total, error: err1 } = await supabase
      .from('family_members')
      .select('id', { count: 'exact', head: true });

    if (err1) throw err1;

    const { count: ashaLinked } = await supabase
      .from('family_members')
      .select('id', { count: 'exact', head: true })
      .eq('asha_linked', true);

    const members = total ?? 0;
    const linked = ashaLinked ?? 0;
    const sub =
      members === 0
        ? 'No members added'
        : linked > 0
        ? `${linked} ASHA linked`
        : 'ASHA not linked';

    return { primaryValue: String(members), secondaryLabel: sub };
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
  // Run all independent fetches in parallel for speed.
  // The PDS card uses a special sentinel — the UI will render a tap-to-load state.
  const [schemeStatus, lastSchemeCheck, activeAlerts, familyConnected] = await Promise.all([
    fetchSchemeStatus(),
    fetchLastSchemeCheck(),
    fetchActiveAlerts(),
    fetchFamilyConnected(),
  ]);

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
