'use client';

import { useState, useCallback } from 'react';
import type { SignalingConfig } from '@adamo-tech/core';

/**
 * Room token response from backend
 */
export interface RoomTokenResponse {
  /** JWT token for signaling authentication */
  token: string;
  /** WebSocket URL path (e.g., '/ws/signal/{room_id}?token=xxx') */
  websocket_url: string;
  /** ICE servers for WebRTC */
  ice_servers?: RTCIceServer[];
}

/**
 * Configuration for useRoomConnection hook
 */
export interface UseRoomConnectionConfig {
  /**
   * Backend API URL
   * @default process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
   */
  apiUrl?: string;
  /**
   * Room token endpoint path (room ID will be interpolated)
   * @default '/rooms/{roomId}/token'
   */
  tokenPath?: string;
  /**
   * Access token for authentication
   */
  accessToken?: string | null;
  /**
   * Callback when token is invalid/expired (401 response)
   */
  onUnauthorized?: () => void;
}

/**
 * Return type for useRoomConnection hook
 */
export interface UseRoomConnectionReturn {
  /** Signaling configuration ready for Teleoperate component */
  signalingConfig: SignalingConfig | null;
  /** Whether connection setup is in progress */
  isConnecting: boolean;
  /** Whether connected (signalingConfig is ready) */
  isConnected: boolean;
  /** Current error message */
  error: string | null;
  /** Connect to a room by ID */
  connectToRoom: (roomId: string) => Promise<boolean>;
  /** Disconnect and clear signaling config */
  disconnect: () => void;
  /** Clear current error */
  clearError: () => void;
}

const DEFAULT_CONFIG = {
  apiUrl: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:8000',
  tokenPath: '/rooms/{roomId}/token',
};

/**
 * Hook for managing room connection setup
 *
 * Fetches room token and builds SignalingConfig for the Teleoperate component.
 * Handles the WebSocket URL construction and ICE server configuration.
 *
 * @example Basic usage
 * ```tsx
 * function RoomConnection() {
 *   const { session } = useAuth();
 *   const { rooms } = useRooms({ accessToken: session?.accessToken });
 *   const {
 *     signalingConfig,
 *     isConnecting,
 *     isConnected,
 *     connectToRoom,
 *     disconnect,
 *   } = useRoomConnection({ accessToken: session?.accessToken });
 *
 *   if (isConnected && signalingConfig) {
 *     return (
 *       <Teleoperate signaling={signalingConfig} autoConnect>
 *         <VideoFeed />
 *         <button onClick={disconnect}>Disconnect</button>
 *       </Teleoperate>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       {rooms.map(room => (
 *         <button
 *           key={room.id}
 *           onClick={() => connectToRoom(room.id)}
 *           disabled={isConnecting}
 *         >
 *           {room.name}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With signalling URL override
 * ```tsx
 * const { connectToRoom } = useRoomConnection({
 *   accessToken: token,
 *   apiUrl: 'https://api.example.com',
 * });
 * ```
 */
export function useRoomConnection(config: UseRoomConnectionConfig = {}): UseRoomConnectionReturn {
  const { apiUrl, tokenPath, accessToken, onUnauthorized } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const [signalingConfig, setSignalingConfig] = useState<SignalingConfig | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectToRoom = useCallback(async (roomId: string): Promise<boolean> => {
    if (!accessToken) {
      setError('Not authenticated');
      return false;
    }

    if (!roomId) {
      setError('Room ID is required');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const endpoint = `${apiUrl}${tokenPath.replace('{roomId}', roomId)}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        onUnauthorized?.();
        return false;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to get room token');
      }

      const data: RoomTokenResponse = await response.json();

      if (!data.websocket_url) {
        throw new Error('Missing websocket_url in response');
      }

      if (!data.token) {
        throw new Error('Missing token in response');
      }

      // Convert HTTP URL to WebSocket URL and append the path
      const wsBase = apiUrl.replace(/^http/, 'ws');
      const serverUrl = `${wsBase}${data.websocket_url}`;

      const newConfig: SignalingConfig = {
        serverUrl,
        roomId,
        token: data.token,
        iceServers: data.ice_servers,
      };

      setSignalingConfig(newConfig);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to room');
      setSignalingConfig(null);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [accessToken, apiUrl, tokenPath, onUnauthorized]);

  const disconnect = useCallback(() => {
    setSignalingConfig(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signalingConfig,
    isConnecting,
    isConnected: signalingConfig !== null,
    error,
    connectToRoom,
    disconnect,
    clearError,
  };
}

export default useRoomConnection;
