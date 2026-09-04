/**
 * useNearbyPHC hook
 * Manages the lifecycle of one-time GPS location lookup and nearby PHC searching.
 */
import { useState, useCallback } from 'react';
import {
  LocationState,
  NearbyPHCFacility,
  UserCoordinates,
} from '../types/locationTypes';
import {
  getCurrentDeviceLocation,
  fetchNearbyPHCFacilities,
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

  const findNearbyPHC = useCallback(async () => {
    setErrorMessage('');
    setState('locating');

    let coords: UserCoordinates;
    try {
      coords = await getCurrentDeviceLocation();
      setUserLocation(coords);
    } catch (locErr: any) {
      if (locErr && locErr.code === 1) {
        // GeolocationPositionError.PERMISSION_DENIED
        setState('permission_denied');
        setErrorMessage('Location permission is required to find nearby Primary Health Centres.');
        return;
      }
      if (locErr && locErr.code === 3) {
        // GeolocationPositionError.TIMEOUT
        setState('error');
        setErrorMessage('Location request timed out. Please check your GPS signal and try again.');
        return;
      }
      setState('error');
      setErrorMessage(
        locErr?.message || 'Unable to get your current location. Please enable GPS and try again.'
      );
      return;
    }

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
