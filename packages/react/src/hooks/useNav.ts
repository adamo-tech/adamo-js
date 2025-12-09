import { useEffect, useState, useCallback } from 'react';
import type { MapData, RobotPose, NavPath, NavGoal } from '@adamo/adamo-core';
import { useAdamoContext } from '../context';

/**
 * Hook to access Nav2 navigation data (map, robot pose, path)
 *
 * Subscribes to map data, robot pose updates, and navigation path.
 * Also provides a function to send navigation goals.
 *
 * @returns Navigation state and goal function
 *
 * @example
 * ```tsx
 * function MapDisplay() {
 *   const { map, robotPose, path, sendGoal, isConnected } = useNav();
 *
 *   const handleMapClick = (x: number, y: number) => {
 *     sendGoal({ x, y, theta: 0 });
 *   };
 *
 *   if (!map) return <div>Loading map...</div>;
 *
 *   return (
 *     <MapViewer
 *       map={map}
 *       robotPose={robotPose}
 *       path={path}
 *       onGoalClick={handleMapClick}
 *     />
 *   );
 * }
 * ```
 */
export function useNav(): {
  /** Current map data (null if not yet received) */
  map: MapData | null;
  /** Current robot pose (null if not yet received) */
  robotPose: RobotPose | null;
  /** Current navigation path (null if no active path) */
  path: NavPath | null;
  /** Send a navigation goal to Nav2 */
  sendGoal: (goal: NavGoal) => Promise<void>;
  /** Whether connected to the server */
  isConnected: boolean;
} {
  const { client, connectionState } = useAdamoContext();
  const [map, setMap] = useState<MapData | null>(null);
  const [robotPose, setRobotPose] = useState<RobotPose | null>(null);
  const [path, setPath] = useState<NavPath | null>(null);

  const isConnected = connectionState === 'connected';

  // Subscribe to nav events
  useEffect(() => {
    if (!client) return;

    const unsubMap = client.on('mapData', (mapData) => {
      setMap(mapData);
    });

    const unsubPose = client.on('robotPose', (pose) => {
      setRobotPose(pose);
    });

    const unsubPath = client.on('navPath', (navPath) => {
      setPath(navPath);
    });

    return () => {
      unsubMap();
      unsubPose();
      unsubPath();
    };
  }, [client]);

  // Clear state on disconnect
  useEffect(() => {
    if (connectionState === 'disconnected') {
      setMap(null);
      setRobotPose(null);
      setPath(null);
    }
  }, [connectionState]);

  const sendGoal = useCallback(
    async (goal: NavGoal) => {
      if (!client) {
        throw new Error('Not connected');
      }
      await client.sendNavGoal(goal);
    },
    [client]
  );

  return {
    map,
    robotPose,
    path,
    sendGoal,
    isConnected,
  };
}
