import io
import json
import logging
import re
from typing import Any, Optional
from pypdf import PdfReader
from google.genai import types
from services.gemini_service import get_gemini_client, GEMINI_MODEL

logger = logging.getLogger(__name__)

DOCUMENT_EXTRACTION_PROMPT = """You are a specialized document information extractor for Indian health scheme eligibility verification.
Analyze the provided document (such as Aadhaar card, ration card, income certificate, MCP card, or medical/identity document) and extract the relevant citizen profile fields into a strict JSON object.

STRICT EXTRACTION RULES:
1. Extract ONLY information that is explicitly visible or readable in the document.
2. Set a field to null if it is not clearly present in the document.
3. NEVER guess, assume, or infer sensitive attributes (such as pregnancy, caste/category, income, or occupation) from a person's name, photo, or appearance.
4. For "age": Extract as an integer if explicitly stated or easily calculated from a clear date of birth.
5. For "pregnancy_status": Set to true ONLY if document explicitly mentions pregnancy/maternity/antenatal care. Otherwise null.
6. For "category": Set to "SC", "ST", "OBC", or "General" ONLY if explicitly printed on the document. Otherwise null.
7. Return ONLY valid JSON, with NO surrounding conversational prose.

JSON Schema:
{
  "name": string or null,
  "date_of_birth": string or null,
  "age": integer or null,
  "gender": string or null,
  "state": string or null,
  "district": string or null,
  "category": string or null,
  "annual_income": number or null,
  "occupation": string or null,
  "pregnancy_status": boolean or null,
  "child_age": number or null
}
"""


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract textual content from PDF bytes using pypdf."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_pages = []
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                extracted_pages.append(text.strip())
        return "\n\n".join(extracted_pages)
    except Exception as e:
        logger.warning(f"pypdf extraction error: {e}")
        return ""


def clean_json_response(raw_text: str) -> dict[str, Any]:
    """Cleans Markdown code block wrappers and parses JSON safely."""
    text = raw_text.strip()
    # Remove markdown code block fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    # Find first '{' and last '}'
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx : end_idx + 1]

    return json.loads(text)


def extract_profile_from_document(
    file_bytes: bytes,
    filename: str,
    mime_type: Optional[str] = None,
) -> tuple[dict[str, Any], dict[str, str], list[str]]:
    """Extracts structured UserProfile from an uploaded image or PDF document.
    Returns: (profile_dict, confidence_dict, missing_fields_list)
    """
    if not file_bytes or len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty.")

    client = get_gemini_client()
    filename_lower = filename.lower()
    is_pdf = filename_lower.endswith(".pdf") or mime_type == "application/pdf"

    contents: list[Any] = []

    if is_pdf:
        # First attempt fast text extraction via pypdf
        pdf_text = extract_text_from_pdf(file_bytes)
        if pdf_text and len(pdf_text.strip()) > 20:
            prompt_content = f"{DOCUMENT_EXTRACTION_PROMPT}\n\nDOCUMENT TEXT CONTENT:\n{pdf_text}"
            contents = [prompt_content]
        else:
            # Fallback for scanned/image PDFs: send PDF bytes directly to Gemini
            contents = [
                DOCUMENT_EXTRACTION_PROMPT,
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type="application/pdf",
                ),
            ]
    else:
        # Determine image mime type
        img_mime = mime_type or "image/jpeg"
        if filename_lower.endswith(".png"):
            img_mime = "image/png"
        elif filename_lower.endswith(".webp"):
            img_mime = "image/webp"

        contents = [
            DOCUMENT_EXTRACTION_PROMPT,
            types.Part.from_bytes(
                data=file_bytes,
                mime_type=img_mime,
            ),
        ]

    # Call Gemini for structured extraction
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.1,  # Low temperature for deterministic extraction
            max_output_tokens=300,
        ),
    )

    if not response or not response.text:
        raise RuntimeError("Gemini returned empty extraction response.")

    raw_json = clean_json_response(response.text)

    # Standardize profile dictionary fields
    standard_keys = [
        "name",
        "date_of_birth",
        "age",
        "gender",
        "state",
        "district",
        "category",
        "annual_income",
        "occupation",
        "pregnancy_status",
        "child_age",
    ]

    profile: dict[str, Any] = {}
    confidence: dict[str, str] = {}
    missing_fields: list[str] = []

    for key in standard_keys:
        val = raw_json.get(key)
        if val is not None and val != "" and val != "null" and val != "unknown":
            profile[key] = val
            confidence[key] = "high"
        else:
            profile[key] = None
            missing_fields.append(key)

    return profile, confidence, missing_fields
