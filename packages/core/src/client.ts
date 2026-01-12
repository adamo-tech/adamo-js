/**
 * Adamo Client
 *
 * Core class for robot teleoperation via WebRTC.
 * Provides a simple API for connecting, receiving video, and sending controls.
 */

import { WebRTCConnection } from './webrtc/connection';
import type { SignalingConfig, WebRTCConnectionState } from './webrtc/types';
import {
  attachWebCodecsTransform,
  getReceiverForTrack,
  isWebCodecsSupported,
} from './webcodecs/transform';
import type { DecodedVideoFrame } from './webcodecs/types';
import { StreamQuality } from './types';
import type {
  AdamoClientConfig,
  AdamoClientEvents,
  ConnectionState,
  VideoTrack,
  ControlMessage,
  HeartbeatState,
  NetworkStats,
  TrackStreamStats,
  NavGoal,
  PongMessage,
  RobotStats,
  LatencyBreakdown,
} from './types';

const DEFAULT_CONFIG: AdamoClientConfig & { debug: boolean; useWebCodecs: boolean; codecProfile: string; hardwareAcceleration: 'prefer-hardware' | 'prefer-software' | 'no-preference' } = {
  debug: false,
  useWebCodecs: false,
  codecProfile: 'avc1.42001f',
  hardwareAcceleration: 'prefer-hardware',
  webCodecsWorkerUrl: undefined,
};

/**
 * Adamo Client - Core class for teleoperation via WebRTC
 *
 * Provides a simple API for:
 * - Connecting to a robot
 * - Receiving video streams
 * - Sending control data (gamepad)
 * - Heartbeat monitoring
 *
 * @example
 * ```ts
 * const client = new AdamoClient({ debug: true });
 *
 * client.on('videoTrackReceived', (track) => {
 *   videoElement.srcObject = new MediaStream([track.mediaStreamTrack]);
 * });
 *
 * client.on('dataChannelOpen', () => {
 *   console.log('Ready to send controls!');
 * });
 *
 * await client.connect({
 *   serverUrl: 'wss://relay.example.com',
 *   roomId: 'robot-1',
 *   token: 'jwt...',
 * });
 *
 * // Send control data
 * client.sendControl({
 *   controller1: { axes: [0, 0.5], buttons: [0, 1] },
 *   timestamp: Date.now(),
 * });
 * ```
 */
export class AdamoClient {
  private connection: WebRTCConnection | null = null;
  private config: AdamoClientConfig & Required<Omit<AdamoClientConfig, 'webCodecsWorkerUrl'>>;
  private eventHandlers: Map<keyof AdamoClientEvents, Set<Function>> = new Map();
  private _connectionState: ConnectionState = 'disconnected';
  private _videoTracks: Map<string, VideoTrack> = new Map();
  private _dataChannelOpen = false;

  // WebCodecs support
  private decoderWorker: Worker | null = null;
  private webCodecsEnabled = false;

  // Stats collection
  private statsIntervalId: ReturnType<typeof setInterval> | null = null;
  private _networkStats: NetworkStats | null = null;
  private _trackStats: Map<string, TrackStreamStats> = new Map();
  private lastBytesReceived: Map<string, number> = new Map();
  private lastFramesDecoded: Map<string, number> = new Map();
  private lastStatsTime = 0;
  private _lastFrameTime: Map<string, number> = new Map();

  // Ping/pong latency measurement
  private pingSequence = 0;
  private pendingPings: Map<number, number> = new Map(); // id -> sentTimestamp
  private _lastApplicationRtt = 0;
  private _lastRobotStats: RobotStats | null = null;
  private pingIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: AdamoClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as typeof this.config;
  }

  /**
   * Get the current connection state
   */
  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  /**
   * Check if data channel is open and ready for sending
   */
  get dataChannelOpen(): boolean {
    return this._dataChannelOpen;
  }

  /**
   * Get all video tracks as a Map (keyed by track name)
   */
  get videoTracks(): Map<string, VideoTrack> {
    return this._videoTracks;
  }

  /**
   * Get a specific video track by name (for backwards compatibility)
   * Returns the first track if no name specified, or null if no tracks
   */
  get videoTrack(): VideoTrack | null {
    if (this._videoTracks.size === 0) return null;
    return this._videoTracks.values().next().value ?? null;
  }

  /**
   * Get current network statistics
   */
  get networkStats(): NetworkStats | null {
    return this._networkStats;
  }

  /**
   * Get track streaming statistics (Map keyed by track name)
   */
  get trackStats(): Map<string, TrackStreamStats> {
    return this._trackStats;
  }

  /**
   * Get the last frame time for a specific track (for staleness checking)
   */
  getLastFrameTime(trackName?: string): number {
    if (!trackName) {
      // Return the most recent frame time across all tracks
      let maxTime = 0;
      for (const time of this._lastFrameTime.values()) {
        if (time > maxTime) maxTime = time;
      }
      return maxTime;
    }
    return this._lastFrameTime.get(trackName) ?? 0;
  }

  /**
   * Check if WebCodecs mode is enabled
   */
  get useWebCodecs(): boolean {
    return this.webCodecsEnabled;
  }

  /**
   * Get the last application-level RTT (ping/pong round-trip) in milliseconds
   */
  get applicationRtt(): number {
    return this._lastApplicationRtt;
  }

  /**
   * Get the last robot stats received (encoder latency, etc.)
   */
  get robotStats(): RobotStats | null {
    return this._lastRobotStats;
  }

  /**
   * Connect to the robot
   */
  async connect(signaling: SignalingConfig): Promise<void> {
    // Disconnect any existing connection
    if (this.connection) {
      this.disconnect();
    }

    this.setConnectionState('connecting');

    // Create WebRTC connection
    this.connection = new WebRTCConnection({
      signaling,
      debug: this.config.debug,
      onTrack: (track, streams) => this.handleTrack(track, streams),
      onConnectionStateChange: (state) => this.handleConnectionStateChange(state),
      onDataChannelOpen: () => this.handleDataChannelOpen(),
      onDataChannelClose: () => this.handleDataChannelClose(),
      onDataChannelMessage: (data) => this.handleDataChannelMessage(data),
      onError: (error) => this.emit('error', error),
    });

    try {
      await this.connection.connect();
    } catch (error) {
      this.setConnectionState('disconnected');
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Disconnect from the robot
   */
  disconnect(): void {
    this.stopStatsCollection();
    this.disableWebCodecs();

    if (this.connection) {
      this.connection.disconnect();
      this.connection = null;
    }

    this._videoTracks.clear();
    this._trackStats.clear();
    this.lastBytesReceived.clear();
    this.lastFramesDecoded.clear();
    this._lastFrameTime.clear();
    this._dataChannelOpen = false;
    this.setConnectionState('disconnected');
  }

  /**
   * Get a video track by name
   * @param name Track name/topic (e.g., 'front_camera')
   * @returns The video track or null if not found
   */
  getVideoTrack(name?: string): VideoTrack | null {
    if (!name) {
      // Return first track for backwards compatibility
      if (this._videoTracks.size === 0) return null;
      return this._videoTracks.values().next().value ?? null;
    }
    return this._videoTracks.get(name) ?? null;
  }

  /**
   * Get all video tracks as an array
   */
  getVideoTracks(): VideoTrack[] {
    return Array.from(this._videoTracks.values());
  }

  /**
   * Get track names (topics) of all available video tracks
   */
  getTrackNames(): string[] {
    return Array.from(this._videoTracks.keys());
  }

  /**
   * Register a callback for when video track becomes available
   * @returns Unsubscribe function
   */
  onVideoTrack(callback: (track: VideoTrack) => void): () => void {
    // If tracks already exist, call immediately for each
    for (const track of this._videoTracks.values()) {
      callback(track);
    }

    // Register for future updates
    return this.on('videoTrackReceived', callback);
  }

  /**
   * Enable WebCodecs ultra-low-latency decoding.
   *
   * The worker can be provided via config.webCodecsWorkerUrl as:
   * - A Worker instance (recommended for bundler compatibility)
   * - A URL or string URL pointing to the worker file
   *
   * If no worker is provided, this will throw an error.
   *
   * @example
   * ```ts
   * // Create worker with your bundler's syntax
   * const worker = new Worker(
   *   new URL('@adamo-tech/core/dist/webcodecs/decoder-worker.mjs', import.meta.url),
   *   { type: 'module' }
   * );
   * const client = new AdamoClient({ webCodecsWorkerUrl: worker });
   * client.enableWebCodecs();
   * ```
   */
  enableWebCodecs(): void {
    if (this.webCodecsEnabled) return;

    if (!isWebCodecsSupported()) {
      this.emit('error', new Error('WebCodecs is not supported in this browser'));
      return;
    }

    const workerConfig = this.config.webCodecsWorkerUrl;

    if (!workerConfig) {
      this.emit(
        'error',
        new Error(
          'WebCodecs worker not configured. Provide webCodecsWorkerUrl in AdamoClient config. ' +
            'See documentation for bundler-specific instructions.'
        )
      );
      return;
    }

    try {
      // Accept a Worker instance directly, or create one from URL
      if (workerConfig instanceof Worker) {
        this.decoderWorker = workerConfig;
      } else {
        const url = typeof workerConfig === 'string' ? new URL(workerConfig) : workerConfig;
        this.decoderWorker = new Worker(url, { type: 'module' });
      }

      this.decoderWorker.onmessage = (event) => this.handleWorkerMessage(event);

      // Configure decoder
      this.decoderWorker.postMessage({
        type: 'configure',
        codec: this.config.codecProfile,
        optimizeForLatency: true,
        hardwareAcceleration: this.config.hardwareAcceleration,
      });

      this.webCodecsEnabled = true;

      // If we already have video tracks, attach transform to each
      if (this._videoTracks.size > 0 && this.connection) {
        const pc = this.connection.getPeerConnection();
        if (pc) {
          for (const track of this._videoTracks.values()) {
            const receiver = getReceiverForTrack(pc, track.mediaStreamTrack);
            if (receiver) {
              attachWebCodecsTransform(receiver, this.decoderWorker);
            }
          }
        }
      }

      this.log('WebCodecs enabled');
    } catch (e) {
      this.emit('error', new Error(`Failed to create WebCodecs worker: ${e}`));
    }
  }

  /**
   * Disable WebCodecs and switch back to standard video decoding
   */
  disableWebCodecs(): void {
    if (!this.webCodecsEnabled) return;

    if (this.decoderWorker) {
      this.decoderWorker.postMessage({ type: 'close' });
      this.decoderWorker.terminate();
      this.decoderWorker = null;
    }

    this.webCodecsEnabled = false;
    this.log('WebCodecs disabled');
  }

  /**
   * Register a callback for decoded frames (WebCodecs mode)
   * @returns Unsubscribe function
   */
  onDecodedFrame(callback: (frame: DecodedVideoFrame) => void): () => void {
    return this.on('decodedFrame', callback);
  }

  /**
   * Send control data to the robot
   * @returns true if sent, false if data channel not open
   */
  sendControl(data: ControlMessage): boolean {
    if (!this.connection) return false;
    return this.connection.sendControl(data);
  }

  /**
   * Send heartbeat state to the robot
   * @returns true if sent, false if data channel not open
   */
  sendHeartbeat(state: HeartbeatState): boolean {
    if (!this.connection) return false;
    return this.connection.sendControl({
      type: 'heartbeat',
      state,
      timestamp: Date.now(),
    } as unknown as ControlMessage);
  }

  /**
   * Send a navigation goal to Nav2
   * @param goal - Navigation goal with x, y, theta
   * @returns Promise that resolves when goal is sent
   */
  async sendNavGoal(goal: NavGoal): Promise<void> {
    if (!this.connection) {
      throw new Error('Not connected');
    }
    const success = this.connection.sendControl({
      type: 'nav_goal',
      goal,
      timestamp: Date.now(),
    } as unknown as ControlMessage);
    if (!success) {
      throw new Error('Data channel not open');
    }
  }

  /**
   * Add an event listener
   * @returns Unsubscribe function
   */
  on<K extends keyof AdamoClientEvents>(event: K, handler: AdamoClientEvents[K]): () => void {
    let handlers = this.eventHandlers.get(event);
    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(event, handlers);
    }
    handlers.add(handler);

    return () => {
      handlers?.delete(handler);
    };
  }

  /**
   * Remove an event listener
   */
  off<K extends keyof AdamoClientEvents>(event: K, handler: AdamoClientEvents[K]): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * Get the underlying RTCPeerConnection (for advanced use)
   */
  getPeerConnection(): RTCPeerConnection | null {
    return this.connection?.getPeerConnection() ?? null;
  }

  /**
   * Check if video is fresh (frames received recently)
   * @param maxStalenessMs Maximum allowed time since last frame
   * @param trackName Optional track name to check specific track
   */
  isVideoFresh(maxStalenessMs: number = 100, trackName?: string): boolean {
    const lastFrameTime = this.getLastFrameTime(trackName);
    if (lastFrameTime === 0) return false;
    return Date.now() - lastFrameTime <= maxStalenessMs;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private handleTrack(track: MediaStreamTrack, _streams: readonly MediaStream[]): void {
    if (track.kind !== 'video') return;

    // Get track name from connection's track metadata (sent in offer)
    // Falls back to track.label or generated name if metadata not available
    let trackName: string;
    if (this.connection) {
      trackName = this.connection.getNextTrackName();
    } else {
      trackName = track.label || `video_${this._videoTracks.size}`;
    }

    this.log(`Video track received: ${trackName}`);

    const videoTrack: VideoTrack = {
      id: track.id,
      name: trackName,
      mediaStreamTrack: track,
      dimensions: undefined, // Will be updated when metadata is available
      active: true,
    };

    // Add to tracks map
    this._videoTracks.set(trackName, videoTrack);

    // Track ended handler
    track.onended = () => {
      this.log(`Video track ended: ${trackName}`);
      this._videoTracks.delete(trackName);
      this._trackStats.delete(trackName);
      this.lastBytesReceived.delete(trackName);
      this.lastFramesDecoded.delete(trackName);
      this._lastFrameTime.delete(trackName);
      this.emit('videoTrackEnded', track.id);
    };

    // If WebCodecs is enabled, attach transform
    if (this.webCodecsEnabled && this.decoderWorker && this.connection) {
      const pc = this.connection.getPeerConnection();
      if (pc) {
        const receiver = getReceiverForTrack(pc, track);
        if (receiver) {
          attachWebCodecsTransform(receiver, this.decoderWorker);
        }
      }
    }

    this.emit('videoTrackReceived', videoTrack);
    this.startStatsCollection();
  }

  private handleConnectionStateChange(state: WebRTCConnectionState): void {
    // Map WebRTC state to our ConnectionState
    switch (state) {
      case 'connected':
        this.setConnectionState('connected');
        break;
      case 'connecting':
        this.setConnectionState('connecting');
        break;
      case 'reconnecting':
        this.setConnectionState('reconnecting');
        break;
      case 'disconnected':
        this.setConnectionState('disconnected');
        break;
      case 'failed':
        this.setConnectionState('failed');
        break;
    }
  }

  private handleDataChannelOpen(): void {
    this._dataChannelOpen = true;
    this.emit('dataChannelOpen');
    this.startPingMeasurement();
  }

  private handleDataChannelClose(): void {
    this._dataChannelOpen = false;
    this.stopPingMeasurement();
    this.emit('dataChannelClose');
  }

  private handleDataChannelMessage(data: unknown): void {
    this.emit('dataChannelMessage', data);

    // Handle known message types
    if (typeof data === 'object' && data !== null) {
      const msg = data as Record<string, unknown>;

      // Handle pong response for RTT measurement
      if (msg.type === 'pong') {
        this.handlePong(msg as unknown as PongMessage);
        return;
      }

      // Handle robot stats (encoder latency)
      if (msg.type === 'stats/robot') {
        this.handleRobotStats(msg as unknown as RobotStats);
        return;
      }

      // Handle nav data, stats, etc.
      if (msg.type === 'nav/map') {
        this.emit('mapData', msg as unknown as Parameters<AdamoClientEvents['mapData']>[0]);
      } else if (msg.type === 'nav/position') {
        this.emit('robotPose', msg as unknown as Parameters<AdamoClientEvents['robotPose']>[0]);
      } else if (msg.type === 'nav/path') {
        this.emit('navPath', msg as unknown as Parameters<AdamoClientEvents['navPath']>[0]);
      } else if (msg.type === 'nav/costmap') {
        this.emit('costmapData', msg as unknown as Parameters<AdamoClientEvents['costmapData']>[0]);
      } else if (msg.type === 'velocity') {
        this.emit(
          'velocityStateChanged',
          msg as unknown as Parameters<AdamoClientEvents['velocityStateChanged']>[0]
        );
      } else if (msg.type === 'stats/encoder') {
        this.emit(
          'encoderStatsUpdated',
          msg as unknown as Parameters<AdamoClientEvents['encoderStatsUpdated']>[0]
        );
      }

      // Handle generic topic messages (from ros_subscriber)
      if (typeof msg.topic === 'string' && 'data' in msg) {
        this.emit(
          'topicMessage',
          msg as unknown as Parameters<AdamoClientEvents['topicMessage']>[0]
        );
      }
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, ...data } = event.data;

    switch (type) {
      case 'ready':
        this.log('WebCodecs worker ready');
        break;

      case 'frame':
        // Emit decoded frame
        this.emit('decodedFrame', {
          frame: data.frame,
          timestamp: data.timestamp,
          width: data.width,
          height: data.height,
        });
        // Update frame time for all tracks (WebCodecs decodes all tracks)
        const now = Date.now();
        for (const name of this._videoTracks.keys()) {
          this._lastFrameTime.set(name, now);
        }
        break;

      case 'frameReady':
        // Request the frame from worker
        this.decoderWorker?.postMessage({ type: 'getFrame' });
        break;

      case 'error':
        this.log('WebCodecs worker error:', data.message);
        break;

      case 'requestKeyframe':
        // TODO: Implement keyframe request to server
        this.log('Keyframe requested');
        break;
    }
  }

  private setConnectionState(state: ConnectionState): void {
    if (this._connectionState !== state) {
      this._connectionState = state;
      this.emit('connectionStateChanged', state);
    }
  }

  private emit<K extends keyof AdamoClientEvents>(
    event: K,
    ...args: Parameters<AdamoClientEvents[K]>
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          (handler as Function)(...args);
        } catch (e) {
          console.error(`Error in ${event} handler:`, e);
        }
      });
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[AdamoClient]', ...args);
    }
  }

  // ============================================================================
  // Ping/Pong Latency Measurement
  // ============================================================================

  private startPingMeasurement(): void {
    if (this.pingIntervalId) return;

    // Send ping every second
    this.pingIntervalId = setInterval(() => {
      this.sendPing();
    }, 1000);

    // Send immediately
    this.sendPing();
  }

  private stopPingMeasurement(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
    this.pendingPings.clear();
  }

  private sendPing(): void {
    if (!this.connection || !this._dataChannelOpen) return;

    const id = ++this.pingSequence;
    const timestamp = Date.now();
    this.pendingPings.set(id, timestamp);

    // Clean up old pending pings (> 5 seconds old)
    const cutoff = timestamp - 5000;
    for (const [pendingId, sentTime] of this.pendingPings) {
      if (sentTime < cutoff) {
        this.pendingPings.delete(pendingId);
      }
    }

    this.connection.sendControl({
      type: 'ping',
      id,
      timestamp,
    } as unknown as ControlMessage);
  }

  private handlePong(pong: PongMessage): void {
    const sentTime = this.pendingPings.get(pong.id);
    if (sentTime) {
      this.pendingPings.delete(pong.id);
      this._lastApplicationRtt = Date.now() - sentTime;
      this.updateLatencyBreakdown();
    }
  }

  private handleRobotStats(stats: RobotStats): void {
    this._lastRobotStats = stats;
    this.emit('robotStatsUpdated', stats);
    this.updateLatencyBreakdown();
  }

  private updateLatencyBreakdown(): void {
    // Calculate average jitter buffer and decode time across all tracks
    let avgJitterBuffer = 0;
    let avgDecodeTime = 0;
    let trackCount = 0;

    for (const stats of this._trackStats.values()) {
      avgJitterBuffer += stats.jitterBufferDelayMs || 0;
      avgDecodeTime += stats.decodeTimeMs || 0;
      trackCount++;
    }

    if (trackCount > 0) {
      avgJitterBuffer /= trackCount;
      avgDecodeTime /= trackCount;
    }

    const encoderLatency = this._lastRobotStats?.encoderLatencyMs ?? 0;
    const captureLatency = this._lastRobotStats?.captureLatencyMs ?? 0;
    const pipelineLatency = this._lastRobotStats?.pipelineLatencyMs ?? 0;
    const applicationLatency = this._lastApplicationRtt / 2;

    const breakdown: LatencyBreakdown = {
      applicationRtt: this._lastApplicationRtt,
      applicationLatency,
      encoderLatency,
      captureLatency,
      pipelineLatency,
      jitterBufferDelay: avgJitterBuffer,
      decodeTime: avgDecodeTime,
      totalLatency: encoderLatency + applicationLatency + avgJitterBuffer + avgDecodeTime,
      timestamp: Date.now(),
    };

    this.emit('latencyBreakdownUpdated', breakdown);
  }

  // ============================================================================
  // Stats Collection
  // ============================================================================

  private startStatsCollection(): void {
    if (this.statsIntervalId) return;

    this.statsIntervalId = setInterval(() => {
      this.collectStats();
    }, 1000);

    // Collect immediately
    this.collectStats();
  }

  private stopStatsCollection(): void {
    if (this.statsIntervalId) {
      clearInterval(this.statsIntervalId);
      this.statsIntervalId = null;
    }
    this._networkStats = null;
    this._trackStats.clear();
    this.lastBytesReceived.clear();
    this.lastFramesDecoded.clear();
    this.lastStatsTime = 0;
  }

  private async collectStats(): Promise<void> {
    if (!this.connection) return;

    const statsReport = await this.connection.getStats();
    if (!statsReport) return;

    const now = Date.now();
    const timeDelta = (now - this.lastStatsTime) / 1000;
    let totalRtt = 0;
    let rttCount = 0;
    let totalPacketsLost = 0;
    let totalPacketsReceived = 0;
    let totalJitter = 0;
    let jitterCount = 0;
    let availableBandwidth = 0;

    // Build a map of trackIdentifier -> trackName from our video tracks
    const trackIdToName = new Map<string, string>();
    for (const [name, track] of this._videoTracks) {
      trackIdToName.set(track.id, name);
    }

    statsReport.forEach((report) => {
      // Connection-level stats from candidate-pair
      if (report.type === 'candidate-pair' && (report as RTCIceCandidatePairStats).state === 'succeeded') {
        const candidateReport = report as RTCIceCandidatePairStats;
        if (candidateReport.currentRoundTripTime !== undefined) {
          totalRtt += candidateReport.currentRoundTripTime * 1000;
          rttCount++;
        }
        if ((candidateReport as unknown as Record<string, number>).availableIncomingBitrate) {
          availableBandwidth = (candidateReport as unknown as Record<string, number>).availableIncomingBitrate;
        }
      }

      // Inbound RTP stats for video
      if (report.type === 'inbound-rtp') {
        const rtpReport = report as RTCInboundRtpStreamStats;
        if (rtpReport.kind === 'video') {
          totalPacketsLost += rtpReport.packetsLost || 0;
          totalPacketsReceived += rtpReport.packetsReceived || 0;

          if (rtpReport.jitter !== undefined) {
            totalJitter += rtpReport.jitter * 1000;
            jitterCount++;
          }

          // Find the track name for this RTP stream
          const trackId = rtpReport.trackIdentifier || '';
          const trackName = trackIdToName.get(trackId) || `video_${this._trackStats.size}`;

          const bytesReceived = rtpReport.bytesReceived || 0;
          const framesDecoded = rtpReport.framesDecoded || 0;
          const framesDropped = rtpReport.framesDropped || 0;
          const width = rtpReport.frameWidth || 0;
          const height = rtpReport.frameHeight || 0;
          const fps = rtpReport.framesPerSecond || 0;

          // Get previous values for this track
          const lastBytes = this.lastBytesReceived.get(trackName) || 0;
          const lastFrames = this.lastFramesDecoded.get(trackName) || 0;

          // Calculate bitrate
          const bytesDelta = bytesReceived - lastBytes;
          const bitrate = timeDelta > 0 ? (bytesDelta * 8) / timeDelta : 0;

          // Calculate decoded FPS
          const framesDelta = framesDecoded - lastFrames;
          const decodedFps = timeDelta > 0 ? framesDelta / timeDelta : 0;

          // Update frame time if frames were decoded
          if (framesDelta > 0) {
            this._lastFrameTime.set(trackName, now);
          }

          // Jitter buffer and decode stats
          const jitterBufferDelay = (rtpReport as unknown as Record<string, number>).jitterBufferDelay || 0;
          const jitterBufferEmittedCount = (rtpReport as unknown as Record<string, number>).jitterBufferEmittedCount || 1;
          const jitterBufferDelayMs = (jitterBufferDelay / jitterBufferEmittedCount) * 1000;

          const totalDecodeTime = (rtpReport as unknown as Record<string, number>).totalDecodeTime || 0;
          const decodeTimeMs = framesDecoded > 0 ? (totalDecodeTime / framesDecoded) * 1000 : 0;

          // Determine quality tier
          let quality = StreamQuality.MEDIUM;
          if (height >= 1080) {
            quality = StreamQuality.HIGH;
          } else if (height <= 480) {
            quality = StreamQuality.LOW;
          }

          const stats: TrackStreamStats = {
            trackName,
            width,
            height,
            fps: decodedFps || fps,
            bitrate,
            quality,
            bytesReceived: bytesDelta,
            framesDecoded: framesDelta,
            framesDropped,
            timestamp: now,
            jitterBufferDelayMs,
            decodeTimeMs,
            processingDelayMs: jitterBufferDelayMs + decodeTimeMs,
          };

          this._trackStats.set(trackName, stats);
          this.lastBytesReceived.set(trackName, bytesReceived);
          this.lastFramesDecoded.set(trackName, framesDecoded);

          this.emit('trackStatsUpdated', stats);
        }
      }
    });

    this.lastStatsTime = now;

    // Calculate network stats
    const packetLoss =
      totalPacketsReceived > 0
        ? (totalPacketsLost / (totalPacketsReceived + totalPacketsLost)) * 100
        : 0;

    this._networkStats = {
      rtt: rttCount > 0 ? totalRtt / rttCount : 0,
      packetLoss,
      availableBandwidth,
      jitter: jitterCount > 0 ? totalJitter / jitterCount : 0,
      timestamp: now,
    };

    this.emit('networkStatsUpdated', this._networkStats);
  }
}
