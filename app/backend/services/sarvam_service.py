import os
import re
import logging
from typing import Any
from sarvamai import SarvamAI
from services.gemini_service import ask_gemini
from services.rag_service import get_rag_service, is_rag_enabled

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

SCHEME_KEYWORDS = [
    "scheme",
    "yojana",
    "ayushman",
    "pmjay",
    "pm-jay",
    "pmmvy",
    "jsy",
    "jssk",
    "pmsma",
    "rbsk",
    "pmjjby",
    "pmgkay",
    "pmay",
    "pmayg",
    "indradhanush",
    "health card",
    "ration card",
    "health insurance",
    "maternity benefit",
    "pregnant women scheme",
    "child scheme",
    "children scheme",
    "free delivery",
    "cashless delivery",
    "government healthcare scheme",
    "government scheme",
    "government health",
    "government assistance",
    "bima yojana",
    "ab-pmjay",
    "eligibility for",
    "eligible for",
    "documents needed for",
    "how to apply",
    "how to access",
]

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
    "headache",
    "stomach",
    "dizzy",
    "pain",
    "phc",
    "health facility",
    "healthcare facility",
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

# ── Conversational & Greeting Intent Keywords ────────────────────────────────

GREETING_MORNING_KEYWORDS = ["good morning", "morning", "subhodhayam", "kaalai vanakkam", "shubh prabhat"]
GREETING_AFTERNOON_KEYWORDS = ["good afternoon", "shubh dopahar", "madhyahna vanakkam"]
GREETING_EVENING_KEYWORDS = ["good evening", "shubh sandhya", "maalai vanakkam", "sayanthra vanakkam"]
GREETING_NIGHT_KEYWORDS = ["good night", "shubh ratri", "iravu vanakkam"]
GREETING_GENERAL_KEYWORDS = [
    "hello",
    "hi",
    "hey",
    "hi there",
    "hello there",
    "namaste",
    "namaskar",
    "vanakkam",
    "namaskaram",
    "namaskara",
    "greetings",
]

IDENTITY_KEYWORDS = [
    "what is your name",
    "what's your name",
    "tell me your name",
    "may i know your name",
    "who are you",
    "what are you",
    "are you an ai",
    "are you a robot",
    "are you ai",
    "are you robot",
    "introduce yourself",
]

CAPABILITY_KEYWORDS = [
    "what can you do",
    "what do you do",
    "how can you help me",
    "can you help me",
    "how can you assist me",
    "what help can you provide",
    "what are your features",
    "how to use this",
    "how does this work",
]

CASUAL_KEYWORDS = [
    "how are you",
    "how are you doing",
    "are you fine",
    "are you okay",
    "how do you do",
    "nice to meet you",
    "pleasure to meet you",
]

THANKS_KEYWORDS = [
    "thank you",
    "thanks",
    "thank you very much",
    "thanks a lot",
    "thank you so much",
    "many thanks",
    "dhanyavad",
    "nandri",
    "dhanyavadamulu",
]

GOODBYE_KEYWORDS = [
    "bye",
    "goodbye",
    "good bye",
    "see you",
    "see you later",
    "bye bye",
    "take care",
    "alvida",
]

# ── Conversational Responses (English Base) ──────────────────────────────────

GREETING_MORNING_RESPONSE = (
    "Good morning! I am ArogyaVani AI, your healthcare voice assistant. "
    "How can I help you with your health or government schemes today?"
)

GREETING_AFTERNOON_RESPONSE = (
    "Good afternoon! I am ArogyaVani AI, your healthcare voice assistant. "
    "How can I assist you with healthcare guidance or government health schemes today?"
)

GREETING_EVENING_RESPONSE = (
    "Good evening! I am ArogyaVani AI, your healthcare voice assistant. "
    "How can I assist you with your health questions or schemes today?"
)

GREETING_NIGHT_RESPONSE = (
    "Good night! Wishing you good health and restful sleep. "
    "I am here whenever you need healthcare or government scheme assistance."
)

GREETING_GENERAL_RESPONSE = (
    "Hello! I am ArogyaVani AI, your voice healthcare assistant. "
    "How can I help you today with healthcare guidance or government schemes?"
)

IDENTITY_RESPONSE = (
    "I am ArogyaVani AI, a voice healthcare assistant designed for citizens across India. "
    "I help you understand health symptoms, locate nearby PHCs and hospitals, "
    "and discover government health schemes like Ayushman Bharat PM-JAY and Janani Suraksha Yojana."
)

CAPABILITY_RESPONSE = (
    "I can help you with basic health symptom guidance, locating nearby healthcare facilities and PHCs, "
    "checking your eligibility for government health schemes, and answering questions about maternal, child, "
    "and family health programs."
)

CASUAL_RESPONSE = (
    "I am doing well, thank you for asking! I am ready to help you with any healthcare questions, "
    "symptoms, or government health schemes."
)

THANKS_RESPONSE = (
    "You're very welcome! Please feel free to ask if you need any more healthcare guidance "
    "or scheme information. Take good care of your health!"
)

GOODBYE_RESPONSE = (
    "Goodbye! Take care of your health, and feel free to talk to me anytime you need healthcare help."
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
    """Matches keywords with word-boundary awareness to avoid substring false positives."""
    text_clean = re.sub(r"[^\w\s]", " ", text.lower()).strip()
    words = set(text_clean.split())
    for keyword in keywords:
        kw_clean = re.sub(r"[^\w\s]", " ", keyword.lower()).strip()
        if " " in kw_clean:
            if kw_clean in text_clean:
                return True
        else:
            if kw_clean in words:
                return True
    return False


def get_conversational_response(english_text: str) -> str:
    """Returns the appropriate conversational reply based on sub-intent."""
    if contains_keyword(english_text, GREETING_MORNING_KEYWORDS):
        return GREETING_MORNING_RESPONSE
    if contains_keyword(english_text, GREETING_AFTERNOON_KEYWORDS):
        return GREETING_AFTERNOON_RESPONSE
    if contains_keyword(english_text, GREETING_EVENING_KEYWORDS):
        return GREETING_EVENING_RESPONSE
    if contains_keyword(english_text, GREETING_NIGHT_KEYWORDS):
        return GREETING_NIGHT_RESPONSE
    if contains_keyword(english_text, IDENTITY_KEYWORDS):
        return IDENTITY_RESPONSE
    if contains_keyword(english_text, CAPABILITY_KEYWORDS):
        return CAPABILITY_RESPONSE
    if contains_keyword(english_text, CASUAL_KEYWORDS):
        return CASUAL_RESPONSE
    if contains_keyword(english_text, THANKS_KEYWORDS):
        return THANKS_RESPONSE
    if contains_keyword(english_text, GOODBYE_KEYWORDS):
        return GOODBYE_RESPONSE
    return GREETING_GENERAL_RESPONSE


def is_conversational_query(english_text: str) -> bool:
    """Checks if the text contains conversational or greeting patterns."""
    return any(
        contains_keyword(english_text, kw_list)
        for kw_list in [
            GREETING_MORNING_KEYWORDS,
            GREETING_AFTERNOON_KEYWORDS,
            GREETING_EVENING_KEYWORDS,
            GREETING_NIGHT_KEYWORDS,
            GREETING_GENERAL_KEYWORDS,
            IDENTITY_KEYWORDS,
            CAPABILITY_KEYWORDS,
            CASUAL_KEYWORDS,
            THANKS_KEYWORDS,
            GOODBYE_KEYWORDS,
        ]
    )


def detect_intent(english_text: str) -> str:
    """Detect the user intent following the strict ArogyaVani routing hierarchy:
    1. medical_advice (highest safety priority)
    2. location
    3. scheme (routes to grounded FAISS RAG)
    4. healthcare (routes to general Gemini health flow)
    5. conversational / greeting (routes to friendly conversational response)
    6. out_of_scope
    """
    if contains_keyword(english_text, MEDICAL_ADVICE_KEYWORDS):
        return "medical_advice"

    if contains_keyword(english_text, LOCATION_KEYWORDS):
        return "location"

    if contains_keyword(english_text, SCHEME_KEYWORDS):
        return "scheme"

    if contains_keyword(english_text, HEALTHCARE_KEYWORDS):
        return "healthcare"

    if is_conversational_query(english_text):
        return "conversational"

    return "out_of_scope"



# ── Clean text helpers for Display and Natural TTS ──────────────────────────


def clean_for_speech(text: str) -> str:
    """Strips Markdown symbols, raw URLs, and formatting artifacts for clean,
    natural-sounding Text-To-Speech (Sarvam Bulbul TTS).
    Never speaks 'asterisk asterisk', 'hash', 'bullet', or raw URL characters.
    """
    if not text:
        return ""

    t = text

    # 1. Markdown links: [Title](url) -> Title (FIRST, before URL stripping)
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)

    # 2. Strip remaining naked URLs (https://..., http://..., www....)
    t = re.sub(r"https?://\S+|www\.\S+", "", t)

    # 3. Headings: ### Heading -> Heading.
    t = re.sub(r"^#{1,6}\s*(.+)$", r"\1.", t, flags=re.MULTILINE)

    # 4. Bold / Italic / Strike / Code markers
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
    t = re.sub(r"\*([^*]+)\*", r"\1", t)
    t = re.sub(r"__([^_]+)__", r"\1", t)
    t = re.sub(r"_([^_]+)_", r"\1", t)
    t = re.sub(r"~~([^~]+)~~", r"\1", t)
    t = re.sub(r"`([^`]+)`", r"\1", t)

    # 5. Bullet markers (- item, * item, + item, • item)
    t = re.sub(r"^\s*[-*+•]\s+", "", t, flags=re.MULTILINE)

    # 6. Numbered lists (1. item -> item)
    t = re.sub(r"^\s*\d+\.\s+", "", t, flags=re.MULTILINE)

    # 7. Clean punctuation & excessive whitespace
    t = re.sub(r"\.{2,}", ".", t)
    t = re.sub(r"\s+", " ", t)

    return t.strip()


def clean_for_display(text: str) -> str:
    """Prepares text for clean UI display:
    - Converts markdown links [Title](url) -> Title
    - Strips naked URLs to prevent uncurated links
    - Preserves headings and bullets for visual structure
    """
    if not text:
        return ""

    t = text
    # 1. Convert [Title](url) -> Title
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    # 2. Strip naked URLs
    t = re.sub(r"https?://\S+|www\.\S+", "", t)
    # 3. Clean whitespace while preserving linebreaks
    t = re.sub(r"[ \t]+", " ", t)

    return t.strip()


# ── Translation & Speech Pipeline ───────────────────────────────────────────


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
    # Ensure TTS input is clean of markdown artifacts
    speech_text = clean_for_speech(text)
    if not speech_text:
        speech_text = "I am ready to assist you."

    client = get_sarvam_client()
    tts_response = client.text_to_speech.convert(
        text=speech_text,
        language_code=language_code,
        model=TTS_MODEL,
        speaker=TTS_SPEAKER,
    )

    if not tts_response.audios:
        raise RuntimeError("Sarvam Bulbul returned no audio data.")

    return tts_response.audios[0]


def process_arogyavani_pipeline(
    user_text: str,
    detected_language: str,
) -> tuple[str, str, str, str, list[dict[str, Any]], list[dict[str, Any]]]:
    """Full ArogyaVani intelligence pipeline with RAG & General Routing:
    1. Translate to English for routing
    2. Route to:
       - medical_advice -> Safety disclaimer (General mode)
       - location -> Location prompt (General mode)
       - scheme -> FAISS RAG Retrieval + Grounded Gemini (Scheme RAG mode)
       - healthcare -> Gemini 3.5 Flash-Lite (General mode)
       - out_of_scope -> Scope boundary (General mode)
    3. Format and clean text for display (response_text) and speech (TTS)
    4. Translate response back to user language if needed
    5. Generate Bulbul v3 TTS audio with clean speech text
    Returns: (english_text, final_response_text, audio_base64, mode, schemes, sources)
    """
    logger.info(f"User query: '{user_text}' in language: '{detected_language}'")

    # Step 1: Translate to English for routing
    english_text = translate_to_english(user_text, detected_language)
    logger.info(f"English routing text: '{english_text}'")

    # Step 2: Intent detection
    intent = detect_intent(english_text)
    logger.info(f"Detected intent: '{intent}'")

    mode = "general"
    schemes: list[dict[str, Any]] = []
    sources: list[dict[str, Any]] = []

    # Step 3: Intent routing
    if intent == "medical_advice":
        raw_response_text = MEDICAL_SAFETY_RESPONSE
    elif intent == "location":
        raw_response_text = LOCATION_RESPONSE
    elif intent == "scheme":
        if is_rag_enabled():
            mode = "scheme_rag"
            rag_service = get_rag_service()
            rag_res = rag_service.answer(english_text, language_code=detected_language)
            raw_response_text = rag_res["answer"]
            schemes = rag_res.get("schemes", [])
            sources = rag_res.get("sources", [])
        else:
            mode = "general"
            raw_response_text = ask_gemini(english_text)
            schemes = []
            sources = []
    elif intent == "healthcare":
        raw_response_text = ask_gemini(english_text)
    elif intent == "conversational":
        raw_response_text = get_conversational_response(english_text)
    else:
        raw_response_text = OUT_OF_SCOPE_RESPONSE

    # Step 4: Clean text for UI display
    display_response_text = clean_for_display(raw_response_text)

    # Step 5: Translate back to detected language if needed and not already translated
    if detected_language != "en-IN" and mode != "scheme_rag":
        final_response = translate_from_english(display_response_text, detected_language)
    else:
        final_response = display_response_text

    logger.info(f"ArogyaVani final response: '{final_response}', mode: '{mode}'")

    # Step 6: Bulbul TTS with clean speech text
    audio_base64 = generate_tts_base64(final_response, detected_language)

    return english_text, final_response, audio_base64, mode, schemes, sources
