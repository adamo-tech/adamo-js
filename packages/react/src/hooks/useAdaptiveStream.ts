import { useEffect, useState, useMemo } from 'react';
import type { NetworkStats, TrackStreamStats } from '@adamo-tech/core';
import { useTeleoperateContext } from '../context';

/**
 * Hook to access adaptive streaming state for all tracks
 *
 * @returns Network stats and per-track streaming statistics
 */
export function useAdaptiveStream(): {
  networkStats: NetworkStats | null;
  trackStats: Map<string, TrackStreamStats>;
} {
  const { client, connectionState } = useTeleoperateContext();
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [trackStats, setTrackStats] = useState<Map<string, TrackStreamStats>>(new Map());

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      setNetworkStats(null);
      setTrackStats(new Map());
      return;
    }

    // Initialize with current state
    if (client.networkStats) {
      setNetworkStats(client.networkStats);
    }
    if (client.trackStats.size > 0) {
      setTrackStats(new Map(client.trackStats));
    }

    const unsubNetwork = client.on('networkStatsUpdated', setNetworkStats);
    const unsubTrack = client.on('trackStatsUpdated', (stats) => {
      setTrackStats((prev) => {
        const next = new Map(prev);
        next.set(stats.trackName, stats);
        return next;
      });
    });

    return () => {
      unsubNetwork();
      unsubTrack();
    };
  }, [client, connectionState]);

  return {
    networkStats,
    trackStats,
  };
}

/**
 * Hook to get statistics for a specific video track
 *
 * @param trackName - Optional track name/topic. If not provided, returns stats for the first track.
 * @returns The track statistics or null if not available
 */
export function useTrackStats(trackName?: string): TrackStreamStats | null {
  const { client, connectionState } = useTeleoperateContext();
  const [stats, setStats] = useState<TrackStreamStats | null>(null);

  // Get the first track name if not specified
  const targetTrackName = useMemo(() => {
    if (trackName) return trackName;
    if (client?.trackStats.size) {
      return client.trackStats.keys().next().value;
    }
    return null;
  }, [trackName, client]);

  useEffect(() => {
    if (!client || connectionState !== 'connected' || !targetTrackName) {
      setStats(null);
      return;
    }

    // Initialize with current stats for this track
    const currentStats = client.trackStats.get(targetTrackName);
    if (currentStats) {
      setStats(currentStats);
    }

    const unsub = client.on('trackStatsUpdated', (trackStats) => {
      if (trackStats.trackName === targetTrackName) {
        setStats(trackStats);
      }
    });

    return unsub;
  }, [client, connectionState, targetTrackName]);

  return stats;
}
