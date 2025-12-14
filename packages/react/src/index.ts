// Context
export { Teleoperate, useTeleoperateContext } from './context';
export type { TeleoperateProps } from './context';
// Deprecated aliases for backwards compatibility
export { AdamoProvider, useAdamoContext } from './context';
export type { AdamoProviderProps } from './context';

// Components
export { VideoFeed, CameraFeed } from './components/VideoFeed';
export type { VideoFeedProps, CameraFeedProps } from './components/VideoFeed';
export { GamepadController } from './components/GamepadController';
export type { GamepadControllerProps } from './components/GamepadController';
export { HeartbeatMonitor } from './components/HeartbeatMonitor';
export type { HeartbeatMonitorProps } from './components/HeartbeatMonitor';
export { ConnectionStatus } from './components/ConnectionStatus';
export type { ConnectionStatusProps } from './components/ConnectionStatus';
export { MapViewer } from './components/MapViewer';
export type { MapViewerProps } from './components/MapViewer';
export { CostmapViewer } from './components/CostmapViewer';
export type { CostmapViewerProps } from './components/CostmapViewer';
export { StatsOverlay } from './components/StatsOverlay';
export type { StatsOverlayProps, StatsOverlayThresholds } from './components/StatsOverlay';
export { MultiModeLayout } from './components/MultiModeLayout';
export type { MultiModeLayoutProps, LayoutMode } from './components/MultiModeLayout';

// Hooks (for advanced use cases)
export { useAdamo } from './hooks/useAdamo';
export { useHeartbeat } from './hooks/useHeartbeat';
export { useJoypad } from './hooks/useJoypad';
export { useVideoTrack } from './hooks/useVideoTrack';
export { useNav } from './hooks/useNav';
export { useCostmap } from './hooks/useCostmap';
export { useAdaptiveStream, useTrackStats } from './hooks/useAdaptiveStream';
export { useVelocity } from './hooks/useVelocity';

// Re-export core types for convenience
export { HeartbeatState, StreamQuality } from '@adamo-tech/core';
export type {
  ConnectionState,
  HeartbeatConfig,
  JoypadConfig,
  JoyMessage,
  VideoTrack,
  AdamoClientConfig,
  // Nav2 types
  MapData,
  CostmapData,
  RobotPose,
  NavPath,
  NavGoal,
  // Adaptive streaming types
  NetworkStats,
  TrackStreamStats,
  // Encoder stats types
  EncoderStats,
  // Velocity types
  VelocityState,
} from '@adamo-tech/core';
