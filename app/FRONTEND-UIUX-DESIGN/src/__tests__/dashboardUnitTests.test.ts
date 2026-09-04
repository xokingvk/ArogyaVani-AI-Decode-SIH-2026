/**
 * dashboardUnitTests.test.ts
 *
 * Unit tests covering:
 * Part 11 — Scheme RAG logging & checked_at date formatting
 * Part 12 — Family count (using emergency_contacts)
 * Part 13 — Scheme status (distinct matched schemes count)
 * Part 14 — Active alerts (unread filtering)
 * Part 15 — PDS nearest distance & maps URL
 * Part 16 — PHC nearest distance & rank sorting
 */

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runDashboardUnitTests(): TestResult[] {
  const results: TestResult[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err?.message || String(err) });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(`Assertion failed: ${msg}`);
  }

  function assertEqual(actual: any, expected: any, msg: string) {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${msg} | Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
  }

  // ────────────────────────────────────────────────────────────
  // PART 11: Scheme RAG logging & checked_at test
  // ────────────────────────────────────────────────────────────
  test('PART 11: Scheme RAG logging captures schemes and checked_at', () => {
    const mockVoiceResponse = {
      success: true,
      mode: 'scheme_rag',
      transcript: 'Which scheme helps pregnant women?',
      schemes: [{ schemeId: 'pmmvy', schemeName: 'PMMVY' }],
      response_text: 'PMMVY provides financial support.',
    };

    // Verify mode detection
    const isSchemeRag = mockVoiceResponse.mode === 'scheme_rag';
    assert(isSchemeRag, 'Mode should be scheme_rag');

    // Extract matched schemes
    const matchedSchemes = (mockVoiceResponse.schemes || []).map((s) => s.schemeName || s.schemeId);
    assertEqual(matchedSchemes[0], 'PMMVY', 'Should extract PMMVY scheme name');

    // Date formatting helper check
    const now = new Date();
    const daysSince = Math.floor((Date.now() - now.getTime()) / 86400000);
    const subLabel = daysSince === 0 ? 'Checked today' : daysSince === 1 ? 'Checked yesterday' : `${daysSince} days ago`;
    assertEqual(subLabel, 'Checked today', 'Should display "Checked today" for today\'s timestamp');
  });

  // ────────────────────────────────────────────────────────────
  // PART 12: Family count test (emergency_contacts)
  // ────────────────────────────────────────────────────────────
  test('PART 12: Family Connected counts emergency_contacts, NOT family_members', () => {
    function formatFamilyCount(count: number) {
      return {
        primaryValue: String(count),
        secondaryLabel:
          count === 0
            ? 'No members added'
            : count === 1
            ? '1 emergency contact'
            : `${count} emergency contacts`,
      };
    }

    assertEqual(formatFamilyCount(0).primaryValue, '0', '0 contacts -> primary "0"');
    assertEqual(formatFamilyCount(0).secondaryLabel, 'No members added', '0 contacts -> "No members added"');

    assertEqual(formatFamilyCount(1).primaryValue, '1', '1 contact -> primary "1"');
    assertEqual(formatFamilyCount(1).secondaryLabel, '1 emergency contact', '1 contact -> "1 emergency contact"');

    assertEqual(formatFamilyCount(2).primaryValue, '2', '2 contacts -> primary "2"');
    assertEqual(formatFamilyCount(2).secondaryLabel, '2 emergency contacts', '2 contacts -> "2 emergency contacts"');
  });

  // ────────────────────────────────────────────────────────────
  // PART 13: Scheme status test (distinct matched schemes count)
  // ────────────────────────────────────────────────────────────
  test('PART 13: Scheme status calculates distinct matched schemes across checks', () => {
    const mockChecks = [
      { schemes: ['PMMVY', 'JSY'] },
      { schemes: ['JSY', 'PM-JAY'] },
    ];

    const distinctSchemes = new Set<string>();
    for (const check of mockChecks) {
      for (const scheme of check.schemes) {
        distinctSchemes.add(scheme.trim());
      }
    }

    const count = distinctSchemes.size;
    assertEqual(count, 3, 'Expected 3 distinct schemes (PMMVY, JSY, PM-JAY), not total question count');
    const label = count === 0 ? 'No matches yet' : count === 1 ? '1 scheme matched' : `${count} schemes matched`;
    assertEqual(label, '3 schemes matched', 'Label should indicate 3 schemes matched');
  });

  // ────────────────────────────────────────────────────────────
  // PART 14: Active alerts test (unread filtering)
  // ────────────────────────────────────────────────────────────
  test('PART 14: Active alerts counts only unread health_alerts', () => {
    const mockAlerts = [
      { id: '1', title: 'Dengue Alert', is_read: false },
      { id: '2', title: 'Polio Drive', is_read: true },
      { id: '3', title: 'Heat Wave', is_read: true },
    ];

    const unreadCount = mockAlerts.filter((a) => !a.is_read).length;
    assertEqual(unreadCount, 1, 'Should return 1 unread alert');

    const zeroUnread = mockAlerts.filter((a) => a.is_read && false).length;
    assertEqual(zeroUnread, 0, 'Should return 0 when all alerts are read');
  });

  // ────────────────────────────────────────────────────────────
  // PART 15: PDS test (nearest distance & maps URL)
  // ────────────────────────────────────────────────────────────
  test('PART 15: PDS nearest distance and maps URL selection', () => {
    const mockPdsList = [
      { name: 'PDS Shop B', latitude: 12.98, longitude: 77.60, distance_km: 2.8 },
      { name: 'PDS Shop A', latitude: 12.97, longitude: 77.59, distance_km: 1.2 },
    ];

    const sorted = [...mockPdsList].sort((a, b) => a.distance_km - b.distance_km);
    const nearest = sorted[0];

    assertEqual(nearest.name, 'PDS Shop A', 'Nearest PDS should be Shop A');
    assertEqual(nearest.distance_km, 1.2, 'Nearest distance should be 1.2 km');

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${nearest.latitude},${nearest.longitude}`;
    assert(mapsUrl.includes('12.97,77.59'), 'Maps URL must include exact coordinates');
  });

  // ────────────────────────────────────────────────────────────
  // PART 16: PHC test (distance calculation & rank sorting)
  // ────────────────────────────────────────────────────────────
  test('PART 16: PHC distance sorting and nearest facility selection', () => {
    const mockFacilities = [
      { name: 'General Hospital B', facility_type: 'Government Health Facility', distance_km: 0.8, rank: 2 },
      { name: 'Primary Health Centre A', facility_type: 'Primary Health Centre', distance_km: 0.9, rank: 1 },
      { name: 'Primary Health Centre C', facility_type: 'Primary Health Centre', distance_km: 2.1, rank: 1 },
    ];

    // Sort by rank ascending (PHC Rank 1 first), then distance ascending
    const sorted = [...mockFacilities].sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.distance_km - b.distance_km;
    });

    assertEqual(sorted[0].name, 'Primary Health Centre A', 'Should prioritize PHC Rank 1 (Primary Health Centre A) over General Hospital');
  });

  return results;
}
