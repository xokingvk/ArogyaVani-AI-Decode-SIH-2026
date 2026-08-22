import { DashboardStatsData } from '../types/dashboardTypes';

// =====================================================
// DASHBOARD SERVICE
// TODO Phase 2: replace mock data with real Supabase query, one per dataSourceKey
// =====================================================

export const getDashboardStats = async (): Promise<DashboardStatsData> => {
  // Simulate a small network delay for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    // TODO Phase 2: replace with → supabase.from('voice_queries').select('count').eq('user_id', uid).gte('created_at', today)
    voice_queries_today: {
      primaryValue: '12',
      secondaryLabel: 'Queries',
    },

    // TODO Phase 2: replace with → supabase.from('scheme_applications').select('status').eq('user_id', uid)
    scheme_status: {
      primaryValue: '2 Active',
      secondaryLabel: 'Pending: 1',
    },

    // TODO Phase 2: replace with → supabase.from('scheme_checks').select('created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(1)
    last_scheme_check: {
      primaryValue: '14 Oct 2024',
      secondaryLabel: 'Follow-up: 5 days',
    },

    // TODO Phase 2: replace with → Google Maps Distance Matrix API with user GPS coords
    nearest_pds_centre: {
      primaryValue: '1.2 KM',
      secondaryLabel: 'Open Now',
    },

    // TODO Phase 2: replace with → supabase.from('alerts').select('count').eq('user_id', uid).eq('read', false)
    active_alerts: {
      primaryValue: '3 Alerts',
      secondaryLabel: 'Seasonal Fee',
    },

    // TODO Phase 2: replace with → supabase.from('family_members').select('count, asha_linked').eq('user_id', uid)
    family_connected_status: {
      primaryValue: '4 Members',
      secondaryLabel: 'ASHA Linked',
    },
  };
};
