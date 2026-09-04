// =====================================================
// DASHBOARD TYPES
// One field per dataSourceKey — add new keys here when backend is ready
// =====================================================

export interface DashboardStatsData {
  voice_queries_today: {
    primaryValue: string;
    secondaryLabel: string;
  };
  scheme_status: {
    primaryValue: string;
    secondaryLabel: string;
  };
  last_scheme_check: {
    primaryValue: string;
    secondaryLabel: string;
  };
  active_alerts: {
    primaryValue: string;
    secondaryLabel: string;
  };
  family_connected_status: {
    primaryValue: string;
    secondaryLabel: string;
  };
}
