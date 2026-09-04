import json
import os
import unittest

from scripts.build_phc_dataset import (
    validate_coordinates,
    normalize_district,
    normalize_state,
    classify_facility,
    clean_phone,
    deduplicate_facilities,
)
from services.location_service import load_facilities_dataset, DATASET_PATH


class TestPHCRepository(unittest.TestCase):
    def test_dataset_file_exists_and_loads(self):
        self.assertTrue(os.path.exists(DATASET_PATH), "phc_facilities.json must exist")
        facilities = load_facilities_dataset()
        self.assertIsInstance(facilities, list)
        self.assertGreater(len(facilities), 100, "Dataset should contain hundreds of facilities")

    def test_record_schema_and_types(self):
        facilities = load_facilities_dataset()
        for f in facilities[:30]:
            self.assertIn("id", f)
            self.assertIn("name", f)
            self.assertIn("facility_type", f)
            self.assertIn(f["facility_type"], ["Primary Health Centre", "Government Health Facility"])
            self.assertIn("state", f)
            self.assertIn("district", f)
            self.assertIn("address", f)
            self.assertIn("latitude", f)
            self.assertIn("longitude", f)
            self.assertIsInstance(f["latitude"], (int, float))
            self.assertIsInstance(f["longitude"], (int, float))
            self.assertIn("source", f)
            self.assertIn("source_year", f)
            self.assertIn("verified", f)
            self.assertFalse(f["verified"], "Verified must be false unless proven otherwise")

    def test_bengaluru_coverage(self):
        facilities = load_facilities_dataset()
        bengaluru_phcs = [
            f for f in facilities
            if f["district"] == "Bengaluru Urban" and f["facility_type"] == "Primary Health Centre"
        ]
        self.assertGreaterEqual(len(bengaluru_phcs), 50, "Bengaluru should have extensive PHC coverage")

    def test_coordinate_validation(self):
        valid, lat, lon = validate_coordinates(12.9716, 77.5946)
        self.assertTrue(valid)
        self.assertEqual(lat, 12.9716)
        self.assertEqual(lon, 77.5946)

        # Out of bounds / NaN / Zero
        self.assertFalse(validate_coordinates(95.0, 77.0)[0])
        self.assertFalse(validate_coordinates(0.0, 0.0)[0])
        self.assertFalse(validate_coordinates("invalid", 77.0)[0])
        self.assertFalse(validate_coordinates(None, None)[0])

    def test_bengaluru_normalization(self):
        self.assertEqual(normalize_district("Bangalore Urban"), "Bengaluru Urban")
        self.assertEqual(normalize_district("bangalore"), "Bengaluru Urban")
        self.assertEqual(normalize_district("BBMP"), "Bengaluru Urban")
        self.assertEqual(normalize_district("Bengaluru"), "Bengaluru Urban")
        self.assertEqual(normalize_district("Bangalore Rural"), "Bengaluru Rural")

    def test_state_normalization(self):
        self.assertEqual(normalize_state("karnataka", "bengaluru"), "Karnataka")
        self.assertEqual(normalize_state("tamilnadu", "chennai"), "Tamil Nadu")
        self.assertEqual(normalize_state("delhi", "delhi"), "Delhi")
        self.assertEqual(normalize_state("maharashtra", "mumbai"), "Maharashtra")

    def test_facility_classification(self):
        self.assertEqual(classify_facility("Urban Primary Health Centre - Kempegowda"), "Primary Health Centre")
        self.assertEqual(classify_facility("Namma Clinic - Madivala"), "Primary Health Centre")
        self.assertEqual(classify_facility("PHC Kanchipuram"), "Primary Health Centre")
        self.assertEqual(classify_facility("Govt Taluk Hospital"), "Government Health Facility")
        self.assertEqual(classify_facility("District Referral Hospital"), "Government Health Facility")

    def test_phone_cleaning(self):
        self.assertEqual(clean_phone("080 2222 3333"), "080 2222 3333")
        self.assertEqual(clean_phone("9739895701; 9739895702"), "9739895701")
        self.assertIsNone(clean_phone("104"))  # Too short
        self.assertIsNone(clean_phone(None))

    def test_duplicate_removal(self):
        sample_records = [
            {
                "id": "1",
                "name": "PHC Alpha",
                "district": "Bengaluru Urban",
                "latitude": 12.9716,
                "longitude": 77.5946,
            },
            {
                "id": "1",  # Same ID
                "name": "PHC Alpha",
                "district": "Bengaluru Urban",
                "latitude": 12.9716,
                "longitude": 77.5946,
            },
            {
                "id": "2",
                "name": "PHC Alpha",  # Same name & district & close coordinates
                "district": "Bengaluru Urban",
                "latitude": 12.97162,
                "longitude": 77.59461,
            },
        ]
        deduped, removed = deduplicate_facilities(sample_records)
        self.assertEqual(len(deduped), 1)
        self.assertEqual(removed, 2)


if __name__ == "__main__":
    unittest.main()
