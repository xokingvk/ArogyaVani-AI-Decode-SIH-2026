/**
 * pdsService.ts
 *
 * Fetches the nearest PDS (Public Distribution System / Fair Price Shop)
 * from the FastAPI /nearby-pds endpoint.
 *
 * GPS is obtained on-demand and is NEVER written to Supabase, localStorage,
 * history, or any persistent store. It is used only in-memory for the
 * distance calculation.
 */

import { getApiBaseUrl } from './voiceService';

const API_BASE = getApiBaseUrl();

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface PDSCentre {
  id: string;
  name: string;
  type: string;
  address: string | null;
  district: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  distance_m: number;
  distance_km: number;
}

export interface PDSResult {
  /** Nearest centre, or null if none found. */
  centre: PDSCentre | null;
  /** Distance in km, formatted as a string like "2.3 KM". */
  distanceLabel: string;
  /** Google Maps directions link. */
  mapsUrl: string | null;
  /** Short sub-label for the dashboard card. */
  subLabel: string;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

// ──────────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────────

/**
 * Requests the device GPS (one-shot, no watch), calls the backend,
 * and returns the nearest PDS centre result.
 *
 * Throws a user-friendly Error string if GPS or the API call fails.
 */
export const getNearestPDS = async (): Promise<PDSResult> => {
  // 1. Get device location (one-shot, in-memory only)
  let position: GeolocationPosition;
  try {
    position = await getCurrentPosition();
  } catch {
    throw new Error('Location access denied. Please allow location to find the nearest PDS centre.');
  }

  const { latitude, longitude } = position.coords;

  // 2. Call backend with 5km radius for nearby dashboard lookup
  const url = `${API_BASE}/nearby-pds?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&radius=5000`;
  let json: Record<string, unknown>;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    json = await res.json();
  } catch {
    throw new Error('Could not reach the server. Check your internet connection and try again.');
  }

  if (!json.success) {
    throw new Error((json.error as string) || 'PDS search failed. Please try again.');
  }

  const centre = json.centre as PDSCentre | null;

  if (!centre) {
    return {
      centre: null,
      distanceLabel: '—',
      mapsUrl: null,
      subLabel: 'No nearby PDS found',
    };
  }

  const distanceLabel = `${centre.distance_km} km away`;

  return {
    centre,
    distanceLabel,
    mapsUrl: json.maps_url as string | null,
    subLabel: `${centre.distance_km} km away`,
  };
};
