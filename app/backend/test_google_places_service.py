import unittest
from unittest.mock import MagicMock, patch
import requests

from services.google_places_service import search_nearby_places, PLACES_NEARBY_SEARCH_URL


class TestGooglePlacesService(unittest.TestCase):
    @patch.dict("os.environ", {}, clear=True)
    def test_missing_api_key(self):
        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertFalse(success)
        self.assertEqual(places, [])
        self.assertIn("configuration error", err.lower())

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_successful_search_with_places(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "places": [
                {
                    "id": "places/ChIJ12345",
                    "displayName": {"text": "Primary Health Centre Alpha"},
                    "formattedAddress": "Main Road, Bengaluru, Karnataka 560001",
                    "location": {"latitude": 12.9720, "longitude": 77.5950},
                    "nationalPhoneNumber": "080 2222 3333",
                    "types": ["clinic", "health"],
                    "primaryType": "clinic",
                    "googleMapsUri": "https://maps.google.com/?cid=123",
                }
            ]
        }
        mock_post.return_value = mock_resp

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertTrue(success)
        self.assertIsNone(err)
        self.assertEqual(len(places), 1)
        self.assertEqual(places[0]["displayName"]["text"], "Primary Health Centre Alpha")

        # Verify request headers and URL
        call_args = mock_post.call_args
        self.assertEqual(call_args[0][0], PLACES_NEARBY_SEARCH_URL)
        headers = call_args[1]["headers"]
        self.assertEqual(headers["X-Goog-Api-Key"], "test_fake_api_key")
        self.assertIn("places.displayName", headers["X-Goog-FieldMask"])

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_empty_places_response(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {}
        mock_post.return_value = mock_resp

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertTrue(success)
        self.assertIsNone(err)
        self.assertEqual(places, [])

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_http_400_bad_request(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_post.return_value = mock_resp

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertFalse(success)
        self.assertEqual(places, [])
        self.assertIn("temporarily unavailable", err)

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_http_401_unauthorized(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 401
        mock_post.return_value = mock_resp

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertFalse(success)
        self.assertEqual(places, [])

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_http_403_forbidden(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 403
        mock_post.return_value = mock_resp

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertFalse(success)
        self.assertEqual(places, [])

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_http_429_transient_retry_success(self, mock_post):
        mock_429 = MagicMock()
        mock_429.status_code = 429

        mock_200 = MagicMock()
        mock_200.status_code = 200
        mock_200.json.return_value = {"places": [{"id": "places/ChIJ1"}]}

        mock_post.side_effect = [mock_429, mock_200]

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertTrue(success)
        self.assertEqual(len(places), 1)
        self.assertEqual(mock_post.call_count, 2)

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_http_500_server_error(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 500
        mock_post.return_value = mock_resp

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertFalse(success)
        self.assertEqual(places, [])

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_timeout_handling(self, mock_post):
        mock_post.side_effect = requests.exceptions.ReadTimeout("Read timeout")

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertFalse(success)
        self.assertEqual(places, [])

    @patch.dict("os.environ", {"GOOGLE_MAPS_API_KEY": "test_fake_api_key"})
    @patch("requests.Session.post")
    def test_connection_error_handling(self, mock_post):
        mock_post.side_effect = requests.exceptions.ConnectionError("Connection refused")

        success, places, err = search_nearby_places(12.9716, 77.5946, radius=5000)
        self.assertFalse(success)
        self.assertEqual(places, [])


if __name__ == "__main__":
    unittest.main()
