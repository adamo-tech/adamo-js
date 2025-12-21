/**
 * WebCodecs Transform Utilities
 *
 * Helpers for attaching WebCodecs transforms to WebRTC video receivers.
 * Supports both modern RTCRtpScriptTransform and legacy Insertable Streams APIs.
 */

import type { RTCRtpReceiverWithTransform, RTCEncodedVideoFrame } from './types';

/**
 * Check if WebCodecs is supported in the current environment
 */
export function isWebCodecsSupported(): boolean {
  return typeof VideoDecoder !== 'undefined';
}

/**
 * Check if RTCRtpScriptTransform is supported
 */
export function isRTCRtpScriptTransformSupported(): boolean {
  return typeof RTCRtpScriptTransform !== 'undefined';
}

/**
 * Check if Insertable Streams are supported
 */
export function isInsertableStreamsSupported(receiver: RTCRtpReceiver): boolean {
  return 'createEncodedStreams' in receiver;
}

/**
 * Result of attaching a WebCodecs transform
 */
export interface AttachTransformResult {
  success: boolean;
  method?: 'rtcRtpScriptTransform' | 'insertableStreams';
  error?: Error;
}

/**
 * Attach a WebCodecs transform to an RTCRtpReceiver
 *
 * Tries RTCRtpScriptTransform first (modern API), then falls back to
 * Insertable Streams if available.
 *
 * @param receiver - The RTCRtpReceiver to attach to
 * @param worker - The WebCodecs decoder worker
 * @returns Result indicating success/failure and method used
 *
 * @example
 * ```ts
 * const worker = new Worker(new URL('./decoder-worker.ts', import.meta.url), { type: 'module' });
 * const receiver = pc.getReceivers().find(r => r.track?.kind === 'video');
 *
 * const result = attachWebCodecsTransform(receiver, worker);
 * if (result.success) {
 *   console.log('Transform attached via:', result.method);
 * }
 * ```
 */
export function attachWebCodecsTransform(
  receiver: RTCRtpReceiver,
  worker: Worker
): AttachTransformResult {
  const extReceiver = receiver as RTCRtpReceiverWithTransform;

  // Try RTCRtpScriptTransform (modern API)
  if ('transform' in extReceiver && isRTCRtpScriptTransformSupported()) {
    try {
      extReceiver.transform = new RTCRtpScriptTransform(worker, { operation: 'decode' });
      return { success: true, method: 'rtcRtpScriptTransform' };
    } catch (e) {
      console.warn('[WebCodecs] RTCRtpScriptTransform failed:', e);
    }
  }

  // Fallback: Insertable Streams
  if (extReceiver.createEncodedStreams) {
    try {
      const { readable, writable } = extReceiver.createEncodedStreams();

      worker.postMessage(
        { type: 'init', readable, writable },
        [readable, writable] as unknown as Transferable[]
      );

      return { success: true, method: 'insertableStreams' };
    } catch (e) {
      console.warn('[WebCodecs] Insertable Streams failed:', e);
      return {
        success: false,
        error: new Error(`Insertable Streams failed: ${e}`),
      };
    }
  }

  return {
    success: false,
    error: new Error('Browser does not support WebRTC Encoded Transform APIs'),
  };
}

/**
 * Find video receivers from a peer connection
 */
export function getVideoReceivers(pc: RTCPeerConnection): RTCRtpReceiver[] {
  return pc.getReceivers().filter((r) => r.track?.kind === 'video');
}

/**
 * Find the receiver for a specific track
 */
export function getReceiverForTrack(
  pc: RTCPeerConnection,
  track: MediaStreamTrack
): RTCRtpReceiver | undefined {
  return pc.getReceivers().find((r) => r.track === track);
}
