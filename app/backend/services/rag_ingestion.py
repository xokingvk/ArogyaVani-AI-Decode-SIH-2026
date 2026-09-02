"""
RAG Ingestion Script for ArogyaVani AI.
Extracts text from the 8 trusted health-scheme PDFs in ragfiles,
cleans text, chunks into 1000-word chunks (150-word overlap),
computes multilingual sentence-transformer embeddings,
builds a FAISS IndexFlatIP index, and persists the artifacts.
"""
from __future__ import annotations

import io
import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import faiss
import numpy as np
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = Path(r"d:\work\app\ragfiles")
ARTIFACT_DIR = BASE_DIR / "rag_artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

EMBEDDING_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
CHUNK_SIZE_WORDS = 1000
CHUNK_OVERLAP_WORDS = 150


@dataclass(frozen=True)
class PageDocument:
    text: str
    source: str
    page: int


@dataclass(frozen=True)
class Chunk:
    text: str
    source: str
    page: int
    chunk_id: int


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def load_pdfs(pdf_dir: Path) -> list[PageDocument]:
    docs: list[PageDocument] = []
    pdf_paths = sorted(pdf_dir.glob("*.pdf"))
    print(f"[Ingestion] Found {len(pdf_paths)} PDF(s) in {pdf_dir}")
    for path in pdf_paths:
        try:
            reader = PdfReader(str(path))
            for page_no, page in enumerate(reader.pages, start=1):
                text = clean_text(page.extract_text() or "")
                if text:
                    docs.append(PageDocument(text=text, source=path.name, page=page_no))
            print(f"  [OK] Loaded {path.name} ({len(reader.pages)} pages)")
        except Exception as e:
            print(f"  [ERROR] Error loading {path.name}: {e}")
    return docs


def chunk_words(text: str, size: int = CHUNK_SIZE_WORDS, overlap: int = CHUNK_OVERLAP_WORDS) -> list[str]:
    words = text.split()
    if not words:
        return []
    if overlap >= size:
        raise ValueError("chunk overlap must be smaller than chunk size")
    out: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + size, len(words))
        out.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap
    return out


def build_chunks(documents: Iterable[PageDocument]) -> list[Chunk]:
    chunks: list[Chunk] = []
    for doc in documents:
        for idx, text in enumerate(chunk_words(doc.text)):
            chunks.append(Chunk(text=text, source=doc.source, page=doc.page, chunk_id=idx))
    return chunks


def run_ingestion():
    print("=" * 60)
    print("AROGYAVANI RAG INGESTION PIPELINE")
    print("=" * 60)

    # 1. Load PDFs
    docs = load_pdfs(PDF_DIR)
    print(f"[Ingestion] Extracted {len(docs)} document pages.")

    # 2. Build Chunks
    chunks = build_chunks(docs)
    print(f"[Ingestion] Created {len(chunks)} text chunks.")

    if not chunks:
        raise RuntimeError("No chunks created. Check PDF folder path and files.")

    # 3. Load Embedding Model
    print(f"[Ingestion] Loading embedding model: {EMBEDDING_MODEL_NAME}")
    embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    dim = embedding_model.get_sentence_embedding_dimension()
    print(f"[Ingestion] Embedding dimension: {dim}")

    # 4. Generate Embeddings
    print("[Ingestion] Encoding chunk texts...")
    chunk_texts = [c.text for c in chunks]
    embeddings = embedding_model.encode(
        chunk_texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=True,
    )
    embeddings = np.asarray(embeddings, dtype=np.float32)

    # 5. Build FAISS Index
    print("[Ingestion] Building FAISS IndexFlatIP index...")
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    print(f"[Ingestion] FAISS total vectors: {index.ntotal}")

    # 6. Save Artifacts
    index_path = ARTIFACT_DIR / "scheme.index"
    chunks_path = ARTIFACT_DIR / "chunks.json"

    faiss.write_index(index, str(index_path))
    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump([asdict(c) for c in chunks], f, ensure_ascii=False, indent=2)

    print(f"[Ingestion] Successfully saved index to: {index_path}")
    print(f"[Ingestion] Successfully saved chunks metadata to: {chunks_path}")
    print("=" * 60)
    print("INGESTION COMPLETE [OK]")
    print("=" * 60)


if __name__ == "__main__":
    run_ingestion()
