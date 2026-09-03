/**
 * Microphone diagnostics — DEVELOPMENT ONLY utility.
 *
 * This function is intentionally NOT called in the normal production
 * recording flow. It exists purely as a debugging aid during development.
 *
 * Usage (dev console or a hidden debug panel):
 *   import { runMicrophoneDiagnostics } from './micDiagnostics';
 *   runMicrophoneDiagnostics().then(console.log);
 *
 * In production builds this function immediately returns null.
 */
export async function runMicrophoneDiagnostics(): Promise<Record<string, unknown> | null> {
  if (!import.meta.env.DEV) {
    console.warn('[micDiagnostics] This utility is for development use only.');
    return null;
  }

  const isSecure = typeof window !== 'undefined' ? window.isSecureContext : false;
  const protocol = typeof window !== 'undefined' ? window.location.protocol : '';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const hasMediaDevices = Boolean(typeof navigator !== 'undefined' && navigator.mediaDevices);
  const hasGetUserMedia = Boolean(hasMediaDevices && navigator.mediaDevices.getUserMedia);
  const capacitorPlatform = typeof (window as any)?.Capacitor?.getPlatform === 'function'
    ? (window as any).Capacitor.getPlatform()
    : 'web';

  console.log('[micDiagnostics] Environment:', {
    platform: capacitorPlatform,
    isSecureContext: isSecure,
    protocol,
    hostname: host,
    userAgent: ua,
    hasMediaDevices,
    hasGetUserMedia,
  });

  let audioInputs: MediaDeviceInfo[] = [];
  if (hasMediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      audioInputs = devices.filter((d) => d.kind === 'audioinput');
      console.log(`[micDiagnostics] Found ${audioInputs.length} audioinput device(s):`);
      audioInputs.forEach((dev, idx) => {
        console.log(`[micDiagnostics] Device #${idx + 1}:`, {
          deviceId: dev.deviceId || '(masked — grant permission first)',
          kind: dev.kind,
          label: dev.label || '(unlabeled)',
          groupId: dev.groupId,
        });
      });
    } catch (e) {
      console.warn('[micDiagnostics] enumerateDevices() error:', e);
    }
  }

  const result = {
    isSecure,
    protocol,
    hostname: host,
    userAgent: ua,
    hasMediaDevices,
    hasGetUserMedia,
    audioInputs,
    hasAnyAudioInput: audioInputs.length > 0,
  };

  console.log('[micDiagnostics] Full result:', result);
  return result;
}
