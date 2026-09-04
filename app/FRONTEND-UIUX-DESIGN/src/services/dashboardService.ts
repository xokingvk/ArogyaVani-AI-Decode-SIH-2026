/**
 * dashboardService.ts
 *
 * Fetches dashboard card values from real data sources.
 * Three cards use centralized demo values (see src/data/dashboardDemoData.ts).
 *
 * Data sources:
 *  1. voice_queries_today   → user_profiles.ai_question_count       (REAL)
 *  2. scheme_status         → DASHBOARD_DEMO_DATA.schemeStatus      (DEMO)
 *  3. last_scheme_check     → DASHBOARD_DEMO_DATA.lastSchemeCheck   (DEMO)
 *  4. nearest_phc_centre    → useNearbyPHC hook (in screen)         (REAL — handled in component)
 *  5. active_alerts         → DASHBOARD_DEMO_DATA.activeAlerts      (DEMO)
 *  6. family_connected      → emergency_contacts count              (REAL)
 *
 * Privacy:
 *  - GPS is NEVER read here. The PHC card fetches location only when
 *    the History tab becomes active.
 *  - No fake/placeholder values for real cards.
 *  - Demo values are stable constants, never random.
 *
 * NOTE: PDS (Public Distribution System) is NOT fetched here.
 *  pdsService.ts is retained for other screens that may need it.
 */

import { DashboardStatsData } from '../types/dashboardTypes';
import { UserProfile } from '../types/authTypes';
import { getEmergencyContactCount } from './emergencyContactService';
import { isSupabaseConfigured } from './authService';
import { DASHBOARD_DEMO_DATA } from '../data/dashboardDemoData';

// ──────────────────────────────────────────────────────────────
// Individual card fetchers (all fail-safe & independent)
// ──────────────────────────────────────────────────────────────

/**
 * Returns the static demo value for Scheme Status.
 * No Supabase request is made.
 */
function fetchSchemeStatus(): { primaryValue: string; secondaryLabel: string } {
  return {
    primaryValue: DASHBOARD_DEMO_DATA.schemeStatus.primary,
    secondaryLabel: DASHBOARD_DEMO_DATA.schemeStatus.secondary,
  };
}

/**
 * Returns the static demo value for Last Scheme Check.
 * No Supabase request is made.
 */
function fetchLastSchemeCheck(): { primaryValue: string; secondaryLabel: string } {
  return {
    primaryValue: DASHBOARD_DEMO_DATA.lastSchemeCheck.primary,
    secondaryLabel: DASHBOARD_DEMO_DATA.lastSchemeCheck.secondary,
  };
}

/**
 * Returns the static demo value for Active Alerts.
 * No Supabase request is made.
 */
function fetchActiveAlerts(): { primaryValue: string; secondaryLabel: string } {
  return {
    primaryValue: DASHBOARD_DEMO_DATA.activeAlerts.primary,
    secondaryLabel: DASHBOARD_DEMO_DATA.activeAlerts.secondary,
  };
}

/**
 * Counts emergency contacts in public.emergency_contacts (NOT family_members).
 * REAL data — never mocked.
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
    console.log('[dashboard] Supabase configured:', isSupabaseConfigured);
    console.log('[dashboard] loading stats (AI questions + family connected are real; others are demo)');
  }

  // Only the family count requires an async fetch.
  // Demo cards return synchronously — no network wait.
  const familyConnected = await fetchFamilyConnected();

  const totalQuestions = userProfile?.ai_question_count ?? 0;

  return {
    voice_queries_today: {
      primaryValue: String(totalQuestions),
      secondaryLabel: totalQuestions === 1 ? 'Question answered' : 'Questions answered',
    },
    scheme_status: fetchSchemeStatus(),
    last_scheme_check: fetchLastSchemeCheck(),
    active_alerts: fetchActiveAlerts(),
    family_connected_status: familyConnected,
  };
};
