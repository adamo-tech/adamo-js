import { useEffect } from 'react';
import { useHeartbeat } from '../hooks/useHeartbeat';
import type { HeartbeatConfig } from '@adamo-tech/core';
import { HeartbeatState } from '@adamo-tech/core';

export interface HeartbeatMonitorProps {
  /** Heartbeat configuration */
  config?: HeartbeatConfig;
  /** Called when heartbeat state changes */
  onStateChange?: (state: HeartbeatState) => void;
}

/**
 * HeartbeatMonitor - Declarative heartbeat monitoring component
 *
 * Drop this component anywhere inside AdamoProvider to enable heartbeat
 * monitoring and sending to the server. Automatically monitors gamepad
 * connection and window focus for safety.
 *
 * @example
 * ```tsx
 * <AdamoProvider config={...} autoConnect={...}>
 *   <HeartbeatMonitor />
 *   <GamepadController />
 *   <VideoFeed topic="fork" />
 * </AdamoProvider>
 *
 * // With callbacks
 * <HeartbeatMonitor
 *   onStateChange={(state) => console.log('Safety:', HeartbeatState[state])}
 * />
 * ```
 */
export function HeartbeatMonitor({
  config,
  onStateChange,
}: HeartbeatMonitorProps) {
  const { state } = useHeartbeat(config);

  // Notify on state change
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // This component renders nothing - it just enables heartbeat functionality
  return null;
}
