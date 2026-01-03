/**
 * @packageDocumentation
 * @module @adamo-tech/core
 *
 * Core types for the Adamo teleoperation system.
 *
 * This module provides TypeScript types for:
 * - Connection and streaming state management
 * - Gamepad/joypad input configuration
 * - Navigation (Nav2) data structures
 * - WebRTC statistics and adaptive streaming
 * - Safety heartbeat monitoring
 */

// Re-export WebRTC types
export type {
  SignalingConfig,
  WebRTCConnectionState,
  WebRTCConnectionCallbacks,
} from './webrtc/types';

// Re-export WebCodecs types
export type { DecodedVideoFrame, WebCodecsConfig, WebCodecsStats } from './webcodecs/types';

/**
 * Connection state for the Adamo client.
 *
 * State transitions:
 * - `disconnected` → `connecting` (on connect call)
 * - `connecting` → `connected` (on successful connection)
 * - `connected` → `reconnecting` (on network interruption)
 * - `reconnecting` → `connected` (on successful reconnection)
 * - Any state → `disconnected` (on disconnect call or fatal error)
 * - Any state → `failed` (on unrecoverable error)
 *
 * @example
 * ```ts
 * client.on('connectionStateChanged', (state: ConnectionState) => {
 *   if (state === 'connected') {
 *     console.log('Ready to stream!');
 *   }
 * });
 * ```
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

// ============================================================================
// Adaptive Streaming Types
// ============================================================================

/**
 * Quality tier for adaptive streaming
 * Matches server-side quality tiers from the NVENC encoder
 */
export enum StreamQuality {
  /** Low quality: 640x480 @ 0.5-1 Mbps */
  LOW = 'low',
  /** Medium quality: 1280x720 @ 1.5-2.5 Mbps */
  MEDIUM = 'medium',
  /** High quality: 1920x1080 @ 3-6 Mbps */
  HIGH = 'high',
  /** Auto: Let server decide based on network conditions */
  AUTO = 'auto',
}

/**
 * Network statistics from WebRTC connection
 */
export interface NetworkStats {
  /** Round-trip time in milliseconds */
  rtt: number;
  /** Packet loss percentage (0-100) */
  packetLoss: number;
  /** Available downlink bandwidth in bits per second */
  availableBandwidth: number;
  /** Jitter in milliseconds */
  jitter: number;
  /** Timestamp of when these stats were collected */
  timestamp: number;
}

/**
 * Per-track streaming statistics
 */
export interface TrackStreamStats {
  /** Track name/topic */
  trackName: string;
  /** Current resolution width */
  width: number;
  /** Current resolution height */
  height: number;
  /** Current framerate */
  fps: number;
  /** Current bitrate in bits per second */
  bitrate: number;
  /** Current quality tier */
  quality: StreamQuality;
  /** Bytes received since last stats update */
  bytesReceived: number;
  /** Frames decoded since last stats update */
  framesDecoded: number;
  /** Frames dropped since last stats update */
  framesDropped: number;
  /** Timestamp of when these stats were collected */
  timestamp: number;
  /** Jitter buffer delay in milliseconds (time frames wait before playback) */
  jitterBufferDelayMs: number;
  /** Decode time in milliseconds (time to decode each frame) */
  decodeTimeMs: number;
  /** Total processing delay: jitterBufferDelayMs + decodeTimeMs */
  processingDelayMs: number;
}

/**
 * Aggregated adaptive streaming state
 */
export interface AdaptiveStreamState {
  /** Whether adaptive streaming is enabled */
  enabled: boolean;
  /** Current preferred quality (user preference) */
  preferredQuality: StreamQuality;
  /** Current actual quality being received */
  currentQuality: StreamQuality;
  /** Network statistics */
  networkStats: NetworkStats | null;
  /** Per-track statistics */
  trackStats: Map<string, TrackStreamStats>;
  /** Whether quality is currently being adapted */
  isAdapting: boolean;
  /** Reason for current quality level */
  qualityReason: string;
}

/**
 * Heartbeat safety states matching the server-side SafetyState enum
 */
export enum HeartbeatState {
  /** All checks pass - system operating normally */
  OK = 0,
  /** Browser window is not focused */
  WINDOW_UNFOCUSED = 1,
  /** Network round-trip time exceeds threshold */
  HIGH_LATENCY = 2,
  /** No gamepad detected */
  CONTROLLER_DISCONNECTED = 3,
  /** Heartbeat messages stopped (server-side only) */
  HEARTBEAT_MISSING = 4,
}

// ============================================================================
// Control Message Types (Data Channel)
// ============================================================================

/**
 * Controller state for a single controller
 */
export interface ControllerState {
  /** Analog axes values (-1 to 1) */
  axes: number[];
  /** Button states (0 or 1) */
  buttons: number[];
  /** XR controller position [x, y, z] (optional) */
  position?: [number, number, number];
  /** XR controller quaternion [w, x, y, z] (optional) */
  quaternion?: [number, number, number, number];
  /** Controller handedness (optional) */
  handedness?: 'left' | 'right';
}

/**
 * Control message sent over data channel
 */
export interface ControlMessage {
  /** First controller state (e.g., left hand or primary gamepad) */
  controller1?: ControllerState;
  /** Second controller state (e.g., right hand or secondary gamepad) */
  controller2?: ControllerState;
  /** Additional controllers (controller3, controller4, etc.) */
  [key: `controller${number}`]: ControllerState | undefined;
  /** Message timestamp */
  timestamp: number;
}

/**
 * Heartbeat message sent over data channel
 */
export interface HeartbeatMessage {
  type: 'heartbeat';
  /** Safety state */
  state: HeartbeatState;
  /** Message timestamp */
  timestamp: number;
}

// ============================================================================
// Client Configuration
// ============================================================================

/**
 * Configuration options for the Adamo client.
 *
 * @example
 * ```ts
 * const client = new AdamoClient({
 *   debug: true,
 *   useWebCodecs: true, // Enable ultra-low-latency decoding
 * });
 *
 * await client.connect({
 *   serverUrl: 'wss://relay.example.com',
 *   roomId: 'robot-1',
 *   token: 'jwt...',
 * });
 * ```
 */
export interface AdamoClientConfig {
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Enable WebCodecs for ultra-low-latency video decoding (~5-17ms decode time).
   * When enabled, video is decoded via a Worker instead of the browser's built-in decoder.
   * @default false
   */
  useWebCodecs?: boolean;

  /**
   * H.264 codec profile for WebCodecs decoder
   * @default 'avc1.42001f' (Baseline Level 3.1)
   */
  codecProfile?: string;

  /**
   * Hardware acceleration preference for WebCodecs
   * @default 'prefer-hardware'
   */
  hardwareAcceleration?: 'prefer-hardware' | 'prefer-software' | 'no-preference';

  /**
   * URL or Worker instance for the WebCodecs decoder worker.
   *
   * Different bundlers handle workers differently. You can provide:
   * - A URL string pointing to the worker file
   * - A URL object created with your bundler's worker import syntax
   * - A Worker instance you've created yourself
   *
   * @example Next.js
   * ```ts
   * // In Next.js, create the worker yourself:
   * const worker = new Worker(
   *   new URL('@adamo-tech/core/webcodecs-worker', import.meta.url)
   * );
   * const client = new AdamoClient({ webCodecsWorker: worker });
   * ```
   *
   * @example Vite
   * ```ts
   * import WorkerUrl from '@adamo-tech/core/webcodecs-worker?worker&url';
   * const client = new AdamoClient({ webCodecsWorkerUrl: WorkerUrl });
   * ```
   */
  webCodecsWorkerUrl?: string | URL | Worker;
}

/**
 * Configuration for heartbeat monitoring
 */
export interface HeartbeatConfig {
  /** How often to send heartbeat messages in ms (default: 500) */
  interval?: number;
  /** Whether to check for gamepad connection (default: true) */
  checkGamepad?: boolean;
  /** Whether to check for window focus (default: true) */
  checkWindowFocus?: boolean;
}

/**
 * Joypad (gamepad) configuration matching ROS joy_node parameters.
 *
 * Maps W3C Gamepad API to ROS `sensor_msgs/Joy` format.
 *
 * @example
 * ```tsx
 * // Single controller (default)
 * <GamepadController />
 *
 * // Multiple controllers with different topics
 * <GamepadController config={{ deviceId: 0, topic: 'joy_driver' }} />
 * <GamepadController config={{ deviceId: 1, topic: 'joy_passenger' }} />
 *
 * // Select controller by name
 * <GamepadController config={{ deviceName: 'Xbox', deadzone: 0.1 }} />
 * ```
 */
export interface JoypadConfig {
  /**
   * Which gamepad to use by index (0 = first connected gamepad).
   * @default 0
   */
  deviceId?: number;

  /**
   * Filter gamepad by name substring (e.g., 'Xbox', 'DualSense').
   * Takes precedence over `deviceId` if specified.
   */
  deviceName?: string;

  /**
   * Axis deadzone as a fraction (0.05 = 5%).
   * Values within the deadzone are reported as 0.
   * @default 0.05
   */
  deadzone?: number;

  /**
   * Autorepeat rate in Hz for continuous input.
   * Set to 0 to only send on change.
   * @default 20
   */
  autorepeatRate?: number;

  /**
   * Enable toggle mode for buttons (press to toggle on/off).
   * Useful for functions like headlights or horn.
   * @default false
   */
  stickyButtons?: boolean;

  /**
   * Debounce interval in ms to coalesce rapid input changes.
   * @default 1
   */
  coalesceIntervalMs?: number;

  /**
   * Maximum allowed video staleness in ms before blocking commands.
   *
   * Safety feature: Commands are only sent if video track
   * has received a frame within this threshold. Prevents "flying blind"
   * when video freezes.
   *
   * Set to 0 to disable this safety check.
   * @default 100
   */
  maxVideoStalenessMs?: number;

  /**
   * @deprecated No longer used - control messages go via single data channel
   */
  topic?: string;
}

/**
 * ROS-compatible Joy message format
 */
export interface JoyMessage {
  header: {
    stamp: { sec: number; nanosec: number };
    frame_id: string;
  };
  axes: number[];
  buttons: number[];
}

/**
 * Video track information
 */
export interface VideoTrack {
  /** Track identifier (from WebRTC) */
  id: string;
  /** Track name/topic (e.g., 'front_camera', 'fork') - extracted from SDP or track label */
  name: string;
  /** The underlying MediaStreamTrack */
  mediaStreamTrack: MediaStreamTrack;
  /** Video dimensions if available */
  dimensions?: { width: number; height: number };
  /** Whether the track is active */
  active: boolean;
}

/**
 * Event callback types
 */
export interface AdamoClientEvents {
  /** Called when connection state changes */
  connectionStateChanged: (state: ConnectionState) => void;
  /** Called when video track is received */
  videoTrackReceived: (track: VideoTrack) => void;
  /** Called when video track ends */
  videoTrackEnded: (trackId: string) => void;
  /** Called when data channel opens */
  dataChannelOpen: () => void;
  /** Called when data channel closes */
  dataChannelClose: () => void;
  /** Called when data is received on data channel */
  dataChannelMessage: (data: unknown) => void;
  /** Called when heartbeat state changes */
  heartbeatStateChanged: (state: HeartbeatState) => void;
  /** Called when a decoded frame is ready (WebCodecs mode) */
  decodedFrame: (frame: import('./webcodecs/types').DecodedVideoFrame) => void;
  /** Called on any error */
  error: (error: Error) => void;
  /** Called when map data is received (static or SLAM update) */
  mapData: (map: MapData) => void;
  /** Called when costmap data is received (local rolling window) */
  costmapData: (costmap: CostmapData) => void;
  /** Called when robot pose is updated */
  robotPose: (pose: RobotPose) => void;
  /** Called when navigation path is updated */
  navPath: (path: NavPath) => void;
  /** Called when network stats are updated */
  networkStatsUpdated: (stats: NetworkStats) => void;
  /** Called when track streaming stats are updated */
  trackStatsUpdated: (stats: TrackStreamStats) => void;
  /** Called when stream quality changes */
  qualityChanged: (quality: StreamQuality) => void;
  /** Called when robot velocity state is updated */
  velocityStateChanged: (state: VelocityState) => void;
  /** Called when encoder stats are received from server */
  encoderStatsUpdated: (stats: EncoderStats) => void;
  /** Called when robot stats are received (encoder latency from robot) */
  robotStatsUpdated: (stats: RobotStats) => void;
  /** Called when latency breakdown is updated */
  latencyBreakdownUpdated: (breakdown: LatencyBreakdown) => void;
}

// ============================================================================
// Navigation Types (Nav2 Integration)
// ============================================================================

/**
 * Map data from Nav2 map_server (OccupancyGrid)
 */
export interface MapData {
  /** Map width in cells */
  width: number;
  /** Map height in cells */
  height: number;
  /** Resolution in meters per cell */
  resolution: number;
  /** Origin X in world coordinates (meters) */
  origin_x: number;
  /** Origin Y in world coordinates (meters) */
  origin_y: number;
  /** Raw occupancy grid data: -1=unknown, 0=free, 100=occupied */
  data: number[];
}

/**
 * Local costmap data (robot-centered rolling window)
 * Values: 0=free, 100-252=inflated cost, 253=inscribed, 254=lethal
 */
export interface CostmapData {
  /** Costmap width in cells */
  width: number;
  /** Costmap height in cells */
  height: number;
  /** Resolution in meters per cell */
  resolution: number;
  /** Origin X in world coordinates (moves with robot) */
  origin_x: number;
  /** Origin Y in world coordinates (moves with robot) */
  origin_y: number;
  /** Robot X position in world frame */
  robot_x: number;
  /** Robot Y position in world frame */
  robot_y: number;
  /** Cost values: 0=free, 100-252=inflated, 253=inscribed, 254=lethal */
  data: number[];
}

/**
 * Robot pose from AMCL localization
 */
export interface RobotPose {
  /** X position in meters (map frame) */
  x: number;
  /** Y position in meters (map frame) */
  y: number;
  /** Orientation in radians */
  theta: number;
  /** Timestamp in milliseconds */
  timestamp: number;
}

/**
 * Navigation path from Nav2 planner
 */
export interface NavPath {
  /** Array of waypoints in the path */
  poses: Array<{
    x: number;
    y: number;
  }>;
}

/**
 * Navigation goal to send to Nav2
 */
export interface NavGoal {
  /** Target X position in meters (map frame) */
  x: number;
  /** Target Y position in meters (map frame) */
  y: number;
  /** Target orientation in radians */
  theta: number;
}

// ============================================================================
// Velocity/Motion Types (Safety Interlock)
// ============================================================================

/**
 * Robot velocity state from /odom topic
 * Used for safety interlocks (e.g., prevent mode switching while moving)
 */
export interface VelocityState {
  /** Forward/backward velocity in m/s */
  linearX: number;
  /** Left/right velocity in m/s (usually 0 for non-holonomic robots) */
  linearY: number;
  /** Rotational velocity in rad/s */
  angularZ: number;
  /** Whether the robot is currently in motion */
  isMoving: boolean;
  /** Timestamp when this state was recorded (Unix ms) */
  timestamp: number;
}

// ============================================================================
// Encoder Statistics Types (Server → Client)
// ============================================================================

/**
 * Encoder statistics from the server (per-track)
 * Sent via data channel on topic "stats/encoder"
 */
export interface EncoderStats {
  /** Track name (e.g., "fork", "front_low") */
  trackName: string;
  /** Time to encode a frame in milliseconds */
  encodeTimeMs: number;
  /** Total pipeline latency (capture to encoded) in milliseconds */
  pipelineLatencyMs: number;
  /** Frames encoded in the stats period */
  framesEncoded: number;
  /** Frames dropped in the stats period */
  framesDropped: number;
  /** Current encoding FPS */
  fps: number;
  /** Timestamp when these stats were collected (Unix ms) */
  timestamp: number;
}

// ============================================================================
// Latency Measurement Types (Fullstack RTT)
// ============================================================================

/**
 * Ping message sent to the robot for RTT measurement
 */
export interface PingMessage {
  type: 'ping';
  /** Sequence number for matching ping/pong pairs */
  id: number;
  /** Client send timestamp (Unix ms) */
  timestamp: number;
}

/**
 * Pong response from the robot
 */
export interface PongMessage {
  type: 'pong';
  /** Echoed sequence number */
  id: number;
  /** Echoed client timestamp */
  clientTimestamp: number;
  /** Robot receive timestamp (Unix ms) */
  robotTimestamp: number;
}

/**
 * Robot-side statistics message
 * Sent periodically by the robot over the data channel
 */
export interface RobotStats {
  type: 'stats/robot';
  /** Average encoder latency in milliseconds (capture to encoded) */
  encoderLatencyMs: number;
  /** Number of frames encoded in the stats period */
  framesEncoded: number;
  /** Timestamp when these stats were collected (Unix ms) */
  timestamp: number;
}

/**
 * Comprehensive end-to-end latency breakdown
 * Combines measurements from robot, network, and client
 */
export interface LatencyBreakdown {
  /** Application-level round-trip time (ping/pong) in ms */
  applicationRtt: number;
  /** One-way application latency (applicationRtt / 2) in ms */
  applicationLatency: number;
  /** Encoder latency on robot (capture to encoded) in ms */
  encoderLatency: number;
  /** Jitter buffer delay on client in ms */
  jitterBufferDelay: number;
  /** Video decode time on client in ms */
  decodeTime: number;
  /** Total estimated glass-to-glass latency in ms */
  totalLatency: number;
  /** Timestamp when this breakdown was computed (Unix ms) */
  timestamp: number;
}
