/**
 * Voice API service.
 * Responsible for sending audio to the backend and parsing responses.
 *
 * Responsibilities:
 *   - Building FormData with the audio Blob
 *   - Resolving the correct API base URL prioritizing VITE_API_BASE_URL
 *   - POST /voice-query
 *   - Parsing and validating the backend JSON response
 *   - Handling timeouts (Render cold start) and mapping network/HTTP errors
 *
 * NOT responsible for:
 *   - React state
 *   - MediaRecorder lifecycle
 *   - Audio playback (see features/voice/utils/audioUtils.ts)
 *   - base64 decoding (see features/voice/utils/audioUtils.ts)
 */

// Re-export types from the canonical voice types module
export type {
  VoiceQuerySuccessResponse,
  VoiceQueryErrorResponse,
  VoiceQueryResponse,
} from '../features/voice/types/voiceTypes';

import type { VoiceQueryResponse } from '../features/voice/types/voiceTypes';

// ── API base URL resolution ────────────────────────────────────────────────

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  const apiBaseUrl =
    envUrl && envUrl.length > 0
      ? envUrl.replace(/\/+$/, '')
      : 'http://localhost:8000';

  return apiBaseUrl;
}

// Development environment logging
if (import.meta.env.DEV) {
  console.log('[voiceService] MODE:', import.meta.env.MODE);
  console.log('[voiceService] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('[voiceService] RESOLVED API BASE URL:', getApiBaseUrl());
}

// ── Extension helper ───────────────────────────────────────────────────────

function extensionForMime(mimeType: string): string {
  if (mimeType.includes('mp4'))  return 'mp4';
  if (mimeType.includes('aac'))  return 'aac';
  if (mimeType.includes('wav'))  return 'wav';
  if (mimeType.includes('ogg'))  return 'ogg';
  return 'webm';
}

// ── sendVoiceQuery ─────────────────────────────────────────────────────────

/** Default timeout of 90 seconds to handle free-tier Render spin-up / cold starts */
const REQUEST_TIMEOUT_MS = 90000;

/**
 * Sends a recorded audio Blob to POST /voice-query and returns a typed response.
 * Does not set Content-Type manually — browser sets the correct multipart boundary.
 */
export async function sendVoiceQuery(audioBlob: Blob): Promise<VoiceQueryResponse> {
  const extension = extensionForMime(audioBlob.type);
  const formData  = new FormData();
  formData.append('audio', audioBlob, `voice_recording.${extension}`);

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/voice-query`;

  if (import.meta.env.DEV) {
    console.log('[voiceService] FINAL REQUEST URL:', url);
    console.log('[voiceService] POST', url, {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      fileName: `voice_recording.${extension}`,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (import.meta.env.DEV) {
      console.log('[voiceService] Response:', response.status, response.statusText);
    }

    let data: Record<string, unknown>;
    try {
      data = await response.json();
    } catch (parseError) {
      if (import.meta.env.DEV) {
        console.error('[voiceService] JSON parsing failed:', parseError);
      }
      return {
        success: false,
        error: response.ok
          ? 'Received an unexpected response format from the healthcare server.'
          : `Healthcare server error (${response.status}). Please try again later.`,
      };
    }

    if (!response.ok || !data || data['success'] === false) {
      const serverErr = (data?.['error'] as string) ?? `Healthcare server error (${response.status}). Please try again later.`;
      if (import.meta.env.DEV) {
        console.error('[voiceService] Backend error:', { status: response.status, data });
      }
      return { success: false, error: serverErr };
    }

    if (import.meta.env.DEV) {
      console.log('[voiceService] Success:', {
        language_code: data['language_code'],
        transcript_length: (data['transcript'] as string)?.length,
        has_audio: Boolean(data['audio_base64']),
      });
    }

    return data as unknown as VoiceQueryResponse;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error && (error.name === 'AbortError' || controller.signal.aborted)) {
      if (import.meta.env.DEV) {
        console.error('[voiceService] Request timed out after', REQUEST_TIMEOUT_MS, 'ms');
      }
      return {
        success: false,
        error: 'Request timed out. The healthcare server might be waking up or taking longer than expected. Please try again.',
      };
    }

    if (import.meta.env.DEV) {
      console.error('[voiceService] Network / Fetch error:', error);
    }

    return {
      success: false,
      error: 'Unable to connect to the healthcare server. Please check your network connection.',
    };
  }
}

// ── Re-export audioUtils helpers for backwards-compat / convenience ────────
// base64ToAudioBlob stays canonical in audioUtils but can be imported here too.

export { base64ToAudioBlob } from '../features/voice/utils/audioUtils';

// ── uploadSchemeDocument ───────────────────────────────────────────────────

import type { DocumentEligibilityResponse } from '../features/schemes/types/schemeTypes';

export type SchemeDocumentUploadResult =
  | DocumentEligibilityResponse
  | { success: false; error: string };

/**
 * Uploads an identity/scheme document to POST /scheme-document.
 * The backend extracts a UserProfile and returns structured eligibility results.
 * Does NOT store the document — processed only for scheme discovery.
 */
export async function uploadSchemeDocument(
  file: File,
  languageCode?: string,
): Promise<SchemeDocumentUploadResult> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  if (languageCode) {
    formData.append('language_code', languageCode);
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/scheme-document`;

  if (import.meta.env.DEV) {
    console.log('[voiceService] uploadSchemeDocument →', url, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

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
          ? 'Unexpected response format from document processing server.'
          : `Server error (${response.status}). Please try again.`,
      };
    }

    if (!response.ok || !data || data['success'] === false) {
      return {
        success: false,
        error: (data?.['error'] as string) ?? `Document processing failed (${response.status}).`,
      };
    }

    return data as unknown as DocumentEligibilityResponse;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.name === 'AbortError' || controller.signal.aborted)) {
      return {
        success: false,
        error: 'Request timed out. Document processing is taking too long. Please try again.',
      };
    }
    return {
      success: false,
      error: 'Unable to connect to the document processing server. Please check your network.',
    };
  }
}

