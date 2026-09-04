# ArogyaVani AI — Backend Service

## Google Cloud Setup (Places API New)

To enable real-time nearby Primary Health Centre (PHC) and government healthcare facility search:

1. **Create or Select a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Select or create a project.

2. **Enable Places API (New):**
   - In Google Cloud Console, navigate to **APIs & Services** > **Library**.
   - Search for **Places API (New)** and click **Enable**.

3. **Create an API Key:**
   - Navigate to **APIs & Services** > **Credentials**.
   - Click **Create Credentials** > **API Key**.

4. **Restrict the API Key:**
   - Edit the created API key.
   - Under **API restrictions**, choose **Restrict key** and select only **Places API (New)**.
   - Under **Application restrictions**, set appropriate server-side restrictions (e.g. IP addresses of your deployed backend) where practical.

5. **Configure Render Environment Variable:**
   - In your Render dashboard, navigate to your backend service settings.
   - Add the environment variable:
     - **Key:** `GOOGLE_MAPS_API_KEY`
     - **Value:** `YOUR_RESTRICTED_GOOGLE_MAPS_API_KEY`
   - Never commit API keys to version control or expose them to frontend code.

---

## Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | Server-side API key for Google Places API (New) | *(Required on Render)* |
| `GEMINI_API_KEY` | Google Gemini API key for healthcare & RAG pipeline | *(Required)* |
| `SARVAM_API_KEY` | Sarvam AI key for voice STT/TTS | *(Required)* |
| `PORT` | Server listening port | `8000` |
| `ENABLE_RAG` | Enable/disable local FAISS vector retrieval for Scheme RAG | `false` |
| `ENABLE_DOCUMENT_ELIGIBILITY` | Enable document profile extraction & rule verification | `false` |
| `ENABLE_DOCUMENT_RAG` | Enable lightweight in-memory Document-Based RAG on Render | `true` |
| `GEMINI_EMBEDDING_MODEL` | Gemini Embeddings model name | `text-embedding-004` |

---

## Document-Based RAG Architecture (Render-Compatible)

ArogyaVani AI includes a lightweight, zero-local-model **Document-Based RAG** system designed specifically to run reliably within memory constraints on Render without loading PyTorch, SentenceTransformer, or FAISS.

### How It Works:
1. **Upload & Understanding**: When a citizen uploads an identity, income, or health scheme document (PDF, JPG, PNG, WEBP), text is extracted per page while strictly preserving page boundaries (1-indexed).
2. **Deterministic Chunking**: Pages are chunked into 500–800 word segments with 100–150 word overlaps, each tagged with its exact page number and document source.
3. **Gemini Embeddings API**: Chunks are embedded via the Google Gemini Embeddings API (`text-embedding-004` / `gemini-embedding-001`) and normalized into unit vectors.
4. **Temporary In-Memory Session**: Vectors are kept in a bounded in-memory store (`MAX_DOCUMENT_SESSIONS = 20`, TTL = 25 minutes).
5. **Top-K Dot Product Similarity**: User questions are embedded and matched against document chunks using cosine dot-product similarity (top 3–5 chunks retrieved).
6. **Strict Grounded Generation**: Gemini answers using ONLY the retrieved chunks under the `DOCUMENT_RAG_SYSTEM_PROMPT`. If information is missing from the document, it explicitly replies: *"I could not find that information in the uploaded document."*
7. **Source Citations**: Returns verifiable page numbers (`Page 1`, `Page 2`) for every retrieved source.

### Architectural Comparison:

| Capability | Scheme RAG | Document Eligibility | Document RAG (New) |
|---|---|---|---|
| **Purpose** | Knowledge retrieval across national health scheme guidelines | Structured citizen profile extraction & scheme rule evaluation | Grounded citizen Q&A on their uploaded document |
| **Knowledge Source** | Curated 8-PDF official scheme documents | Citizen uploaded identity/ration card | Citizen uploaded document (PDF/Image) |
| **Engine** | FAISS + SentenceTransformer (Local) | Gemini Structured Extraction + Rules | Gemini Embeddings + In-Memory Vectors |
| **Storage** | Pre-computed static FAISS index | Stateless (No file storage) | In-Memory Session (TTL 25 min, max 20) |
| **Render-Friendly** | Heavy (disabled by default) | Lightweight (remote API) | Lightweight (remote API, 0 local models) |

### Session Lifecycle & Privacy:
- No raw files or sensitive personal data are ever written to disk, Supabase, or localStorage.
- Sessions automatically expire after 25 minutes or upon server restart.

