import { useEffect, useState } from 'react';
import type { LatencyBreakdown, RobotStats } from '@adamo-tech/core';
import { useTeleoperateContext } from '../context';

/**
 * Hook to access fullstack latency breakdown
 *
 * Returns a comprehensive latency breakdown including:
 * - Encoder latency (robot-side)
 * - Network latency (application RTT / 2)
 * - Jitter buffer delay (client-side)
 * - Decode time (client-side)
 * - Total end-to-end latency
 *
 * @returns The latency breakdown or null if not connected
 *
 * @example
 * ```tsx
 * function LatencyDisplay() {
 *   const breakdown = useLatencyBreakdown();
 *
 *   if (!breakdown) return <div>Not connected</div>;
 *
 *   return (
 *     <div>
 *       <div>Encoder: {breakdown.encoderLatency.toFixed(1)}ms</div>
 *       <div>Network: {breakdown.applicationLatency.toFixed(1)}ms</div>
 *       <div>Jitter Buffer: {breakdown.jitterBufferDelay.toFixed(1)}ms</div>
 *       <div>Decode: {breakdown.decodeTime.toFixed(1)}ms</div>
 *       <div>Total: {breakdown.totalLatency.toFixed(1)}ms</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLatencyBreakdown(): LatencyBreakdown | null {
  const { client, connectionState } = useTeleoperateContext();
  const [breakdown, setBreakdown] = useState<LatencyBreakdown | null>(null);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      setBreakdown(null);
      return;
    }

    const unsub = client.on('latencyBreakdownUpdated', setBreakdown);
    return unsub;
  }, [client, connectionState]);

  return breakdown;
}

/**
 * Hook to access robot-side statistics
 *
 * Returns encoder latency and frames encoded stats from the robot.
 *
 * @returns Robot stats or null if not connected
 */
export function useRobotStats(): RobotStats | null {
  const { client, connectionState } = useTeleoperateContext();
  const [stats, setStats] = useState<RobotStats | null>(null);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      setStats(null);
      return;
    }

    // Initialize with current state
    if (client.robotStats) {
      setStats(client.robotStats);
    }

    const unsub = client.on('robotStatsUpdated', setStats);
    return unsub;
  }, [client, connectionState]);

  return stats;
}

/**
 * Hook to access application-level RTT (ping/pong round-trip time)
 *
 * @returns RTT in milliseconds, or 0 if not connected
 */
export function useApplicationRtt(): number {
  const { client, connectionState } = useTeleoperateContext();
  const [rtt, setRtt] = useState(0);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      setRtt(0);
      return;
    }

    // Initialize with current value
    setRtt(client.applicationRtt);

    // Update when breakdown updates (contains latest RTT)
    const unsub = client.on('latencyBreakdownUpdated', (breakdown) => {
      setRtt(breakdown.applicationRtt);
    });
    return unsub;
  }, [client, connectionState]);

  return rtt;
}
