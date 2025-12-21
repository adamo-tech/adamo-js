/**
 * WebCodecs Module
 *
 * Ultra-low-latency video decoding using WebCodecs API.
 * Provides ~5-17ms decode latency compared to browser's built-in decoder.
 */

export type {
  WebCodecsConfig,
  DecodedVideoFrame,
  WebCodecsStats,
  WebCodecsWorkerMessage,
  WebCodecsWorkerCommand,
  RTCEncodedVideoFrame,
  RTCTransformEvent,
  RTCRtpReceiverWithTransform,
} from './types';

export {
  isWebCodecsSupported,
  isRTCRtpScriptTransformSupported,
  isInsertableStreamsSupported,
  attachWebCodecsTransform,
  getVideoReceivers,
  getReceiverForTrack,
} from './transform';

export type { AttachTransformResult } from './transform';

// Note: The decoder worker is not exported as a module - it must be loaded
// via new Worker() with the correct path. Example:
//
// const worker = new Worker(
//   new URL('@adamo-tech/core/webcodecs/decoder-worker', import.meta.url),
//   { type: 'module' }
// );
