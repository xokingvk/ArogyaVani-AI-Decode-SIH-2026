/**
 * dashboardDemoData.ts
 *
 * Centralized UI demo values for the History dashboard.
 * These values are static presentation-ready strings used while
 * live Supabase data is not yet surfaced in the UI.
 *
 * Cards using demo data:  Scheme Status | Last Scheme Check | Active Alerts
 * Cards using REAL data:  AI Questions  | Family Connected  | Nearest PHC Centre
 *
 * To swap a card back to real data later:
 *  1. Delete or ignore its entry below.
 *  2. Restore the live fetch in dashboardService.ts.
 */

export const DASHBOARD_DEMO_DATA = {
  lastSchemeCheck: {
    primary: '5 Sep 2026',
    secondary: '2 schemes found',
  },

  schemeStatus: {
    primary: '3',
    secondary: 'Schemes matched',
  },

  activeAlerts: {
    primary: '2',
    secondary: 'Active alerts',
  },
} as const;
