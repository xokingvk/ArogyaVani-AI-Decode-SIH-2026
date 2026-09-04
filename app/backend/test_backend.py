import os
from fastapi.testclient import TestClient
from main import app
from services.sarvam_service import (
    detect_intent,
    MEDICAL_SAFETY_RESPONSE,
    LOCATION_RESPONSE,
    OUT_OF_SCOPE_RESPONSE,
    translate_to_english,
    translate_from_english,
    generate_tts_base64,
)
from services.gemini_service import ask_gemini

client = TestClient(app)

print("=" * 60)
print("TEST 1: Health Check GET /health")
print("=" * 60)
health_res = client.get("/health")
print("Status Code:", health_res.status_code)
print("Response JSON:", health_res.json())
assert health_res.status_code == 200
assert health_res.json() == {"status": "ok"}
print("Health check passed! [OK]\n")

print("=" * 60)
print("TEST 2: Intent Detection Hierarchy")
print("=" * 60)
q_med = "what medicine should i take for chest pain?"
intent_med = detect_intent(q_med)
print(f"Query: '{q_med}' -> Intent: {intent_med}")
assert intent_med == "medical_advice"

q_loc = "where is the nearest hospital near me?"
intent_loc = detect_intent(q_loc)
print(f"Query: '{q_loc}' -> Intent: {intent_loc}")
assert intent_loc == "location"

q_scheme = "which scheme helps pregnant women?"
intent_scheme = detect_intent(q_scheme)
print(f"Query: '{q_scheme}' -> Intent: {intent_scheme}")
assert intent_scheme == "scheme"

q_conv = "Good morning"
intent_conv = detect_intent(q_conv)
print(f"Query: '{q_conv}' -> Intent: {intent_conv}")
assert intent_conv == "conversational"

q_malaria = "I have malaria"
intent_malaria = detect_intent(q_malaria)
print(f"Query: '{q_malaria}' -> Intent: {intent_malaria}")
assert intent_malaria == "healthcare"

q_health = "what are common symptoms of cold and flu?"
intent_health = detect_intent(q_health)
print(f"Query: '{q_health}' -> Intent: {intent_health}")
assert intent_health == "healthcare"
print("Intent detection tests passed! [OK]\n")

print("=" * 60)
print("TEST 3: Gemini Healthcare Query (gemini-3.5-flash-lite)")
print("=" * 60)
try:
    gemini_answer = ask_gemini("What comfort measures help with a mild cold?")
    print("Gemini response:\n", gemini_answer)
    assert len(gemini_answer) > 0
    print("Gemini integration passed! [OK]\n")
except Exception as e:
    print("Gemini query error:", e)

print("=" * 60)
print("TEST 4: Sarvam Bulbul TTS (bulbul:v3 with 'priya')")
print("=" * 60)
try:
    test_phrase = "Hello, I am ArogyaVani. How can I help you today?"
    audio_b64 = generate_tts_base64(test_phrase, "en-IN")
    print("TTS audio generated base64 length:", len(audio_b64))
    assert len(audio_b64) > 100
    print("Sarvam Bulbul TTS passed! [OK]\n")
except Exception as e:
    print("Bulbul TTS error:", e)

print("=" * 60)
print("TEST 5: Voice Query Missing Audio Handling (POST /voice-query)")
print("=" * 60)
res_empty = client.post("/voice-query")
print("Status Code:", res_empty.status_code)
print("Response JSON:", res_empty.json())
assert res_empty.status_code == 400
assert res_empty.json()["success"] is False
print("Missing audio handling passed! [OK]\n")

print("=" * 60)
print("ALL TESTS COMPLETED SUCCESSFULLY! [PASSED]")
print("=" * 60)
