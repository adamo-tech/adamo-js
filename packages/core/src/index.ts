// Core client
export { AdamoClient } from './client';

// Managers
export { HeartbeatManager } from './heartbeat';
export { JoypadManager } from './joypad';

// WebRTC layer
export { WebRTCConnection } from './webrtc';
export type {
  SignalingConfig,
  WebRTCConnectionState,
  WebRTCConnectionConfig,
  WebRTCConnectionCallbacks,
} from './webrtc';

// WebCodecs utilities
export {
  isWebCodecsSupported,
  isRTCRtpScriptTransformSupported,
  isInsertableStreamsSupported,
  attachWebCodecsTransform,
  getVideoReceivers,
  getReceiverForTrack,
} from './webcodecs';
export type {
  DecodedVideoFrame,
  WebCodecsConfig,
  WebCodecsStats,
  AttachTransformResult,
} from './webcodecs';

// Types
export type {
  ConnectionState,
  HeartbeatConfig,
  JoypadConfig,
  JoyMessage,
  VideoTrack,
  AdamoClientConfig,
  AdamoClientEvents,
  // Control message types
  ControlMessage,
  ControllerState,
  HeartbeatMessage,
  // Nav2 types
  MapData,
  CostmapData,
  RobotPose,
  NavPath,
  NavGoal,
  // Adaptive streaming types
  NetworkStats,
  TrackStreamStats,
  AdaptiveStreamState,
  // Velocity/motion types
  VelocityState,
  // Encoder stats types
  EncoderStats,
  // Latency measurement types
  PingMessage,
  PongMessage,
  RobotStats,
  LatencyBreakdown,
  // Topic streaming types
  TopicMessage,
  // Twist types
  Vector3,
  TwistMessage,
} from './types';

// Enums (need separate export)
export { HeartbeatState, StreamQuality } from './types';
