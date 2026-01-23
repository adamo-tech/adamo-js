'use client';

import { useCallback } from 'react';
import { MultiModeLayout, VideoFeed, type LayoutMode } from '@adamo-tech/react';
import { LAYOUT_MODES, CAMERA_LABELS } from '../../config/topics';

/**
 * KeyboardLayout - Camera grid for keyboard teleoperation
 *
 * Uses MultiModeLayout from the react package with robot-specific configuration.
 * Mode switching is disabled since keyboard control doesn't need multiple modes.
 */
export function KeyboardLayout() {
  const renderCell = useCallback((topic: string | null, _mode: LayoutMode) => {
    if (topic) {
      return (
        <>
          <VideoFeed topic={topic} />
          <div style={labelStyle}>{CAMERA_LABELS[topic] || topic}</div>
        </>
      );
    }
    return <div style={placeholderStyle}>--</div>;
  }, []);

  return (
    <MultiModeLayout
      modes={LAYOUT_MODES as unknown as LayoutMode[]}
      renderCell={renderCell}
      showModeBar={false}
      showHint={false}
    />
  );
}

const labelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 8,
  left: 8,
  padding: '4px 8px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: '#fff',
  fontSize: 12,
  borderRadius: 4,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  pointerEvents: 'none',
};

const placeholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#444',
  fontSize: 14,
  fontFamily: 'system-ui, -apple-system, sans-serif',
};
