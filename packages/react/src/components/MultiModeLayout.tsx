'use client';

import { useState, useCallback, ReactNode } from 'react';
import { GamepadController } from './GamepadController';
import { HeartbeatMonitor } from './HeartbeatMonitor';
import { VideoFeed } from './VideoFeed';

/**
 * Layout mode definition
 */
export interface LayoutMode {
  /** Unique mode identifier */
  name: string;
  /** Human-readable label shown in mode bar */
  label: string;
  /** Grid cells as [row][col] of topic names or null for placeholder */
  grid: (string | null)[][];
}

export interface MultiModeLayoutProps {
  /** Available layout modes */
  modes: LayoutMode[];
  /** Initial mode index (default: 0) */
  initialMode?: number;
  /** Buttons to switch modes (ROS button indices, default: { prev: 9, next: 10 }) */
  modeButtons?: { prev: number; next: number };
  /** Callback when mode switch is blocked */
  onModeBlocked?: () => void;
  /** Callback when mode changes */
  onModeChange?: (mode: LayoutMode, index: number) => void;
  /** Function to check if mode switching is allowed (default: always true) */
  canSwitchMode?: () => boolean;
  /** Custom render function for cells. If not provided, renders VideoFeed for topics and placeholder for null */
  renderCell?: (topic: string | null, mode: LayoutMode, rowIndex: number, colIndex: number) => ReactNode;
  /** Gap between cells in pixels (default: 8) */
  gap?: number;
  /** Show mode bar at bottom (default: true) */
  showModeBar?: boolean;
  /** Show LB/RB hint (default: true) */
  showHint?: boolean;
  /** Custom hint text (default: 'LB/RB: Switch Mode') */
  hintText?: string;
  /** Warning message to show when mode switch is blocked */
  blockedWarning?: string;
  /** Duration to show blocked warning in ms (default: 2000) */
  blockedWarningDuration?: number;
}

const DEFAULT_MODE_BUTTONS = { prev: 9, next: 10 };

/**
 * MultiModeLayout - Configurable multi-mode camera grid layout
 *
 * Displays a grid of video feeds with support for multiple layout modes.
 * Users can switch between modes using gamepad bumpers (LB/RB).
 *
 * @example
 * ```tsx
 * const MODES: LayoutMode[] = [
 *   {
 *     name: 'travel',
 *     label: 'Travel',
 *     grid: [
 *       ['left', 'front', 'right'],
 *       [null, 'fork', null],
 *     ],
 *   },
 *   {
 *     name: 'pick',
 *     label: 'Pick & Place',
 *     grid: [
 *       ['right', 'fork', 'left'],
 *       [null, 'bottom', 'front'],
 *     ],
 *   },
 * ];
 *
 * <MultiModeLayout
 *   modes={MODES}
 *   canSwitchMode={() => !isMoving}
 *   onModeBlocked={() => console.log('Blocked!')}
 * />
 * ```
 */
export function MultiModeLayout({
  modes,
  initialMode = 0,
  modeButtons = DEFAULT_MODE_BUTTONS,
  onModeBlocked,
  onModeChange,
  canSwitchMode,
  renderCell,
  gap = 8,
  showModeBar = true,
  showHint = true,
  hintText = 'LB/RB: Switch Mode',
  blockedWarning = 'Cannot switch modes',
  blockedWarningDuration = 2000,
}: MultiModeLayoutProps) {
  const [modeIndex, setModeIndex] = useState(initialMode);
  const [showBlockedWarning, setShowBlockedWarning] = useState(false);

  const currentMode = modes[modeIndex];

  const attemptModeSwitch = useCallback((direction: 'prev' | 'next') => {
    if (canSwitchMode && !canSwitchMode()) {
      onModeBlocked?.();
      setShowBlockedWarning(true);
      setTimeout(() => setShowBlockedWarning(false), blockedWarningDuration);
      return;
    }

    setModeIndex((prev) => {
      const next = direction === 'next'
        ? (prev + 1) % modes.length
        : (prev - 1 + modes.length) % modes.length;
      onModeChange?.(modes[next], next);
      return next;
    });
  }, [canSwitchMode, onModeBlocked, onModeChange, modes, blockedWarningDuration]);

  const handleButtonDown = useCallback((buttonIndex: number) => {
    if (buttonIndex === modeButtons.next) {
      attemptModeSwitch('next');
    } else if (buttonIndex === modeButtons.prev) {
      attemptModeSwitch('prev');
    }
  }, [modeButtons, attemptModeSwitch]);

  const handleModeClick = useCallback((index: number) => {
    if (index === modeIndex) return;

    if (canSwitchMode && !canSwitchMode()) {
      onModeBlocked?.();
      setShowBlockedWarning(true);
      setTimeout(() => setShowBlockedWarning(false), blockedWarningDuration);
      return;
    }

    setModeIndex(index);
    onModeChange?.(modes[index], index);
  }, [modeIndex, canSwitchMode, onModeBlocked, modes, onModeChange, blockedWarningDuration]);

  // Default cell renderer - shows video feed for the specified track/topic
  const defaultRenderCell = (topic: string | null): ReactNode => {
    if (topic) {
      return (
        <>
          <VideoFeed trackName={topic} />
          <div style={styles.label}>{topic}</div>
        </>
      );
    }
    return <div style={styles.placeholder}>--</div>;
  };

  const cellRenderer = renderCell || defaultRenderCell;

  return (
    <div style={styles.container}>
      <HeartbeatMonitor />
      <GamepadController onButtonDown={handleButtonDown} />

      {/* Render all layouts but show/hide with CSS to prevent unmounting */}
      {modes.map((mode, idx) => (
        <div
          key={mode.name}
          style={{
            ...styles.layoutWrapper,
            display: idx === modeIndex ? 'flex' : 'none',
          }}
        >
          <div style={{ ...styles.layoutContainer, padding: gap, gap, paddingBottom: showModeBar ? 60 : gap }}>
            {mode.grid.map((row, rowIndex) => (
              <div key={rowIndex} style={{ ...styles.row, gap }}>
                {row.map((topic, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} style={styles.cell}>
                    {cellRenderer(topic, mode, rowIndex, colIndex)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Mode indicator bar */}
      {showModeBar && (
        <div style={styles.modeBar}>
          {modes.map((mode, idx) => (
            <div
              key={mode.name}
              style={{
                ...styles.modeTab,
                ...(idx === modeIndex ? styles.modeTabActive : {}),
              }}
              onClick={() => handleModeClick(idx)}
            >
              {mode.label}
            </div>
          ))}
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div style={styles.hint}>
          {hintText}
        </div>
      )}

      {/* Warning when mode switch blocked */}
      {showBlockedWarning && (
        <div style={styles.warning}>
          {blockedWarning}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#000',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  layoutWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  layoutContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    flex: 1,
    display: 'flex',
  },
  cell: {
    flex: 1,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#444',
    fontSize: 14,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  label: {
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
  },
  modeBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderTop: '1px solid #333',
    zIndex: 100,
  },
  modeTab: {
    padding: '8px 24px',
    fontSize: 14,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#666',
    cursor: 'pointer',
    borderRadius: 4,
    transition: 'all 0.2s ease',
  },
  modeTabActive: {
    color: '#fff',
    backgroundColor: '#333',
  },
  hint: {
    position: 'fixed',
    bottom: 60,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    borderRadius: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    whiteSpace: 'nowrap',
    zIndex: 99,
  },
  warning: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '16px 32px',
    backgroundColor: 'rgba(200, 50, 50, 0.9)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 8,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 200,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },
};
