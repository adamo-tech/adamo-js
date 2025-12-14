import { useAdamoContext } from '../context';
import type { AdamoClient, ConnectionState, VideoTrack } from '@adamo-tech/core';

/**
 * Hook to access the Adamo client
 *
 * @returns The Adamo client instance, connection state, and available tracks
 *
 * @example
 * ```tsx
 * function StatusIndicator() {
 *   const { connectionState, availableTracks } = useAdamo();
 *
 *   return (
 *     <div>
 *       <p>Status: {connectionState}</p>
 *       <p>Tracks: {availableTracks.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdamo(): {
  client: AdamoClient | null;
  connectionState: ConnectionState;
  availableTracks: VideoTrack[];
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => void;
} {
  return useAdamoContext();
}
