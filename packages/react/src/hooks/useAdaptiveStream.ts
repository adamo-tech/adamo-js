import { useEffect, useState, useCallback } from 'react';
import type { NetworkStats, TrackStreamStats, EncoderStats } from '@adamo/adamo-core';
import { StreamQuality } from '@adamo/adamo-core';
import { useAdamoContext } from '../context';

/**
 * Hook to access adaptive streaming state
 */
export function useAdaptiveStream(): {
  networkStats: NetworkStats | null;
  trackStats: Map<string, TrackStreamStats>;
  encoderStats: Map<string, EncoderStats>;
  preferredQuality: StreamQuality;
  setPreferredQuality: (quality: StreamQuality) => Promise<void>;
} {
  const { client, connectionState } = useAdamoContext();
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [trackStats, setTrackStats] = useState<Map<string, TrackStreamStats>>(new Map());
  const [encoderStats, setEncoderStats] = useState<Map<string, EncoderStats>>(new Map());
  const [preferredQuality, setPreferredQualityState] = useState<StreamQuality>(StreamQuality.AUTO);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      setNetworkStats(null);
      setTrackStats(new Map());
      setEncoderStats(new Map());
      return;
    }

    // Initialize with current state
    if (client.networkStats) {
      setNetworkStats(client.networkStats);
    }
    if (client.trackStats.size > 0) {
      setTrackStats(new Map(client.trackStats));
    }
    if (client.encoderStats.size > 0) {
      setEncoderStats(new Map(client.encoderStats));
    }
    setPreferredQualityState(client.preferredQuality);

    const unsubNetwork = client.on('networkStatsUpdated', setNetworkStats);

    const unsubTrack = client.on('trackStatsUpdated', (stats) => {
      setTrackStats((prev) => {
        const next = new Map(prev);
        next.set(stats.trackName, stats);
        return next;
      });
    });

    const unsubEncoder = client.on('encoderStatsUpdated', (stats) => {
      setEncoderStats((prev) => {
        const next = new Map(prev);
        next.set(stats.trackName, stats);
        return next;
      });
    });

    return () => {
      unsubNetwork();
      unsubTrack();
      unsubEncoder();
    };
  }, [client, connectionState]);

  const setPreferredQuality = useCallback(async (quality: StreamQuality) => {
    if (!client) return;
    setPreferredQualityState(quality);
    await client.setPreferredQuality(quality);
  }, [client]);

  return {
    networkStats,
    trackStats,
    encoderStats,
    preferredQuality,
    setPreferredQuality,
  };
}

/**
 * Hook to get statistics for a specific video track
 */
export function useTrackStats(trackName: string): TrackStreamStats | null {
  const { client, connectionState } = useAdamoContext();
  const [stats, setStats] = useState<TrackStreamStats | null>(null);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      setStats(null);
      return;
    }

    const currentStats = client.getTrackStats(trackName);
    if (currentStats) {
      setStats(currentStats);
    }

    const unsub = client.on('trackStatsUpdated', (trackStats) => {
      if (trackStats.trackName === trackName) {
        setStats(trackStats);
      }
    });

    return unsub;
  }, [client, connectionState, trackName]);

  return stats;
}
