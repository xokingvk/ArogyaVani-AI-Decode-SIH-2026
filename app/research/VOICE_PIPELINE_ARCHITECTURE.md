# ArogyaVani Voice Backend

This backend exposes only one application endpoint:

POST /voice-query

Flow:

audio -> Sarvam Saaras v3 STT -> language detection
-> Sarvam translation to English (when needed)
-> safety router -> Gemini
-> Sarvam translation back to user's language
-> Sarvam Bulbul v3 TTS
-> JSON response with transcript, response text and base64 WAV audio

Also available:

GET /health

## Environment variables

GEMINI_API_KEY
SARVAM_API_KEY

Do not put API keys in the Android app.

## Run locally

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

## Request

Send multipart/form-data with field name:

file

The file must be an audio file.

## Response

{
  "success": true,
  "transcript": "...",
  "language_code": "en-IN",
  "response_text": "...",
  "audio_base64": "...",
  "audio_content_type": "audio/wav"
}

No RAG, database, text-query endpoint, or Colab microphone code is included.
