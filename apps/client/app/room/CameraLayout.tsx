'use client';

import { useCallback } from 'react';
import { MultiModeLayout, VideoFeed, useVelocity, type LayoutMode } from '@adamo/adamo-react';

/**
 * Layout modes for this robot:
 * - Travel: Wide view for navigation
 * - Pick and Place: Focus on fork cameras for precision work
 */
const MODES: LayoutMode[] = [
  {
    name: 'travel',
    label: 'Travel',
    grid: [
      ['left', 'front_low', 'right'],
      [null, 'fork', null],
    ],
  },
  {
    name: 'pick_and_place',
    label: 'Pick and Place',
    grid: [
      ['right', 'fork', 'left'],
      [null, 'fork', 'front_low'],
    ],
  },
];

/** Labels for camera topics */
const CAMERA_LABELS: Record<string, string> = {
  left: 'Left',
  right: 'Right',
  front_low: 'Front Low',
  fork: 'Forks',
};

/**
 * CameraLayout - Robot-specific layout using MultiModeLayout
 *
 * Uses the generic MultiModeLayout component with robot-specific:
 * - Mode definitions (Travel / Pick and Place)
 * - Safety interlock (no mode switching while moving)
 * - Camera labels and placeholder content
 */
export function CameraLayout() {
  const { isMoving } = useVelocity();

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
      modes={MODES}
      canSwitchMode={() => !isMoving}
      renderCell={renderCell}
      blockedWarning="Cannot switch modes while moving"
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
