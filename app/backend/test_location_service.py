import unittest

from services.location_service import (
    validate_coordinates,
    validate_radius,
    calculate_haversine_distance,
    fetch_nearby_phc,
)


class TestLocationService(unittest.TestCase):
    # 1. Coordinate validation
    def test_valid_coordinates(self):
        valid, err = validate_coordinates(12.9716, 77.5946)
        self.assertTrue(valid)
        self.assertIsNone(err)

    def test_invalid_coordinates(self):
        self.assertFalse(validate_coordinates(91.0, 77.5)[0])
        self.assertFalse(validate_coordinates(-90.1, 77.5)[0])
        self.assertFalse(validate_coordinates(12.9, 181.0)[0])
        self.assertFalse(validate_coordinates(12.9, -180.1)[0])
        self.assertFalse(validate_coordinates("12.9", "77.5")[0])
        self.assertFalse(validate_coordinates(float("nan"), 77.5)[0])

    # 2. Radius validation
    def test_radius_validation(self):
        self.assertEqual(validate_radius(5000), 5000)
        self.assertEqual(validate_radius(200), 500)  # Min clamp
        self.assertEqual(validate_radius(50000), 25000)  # Max clamp
        self.assertEqual(validate_radius("invalid"), 5000)  # Fallback

    # 3. Haversine distance accuracy
    def test_haversine_distance_accuracy(self):
        dist_m, dist_km = calculate_haversine_distance(12.9716, 77.5946, 12.9816, 77.5946)
        self.assertAlmostEqual(dist_m, 1112, delta=30)
        self.assertAlmostEqual(dist_km, 1.11, delta=0.05)

        # Same location = 0m
        dist_m_0, dist_km_0 = calculate_haversine_distance(12.9716, 77.5946, 12.9716, 77.5946)
        self.assertEqual(dist_m_0, 0)
        self.assertEqual(dist_km_0, 0.0)

    # 4. Nearby PHC search with mock dataset
    def test_fetch_nearby_phc_search(self):
        mock_data = [
            {
                "id": "1",
                "name": "General Government Hospital",
                "facility_type": "Government Health Facility",
                "address": "City Center, Bengaluru",
                "latitude": 12.9720,
                "longitude": 77.5950,
                "phone": "080-22223333",
                "source": "Government Health Directory",
                "source_year": 2023,
                "verified": False,
            },
            {
                "id": "2",
                "name": "Urban Primary Health Centre Yelahanka",
                "facility_type": "Primary Health Centre",
                "address": "Yelahanka, Bengaluru",
                "latitude": 12.9750,
                "longitude": 77.5950,
                "phone": "080-22224444",
                "source": "Government Health Directory",
                "source_year": 2023,
                "verified": False,
            },
            {
                "id": "3",
                "name": "Distant Rural PHC",
                "facility_type": "Primary Health Centre",
                "address": "Far Away, Karnataka",
                "latitude": 13.5000,
                "longitude": 78.5000,  # ~110km away
                "phone": None,
                "source": "Government Health Directory",
                "source_year": 2023,
                "verified": False,
            },
        ]

        # Search around (12.9716, 77.5946) with 5000m radius
        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000, facilities_data=mock_data)

        self.assertTrue(res["success"])
        self.assertEqual(len(res["facilities"]), 2)  # Distant PHC excluded
        self.assertTrue(res["has_phc_match"])

        # PHC must be prioritized first
        self.assertEqual(res["facilities"][0]["name"], "Urban Primary Health Centre Yelahanka")
        self.assertEqual(res["facilities"][0]["facility_type"], "Primary Health Centre")
        self.assertEqual(res["facilities"][1]["name"], "General Government Hospital")

        # Check Google Maps URL format
        self.assertTrue(res["facilities"][0]["maps_url"].startswith("https://www.google.com/maps/dir/?api=1&destination="))

    # 5. Empty results when none within radius
    def test_empty_results(self):
        mock_data = [
            {
                "id": "1",
                "name": "Far PHC",
                "facility_type": "Primary Health Centre",
                "latitude": 28.5000,
                "longitude": 77.2000,  # Delhi
            }
        ]
        # Search in Bengaluru
        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000, facilities_data=mock_data)
        self.assertTrue(res["success"])
        self.assertFalse(res["has_phc_match"])
        self.assertEqual(res["facilities"], [])
        self.assertEqual(res["total_found"], 0)
        self.assertIn("No nearby healthcare facilities", res.get("message", ""))

    # 6. Real local dataset lookup (Bengaluru Coordinates)
    def test_real_dataset_bengaluru_lookup(self):
        # Center of Bengaluru (Vidhana Soudha area: 12.9797, 77.5908)
        res = fetch_nearby_phc(12.9797, 77.5908, radius=5000)
        self.assertTrue(res["success"])
        self.assertGreater(len(res["facilities"]), 0)
        self.assertTrue(res["has_phc_match"])
        # Capped at 5
        self.assertLessEqual(len(res["facilities"]), 5)
        # Check nearest distance is reasonable (<5000m)
        self.assertLessEqual(res["facilities"][0]["distance_m"], 5000)

    # 7. Invalid coordinates error handling
    def test_invalid_coordinates_response(self):
        res = fetch_nearby_phc(999.0, 77.5946)
        self.assertFalse(res["success"])
        self.assertIn("error", res)


if __name__ == "__main__":
    unittest.main()
