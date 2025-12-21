import React, { CSSProperties } from 'react';
import { useAdamo } from '../hooks/useAdamo';
import type { ConnectionState } from '@adamo-tech/core';

export interface ConnectionStatusProps {
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Custom labels for each state */
  labels?: Partial<Record<ConnectionState, string>>;
  /** Custom colors for each state */
  colors?: Partial<Record<ConnectionState, string>>;
  /** Hide the component when connected */
  hideWhenConnected?: boolean;
}

const DEFAULT_LABELS: Record<ConnectionState, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting...',
  connected: 'Connected',
  reconnecting: 'Reconnecting...',
  failed: 'Connection Failed',
};

const DEFAULT_COLORS: Record<ConnectionState, string> = {
  disconnected: '#ef4444',
  connecting: '#f59e0b',
  connected: '#22c55e',
  reconnecting: '#f59e0b',
  failed: '#dc2626',
};

/**
 * ConnectionStatus - Component to display connection status
 *
 * @example
 * ```tsx
 * <ConnectionStatus />
 *
 * // With custom labels
 * <ConnectionStatus
 *   labels={{ connected: 'Online', disconnected: 'Offline' }}
 * />
 *
 * // Hide when connected
 * <ConnectionStatus hideWhenConnected />
 * ```
 */
export function ConnectionStatus({
  className,
  style,
  labels = {},
  colors = {},
  hideWhenConnected = false,
}: ConnectionStatusProps) {
  const { connectionState } = useAdamo();

  if (hideWhenConnected && connectionState === 'connected') {
    return null;
  }

  const finalLabels = { ...DEFAULT_LABELS, ...labels };
  const finalColors = { ...DEFAULT_COLORS, ...colors };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    ...style,
  };

  const dotStyle: CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: finalColors[connectionState],
    animation: connectionState === 'connecting' || connectionState === 'reconnecting'
      ? 'pulse 1.5s ease-in-out infinite'
      : undefined,
  };

  return (
    <div className={className} style={containerStyle}>
      <span style={dotStyle} />
      <span>{finalLabels[connectionState]}</span>
    </div>
  );
}
