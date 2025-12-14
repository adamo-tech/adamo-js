import { useEffect, useRef, useState, useMemo } from 'react';
import { HeartbeatManager, HeartbeatConfig, HeartbeatState } from '@adamo-tech/core';
import { useAdamoContext } from '../context';

// Stabilize config object to prevent effect re-runs
function useStableConfig(config?: HeartbeatConfig): HeartbeatConfig | undefined {
  const configJson = config ? JSON.stringify(config) : undefined;
  return useMemo(() => (configJson ? JSON.parse(configJson) : undefined), [configJson]);
}

/**
 * Hook to manage heartbeat monitoring
 *
 * Automatically starts/stops heartbeat when connection state changes.
 * Monitors controller connection and window focus for safety.
 *
 * @param config - Heartbeat configuration options
 * @returns Current heartbeat state
 *
 * @example
 * ```tsx
 * function HeartbeatIndicator() {
 *   const { state } = useHeartbeat();
 *
 *   return (
 *     <div>
 *       <p>State: {HeartbeatState[state]}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useHeartbeat(config?: HeartbeatConfig): {
  state: HeartbeatState;
} {
  const { client, connectionState } = useAdamoContext();
  const managerRef = useRef<HeartbeatManager | null>(null);
  const [state, setState] = useState<HeartbeatState>(HeartbeatState.OK);
  const stableConfig = useStableConfig(config);

  useEffect(() => {
    if (!client) return;

    const manager = new HeartbeatManager(client, stableConfig);
    managerRef.current = manager;

    const unsubState = manager.onStateChange((newState) => {
      setState(newState);
    });

    // Start when connected
    if (connectionState === 'connected') {
      manager.start();
    }

    return () => {
      unsubState();
      manager.stop();
      managerRef.current = null;
    };
  }, [client, stableConfig]);

  // Start/stop based on connection state
  useEffect(() => {
    if (!managerRef.current) return;

    if (connectionState === 'connected') {
      managerRef.current.start();
    } else {
      managerRef.current.stop();
    }
  }, [connectionState]);

  return { state };
}
