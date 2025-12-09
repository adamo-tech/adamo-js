import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { JoypadManager, JoypadConfig, JoyMessage } from '@adamo/adamo-core';
import { useAdamoContext } from '../context';

// Stabilize config object to prevent effect re-runs
function useStableConfig(config?: JoypadConfig): JoypadConfig | undefined {
  const configJson = config ? JSON.stringify(config) : undefined;
  return useMemo(() => (configJson ? JSON.parse(configJson) : undefined), [configJson]);
}

/**
 * Hook to manage joypad/gamepad input
 *
 * Automatically starts/stops joypad polling when connection state changes.
 *
 * @param config - Joypad configuration options
 * @returns Joypad state and controls
 *
 * @example
 * ```tsx
 * function JoypadStatus() {
 *   const { isConnected, lastInput } = useJoypad();
 *
 *   return (
 *     <div>
 *       <p>Controller: {isConnected ? 'Connected' : 'Disconnected'}</p>
 *       {lastInput && (
 *         <p>Axes: {lastInput.axes.join(', ')}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useJoypad(config?: JoypadConfig): {
  isConnected: boolean;
  lastInput: JoyMessage | null;
  start: () => void;
  stop: () => void;
} {
  const { client, connectionState } = useAdamoContext();
  const managerRef = useRef<JoypadManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastInput, setLastInput] = useState<JoyMessage | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const stableConfig = useStableConfig(config);

  useEffect(() => {
    if (!client) return;

    const manager = new JoypadManager(client, stableConfig);
    managerRef.current = manager;

    const unsubInput = manager.onInput((msg) => {
      setLastInput(msg);
    });

    // Check gamepad connection periodically
    const connectionInterval = setInterval(() => {
      setIsConnected(manager.isConnected());
    }, 1000);

    // Auto-start when connected
    if (connectionState === 'connected') {
      manager.start();
      setIsRunning(true);
    }

    return () => {
      unsubInput();
      clearInterval(connectionInterval);
      manager.stop();
      managerRef.current = null;
      setIsRunning(false);
    };
  }, [client, stableConfig]);

  // Start/stop based on connection state
  useEffect(() => {
    if (!managerRef.current) return;

    if (connectionState === 'connected' && !isRunning) {
      managerRef.current.start();
      setIsRunning(true);
    } else if (connectionState !== 'connected' && isRunning) {
      managerRef.current.stop();
      setIsRunning(false);
    }
  }, [connectionState, isRunning]);

  const start = useCallback(() => {
    managerRef.current?.start();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    managerRef.current?.stop();
    setIsRunning(false);
  }, []);

  return { isConnected, lastInput, start, stop };
}
