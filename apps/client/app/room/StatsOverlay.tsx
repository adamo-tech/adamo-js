'use client';

import { useState } from 'react';
import { useHeartbeat, useJoypad, useAdaptiveStream, HeartbeatState } from '@adamo/adamo-react';

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

function getLatencyColor(ms: number): string {
  if (ms < 50) return '#22c55e';
  if (ms < 100) return '#f59e0b';
  return '#ef4444';
}

function getTotalLatencyColor(ms: number): string {
  if (ms < 100) return '#22c55e';
  if (ms < 150) return '#f59e0b';
  return '#ef4444';
}

export function StatsOverlay() {
  const [expanded, setExpanded] = useState(false);
  const { state: heartbeatState } = useHeartbeat();
  const { isConnected: gamepadConnected } = useJoypad();
  const { networkStats, trackStats, encoderStats } = useAdaptiveStream();

  // Calculate total bitrate across all tracks
  let totalBitrate = 0;
  for (const stats of trackStats.values()) {
    totalBitrate += stats.bitrate;
  }

  // Calculate average latency components across all tracks
  let avgEncodeTime = 0;
  let avgJitterBuffer = 0;
  let avgDecodeTime = 0;
  let trackCount = 0;

  for (const [name, stats] of trackStats.entries()) {
    avgJitterBuffer += stats.jitterBufferDelayMs || 0;
    avgDecodeTime += stats.decodeTimeMs || 0;
    trackCount++;
  }

  // Get encoder stats
  let encoderCount = 0;
  for (const stats of encoderStats.values()) {
    avgEncodeTime += stats.encodeTimeMs;
    encoderCount++;
  }

  if (trackCount > 0) {
    avgJitterBuffer /= trackCount;
    avgDecodeTime /= trackCount;
  }
  if (encoderCount > 0) {
    avgEncodeTime /= encoderCount;
  }

  // Calculate estimated total end-to-end latency
  // RTT/2 gives one-way network latency
  const networkLatency = (networkStats?.rtt ?? 0) / 2;
  const totalLatency = avgEncodeTime + networkLatency + avgJitterBuffer + avgDecodeTime;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        left: 10,
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
            {/* Server-side encode time */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Encode (server):</span>
              <span style={{ color: getLatencyColor(avgEncodeTime) }}>
                {formatMs(avgEncodeTime)}
              </span>
            </div>

            {/* Network one-way latency (RTT/2) */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Network (RTT/2):</span>
              <span style={{ color: getLatencyColor(networkLatency) }}>
                {formatMs(networkLatency)} {networkStats ? '' : '(no stats)'}
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
                <div style={{ color: '#666', marginBottom: '4px' }}>Streams</div>
                {Array.from(trackStats.entries()).map(([name, stats]) => {
                  const encoder = encoderStats.get(name);
                  return (
                    <div key={name} style={{ marginBottom: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>{name}:</span>
                        <span style={{ color: '#0af' }}>
                          {stats.width}x{stats.height} @ {stats.fps.toFixed(0)}fps
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px' }}>
                        <span style={{ color: '#666' }}>enc/jit/dec:</span>
                        <span style={{ color: '#888' }}>
                          {encoder ? formatMs(encoder.encodeTimeMs) : '---'} / {formatMs(stats.jitterBufferDelayMs || 0)} / {formatMs(stats.decodeTimeMs || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
