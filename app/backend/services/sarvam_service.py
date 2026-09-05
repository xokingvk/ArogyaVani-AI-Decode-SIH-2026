import os
import re
import logging
from typing import Any, Optional
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
    "which scheme helps",
    "which scheme is for",
    "scheme for pregnant",
    "schemes for pregnant",
    "scheme for children",
    "schemes for children",
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
    "find a nearby",
    "find a hospital",
    "find a phc",
    "find a clinic",
    "locate a hospital",
    "locate a phc",
    "locate a clinic",
]

MEDICAL_ADVICE_KEYWORDS = [
    "diagnose me",
    "diagnose this",
    "diagnose my symptoms",
    "diagnose my disease",
    "diagnose whether",
    "diagnose if",
    "do i have",
    "what disease do i have",
    "which disease do i have",
    "tell me my disease",
    "what medicine should i take",
    "which medicine should i take",
    "what tablet should i take",
    "which tablet should i take",
    "what pill should i take",
    "what drug should i take",
    "which drug should i take",
    "what dosage should i take",
    "what dose should i take",
    "how much paracetamol",
    "how much medicine",
    "how much tablet",
    "give me the dosage",
    "prescribe medicine",
    "give me a prescription",
    "prescribe me",
    "write a prescription",
    "what treatment should i take",
    "which treatment should i take",
    "what should i take for",
    "what medicine can i take",
    "what tablet can i take",
    "which antibiotic should i take",
    "what antibiotic should i take",
    "tell me exactly what treatment i need",
    "exact treatment for",
]

MEDICAL_SAFETY_RESPONSE = (
    "I am sorry, but I cannot provide a medical diagnosis, prescribe medicines, "
    "or recommend specific drug dosages. I can help you with general healthcare information, "
    "government health schemes, and finding healthcare facilities. "
    "For medical advice and prescriptions, please consult a qualified healthcare professional."
)

LOCATION_RESPONSE = (
    "Sure, I can help you find a nearby healthcare facility. "
    "Please provide your location or allow location access so I can "
    "help identify the nearest suitable hospital, PHC, or healthcare facility."
)

OUT_OF_SCOPE_RESPONSE = (
    "I'm sorry, I can only assist with healthcare access, health guidance, government "
    "health schemes, and healthcare facilities. Please ask me something "
    "related to health services or schemes."
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
    "How can I help you with your health questions or government schemes today?"
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


def is_pure_conversational(english_text: str) -> bool:
    """Checks if the text is purely a conversational greeting, identity, capability,
    casual check-in, thanks, or goodbye query WITHOUT any additional health condition,
    symptom, or scheme inquiry.
    Example:
      'Good morning' -> True
      'Hello' -> True
      'How are you?' -> True
      'Good morning, I have fever' -> False (contains 'fever', routes to healthcare)
      'Hi, what is malaria?' -> False (contains 'malaria', routes to healthcare)
    """
    all_conv_lists = [
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

    has_conv = any(contains_keyword(english_text, kw_list) for kw_list in all_conv_lists)
    if not has_conv:
        return False

    # Strip out conversational phrases to check if significant substantive text remains
    cleaned = english_text.lower()
    for kw_list in all_conv_lists:
        for kw in sorted(kw_list, key=len, reverse=True):
            # Replace whole phrase
            pattern = r"\b" + re.escape(kw) + r"\b"
            cleaned = re.sub(pattern, " ", cleaned)

    # Clean punctuation and non-alphanumeric characters
    cleaned = re.sub(r"[^\w\s]", " ", cleaned)
    tokens = [w for w in cleaned.split() if w not in {"and", "then", "please", "there", "a", "an", "the", "to", "you", "me", "i", "my", "is", "it", "for"}]

    # If no substantive tokens remain, it is purely conversational
    return len(tokens) == 0


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


def detect_intent(english_text: str) -> str:
    """Detect user intent following the strict ArogyaVani routing hierarchy:
    1. medical_advice (highest safety priority — refuses diagnoses, prescriptions, dosage)
    2. location (routes to facility/PHC locator)
    3. scheme (routes to grounded FAISS RAG / scheme catalog)
    4. conversational (pure greetings / identity / capability checks ONLY)
    5. healthcare (broad fallback — routes all health questions, symptoms, conditions to Gemini)
    6. out_of_scope (only if genuinely empty or rejected)
    """
    if not english_text or not english_text.strip():
        return "out_of_scope"

    # Priority 1: Medical advice / prescription / diagnosis check (STRICT SAFETY)
    if contains_keyword(english_text, MEDICAL_ADVICE_KEYWORDS):
        return "medical_advice"

    # Priority 2: Location queries (hospitals, PHCs, clinics near me)
    if contains_keyword(english_text, LOCATION_KEYWORDS):
        return "location"

    # Priority 3: Government health scheme queries
    if contains_keyword(english_text, SCHEME_KEYWORDS):
        return "scheme"

    # Priority 4: Pure conversational / greeting queries
    if is_pure_conversational(english_text):
        return "conversational"

    # Priority 5: Broad Healthcare fallback
    # Routes all valid health conditions (malaria, dengue, typhoid, asthma, diabetes, fever,
    # sore throat, stomach pain, dizziness, weakness, rashes, general health inquiries, etc.)
    # to Gemini 3.5 Flash-Lite with the ArogyaVani safety system prompt.
    return "healthcare"


# ── Shared Response Normalization Pipeline ──────────────────────────────────


def normalize_response_text(text: str) -> str:
    """Shared core normalization pipeline for cleaning AI-generated response text:
    - Converts markdown links [Title](url) -> Title
    - Strips naked URLs (https://..., http://..., www....)
    - Strips markdown headings (###, ##, #) and converts heading lines to plain titles
    - Strips horizontal rules (---, ***, ___)
    - Strips bold/italic markers (***bold italic***, **bold**, *italic*, __bold__, _italic_)
    - Strips inline code (`code`) and code blocks (```code```)
    - Strips strikethrough (~~text~~)
    - Strips stray markdown asterisks (*, **, ***), hashes (#, ##, ###), and backticks
    - Converts markdown bullet markers (-, *, +, •) at line start into clean lines
    - Preserves normal grammatical punctuation (. , ? ! : ; ( ) % -)
    - Cleans excessive whitespace while preserving natural paragraph structure.
    """
    if not text:
        return ""

    t = text

    # 1. Convert markdown links [Title](url) -> Title
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)

    # 2. Strip naked URLs
    t = re.sub(r"https?://\S+|www\.\S+", "", t)

    # 3. Strip code blocks ```...``` and inline code `...`
    t = re.sub(r"```[\s\S]*?```", "", t)
    t = re.sub(r"`([^`]+)`", r"\1", t)
    t = re.sub(r"`+", "", t)

    # 4. Strip horizontal rules on their own lines (---, ***, ___, ===)
    t = re.sub(r"^\s*[-*_=\s]{3,}\s*$", "", t, flags=re.MULTILINE)

    # 5. Convert markdown headings:
    # '### 1. Title' -> '1. Title' or '### Heading' -> 'Heading'
    # Isolated lines of just '###' or '##' or '#' -> removed
    t = re.sub(r"^\s*#{1,6}\s*$", "", t, flags=re.MULTILINE)
    t = re.sub(r"^\s*#{1,6}\s+(.+)$", r"\1", t, flags=re.MULTILINE)

    # 6. Strip bold, italic, bold-italic, and strikethrough markdown delimiters
    # ***text*** or ___text___ -> text
    t = re.sub(r"\*{3}([^*]+)\*{3}", r"\1", t)
    t = re.sub(r"_{3}([^_]+)_{3}", r"\1", t)
    # **text** or __text__ -> text
    t = re.sub(r"\*{2}([^*]+)\*{2}", r"\1", t)
    t = re.sub(r"_{2}([^_]+)_{2}", r"\1", t)
    # *text* or _text_ -> text
    t = re.sub(r"\*([^*]+)\*", r"\1", t)
    t = re.sub(r"(?<!\w)_([^_]+)_(?!\w)", r"\1", t)
    # ~~text~~ -> text
    t = re.sub(r"~~([^~]+)~~", r"\1", t)

    # 7. Strip any remaining stray formatting asterisks, hashes, underscores, or tildes
    t = re.sub(r"\*{2,}", "", t)
    t = re.sub(r"(?<=\s)\*(?=\s)", "", t)
    t = re.sub(r"^#{1,6}\s*", "", t, flags=re.MULTILINE)

    # 8. Clean trailing markdown symbols or orphaned asterisks at word boundaries
    t = re.sub(r"\*+", "", t)
    t = re.sub(r"~+", "", t)

    # 9. Clean excessive blank lines (more than 2 consecutive newlines)
    t = re.sub(r"\n{3,}", "\n\n", t)

    # 10. Clean horizontal whitespace per line while preserving line breaks
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in t.split("\n")]
    # Remove empty lines at start and end
    t = "\n".join(lines).strip()

    return t


def ensure_sentence_completeness(text: str) -> str:
    """Ensures that the text does not end on a broken, unfinished clause.
    If the text was truncated mid-sentence by token bounds, trims back to the
    last complete sentence terminating with '.', '!', or '?'.
    """
    if not text:
        return ""

    t = text.strip()
    # If it already ends with standard sentence punctuation, return it
    if t.endswith((".", "!", "?")):
        return t

    # Search for the last complete sentence boundary
    last_punct = max(t.rfind("."), t.rfind("!"), t.rfind("?"))
    if last_punct != -1 and last_punct >= len(t) * 0.4:
        # Trim back to the complete sentence
        return t[: last_punct + 1].strip()

    # If no sentence boundary found in the latter half, append a period cleanly
    return t + "."


def clean_for_display(text: str) -> str:
    """Prepares text for clean, elegant UI presentation:
    - Removes all markdown symbols (**, ***, ###, ##, #, ---, `, ~~)
    - Converts markdown links to plain text
    - Strips naked URLs
    - Normalizes list bullet points to clean indentation / readable lines
    - Preserves readable paragraph breaks
    - Strictly preserves complete sentences <= 69 words
    """
    if not text:
        return ""

    t = normalize_response_text(text)

    # Clean bullet markers at line starts (- , * , + , • ) -> clean plain line
    lines = t.split("\n")
    cleaned_lines = []
    for line in lines:
        l = line.strip()
        if not l:
            cleaned_lines.append("")
            continue
        # Remove bullet symbols at start of line
        l = re.sub(r"^[-*+•]\s+", "", l)
        cleaned_lines.append(l)

    t = "\n".join(cleaned_lines)
    t = re.sub(r"\n{3,}", "\n\n", t).strip()

    # Final safeguard: if word count exceeds 69, preserve complete sentences only
    words = re.findall(r"\S+", t)
    if len(words) > 69:
        sentences = re.split(r"(?<=[.!?])\s+", t)
        candidate = []
        curr = 0
        for s in sentences:
            s_clean = s.strip()
            if not s_clean:
                continue
            w_count = len(re.findall(r"\S+", s_clean))
            if curr + w_count <= 69:
                candidate.append(s_clean)
                curr += w_count
            else:
                break
        if candidate:
            t = " ".join(candidate).strip()

    return t.strip()


def clean_for_speech(text: str) -> str:
    """Produces natural spoken text suitable for Sarvam Bulbul TTS ('priya'):
    - Strips all markdown symbols, headings, and formatting artifacts
    - Converts bullet/item lists into natural spoken flow
    - Strips list numbers (1. item -> item)
    - Cleans punctuation for natural spoken cadence
    - Strictly respects <= 69 words and ensures sentence completeness
    """
    if not text:
        return ""

    t = normalize_response_text(text)

    # Split into lines to convert bullet lists into smooth spoken sentences
    lines = [l.strip() for l in t.split("\n") if l.strip()]
    spoken_segments = []

    for line in lines:
        # Strip bullet prefixes (- item, * item, + item, • item)
        l = re.sub(r"^[-*+•]\s+", "", line)
        # Strip leading numbers (1. item -> item, 1) item -> item)
        l = re.sub(r"^\d+[\.\)]\s*", "", l)
        l = l.strip()
        if l:
            # Ensure line ends with punctuation if it is a complete thought
            if not l.endswith((".", "!", "?", ":", ";", ",")):
                l = l + "."
            spoken_segments.append(l)

    spoken_text = " ".join(spoken_segments)

    # Clean multiple consecutive punctuation marks (e.g. '..', '...', ':.')
    spoken_text = re.sub(r"\.{2,}", ".", spoken_text)
    spoken_text = re.sub(r"([!?,;])\1+", r"\1", spoken_text)
    spoken_text = re.sub(r"\s+", " ", spoken_text).strip()

    # Final safeguard: if word count exceeds 69, preserve complete sentences only
    words = re.findall(r"\S+", spoken_text)
    if len(words) > 69:
        sentences = re.split(r"(?<=[.!?])\s+", spoken_text)
        candidate = []
        curr = 0
        for s in sentences:
            s_clean = s.strip()
            if not s_clean:
                continue
            w_count = len(re.findall(r"\S+", s_clean))
            if curr + w_count <= 69:
                candidate.append(s_clean)
                curr += w_count
            else:
                break
        if candidate:
            spoken_text = " ".join(candidate).strip()

    # Ensure sentence completeness
    spoken_text = ensure_sentence_completeness(spoken_text)

    return spoken_text


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
    """Generate audio via Sarvam Bulbul v3 with speaker 'priya' and return Base64 WAV data.
    Ensures input is thoroughly cleaned for natural, complete speech without markdown artifacts.
    Includes diagnostic logging for character counts, audio size, and language code.
    """
    speech_text = clean_for_speech(text)
    if not speech_text:
        speech_text = "I am ready to assist you with healthcare guidance and government schemes."

    char_count = len(speech_text)
    logger.info(
        f"[SarvamTTS] Starting TTS synthesis: model='{TTS_MODEL}', speaker='{TTS_SPEAKER}', "
        f"lang='{language_code}', input_chars={char_count}"
    )

    client = get_sarvam_client()
    tts_response = client.text_to_speech.convert(
        text=speech_text,
        language_code=language_code,
        model=TTS_MODEL,
        speaker=TTS_SPEAKER,
    )

    if not tts_response.audios or len(tts_response.audios) == 0:
        logger.error("[SarvamTTS] Bulbul v3 returned no audio data in response.")
        raise RuntimeError("Sarvam Bulbul returned no audio data.")

    audio_base64 = tts_response.audios[0]
    base64_len = len(audio_base64)
    logger.info(
        f"[SarvamTTS] TTS synthesis successful: output_base64_len={base64_len}, "
        f"approx_audio_bytes={int(base64_len * 0.75)}"
    )

    return audio_base64


def process_text_query(
    user_text: str,
    language_code: str = "en-IN",
    generate_tts: bool = False,
) -> tuple[str, str, Optional[str], str, list[dict[str, Any]], list[dict[str, Any]]]:
    """Shared ArogyaVani intelligence query processor for both Text and Voice endpoints:
    1. Translates input to English for semantic/safety intent routing.
    2. Routes to:
       - medical_advice -> Safety disclaimer (General mode)
       - location -> Location prompt (General mode)
       - scheme -> FAISS RAG Retrieval + Grounded Gemini (Scheme RAG mode)
       - conversational -> Pure greeting / identity / capability response
       - healthcare -> Gemini 3.5 Flash-Lite broad health flow
    3. Cleans text for UI display.
    4. Translates response back to user's specified language.
    5. Optionally generates TTS audio if requested.
    Returns: (english_text, final_response, audio_base64, mode, schemes, sources)
    """
    logger.info(f"Processing query: '{user_text}' in language: '{language_code}', generate_tts={generate_tts}")

    # Step 1: Translate to English for routing
    english_text = translate_to_english(user_text, language_code)
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
            rag_res = rag_service.answer(english_text, language_code=language_code)
            raw_response_text = rag_res["answer"]
            schemes = rag_res.get("schemes", [])
            sources = rag_res.get("sources", [])
        else:
            mode = "general"
            raw_response_text = ask_gemini(english_text)
            schemes = []
            sources = []
    elif intent == "conversational":
        raw_response_text = get_conversational_response(english_text)
    elif intent == "healthcare":
        raw_response_text = ask_gemini(english_text)
    else:
        raw_response_text = OUT_OF_SCOPE_RESPONSE

    # Step 4: Clean text for UI display (strips markdown garbage, bold, hashes, naked URLs)
    display_response_text = clean_for_display(raw_response_text)

    # Step 5: Translate back to target language if needed and not already in that language
    if language_code != "en-IN" and mode != "scheme_rag":
        final_response = translate_from_english(display_response_text, language_code)
        # Re-clean translated text in case translation introduced artifacts
        final_response = clean_for_display(final_response)
    else:
        final_response = display_response_text

    logger.info(f"ArogyaVani final response: '{final_response}', mode: '{mode}'")

    # Step 6: Generate TTS audio if requested
    audio_base64 = None
    if generate_tts:
        try:
            audio_base64 = generate_tts_base64(final_response, language_code)
        except Exception as e:
            logger.warning(f"Failed to generate TTS audio: {e}")
            audio_base64 = None

    return english_text, final_response, audio_base64, mode, schemes, sources


def process_arogyavani_pipeline(
    user_text: str,
    detected_language: str,
) -> tuple[str, str, Optional[str], str, list[dict[str, Any]], list[dict[str, Any]]]:
    """Full ArogyaVani voice pipeline. Wraps process_text_query with TTS generation enabled."""
    return process_text_query(
        user_text=user_text,
        language_code=detected_language,
        generate_tts=True,
    )

