import {
  Room,
  RoomEvent,
  ConnectionState as LKConnectionState,
  RemoteParticipant,
  RemoteTrackPublication,
  Track,
  RemoteVideoTrack,
  DataPacket_Kind,
} from 'livekit-client';
import type {
  AdamoClientConfig,
  AdamoClientEvents,
  ConnectionState,
  VideoTrack,
  TrackSubscription,
  MapData,
  CostmapData,
  RobotPose,
  NavPath,
  NavGoal,
  NetworkStats,
  TrackStreamStats,
  VelocityState,
  EncoderStats,
} from './types';
import { StreamQuality } from './types';

const DEFAULT_CONFIG: Required<AdamoClientConfig> = {
  serverIdentity: 'python-bot',
  adaptiveStream: true,
  dynacast: true,
  videoCodec: 'h264',
  // Negative value requests minimum buffering from the browser's jitter buffer
  // 0 = default (browser decides), negative = request less buffering
  playoutDelay: -0.1,
};

/**
 * Adamo Client - Core class for teleoperation via LiveKit
 *
 * Abstracts LiveKit connection and provides a simple API for:
 * - Connecting to a room
 * - Subscribing to video topics (camera feeds)
 * - Sending control data (joypad)
 * - Heartbeat monitoring
 *
 * @example
 * ```ts
 * const client = new AdamoClient();
 *
 * client.on('trackAvailable', (track) => {
 *   console.log('New track:', track.name);
 * });
 *
 * await client.connect('ws://localhost:7880', token);
 * await client.subscribe('fork', (track) => {
 *   videoElement.srcObject = new MediaStream([track.mediaStreamTrack]);
 * });
 * ```
 */
export class AdamoClient {
  private room: Room;
  private config: Required<AdamoClientConfig>;
  private eventHandlers: Map<keyof AdamoClientEvents, Set<Function>> = new Map();
  private subscriptions: Map<string, TrackSubscription> = new Map();
  private _connectionState: ConnectionState = 'disconnected';
  private connectAbortController: AbortController | null = null;

  // Adaptive streaming state
  private _networkStats: NetworkStats | null = null;
  private _trackStats: Map<string, TrackStreamStats> = new Map();
  private _encoderStats: Map<string, EncoderStats> = new Map();
  private _preferredQuality: StreamQuality = StreamQuality.AUTO;
  private statsIntervalId: ReturnType<typeof setInterval> | null = null;
  private freshnessIntervalId: ReturnType<typeof setInterval> | null = null;
  private jitterBufferIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastBytesReceived: Map<string, number> = new Map();
  private lastFramesDecoded: Map<string, number> = new Map();
  private lastStatsTime: Map<string, number> = new Map();
  private _lastFrameTime: Map<string, number> = new Map();
  private _freshnessFramesDecoded: Map<string, number> = new Map();

  constructor(config: AdamoClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.room = new Room({
      adaptiveStream: this.config.adaptiveStream,
      dynacast: this.config.dynacast,
      videoCaptureDefaults: {
        resolution: { width: 1280, height: 720, frameRate: 30 },
      },
      publishDefaults: {
        videoCodec: this.config.videoCodec,
        simulcast: true,
        videoEncoding: { maxBitrate: 2_500_000, maxFramerate: 30 },
      },
    });

    this.setupRoomListeners();
  }

  /**
   * Get the current connection state
   */
  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  /**
   * Get the underlying LiveKit Room instance (for advanced use cases)
   */
  get liveKitRoom(): Room {
    return this.room;
  }

  /**
   * Get the server identity this client communicates with
   */
  get serverIdentity(): string {
    return this.config.serverIdentity;
  }

  /**
   * Get current network statistics
   */
  get networkStats(): NetworkStats | null {
    return this._networkStats;
  }

  /**
   * Get statistics for all tracks
   */
  get trackStats(): Map<string, TrackStreamStats> {
    return this._trackStats;
  }

  /**
   * Get encoder statistics from the server (per-track)
   */
  get encoderStats(): Map<string, EncoderStats> {
    return this._encoderStats;
  }

  /**
   * Get encoder stats for a specific track
   */
  getEncoderStats(trackName: string): EncoderStats | undefined {
    return this._encoderStats.get(trackName);
  }

  /**
   * Get the preferred quality setting
   */
  get preferredQuality(): StreamQuality {
    return this._preferredQuality;
  }

  /**
   * Connect to the Adamo server
   */
  async connect(url: string, token: string): Promise<void> {
    // Cancel any pending connection
    this.connectAbortController?.abort();
    this.connectAbortController = new AbortController();
    const signal = this.connectAbortController.signal;

    this.setConnectionState('connecting');

    try {
      await this.room.connect(url, token, {
        autoSubscribe: true,
      });

      // Check if aborted during connection
      if (signal.aborted) {
        this.room.disconnect();
        return;
      }

      this.setConnectionState('connected');
      this.startStatsCollection();

      // Request nav map on connect
      // this.requestNavMap().catch((e) => {
      //   console.debug('[Adamo] Failed to request nav map:', e);
      // });
    } catch (error) {
      // Ignore errors from aborted connections
      if (signal.aborted) return;

      this.setConnectionState('disconnected');
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    // Abort any pending connection
    this.connectAbortController?.abort();
    this.connectAbortController = null;

    // Stop stats collection
    this.stopStatsCollection();

    this.room.disconnect();
    this.subscriptions.clear();
    this.setConnectionState('disconnected');
  }

  /**
   * Get all available video tracks from the server
   */
  getAvailableTracks(): VideoTrack[] {
    const tracks: VideoTrack[] = [];

    for (const participant of this.room.remoteParticipants.values()) {
      for (const publication of participant.videoTrackPublications.values()) {
        tracks.push(this.publicationToVideoTrack(publication));
      }
    }

    return tracks;
  }

  /**
   * Subscribe to a video topic by name
   *
   * @param topicName - The topic name (e.g., 'fork', 'front', 'left')
   * @param callback - Called when the track becomes available with video data
   * @returns Unsubscribe function
   */
  subscribe(topicName: string, callback: (track: VideoTrack) => void): () => void {
    // Find the track publication
    const publication = this.findPublicationByName(topicName);

    if (publication) {
      // Track already exists
      const track = this.publicationToVideoTrack(publication.pub);

      // Store subscription
      let sub = this.subscriptions.get(topicName);
      if (!sub) {
        sub = {
          publication: publication.pub,
          participant: publication.participant,
          callbacks: new Set(),
        };
        this.subscriptions.set(topicName, sub);
      }
      sub.callbacks.add(callback);

      // Set optimal playback settings
      if (publication.pub.videoTrack instanceof RemoteVideoTrack) {
        publication.pub.videoTrack.setPlayoutDelay(this.config.playoutDelay);
      }

      // Call callback immediately if track is ready
      if (track.mediaStreamTrack) {
        callback(track);
      }
    } else {
      // Track not yet available, store callback for when it arrives
      let sub = this.subscriptions.get(topicName);
      if (!sub) {
        sub = {
          publication: null as any,
          participant: null as any,
          callbacks: new Set(),
        };
        this.subscriptions.set(topicName, sub);
      }
      sub.callbacks.add(callback);
    }

    // Return unsubscribe function
    return () => {
      const sub = this.subscriptions.get(topicName);
      if (sub) {
        sub.callbacks.delete(callback);
        if (sub.callbacks.size === 0) {
          this.subscriptions.delete(topicName);
        }
      }
    };
  }

  /**
   * Send joypad data to the server (fire-and-forget, lossy for low latency)
   */
  async sendJoyData(axes: number[], buttons: number[]): Promise<void> {
    if (!this.room.localParticipant) {
      throw new Error('Not connected');
    }

    const joyMessage = {
      header: {
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1e6,
        },
        frame_id: 'joy',
      },
      axes,
      buttons,
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(joyMessage));

    await this.room.localParticipant.publishData(data, {
      reliable: false, // Lossy mode for minimum latency
      destinationIdentities: [this.config.serverIdentity],
      topic: 'joy',
    });
  }

  /**
   * Send heartbeat to the server via RPC
   */
  async sendHeartbeat(state: number): Promise<void> {
    if (!this.room.localParticipant) {
      throw new Error('Not connected');
    }

    const payload = {
      state,
      timestamp: Date.now(),
    };

    await this.room.localParticipant.performRpc({
      destinationIdentity: this.config.serverIdentity,
      method: 'heartbeat',
      payload: JSON.stringify(payload),
    });
  }

  /**
   * Request the nav map from the server via RPC
   */
  async requestNavMap(): Promise<void> {
    if (!this.room.localParticipant) {
      throw new Error('Not connected');
    }

    console.log('[Adamo] Requesting nav map via RPC...');
    const response = await this.room.localParticipant.performRpc({
      destinationIdentity: this.config.serverIdentity,
      method: 'getNavMap',
      payload: '',
    });
    console.log('[Adamo] Nav map request response:', response);
  }

  /**
   * Send a navigation goal to Nav2
   */
  async sendNavGoal(goal: NavGoal): Promise<void> {
    if (!this.room.localParticipant) {
      throw new Error('Not connected');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(goal));

    await this.room.localParticipant.publishData(data, {
      reliable: true, // Nav goals should be reliable
      destinationIdentities: [this.config.serverIdentity],
      topic: 'nav_goal',
    });
  }

  /**
   * Register an RPC method handler
   */
  registerRpcMethod(method: string, handler: (payload: string) => Promise<string> | string): void {
    if (!this.room.localParticipant) {
      throw new Error('Not connected');
    }

    this.room.localParticipant.registerRpcMethod(method, async (data) => {
      return handler(data.payload);
    });
  }

  /**
   * Unregister an RPC method handler
   */
  unregisterRpcMethod(method: string): void {
    this.room.localParticipant?.unregisterRpcMethod(method);
  }

  /**
   * Add an event listener
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
   * Set the preferred streaming quality
   * This sends a preference to the server which will adapt the stream accordingly
   *
   * @param quality - The desired quality level (LOW, MEDIUM, HIGH, or AUTO)
   */
  async setPreferredQuality(quality: StreamQuality): Promise<void> {
    this._preferredQuality = quality;

    if (!this.room.localParticipant) {
      return;
    }

    // Send quality preference to server via data channel
    const encoder = new TextEncoder();
    const message = {
      type: 'quality_preference',
      quality,
      timestamp: Date.now(),
    };

    await this.room.localParticipant.publishData(
      encoder.encode(JSON.stringify(message)),
      {
        reliable: true,
        destinationIdentities: [this.config.serverIdentity],
        topic: 'stream_control',
      }
    );

    this.emit('qualityChanged', quality);
  }

  /**
   * Get statistics for a specific track
   */
  getTrackStats(trackName: string): TrackStreamStats | undefined {
    return this._trackStats.get(trackName);
  }

  /**
   * Get the last frame time for all tracks
   * Returns a map of track name to timestamp (ms) when the last frame was decoded
   */
  get lastFrameTime(): Map<string, number> {
    return this._lastFrameTime;
  }

  /**
   * Get the last frame time for a specific track
   */
  getLastFrameTime(trackName: string): number | undefined {
    return this._lastFrameTime.get(trackName);
  }

  /**
   * Check if video feeds are fresh (majority have received frames within threshold)
   * @param maxStalenessMs - Maximum allowed time since last frame (default: 100ms)
   * @returns true if majority of tracks are fresh, false otherwise
   */
  isVideoFresh(maxStalenessMs: number = 100): boolean {
    const now = Date.now();
    const trackCount = this._lastFrameTime.size;

    if (trackCount === 0) {
      // No tracks yet - consider stale for safety
      return false;
    }

    let freshCount = 0;
    for (const lastTime of this._lastFrameTime.values()) {
      if (now - lastTime <= maxStalenessMs) {
        freshCount++;
      }
    }

    // Majority means more than half
    return freshCount > trackCount / 2;
  }

  // Private methods

  private setupRoomListeners(): void {
    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      switch (state) {
        case LKConnectionState.Connected:
          this.setConnectionState('connected');
          break;
        case LKConnectionState.Connecting:
          this.setConnectionState('connecting');
          break;
        case LKConnectionState.Reconnecting:
          this.setConnectionState('reconnecting');
          break;
        case LKConnectionState.Disconnected:
          this.setConnectionState('disconnected');
          break;
      }
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind !== Track.Kind.Video) return;

      const trackName = publication.trackName || publication.trackSid;
      const videoTrack = this.publicationToVideoTrack(publication);

      // Set optimal playback settings
      if (track instanceof RemoteVideoTrack) {
        track.setPlayoutDelay(this.config.playoutDelay);
      }

      this.emit('trackSubscribed', videoTrack);
      this.emit('trackAvailable', videoTrack);

      // Notify subscribers
      const sub = this.subscriptions.get(trackName);
      if (sub) {
        sub.publication = publication;
        sub.participant = participant;
        sub.callbacks.forEach((cb) => cb(videoTrack));
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
      if (track.kind !== Track.Kind.Video) return;

      const trackName = publication.trackName || publication.trackSid;
      this.emit('trackUnsubscribed', trackName);
      this.emit('trackRemoved', trackName);
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      // Check for any pending subscriptions that match this participant's tracks
      participant.on('trackPublished', (publication) => {
        if (publication.kind !== Track.Kind.Video) return;

        const trackName = publication.trackName || publication.trackSid;
        const videoTrack = this.publicationToVideoTrack(publication);
        this.emit('trackAvailable', videoTrack);
      });
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.setConnectionState('disconnected');
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      this.setConnectionState('reconnecting');
    });

    this.room.on(RoomEvent.Reconnected, () => {
      this.setConnectionState('connected');
    });

    // Handle incoming nav data from server
    this.room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
      console.log(`[Adamo] DataReceived: topic=${topic}, from=${participant?.identity}, size=${payload.byteLength}`);

      if (!topic) return;

      try {
        const decoder = new TextDecoder();
        const jsonStr = decoder.decode(payload);
        const data = JSON.parse(jsonStr);

        switch (topic) {
          case 'nav/map':
            console.log(`[Adamo] Map received: ${data.width}x${data.height}`);
            this.emit('mapData', data as MapData);
            break;
          case 'nav/position':
            console.log(`[Adamo] Pose received: (${data.x?.toFixed(2)}, ${data.y?.toFixed(2)})`);
            this.emit('robotPose', data as RobotPose);
            break;
          case 'nav/path':
            console.log(`[Adamo] Path received: ${data.poses?.length} poses`);
            this.emit('navPath', data as NavPath);
            break;
          case 'nav/costmap':
            this.emit('costmapData', data as CostmapData);
            break;
          case 'velocity':
            this.emit('velocityStateChanged', data as VelocityState);
            break;
          case 'stats/encoder':
            // Server encoder stats - update internal state and emit
            const encoderStats: EncoderStats = {
              trackName: data.track_name,
              encodeTimeMs: data.encode_time_ms,
              pipelineLatencyMs: data.pipeline_latency_ms,
              framesEncoded: data.frames_encoded,
              framesDropped: data.frames_dropped,
              fps: data.fps,
              timestamp: data.timestamp,
            };
            this._encoderStats.set(encoderStats.trackName, encoderStats);
            this.emit('encoderStatsUpdated', encoderStats);
            break;
          default:
            console.log(`[Adamo] Unknown topic: ${topic}`);
        }
      } catch (e) {
        console.error(`Error parsing nav data for topic ${topic}:`, e);
      }
    });
  }

  private findPublicationByName(
    name: string
  ): { pub: RemoteTrackPublication; participant: RemoteParticipant } | null {
    for (const participant of this.room.remoteParticipants.values()) {
      for (const publication of participant.videoTrackPublications.values()) {
        if (publication.trackName === name || publication.trackSid === name) {
          return { pub: publication, participant };
        }
      }
    }
    return null;
  }

  private publicationToVideoTrack(publication: RemoteTrackPublication): VideoTrack {
    const track = publication.videoTrack;
    return {
      name: publication.trackName || publication.trackSid,
      sid: publication.trackSid,
      subscribed: publication.isSubscribed,
      muted: publication.isMuted,
      dimensions: publication.dimensions
        ? { width: publication.dimensions.width, height: publication.dimensions.height }
        : undefined,
      mediaStreamTrack: track?.mediaStreamTrack,
    };
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

  /**
   * Start collecting WebRTC stats for adaptive streaming
   */
  private startStatsCollection(): void {
    if (this.statsIntervalId) return;

    // Collect stats every second
    this.statsIntervalId = setInterval(() => {
      this.collectStats();
    }, 1000);

    // Collect immediately
    this.collectStats();

    // Start faster freshness polling (every 30ms for 100ms staleness detection)
    this.startFreshnessTracking();

    // Start aggressive jitter buffer minimization (like Selkies)
    this.startJitterBufferOptimization();
  }

  /**
   * Start fast polling for video frame freshness
   */
  private startFreshnessTracking(): void {
    if (this.freshnessIntervalId) return;

    this.freshnessIntervalId = setInterval(() => {
      this.updateFrameFreshness();
    }, 30);
  }

  /**
   * Start aggressive jitter buffer optimization
   *
   * Sets all three jitter buffer properties to 0 every 15ms on all receivers.
   * This matches the Selkies approach for achieving ~16ms latency.
   *
   * Properties set:
   * - jitterBufferTarget: Target jitter buffer size
   * - jitterBufferDelayHint: Hint for jitter buffer delay
   * - playoutDelayHint: Hint for playout delay
   */
  private startJitterBufferOptimization(): void {
    if (this.jitterBufferIntervalId) return;

    this.jitterBufferIntervalId = setInterval(() => {
      this.minimizeJitterBuffer();
    }, 15);

    // Run immediately
    this.minimizeJitterBuffer();
  }

  /**
   * Set all jitter buffer properties to 0 on all video receivers
   */
  private minimizeJitterBuffer(): void {
    try {
      // Access LiveKit's internal peer connection
      const engine = (this.room as any).engine;
      const subscriber = engine?.pcManager?.subscriber;
      const pc = subscriber?.pc as RTCPeerConnection | undefined;

      if (!pc) return;

      pc.getReceivers().forEach((receiver) => {
        if (receiver.track?.kind === 'video') {
          // Set all three properties for maximum effect
          // These are non-standard but widely supported
          (receiver as any).jitterBufferTarget = 0;
          (receiver as any).jitterBufferDelayHint = 0;
          (receiver as any).playoutDelayHint = 0;
        }
      });
    } catch (e) {
      // Silently ignore - internal API access may fail
    }
  }

  /**
   * Update frame freshness by checking if framesDecoded has incremented
   */
  private async updateFrameFreshness(): Promise<void> {
    if (!this.room.localParticipant) return;

    try {
      const engine = (this.room as any).engine;
      const subscriber = engine?.pcManager?.subscriber;
      if (!subscriber) return;

      const pc = await subscriber.getStats();
      const now = Date.now();

      pc.forEach((report: RTCStats) => {
        if (report.type === 'inbound-rtp' && (report as any).kind === 'video') {
          const trackId = (report as any).trackIdentifier || (report as any).trackId;
          const framesDecoded = (report as any).framesDecoded || 0;

          // Find track name from subscriptions
          let trackName = '';
          for (const [name, sub] of this.subscriptions) {
            const mediaTrack = sub.publication?.videoTrack?.mediaStreamTrack;
            if (mediaTrack && mediaTrack.id === trackId) {
              trackName = name;
              break;
            }
          }

          if (trackName) {
            const prevFrames = this._freshnessFramesDecoded.get(trackName) || 0;

            // If frames have been decoded since last check, update timestamp
            if (framesDecoded > prevFrames) {
              this._lastFrameTime.set(trackName, now);
            }

            this._freshnessFramesDecoded.set(trackName, framesDecoded);
          }
        }
      });
    } catch (e) {
      // Silently ignore freshness check failures
    }
  }

  /**
   * Stop collecting WebRTC stats
   */
  private stopStatsCollection(): void {
    if (this.statsIntervalId) {
      clearInterval(this.statsIntervalId);
      this.statsIntervalId = null;
    }
    if (this.freshnessIntervalId) {
      clearInterval(this.freshnessIntervalId);
      this.freshnessIntervalId = null;
    }
    if (this.jitterBufferIntervalId) {
      clearInterval(this.jitterBufferIntervalId);
      this.jitterBufferIntervalId = null;
    }
    this._networkStats = null;
    this._trackStats.clear();
    this.lastBytesReceived.clear();
    this.lastFramesDecoded.clear();
    this.lastStatsTime.clear();
    this._lastFrameTime.clear();
    this._freshnessFramesDecoded.clear();
  }

  /**
   * Collect WebRTC stats from the room connection
   */
  private async collectStats(): Promise<void> {
    if (!this.room.localParticipant) return;

    const now = Date.now();

    // Get connection-level stats
    try {
      // Use the room's engine to get WebRTC stats
      const engine = (this.room as any).engine;
      const subscriber = engine?.pcManager?.subscriber;
      if (!subscriber) return;

      const pc = await subscriber.getStats();

      let totalRtt = 0;
      let rttCount = 0;
      let totalPacketsLost = 0;
      let totalPacketsReceived = 0;
      let totalJitter = 0;
      let jitterCount = 0;
      let availableBandwidth = 0;

      // Track-level stats
      const trackStatsMap = new Map<string, Partial<TrackStreamStats>>();

      pc.forEach((report: RTCStats) => {
        // Connection-level stats from candidate-pair
        if (report.type === 'candidate-pair' && (report as any).state === 'succeeded') {
          const rtt = (report as any).currentRoundTripTime;
          if (rtt !== undefined) {
            totalRtt += rtt * 1000; // Convert to ms
            rttCount++;
          }
          if ((report as any).availableIncomingBitrate) {
            availableBandwidth = (report as any).availableIncomingBitrate;
          }
        }

        // Inbound RTP stats for video tracks
        if (report.type === 'inbound-rtp' && (report as any).kind === 'video') {
          const trackId = (report as any).trackIdentifier || (report as any).trackId;
          const packetsLost = (report as any).packetsLost || 0;
          const packetsReceived = (report as any).packetsReceived || 0;
          const jitter = (report as any).jitter;

          totalPacketsLost += packetsLost;
          totalPacketsReceived += packetsReceived;

          if (jitter !== undefined) {
            totalJitter += jitter * 1000; // Convert to ms
            jitterCount++;
          }

          // Find track name from subscriptions
          let trackName = '';
          for (const [name, sub] of this.subscriptions) {
            const mediaTrack = sub.publication?.videoTrack?.mediaStreamTrack;
            if (mediaTrack && mediaTrack.id === trackId) {
              trackName = name;
              break;
            }
          }

          if (trackName) {
            const bytesReceived = (report as any).bytesReceived || 0;
            const framesDecoded = (report as any).framesDecoded || 0;
            const framesDropped = (report as any).framesDropped || 0;
            const width = (report as any).frameWidth || 0;
            const height = (report as any).frameHeight || 0;
            const fps = (report as any).framesPerSecond || 0;

            // Jitter buffer delay (cumulative, needs to be averaged)
            const jitterBufferDelay = (report as any).jitterBufferDelay || 0;
            const jitterBufferEmittedCount = (report as any).jitterBufferEmittedCount || 1;
            const jitterBufferDelayMs = (jitterBufferDelay / jitterBufferEmittedCount) * 1000;

            // Decode time (cumulative, needs to be averaged)
            const totalDecodeTime = (report as any).totalDecodeTime || 0;
            const decodeTimeMs = framesDecoded > 0 ? (totalDecodeTime / framesDecoded) * 1000 : 0;

            // Total processing delay
            const processingDelayMs = jitterBufferDelayMs + decodeTimeMs;

            // Calculate bitrate since last measurement
            const lastBytes = this.lastBytesReceived.get(trackName) || 0;
            const lastTime = this.lastStatsTime.get(trackName) || now;
            const timeDelta = (now - lastTime) / 1000; // seconds
            const bytesDelta = bytesReceived - lastBytes;
            const bitrate = timeDelta > 0 ? (bytesDelta * 8) / timeDelta : 0;

            // Calculate frames decoded rate
            const lastFrames = this.lastFramesDecoded.get(trackName) || 0;
            const framesDelta = framesDecoded - lastFrames;
            const decodedFps = timeDelta > 0 ? framesDelta / timeDelta : 0;

            // Update tracking
            this.lastBytesReceived.set(trackName, bytesReceived);
            this.lastFramesDecoded.set(trackName, framesDecoded);
            this.lastStatsTime.set(trackName, now);

            // Determine quality tier from resolution
            let quality = StreamQuality.MEDIUM;
            if (height >= 1080) {
              quality = StreamQuality.HIGH;
            } else if (height <= 480) {
              quality = StreamQuality.LOW;
            }

            trackStatsMap.set(trackName, {
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
              processingDelayMs,
            });
          }
        }
      });

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

      // Update track stats
      for (const [trackName, stats] of trackStatsMap) {
        const fullStats = stats as TrackStreamStats;
        const prevStats = this._trackStats.get(trackName);
        this._trackStats.set(trackName, fullStats);

        this.emit('trackStatsUpdated', fullStats);

        // Emit quality change if it changed
        if (prevStats && prevStats.quality !== fullStats.quality) {
          this.emit('qualityChanged', fullStats.quality, trackName);
        }
      }
    } catch (e) {
      // Stats collection failed - throw to surface the error
      console.error('Stats collection failed:', e);
      throw e;
    }
  }
}
