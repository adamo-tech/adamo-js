import { useEffect, useState } from 'react';
import { VelocityState } from '@adamo-tech/core';
import { useAdamoContext } from '../context';

/**
 * Hook to monitor robot velocity state from /odom topic
 *
 * Used for safety interlocks like preventing mode switching while moving.
 *
 * @returns Current velocity state and isMoving flag
 *
 * @example
 * ```tsx
 * function ModeSwitch() {
 *   const { isMoving } = useVelocity();
 *
 *   const handleModeChange = () => {
 *     if (isMoving) {
 *       alert('Cannot switch modes while moving');
 *       return;
 *     }
 *     // ... switch mode
 *   };
 * }
 * ```
 */
export function useVelocity(): {
  velocityState: VelocityState | null;
  isMoving: boolean;
} {
  const { client, connectionState } = useAdamoContext();
  const [velocityState, setVelocityState] = useState<VelocityState | null>(null);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      return;
    }

    const unsubscribe = client.on('velocityStateChanged', (state: VelocityState) => {
      setVelocityState(state);
    });

    return unsubscribe;
  }, [client, connectionState]);

  return {
    velocityState,
    isMoving: velocityState?.isMoving ?? false,
  };
}
