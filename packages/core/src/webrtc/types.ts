/**
 * WebRTC Connection Types
 *
 * Types for signaling, connection state, and WebRTC configuration.
 */

/**
 * Configuration for connecting to the signaling server
 */
export interface SignalingConfig {
  /** Signaling server URL (e.g., 'wss://example.com') */
  serverUrl: string;
  /** Room ID to join */
  roomId: string;
  /** Authentication token (passed via WebSocket subprotocol) */
  token?: string;
  /** ICE servers for STUN/TURN */
  iceServers?: RTCIceServer[];
  /** Optional full WebSocket path override (e.g., from backend response) */
  websocketPath?: string;
}

/**
 * WebRTC connection states
 */
export type WebRTCConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

/**
 * Callbacks for WebRTC connection events
 */
export interface WebRTCConnectionCallbacks {
  /** Called when a media track is received */
  onTrack?: (track: MediaStreamTrack, streams: readonly MediaStream[]) => void;
  /** Called when connection state changes */
  onConnectionStateChange?: (state: WebRTCConnectionState) => void;
  /** Called when the data channel opens */
  onDataChannelOpen?: () => void;
  /** Called when the data channel closes */
  onDataChannelClose?: () => void;
  /** Called when a message is received on the data channel */
  onDataChannelMessage?: (data: unknown) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Configuration for WebRTC connection
 */
export interface WebRTCConnectionConfig extends WebRTCConnectionCallbacks {
  /** Signaling configuration */
  signaling: SignalingConfig;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Signaling message types from the server
 */
export type SignalingMessageType =
  | 'room_joined'
  | 'ping'
  | 'pong'
  | 'peer_connected'
  | 'preparing'
  | 'peer_disconnected'
  | 'offer'
  | 'answer'
  | 'candidate';

/**
 * Track metadata sent with offer
 */
export interface TrackMetadata {
  /** Track name (e.g., 'front_camera') */
  name: string;
  /** Track index in the SDP */
  index: number;
}

/**
 * Signaling message structure
 */
export interface SignalingMessage {
  type: SignalingMessageType;
  sdp?: string;
  candidate?: string;
  sdpMLineIndex?: number;
  /** Track metadata (sent with offer) */
  tracks?: TrackMetadata[];
}
