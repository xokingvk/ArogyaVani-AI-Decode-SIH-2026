import logging
import os
import time
from typing import Any, Optional
import requests

logger = logging.getLogger(__name__)

# Google Places API (New) Nearby Search endpoint
PLACES_NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby"

# Explicit FieldMask requesting only the necessary fields
PLACES_FIELD_MASK = (
    "places.id,"
    "places.displayName,"
    "places.formattedAddress,"
    "places.location,"
    "places.nationalPhoneNumber,"
    "places.internationalPhoneNumber,"
    "places.types,"
    "places.primaryType,"
    "places.googleMapsUri"
)

# Timeouts: (connect_timeout, read_timeout)
CONNECT_TIMEOUT = 5
READ_TIMEOUT = 10

# Transient HTTP statuses eligible for at most one short retry
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def get_google_maps_api_key() -> Optional[str]:
    """Retrieves the Google Maps API key from the server-side environment."""
    return os.getenv("GOOGLE_MAPS_API_KEY")


def search_nearby_places(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    session: Optional[requests.Session] = None,
) -> tuple[bool, list[dict[str, Any]], Optional[str]]:
    """Calls Google Places API (New) Nearby Search endpoint.
    
    Returns:
        (success: bool, places: list[dict], error_message: Optional[str])
    """
    api_key = get_google_maps_api_key()
    if not api_key:
        logger.error("[google_places_service] GOOGLE_MAPS_API_KEY is not configured in server environment.")
        return False, [], "Google Maps service configuration error. Please contact the administrator."

    http = session or requests.Session()
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": PLACES_FIELD_MASK,
    }

    payload = {
        "includedTypes": ["clinic", "hospital"],
        "maxResultCount": 10,
        "locationRestriction": {
          "circle": {
            "center": {
              "latitude": latitude,
              "longitude": longitude,
            },
            "radius": float(radius),
          }
        },
        "rankPreference": "DISTANCE",
    }

    max_attempts = 2  # Initial attempt + at most 1 retry for transient errors
    for attempt in range(1, max_attempts + 1):
        try:
            logger.info(
                f"[google_places_service] Calling Google Places API (New) searchNearby (attempt {attempt}/{max_attempts}, radius {radius}m)"
            )
            resp = http.post(
                PLACES_NEARBY_SEARCH_URL,
                json=payload,
                headers=headers,
                timeout=(CONNECT_TIMEOUT, READ_TIMEOUT),
            )

            if resp.status_code == 200:
                data = resp.json()
                places = data.get("places", [])
                logger.info(f"[google_places_service] Search succeeded. Found {len(places)} places.")
                return True, places, None

            if resp.status_code in (400, 401, 403):
                logger.error(
                    f"[google_places_service] Google Places API rejected request with HTTP {resp.status_code}. (Check API key permissions and Places API New enablement)"
                )
                return False, [], "Nearby facility search is temporarily unavailable."

            if resp.status_code in RETRYABLE_STATUS_CODES and attempt < max_attempts:
                logger.warning(
                    f"[google_places_service] Google Places API returned transient HTTP {resp.status_code}. Retrying in 1s..."
                )
                time.sleep(1.0)
                continue

            logger.error(
                f"[google_places_service] Google Places API returned HTTP {resp.status_code} after attempt {attempt}."
            )
            return False, [], "Nearby facility search is temporarily unavailable."

        except (requests.exceptions.ConnectTimeout, requests.exceptions.ReadTimeout) as timeout_err:
            logger.warning(f"[google_places_service] Timeout on attempt {attempt}: {timeout_err}")
            if attempt < max_attempts:
                time.sleep(0.5)
                continue
            return False, [], "Nearby facility search is temporarily unavailable. Please check back shortly."

        except requests.exceptions.ConnectionError as conn_err:
            logger.warning(f"[google_places_service] Connection error on attempt {attempt}: {conn_err}")
            if attempt < max_attempts:
                time.sleep(0.5)
                continue
            return False, [], "Nearby facility search is temporarily unavailable."

        except requests.exceptions.RequestException as req_err:
            logger.error(f"[google_places_service] RequestException on attempt {attempt}: {req_err}")
            return False, [], "Nearby facility search is temporarily unavailable."

        except Exception as exc:
            logger.error(f"[google_places_service] Unexpected error: {exc}")
            return False, [], "Nearby facility search is temporarily unavailable."

    return False, [], "Nearby facility search is temporarily unavailable."
