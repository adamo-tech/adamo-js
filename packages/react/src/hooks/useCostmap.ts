import { useEffect, useState } from 'react';
import type { CostmapData } from '@adamo-tech/core';
import { useAdamoContext } from '../context';

/**
 * Hook to access local costmap data (robot-centered rolling window)
 *
 * @returns Current costmap data (null if not yet received)
 *
 * @example
 * ```tsx
 * function CostmapDisplay() {
 *   const { costmap } = useCostmap();
 *
 *   if (!costmap) return <div>Waiting for costmap...</div>;
 *
 *   return <CostmapViewer costmap={costmap} />;
 * }
 * ```
 */
export function useCostmap(): {
  /** Current costmap data (null if not yet received) */
  costmap: CostmapData | null;
  /** Whether connected to the server */
  isConnected: boolean;
} {
  const { client, connectionState } = useAdamoContext();
  const [costmap, setCostmap] = useState<CostmapData | null>(null);

  const isConnected = connectionState === 'connected';

  // Subscribe to costmap events
  useEffect(() => {
    if (!client) return;

    const unsub = client.on('costmapData', (data) => {
      setCostmap(data);
    });

    return () => {
      unsub();
    };
  }, [client]);

  // Clear state on disconnect
  useEffect(() => {
    if (connectionState === 'disconnected') {
      setCostmap(null);
    }
  }, [connectionState]);

  return {
    costmap,
    isConnected,
  };
}
