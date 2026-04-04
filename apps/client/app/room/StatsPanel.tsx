'use client';

import { useMemo, useState } from 'react';
import { useHeartbeat, useJoypad, useAdaptiveStream, HeartbeatState } from '@adamo-tech/react';
import { StatusDot } from './StatusDot';

const STATE_LABELS: Record<HeartbeatState, string> = {
  [HeartbeatState.OK]: 'OK',
  [HeartbeatState.WINDOW_UNFOCUSED]: 'Unfocused',
  [HeartbeatState.HIGH_LATENCY]: 'High Latency',
  [HeartbeatState.CONTROLLER_DISCONNECTED]: 'No Controller',
  [HeartbeatState.HEARTBEAT_MISSING]: 'Missing',
};

const STATE_TONE: Record<HeartbeatState, 'success' | 'warning' | 'danger'> = {
  [HeartbeatState.OK]: 'success',
  [HeartbeatState.WINDOW_UNFOCUSED]: 'warning',
  [HeartbeatState.HIGH_LATENCY]: 'danger',
  [HeartbeatState.CONTROLLER_DISCONNECTED]: 'danger',
  [HeartbeatState.HEARTBEAT_MISSING]: 'danger',
};

function formatBitrate(bps: number): string {
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(0)} kbps`;
  return `${bps.toFixed(0)} bps`;
}

function toneColor(ms: number): string {
  if (ms < 50) return 'text-emerald-400';
  if (ms < 100) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * StatsPanel — compact telemetry overlay.
 * Collapsed: shows heartbeat dot + total latency + bandwidth.
 * Expanded: shows per-stage latency breakdown and per-track stats.
 */
export function StatsPanel() {
  const { state: heartbeatState } = useHeartbeat();
  const { isConnected: gamepadConnected } = useJoypad();
  const { networkStats, trackStats, encoderStats } = useAdaptiveStream();
  const [expanded, setExpanded] = useState(false);

  const { totalBitrate, avgJitter, avgDecode, avgEncode, networkOneWay, totalLatency } = useMemo(() => {
    let totalBitrate = 0;
    let avgJitter = 0;
    let avgDecode = 0;
    let trackCount = 0;
    for (const stats of trackStats.values()) {
      totalBitrate += stats.bitrate;
      avgJitter += stats.jitterBufferDelayMs || 0;
      avgDecode += stats.decodeTimeMs || 0;
      trackCount++;
    }
    if (trackCount > 0) {
      avgJitter /= trackCount;
      avgDecode /= trackCount;
    }

    let avgEncode = 0;
    let encoderCount = 0;
    for (const stats of encoderStats.values()) {
      avgEncode += stats.encodeTimeMs;
      encoderCount++;
    }
    if (encoderCount > 0) avgEncode /= encoderCount;

    const networkOneWay = (networkStats?.rtt ?? 0) / 2;
    const totalLatency = avgEncode + networkOneWay + avgJitter + avgDecode;
    return { totalBitrate, avgJitter, avgDecode, avgEncode, networkOneWay, totalLatency };
  }, [trackStats, encoderStats, networkStats]);

  const tone = STATE_TONE[heartbeatState];

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 rounded-xl border border-white/[0.06] bg-navy-900/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all ${
        expanded ? 'w-[280px]' : 'w-auto'
      }`}
    >
      {/* Header / collapsed summary — clickable to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.02] rounded-xl transition-colors"
      >
        <StatusDot tone={tone} pulse={tone !== 'success'} size="md" />

        {/* Latency */}
        <div className="flex items-baseline gap-1.5">
          <span className={`text-[13px] font-mono tabular-nums font-medium ${toneColor(totalLatency)}`}>
            {totalLatency.toFixed(0)}
          </span>
          <span className="text-[10px] text-white/30 font-mono">ms</span>
        </div>

        {/* Divider */}
        <div className="h-3 w-px bg-white/[0.1]" />

        {/* Bandwidth */}
        <span className="text-[11px] font-mono tabular-nums text-white/50">
          {formatBitrate(totalBitrate)}
        </span>

        {/* Expand chevron */}
        <svg
          className={`h-3 w-3 text-white/30 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/[0.04] px-3.5 py-2.5 space-y-3">
          {/* Latency breakdown */}
          <div>
            <div className="text-[9px] font-medium uppercase tracking-wider text-white/30 mb-1.5">
              Latency Breakdown
            </div>
            <div className="space-y-1">
              <StatRow label="Encode" value={avgEncode} unit="ms" />
              <StatRow label="Network" value={networkOneWay} unit="ms" />
              <StatRow label="Jitter" value={avgJitter} unit="ms" />
              <StatRow label="Decode" value={avgDecode} unit="ms" />
              <div className="my-1 h-px bg-white/[0.04]" />
              <StatRow label="Total" value={totalLatency} unit="ms" bold />
            </div>
          </div>

          {/* Network */}
          {networkStats && (
            <div>
              <div className="text-[9px] font-medium uppercase tracking-wider text-white/30 mb-1.5">
                Network
              </div>
              <div className="space-y-1">
                <StatRow label="RTT" value={networkStats.rtt} unit="ms" />
                <StatRow label="Loss" value={networkStats.packetLoss} unit="%" digits={1} />
                <StatRow label="Jitter" value={networkStats.jitter} unit="ms" />
              </div>
            </div>
          )}

          {/* Inputs */}
          <div>
            <div className="text-[9px] font-medium uppercase tracking-wider text-white/30 mb-1.5">
              Inputs
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-white/40">Safety</span>
                <span className={`font-medium ${tone === 'success' ? 'text-emerald-400' : tone === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                  {STATE_LABELS[heartbeatState]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Gamepad</span>
                <span className={`font-medium ${gamepadConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                  {gamepadConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  unit,
  bold,
  digits = 1,
}: {
  label: string;
  value: number;
  unit: string;
  bold?: boolean;
  digits?: number;
}) {
  return (
    <div className="flex items-baseline justify-between text-[11px]">
      <span className="text-white/40">{label}</span>
      <span className="flex items-baseline gap-1">
        <span className={`font-mono tabular-nums ${bold ? 'text-white font-semibold' : 'text-white/70'}`}>
          {value.toFixed(digits)}
        </span>
        <span className="text-[9px] text-white/25 font-mono">{unit}</span>
      </span>
    </div>
  );
}
