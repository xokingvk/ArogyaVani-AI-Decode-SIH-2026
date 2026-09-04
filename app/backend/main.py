import logging
import os
import tempfile
from typing import Optional, Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment variables from .env if present
load_dotenv()

from services.sarvam_service import (
    SUPPORTED_LANGUAGES,
    process_arogyavani_pipeline,
    process_text_query,
    transcribe_audio,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("arogyavani_voice_backend")

app = FastAPI(
    title="ArogyaVani Voice Assistant API",
    description="Backend voice processing API for ArogyaVani AI healthcare assistant",
    version="1.0.0",
)

# CORS Configuration allowing React Vite dev server and Capacitor Android WebViews
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint to verify backend service availability."""
    return {"status": "ok"}


@app.get("/nearby-phc")
def get_nearby_phc(latitude: float, longitude: float, radius: int = 5000):
    """Real-time location-based Primary Health Centre (PHC) & government healthcare facility search:
    1. Validates device GPS coordinates.
    2. Searches verified local national & Bengaluru PHC dataset.
    3. Calculates geodesic Haversine distance in meters and kilometers.
    4. Prioritizes Primary Health Centres over Government Health Facilities.
    5. Sorts nearest-first and returns top 5 facilities.
    6. Returns structured facilities with Google Maps directions link and verified phone (if available).
    """
    from services.location_service import fetch_nearby_phc

    result = fetch_nearby_phc(latitude=latitude, longitude=longitude, radius=radius)
    if not result.get("success", False):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST if "Invalid coordinates" in result.get("error", "") else status.HTTP_503_SERVICE_UNAVAILABLE,
            content=result,
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=result,
    )


@app.post("/voice-query")
async def voice_query(
    audio: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
):
    """Voice query pipeline endpoint:
    1. Receives uploaded microphone audio (as 'audio' or 'file').
    2. Transcribes using Sarvam Saaras v3.
    3. Translates to English.
    4. Routes via ArogyaVani safety/intent router (medical advice -> safety response,
       location -> location prompt, healthcare -> Gemini 3.5 flash-lite, out of scope -> fallback).
    5. Translates response back to user's detected language.
    6. Generates speech using Sarvam Bulbul v3 ('priya').
    7. Returns JSON response with transcript, language, response text, and base64 audio.
    """
    upload = audio or file
    if not upload:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "No audio file provided. Please record and send an audio file.",
            },
        )

    temp_audio_path = None
    try:
        audio_bytes = await upload.read()
        if not audio_bytes or len(audio_bytes) == 0:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": "The uploaded audio file is empty. Please record again.",
                },
            )

        # Retain original file extension if provided, else default to .webm
        suffix = ".webm"
        if upload.filename and "." in upload.filename:
            ext = "." + upload.filename.rsplit(".", 1)[-1].lower()
            if len(ext) <= 6:
                suffix = ext

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(audio_bytes)
            temp_audio_path = temp_file.name

        logger.info(f"Saved incoming audio ({len(audio_bytes)} bytes) to {temp_audio_path}")

        # Step 1: Transcribe via Sarvam Saaras v3
        user_transcript, detected_language = transcribe_audio(temp_audio_path)

        if not user_transcript or not user_transcript.strip():
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": "No clear speech was detected. Please speak clearly and try again.",
                },
            )

        # Normalize or fallback language code if not supported
        if detected_language not in SUPPORTED_LANGUAGES:
            logger.warning(f"Detected language '{detected_language}' not in standard list; falling back to en-IN")
            detected_language = "en-IN"

        # Step 2: Run ArogyaVani intent routing & TTS generation
        english_text, response_text, audio_base64, mode, schemes, sources = process_arogyavani_pipeline(
            user_text=user_transcript,
            detected_language=detected_language,
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "transcript": user_transcript,
                "language_code": detected_language,
                "response_text": response_text,
                "audio_base64": audio_base64,
                "mode": mode,
                "schemes": schemes,
                "sources": sources,
            },
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Error while processing voice query: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Sorry, I couldn't process your voice. Please try again.",
            },
        )
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except OSError as e:
                logger.warning(f"Could not remove temporary audio file {temp_audio_path}: {e}")


from pydantic import BaseModel


class TextQueryRequest(BaseModel):
    text: str
    language_code: Optional[str] = "en-IN"


@app.post("/text-query")
async def text_query(req: TextQueryRequest):
    """Text query pipeline endpoint:
    1. Validates and trims text input.
    2. Respects language_code (or falls back to supported code).
    3. Runs the shared ArogyaVani intent routing & Gemini/RAG pipeline.
    4. Returns structured JSON with response_text, mode, schemes, and sources.
    """
    user_text = (req.text or "").strip()
    if not user_text:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "Please enter a valid question or health symptom.",
            },
        )

    lang_code = (req.language_code or "en-IN").strip()
    if lang_code not in SUPPORTED_LANGUAGES:
        if lang_code.startswith("ta"):
            lang_code = "ta-IN"
        elif lang_code.startswith("hi"):
            lang_code = "hi-IN"
        elif lang_code.startswith("te"):
            lang_code = "te-IN"
        else:
            lang_code = "en-IN"

    try:
        english_text, response_text, audio_base64, mode, schemes, sources = process_text_query(
            user_text=user_text,
            language_code=lang_code,
            generate_tts=False,
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "transcript": user_text,
                "language_code": lang_code,
                "response_text": response_text,
                "mode": mode,
                "schemes": schemes,
                "sources": sources,
                "audio_base64": audio_base64,
            },
        )
    except Exception as exc:
        logger.exception(f"Error while processing text query: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Sorry, I couldn't process your request. Please try again.",
            },
        )


def is_rag_enabled() -> bool:
    """Returns whether the local RAG stack (SentenceTransformer + PyTorch + FAISS) is enabled."""
    return os.getenv("ENABLE_RAG", "false").strip().lower() in ("true", "1", "yes")


def is_doc_eligibility_enabled() -> bool:
    """Returns whether the document extraction & scheme eligibility flow is enabled."""
    return os.getenv("ENABLE_DOCUMENT_ELIGIBILITY", "false").strip().lower() in ("true", "1", "yes")


class SchemeEligibilityRequest(BaseModel):
    profile: dict[str, Any]


def build_eligibility_response(
    profile: dict[str, Any],
    confidence: Optional[dict[str, str]] = None,
) -> dict[str, Any]:
    """Evaluates eligibility rules and retrieves targeted RAG sources for candidate schemes."""
    from services.eligibility_service import evaluate_scheme_eligibility

    # Step 1: Rule-based eligibility evaluation
    schemes = evaluate_scheme_eligibility(profile)

    # Step 2: Retrieve scheme-specific RAG sources for candidate schemes (only if ENABLE_RAG is true)
    sources = []
    if is_rag_enabled():
        from services.rag_service import get_rag_service
        rag_service = get_rag_service()
        candidate_schemes = [
            s for s in schemes if s.get("status") in ["potentially_eligible", "relevant"]
        ]

        seen_sources = set()
        # If candidate schemes exist, retrieve evidence directly targeted to those schemes
        if candidate_schemes:
            for s in candidate_schemes[:4]:
                query = f"{s['schemeName']} government scheme eligibility criteria guidelines"
                chunks = rag_service.retrieve(query, top_k=2)
                for r in chunks:
                    key = (r.source, r.page)
                    if key not in seen_sources:
                        sources.append({
                            "source": r.source,
                            "page": r.page,
                            "score": round(r.score, 4),
                        })
                        seen_sources.add(key)
        else:
            # Fallback general query
            chunks = rag_service.retrieve("government health schemes eligibility guidelines", top_k=3)
            for r in chunks:
                key = (r.source, r.page)
                if key not in seen_sources:
                    sources.append({
                        "source": r.source,
                        "page": r.page,
                        "score": round(r.score, 4),
                    })
                    seen_sources.add(key)

    # Step 3: Compute missing fields from profile
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
    missing_fields = [k for k in standard_keys if profile.get(k) is None]

    if confidence is None:
        confidence = {k: "high" for k in standard_keys if profile.get(k) is not None}

    summary = (
        "Based on the available information in your profile, we evaluated potentially "
        "relevant government health schemes. Please review the details below before applying."
    )

    return {
        "success": True,
        "profile": profile,
        "confidence": confidence,
        "missing_fields": missing_fields,
        "summary": summary,
        "schemes": schemes,
        "sources": sources,
    }


@app.post("/scheme-document")
async def scheme_document(
    file: UploadFile = File(...),
):
    """Document-based scheme eligibility endpoint:
    1. Receives uploaded document (image/PDF).
    2. Extracts structured UserProfile via Gemini/pypdf (without storing file).
    3. Evaluates eligibility rules across curated government health schemes.
    4. Retrieves targeted evidence sources from the 8-PDF FAISS knowledge base.
    5. Returns structured response with profile, eligibility results, and verified sources.
    """
    if not is_doc_eligibility_enabled():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "success": False,
                "error": "Document scheme verification is temporarily unavailable in prototype mode. Please check back soon.",
                "temporary_unavailable": True,
            },
        )

    if not file:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "No document file provided. Please upload an image or PDF.",
            },
        )

    try:
        file_bytes = await file.read()
        if not file_bytes or len(file_bytes) == 0:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": "The uploaded document is empty. Please choose a valid file.",
                },
            )

        # 10 MB maximum limit
        if len(file_bytes) > 10 * 1024 * 1024:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": "File exceeds the 10 MB size limit. Please upload a smaller file.",
                },
            )

        ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
        ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}

        filename = file.filename or "document.jpg"
        content_type = (file.content_type or "").lower().strip()
        ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""

        # Validate extension
        if ext not in ALLOWED_EXTENSIONS:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": "Unsupported file format. Please upload a JPG, PNG, WEBP, or PDF document.",
                },
            )

        # Validate MIME type when provided
        if content_type and content_type != "application/octet-stream" and content_type not in ALLOWED_MIME_TYPES:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": "Unsupported MIME type. Please upload a valid image or PDF document.",
                },
            )

        logger.info(f"Processing document upload ({len(file_bytes)} bytes, type: {content_type})")

        from services.document_service import extract_profile_from_document

        # Step 1: Extract structured UserProfile
        profile, confidence, _ = extract_profile_from_document(
            file_bytes=file_bytes,
            filename=filename,
            mime_type=content_type,
        )

        # Step 2: Build eligibility evaluation and targeted sources
        response_payload = build_eligibility_response(profile, confidence)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_payload,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Error while processing document: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Unable to extract information from this document. Please try a clearer image or supported PDF.",
            },
        )


@app.post("/scheme-eligibility")
async def scheme_eligibility(payload: SchemeEligibilityRequest):
    """Profile-based scheme eligibility recalculation endpoint:
    Recalculates eligibility statuses, missing fields, and RAG sources
    when the user edits or confirms their profile.
    """
    if not is_doc_eligibility_enabled():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "success": False,
                "error": "Scheme eligibility evaluation is temporarily unavailable in prototype mode. Please check back soon.",
                "temporary_unavailable": True,
            },
        )

    try:
        if not payload.profile or not isinstance(payload.profile, dict):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": "Invalid profile payload.",
                },
            )

        response_payload = build_eligibility_response(payload.profile)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_payload,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Error while recalculating eligibility: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Unable to evaluate scheme eligibility. Please try again.",
            },
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
