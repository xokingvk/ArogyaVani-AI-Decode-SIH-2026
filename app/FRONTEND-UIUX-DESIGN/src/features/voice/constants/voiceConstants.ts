/**
 * Voice feature constants.
 * Centralizes waveform config, MIME priority, and user-visible error messages.
 */

// ── Symmetrical waveform bar configuration ────────────────────────────────

export interface WaveBar {
  minH: number;
  maxH: number;
  delay: number;
}

export const SYMMETRICAL_WAVE_BARS: WaveBar[] = [
  { minH: 4,  maxH: 12, delay: 0.32 },
  { minH: 6,  maxH: 18, delay: 0.24 },
  { minH: 9,  maxH: 24, delay: 0.16 },
  { minH: 13, maxH: 28, delay: 0.08 },
  { minH: 16, maxH: 30, delay: 0    },
  { minH: 13, maxH: 28, delay: 0.08 },
  { minH: 9,  maxH: 24, delay: 0.16 },
  { minH: 6,  maxH: 18, delay: 0.24 },
  { minH: 4,  maxH: 12, delay: 0.32 },
];

// ── MediaRecorder MIME type priority list ─────────────────────────────────
// Ordered from most preferred (Chrome/Android native) to fallback.

export const AUDIO_MIME_PRIORITY: string[] = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/aac',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/wav',
];

// ── MediaRecorder timeslice (ms) ──────────────────────────────────────────
// Controls how often ondataavailable fires; 250ms keeps chunk sizes small.

export const RECORDER_TIMESLICE_MS = 250;

// ── User-facing voice error messages ──────────────────────────────────────
// Mapping from DOMException / custom error names to human-readable strings.
// Keep these concise — they appear inside the small voice card banner.

export const VOICE_ERROR_MESSAGES: Record<string, string> = {
  NotAllowedError:    'Microphone permission is required to use voice.',
  PermissionDeniedError: 'Microphone permission is required to use voice.',
  NotFoundError:      'No microphone input device was found.',
  DevicesNotFoundError: 'No microphone input device was found.',
  NoAudioTracks:      'No microphone input device was found.',
  NotReadableError:   'Microphone is currently busy or cannot be accessed by another app.',
  TrackStartError:    'Microphone is currently busy or cannot be accessed by another app.',
  OverconstrainedError: 'Microphone settings are not supported on this device.',
  NotSupportedError:  'Audio format is not supported on this device.',
  MediaRecorderUnsupported: 'Audio recording is not supported on this browser/device.',
  NoMediaDevices:     'Audio recording is not supported on this browser/device.',
  EmptyRecording:     'No voice detected or recording was empty. Please speak clearly and try again.',
  NetworkError:       'Unable to connect to the healthcare server. Please check your network connection.',
};

export const DEFAULT_VOICE_ERROR = 'Microphone access failed. Please check device permissions.';
