import io
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# Load environment
load_dotenv()

print("=" * 60)
print("AROGYAVANI RAG LOCAL INTEGRATION VERIFICATION")
print("=" * 60)

# 1 & 2. Inspect chunks.json
chunks_path = Path("rag_artifacts/chunks.json")
index_path = Path("rag_artifacts/scheme.index")

if not chunks_path.exists() or not index_path.exists():
    print(f"FAIL: Missing artifact files (chunks={chunks_path.exists()}, index={index_path.exists()})")
    sys.exit(1)

with open(chunks_path, "r", encoding="utf-8") as f:
    chunks = json.load(f)

unique_sources = sorted(list(set(c["source"] for c in chunks)))
pages = sorted(list(set((c["source"], c["page"]) for c in chunks)))

print("\n--- 1. ARTIFACTS & PDF CORPUS ---")
print(f"Total chunks: {len(chunks)}")
print(f"Total unique source PDFs: {len(unique_sources)}")
for s in unique_sources:
    count = sum(1 for c in chunks if c["source"] == s)
    print(f"  - {s} ({count} chunks)")
print(f"Total pages represented: {len(pages)}")

print("\nFirst 3 chunk metadata records:")
for i, c in enumerate(chunks[:3], 1):
    preview = c["text"][:80].replace("\n", " ")
    print(f"  [{i}] Source: {c['source']} | Page: {c['page']} | Chunk ID: {c['chunk_id']} | Snippet: \"{preview}...\"")

# 3 & 4. FastAPI /health check
print("\n--- 2. FASTAPI APP & /HEALTH CHECK ---")
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
health_res = client.get("/health")
print(f"GET /health -> HTTP {health_res.status_code}, Body: {health_res.json()}")
assert health_res.status_code == 200, "Health check failed"

# 5. RAGService initialization
print("\n--- 3. RAG SERVICE INITIALIZATION ---")
from services.rag_service import get_rag_service

rag = get_rag_service()
print(f"RAG is_ready: {rag.is_ready}")
print(f"FAISS total vectors: {rag.index.ntotal if rag.index else None}")
print(f"Chunks in memory: {len(rag.chunks)}")
print(f"Embedding model loaded: {rag.embedding_model is not None}")
assert rag.is_ready, "RAG service is not ready"

# 6 & 7. Direct RAG query test
print("\n--- 4. DIRECT RAG QUERY TEST ---")
test_query = "What benefits does Janani Suraksha Yojana provide?"
print(f"Query: \"{test_query}\"")

result = rag.answer(test_query, language_code="en-IN", top_k=5)

print("\nGenerated Grounded Answer:")
print(result["answer"])

print("\nRetrieved Top-k Sources & Pages:")
for src in result["sources"]:
    print(f"  - {src['source']} (Page {src['page']}, Score: {src.get('score')})")

print("\nMatched Scheme IDs:")
for s in result["schemes"]:
    print(f"  - {s['schemeId']}: {s['schemeName']} (Score: {s.get('relevanceScore')})")

print("\n" + "=" * 60)
print("ALL LOCAL VERIFICATION CHECKS PASSED [OK]")
print("=" * 60)
