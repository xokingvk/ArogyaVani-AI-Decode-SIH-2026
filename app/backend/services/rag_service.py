"""
RAG Service for ArogyaVani AI.
Loads the FAISS index and chunk metadata ONCE during startup.
Provides grounded retrieval & Gemini synthesis over the 8 trusted Indian health-scheme PDFs.
Never invents URLs, benefits, or eligibility.
"""
from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import faiss
import numpy as np
from google import genai
from google.genai import types
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACT_DIR = BASE_DIR / "rag_artifacts"
INDEX_PATH = ARTIFACT_DIR / "scheme.index"
CHUNKS_PATH = ARTIFACT_DIR / "chunks.json"

EMBEDDING_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
GEMINI_MODEL = "gemini-3.5-flash-lite"
DEFAULT_TOP_K = 5

# Curated mapping from trusted source filenames to stable scheme IDs
SOURCE_TO_SCHEME: dict[str, dict[str, str]] = {
    "pmmvy_scheme.pdf": {
        "schemeId": "pmmvy",
        "schemeName": "Pradhan Mantri Matru Vandana Yojana",
    },
    "jsy_scheme.pdf": {
        "schemeId": "jsy",
        "schemeName": "Janani Suraksha Yojana",
    },
    "jssk_scheme.pdf": {
        "schemeId": "jssk",
        "schemeName": "Janani Shishu Suraksha Karyakram",
    },
    "pmsma_scheme.pdf": {
        "schemeId": "pmsma",
        "schemeName": "Pradhan Mantri Surakshit Matritva Abhiyan",
    },
    "rbsk_scheme.pdf": {
        "schemeId": "rbsk",
        "schemeName": "Rashtriya Bal Swasthya Karyakram",
    },
    "nhm_scheme.pdf": {
        "schemeId": "pmjay",
        "schemeName": "Ayushman Bharat PM-JAY & National Health Mission",
    },
    "Government_Health_Insurance_Schemes_India_Research_Paper.pdf": {
        "schemeId": "pmjay",
        "schemeName": "Ayushman Bharat PM-JAY",
    },
    "India_Health_Schemes_Eligibility_Application_Dataset.pdf": {
        "schemeId": "pmjay",
        "schemeName": "Ayushman Bharat National Health Protection",
    },
}

SCHEME_KEYWORD_MAP: list[tuple[list[str], str, str]] = [
    (["pmjay", "ayushman", "pm-jay", "health card", "5 lakh", "insurance"], "pmjay", "Ayushman Bharat PM-JAY"),
    (["jsy", "janani suraksha", "institutional delivery", "cash assistance"], "jsy", "Janani Suraksha Yojana"),
    (["pmmvy", "matru vandana", "maternity benefit", "first child", "5000", "6000"], "pmmvy", "Pradhan Mantri Matru Vandana Yojana"),
    (["jssk", "shishu suraksha", "free delivery", "cashless delivery", "sick newborn"], "jssk", "Janani Shishu Suraksha Karyakram"),
    (["indradhanush", "immunization", "vaccine", "vaccination", "children immunization"], "indradhanush", "Mission Indradhanush"),
    (["pmjjby", "jeevan jyoti", "life insurance", "pradhan mantri jeevan"], "pmjjby", "Pradhan Mantri Jeevan Jyoti Bima Yojana"),
    (["pmgkay", "garib kalyan anna", "free ration", "food grain", "ration scheme"], "pmgkay", "PM Garib Kalyan Anna Yojana"),
    (["pmayg", "awas yojana", "housing", "gramin awas", "pucca house"], "pmayg", "Pradhan Mantri Awas Yojana - Gramin"),
    (["pmsma", "surakshit matritva", "antenatal", "9th of every month"], "pmsma", "Pradhan Mantri Surakshit Matritva Abhiyan"),
    (["rbsk", "bal swasthya", "4ds", "birth defect", "child health screening"], "rbsk", "Rashtriya Bal Swasthya Karyakram"),
]

RAG_SYSTEM_PROMPT = """You are ArogyaVani, a trusted Indian government health-scheme information assistant.
Answer the user's question using ONLY the provided trusted document context.

STRICT GROUNDING RULES:
1. Answer ONLY from the retrieved trusted documents.
2. Do NOT invent eligibility criteria, cash amounts, benefits, documents, or application steps.
3. Do NOT invent or construct URLs or web links.
4. Do NOT use outside knowledge or hallucinate details.
5. If the retrieved documents do not contain the answer, clearly state: "I could not find this specific information in the verified government scheme documents."
6. Do NOT diagnose medical conditions or prescribe medicines.
7. Keep responses concise, helpful, and easily understood by citizens.
8. Answer in the requested language when indicated.
""".strip()


@dataclass(frozen=True)
class Chunk:
    text: str
    source: str
    page: int
    chunk_id: int


@dataclass(frozen=True)
class RetrievalResult:
    text: str
    source: str
    page: int
    chunk_id: int
    score: float


class RAGService:
    def __init__(self, index_path: Path = INDEX_PATH, chunks_path: Path = CHUNKS_PATH):
        self.index_path = index_path
        self.chunks_path = chunks_path
        self.embedding_model: Optional[SentenceTransformer] = None
        self.index: Optional[faiss.Index] = None
        self.chunks: list[Chunk] = []
        self.is_ready = False
        self._gemini_client: Optional[genai.Client] = None

        self._initialize()

    def _initialize(self):
        """Loads embedding model, FAISS index, and chunks ONCE on startup."""
        try:
            logger.info("Initializing RAGService...")
            # 1. Load chunks metadata
            if self.chunks_path.exists():
                with open(self.chunks_path, "r", encoding="utf-8") as f:
                    raw_chunks = json.load(f)
                    self.chunks = [Chunk(**c) for c in raw_chunks]
                logger.info(f"Loaded {len(self.chunks)} chunk metadata records.")
            else:
                logger.warning(f"RAG chunks metadata not found at {self.chunks_path}")

            # 2. Load FAISS index
            if self.index_path.exists():
                self.index = faiss.read_index(str(self.index_path))
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors.")
            else:
                logger.warning(f"FAISS index file not found at {self.index_path}")

            # 3. Load Embedding Model
            logger.info(f"Loading SentenceTransformer model: {EMBEDDING_MODEL_NAME}")
            self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            logger.info("SentenceTransformer model loaded successfully.")

            if self.index is not None and self.chunks and self.embedding_model is not None:
                self.is_ready = True
                logger.info("RAGService is fully READY.")
            else:
                logger.warning("RAGService initialized in partial/fallback mode.")

        except Exception as exc:
            logger.exception(f"Failed to initialize RAGService: {exc}")
            self.is_ready = False

    def get_gemini_client(self) -> genai.Client:
        if self._gemini_client is None:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise RuntimeError("GEMINI_API_KEY environment variable is not set.")
            self._gemini_client = genai.Client(api_key=api_key)
        return self._gemini_client

    def retrieve(self, query: str, top_k: int = DEFAULT_TOP_K) -> list[RetrievalResult]:
        """Performs cosine/inner-product similarity search over FAISS index."""
        if not self.is_ready or not self.index or not self.embedding_model or not query.strip():
            return []

        cleaned_query = re.sub(r"\s+", " ", query).strip()
        q_emb = self.embedding_model.encode([cleaned_query], convert_to_numpy=True, normalize_embeddings=True)
        q_emb = np.asarray(q_emb, dtype=np.float32)

        scores, indices = self.index.search(q_emb, top_k)
        results: list[RetrievalResult] = []

        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            c = self.chunks[int(idx)]
            results.append(
                RetrievalResult(
                    text=c.text,
                    source=c.source,
                    page=c.page,
                    chunk_id=c.chunk_id,
                    score=float(score),
                )
            )
        return results

    def build_context(self, results: list[RetrievalResult]) -> str:
        """Constructs grounded context string from retrieved chunks."""
        blocks = []
        for i, r in enumerate(results, start=1):
            blocks.append(
                f"--- DOCUMENT CHUNK {i} ---\n"
                f"SOURCE FILE: {r.source}\n"
                f"PAGE: {r.page}\n"
                f"CONTENT:\n{r.text}"
            )
        return "\n\n".join(blocks)

    def extract_matching_schemes(self, query: str, results: list[RetrievalResult]) -> list[dict[str, Any]]:
        """Maps retrieved chunks and query keywords to known frontend scheme catalog items."""
        found_schemes: dict[str, dict[str, Any]] = {}
        query_lower = query.lower()

        # 1. Match from retrieved chunks
        for r in results:
            mapping = SOURCE_TO_SCHEME.get(r.source)
            if mapping:
                scheme_id = mapping["schemeId"]
                if scheme_id not in found_schemes or r.score > found_schemes[scheme_id]["relevanceScore"]:
                    found_schemes[scheme_id] = {
                        "schemeId": scheme_id,
                        "schemeName": mapping["schemeName"],
                        "relevanceScore": round(r.score, 4),
                        "reason": f"Information retrieved from verified {r.source} (Page {r.page}).",
                    }

        # 2. Match from explicit keywords in query if not yet captured
        for keywords, s_id, s_name in SCHEME_KEYWORD_MAP:
            if any(kw in query_lower for kw in keywords):
                if s_id not in found_schemes:
                    found_schemes[s_id] = {
                        "schemeId": s_id,
                        "schemeName": s_name,
                        "relevanceScore": 0.95,
                        "reason": "Direct query match for government health scheme.",
                    }

        # Sort by relevance score descending
        sorted_schemes = sorted(found_schemes.values(), key=lambda x: x["relevanceScore"], reverse=True)
        return sorted_schemes[:4]

    def answer(self, query: str, language_code: str = "en-IN", top_k: int = DEFAULT_TOP_K) -> dict[str, Any]:
        """Full grounded RAG pipeline:
        1. Retrieval from FAISS
        2. Strict grounded synthesis with Gemini 3.5 Flash-Lite
        3. Extraction of source metadata and structured scheme IDs
        """
        if not self.is_ready:
            logger.warning("RAGService not ready; returning fallback response.")
            return {
                "answer": "Government scheme database is currently loading. Please consult a local healthcare center.",
                "schemes": [],
                "sources": [],
            }

        retrieved = self.retrieve(query, top_k=top_k)
        if not retrieved:
            return {
                "answer": "I could not find relevant information in the verified government scheme documents.",
                "schemes": [],
                "sources": [],
            }

        context = self.build_context(retrieved)
        client = self.get_gemini_client()

        prompt = (
            f"USER QUERY: {query}\n"
            f"TARGET LANGUAGE: {language_code}\n\n"
            f"VERIFIED SCHEME CONTEXT:\n{context}\n\n"
            f"GROUNDED ANSWER:"
        )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=RAG_SYSTEM_PROMPT,
                max_output_tokens=250,
            ),
        )

        answer_text = (response.text or "").strip()
        # Strip any naked URLs or markdown links that might have slipped into generation
        answer_text = re.sub(r"https?://\S+|www\.\S+", "", answer_text)
        answer_text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", answer_text)
        answer_text = re.sub(r"[ \t]+", " ", answer_text).strip()

        if not answer_text:
            answer_text = "I could not find clear details for this scheme query in the verified documents."

        # Unique sources list
        seen_sources = set()
        sources_list = []
        for r in retrieved:
            key = (r.source, r.page)
            if key not in seen_sources:
                sources_list.append({
                    "source": r.source,
                    "page": r.page,
                    "score": round(r.score, 4),
                })
                seen_sources.add(key)

        matching_schemes = self.extract_matching_schemes(query, retrieved)

        return {
            "answer": answer_text,
            "schemes": matching_schemes,
            "sources": sources_list,
        }


# Singleton instance
_rag_service_instance: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = RAGService()
    return _rag_service_instance
