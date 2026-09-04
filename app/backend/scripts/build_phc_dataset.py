import csv
import glob
import json
import math
import os
import re
import sys
import xml.etree.ElementTree as ET
from typing import Any, Optional

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
FINAL_DATA_FILE = os.path.join(BASE_DIR, "data", "phc_facilities.json")
MISSING_COORDS_FILE = os.path.join(PROCESSED_DATA_DIR, "missing_coordinates.json")
REPORT_FILE = os.path.join(PROCESSED_DATA_DIR, "dataset_report.json")

EARTH_RADIUS_METERS = 6371000.0


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two coordinate pairs in meters."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2.0) ** 2
    return 2.0 * EARTH_RADIUS_METERS * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


def validate_coordinates(lat: Any, lon: Any) -> tuple[bool, Optional[float], Optional[float]]:
    """Validates and parses geographic latitude and longitude."""
    try:
        if lat is None or lon is None:
            return False, None, None
        f_lat = float(lat)
        f_lon = float(lon)
        if math.isnan(f_lat) or math.isnan(f_lon) or math.isinf(f_lat) or math.isinf(f_lon):
            return False, None, None
        if f_lat == 0.0 and f_lon == 0.0:
            return False, None, None
        if -90.0 <= f_lat <= 90.0 and -180.0 <= f_lon <= 180.0:
            return True, round(f_lat, 6), round(f_lon, 6)
        return False, None, None
    except (ValueError, TypeError):
        return False, None, None


def normalize_state(state_raw: Optional[str], district_raw: Optional[str] = None) -> str:
    """Normalizes state names across all India."""
    s = (state_raw or "").strip().title()
    d = (district_raw or "").strip().lower()

    if "karnataka" in s.lower() or "bengaluru" in d or "bangalore" in d or "mysuru" in d:
        return "Karnataka"
    if "tamil nadu" in s.lower() or "tamilnadu" in s.lower() or "chennai" in d:
        return "Tamil Nadu"
    if "delhi" in s.lower() or "delhi" in d:
        return "Delhi"
    if "maharashtra" in s.lower() or "mumbai" in d or "pune" in d or "nagpur" in d:
        return "Maharashtra"
    if "kerala" in s.lower():
        return "Kerala"
    if "telangana" in s.lower() or "hyderabad" in d:
        return "Telangana"
    if "andhra" in s.lower():
        return "Andhra Pradesh"
    if "uttar pradesh" in s.lower() or s.lower() == "up":
        return "Uttar Pradesh"
    if "gujarat" in s.lower():
        return "Gujarat"
    if "west bengal" in s.lower():
        return "West Bengal"
    if "rajasthan" in s.lower():
        return "Rajasthan"
    if "madhya pradesh" in s.lower() or s.lower() == "mp":
        return "Madhya Pradesh"
    if "bihar" in s.lower():
        return "Bihar"
    if "odisha" in s.lower() or "orissa" in s.lower():
        return "Odisha"
    if "punjab" in s.lower():
        return "Punjab"
    if "haryana" in s.lower():
        return "Haryana"
    if "assam" in s.lower():
        return "Assam"
    return s if s else "Karnataka"


def normalize_district(district_raw: Optional[str], state_raw: Optional[str] = None) -> str:
    """Normalizes district names, guaranteeing Bengaluru variants map to Bengaluru Urban."""
    d = (district_raw or "").strip()
    d_lower = d.lower()

    bengaluru_variants = [
        "bangalore",
        "bangalore urban",
        "bangalore city",
        "bengaluru",
        "bengaluru urban",
        "bengaluru city",
        "bbmp",
        "bruhat bengaluru",
        "bruhat bengaluru mahanagara palike",
    ]
    if any(var in d_lower for var in bengaluru_variants):
        if "rural" in d_lower:
            return "Bengaluru Rural"
        return "Bengaluru Urban"

    if "chennai" in d_lower:
        return "Chennai"
    if "mumbai" in d_lower:
        return "Mumbai"
    if "mysuru" in d_lower or "mysore" in d_lower:
        return "Mysuru"
    if "belagavi" in d_lower or "belgaum" in d_lower:
        return "Belagavi"
    if "dharwad" in d_lower or "hubli" in d_lower or "hubballi" in d_lower:
        return "Dharwad"
    if "dakshina kannada" in d_lower or "mangaluru" in d_lower or "mangalore" in d_lower:
        return "Dakshina Kannada"
    if "kalaburagi" in d_lower or "gulbarga" in d_lower:
        return "Kalaburagi"

    # Default clean Title Case
    return d.title() if d else "Bengaluru Urban"


def classify_facility(name: str, raw_type: Optional[str] = None) -> str:
    """Classifies facility as 'Primary Health Centre' or 'Government Health Facility'."""
    text = f"{name} {raw_type or ''}".lower()

    phc_patterns = [
        r"\bphc\b",
        r"\buphc\b",
        r"\bprimary health\b",
        r"\bprimary healthcare\b",
        r"\bnamma clinic\b",
        r"\burban primary health\b",
        r"\bprathmik swasthya\b",
        r"\bprarambhika arogya\b",
        r"\barogya nilayam\b",
        r"\bcommunity health centre\b",
        r"\bcommunity health center\b",
        r"\bchc\b",
        r"\bgovt phc\b",
        r"\bgovernment phc\b",
    ]

    if any(re.search(pat, text) for pat in phc_patterns):
        return "Primary Health Centre"

    return "Government Health Facility"


def clean_phone(phone_raw: Optional[str]) -> Optional[str]:
    """Cleans and standardizes phone number strings."""
    if not phone_raw:
        return None
    p = str(phone_raw).strip()
    if ";" in p:
        p = p.split(";")[0].strip()
    elif "," in p:
        p = p.split(",")[0].strip()

    clean = re.sub(r"[^\d+\-\s]", "", p).strip()
    digits = re.sub(r"\D", "", clean)
    if len(digits) < 5:
        return None
    return clean


def parse_kml_file(file_path: str) -> list[dict[str, Any]]:
    """Parses standard KML files containing Placemark elements and ExtendedData SimpleData."""
    facilities = []
    tree = ET.parse(file_path)
    root = tree.getroot()

    # Determine namespace if present
    ns = {"kml": "http://www.opengis.net/kml/2.2"}
    if not root.tag.startswith("{"):
        ns = {}

    placemarks = root.findall(".//Placemark", ns) if not ns else root.findall(".//kml:Placemark", ns)

    source_base = os.path.basename(file_path)
    source_name = "Government Open Data Platform / KGIS"
    if "bbmp" in source_base.lower() or "bengaluru" in source_base.lower():
        source_name = "Karnataka Health and Family Welfare Department / BBMP"
    elif "chennai" in source_base.lower():
        source_name = "Greater Chennai Corporation Health Department"

    for idx, pm in enumerate(placemarks):
        data: dict[str, str] = {}
        simple_data_nodes = pm.findall(".//SimpleData", ns) if not ns else pm.findall(".//kml:SimpleData", ns)
        for sd in simple_data_nodes:
            key = sd.attrib.get("name", "")
            val = (sd.text or "").strip()
            if key and val:
                data[key] = val

        # Name resolution
        name = (
            data.get("UPHC")
            or data.get("NammaClinicName")
            or data.get("UCHC_HospitalName")
            or data.get("ASSET_NAME")
            or data.get("Name")
            or data.get("name")
            or ""
        )
        if not name:
            name_node = pm.find("name", ns) if not ns else pm.find("kml:name", ns)
            if name_node is not None and name_node.text:
                name = name_node.text.strip()

        # Format name appropriately
        if data.get("NammaClinicName"):
            if not name.lower().startswith("namma clinic"):
                name = f"Namma Clinic - {name}"
        elif data.get("UPHC"):
            if not name.lower().startswith("uphc") and not name.lower().startswith("urban primary"):
                name = f"Urban Primary Health Centre - {name}"
        elif not name:
            name = f"Public Health Facility {idx + 1}"

        # Coordinates resolution
        lat = data.get("Lattitude") or data.get("Latitude") or data.get("lat") or data.get("LATITUDE")
        lon = data.get("Longitude") or data.get("lon") or data.get("LONGITUDE")

        if lat is None or lon is None:
            coord_node = pm.find(".//coordinates", ns) if not ns else pm.find(".//kml:coordinates", ns)
            if coord_node is not None and coord_node.text:
                coords = coord_node.text.strip().split(",")
                if len(coords) >= 2:
                    lon, lat = coords[0].strip(), coords[1].strip()

        # Address & Ward resolution
        ward = data.get("ward") or data.get("Ward") or data.get("DIVISION") or None
        zone = data.get("Zone") or data.get("ZONE") or None
        addr = data.get("ADDRESS") or data.get("Address") or data.get("LOCATION") or None

        address_parts = []
        if addr:
            address_parts.append(addr)
        if ward:
            address_parts.append(f"Ward: {ward}")
        if zone:
            address_parts.append(f"Zone: {zone}")

        state = "Tamil Nadu" if "chennai" in source_base.lower() else "Karnataka"
        district = "Chennai" if "chennai" in source_base.lower() else "Bengaluru Urban"

        address_parts.append(district)
        address_parts.append(state)
        full_address = ", ".join(address_parts)

        phone = clean_phone(data.get("Contact_No") or data.get("phone") or data.get("contact"))

        facility_type = classify_facility(name, data.get("TYPE") or data.get("facility_type"))

        source_id = data.get("KGISCode") or data.get("FINAL_CODE") or data.get("FID") or f"KML-{source_base[:4]}-{idx}"

        facilities.append({
            "raw_id": str(source_id),
            "name": name.strip(),
            "facility_type": facility_type,
            "state": state,
            "district": district,
            "subdistrict": ward,
            "address": full_address,
            "latitude": lat,
            "longitude": lon,
            "phone": phone,
            "source": source_name,
            "source_url": "https://data.opencity.in",
            "source_year": 2023,
            "verified": False,
        })

    return facilities


def parse_csv_file(file_path: str) -> list[dict[str, Any]]:
    """Parses CSV health directory files."""
    facilities = []
    source_base = os.path.basename(file_path)

    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            # Normalize keys
            norm_row = {k.strip().lower(): (v or "").strip() for k, v in row.items() if k}

            name = (
                norm_row.get("name")
                or norm_row.get("uphc name")
                or norm_row.get("hospital name")
                or norm_row.get("facility_name")
                or norm_row.get("centre_name")
                or ""
            )
            if not name:
                continue

            lat = norm_row.get("latitude") or norm_row.get("lat")
            lon = norm_row.get("longitude") or norm_row.get("lon") or norm_row.get("lng")

            state_raw = norm_row.get("state") or norm_row.get("state_name")
            district_raw = norm_row.get("district") or norm_row.get("city") or norm_row.get("zone. no")

            state = normalize_state(state_raw, district_raw)
            district = normalize_district(district_raw, state)

            address = (
                norm_row.get("uphc  address")
                or norm_row.get("address")
                or norm_row.get("location")
                or f"{district}, {state}"
            )

            phone = clean_phone(norm_row.get("helpline") or norm_row.get("phone") or norm_row.get("contact_no"))

            facility_type = classify_facility(name, norm_row.get("category") or norm_row.get("type"))

            source_id = norm_row.get("id") or f"CSV-{source_base[:4]}-{idx}"

            source_name = "Government Health Directory"
            if "chennai" in source_base.lower():
                source_name = "Greater Chennai Corporation Health Department"
            elif "national" in source_base.lower():
                source_name = "National Health Infrastructure Directory"

            facilities.append({
                "raw_id": str(source_id),
                "name": name.strip(),
                "facility_type": facility_type,
                "state": state,
                "district": district,
                "subdistrict": norm_row.get("subdistrict") or norm_row.get("div.no") or None,
                "address": address.strip(),
                "latitude": lat,
                "longitude": lon,
                "phone": phone,
                "source": source_name,
                "source_url": "https://data.gov.in",
                "source_year": 2023,
                "verified": False,
            })

    return facilities


def parse_json_file(file_path: str) -> list[dict[str, Any]]:
    """Parses JSON health facility files."""
    facilities = []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    items = data if isinstance(data, list) else data.get("features", data.get("facilities", []))

    for idx, item in enumerate(items):
        if isinstance(item, dict) and item.get("type") == "Feature":
            # GeoJSON
            props = item.get("properties", {})
            geom = item.get("geometry", {})
            coords = geom.get("coordinates", [])
            lon, lat = (coords[0], coords[1]) if len(coords) >= 2 else (None, None)
            name = props.get("name") or props.get("facility_name") or f"Health Facility {idx+1}"
            state = normalize_state(props.get("state"), props.get("district"))
            district = normalize_district(props.get("district"), state)
            phone = clean_phone(props.get("phone") or props.get("contact"))
            facilities.append({
                "raw_id": str(props.get("id") or f"GEOJSON-{idx}"),
                "name": name.strip(),
                "facility_type": classify_facility(name, props.get("facility_type") or props.get("amenity")),
                "state": state,
                "district": district,
                "subdistrict": props.get("subdistrict"),
                "address": props.get("address") or f"{district}, {state}",
                "latitude": lat,
                "longitude": lon,
                "phone": phone,
                "source": props.get("source") or "Official Health Directory",
                "source_url": props.get("source_url") or "https://karhfw.gov.in",
                "source_year": props.get("source_year") or 2023,
                "verified": bool(props.get("verified", False)),
            })
        elif isinstance(item, dict):
            # Direct facility JSON record
            name = item.get("name") or f"Health Centre {idx+1}"
            state = normalize_state(item.get("state"), item.get("district"))
            district = normalize_district(item.get("district"), state)
            facilities.append({
                "raw_id": str(item.get("id") or f"JSON-{idx}"),
                "name": name.strip(),
                "facility_type": item.get("facility_type") or classify_facility(name),
                "state": state,
                "district": district,
                "subdistrict": item.get("subdistrict"),
                "address": item.get("address") or f"{district}, {state}",
                "latitude": item.get("latitude"),
                "longitude": item.get("longitude"),
                "phone": clean_phone(item.get("phone")),
                "source": item.get("source") or "Karnataka Health and Family Welfare Department",
                "source_url": item.get("source_url") or "https://karhfw.gov.in",
                "source_year": item.get("source_year") or 2023,
                "verified": bool(item.get("verified", False)),
            })

    return facilities


def deduplicate_facilities(facilities: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    """Deduplicates records in order:
    1. Exact source facility ID
    2. Exact normalized name + exact district
    3. Coordinates within 50m + similar name
    """
    seen_ids = set()
    name_district_seen = set()
    deduped: list[dict[str, Any]] = []
    removed_count = 0

    for fac in facilities:
        fid = fac["id"]
        norm_name = re.sub(r"[^\w\s]", "", fac["name"].lower()).strip()
        norm_dist = fac["district"].lower().strip()
        name_dist_key = f"{norm_name}::{norm_dist}"

        if fid in seen_ids:
            removed_count += 1
            continue

        if name_dist_key in name_district_seen:
            removed_count += 1
            continue

        # Spatial check against already accepted facilities (<50m proximity)
        is_duplicate = False
        for accepted in deduped:
            dist = haversine_distance(
                fac["latitude"], fac["longitude"], accepted["latitude"], accepted["longitude"]
            )
            if dist < 50:
                acc_name = re.sub(r"[^\w\s]", "", accepted["name"].lower()).strip()
                if norm_name in acc_name or acc_name in norm_name or norm_name == acc_name:
                    is_duplicate = True
                    break

        if is_duplicate:
            removed_count += 1
            continue

        seen_ids.add(fid)
        name_district_seen.add(name_dist_key)
        deduped.append(fac)

    return deduped, removed_count


def build_dataset() -> dict[str, Any]:
    """Reads raw source files, normalizes records, splits missing coordinates,
    deduplicates, and saves final JSON datasets.
    """
    print("Reading official raw healthcare datasets from:", RAW_DATA_DIR)
    raw_facilities: list[dict[str, Any]] = []

    # 1. KML files
    kml_files = glob.glob(os.path.join(RAW_DATA_DIR, "*.kml"))
    for kf in kml_files:
        parsed = parse_kml_file(kf)
        print(f"Loaded {len(parsed)} records from {os.path.basename(kf)}")
        raw_facilities.extend(parsed)

    # 2. CSV files
    csv_files = glob.glob(os.path.join(RAW_DATA_DIR, "*.csv"))
    for cf in csv_files:
        parsed = parse_csv_file(cf)
        print(f"Loaded {len(parsed)} records from {os.path.basename(cf)}")
        raw_facilities.extend(parsed)

    # 3. JSON files
    json_files = glob.glob(os.path.join(RAW_DATA_DIR, "*.json"))
    for jf in json_files:
        parsed = parse_json_file(jf)
        print(f"Loaded {len(parsed)} records from {os.path.basename(jf)}")
        raw_facilities.extend(parsed)

    valid_coords_records: list[dict[str, Any]] = []
    missing_coords_records: list[dict[str, Any]] = []

    for idx, r in enumerate(raw_facilities):
        valid, lat, lon = validate_coordinates(r["latitude"], r["longitude"])
        raw_id_str = str(r.get("raw_id", "")).strip()
        # If raw_id is just a small digit like '1', '2' (category/state code), namespace it with index
        if raw_id_str and len(raw_id_str) > 4:
            final_id = f"IND-{raw_id_str}"
        else:
            final_id = f"PHC-IND-{idx+1:05d}"

        record = {
            "id": final_id,
            "name": r["name"],
            "facility_type": r["facility_type"],
            "state": r["state"],
            "district": r["district"],
            "subdistrict": r.get("subdistrict"),
            "address": r["address"],
            "latitude": lat if valid else None,
            "longitude": lon if valid else None,
            "phone": r.get("phone"),
            "source": r["source"],
            "source_url": r.get("source_url", "https://data.gov.in"),
            "source_year": r.get("source_year", 2023),
            "verified": r.get("verified", False),
        }

        if valid and lat is not None and lon is not None:
            record["latitude"] = lat
            record["longitude"] = lon
            valid_coords_records.append(record)
        else:
            missing_coords_records.append(record)

    # Deduplicate valid records
    deduped_facilities, dups_removed = deduplicate_facilities(valid_coords_records)

    # Sort facilities by state, district, name
    deduped_facilities.sort(key=lambda x: (x["state"], x["district"], x["name"]))

    # Write output files
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(FINAL_DATA_FILE), exist_ok=True)

    with open(FINAL_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(deduped_facilities, f, indent=2, ensure_ascii=False)

    with open(MISSING_COORDS_FILE, "w", encoding="utf-8") as f:
        json.dump(missing_coords_records, f, indent=2, ensure_ascii=False)

    # Metrics
    total_valid = len(deduped_facilities)
    phc_count = sum(1 for f in deduped_facilities if f["facility_type"] == "Primary Health Centre")
    govt_count = sum(1 for f in deduped_facilities if f["facility_type"] == "Government Health Facility")
    phone_count = sum(1 for f in deduped_facilities if f["phone"] is not None)
    states_set = {f["state"] for f in deduped_facilities}
    districts_set = {f"{f['state']}::{f['district']}" for f in deduped_facilities}
    blr_records = [f for f in deduped_facilities if f["district"] == "Bengaluru Urban"]
    blr_phc_records = [f for f in blr_records if f["facility_type"] == "Primary Health Centre"]
    ka_records = [f for f in deduped_facilities if f["state"] == "Karnataka"]
    ka_phc_records = [f for f in ka_records if f["facility_type"] == "Primary Health Centre"]

    report = {
        "total_records": len(raw_facilities),
        "phc_records": phc_count,
        "government_records": govt_count,
        "records_with_coordinates": total_valid,
        "records_without_coordinates": len(missing_coords_records),
        "records_with_phone": phone_count,
        "states_count": len(states_set),
        "districts_count": len(districts_set),
        "bengaluru_records": len(blr_records),
        "bengaluru_phc_records": len(blr_phc_records),
        "karnataka_records": len(ka_records),
        "karnataka_phc_records": len(ka_phc_records),
        "duplicate_records_removed": dups_removed,
        "states": sorted(list(states_set)),
    }

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("\n==================================================")
    print("AROGYAVANI AI — NATIONAL PHC DATASET REPORT")
    print("==================================================")
    print(f"All raw records parsed: {len(raw_facilities)}")
    print(f"Valid facilities with GPS: {total_valid}")
    print(f"Primary Health Centres: {phc_count}")
    print(f"Government Health Facilities: {govt_count}")
    print(f"Bengaluru Urban Total: {len(blr_records)}")
    print(f"Bengaluru Urban PHCs: {len(blr_phc_records)}")
    print(f"Karnataka Total: {len(ka_records)}")
    print(f"Karnataka PHCs: {len(ka_phc_records)}")
    print(f"Facilities with phone contact: {phone_count}")
    print(f"States covered: {len(states_set)}")
    print(f"Districts covered: {len(districts_set)}")
    print(f"Duplicates removed: {dups_removed}")
    print(f"Records missing coordinates (isolated): {len(missing_coords_records)}")
    print(f"Output dataset: {FINAL_DATA_FILE}")
    print("==================================================\n")

    return report


if __name__ == "__main__":
    build_dataset()
