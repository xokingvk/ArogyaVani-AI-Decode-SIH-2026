import json
import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

def is_rag_enabled() -> bool:
    """Returns whether the local RAG stack (SentenceTransformer + PyTorch + FAISS) is enabled."""
    return os.getenv("ENABLE_RAG", "false").strip().lower() in ("true", "1", "yes")

INDEX_PATH = Path(__file__).parent.parent / "rag_artifacts" / "scheme.index"
CHUNKS_PATH = Path(__file__).parent.parent / "rag_artifacts" / "chunks.json"

EMBEDDING_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
GEMINI_MODEL = "gemini-3.5-flash-lite"
DEFAULT_TOP_K = 5

# Dedicated single-scheme document mapping (strictly validated scheme PDFs)
DEDICATED_SCHEME_FILES: dict[str, tuple[str, str]] = {
    "pmmvy_scheme.pdf": ("pmmvy", "Pradhan Mantri Matru Vandana Yojana"),
    "jsy_scheme.pdf": ("jsy", "Janani Suraksha Yojana"),
    "jssk_scheme.pdf": ("jssk", "Janani Shishu Suraksha Karyakram"),
    "pmsma_scheme.pdf": ("pmsma", "Pradhan Mantri Surakshit Matritva Abhiyan"),
    "rbsk_scheme.pdf": ("rbsk", "Rashtriya Bal Swasthya Karyakram"),
}

# Scheme keywords for content-based matching in multi-scheme documents
SCHEME_KEYWORD_MAP: list[tuple[list[str], str, str]] = [
    (["pmjay", "ayushman", "pm-jay", "health card", "5 lakh", "golden card", "vay vandana"], "pmjay", "Ayushman Bharat PM-JAY"),
    (["jsy", "janani suraksha", "institutional delivery", "cash assistance"], "jsy", "Janani Suraksha Yojana"),
    (["pmmvy", "matru vandana", "maternity benefit", "first child", "5000", "6000"], "pmmvy", "Pradhan Mantri Matru Vandana Yojana"),
    (["jssk", "shishu suraksha", "free delivery", "cashless delivery", "sick newborn"], "jssk", "Janani Shishu Suraksha Karyakram"),
    (["indradhanush", "immunization", "vaccine", "vaccination", "u-win", "children immunization"], "indradhanush", "Mission Indradhanush"),
    (["pmjjby", "jeevan jyoti", "life insurance", "pradhan mantri jeevan", "436"], "pmjjby", "Pradhan Mantri Jeevan Jyoti Bima Yojana"),
    (["pmgkay", "garib kalyan anna", "free ration", "food grain", "ration scheme", "nfsa"], "pmgkay", "PM Garib Kalyan Anna Yojana"),
    (["pmayg", "awas yojana", "housing", "gramin awas", "pucca house", "awaas+"], "pmayg", "Pradhan Mantri Awas Yojana - Gramin"),
    (["pmsma", "surakshit matritva", "antenatal", "9th of every month"], "pmsma", "Pradhan Mantri Surakshit Matritva Abhiyan"),
    (["rbsk", "bal swasthya", "4ds", "birth defect", "child health screening"], "rbsk", "Rashtriya Bal Swasthya Karyakram"),
]

RAG_SYSTEM_PROMPT = """You are ArogyaVani, a trusted Indian government health-scheme information assistant.
Answer the user's question using ONLY the provided trusted document context.

STRICT GROUNDING RULES:
1. Answer ONLY from the retrieved trusted documents.
2. Do NOT invent eligibility criteria, cash amounts, benefits, documents, or application steps.
3. Do NOT include URLs or web links in your text answer.
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
        self.embedding_model: Any = None
        self.index: Any = None
        self.chunks: list[Chunk] = []
        self._is_ready = False

    def initialize(self) -> None:
        """Loads the embedding model, FAISS index, and chunks metadata."""
        if self._is_ready:
            return

        if not is_rag_enabled():
            logger.info("ENABLE_RAG=false. Skipping SentenceTransformer and FAISS initialization.")
            return

        if not self.index_path.exists():
            raise FileNotFoundError(
                f"FAISS index file not found at {self.index_path}. "
                "Please ensure backend/rag_artifacts/scheme.index exists."
            )

        if not self.chunks_path.exists():
            raise FileNotFoundError(
                f"Chunks metadata file not found at {self.chunks_path}. "
                "Please ensure backend/rag_artifacts/chunks.json exists."
            )

        import faiss
        from sentence_transformers import SentenceTransformer

        logger.info(f"Loading SentenceTransformer embedding model: {EMBEDDING_MODEL_NAME}")
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

        logger.info(f"Loading FAISS index from {self.index_path}")
        self.index = faiss.read_index(str(self.index_path))

        logger.info(f"Loading chunks metadata from {self.chunks_path}")
        with open(self.chunks_path, "r", encoding="utf-8") as f:
            raw_chunks = json.load(f)

        self.chunks = [
            Chunk(
                text=c["text"],
                source=c["source"],
                page=c["page"],
                chunk_id=c.get("chunk_id", idx),
            )
            for idx, c in enumerate(raw_chunks)
        ]

        logger.info(
            f"RAGService successfully initialized: {len(self.chunks)} chunks loaded, "
            f"FAISS index total vectors: {self.index.ntotal}"
        )
        self._is_ready = True

    @property
    def is_ready(self) -> bool:
        return self._is_ready

    def retrieve(self, query: str, top_k: int = DEFAULT_TOP_K) -> list[RetrievalResult]:
        """Performs cosine semantic search against the FAISS index."""
        if not is_rag_enabled():
            logger.info("ENABLE_RAG=false. Returning empty retrieval results.")
            return []

        if not self.is_ready:
            self.initialize()

        if self.embedding_model is None or self.index is None:
            return []

        import numpy as np

        query_emb = self.embedding_model.encode(
            [query],
            convert_to_numpy=True,
            normalize_embeddings=True,
        ).astype("float32")

        scores, indices = self.index.search(query_emb, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            chunk = self.chunks[idx]
            results.append(
                RetrievalResult(
                    text=chunk.text,
                    source=chunk.source,
                    page=chunk.page,
                    chunk_id=chunk.chunk_id,
                    score=float(score),
                )
            )

        return results

    def format_context(self, results: list[RetrievalResult]) -> str:
        """Formats retrieved chunks with citations for Gemini grounded prompt."""
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
        """Maps retrieved chunks and query keywords to known frontend scheme catalog items.
        Grounded in explicit chunk content and dedicated single-scheme PDFs (never broad multi-scheme defaults).
        """
        found_schemes: dict[str, dict[str, Any]] = {}
        query_lower = query.lower()

        for r in results:
            # 1. Dedicated single-scheme documents
            if r.source in DEDICATED_SCHEME_FILES:
                s_id, s_name = DEDICATED_SCHEME_FILES[r.source]
                if s_id not in found_schemes or r.score > found_schemes[s_id]["relevanceScore"]:
                    found_schemes[s_id] = {
                        "schemeId": s_id,
                        "schemeName": s_name,
                        "relevanceScore": round(r.score, 4),
                        "reason": f"Information retrieved from verified {r.source} (Page {r.page}).",
                    }

            # 2. Content-based keyword matching inside chunk text (for all documents)
            chunk_text_lower = r.text.lower()
            for keywords, s_id, s_name in SCHEME_KEYWORD_MAP:
                if any(kw in chunk_text_lower for kw in keywords):
                    if s_id not in found_schemes or r.score > found_schemes[s_id]["relevanceScore"]:
                        found_schemes[s_id] = {
                            "schemeId": s_id,
                            "schemeName": s_name,
                            "relevanceScore": round(r.score, 4),
                            "reason": f"Verified in {r.source} (Page {r.page}).",
                        }

        # 3. Match from explicit keywords in query if not yet captured
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
        1. Retrieval from FAISS (initializes on demand when ENABLE_RAG=true)
        2. Strict grounded synthesis with Gemini 3.5 Flash-Lite
        3. Extraction of source metadata and structured scheme IDs
        """
        if not is_rag_enabled():
            logger.info("ENABLE_RAG=false. Answering scheme query via Gemini without local RAG stack.")
            from services.gemini_service import ask_gemini
            try:
                gemini_ans = ask_gemini(query)
                return {
                    "answer": gemini_ans,
                    "schemes": [],
                    "sources": [],
                }
            except Exception as e:
                logger.error(f"Error generating Gemini answer in disabled RAG mode: {e}")
                return {
                    "answer": "I can assist you with general healthcare inquiries and government schemes.",
                    "schemes": [],
                    "sources": [],
                }

        if not self.is_ready:
            try:
                self.initialize()
            except Exception as e:
                logger.error(f"Failed to initialize RAGService during answer(): {e}")
                return {
                    "answer": "I could not access the verified government scheme database at this moment.",
                    "schemes": [],
                    "sources": [],
                }

        retrieved = self.retrieve(query, top_k=top_k)

        if not retrieved:
            return {
                "answer": "I could not find verified government scheme documents related to your query.",
                "schemes": [],
                "sources": [],
            }

        context = self.format_context(retrieved)

        # Gemini grounded generation
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set.")

        client = genai.Client(api_key=api_key)

        prompt = (
            f"CITIZEN QUESTION:\n{query}\n\n"
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
        if is_rag_enabled():
            try:
                _rag_service_instance.initialize()
            except Exception as e:
                logger.warning(f"RAGService immediate init deferred: {e}")
    return _rag_service_instance
