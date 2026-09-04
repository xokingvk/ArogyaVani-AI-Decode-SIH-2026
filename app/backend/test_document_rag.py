"""Unit tests for Document-Based RAG service (backend/services/document_rag_service.py).
All Gemini API interactions are mocked. No live network or model calls.
"""
import io
import time
from unittest.mock import MagicMock, patch
import pytest

from services.document_rag_service import (
    DocumentChunk,
    DocumentSession,
    MAX_DOCUMENT_SESSIONS,
    SESSION_TTL_SECONDS,
    answer_document_question,
    clean_markdown_text,
    chunk_page_texts,
    create_document_session,
    dot_product,
    embed_query,
    embed_texts,
    extract_page_texts,
    get_document_session,
    normalize_vector,
    process_document_upload,
    retrieve_top_chunks,
    _session_store,
)


def setup_function():
    """Clear session store before each test."""
    _session_store.clear()


# ── 1. Text Extraction & Page Preservation ───────────────────────────────────

def test_extract_page_texts_empty_file():
    """Empty file raises ValueError."""
    with pytest.raises(ValueError, match="empty"):
        extract_page_texts(b"", "doc.pdf")


def test_extract_page_texts_with_mock_pdf():
    """Tests pypdf extraction preserving page numbers."""
    from pypdf import PdfWriter

    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    pdf_bytes = pdf_buffer.getvalue()

    # Mock PdfReader to return explicit page text
    with patch("services.document_rag_service.PdfReader") as mock_pdf_reader:
        mock_p1 = MagicMock()
        mock_p1.extract_text.return_value = "Applicant name is Ravi Kumar. Resident of Karnataka."
        mock_p2 = MagicMock()
        mock_p2.extract_text.return_value = "Annual income is 120000 rupees. Category: OBC."
        mock_pdf_reader.return_value.pages = [mock_p1, mock_p2]

        pages = extract_page_texts(pdf_bytes, "test_doc.pdf")
        assert len(pages) == 2
        assert pages[0] == (1, "Applicant name is Ravi Kumar. Resident of Karnataka.")
        assert pages[1] == (2, "Annual income is 120000 rupees. Category: OBC.")


# ── 2. Chunking & Overlap ───────────────────────────────────────────────────

def test_chunk_page_texts_small_page():
    """Small pages produce a single chunk preserving page metadata."""
    pages = [
        (1, "Applicant name is Ravi."),
        (2, "Annual income is 120000 rupees."),
    ]
    chunks = chunk_page_texts(pages, "income_cert.pdf", target_words_per_chunk=500)
    assert len(chunks) == 2
    assert chunks[0].page == 1
    assert chunks[0].source == "income_cert.pdf"
    assert chunks[0].text == "Applicant name is Ravi."
    assert chunks[1].page == 2
    assert chunks[1].source == "income_cert.pdf"


def test_chunk_page_texts_large_page_with_overlap():
    """Large pages are split into multiple chunks with overlap, retaining page number."""
    words = [f"word{i}" for i in range(1000)]
    pages = [(3, " ".join(words))]
    chunks = chunk_page_texts(pages, "guidelines.pdf", target_words_per_chunk=400, overlap_words=100)
    assert len(chunks) >= 3
    for c in chunks:
        assert c.page == 3
        assert c.source == "guidelines.pdf"


# ── 3. Vector Normalization & Cosine Similarity ──────────────────────────────

def test_normalize_vector():
    """Unit vector normalization produces length 1.0."""
    v = [3.0, 4.0]
    normed = normalize_vector(v)
    assert pytest.approx(normed[0]) == 0.6
    assert pytest.approx(normed[1]) == 0.8


def test_dot_product_orthogonal_and_parallel():
    """Dot product of orthogonal vectors is 0, parallel identical unit vectors is 1."""
    v1 = [1.0, 0.0]
    v2 = [0.0, 1.0]
    assert dot_product(v1, v2) == 0.0

    v3 = [0.6, 0.8]
    assert pytest.approx(dot_product(v3, v3)) == 1.0


# ── 4. Embeddings Generation (Mocked) ────────────────────────────────────────

def test_embed_texts_mocked():
    """embed_texts calls Gemini embed_content and normalizes output."""
    mock_client = MagicMock()
    mock_emb1 = MagicMock()
    mock_emb1.values = [3.0, 4.0]
    mock_emb2 = MagicMock()
    mock_emb2.values = [0.0, 5.0]
    mock_response = MagicMock()
    mock_response.embeddings = [mock_emb1, mock_emb2]
    mock_client.models.embed_content.return_value = mock_response

    with patch("services.document_rag_service.get_gemini_client", return_value=mock_client):
        embeddings = embed_texts(["Text 1", "Text 2"])
        assert len(embeddings) == 2
        assert pytest.approx(embeddings[0][0]) == 0.6
        assert pytest.approx(embeddings[1][1]) == 1.0


# ── 5. Top-K Retrieval ───────────────────────────────────────────────────────

def test_retrieve_top_chunks():
    """Top-k retrieval returns most similar chunks."""
    chunk1 = DocumentChunk(
        chunk_id="c1",
        text="Applicant name is Ravi.",
        page=1,
        source="doc.pdf",
        embedding=[1.0, 0.0, 0.0],
    )
    chunk2 = DocumentChunk(
        chunk_id="c2",
        text="Annual income is 120000 rupees.",
        page=2,
        source="doc.pdf",
        embedding=[0.0, 1.0, 0.0],
    )
    chunk3 = DocumentChunk(
        chunk_id="c3",
        text="Income certificate is required for verification.",
        page=3,
        source="doc.pdf",
        embedding=[0.0, 0.9, 0.1],
    )
    session = DocumentSession(
        document_session_id="test-session-123",
        filename="doc.pdf",
        created_at=time.time(),
        chunks=[chunk1, chunk2, chunk3],
        page_count=3,
        chunk_count=3,
    )

    # Mock embed_query to match vector [0.0, 1.0, 0.0]
    with patch("services.document_rag_service.embed_query", return_value=[0.0, 1.0, 0.0]):
        retrieved = retrieve_top_chunks(session, "What is the income?", top_k=2)
        assert len(retrieved) == 2
        assert retrieved[0].chunk_id == "c2"  # Exact match (sim 1.0)
        assert retrieved[1].chunk_id == "c3"  # High match (sim 0.9)


# ── 6. Session Management, TTL, and Max Capacity ────────────────────────────

def test_create_and_get_session():
    """Sessions are created and retrievable by session_id."""
    chunk = DocumentChunk(chunk_id="c1", text="Sample", page=1, source="doc.pdf")
    session = create_document_session("doc.pdf", [chunk], page_count=1)
    retrieved = get_document_session(session.document_session_id)
    assert retrieved is not None
    assert retrieved.filename == "doc.pdf"


def test_session_ttl_expiration():
    """Expired sessions (>25 mins) return None and are purged."""
    chunk = DocumentChunk(chunk_id="c1", text="Sample", page=1, source="doc.pdf")
    session = create_document_session("doc.pdf", [chunk], page_count=1)
    # Simulate past timestamp
    session.created_at = time.time() - (SESSION_TTL_SECONDS + 10)
    assert get_document_session(session.document_session_id) is None


def test_session_max_capacity_eviction():
    """When exceeding MAX_DOCUMENT_SESSIONS, oldest session is evicted."""
    chunk = DocumentChunk(chunk_id="c1", text="Sample", page=1, source="doc.pdf")
    sessions = []
    for i in range(MAX_DOCUMENT_SESSIONS + 5):
        s = create_document_session(f"doc_{i}.pdf", [chunk], page_count=1)
        sessions.append(s)

    # Oldest 5 should have been evicted
    for i in range(5):
        assert get_document_session(sessions[i].document_session_id) is None

    # Newest ones should still exist
    for i in range(5, len(sessions)):
        assert get_document_session(sessions[i].document_session_id) is not None


# ── 7. Plain-Text Response Cleaning (Markdown Stripping) ─────────────────────

def test_clean_markdown_text():
    """Removes bold, headers, backticks, bullet dashes, and code fences."""
    raw = (
        "### Document Details\n\n"
        "**Name**: Ravi Kumar\n"
        "- Annual income is `120000` rupees\n"
        "```json\n{\"test\": 1}\n```\n"
        "---\n"
        "*Verified* successfully."
    )
    cleaned = clean_markdown_text(raw)
    assert "**" not in cleaned
    assert "###" not in cleaned
    assert "`" not in cleaned
    assert "---" not in cleaned
    assert "- " not in cleaned
    assert "Name: Ravi Kumar" in cleaned
    assert "Annual income is 120000 rupees" in cleaned


# ── 8. Grounded Q&A Answer Generation ───────────────────────────────────────

def test_answer_document_question_grounded():
    """Grounded answering passes retrieved context to Gemini and returns source citations."""
    chunk = DocumentChunk(
        chunk_id="c2",
        text="Annual income is 120000 rupees as per the tehsildar certificate.",
        page=2,
        source="income_cert.pdf",
        embedding=[0.0, 1.0, 0.0],
    )
    session = DocumentSession(
        document_session_id="test-session",
        filename="income_cert.pdf",
        created_at=time.time(),
        chunks=[chunk],
        page_count=3,
        chunk_count=1,
    )

    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_resp.text = "The annual income stated in the document is 120000 rupees."
    mock_client.models.generate_content.return_value = mock_resp

    with patch("services.document_rag_service.get_gemini_client", return_value=mock_client), \
         patch("services.document_rag_service.embed_query", return_value=[0.0, 1.0, 0.0]):
        result = answer_document_question(session, "What is the income mentioned?")
        assert result["success"] is True
        assert "120000 rupees" in result["answer"]
        assert len(result["sources"]) == 1
        assert result["sources"][0]["page"] == 2
        assert result["sources"][0]["source"] == "income_cert.pdf"


def test_answer_document_question_missing_info_fallback():
    """When Gemini returns missing info phrase, returns clean plain fallback."""
    chunk = DocumentChunk(
        chunk_id="c1",
        text="Applicant name is Ravi.",
        page=1,
        source="doc.pdf",
        embedding=[1.0, 0.0, 0.0],
    )
    session = DocumentSession(
        document_session_id="test-session",
        filename="doc.pdf",
        created_at=time.time(),
        chunks=[chunk],
        page_count=1,
        chunk_count=1,
    )

    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_resp.text = "I could not find that information in the uploaded document."
    mock_client.models.generate_content.return_value = mock_resp

    with patch("services.document_rag_service.get_gemini_client", return_value=mock_client), \
         patch("services.document_rag_service.embed_query", return_value=[0.0, 1.0, 0.0]):
        result = answer_document_question(session, "What is the applicant's village?")
        assert result["success"] is True
        assert result["answer"] == "I could not find that information in the uploaded document."
