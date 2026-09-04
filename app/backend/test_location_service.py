import unittest
from services.location_service import (
    validate_coordinates,
    validate_radius,
    calculate_haversine_distance,
    classify_facility,
    extract_address,
    clean_phone,
    parse_overpass_elements,
    deduplicate_facilities,
    sort_and_rank_facilities,
)


class TestLocationService(unittest.TestCase):
    def test_coordinate_validation(self):
        # Valid coordinates
        valid, err = validate_coordinates(12.9716, 77.5946)
        self.assertTrue(valid)
        self.assertIsNone(err)

        # Extreme valid bounds
        self.assertTrue(validate_coordinates(90.0, 180.0)[0])
        self.assertTrue(validate_coordinates(-90.0, -180.0)[0])
        self.assertTrue(validate_coordinates(0.0, 0.0)[0])

        # Invalid bounds
        self.assertFalse(validate_coordinates(91.0, 77.5)[0])
        self.assertFalse(validate_coordinates(-90.1, 77.5)[0])
        self.assertFalse(validate_coordinates(12.9, 181.0)[0])
        self.assertFalse(validate_coordinates(12.9, -180.1)[0])

    def test_radius_validation(self):
        self.assertEqual(validate_radius(5000), 5000)
        self.assertEqual(validate_radius(200), 500)  # Clamped to min 500
        self.assertEqual(validate_radius(50000), 25000)  # Clamped to max 25000

    def test_haversine_distance_accuracy(self):
        # Bangalore (12.9716, 77.5946) to nearby spot ~1.1km north
        dist_m, dist_km = calculate_haversine_distance(12.9716, 77.5946, 12.9816, 77.5946)
        self.assertAlmostEqual(dist_m, 1112, delta=30)
        self.assertAlmostEqual(dist_km, 1.11, delta=0.05)

        # Same point = 0 distance
        dist_m_0, dist_km_0 = calculate_haversine_distance(12.9716, 77.5946, 12.9716, 77.5946)
        self.assertEqual(dist_m_0, 0)
        self.assertEqual(dist_km_0, 0.0)

    def test_phc_classification_rules(self):
        # 1. Primary Health Centre by name
        f_type, rank = classify_facility("Kanchipuram Main PHC", {"amenity": "clinic"})
        self.assertEqual(f_type, "Primary Health Centre")
        self.assertEqual(rank, 1)

        f_type, rank = classify_facility("Primary Health Center Walajabad", {"amenity": "hospital"})
        self.assertEqual(f_type, "Primary Health Centre")
        self.assertEqual(rank, 1)

        f_type, rank = classify_facility("Govt PHC Madhurantakam", {})
        self.assertEqual(f_type, "Primary Health Centre")
        self.assertEqual(rank, 1)

        # 2. Government Health Facility
        f_type, rank = classify_facility("Government General Hospital", {"amenity": "hospital"})
        self.assertEqual(f_type, "Government Health Facility")
        self.assertEqual(rank, 2)

        f_type, rank = classify_facility("Sub-Centre Health Unit", {"operator:type": "government"})
        self.assertEqual(f_type, "Government Health Facility")
        self.assertEqual(rank, 2)

        # 3. General Healthcare Facility
        f_type, rank = classify_facility("Apollo Clinic", {"amenity": "clinic"})
        self.assertEqual(f_type, "Healthcare Facility")
        self.assertEqual(rank, 3)

        f_type, rank = classify_facility("City Dental Hospital", {"amenity": "hospital"})
        self.assertEqual(f_type, "Healthcare Facility")
        self.assertEqual(rank, 3)

    def test_address_extraction(self):
        tags = {
            "addr:street": "Gandhi Road",
            "addr:village": "Kanchipuram",
            "addr:district": "Kanchipuram",
            "addr:state": "Tamil Nadu",
            "addr:postcode": "631501",
        }
        addr = extract_address(tags)
        self.assertIn("Gandhi Road", addr)
        self.assertIn("Kanchipuram", addr)
        self.assertIn("Tamil Nadu", addr)
        self.assertIn("PIN: 631501", addr)

        # Missing address
        self.assertIsNone(extract_address({}))

    def test_phone_cleaning(self):
        self.assertEqual(clean_phone("+91 44 2722 0000"), "+91 44 2722 0000")
        self.assertEqual(clean_phone("044-27220000; 044-27220001"), "044-27220000")
        # Too short / invalid phone
        self.assertIsNone(clean_phone("104"))
        self.assertIsNone(clean_phone("N/A"))
        self.assertIsNone(clean_phone(None))

    def test_nearest_first_sorting_and_ranking(self):
        user_lat, user_lon = 12.9716, 77.5946

        raw_elements = [
            {
                "type": "node",
                "id": 1,
                "lat": 12.9800,
                "lon": 77.5950,
                "tags": {"name": "General Private Clinic", "amenity": "clinic"},
            },
            {
                "type": "node",
                "id": 2,
                "lat": 12.9750,
                "lon": 77.5950,
                "tags": {"name": "Primary Health Centre Alpha", "healthcare": "centre"},
            },
            {
                "type": "node",
                "id": 3,
                "lat": 12.9730,
                "lon": 77.5950,
                "tags": {"name": "Government Taluk Hospital", "amenity": "hospital"},
            },
        ]

        parsed = parse_overpass_elements(raw_elements, user_lat, user_lon)
        deduped = deduplicate_facilities(parsed)
        ranked = sort_and_rank_facilities(deduped, limit=5)

        # Ranked item 0 should be the PHC (priority 1)
        self.assertEqual(ranked[0]["facility_type"], "Primary Health Centre")
        self.assertEqual(ranked[0]["name"], "Primary Health Centre Alpha")

        # Ranked item 1 should be the Government Hospital (priority 2)
        self.assertEqual(ranked[1]["facility_type"], "Government Health Facility")

        # Ranked item 2 should be the Private Clinic (priority 3)
        self.assertEqual(ranked[2]["facility_type"], "Healthcare Facility")

        # Check Google Maps URL is generated
        self.assertTrue(ranked[0]["maps_url"].startswith("https://www.google.com/maps/dir/?api=1&destination="))

    def test_deduplication(self):
        user_lat, user_lon = 12.9716, 77.5946

        # Two entries representing the exact same facility 10 meters apart
        raw_elements = [
            {
                "type": "node",
                "id": 101,
                "lat": 12.9720,
                "lon": 77.5946,
                "tags": {"name": "Kanchipuram PHC", "amenity": "clinic"},
            },
            {
                "type": "way",
                "id": 202,
                "center": {"lat": 12.97208, "lon": 77.59462},
                "tags": {"name": "Kanchipuram PHC", "amenity": "clinic"},
            },
        ]

        parsed = parse_overpass_elements(raw_elements, user_lat, user_lon)
        deduped = deduplicate_facilities(parsed)
        self.assertEqual(len(deduped), 1)


if __name__ == "__main__":
    unittest.main()
