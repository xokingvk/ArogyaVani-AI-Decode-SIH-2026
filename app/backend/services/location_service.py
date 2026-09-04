import json
import logging
import math
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Earth radius in meters for Haversine geodesic calculations
EARTH_RADIUS_METERS = 6371000.0

# Path to the pre-compiled national and Bengaluru PHC dataset
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "data", "phc_facilities.json")

# In-memory storage of loaded facility dataset
_LOCAL_FACILITIES: Optional[list[dict[str, Any]]] = None


def load_facilities_dataset(filepath: str = DATASET_PATH) -> list[dict[str, Any]]:
    """Loads the pre-compiled national PHC dataset into memory once."""
    global _LOCAL_FACILITIES
    if _LOCAL_FACILITIES is not None:
        return _LOCAL_FACILITIES

    if not os.path.exists(filepath):
        logger.error(f"[location_service] PHC dataset file not found at {filepath}")
        _LOCAL_FACILITIES = []
        return _LOCAL_FACILITIES

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            facilities = json.load(f)
            if isinstance(facilities, list):
                _LOCAL_FACILITIES = facilities
                logger.info(f"[location_service] Successfully loaded {len(_LOCAL_FACILITIES)} facilities into memory.")
            else:
                _LOCAL_FACILITIES = []
    except Exception as exc:
        logger.error(f"[location_service] Failed to load facilities dataset: {exc}")
        _LOCAL_FACILITIES = []

    return _LOCAL_FACILITIES


def validate_coordinates(latitude: float, longitude: float) -> tuple[bool, Optional[str]]:
    """Validates that latitude and longitude are valid floating-point geographic coordinates."""
    if not isinstance(latitude, (int, float)) or not isinstance(longitude, (int, float)):
        return False, "Latitude and longitude must be numbers."
    if math.isnan(latitude) or math.isnan(longitude) or math.isinf(latitude) or math.isinf(longitude):
        return False, "Coordinates cannot be NaN or Infinite."
    if latitude < -90.0 or latitude > 90.0:
        return False, "Latitude must be between -90 and +90 degrees."
    if longitude < -180.0 or longitude > 180.0:
        return False, "Longitude must be between -180 and +180 degrees."
    return True, None


def validate_radius(radius: int) -> int:
    """Clamps radius between 500m and 25,000m (default 5,000m)."""
    try:
        r = int(radius)
        if r < 500:
            return 500
        if r > 25000:
            return 25000
        return r
    except (ValueError, TypeError):
        return 5000


def calculate_haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> tuple[int, float]:
    """Calculates geodesic distance using the Haversine formula.
    Returns (distance_meters: int, distance_kilometers: float rounded to 2 decimal places).
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance_meters = EARTH_RADIUS_METERS * c

    distance_m_rounded = int(round(distance_meters))
    distance_km = round(distance_meters / 1000.0, 2)
    return distance_m_rounded, distance_km


def fetch_nearby_phc(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    facilities_data: Optional[list[dict[str, Any]]] = None,
) -> dict[str, Any]:
    """Offline real-time Nearby PHC finder:
    1. Validates device GPS coordinates.
    2. Uses local verified national & Bengaluru PHC dataset.
    3. Calculates exact Haversine distance.
    4. Filters facilities within the search radius.
    5. Prioritizes Primary Health Centres (Rank 1) over Government Health Facilities (Rank 2).
    6. Sorts nearest-first and returns top 5.
    """
    try:
        valid, err_msg = validate_coordinates(latitude, longitude)
        if not valid:
            return {
                "success": False,
                "error": err_msg or "Invalid coordinates provided.",
            }

        clamped_radius = validate_radius(radius)
        all_facilities = facilities_data if facilities_data is not None else load_facilities_dataset()

        if not all_facilities:
            logger.warning("[location_service] Facilities dataset is empty.")
            return {
                "success": True,
                "user_location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "radius_m": clamped_radius,
                "has_phc_match": False,
                "facilities": [],
                "total_found": 0,
                "message": f"No nearby healthcare facilities were found within {clamped_radius // 1000} km.",
            }

        nearby_candidates: list[dict[str, Any]] = []

        # Bounding box rough filter for efficiency (~1 deg lat = ~111km)
        lat_delta = (clamped_radius / 1000.0) / 111.0 + 0.02
        lon_delta = (clamped_radius / 1000.0) / (111.0 * max(0.1, math.cos(math.radians(latitude)))) + 0.02

        min_lat, max_lat = latitude - lat_delta, latitude + lat_delta
        min_lon, max_lon = longitude - lon_delta, longitude + lon_delta

        for fac in all_facilities:
            f_lat = fac.get("latitude")
            f_lon = fac.get("longitude")
            if f_lat is None or f_lon is None:
                continue

            # Quick bounding box check
            if not (min_lat <= f_lat <= max_lat and min_lon <= f_lon <= max_lon):
                continue

            dist_m, dist_km = calculate_haversine_distance(latitude, longitude, f_lat, f_lon)
            if dist_m <= clamped_radius:
                is_phc = fac.get("facility_type") == "Primary Health Centre"
                priority_rank = 1 if is_phc else 2

                maps_url = f"https://www.google.com/maps/dir/?api=1&destination={f_lat},{f_lon}"

                nearby_candidates.append({
                    "id": fac.get("id"),
                    "name": fac.get("name"),
                    "facility_type": fac.get("facility_type", "Primary Health Centre"),
                    "priority_rank": priority_rank,
                    "address": fac.get("address"),
                    "latitude": f_lat,
                    "longitude": f_lon,
                    "distance_m": dist_m,
                    "distance_km": dist_km,
                    "phone": fac.get("phone"),
                    "maps_url": maps_url,
                    "source": fac.get("source", "Government Health Directory"),
                    "source_year": fac.get("source_year", 2023),
                    "verified": bool(fac.get("verified", False)),
                })

        # Sort by (priority_rank ascending, distance_m ascending)
        nearby_candidates.sort(key=lambda x: (x["priority_rank"], x["distance_m"]))

        # Take top 5
        final_facilities = []
        for item in nearby_candidates[:5]:
            clean_item = dict(item)
            clean_item.pop("priority_rank", None)
            final_facilities.append(clean_item)

        has_phc_match = any(f["facility_type"] == "Primary Health Centre" for f in final_facilities)

        if not final_facilities:
            return {
                "success": True,
                "user_location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "radius_m": clamped_radius,
                "has_phc_match": False,
                "facilities": [],
                "total_found": 0,
                "message": f"No nearby healthcare facilities were found within {clamped_radius // 1000} km.",
            }

        return {
            "success": True,
            "user_location": {
                "latitude": latitude,
                "longitude": longitude,
            },
            "radius_m": clamped_radius,
            "has_phc_match": has_phc_match,
            "facilities": final_facilities,
            "total_found": len(final_facilities),
        }

    except Exception as exc:
        logger.error(f"[location_service] Unexpected error processing nearby PHC search: {exc}")
        return {
            "success": False,
            "error": "Nearby facility search is temporarily unavailable. Please try again later.",
        }
