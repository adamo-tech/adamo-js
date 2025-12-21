/**
 * WebCodecs Types
 *
 * Type definitions for WebCodecs-based video decoding.
 */

/**
 * Configuration for the WebCodecs video decoder
 */
export interface WebCodecsConfig {
  /** H.264 codec profile (e.g., 'avc1.42001f' for Baseline Level 3.1) */
  codec?: string;
  /** Video width */
  width?: number;
  /** Video height */
  height?: number;
  /** Optimize for low latency decoding */
  optimizeForLatency?: boolean;
  /** Hardware acceleration preference */
  hardwareAcceleration?: 'prefer-hardware' | 'prefer-software' | 'no-preference';
}

/**
 * Decoded video frame data
 */
export interface DecodedVideoFrame {
  /** The VideoFrame object (must be closed after use) */
  frame: VideoFrame;
  /** Frame timestamp in microseconds */
  timestamp: number;
  /** Display width */
  width: number;
  /** Display height */
  height: number;
}

/**
 * Statistics from the WebCodecs decoder
 */
export interface WebCodecsStats {
  /** Total frames received */
  frameCount: number;
  /** Total frames successfully decoded */
  decodedFrameCount: number;
  /** Last decode latency in milliseconds */
  lastDecodeLatencyMs: number;
  /** Average decode latency in milliseconds */
  avgDecodeLatencyMs: number;
  /** Current decoder state */
  decoderState: string;
  /** Number of frames in decode queue */
  queueSize: number;
}

/**
 * Messages sent from worker to main thread
 */
export type WebCodecsWorkerMessage =
  | { type: 'ready' }
  | { type: 'frameReady'; frameNumber: number; decodeLatencyMs: string; avgDecodeLatencyMs: string }
  | { type: 'frame'; frame: VideoFrame; timestamp: number; width: number; height: number }
  | { type: 'noFrame' }
  | { type: 'stats' } & WebCodecsStats
  | { type: 'error'; message: string; name?: string }
  | { type: 'requestKeyframe' };

/**
 * Messages sent from main thread to worker
 */
export type WebCodecsWorkerCommand =
  | { type: 'init'; readable: ReadableStream; writable: WritableStream }
  | { type: 'configure' } & WebCodecsConfig
  | { type: 'getFrame' }
  | { type: 'getStats' }
  | { type: 'reset' }
  | { type: 'close' };

/**
 * Type definitions for WebRTC Encoded Transform APIs
 * These are not yet in standard TypeScript definitions
 */

export interface RTCEncodedVideoFrame {
  type: 'key' | 'delta' | 'empty';
  timestamp: number;
  data: ArrayBuffer;
  getMetadata(): {
    synchronizationSource?: number;
    payloadType?: number;
    contributingSources?: number[];
    frameId?: number;
    dependencies?: number[];
    width?: number;
    height?: number;
    spatialIndex?: number;
    temporalIndex?: number;
  };
}

export interface RTCTransformEvent extends Event {
  transformer: {
    readable: ReadableStream<RTCEncodedVideoFrame>;
    writable: WritableStream<RTCEncodedVideoFrame>;
    options?: { operation?: string; codec?: string };
  };
}

/**
 * Extended RTCRtpReceiver with encoded transform support
 */
export interface RTCRtpReceiverWithTransform extends RTCRtpReceiver {
  transform: RTCRtpScriptTransform | null;
  createEncodedStreams?: () => {
    readable: ReadableStream<RTCEncodedVideoFrame>;
    writable: WritableStream<RTCEncodedVideoFrame>;
  };
}
