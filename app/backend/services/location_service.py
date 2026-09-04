import math
import logging
import re
import urllib.parse
from typing import Any, Optional
import requests

logger = logging.getLogger(__name__)

DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter"
FALLBACK_OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter"

# Earth radius in meters for Haversine formula
EARTH_RADIUS_METERS = 6371000.0


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


def build_overpass_query(latitude: float, longitude: float, radius: int) -> str:
    """Builds a focused Overpass QL query around the specified coordinates and radius."""
    return f"""
    [out:json][timeout:12];
    (
      nwr["healthcare"="centre"](around:{radius},{latitude},{longitude});
      nwr["healthcare"="clinic"](around:{radius},{latitude},{longitude});
      nwr["amenity"="clinic"](around:{radius},{latitude},{longitude});
      nwr["amenity"="hospital"](around:{radius},{latitude},{longitude});
    );
    out center tags;
    """.strip()


def classify_facility(name: str, tags: dict[str, Any]) -> tuple[str, int]:
    """Classifies a facility into:
      1. 'Primary Health Centre' (priority 1)
      2. 'Government Health Facility' (priority 2)
      3. 'Healthcare Facility' (priority 3)

    Returns (facility_type: str, priority_rank: int where lower number = higher priority).
    """
    name_clean = (name or "").strip()
    name_lower = name_clean.lower()

    # Tag values
    healthcare = str(tags.get("healthcare", "")).lower()
    amenity = str(tags.get("amenity", "")).lower()
    operator = str(tags.get("operator", "")).lower()
    operator_type = str(tags.get("operator:type", "")).lower()
    health_facility_type = str(tags.get("health_facility:type", "")).lower()

    # Explicit PHC Indicators
    phc_patterns = [
        r"\bphc\b",
        r"\bprimary health\b",
        r"\bprimary health care\b",
        r"\bprimary healthcare\b",
        r"\bprathmik swasthya\b",
        r"\bprarambhika arogya\b",
        r"\barogya nilayam\b",
        r"\bcommunity health centre\b",
        r"\bcommunity health center\b",
        r"\bchc\b",
    ]

    is_phc_name = any(re.search(pat, name_lower) for pat in phc_patterns)
    is_phc_tag = health_facility_type in ("primary_health_centre", "phc", "community_health_centre", "chc")

    if is_phc_name or is_phc_tag:
        return "Primary Health Centre", 1

    # Government / Public health indicators
    govt_indicators = [
        r"\bgovernment\b",
        r"\bgovt\b",
        r"\bpublic health\b",
        r"\bmunicipal\b",
        r"\bpanchayat\b",
        r"\btahsildar\b",
        r"\btaluk\b",
        r"\bdistrict hospital\b",
        r"\bupkendra\b",
        r"\bsub-centre\b",
        r"\bsub centre\b",
        r"\bhealth sub centre\b",
        r"\bhwc\b",
        r"\bhealth and wellness centre\b",
        r"\barogya kendra\b",
        r"\bswasthya kendra\b",
    ]

    is_govt_name = any(re.search(pat, name_lower) for pat in govt_indicators)
    is_govt_tag = operator_type in ("government", "public", "state", "municipal") or "govt" in operator or "government" in operator

    if is_govt_name or is_govt_tag:
        return "Government Health Facility", 2

    # General Healthcare Facility
    return "Healthcare Facility", 3


def extract_address(tags: dict[str, Any]) -> Optional[str]:
    """Extracts a structured or semi-structured address from OSM tags without inventing data."""
    addr_parts = []
    street = tags.get("addr:street")
    housenumber = tags.get("addr:housenumber")
    village = tags.get("addr:village") or tags.get("addr:suburb") or tags.get("addr:neighbourhood")
    district = tags.get("addr:district") or tags.get("addr:city") or tags.get("addr:county")
    postcode = tags.get("addr:postcode")
    state = tags.get("addr:state")

    if housenumber and street:
        addr_parts.append(f"{housenumber} {street}")
    elif street:
        addr_parts.append(street)

    if village:
        addr_parts.append(village)
    if district:
        addr_parts.append(district)
    if state:
        addr_parts.append(state)
    if postcode:
        addr_parts.append(f"PIN: {postcode}")

    if addr_parts:
        return ", ".join(addr_parts)

    # Fallback to general address tag if present
    return tags.get("addr:full") or tags.get("address") or None


def clean_phone(phone_raw: Optional[str]) -> Optional[str]:
    """Validates and formats phone numbers from OSM tags. Strips invalid characters."""
    if not phone_raw:
        return None
    p = str(phone_raw).strip()
    # Split multiple phone numbers if delimited by comma or semicolon
    if ";" in p:
        p = p.split(";")[0].strip()
    elif "," in p:
        p = p.split(",")[0].strip()

    # Remove non-numeric/plus/space characters
    clean = re.sub(r"[^\d+\-\s]", "", p).strip()
    # Ensure it contains at least 5 digits
    digit_count = len(re.sub(r"\D", "", clean))
    if digit_count < 5:
        return None
    return clean


def parse_overpass_elements(
    elements: list[dict[str, Any]], user_lat: float, user_lon: float
) -> list[dict[str, Any]]:
    """Parses raw OSM JSON elements into structured facility objects."""
    facilities: list[dict[str, Any]] = []

    for el in elements:
        osm_id = f"{el.get('type', 'node')}-{el.get('id', '')}"
        tags = el.get("tags", {})
        if not isinstance(tags, dict):
            tags = {}

        # Coordinate resolution: node vs way/relation center
        lat = el.get("lat")
        lon = el.get("lon")
        if lat is None or lon is None:
            center = el.get("center", {})
            lat = center.get("lat")
            lon = center.get("lon")

        if lat is None or lon is None:
            continue

        try:
            facility_lat = float(lat)
            facility_lon = float(lon)
        except (ValueError, TypeError):
            continue

        valid, _ = validate_coordinates(facility_lat, facility_lon)
        if not valid:
            continue

        # Extract name or fallback to descriptive type
        name = tags.get("name") or tags.get("name:en")
        facility_type, priority_rank = classify_facility(name or "", tags)

        if not name:
            name = facility_type

        address = extract_address(tags)
        phone = clean_phone(tags.get("phone") or tags.get("contact:phone"))

        # Calculate exact Haversine distance
        dist_m, dist_km = calculate_haversine_distance(user_lat, user_lon, facility_lat, facility_lon)

        maps_url = f"https://www.google.com/maps/dir/?api=1&destination={facility_lat},{facility_lon}"

        facilities.append({
            "id": osm_id,
            "name": name.strip(),
            "facility_type": facility_type,
            "priority_rank": priority_rank,
            "address": address,
            "latitude": facility_lat,
            "longitude": facility_lon,
            "distance_m": dist_m,
            "distance_km": dist_km,
            "phone": phone,
            "maps_url": maps_url,
        })

    return facilities


def deduplicate_facilities(facilities: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Removes duplicate facilities based on OSM ID or close spatial proximity (<50m) and name matching."""
    seen_ids = set()
    deduped: list[dict[str, Any]] = []

    for fac in facilities:
        fid = fac["id"]
        if fid in seen_ids:
            continue

        # Check spatial proximity against already accepted facilities
        is_duplicate = False
        for accepted in deduped:
            dist_between_m, _ = calculate_haversine_distance(
                fac["latitude"], fac["longitude"], accepted["latitude"], accepted["longitude"]
            )
            # If within 50 meters and similar name or identical facility type, consider duplicate
            if dist_between_m < 50:
                name_a = fac["name"].lower().strip()
                name_b = accepted["name"].lower().strip()
                if name_a == name_b or name_a in name_b or name_b in name_a:
                    is_duplicate = True
                    break

        if not is_duplicate:
            seen_ids.add(fid)
            deduped.append(fac)

    return deduped


def sort_and_rank_facilities(facilities: list[dict[str, Any]], limit: int = 6) -> list[dict[str, Any]]:
    """Sorts facilities:
    1. Primary Health Centres (priority_rank 1), sorted nearest-first
    2. Government Health Facilities (priority_rank 2), sorted nearest-first
    3. General Healthcare Facilities (priority_rank 3), sorted nearest-first
    """
    # Sort by (priority_rank ascending, distance_m ascending)
    sorted_facs = sorted(facilities, key=lambda f: (f["priority_rank"], f["distance_m"]))

    # Clean out internal sorting key before returning to client
    result = []
    for f in sorted_facs[:limit]:
        item = dict(f)
        item.pop("priority_rank", None)
        result.append(item)

    return result


def fetch_nearby_phc(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    overpass_url: str = DEFAULT_OVERPASS_URL,
) -> dict[str, Any]:
    """Queries OpenStreetMap Overpass API for healthcare facilities near coordinates,
    calculates real Haversine distances, ranks nearest PHCs first, and returns clean structured data.
    """
    valid, err_msg = validate_coordinates(latitude, longitude)
    if not valid:
        return {
            "success": False,
            "error": err_msg or "Invalid coordinates provided.",
        }

    clamped_radius = validate_radius(radius)
    query_str = build_overpass_query(latitude, longitude, clamped_radius)

    raw_elements: list[dict[str, Any]] = []
    endpoints = [overpass_url, FALLBACK_OVERPASS_URL] if overpass_url == DEFAULT_OVERPASS_URL else [overpass_url]

    query_success = False
    for endpoint in endpoints:
        try:
            logger.info(f"Querying Overpass API at {endpoint} for radius {clamped_radius}m")
            resp = requests.post(
                endpoint,
                data={"data": query_str},
                headers={"User-Agent": "ArogyaVani-AI-PHC-Finder/1.0"},
                timeout=12,
            )
            if resp.status_code == 200:
                data = resp.json()
                raw_elements = data.get("elements", [])
                query_success = True
                break
            else:
                logger.warning(f"Overpass endpoint {endpoint} returned HTTP status {resp.status_code}")
        except Exception as exc:
            logger.warning(f"Failed to query Overpass endpoint {endpoint}: {exc}")

    if not query_success:
        logger.error("All Overpass API endpoints failed.")
        return {
            "success": False,
            "error": "Nearby facility search is temporarily unavailable. Please try again later.",
        }

    # Parse and extract facilities
    parsed = parse_overpass_elements(raw_elements, latitude, longitude)

    # Deduplicate
    deduped = deduplicate_facilities(parsed)

    # Sort & Rank (PHC > Govt Facility > General Clinic, nearest-first)
    final_facilities = sort_and_rank_facilities(deduped, limit=6)

    has_phc_match = any(f["facility_type"] == "Primary Health Centre" for f in final_facilities)

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
