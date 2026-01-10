'use client';

import { useJsonStream } from '@adamo-tech/react';

/**
 * Example interface for robot status data
 * Customize this to match your actual ROS message structure
 */
interface RobotStatus {
  pallet_status?: number;
  temperature?: number;
  error_code?: number;
  mode?: string;
  [key: string]: unknown;
}

/**
 * Demo component showing how to use useTopicData hook
 * to receive arbitrary JSON payloads from ROS topics
 *
 * Usage:
 * 1. The server must be publishing JSON data on the 'robot_status' topic
 * 2. Add <RobotStatusPanel /> inside a <Teleoperate> provider
 */
export function RobotStatusPanel({ topic = 'robot_status' }: { topic?: string }) {
  const { data, timestamp, isReceiving } = useJsonStream<RobotStatus>(topic);
  const palletLabels: Record<number, string> = {
    0: 'Empty',
    1: 'Left Side In Only',
    2: 'Right Side In Only',
    3: 'Completely In',
  };
  // console.log('RobotStatusPanel data:', data, timestamp, isReceiving);

  if (!isReceiving) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>Robot Status</div>
        <div style={styles.waiting}>Waiting for data on "{topic}"...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Robot Status</div>

      {data?.mode !== undefined && (
        <div style={styles.row}>
          <span style={styles.label}>Mode</span>
          {/* <span style={styles.value}>{data.mode}</span> */}
          <span style={styles.value}>{data.mode ? 'Drive' : 'Safety Lock'}</span>

        </div>

      )}

      {data?.pallet_status !== undefined && (
        <div style={styles.row}>
          <span style={styles.label}>Pallete Status</span>
          <span style={styles.value}>{palletLabels[data.pallet_status] ?? 'Unknown'}</span>
        </div>
      )}

      {data?.temperature !== undefined && (
        <div style={styles.row}>
          <span style={styles.label}>Temperature</span>
          <span style={styles.value}>{data.temperature}°C</span>
        </div>
      )}      

      {data?.error_code !== undefined && data.error_code !== 0 && (
        <div style={{ ...styles.row, ...styles.error }}>
          <span style={styles.label}>Error</span>
          <span style={styles.value}>Code {data.error_code}</span>
        </div>
      )}

      {timestamp && (
        <div style={styles.timestamp}>
          Last update: {new Date(timestamp).toLocaleTimeString()}
        </div>
      )}

      {/* Debug: Show raw data */}
      <details style={styles.debug}>
        <summary style={styles.debugSummary}>Raw Data</summary>
        <pre style={styles.debugPre}>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: 10,
    left: 10,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 12,
    minWidth: 180,
    zIndex: 1000,
  },
  header: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    paddingBottom: 6,
  },
  waiting: {
    color: '#888',
    fontStyle: 'italic',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#888',
  },
  value: {
    fontWeight: 500,
  },
  error: {
    color: '#ef4444',
  },
  timestamp: {
    marginTop: 8,
    paddingTop: 6,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    color: '#666',
    fontSize: 10,
  },
  debug: {
    marginTop: 8,
    paddingTop: 6,
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  debugSummary: {
    cursor: 'pointer',
    color: '#666',
    fontSize: 10,
  },
  debugPre: {
    marginTop: 4,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    fontSize: 9,
    overflow: 'auto',
    maxHeight: 150,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
};
