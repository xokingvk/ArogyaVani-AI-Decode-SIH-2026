/**
 * useNearbyPHC hook
 * Manages the lifecycle of one-time GPS location lookup and nearby PHC searching
 * using a robust state machine for Android Capacitor & Browser.
 */
import { useState, useCallback, useRef } from 'react';
import {
  LocationState,
  NearbyPHCFacility,
  UserCoordinates,
} from '../types/locationTypes';
import {
  checkLocationPermission,
  requestLocationPermission,
  getCurrentDeviceLocation,
  fetchNearbyPHCFacilities,
  LocationServiceError,
} from '../services/locationService';

export interface UseNearbyPHCReturn {
  state: LocationState;
  facilities: NearbyPHCFacility[];
  hasPhcMatch: boolean;
  userLocation: UserCoordinates | null;
  errorMessage: string;
  findNearbyPHC: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

export function useNearbyPHC(): UseNearbyPHCReturn {
  const [state, setState] = useState<LocationState>('idle');
  const [facilities, setFacilities] = useState<NearbyPHCFacility[]>([]);
  const [hasPhcMatch, setHasPhcMatch] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isSearchingRef = useRef<boolean>(false);

  const findNearbyPHC = useCallback(async () => {
    if (isSearchingRef.current) {
      return;
    }
    isSearchingRef.current = true;
    setErrorMessage('');

    try {
      // Step 1: Check existing permission state
      setState('checking_permission');
      const permStatus = await checkLocationPermission();

      // Step 2: Handle permission prompt if not yet granted
      if (permStatus === 'prompt') {
        setState('requesting_permission');
        const reqResult = await requestLocationPermission();
        if (reqResult === 'denied') {
          setState('permission_denied');
          setErrorMessage('Location permission is required to find nearby Primary Health Centres.');
          return;
        }
      } else if (permStatus === 'denied') {
        // Try requesting once in case rationale or settings changed, or set denied
        setState('requesting_permission');
        const reqResult = await requestLocationPermission();
        if (reqResult === 'denied') {
          setState('permission_denied');
          setErrorMessage('Location permission is required to find nearby Primary Health Centres.');
          return;
        }
      }

      // Step 3: Permission is GRANTED -> Get Location
      setState('locating');
      let coords: UserCoordinates;
      try {
        coords = await getCurrentDeviceLocation();
        setUserLocation(coords);
      } catch (locErr: any) {
        if (locErr instanceof LocationServiceError) {
          switch (locErr.code) {
            case 'PERMISSION_DENIED':
              setState('permission_denied');
              setErrorMessage('Location permission is required to find nearby Primary Health Centres.');
              return;
            case 'PERMISSION_BLOCKED':
              setState('permission_blocked');
              setErrorMessage('Location permission is blocked. Please enable it in device settings.');
              return;
            case 'LOCATION_DISABLED':
              setState('location_disabled');
              setErrorMessage('Location services are turned off. Please enable GPS on your device.');
              return;
            case 'TIMEOUT':
            case 'LOCATION_UNAVAILABLE':
              setState('location_unavailable');
              setErrorMessage(locErr.message || "Couldn't get your location. Please check GPS and try again.");
              return;
            default:
              setState('error');
              setErrorMessage(locErr.message || 'Unable to get your current location.');
              return;
          }
        }

        setState('location_unavailable');
        setErrorMessage(locErr?.message || "Couldn't get your location. Please try again.");
        return;
      }

      // Step 4: Finding Facilities
      setState('searching');

      try {
        const response = await fetchNearbyPHCFacilities(coords.latitude, coords.longitude);

        if (!response.success) {
          setState('error');
          setErrorMessage(response.error || 'Failed to search for nearby health facilities.');
          return;
        }

        if (!response.facilities || response.facilities.length === 0) {
          setFacilities([]);
          setHasPhcMatch(false);
          setState('empty');
          return;
        }

        setFacilities(response.facilities);
        setHasPhcMatch(response.has_phc_match);
        setState('results');
      } catch {
        setState('error');
        setErrorMessage('Nearby facility search is temporarily unavailable. Please try again.');
      }
    } catch (unexpectedError: any) {
      console.error('[Location] Unexpected error:', unexpectedError);
      setState('error');
      setErrorMessage(unexpectedError?.message || 'An unexpected error occurred while finding nearby PHCs.');
    } finally {
      isSearchingRef.current = false;
    }
  }, []);

  const retry = useCallback(async () => {
    await findNearbyPHC();
  }, [findNearbyPHC]);

  const reset = useCallback(() => {
    setState('idle');
    setFacilities([]);
    setHasPhcMatch(false);
    setUserLocation(null);
    setErrorMessage('');
  }, []);

  return {
    state,
    facilities,
    hasPhcMatch,
    userLocation,
    errorMessage,
    findNearbyPHC,
    retry,
    reset,
  };
}
