/**
 * Type definitions for Real-Time Nearby PHC Location feature.
 */

export type FacilityType =
  | 'Primary Health Centre'
  | 'Government Health Facility'
  | 'Healthcare Facility';

export interface NearbyPHCFacility {
  id: string;
  name: string;
  facility_type: FacilityType;
  address: string | null;
  latitude: number;
  longitude: number;
  distance_m: number;
  distance_km: number;
  phone: string | null;
  maps_url: string;
  source?: string;
  verified?: boolean;
}

export interface NearbyPHCSuccessResponse {
  success: true;
  user_location: {
    latitude: number;
    longitude: number;
  };
  radius_m: number;
  has_phc_match: boolean;
  facilities: NearbyPHCFacility[];
  total_found: number;
  message?: string;
}

export interface NearbyPHCErrorResponse {
  success: false;
  error: string;
}

export type NearbyPHCResponse = NearbyPHCSuccessResponse | NearbyPHCErrorResponse;

export type LocationState =
  | 'idle'
  | 'checking_permission'
  | 'requesting_permission'
  | 'locating'
  | 'searching'
  | 'results'
  | 'empty'
  | 'error'
  | 'permission_denied'
  | 'permission_blocked'
  | 'location_disabled'
  | 'location_unavailable';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
