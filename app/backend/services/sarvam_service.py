import os
import logging
from sarvamai import SarvamAI
from services.gemini_service import ask_gemini

logger = logging.getLogger(__name__)

STT_MODEL = "saaras:v3"
TTS_MODEL = "bulbul:v3"
TTS_SPEAKER = "priya"

SUPPORTED_LANGUAGES = {
    "as-IN",
    "bn-IN",
    "brx-IN",
    "doi-IN",
    "gu-IN",
    "hi-IN",
    "kn-IN",
    "kok-IN",
    "ks-IN",
    "mai-IN",
    "ml-IN",
    "mni-IN",
    "mr-IN",
    "ne-IN",
    "od-IN",
    "pa-IN",
    "sa-IN",
    "sat-IN",
    "sd-IN",
    "ta-IN",
    "te-IN",
    "ur-IN",
    "en-IN",
}

HEALTHCARE_KEYWORDS = [
    "health",
    "healthcare",
    "hospital",
    "clinic",
    "doctor",
    "medical",
    "medicine",
    "symptom",
    "cold",
    "fever",
    "cough",
    "scheme",
    "ayushman",
    "pmjay",
    "phc",
    "health facility",
    "healthcare facility",
    "government health",
    "healthcare scheme",
    "eligibility",
    "health card",
    "ration card",
    "health insurance",
]

LOCATION_KEYWORDS = [
    "near me",
    "nearby",
    "nearest",
    "closest",
    "around me",
    "near my location",
    "near my area",
    "hospital near",
    "hospital nearby",
    "nearest hospital",
    "closest hospital",
    "phc near",
    "phc nearby",
    "nearest phc",
    "clinic near",
    "clinic nearby",
    "nearest clinic",
    "healthcare near",
    "healthcare nearby",
    "health facility near",
    "health facility nearby",
]

MEDICAL_ADVICE_KEYWORDS = [
    "diagnose me",
    "diagnose this",
    "what disease do i have",
    "which disease do i have",
    "tell me my disease",
    "what medicine should i take",
    "which medicine should i take",
    "what tablet should i take",
    "which tablet should i take",
    "what dosage should i take",
    "what dose should i take",
    "how much medicine should i take",
    "prescribe medicine",
    "give me a prescription",
    "what treatment should i take",
    "which treatment should i take",
    "what should i take for",
    "what medicine can i take",
]

MEDICAL_SAFETY_RESPONSE = (
    "I'm sorry, but I cannot provide a diagnosis, prescribe medicines, "
    "or recommend medical treatments. I can help you with healthcare "
    "services, government health schemes, and healthcare facilities. "
    "For medical advice, please consult a qualified healthcare professional."
)

LOCATION_RESPONSE = (
    "Sure, I can help you find a nearby healthcare facility. "
    "Please provide your location or allow location access so I can "
    "help identify the nearest suitable hospital, PHC, or healthcare facility."
)

OUT_OF_SCOPE_RESPONSE = (
    "I'm sorry, I can only assist with healthcare access, government "
    "health schemes, and healthcare facilities. Please ask me something "
    "related to healthcare services or schemes."
)

_sarvam_client = None


def get_sarvam_client() -> SarvamAI:
    global _sarvam_client
    if _sarvam_client is None:
        api_key = os.getenv("SARVAM_API_KEY")
        if not api_key:
            raise RuntimeError("SARVAM_API_KEY environment variable is not set.")
        _sarvam_client = SarvamAI(api_subscription_key=api_key)
    return _sarvam_client


def contains_keyword(text: str, keywords: list[str]) -> bool:
    text_lower = text.lower().strip()
    return any(keyword in text_lower for keyword in keywords)


def detect_intent(english_text: str) -> str:
    """Detect the user intent following the strict ArogyaVani routing hierarchy:
    1. medical_advice (highest priority)
    2. location
    3. healthcare
    4. out_of_scope
    """
    if contains_keyword(english_text, MEDICAL_ADVICE_KEYWORDS):
        return "medical_advice"

    if contains_keyword(english_text, LOCATION_KEYWORDS):
        return "location"

    if contains_keyword(english_text, HEALTHCARE_KEYWORDS):
        return "healthcare"

    return "out_of_scope"


def translate_to_english(text: str, language_code: str) -> str:
    if not text or not text.strip():
        return ""
    if language_code == "en-IN":
        return text.strip()

    client = get_sarvam_client()
    response = client.text.translate(
        input=text,
        source_language_code=language_code,
        target_language_code="en-IN",
    )
    return response.translated_text.strip()


def translate_from_english(text: str, target_language: str) -> str:
    if not text or not text.strip():
        return ""
    if target_language == "en-IN":
        return text.strip()

    client = get_sarvam_client()
    response = client.text.translate(
        input=text,
        source_language_code="en-IN",
        target_language_code=target_language,
    )
    return response.translated_text.strip()


def transcribe_audio(audio_file_path: str) -> tuple[str, str]:
    """Transcribe audio using Sarvam Saaras v3 in transcribe mode."""
    client = get_sarvam_client()
    with open(audio_file_path, "rb") as audio_file:
        stt_response = client.speech_to_text.transcribe(
            file=audio_file,
            model=STT_MODEL,
            mode="transcribe",
        )

    user_text = (stt_response.transcript or "").strip()
    detected_language = stt_response.language_code or "en-IN"

    return user_text, detected_language


def generate_tts_base64(text: str, language_code: str) -> str:
    """Generate audio via Sarvam Bulbul v3 with speaker 'priya' and return Base64 WAV data."""
    client = get_sarvam_client()
    tts_response = client.text_to_speech.convert(
        text=text,
        language_code=language_code,
        model=TTS_MODEL,
        speaker=TTS_SPEAKER,
    )

    if not tts_response.audios:
        raise RuntimeError("Sarvam Bulbul returned no audio data.")

    return tts_response.audios[0]


def process_arogyavani_pipeline(user_text: str, detected_language: str) -> tuple[str, str, str]:
    """Full ArogyaVani intelligence pipeline:
    1. Translate to English for routing
    2. Route to medical safety / location / healthcare (Gemini) / out_of_scope
    3. Translate response back to user language
    4. Generate Bulbul v3 TTS audio
    Returns: (english_text, final_response_text, audio_base64)
    """
    logger.info(f"User query: '{user_text}' in language: '{detected_language}'")

    # Step 1: Translate to English for routing
    english_text = translate_to_english(user_text, detected_language)
    logger.info(f"English routing text: '{english_text}'")

    # Step 2: Intent detection
    intent = detect_intent(english_text)
    logger.info(f"Detected intent: '{intent}'")

    # Step 3: Intent routing
    if intent == "medical_advice":
        response_text = MEDICAL_SAFETY_RESPONSE
    elif intent == "location":
        response_text = LOCATION_RESPONSE
    elif intent == "healthcare":
        response_text = ask_gemini(english_text)
    else:
        response_text = OUT_OF_SCOPE_RESPONSE

    logger.info(f"ArogyaVani English response: '{response_text}'")

    # Step 4: Translate back to detected language
    final_response = translate_from_english(response_text, detected_language)
    logger.info(f"Final translated response: '{final_response}'")

    # Step 5: Bulbul TTS
    audio_base64 = generate_tts_base64(final_response, detected_language)

    return english_text, final_response, audio_base64
