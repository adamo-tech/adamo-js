'use client';

import { useJsonStream } from '@adamo-tech/react';
import { StatusDot } from './StatusDot';

interface RobotStatus {
  pallet_status?: number;
  temperature?: number;
  error_code?: number;
  mode?: string | boolean | number;
  [key: string]: unknown;
}

const PALLET_LABELS: Record<number, string> = {
  0: 'Loaded',
  1: 'Left Side Only',
  2: 'Right Side Only',
  3: 'Unloaded',
};

export function RobotStatusPanel({ topic = 'robot_status' }: { topic?: string }) {
  const { data, timestamp, isReceiving } = useJsonStream<RobotStatus>(topic);

  return (
    <div className="fixed bottom-4 left-4 z-40 min-w-[200px] rounded-xl border border-white/[0.06] bg-navy-900/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5 border-b border-white/[0.04]">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          Robot Status
        </span>
        <StatusDot tone={isReceiving ? 'success' : 'neutral'} pulse={isReceiving} />
      </div>

      {/* Body */}
      <div className="px-3.5 py-2.5 space-y-1.5 text-[12px]">
        {!isReceiving ? (
          <div className="italic text-white/25 text-[11px]">Waiting for data…</div>
        ) : (
          <>
            {data?.mode !== undefined && (
              <StatusRow
                label="Mode"
                value={data.mode ? 'Drive' : 'Safety Lock'}
                tone={data.mode ? 'success' : 'warning'}
              />
            )}
            {data?.pallet_status !== undefined && (
              <StatusRow
                label="Pallet"
                value={PALLET_LABELS[data.pallet_status as number] ?? 'Unknown'}
              />
            )}
            {data?.temperature !== undefined && (
              <StatusRow
                label="Temp"
                value={`${data.temperature}°C`}
                mono
              />
            )}
            {data?.error_code !== undefined && data.error_code !== 0 && (
              <StatusRow
                label="Error"
                value={`Code ${data.error_code}`}
                tone="danger"
                mono
              />
            )}
          </>
        )}
      </div>

      {/* Timestamp footer */}
      {timestamp && (
        <div className="px-3.5 py-1.5 border-t border-white/[0.04]">
          <div className="text-[9px] text-white/20 font-mono">
            Updated {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusRow({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string | number;
  tone?: 'success' | 'warning' | 'danger';
  mono?: boolean;
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-400'
      : tone === 'warning'
      ? 'text-amber-400'
      : tone === 'danger'
      ? 'text-red-400'
      : 'text-white/80';
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/40">{label}</span>
      <span className={`${toneClass} ${mono ? 'font-mono tabular-nums' : ''} font-medium`}>
        {value}
      </span>
    </div>
  );
}
