'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Room/robot information from backend
 */
export interface Room {
  /** Unique room identifier */
  id: string;
  /** Display name for the room */
  name: string;
  /** Robot name (if different from room name) */
  robot_name?: string;
  /** Whether the robot is currently online */
  is_online?: boolean;
  /** Last time the robot was seen online */
  last_seen?: string;
}

/**
 * Configuration for useRooms hook
 */
export interface UseRoomsConfig {
  /**
   * Backend API URL
   * @default process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
   */
  apiUrl?: string;
  /**
   * Rooms endpoint path
   * @default '/rooms'
   */
  roomsPath?: string;
  /**
   * Access token for authentication
   */
  accessToken?: string | null;
  /**
   * Whether to automatically fetch rooms when accessToken is available
   * @default true
   */
  autoFetch?: boolean;
  /**
   * Callback when token is invalid/expired (401 response)
   */
  onUnauthorized?: () => void;
}

/**
 * Return type for useRooms hook
 */
export interface UseRoomsReturn {
  /** List of available rooms */
  rooms: Room[];
  /** Whether rooms are currently loading */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Manually fetch/refresh rooms */
  fetchRooms: () => Promise<void>;
  /** Clear current error */
  clearError: () => void;
}

const DEFAULT_CONFIG = {
  apiUrl: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:8000',
  roomsPath: '/rooms',
  autoFetch: true,
};

/**
 * Hook for fetching and managing available rooms/robots
 *
 * Automatically fetches rooms when an access token is provided,
 * handles 401 responses, and provides refresh capability.
 *
 * @example Basic usage with useAuth
 * ```tsx
 * function RoomSelector() {
 *   const { session } = useAuth();
 *   const { rooms, isLoading, error } = useRooms({
 *     accessToken: session?.accessToken,
 *     onUnauthorized: () => logout(),
 *   });
 *
 *   if (isLoading) return <div>Loading rooms...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <ul>
 *       {rooms.map(room => (
 *         <li key={room.id}>
 *           {room.name} {room.is_online ? '(online)' : '(offline)'}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example With custom API URL
 * ```tsx
 * const { rooms } = useRooms({
 *   apiUrl: 'https://api.example.com',
 *   accessToken: token,
 * });
 * ```
 */
export function useRooms(config: UseRoomsConfig = {}): UseRoomsReturn {
  const { apiUrl, roomsPath, accessToken, autoFetch, onUnauthorized } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    if (!accessToken) {
      setRooms([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}${roomsPath}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        onUnauthorized?.();
        setRooms([]);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, apiUrl, roomsPath, onUnauthorized]);

  // Auto-fetch rooms when accessToken changes
  useEffect(() => {
    if (autoFetch && accessToken) {
      fetchRooms();
    }
  }, [autoFetch, accessToken, fetchRooms]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    rooms,
    isLoading,
    error,
    fetchRooms,
    clearError,
  };
}

export default useRooms;
