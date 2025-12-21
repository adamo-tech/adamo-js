import { useTeleoperateContext } from '../context';
import type { AdamoClient, ConnectionState, VideoTrack, SignalingConfig } from '@adamo-tech/core';

/**
 * Hook to access the Adamo client
 *
 * @returns The Adamo client instance, connection state, video track, and connection methods
 *
 * @example
 * ```tsx
 * function StatusIndicator() {
 *   const { connectionState, videoTrack, dataChannelOpen } = useAdamo();
 *
 *   return (
 *     <div>
 *       <p>Status: {connectionState}</p>
 *       <p>Video: {videoTrack ? 'Available' : 'No video'}</p>
 *       <p>Data Channel: {dataChannelOpen ? 'Open' : 'Closed'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdamo(): {
  client: AdamoClient | null;
  connectionState: ConnectionState;
  videoTrack: VideoTrack | null;
  dataChannelOpen: boolean;
  connect: (config: SignalingConfig) => Promise<void>;
  disconnect: () => void;
} {
  return useTeleoperateContext();
}
