/**
 * Audio utilities.
 * Pure functions for MIME detection, base64 decoding, and audio playback.
 * No React state. No MediaRecorder. No API calls.
 */
import { AUDIO_MIME_PRIORITY } from '../constants/voiceConstants';

// ── MIME type negotiation ──────────────────────────────────────────────────

/**
 * Returns the best audio MIME type supported by MediaRecorder on this device,
 * or undefined to let MediaRecorder choose its own default.
 */
export function getBestSupportedAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }
  if (typeof MediaRecorder.isTypeSupported === 'function') {
    for (const candidate of AUDIO_MIME_PRIORITY) {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    }
  }
  return undefined;
}

// ── Base64 → Blob conversion ───────────────────────────────────────────────

/**
 * Converts a Base64-encoded audio string (from backend TTS) into a playable Blob.
 * @param base64Data  Raw base64 string (no data-URI prefix).
 * @param mimeType    Audio MIME type; defaults to 'audio/wav'.
 */
export function base64ToAudioBlob(base64Data: string, mimeType = 'audio/wav'): Blob {
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

// ── Audio element playback ─────────────────────────────────────────────────

/**
 * Creates an HTMLAudioElement and starts playback of the given blob.
 * Calls onStart when playback begins, onEnd when it finishes or errors.
 * Returns the audio element so callers can pause/stop it later.
 */
export function playAudioResponse(
  blob: Blob,
  onStart: () => void,
  onEnd: () => void,
): HTMLAudioElement {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  const cleanup = () => {
    onEnd();
    URL.revokeObjectURL(url);
  };

  audio.onended = cleanup;
  audio.onerror = (e) => {
    if (import.meta.env.DEV) {
      console.warn('[audioUtils] Audio playback error:', e);
    }
    cleanup();
  };

  audio.play()
    .then(() => onStart())
    .catch((err) => {
      if (import.meta.env.DEV) {
        console.warn('[audioUtils] Autoplay blocked or playback failed:', err);
      }
      cleanup();
    });

  return audio;
}

/**
 * Safely stops an audio element if it is playing.
 */
export function stopAudioElement(audio: HTMLAudioElement | null): void {
  if (audio) {
    audio.pause();
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
