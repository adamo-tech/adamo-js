/**
 * WebCodecs Decoder Worker
 *
 * This worker intercepts encoded video frames from WebRTC streams
 * and decodes them using WebCodecs for ultra-low latency (~5-17ms decode time).
 *
 * Two APIs are supported:
 * 1. RTCRtpScriptTransform (modern, preferred)
 * 2. Insertable Streams / createEncodedStreams (fallback)
 *
 * Usage:
 * ```ts
 * const worker = new Worker(new URL('./decoder-worker.ts', import.meta.url), { type: 'module' });
 *
 * // Configure decoder
 * worker.postMessage({ type: 'configure', codec: 'avc1.42001f', width: 1920, height: 1080 });
 *
 * // Attach to RTCRtpReceiver
 * receiver.transform = new RTCRtpScriptTransform(worker, { operation: 'decode' });
 *
 * // Handle decoded frames
 * worker.onmessage = (e) => {
 *   if (e.data.type === 'frame') {
 *     ctx.drawImage(e.data.frame, 0, 0);
 *     e.data.frame.close();
 *   }
 * };
 * ```
 */

// Type definitions for WebRTC Encoded Transform APIs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WorkerSelf = {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  postMessage(message: unknown, options?: { transfer?: Transferable[] }): void;
  onmessage: ((event: MessageEvent) => void) | null;
  RTCTransformEvent?: new () => WorkerRTCTransformEvent;
  onrtctransform?: ((event: WorkerRTCTransformEvent) => void) | null;
};

// Cast global self to our worker type
const workerSelf = (globalThis as unknown) as WorkerSelf;

interface WorkerEncodedVideoFrame {
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

interface WorkerRTCTransformEvent extends Event {
  transformer: {
    readable: ReadableStream<WorkerEncodedVideoFrame>;
    writable: WritableStream<WorkerEncodedVideoFrame>;
    options?: { operation?: string; codec?: string };
  };
}

interface DecoderConfig {
  codec: string;
  codedWidth: number;
  codedHeight: number;
  optimizeForLatency: boolean;
  hardwareAcceleration: 'prefer-hardware' | 'prefer-software' | 'no-preference';
}

// Worker state
let decoder: VideoDecoder | null = null;
let latestFrame: VideoFrame | null = null;
let frameCount = 0;
let isConfigured = false;
let pendingConfig: DecoderConfig | null = null;

// Stats tracking
let decodeStartTime = 0;
let lastDecodeLatency = 0;
let totalDecodeLatency = 0;
let decodedFrameCount = 0;

/**
 * Initialize the VideoDecoder with low-latency settings
 */
function initDecoder(config: DecoderConfig) {
  if (decoder && decoder.state !== 'closed') {
    decoder.close();
  }

  decoder = new VideoDecoder({
    output: handleDecodedFrame,
    error: handleDecodeError,
  });

  decoder.configure({
    codec: config.codec,
    codedWidth: config.codedWidth,
    codedHeight: config.codedHeight,
    optimizeForLatency: config.optimizeForLatency,
    hardwareAcceleration: config.hardwareAcceleration,
  });

  isConfigured = true;
  console.log('[WebCodecs Worker] Decoder configured:', config);
}

/**
 * Handle decoded VideoFrame output
 */
function handleDecodedFrame(frame: VideoFrame) {
  // Calculate decode latency
  const now = performance.now();
  lastDecodeLatency = now - decodeStartTime;
  totalDecodeLatency += lastDecodeLatency;
  decodedFrameCount++;

  // Always keep only the latest frame (drop older frames for lowest latency)
  if (latestFrame) {
    latestFrame.close();
  }
  latestFrame = frame;
  frameCount++;

  // Notify main thread that a new frame is ready
  self.postMessage({
    type: 'frameReady',
    frameNumber: frameCount,
    decodeLatencyMs: lastDecodeLatency.toFixed(2),
    avgDecodeLatencyMs: (totalDecodeLatency / decodedFrameCount).toFixed(2),
  });
}

/**
 * Handle decoder errors
 */
function handleDecodeError(error: DOMException) {
  console.error('[WebCodecs Worker] Decode error:', error);
  self.postMessage({
    type: 'error',
    message: error.message,
    name: error.name,
  });

  // Request keyframe from server on decode error
  self.postMessage({ type: 'requestKeyframe' });
}

/**
 * Decode an encoded video chunk
 */
function decodeFrame(data: ArrayBuffer, type: 'key' | 'delta', timestamp: number) {
  if (!decoder || decoder.state !== 'configured') {
    console.warn('[WebCodecs Worker] Decoder not ready, dropping frame');
    return;
  }

  decodeStartTime = performance.now();

  try {
    decoder.decode(
      new EncodedVideoChunk({
        type,
        timestamp,
        data,
      })
    );
  } catch (e) {
    console.error('[WebCodecs Worker] Failed to decode:', e);
  }
}

/**
 * Process encoded frames from RTCRtpScriptTransform or Insertable Streams
 */
async function processEncodedFrames(
  readable: ReadableStream<WorkerEncodedVideoFrame>,
  _writable: WritableStream<WorkerEncodedVideoFrame>
) {
  const reader = readable.getReader();
  console.log('[WebCodecs Worker] Starting encoded frame processing');

  try {
    while (true) {
      const { done, value: encodedFrame } = await reader.read();
      if (done) {
        console.log('[WebCodecs Worker] Stream ended');
        break;
      }

      // Extract frame data
      const data = encodedFrame.data;
      const isKeyframe = encodedFrame.type === 'key';
      const timestamp = encodedFrame.timestamp;

      // Auto-configure decoder on first keyframe if not configured
      if (!isConfigured && isKeyframe) {
        const metadata = encodedFrame.getMetadata();
        const width = metadata.width || 1920;
        const height = metadata.height || 1080;

        initDecoder({
          codec: 'avc1.42001f', // H.264 Baseline Level 3.1
          codedWidth: width,
          codedHeight: height,
          optimizeForLatency: true,
          hardwareAcceleration: 'prefer-hardware',
        });
      }

      // Decode with WebCodecs
      decodeFrame(data, isKeyframe ? 'key' : 'delta', timestamp);

      // IMPORTANT: We do NOT enqueue to writable - we're bypassing the browser's decoder
      // The browser's video element won't receive these frames
    }
  } catch (e) {
    console.error('[WebCodecs Worker] Transform error:', e);
    self.postMessage({ type: 'error', message: String(e) });
  } finally {
    reader.releaseLock();
  }
}

// Handle RTCRtpScriptTransform (modern API)
if (typeof workerSelf.RTCTransformEvent !== 'undefined') {
  workerSelf.onrtctransform = (event: WorkerRTCTransformEvent) => {
    const transformer = event.transformer;
    console.log('[WebCodecs Worker] RTCRtpScriptTransform attached');

    // Apply pending config if available
    if (pendingConfig) {
      initDecoder(pendingConfig);
    }

    processEncodedFrames(transformer.readable, transformer.writable);
  };
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent) => {
  const { type, ...data } = event.data;

  switch (type) {
    case 'init':
      // Insertable Streams fallback - readable/writable passed via postMessage
      if (data.readable && data.writable) {
        console.log('[WebCodecs Worker] Insertable Streams mode');
        if (pendingConfig) {
          initDecoder(pendingConfig);
        }
        processEncodedFrames(data.readable, data.writable);
      }
      break;

    case 'configure':
      // Configure decoder with specific settings
      pendingConfig = {
        codec: data.codec || 'avc1.42001f',
        codedWidth: data.width || 1920,
        codedHeight: data.height || 1080,
        optimizeForLatency: data.optimizeForLatency ?? true,
        hardwareAcceleration: data.hardwareAcceleration || 'prefer-hardware',
      };

      if (decoder) {
        initDecoder(pendingConfig);
      }
      break;

    case 'getFrame':
      // Main thread requesting the latest decoded frame
      if (latestFrame) {
        // Transfer the VideoFrame to main thread
        self.postMessage(
          {
            type: 'frame',
            frame: latestFrame,
            timestamp: latestFrame.timestamp,
            width: latestFrame.displayWidth,
            height: latestFrame.displayHeight,
          },
          { transfer: [latestFrame] }
        );
        latestFrame = null;
      } else {
        self.postMessage({ type: 'noFrame' });
      }
      break;

    case 'getStats':
      // Return decoder statistics
      self.postMessage({
        type: 'stats',
        frameCount,
        decodedFrameCount,
        lastDecodeLatencyMs: lastDecodeLatency,
        avgDecodeLatencyMs: decodedFrameCount > 0 ? totalDecodeLatency / decodedFrameCount : 0,
        decoderState: decoder?.state || 'not initialized',
        queueSize: decoder?.decodeQueueSize || 0,
      });
      break;

    case 'reset':
      // Reset decoder state
      if (decoder && decoder.state !== 'closed') {
        decoder.reset();
      }
      frameCount = 0;
      decodedFrameCount = 0;
      totalDecodeLatency = 0;
      if (latestFrame) {
        latestFrame.close();
        latestFrame = null;
      }
      console.log('[WebCodecs Worker] Decoder reset');
      break;

    case 'close':
      // Clean up
      if (decoder && decoder.state !== 'closed') {
        decoder.close();
      }
      if (latestFrame) {
        latestFrame.close();
        latestFrame = null;
      }
      console.log('[WebCodecs Worker] Decoder closed');
      break;

    default:
      console.warn('[WebCodecs Worker] Unknown message type:', type);
  }
};

// Log worker initialization
console.log('[WebCodecs Worker] Initialized');
self.postMessage({ type: 'ready' });
