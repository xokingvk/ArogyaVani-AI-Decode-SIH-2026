import json
import os
import sys
import urllib.request
import urllib.error

# Healthsites.io Open Health Facilities API for India
API_URL = "https://healthsites.io/api/v2/facilities/?country=India&page="

OUTPUT_RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "healthsites_india.geojson")

def download_india_health_facilities(max_pages=20):
    all_features = []
    print(f"Fetching India health facilities from Healthsites.io (up to {max_pages} pages)...")

    for page in range(1, max_pages + 1):
        url = f"{API_URL}{page}"
        print(f"Fetching page {page}: {url}")
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "ArogyaVaniAI/1.0 (PublicHealthResearch)"}
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                features = data.get("features", [])
                if not features:
                    print(f"No more features on page {page}.")
                    break
                all_features.extend(features)
                print(f"Page {page} fetched {len(features)} facilities. Total so far: {len(all_features)}")
        except urllib.error.HTTPError as e:
            print(f"HTTP Error on page {page}: {e.code} - {e.reason}")
            break
        except Exception as e:
            print(f"Error on page {page}: {e}")
            break

    print(f"Total facilities retrieved: {len(all_features)}")
    if all_features:
        os.makedirs(os.path.dirname(OUTPUT_RAW_PATH), exist_ok=True)
        with open(OUTPUT_RAW_PATH, "w", encoding="utf-8") as f:
            json.dump({"type": "FeatureCollection", "features": all_features}, f, indent=2)
        print(f"Saved to {OUTPUT_RAW_PATH}")

if __name__ == "__main__":
    download_india_health_facilities(max_pages=15)
