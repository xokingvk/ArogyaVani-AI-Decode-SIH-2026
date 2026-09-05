import os
import re
from google import genai
from google.genai import types

GEMINI_MODEL = "gemini-3.5-flash-lite"
MAX_RESPONSE_WORDS = 69
TARGET_MIN_WORDS = 40
TARGET_MAX_WORDS = 60

AROGYAVANI_SYSTEM_PROMPT = """
You are ArogyaVani AI, a voice-first healthcare assistant for citizens of India.

RESPONSE PHILOSOPHY & LENGTH LIMIT:
- VOICE-FIRST: Answers must be spoken naturally, clearly, concisely, and be easy to listen to.
- STRICT LENGTH LIMIT: Generate a concise spoken response of 40–60 words. ABSOLUTE LIMIT: 69 words maximum. Never exceed 69 words.
- COMPLETE SENTENCES: Every sentence must be complete and finished with proper punctuation before ending. Never leave a sentence unfinished.
- STRUCTURE:
  1. Direct, calm answer or explanation.
  2. Safe non-medication comfort or self-care guidance (such as rest, hydration, warm fluids, supportive care).
  3. Short safety statement on when to seek medical care or visit a Primary Health Centre (PHC)/doctor if symptoms worsen or persist.

ABSOLUTE PROHIBITION ON MEDICINES, TABLETS, AND DRUGS:
- NEVER mention, recommend, suggest, prescribe, or encourage the use of ANY tablets, medicines, drugs, medication names, branded medicines, generic medicine names, OTC medicines, prescription medicines, dosage instructions, or medication combinations.
- Do NOT suggest that the user "take" any medicine, pill, syrup, or tablet.
- Do NOT provide ANY medicine name even as an example or general illustration.
- Provide ONLY safe non-medication guidance such as rest, hydration, monitoring symptoms, and seeking professional medical evaluation.
- If the user specifically asks for medicine, tablets, prescriptions, or dosages, do NOT provide any medication name. Give a concise response advising the user to consult a qualified doctor or pharmacist.

CRITICAL VOICE & FORMATTING RULES:
- Return PLAIN CLEAN NATURAL TEXT ONLY.
- Absolutely DO NOT use markdown syntax: NO double asterisks (**), NO single asterisks (*), NO hash headings (###, ##, #), NO horizontal rules (---, ___), NO backticks (`), NO strikethroughs (~~), NO markdown bullet prefixes (-, *, +), NO markdown numbered lists (1., 2.), NO tables, and NO URLs or citations.
- Do not repeat the user's question.
- Avoid long introductions and repeated disclaimers.
- End with a complete, natural sentence.

IMPORTANT SAFETY LIMITATIONS:
- You MUST NOT diagnose a disease or state that the user definitely has a medical condition.
- For severe warning signs (e.g., severe difficulty breathing, persistent high fever, chest pain), recommend seeking prompt medical care.
- If the user asks about an unrelated non-health topic, politely explain in one short sentence that you only assist with healthcare guidance, government schemes, and health facilities.
""".strip()

_gemini_client = None


def get_gemini_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set.")
        _gemini_client = genai.Client(api_key=api_key)
    return _gemini_client


def count_words(text: str) -> int:
    """Predictable whitespace-based word count after normalizing whitespace."""
    if not text or not text.strip():
        return 0
    return len(re.findall(r"\S+", text.strip()))


def clean_markdown_artifacts(text: str) -> str:
    """Strips any markdown artifacts, hashes, asterisks, bullets, and normalizes whitespace."""
    if not text:
        return ""
    t = text
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    t = re.sub(r"https?://\S+|www\.\S+", "", t)
    t = re.sub(r"```[\s\S]*?```", "", t)
    t = re.sub(r"`+", "", t)
    t = re.sub(r"^\s*[-*_=\s]{3,}\s*$", "", t, flags=re.MULTILINE)
    t = re.sub(r"^\s*#{1,6}\s*", "", t, flags=re.MULTILINE)
    t = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", t)
    t = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", t)
    t = re.sub(r"~~([^~]+)~~", r"\1", t)
    t = re.sub(r"[*#~`_]+", "", t)
    t = re.sub(r"^\s*[-*+•]\s+", "", t, flags=re.MULTILINE)
    t = re.sub(r"^\s*\d+[\.\)]\s*", "", t, flags=re.MULTILINE)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def enforce_word_limit(
    text: str,
    client: genai.Client,
    fallback_text: str = "Rest and hydration can support recovery from common symptoms. Drink plenty of water and rest well. Please consult a qualified doctor or visit your nearest Primary Health Centre if your symptoms persist or worsen.",
    max_words: int = MAX_RESPONSE_WORDS,
) -> str:
    """Validates response word count. If word count > max_words, performs ONE concise rewrite
    attempt with Gemini. If still over the limit, safely extracts complete sentences up to max_words or falls back.
    """
    cleaned = clean_markdown_artifacts(text)
    if count_words(cleaned) <= max_words:
        return cleaned

    # Attempt ONE concise rewrite
    retry_prompt = (
        "Rewrite the following answer in 40–55 words. HARD LIMIT: 69 words. "
        "Preserve the important factual information and safety guidance. "
        "Never mention any medicines, tablets, or drug names. "
        "Use complete sentences with proper ending punctuation. Do not use markdown. Return only the final answer.\n\n"
        f"Original answer:\n{cleaned}"
    )

    try:
        retry_res = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=retry_prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a voice healthcare editor. Generate strictly 40 to 55 words (maximum 69 words). Return plain natural text only with complete sentences. Never include medicine or tablet names.",
                max_output_tokens=150,
            ),
        )
        retry_text = clean_markdown_artifacts((retry_res.text or "").strip())
        if retry_text and count_words(retry_text) <= max_words:
            return retry_text
    except Exception:
        pass

    # If retry is still > 69 words or failed, extract complete sentences that fit under max_words
    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    candidate_sentences = []
    current_count = 0
    for s in sentences:
        s_clean = s.strip()
        if not s_clean:
            continue
        s_words = count_words(s_clean)
        if current_count + s_words <= max_words:
            candidate_sentences.append(s_clean)
            current_count += s_words
        else:
            break

    if candidate_sentences and current_count >= 15:
        return " ".join(candidate_sentences).strip()

    return fallback_text


def ask_gemini(question: str) -> str:
    """Send healthcare inquiry to Gemini 3.5 flash-lite and enforce <= 69 words hard limit."""
    client = get_gemini_client()
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=question,
        config=types.GenerateContentConfig(
            system_instruction=AROGYAVANI_SYSTEM_PROMPT,
            max_output_tokens=160,
        ),
    )

    if not response or not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    raw_text = response.text.strip()
    return enforce_word_limit(raw_text, client)

