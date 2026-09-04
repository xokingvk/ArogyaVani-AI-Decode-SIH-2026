/**
 * useVoiceRecorder
 *
 * Manages the full MediaRecorder lifecycle and voice query dispatch.
 *
 * Responsibilities:
 *   - Capability checks (mediaDevices, MediaRecorder)
 *   - getUserMedia with NotReadableError fallback
 *   - MediaRecorder start / stop / chunk collection / Blob creation
 *   - sendVoiceQuery dispatch
 *   - Coordinating audio playback state (actual playback in audioUtils.ts)
 *   - Stream cleanup on stop and unmount
 *
 * NOT responsible for:
 *   - base64 decoding (audioUtils.base64ToAudioBlob)
 *   - Audio element creation/playback (audioUtils.playAudioResponse)
 *   - Device enumeration / diagnostics (micDiagnostics — dev only)
 *   - Rendering any UI
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { VoiceState, VoiceQuerySuccessResponse } from '../types/voiceTypes';
import {
  RECORDER_TIMESLICE_MS,
  VOICE_ERROR_MESSAGES,
  DEFAULT_VOICE_ERROR,
} from '../constants/voiceConstants';
import {
  getBestSupportedAudioMimeType,
  base64ToAudioBlob,
  playAudioResponse,
  stopAudioElement,
} from '../utils/audioUtils';
import { sendVoiceQuery, sendTextQuery } from '../../../services/voiceService';
import { incrementAIQuestionCount } from '../../../services/authService';
import { logSchemeCheck } from '../../../services/schemeCheckService';

export interface UseVoiceRecorderReturn {
  voiceState: VoiceState;
  transcription: string;
  aiAnswer: string;
  isSpeakingTts: boolean;
  errorMessage: string;
  startRecording: () => void;
  stopRecording: () => void;
  clearError: () => void;
  replayAudio: () => void;
  submitTextQuery: (text: string, languageCode?: string) => Promise<VoiceQuerySuccessResponse | null>;
}

function mapErrorToMessage(err: any): string {
  if (!err) return DEFAULT_VOICE_ERROR;
  const name = err.name || '';
  if (name && VOICE_ERROR_MESSAGES[name]) {
    return VOICE_ERROR_MESSAGES[name];
  }

  const msg = (err.message || '').toLowerCase();
  if (msg.includes('permission') || msg.includes('denied') || msg.includes('notallowed')) {
    return VOICE_ERROR_MESSAGES.NotAllowedError;
  }
  if (msg.includes('notfound') || msg.includes('no device') || msg.includes('devicesnotfound') || msg.includes('noaudiotracks')) {
    return VOICE_ERROR_MESSAGES.NotFoundError;
  }
  if (msg.includes('notreadable') || msg.includes('could not start') || msg.includes('busy') || msg.includes('trackstart')) {
    return VOICE_ERROR_MESSAGES.NotReadableError;
  }
  if (msg.includes('security')) {
    return VOICE_ERROR_MESSAGES.SecurityError;
  }
  if (msg.includes('abort')) {
    return VOICE_ERROR_MESSAGES.AbortError;
  }
  if (msg.includes('overconstrained')) {
    return VOICE_ERROR_MESSAGES.OverconstrainedError;
  }

  return DEFAULT_VOICE_ERROR;
}

export interface UseVoiceRecorderOptions {
  onResult?: (result: VoiceQuerySuccessResponse) => void;
}

export function useVoiceRecorder(options?: UseVoiceRecorderOptions): UseVoiceRecorderReturn {
  const [voiceState, setVoiceState]         = useState<VoiceState>('idle');
  const [transcription, setTranscription]   = useState('');
  const [aiAnswer, setAiAnswer]             = useState('');
  const [isSpeakingTts, setIsSpeakingTts]   = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');
  const onResultRef                         = useRef(options?.onResult);

  useEffect(() => {
    onResultRef.current = options?.onResult;
  }, [options?.onResult]);

  // Internal refs — not exposed to UI
  const mediaRecorderRef   = useRef<MediaRecorder | null>(null);
  const audioChunksRef     = useRef<Blob[]>([]);
  const streamRef          = useRef<MediaStream | null>(null);
  const currentAudioRef    = useRef<HTMLAudioElement | null>(null);
  const audioBlobRef       = useRef<Blob | null>(null);
  const isStartingRef      = useRef(false);

  // ── Audio playback helpers ───────────────────────────────────────────────

  const stopCurrentAudio = useCallback(() => {
    stopAudioElement(currentAudioRef.current);
    currentAudioRef.current = null;
    setIsSpeakingTts(false);
  }, []);

  const playBlob = useCallback((blob: Blob) => {
    stopCurrentAudio();
    const audio = playAudioResponse(
      blob,
      () => setIsSpeakingTts(true),
      () => {
        setIsSpeakingTts(false);
        currentAudioRef.current = null;
      },
    );
    currentAudioRef.current = audio;
  }, [stopCurrentAudio]);

  // ── Stream cleanup helper ────────────────────────────────────────────────

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch { /* ignore */ }
      });
      streamRef.current = null;
    }
  }, []);

  // ── startRecording ───────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    if (isStartingRef.current || voiceState === 'listening' || voiceState === 'processing') {
      return;
    }
    isStartingRef.current = true;
    setErrorMessage('');
    stopCurrentAudio();
    audioChunksRef.current = [];

    // Ensure only one microphone stream / recorder exists at a time
    releaseStream();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch { /* ignore */ }
    }
    mediaRecorderRef.current = null;

    try {
      // 1. Capability checks
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setErrorMessage(VOICE_ERROR_MESSAGES.NoMediaDevices);
        return;
      }
      if (typeof MediaRecorder === 'undefined') {
        setErrorMessage(VOICE_ERROR_MESSAGES.MediaRecorderUnsupported);
        return;
      }

      // 2. Open microphone via getUserMedia with NotReadableError fallback
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (firstErr: any) {
        if (firstErr.name === 'NotReadableError' || firstErr.name === 'TrackStartError') {
          if (import.meta.env.DEV) {
            console.log('[VoiceRecorder] NotReadableError — trying constrained fallback...');
          }
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
        } else {
          throw firstErr;
        }
      }

      // 3. Verify tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        throw Object.assign(new Error('NoAudioTracks'), { name: 'NoAudioTracks' });
      }
      streamRef.current = stream;

      // 4. Negotiate MIME type and create MediaRecorder
      const mimeType = getBestSupportedAudioMimeType();
      if (import.meta.env.DEV) {
        console.log('[VoiceRecorder] MIME type selected:', mimeType ?? 'browser default');
      }
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data?.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 5. onstop: ordered cleanup then dispatch (per spec from user)
      recorder.onstop = async () => {
        const chunks = [...audioChunksRef.current];

        // A. Stop tracks after recorder finishes producing data
        releaseStream();

        // B. Validate chunks
        if (chunks.length === 0) {
          setVoiceState('idle');
          setErrorMessage(VOICE_ERROR_MESSAGES.EmptyRecording);
          return;
        }

        // C. Create Blob
        const finalMime = recorder.mimeType || mimeType || 'audio/webm';
        const recordedBlob = new Blob(chunks, { type: finalMime });

        if (recordedBlob.size === 0) {
          setVoiceState('idle');
          setErrorMessage(VOICE_ERROR_MESSAGES.EmptyRecording);
          return;
        }

        // D. Dispatch to backend
        setVoiceState('processing');
        try {
          const result = await sendVoiceQuery(recordedBlob);
          if (result.success) {
            setTranscription(result.transcript);
            setAiAnswer(result.response_text);
            setVoiceState('response');

            if (onResultRef.current) {
              onResultRef.current(result);
            }

            // Atomically increment AI question count for normal/general health queries only
            // (Do NOT increment for mode === 'scheme_rag' or document processing)
            if (result.mode !== 'scheme_rag') {
              incrementAIQuestionCount().catch((err) => {
                if (import.meta.env.DEV) {
                  console.warn('[useVoiceRecorder] Could not increment AI question count:', err);
                }
              });
            } else {
              const matchedSchemes = (result.schemes || []).map((s) => s.schemeName || s.schemeId);
              logSchemeCheck(result.transcript, matchedSchemes).catch((err) => {
                if (import.meta.env.DEV) {
                  console.warn('[useVoiceRecorder] logSchemeCheck error:', err);
                }
              });
            }

            if (result.audio_base64) {
              if (import.meta.env.DEV) {
                console.log('[useVoiceRecorder] Received audio_base64:', {
                  base64Length: result.audio_base64.length,
                  textLength: result.response_text?.length,
                  languageCode: result.language_code,
                  mode: result.mode,
                });
              }
              // Decode and play via audioUtils — hook only tracks playback state
              const audioBlob = base64ToAudioBlob(result.audio_base64);
              audioBlobRef.current = audioBlob;
              playBlob(audioBlob);
            }
          } else {
            setVoiceState('idle');
            setErrorMessage(result.error || VOICE_ERROR_MESSAGES.NetworkError);
          }
        } catch (dispatchErr) {
          if (import.meta.env.DEV) {
            console.error('[useVoiceRecorder] Dispatch error:', dispatchErr);
          }
          setVoiceState('idle');
          setErrorMessage(VOICE_ERROR_MESSAGES.NetworkError);
        }
      };

      // 6. Start
      recorder.start(RECORDER_TIMESLICE_MS);
      setVoiceState('listening');
      setTranscription('');
      setAiAnswer('');
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[VoiceRecorder] Error during startRecording:', err);
      }
      releaseStream();
      setVoiceState('idle');
      setErrorMessage(mapErrorToMessage(err));
    } finally {
      isStartingRef.current = false;
    }
  }, [voiceState, stopCurrentAudio, releaseStream, playBlob]);

  // ── stopRecording ────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    try {
      if (recorder.state === 'recording' && typeof recorder.requestData === 'function') {
        recorder.requestData();
      }
    } catch { /* non-fatal */ }

    try {
      recorder.stop();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[VoiceRecorder] Error stopping MediaRecorder:', err);
      }
      releaseStream();
      setVoiceState('idle');
    }
  }, [releaseStream]);

  // ── clearError ───────────────────────────────────────────────────────────

  const clearError = useCallback(() => setErrorMessage(''), []);

  // ── replayAudio ──────────────────────────────────────────────────────────
  // Re-plays the last TTS audio blob or falls back to Web Speech API.

  const replayAudio = useCallback(() => {
    if (isSpeakingTts) {
      stopCurrentAudio();
      return;
    }
    if (audioBlobRef.current) {
      playBlob(audioBlobRef.current);
      return;
    }
    // Web Speech fallback for when there is no TTS blob
    if (aiAnswer && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(aiAnswer);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeakingTts(true);
      utterance.onend   = () => setIsSpeakingTts(false);
      utterance.onerror = () => setIsSpeakingTts(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeakingTts, aiAnswer, stopCurrentAudio, playBlob]);

  // ── submitTextQuery ──────────────────────────────────────────────────────
  // Submits a typed text query directly to the shared AI pipeline.

  const submitTextQuery = useCallback(async (text: string, languageCode: string = 'en-IN') => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    stopCurrentAudio();
    setVoiceState('processing');
    setTranscription(trimmed);
    setAiAnswer('');
    setErrorMessage('');

    try {
      const result = await sendTextQuery(trimmed, languageCode);
      if (result.success) {
        setVoiceState('response');
        setAiAnswer(result.response_text);

        // Increment question count for successful normal general AI queries
        if (result.mode === 'general') {
          incrementAIQuestionCount().catch((err) => {
            if (import.meta.env.DEV) {
              console.warn('[useVoiceRecorder] incrementAIQuestionCount warning:', err);
            }
          });
        } else if (result.mode === 'scheme_rag' || (result.schemes && result.schemes.length > 0)) {
          const matchedSchemes = (result.schemes || []).map((s) => s.schemeName || s.schemeId);
          logSchemeCheck(trimmed, matchedSchemes).catch((err) => {
            if (import.meta.env.DEV) {
              console.warn('[useVoiceRecorder] logSchemeCheck error:', err);
            }
          });
        }

        if (onResultRef.current) {
          onResultRef.current(result);
        }

        if (result.audio_base64) {
          const audioBlob = base64ToAudioBlob(result.audio_base64);
          audioBlobRef.current = audioBlob;
          playBlob(audioBlob);
        }
        return result;
      } else {
        setVoiceState('idle');
        setErrorMessage(result.error || VOICE_ERROR_MESSAGES.NetworkError);
        return null;
      }
    } catch {
      setVoiceState('idle');
      setErrorMessage(VOICE_ERROR_MESSAGES.NetworkError);
      return null;
    }
  }, [stopCurrentAudio, playBlob]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
      }
      releaseStream();
    };
  }, [stopCurrentAudio, releaseStream]);

  return {
    voiceState,
    transcription,
    aiAnswer,
    isSpeakingTts,
    errorMessage,
    startRecording,
    stopRecording,
    clearError,
    replayAudio,
    submitTextQuery,
  };
}
