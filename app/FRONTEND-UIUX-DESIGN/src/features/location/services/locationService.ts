/**
 * Location Service
 * Responsible for:
 * 1. Managing location permissions via Capacitor Geolocation on native platforms, with browser fallback.
 * 2. Obtaining one-time device GPS coordinates.
 * 3. Querying backend GET /nearby-phc endpoint.
 *
 * Does NOT track user continuously. Does NOT persist GPS coordinates.
 */
import { Capacitor } from '@capacitor/core';
import { Geolocation, PermissionStatus as CapPermissionStatus } from '@capacitor/geolocation';
import { getApiBaseUrl } from '../../../services/voiceService';
import { NearbyPHCResponse, UserCoordinates } from '../types/locationTypes';

export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'PERMISSION_BLOCKED'
  | 'LOCATION_DISABLED'
  | 'LOCATION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNKNOWN';

export class LocationServiceError extends Error {
  code: LocationErrorCode;
  constructor(message: string, code: LocationErrorCode) {
    super(message);
    this.name = 'LocationServiceError';
    this.code = code;
  }
}

/**
 * Checks current location permission state across Capacitor / browser.
 * Returns: 'granted' | 'prompt' | 'denied'
 */
export async function checkLocationPermission(): Promise<'granted' | 'prompt' | 'denied'> {
  console.log('[Location] Checking permission');
  if (Capacitor.isNativePlatform()) {
    try {
      const status: CapPermissionStatus = await Geolocation.checkPermissions();
      const perm = status.location || status.coarseLocation;
      if (perm === 'granted') {
        console.log('[Location] Permission state: granted');
        return 'granted';
      }
      if (perm === 'denied') {
        console.log('[Location] Permission state: denied');
        return 'denied';
      }
      console.log('[Location] Permission state: prompt');
      return 'prompt';
    } catch (err) {
      console.warn('[Location] Failed to check native permissions, defaulting to prompt:', err);
      return 'prompt';
    }
  }

  // Browser environment
  if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (result.state === 'granted') {
        console.log('[Location] Permission state: granted');
        return 'granted';
      }
      if (result.state === 'denied') {
        console.log('[Location] Permission state: denied');
        return 'denied';
      }
      console.log('[Location] Permission state: prompt');
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }

  return 'prompt';
}

/**
 * Requests location permission from the platform.
 * Returns: 'granted' | 'denied'
 */
export async function requestLocationPermission(): Promise<'granted' | 'denied'> {
  console.log('[Location] Requesting permission');
  if (Capacitor.isNativePlatform()) {
    try {
      const status: CapPermissionStatus = await Geolocation.requestPermissions({
        permissions: ['location', 'coarseLocation'],
      });
      const perm = status.location || status.coarseLocation;
      if (perm === 'granted') {
        console.log('[Location] Permission state: granted');
        return 'granted';
      }
      console.log('[Location] Permission denied');
      return 'denied';
    } catch (err) {
      console.log('[Location] Permission denied');
      return 'denied';
    }
  }

  // Browser permissions are requested during getCurrentPosition call
  return 'prompt' as any;
}

/**
 * Gets one-time current device GPS coordinates.
 */
export async function getCurrentDeviceLocation(): Promise<UserCoordinates> {
  console.log('[Location] Getting current position');

  if (Capacitor.isNativePlatform()) {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      });

      console.log('[Location] Coordinates received');
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (
        msg.includes('disabled') ||
        msg.includes('services') ||
        msg.includes('gps') ||
        msg.includes('provider') ||
        msg.includes('location service')
      ) {
        console.log('[Location] Location services unavailable');
        throw new LocationServiceError(
          'Location services are turned off. Please turn on GPS on your device.',
          'LOCATION_DISABLED'
        );
      }
      if (
        msg.includes('denied') ||
        msg.includes('permission') ||
        msg.includes('not permitted') ||
        msg.includes('rejected')
      ) {
        console.log('[Location] Permission denied');
        throw new LocationServiceError('Location permission was denied.', 'PERMISSION_DENIED');
      }
      if (msg.includes('timeout') || msg.includes('timed out')) {
        throw new LocationServiceError(
          'Location request timed out. Please check your signal and try again.',
          'TIMEOUT'
        );
      }
      throw new LocationServiceError(
        err?.message || 'Unable to get device location.',
        'LOCATION_UNAVAILABLE'
      );
    }
  }

  // Fallback to browser navigator.geolocation
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const err = new LocationServiceError(
        'Geolocation is not supported by your browser or device.',
        'LOCATION_UNAVAILABLE'
      );
      return reject(err);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[Location] Coordinates received');
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === 1) {
          console.log('[Location] Permission denied');
          reject(
            new LocationServiceError(
              'Location permission is required to find nearby Primary Health Centres.',
              'PERMISSION_DENIED'
            )
          );
        } else if (error.code === 2) {
          console.log('[Location] Location services unavailable');
          reject(
            new LocationServiceError(
              'Location services are unavailable or turned off.',
              'LOCATION_DISABLED'
            )
          );
        } else if (error.code === 3) {
          reject(
            new LocationServiceError(
              'Location request timed out. Please check your GPS signal and try again.',
              'TIMEOUT'
            )
          );
        } else {
          reject(
            new LocationServiceError(
              error.message || 'Unable to get your current location.',
              'LOCATION_UNAVAILABLE'
            )
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
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
