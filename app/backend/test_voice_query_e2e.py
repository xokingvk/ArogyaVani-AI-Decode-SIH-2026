import base64
import io
from fastapi.testclient import TestClient
from main import app
from services.sarvam_service import generate_tts_base64

client = TestClient(app)

print("=" * 60)
print("TEST: End-to-End POST /voice-query with Audio")
print("=" * 60)

# Step 1: Generate a test speech audio using Sarvam TTS
prompt_text = "What should I do for a mild cold and fever?"
print(f"Generating test audio with prompt: '{prompt_text}'")
audio_b64 = generate_tts_base64(prompt_text, "en-IN")
raw_audio = base64.b64decode(audio_b64)
print(f"Generated test audio bytes: {len(raw_audio)}")

# Step 2: Post to /voice-query with field 'audio'
files = {
    "audio": ("test_voice.wav", io.BytesIO(raw_audio), "audio/wav")
}

print("Sending audio to /voice-query...")
response = client.post("/voice-query", files=files)

print("Status Code:", response.status_code)
data = response.json()
print("Success:", data.get("success"))
print("Transcript:", data.get("transcript"))
print("Language Code:", data.get("language_code"))
print("Response Text:", data.get("response_text"))
audio_out = data.get("audio_base64", "")
print("Output Audio Base64 Length:", len(audio_out))

assert response.status_code == 200
assert data["success"] is True
assert len(data["transcript"]) > 0
assert len(data["response_text"]) > 0
assert len(audio_out) > 100
print("\nEnd-to-end voice query test PASSED! [OK]")
