/**
 * Voice API service.
 * Responsible for sending audio to the backend and parsing responses.
 *
 * Responsibilities:
 *   - Building FormData with the audio Blob
 *   - Resolving the correct API base URL (localhost or LAN Wi-Fi)
 *   - POST /voice-query
 *   - Parsing and validating the backend JSON response
 *   - Mapping HTTP / network errors to predictable error shapes
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

function getApiBaseUrl(): string {
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // When the app is opened via LAN IP (e.g. phone on Wi-Fi at 10.x.x.x),
  // route API calls to the same host to avoid CORS / same-origin issues.
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:8000`;
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  return envUrl ? envUrl.replace(/\/+$/, '') : 'http://localhost:8000';
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

/**
 * Sends a recorded audio Blob to POST /voice-query and returns a typed response.
 * Does not set Content-Type manually — browser sets the correct multipart boundary.
 */
export async function sendVoiceQuery(audioBlob: Blob): Promise<VoiceQueryResponse> {
  const extension = extensionForMime(audioBlob.type);
  const formData  = new FormData();
  formData.append('audio', audioBlob, `voice_recording.${extension}`);

  const url = `${getApiBaseUrl()}/voice-query`;

  if (import.meta.env.DEV) {
    console.log('[voiceService] POST', url, {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      fileName: `voice_recording.${extension}`,
    });
  }

  try {
    const response = await fetch(url, { method: 'POST', body: formData });

    if (import.meta.env.DEV) {
      console.log('[voiceService] Response:', response.status, response.statusText);
    }

    let data: Record<string, unknown>;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: response.ok
          ? 'Received an unexpected response from the healthcare server.'
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
  } catch {
    return {
      success: false,
      error: 'Unable to connect to the healthcare server. Please check your network connection.',
    };
  }
}

// ── Re-export audioUtils helpers for backwards-compat / convenience ────────
// base64ToAudioBlob stays canonical in audioUtils but can be imported here too.

export { base64ToAudioBlob } from '../features/voice/utils/audioUtils';
