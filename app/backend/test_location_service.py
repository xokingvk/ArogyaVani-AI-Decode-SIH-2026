import json
import unittest
from unittest.mock import MagicMock, patch
import requests

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
    fetch_nearby_phc,
    query_overpass_with_failover,
    _facility_cache,
)


class TestLocationService(unittest.TestCase):
    def setUp(self):
        # Clear cache before each test
        _facility_cache.clear()

    # -------------------------------------------------------------
    # Scenario I: Coordinate, Radius, & Haversine Validation
    # -------------------------------------------------------------
    def test_coordinate_validation(self):
        valid, err = validate_coordinates(12.9716, 77.5946)
        self.assertTrue(valid)
        self.assertIsNone(err)

        self.assertTrue(validate_coordinates(90.0, 180.0)[0])
        self.assertTrue(validate_coordinates(-90.0, -180.0)[0])
        self.assertTrue(validate_coordinates(0.0, 0.0)[0])

        self.assertFalse(validate_coordinates(91.0, 77.5)[0])
        self.assertFalse(validate_coordinates(-90.1, 77.5)[0])
        self.assertFalse(validate_coordinates(12.9, 181.0)[0])
        self.assertFalse(validate_coordinates(12.9, -180.1)[0])
        self.assertFalse(validate_coordinates("12.9", "77.5")[0])

    def test_radius_validation(self):
        self.assertEqual(validate_radius(5000), 5000)
        self.assertEqual(validate_radius(200), 500)
        self.assertEqual(validate_radius(50000), 25000)

    def test_haversine_distance_accuracy(self):
        dist_m, dist_km = calculate_haversine_distance(12.9716, 77.5946, 12.9816, 77.5946)
        self.assertAlmostEqual(dist_m, 1112, delta=30)
        self.assertAlmostEqual(dist_km, 1.11, delta=0.05)

        dist_m_0, dist_km_0 = calculate_haversine_distance(12.9716, 77.5946, 12.9716, 77.5946)
        self.assertEqual(dist_m_0, 0)
        self.assertEqual(dist_km_0, 0.0)

    # -------------------------------------------------------------
    # Scenario J: PHC Classification Rules
    # -------------------------------------------------------------
    def test_phc_classification_rules(self):
        # 1. Primary Health Centre
        f_type, rank = classify_facility("Kanchipuram Main PHC", {"amenity": "clinic"})
        self.assertEqual(f_type, "Primary Health Centre")
        self.assertEqual(rank, 1)

        f_type, rank = classify_facility("Primary Health Center Walajabad", {"amenity": "hospital"})
        self.assertEqual(f_type, "Primary Health Centre")
        self.assertEqual(rank, 1)

        f_type, rank = classify_facility("Govt PHC Madhurantakam", {})
        self.assertEqual(f_type, "Primary Health Centre")
        self.assertEqual(rank, 1)

        f_type, rank = classify_facility("Community Health Centre Chengalpattu", {})
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

    def test_address_and_phone(self):
        tags = {
            "addr:street": "Gandhi Road",
            "addr:village": "Kanchipuram",
            "addr:district": "Kanchipuram",
            "addr:state": "Tamil Nadu",
            "addr:postcode": "631501",
        }
        addr = extract_address(tags)
        self.assertIn("Gandhi Road", addr)
        self.assertIn("PIN: 631501", addr)

        self.assertEqual(clean_phone("+91 44 2722 0000"), "+91 44 2722 0000")
        self.assertEqual(clean_phone("044-27220000; 044-27220001"), "044-27220000")
        self.assertIsNone(clean_phone("104"))

    # -------------------------------------------------------------
    # Scenario A: First Overpass endpoint succeeds
    # -------------------------------------------------------------
    @patch("requests.Session.post")
    def test_scenario_a_first_endpoint_succeeds(self, mock_post):
        sample_osm = {
            "elements": [
                {
                    "type": "node",
                    "id": 1,
                    "lat": 12.9720,
                    "lon": 77.5950,
                    "tags": {"name": "Urban PHC Central", "amenity": "clinic"},
                }
            ]
        }
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = sample_osm
        mock_post.return_value = mock_resp

        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000)
        self.assertTrue(res["success"])
        self.assertEqual(len(res["facilities"]), 1)
        self.assertEqual(res["facilities"][0]["name"], "Urban PHC Central")
        self.assertTrue(res["has_phc_match"])
        self.assertEqual(mock_post.call_count, 1)

    # -------------------------------------------------------------
    # Scenario B: First endpoint fails, second succeeds
    # -------------------------------------------------------------
    @patch("requests.Session.post")
    def test_scenario_b_first_fails_second_succeeds(self, mock_post):
        mock_resp_fail = MagicMock()
        mock_resp_fail.status_code = 502

        mock_resp_success = MagicMock()
        mock_resp_success.status_code = 200
        mock_resp_success.json.return_value = {
            "elements": [
                {
                    "type": "node",
                    "id": 2,
                    "lat": 12.9730,
                    "lon": 77.5950,
                    "tags": {"name": "Primary Health Centre East", "healthcare": "centre"},
                }
            ]
        }

        mock_post.side_effect = [mock_resp_fail, mock_resp_success]

        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000)
        self.assertTrue(res["success"])
        self.assertEqual(len(res["facilities"]), 1)
        self.assertEqual(res["facilities"][0]["facility_type"], "Primary Health Centre")
        self.assertEqual(mock_post.call_count, 2)

    # -------------------------------------------------------------
    # Scenario C: First and second fail, third succeeds
    # -------------------------------------------------------------
    @patch("requests.Session.post")
    def test_scenario_c_third_succeeds(self, mock_post):
        mock_resp_success = MagicMock()
        mock_resp_success.status_code = 200
        mock_resp_success.json.return_value = {
            "elements": [
                {
                    "type": "node",
                    "id": 3,
                    "lat": 12.9740,
                    "lon": 77.5950,
                    "tags": {"name": "Govt District Hospital", "amenity": "hospital"},
                }
            ]
        }

        mock_post.side_effect = [
            requests.exceptions.ConnectionError("Network unreachable"),
            requests.exceptions.ReadTimeout("Timeout"),
            mock_resp_success,
        ]

        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000)
        self.assertTrue(res["success"])
        self.assertEqual(res["facilities"][0]["name"], "Govt District Hospital")
        self.assertEqual(mock_post.call_count, 3)

    # -------------------------------------------------------------
    # Scenario D: All endpoints fail -> Graceful failure JSON
    # -------------------------------------------------------------
    @patch("requests.Session.post")
    def test_scenario_d_all_fail(self, mock_post):
        mock_post.side_effect = requests.exceptions.ConnectionError("Connection refused")

        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000)
        self.assertFalse(res["success"])
        self.assertIn("Nearby facility search is temporarily unavailable", res["error"])

    # -------------------------------------------------------------
    # Scenario E: Endpoint returns 429 Rate Limit -> Fallback
    # -------------------------------------------------------------
    @patch("requests.Session.post")
    def test_scenario_e_429_failover(self, mock_post):
        mock_429 = MagicMock()
        mock_429.status_code = 429

        mock_200 = MagicMock()
        mock_200.status_code = 200
        mock_200.json.return_value = {"elements": []}

        mock_post.side_effect = [mock_429, mock_200]

        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000)
        self.assertTrue(res["success"])
        self.assertEqual(mock_post.call_count, 2)

    # -------------------------------------------------------------
    # Scenario F: Endpoint ConnectTimeout -> Fallback
    # -------------------------------------------------------------
    @patch("requests.Session.post")
    def test_scenario_f_timeout_failover(self, mock_post):
        mock_200 = MagicMock()
        mock_200.status_code = 200
        mock_200.json.return_value = {"elements": []}

        mock_post.side_effect = [
            requests.exceptions.ConnectTimeout("Connect timeout"),
            mock_200,
        ]

        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000)
        self.assertTrue(res["success"])
        self.assertEqual(mock_post.call_count, 2)

    # -------------------------------------------------------------
    # Scenario G: Valid empty response -> Success with empty list
    # -------------------------------------------------------------
    @patch("requests.Session.post")
    def test_scenario_g_empty_response(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"elements": []}
        mock_post.return_value = mock_resp

        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000)
        self.assertTrue(res["success"])
        self.assertEqual(res["facilities"], [])
        self.assertFalse(res["has_phc_match"])
        self.assertEqual(res["total_found"], 0)

    # -------------------------------------------------------------
    # Scenario H: Malformed JSON -> Fallback
    # -------------------------------------------------------------
    @patch("requests.Session.post")
    def test_scenario_h_malformed_json_failover(self, mock_post):
        mock_bad_json = MagicMock()
        mock_bad_json.status_code = 200
        mock_bad_json.json.side_effect = ValueError("Invalid JSON string")

        mock_good_json = MagicMock()
        mock_good_json.status_code = 200
        mock_good_json.json.return_value = {"elements": []}

        mock_post.side_effect = [mock_bad_json, mock_good_json]

        res = fetch_nearby_phc(12.9716, 77.5946, radius=5000)
        self.assertTrue(res["success"])
        self.assertEqual(mock_post.call_count, 2)


if __name__ == "__main__":
    unittest.main()
