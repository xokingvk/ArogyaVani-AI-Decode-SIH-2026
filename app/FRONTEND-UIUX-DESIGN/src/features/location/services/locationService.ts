/**
 * Location Service
 * Responsible for:
 * 1. Obtaining one-time device GPS coordinates via Geolocation API.
 * 2. Querying backend GET /nearby-phc endpoint.
 *
 * Does NOT track user continuously. Does NOT persist GPS coordinates.
 */
import { getApiBaseUrl } from '../../../services/voiceService';
import { NearbyPHCResponse, UserCoordinates } from '../types/locationTypes';

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 30000,
};

/**
 * Gets one-time current device GPS coordinates.
 */
export function getCurrentDeviceLocation(): Promise<UserCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const err = new Error('Geolocation is not supported by your browser or device.');
      (err as any).code = 2; // POSITION_UNAVAILABLE
      return reject(err);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      GEOLOCATION_OPTIONS
    );
  });
}

/**
 * Calls backend GET /nearby-phc with current coordinates.
 */
export async function fetchNearbyPHCFacilities(
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<NearbyPHCResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/nearby-phc?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&radius=${encodeURIComponent(radius)}`;

  if (import.meta.env.DEV) {
    console.log('[locationService] Fetching nearby PHCs from:', url);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data: Record<string, unknown>;
    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        error: res.ok
          ? 'Invalid response format from health facility service.'
          : `Health facility service error (${res.status}). Please try again later.`,
      };
    }

    if (!res.ok || data.success === false) {
      return {
        success: false,
        error: (data?.error as string) || 'Nearby health facility search is temporarily unavailable.',
      };
    }

    return data as unknown as NearbyPHCResponse;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.name === 'AbortError' || controller.signal.aborted)) {
      return {
        success: false,
        error: 'Search timed out while finding nearby facilities. Please try again.',
      };
    }
    return {
      success: false,
      error: 'Unable to connect to the healthcare facility service. Please check your network.',
    };
  }
}
