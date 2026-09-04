import json
import logging
import math
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Earth radius in meters
EARTH_RADIUS_METERS = 6371000.0

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "data", "pds_centres.json")

_LOCAL_PDS: Optional[list[dict[str, Any]]] = None


def _load_pds_dataset() -> list[dict[str, Any]]:
    """Loads the PDS centres dataset into memory once (lazy singleton)."""
    global _LOCAL_PDS
    if _LOCAL_PDS is not None:
        return _LOCAL_PDS

    if not os.path.exists(DATASET_PATH):
        logger.error(f"[pds_service] PDS dataset not found at {DATASET_PATH}")
        _LOCAL_PDS = []
        return _LOCAL_PDS

    try:
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            _LOCAL_PDS = data if isinstance(data, list) else []
            logger.info(f"[pds_service] Loaded {len(_LOCAL_PDS)} PDS centres.")
    except Exception as exc:
        logger.error(f"[pds_service] Failed to load PDS dataset: {exc}")
        _LOCAL_PDS = []

    return _LOCAL_PDS


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> tuple[int, float]:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    dist_m = EARTH_RADIUS_METERS * c
    return int(round(dist_m)), round(dist_m / 1000, 2)


def _validate_coordinates(lat: float, lon: float) -> tuple[bool, Optional[str]]:
    if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
        return False, "Latitude and longitude must be numbers."
    if math.isnan(lat) or math.isnan(lon) or math.isinf(lat) or math.isinf(lon):
        return False, "Invalid coordinate values."
    if lat < -90 or lat > 90:
        return False, "Invalid coordinates: latitude out of range."
    if lon < -180 or lon > 180:
        return False, "Invalid coordinates: longitude out of range."
    return True, None


def fetch_nearest_pds(
    latitude: float,
    longitude: float,
    radius: int = 10000,
) -> dict[str, Any]:
    """Finds the nearest PDS / Fair Price Shop to the given GPS coordinates.

    Uses offline Haversine distance against local pds_centres.json.
    GPS coordinates are NOT persisted anywhere.

    Returns:
        dict with keys: success, centre (dict or None), distance_km (float or None),
        maps_url (str or None), message (str).
    """
    try:
        valid, err = _validate_coordinates(latitude, longitude)
        if not valid:
            return {"success": False, "error": err or "Invalid coordinates provided."}

        # Clamp radius 1 km – 50 km
        r = max(1000, min(50000, int(radius)))

        centres = _load_pds_dataset()
        if not centres:
            return {
                "success": True,
                "centre": None,
                "distance_km": None,
                "maps_url": None,
                "message": "PDS centre data is currently unavailable.",
            }

        # Bounding box pre-filter
        lat_delta = (r / 1000.0) / 111.0 + 0.05
        lon_delta = (r / 1000.0) / (111.0 * max(0.1, math.cos(math.radians(latitude)))) + 0.05
        min_lat, max_lat = latitude - lat_delta, latitude + lat_delta
        min_lon, max_lon = longitude - lon_delta, longitude + lon_delta

        best: Optional[dict[str, Any]] = None
        best_m = float("inf")

        for centre in centres:
            c_lat = centre.get("latitude")
            c_lon = centre.get("longitude")
            if c_lat is None or c_lon is None:
                continue
            if not (min_lat <= c_lat <= max_lat and min_lon <= c_lon <= max_lon):
                continue
            dist_m, dist_km = _haversine(latitude, longitude, c_lat, c_lon)
            if dist_m < best_m:
                best_m = dist_m
                best = {**centre, "distance_m": dist_m, "distance_km": dist_km}

        if best is None:
            return {
                "success": True,
                "centre": None,
                "distance_km": None,
                "maps_url": None,
                "message": f"No PDS centre found within {r // 1000} km.",
            }

        maps_url = (
            f"https://www.google.com/maps/dir/?api=1"
            f"&destination={best['latitude']},{best['longitude']}"
        )

        return {
            "success": True,
            "centre": {
                "id": best.get("id"),
                "name": best.get("name"),
                "type": best.get("type", "PDS"),
                "address": best.get("address"),
                "district": best.get("district"),
                "state": best.get("state"),
                "latitude": best.get("latitude"),
                "longitude": best.get("longitude"),
                "phone": best.get("phone"),
                "distance_m": best["distance_m"],
                "distance_km": best["distance_km"],
            },
            "distance_km": best["distance_km"],
            "maps_url": maps_url,
            "message": f"Nearest PDS centre found {best['distance_km']} km away.",
        }

    except Exception as exc:
        logger.error(f"[pds_service] Unexpected error: {exc}")
        return {"success": False, "error": "PDS centre search is temporarily unavailable."}
