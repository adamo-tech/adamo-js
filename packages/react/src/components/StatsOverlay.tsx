'use client';

import { useState } from 'react';
import { HeartbeatState } from '@adamo-tech/core';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { useJoypad } from '../hooks/useJoypad';
import { useAdaptiveStream } from '../hooks/useAdaptiveStream';
import { useLatencyBreakdown } from '../hooks/useLatency';

const stateLabels: Record<HeartbeatState, string> = {
  [HeartbeatState.OK]: 'OK',
  [HeartbeatState.WINDOW_UNFOCUSED]: 'Window Unfocused',
  [HeartbeatState.HIGH_LATENCY]: 'High Latency',
  [HeartbeatState.CONTROLLER_DISCONNECTED]: 'No Controller',
  [HeartbeatState.HEARTBEAT_MISSING]: 'Heartbeat Missing',
};

const stateColors: Record<HeartbeatState, string> = {
  [HeartbeatState.OK]: '#22c55e',
  [HeartbeatState.WINDOW_UNFOCUSED]: '#f59e0b',
  [HeartbeatState.HIGH_LATENCY]: '#ef4444',
  [HeartbeatState.CONTROLLER_DISCONNECTED]: '#ef4444',
  [HeartbeatState.HEARTBEAT_MISSING]: '#ef4444',
};

function formatBitrate(bps: number): string {
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(0)} kbps`;
  return `${bps.toFixed(0)} bps`;
}

function formatMs(ms: number): string {
  return `${ms.toFixed(1)}ms`;
}

export interface StatsOverlayThresholds {
  /** Warning threshold for individual latency components in ms (default: 50) */
  warning?: number;
  /** Critical threshold for individual latency components in ms (default: 100) */
  critical?: number;
  /** Warning threshold for total end-to-end latency in ms (default: 100) */
  totalWarning?: number;
  /** Critical threshold for total end-to-end latency in ms (default: 150) */
  totalCritical?: number;
}

export interface StatsOverlayProps {
  /** Position on screen (default: 'bottom-left') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Start expanded (default: false) */
  defaultExpanded?: boolean;
  /** Latency thresholds for color coding */
  thresholds?: StatsOverlayThresholds;
}

const DEFAULT_THRESHOLDS: Required<StatsOverlayThresholds> = {
  warning: 50,
  critical: 100,
  totalWarning: 100,
  totalCritical: 150,
};

/**
 * StatsOverlay - Real-time telemetry display for debugging and monitoring
 *
 * Shows end-to-end latency breakdown, network stats, and safety status.
 * Collapsible by default, expands to show detailed stats.
 *
 * @example
 * ```tsx
 * <AdamoProvider config={...} autoConnect={...}>
 *   <StatsOverlay position="bottom-left" />
 *   <VideoFeed topic="fork" />
 * </AdamoProvider>
 * ```
 */
export function StatsOverlay({
  position = 'bottom-left',
  defaultExpanded = false,
  thresholds: userThresholds,
}: StatsOverlayProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { state: heartbeatState } = useHeartbeat();
  const { isConnected: gamepadConnected } = useJoypad();
  const { networkStats, trackStats } = useAdaptiveStream();
  const latencyBreakdown = useLatencyBreakdown();

  const thresholds = { ...DEFAULT_THRESHOLDS, ...userThresholds };

  const getLatencyColor = (ms: number): string => {
    if (ms < thresholds.warning) return '#22c55e';
    if (ms < thresholds.critical) return '#f59e0b';
    return '#ef4444';
  };

  const getTotalLatencyColor = (ms: number): string => {
    if (ms < thresholds.totalWarning) return '#22c55e';
    if (ms < thresholds.totalCritical) return '#f59e0b';
    return '#ef4444';
  };

  // Calculate total bitrate across all tracks
  let totalBitrate = 0;
  for (const stats of trackStats.values()) {
    totalBitrate += stats.bitrate;
  }

  // Calculate average latency components across all tracks
  let avgJitterBuffer = 0;
  let avgDecodeTime = 0;
  let trackCount = 0;

  for (const stats of trackStats.values()) {
    avgJitterBuffer += stats.jitterBufferDelayMs || 0;
    avgDecodeTime += stats.decodeTimeMs || 0;
    trackCount++;
  }

  if (trackCount > 0) {
    avgJitterBuffer /= trackCount;
    avgDecodeTime /= trackCount;
  }

  // Calculate estimated total end-to-end latency
  // Use latency breakdown if available, otherwise fall back to RTT/2
  const encoderLatency = latencyBreakdown?.encoderLatency ?? 0;
  const captureLatency = latencyBreakdown?.captureLatency ?? 0;
  const pipelineLatency = latencyBreakdown?.pipelineLatency ?? 0;
  const networkLatency = latencyBreakdown?.applicationLatency ?? (networkStats?.rtt ?? 0) / 2;
  const totalLatency = latencyBreakdown?.totalLatency ?? (networkLatency + avgJitterBuffer + avgDecodeTime);

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        minWidth: expanded ? '240px' : 'auto',
      }}
    >
      {/* Header - always visible, clickable to expand */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '10px 14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          userSelect: 'none',
        }}
      >
        <span style={{
          color: '#888',
          fontSize: '10px',
          transition: 'transform 0.2s ease',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>
          ▶
        </span>
        <span style={{ color: '#aaa', fontSize: '11px' }}>Latency:</span>
        <span style={{
          color: getTotalLatencyColor(totalLatency),
          fontWeight: 'bold',
          fontSize: '13px',
        }}>
          {formatMs(totalLatency)}
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 14px 12px 14px', borderTop: '1px solid #333' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', paddingTop: '10px' }}>
            {/* Robot-side latencies */}
            <div style={{ color: '#666', marginBottom: '2px' }}>Robot</div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Capture (camera):</span>
              <span style={{ color: getLatencyColor(captureLatency) }}>
                {formatMs(captureLatency)} {latencyBreakdown ? '' : '(no data)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Pipeline (encoder):</span>
              <span style={{ color: getLatencyColor(pipelineLatency) }}>
                {formatMs(pipelineLatency)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Total robot:</span>
              <span style={{ color: getLatencyColor(encoderLatency) }}>
                {formatMs(encoderLatency)}
              </span>
            </div>

            {/* Network one-way latency */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ color: '#888' }}>Network:</span>
              <span style={{ color: getLatencyColor(networkLatency) }}>
                {formatMs(networkLatency)} {latencyBreakdown || networkStats ? '' : '(no stats)'}
              </span>
            </div>

            {/* Jitter buffer (client) */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Jitter buffer:</span>
              <span style={{ color: getLatencyColor(avgJitterBuffer) }}>
                {formatMs(avgJitterBuffer)} {trackStats.size === 0 ? '(no tracks)' : ''}
              </span>
            </div>

            {/* Decode time (client) */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Decode (client):</span>
              <span style={{ color: getLatencyColor(avgDecodeTime) }}>
                {formatMs(avgDecodeTime)}
              </span>
            </div>

            {/* Network stats section */}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
              <div style={{ color: '#666', marginBottom: '4px' }}>Network</div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>RTT:</span>
                <span style={{ color: getLatencyColor(networkStats?.rtt ?? 0) }}>
                  {formatMs(networkStats?.rtt ?? 0)}
                </span>
              </div>

              {networkStats && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Packet Loss:</span>
                    <span style={{ color: networkStats.packetLoss < 1 ? '#22c55e' : networkStats.packetLoss < 5 ? '#f59e0b' : '#ef4444' }}>
                      {networkStats.packetLoss.toFixed(1)}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Jitter:</span>
                    <span style={{ color: networkStats.jitter < 10 ? '#22c55e' : networkStats.jitter < 30 ? '#f59e0b' : '#ef4444' }}>
                      {formatMs(networkStats.jitter)}
                    </span>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Bandwidth:</span>
                <span style={{ color: '#0af' }}>
                  {formatBitrate(totalBitrate)}
                </span>
              </div>
            </div>

            {/* Status section */}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
              <div style={{ color: '#666', marginBottom: '4px' }}>Status</div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Safety:</span>
                <span style={{ color: stateColors[heartbeatState] }}>
                  {stateLabels[heartbeatState]}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Gamepad:</span>
                <span style={{ color: gamepadConnected ? '#22c55e' : '#ef4444' }}>
                  {gamepadConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Per-track stats */}
            {trackStats.size > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333', fontSize: '10px' }}>
                <div style={{ color: '#666', marginBottom: '4px' }}>Streams ({trackStats.size})</div>
                {Array.from(trackStats.entries()).map(([name, stats]) => (
                  <div key={name} style={{ marginBottom: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#aaa' }}>{name}:</span>
                      <span style={{ color: '#0af' }}>
                        {stats.width}x{stats.height} @ {stats.fps.toFixed(0)}fps
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px' }}>
                      <span style={{ color: '#666' }}>jit/dec:</span>
                      <span style={{ color: '#888' }}>
                        {formatMs(stats.jitterBufferDelayMs || 0)} / {formatMs(stats.decodeTimeMs || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
