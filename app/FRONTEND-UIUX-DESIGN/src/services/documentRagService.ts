/**
 * Document RAG Frontend Service.
 * Handles uploading documents for in-memory temporary RAG sessions
 * and submitting grounded questions to POST /document-rag/query.
 *
 * Privacy & Security:
 * - Documents are not permanently stored.
 * - In-memory sessions expire after 25 minutes.
 * - Uses centralized getApiBaseUrl().
 */

import { getApiBaseUrl } from './voiceService';

export interface DocumentRagSource {
  source: string;
  page: number;
}

export interface DocumentRagUploadResponse {
  success: boolean;
  document_session_id?: string;
  filename?: string;
  page_count?: number;
  chunk_count?: number;
  error?: string;
}

export interface DocumentRagQueryResponse {
  success: boolean;
  answer?: string;
  sources?: DocumentRagSource[];
  error?: string;
  session_expired?: boolean;
}

const REQUEST_TIMEOUT_MS = 60000; // 60s timeout

/**
 * Uploads a document (PDF or image) to create a temporary Document RAG session.
 */
export async function uploadDocumentForRag(
  file: File,
): Promise<DocumentRagUploadResponse> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/document-rag/upload`;

  if (import.meta.env.DEV) {
    console.log('[documentRagService] POST', url, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data: Record<string, unknown>;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: response.ok
          ? 'Unexpected response format from document server.'
          : `Document server error (${response.status}). Please try again.`,
      };
    }

    if (!response.ok || !data || data['success'] === false) {
      return {
        success: false,
        error:
          (data?.['error'] as string) ??
          `Failed to initialize document Q&A session (${response.status}).`,
      };
    }

    return data as unknown as DocumentRagUploadResponse;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.name === 'AbortError' || controller.signal.aborted)) {
      return {
        success: false,
        error: 'Document indexing timed out. Please try again.',
      };
    }
    return {
      success: false,
      error: 'Unable to connect to the document processing server.',
    };
  }
}

/**
 * Sends a question regarding the active document session to POST /document-rag/query.
 */
export async function queryDocumentRag(
  documentSessionId: string,
  question: string,
  languageCode: string = 'en-IN',
): Promise<DocumentRagQueryResponse> {
  const trimmed = question.trim();
  if (!trimmed) {
    return {
      success: false,
      error: 'Please enter a valid question about your document.',
    };
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/document-rag/query`;

  if (import.meta.env.DEV) {
    console.log('[documentRagService] POST', url, {
      documentSessionId,
      question: trimmed,
      languageCode,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_session_id: documentSessionId,
        question: trimmed,
        language_code: languageCode,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data: Record<string, unknown>;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: response.ok
          ? 'Unexpected response format from document server.'
          : `Server error (${response.status}). Please try again.`,
      };
    }

    if (!response.ok || !data || data['success'] === false) {
      return {
        success: false,
        error:
          (data?.['error'] as string) ??
          `Failed to get answer from document (${response.status}).`,
        session_expired: data?.['session_expired'] === true || response.status === 404,
      };
    }

    return data as unknown as DocumentRagQueryResponse;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.name === 'AbortError' || controller.signal.aborted)) {
      return {
        success: false,
        error: 'Question query timed out. Please try again.',
      };
    }
    return {
      success: false,
      error: 'Unable to connect to the healthcare server. Please check your network.',
    };
  }
}
