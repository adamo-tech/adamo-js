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

import type { Room, RemoteTrackPublication, RemoteParticipant } from 'livekit-client';

/**
 * Connection state for the Adamo client.
 *
 * State transitions:
 * - `disconnected` → `connecting` (on connect call)
 * - `connecting` → `connected` (on successful connection)
 * - `connected` → `reconnecting` (on network interruption)
 * - `reconnecting` → `connected` (on successful reconnection)
 * - Any state → `disconnected` (on disconnect call or fatal error)
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
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

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

/**
 * Configuration options for the Adamo client.
 *
 * @example
 * ```ts
 * const client = new AdamoClient({
 *   serverIdentity: 'forklift-01',
 *   videoCodec: 'h264',
 *   playoutDelay: -0.1, // Minimum buffering for low latency
 * });
 * ```
 */
export interface AdamoClientConfig {
  /**
   * Server participant identity to communicate with.
   * This should match the identity of the robot's LiveKit participant.
   * @default 'robot'
   */
  serverIdentity?: string;

  /**
   * Enable adaptive streaming for automatic quality adjustment based on network conditions.
   * @default true
   */
  adaptiveStream?: boolean;

  /**
   * Enable dynacast to only send video when someone is subscribed.
   * Improves efficiency in multi-participant scenarios.
   * @default true
   */
  dynacast?: boolean;

  /**
   * Video codec preference for encoding/decoding.
   * - `h264`: Best compatibility, hardware acceleration common
   * - `vp8`: Open codec, good quality
   * - `vp9`: Better compression than VP8
   * - `av1`: Best compression, but higher CPU usage
   * @default 'h264'
   */
  videoCodec?: 'h264' | 'vp8' | 'vp9' | 'av1';

  /**
   * Playout delay in seconds for video tracks.
   * Controls the jitter buffer size:
   * - `0`: Default browser behavior
   * - Negative (e.g., `-0.1`): Request minimum buffering for lowest latency
   * - Positive: Add extra buffer for smoother playback
   * @default -0.1
   */
  playoutDelay?: number;
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
   * Safety feature: Commands are only sent if majority of video tracks
   * have received a frame within this threshold. Prevents "flying blind"
   * when video freezes.
   *
   * Set to 0 to disable this safety check.
   * @default 100
   */
  maxVideoStalenessMs?: number;

  /**
   * Topic name for joy messages.
   *
   * Use different topics to support multiple controllers connected to
   * the same computer, each controlling different robot functions.
   *
   * @default 'joy'
   * @example
   * ```ts
   * // Driver controls movement
   * { topic: 'joy_driver' }
   * // Passenger controls camera/arm
   * { topic: 'joy_passenger' }
   * ```
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
  /** Track name (matches ROS topic name without slashes) */
  name: string;
  /** Track SID */
  sid: string;
  /** Whether the track is subscribed */
  subscribed: boolean;
  /** Whether the track is muted */
  muted: boolean;
  /** Video dimensions if available */
  dimensions?: { width: number; height: number };
  /** The underlying MediaStreamTrack */
  mediaStreamTrack?: MediaStreamTrack;
}

/**
 * Event callback types
 */
export interface AdamoClientEvents {
  /** Called when connection state changes */
  connectionStateChanged: (state: ConnectionState) => void;
  /** Called when a new video track is available */
  trackAvailable: (track: VideoTrack) => void;
  /** Called when a track is removed */
  trackRemoved: (trackName: string) => void;
  /** Called when a track's subscription state changes */
  trackSubscribed: (track: VideoTrack) => void;
  /** Called when a track is unsubscribed */
  trackUnsubscribed: (trackName: string) => void;
  /** Called when heartbeat state changes */
  heartbeatStateChanged: (state: HeartbeatState) => void;
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
  qualityChanged: (quality: StreamQuality, trackName?: string) => void;
  /** Called when robot velocity state is updated */
  velocityStateChanged: (state: VelocityState) => void;
  /** Called when encoder stats are received from server */
  encoderStatsUpdated: (stats: EncoderStats) => void;
}

/**
 * Internal track subscription info
 */
export interface TrackSubscription {
  publication: RemoteTrackPublication;
  participant: RemoteParticipant;
  callbacks: Set<(track: VideoTrack) => void>;
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
 * Sent via LiveKit data channel on topic "stats/encoder"
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
