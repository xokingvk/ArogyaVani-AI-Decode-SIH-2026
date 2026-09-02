import logging
import os
import tempfile
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment variables from .env if present
load_dotenv()

from services.sarvam_service import (
    SUPPORTED_LANGUAGES,
    process_arogyavani_pipeline,
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


@app.post("/scheme-document")
async def scheme_document(
    file: UploadFile = File(...),
):
    """Document-based scheme eligibility endpoint:
    1. Receives uploaded document (image/PDF).
    2. Extracts structured UserProfile via Gemini/pypdf (without storing file).
    3. Evaluates eligibility rules across curated government health schemes.
    4. Retrieves grounded evidence sources from the 8-PDF FAISS knowledge base.
    5. Returns structured response with profile, eligibility results, and verified sources.
    """
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

        filename = file.filename or "document.jpg"
        content_type = file.content_type

        logger.info(f"Processing document upload ({len(file_bytes)} bytes, filename: {filename})")

        # Step 1: Extract structured UserProfile
        from services.document_service import extract_profile_from_document
        from services.eligibility_service import evaluate_scheme_eligibility
        from services.rag_service import get_rag_service

        profile, confidence, missing_fields = extract_profile_from_document(
            file_bytes=file_bytes,
            filename=filename,
            mime_type=content_type,
        )

        # Step 2: Evaluate scheme eligibility against known criteria
        schemes = evaluate_scheme_eligibility(profile)

        # Step 3: Grounded evidence sources via existing FAISS RAG
        rag_service = get_rag_service()
        # Privacy-preserving RAG retrieval query without full citizen name
        rag_query_parts = ["government health schemes eligibility benefits"]
        if profile.get("age"):
            rag_query_parts.append(f"age {profile['age']}")
        if profile.get("state"):
            rag_query_parts.append(f"state {profile['state']}")
        if profile.get("pregnancy_status"):
            rag_query_parts.append("maternity pregnancy")
        if profile.get("child_age"):
            rag_query_parts.append(f"child age {profile['child_age']}")

        rag_query = " ".join(rag_query_parts)
        retrieved_chunks = rag_service.retrieve(rag_query, top_k=3)

        seen_sources = set()
        sources = []
        for r in retrieved_chunks:
            key = (r.source, r.page)
            if key not in seen_sources:
                sources.append({
                    "source": r.source,
                    "page": r.page,
                    "score": round(r.score, 4),
                })
                seen_sources.add(key)

        summary = (
            "Based on the available information in your document, we evaluated potentially "
            "relevant government health schemes. Please review the details below before applying."
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "profile": profile,
                "confidence": confidence,
                "missing_fields": missing_fields,
                "summary": summary,
                "schemes": schemes,
                "sources": sources,
            },
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


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
