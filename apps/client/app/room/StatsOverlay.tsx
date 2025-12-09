'use client';

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

export function StatsOverlay() {
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

  // Debug: log to console
  console.log('[StatsOverlay] networkStats:', networkStats);
  console.log('[StatsOverlay] trackStats size:', trackStats.size, 'entries:', Array.from(trackStats.entries()));
  console.log('[StatsOverlay] encoderStats size:', encoderStats.size);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        minWidth: '240px',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '8px',
          fontSize: '14px',
          borderBottom: '1px solid #555',
          paddingBottom: '6px',
        }}
      >
        Latency Breakdown
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
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

        {/* Total estimated latency */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          marginTop: '4px',
          paddingTop: '4px',
          borderTop: '1px solid #444'
        }}>
          <span style={{ color: '#ccc' }}>Total (est.):</span>
          <span style={{ color: getLatencyColor(totalLatency) }}>
            {formatMs(totalLatency)}
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
  );
}
