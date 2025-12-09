'use client';

import { useState, useCallback } from 'react';
import { VideoFeed, GamepadController, HeartbeatMonitor, useVelocity } from '@adamo/adamo-react';
// Nav2 and Costmap disabled for now
// import { MapViewer, useNav, CostmapViewer, useCostmap } from '@adamo/adamo-react';
// import type { MapData, CostmapData, RobotPose, NavPath, NavGoal } from '@adamo/adamo-react';

type Mode = 'travel' | 'pick_and_place';

const MODES: Mode[] = ['travel', 'pick_and_place'];

const MODE_LABELS: Record<Mode, string> = {
  travel: 'Travel',
  pick_and_place: 'Pick and Place',
};

/**
 * CameraLayout - Two modes with different camera arrangements
 *
 * Travel Mode:
 * - Top: Left | Front_Low | Right
 * - Bottom: Fork | Fork | Fork (placeholder for when nav is re-enabled)
 *
 * Pick and Place Mode:
 * - Top: Right | Fork | Left
 * - Bottom: Fork | Fork | Front_Low
 *
 * Bumpers switch between modes.
 */
export function CameraLayout() {
  const [mode, setMode] = useState<Mode>('travel');
  const [modeIndex, setModeIndex] = useState(0);
  const [switchBlocked, setSwitchBlocked] = useState(false);
  const { isMoving } = useVelocity();

  // Nav2 disabled for now
  // const { map, robotPose, path, sendGoal } = useNav();
  // const { costmap } = useCostmap();

  const handleButtonDown = useCallback((buttonIndex: number) => {
    // RB (ROS index 10) = next mode, LB (ROS index 9) = previous mode
    if (buttonIndex === 10 || buttonIndex === 9) {
      // Safety interlock: block mode switching while robot is moving
      if (isMoving) {
        setSwitchBlocked(true);
        setTimeout(() => setSwitchBlocked(false), 2000);
        return;
      }

      if (buttonIndex === 10) {
        setModeIndex((prev) => {
          const next = (prev + 1) % MODES.length;
          setMode(MODES[next]);
          return next;
        });
      } else {
        setModeIndex((prev) => {
          const next = (prev - 1 + MODES.length) % MODES.length;
          setMode(MODES[next]);
          return next;
        });
      }
    }
  }, [isMoving]);

  return (
    <div style={styles.container}>
      <HeartbeatMonitor />
      <GamepadController onButtonDown={handleButtonDown} />

      {/* Render both layouts but show/hide with CSS to prevent unmounting */}
      <div style={{ ...styles.layoutWrapper, display: mode === 'travel' ? 'flex' : 'none' }}>
        <TravelLayout />
      </div>
      <div style={{ ...styles.layoutWrapper, display: mode === 'pick_and_place' ? 'flex' : 'none' }}>
        <PickAndPlaceLayout />
      </div>

      {/* Mode indicator bar */}
      <div style={styles.modeBar}>
        {MODES.map((m, i) => (
          <div
            key={m}
            style={{
              ...styles.modeTab,
              ...(mode === m ? styles.modeTabActive : {}),
            }}
            onClick={() => {
              if (isMoving) {
                setSwitchBlocked(true);
                setTimeout(() => setSwitchBlocked(false), 2000);
                return;
              }
              setMode(m);
              setModeIndex(i);
            }}
          >
            {MODE_LABELS[m]}
          </div>
        ))}
      </div>

      <div style={styles.hint}>
        LB/RB: Switch Mode
      </div>

      {/* Warning when mode switch blocked due to motion */}
      {switchBlocked && (
        <div style={styles.warning}>
          Cannot switch modes while moving
        </div>
      )}
    </div>
  );
}

function TravelLayout() {
  return (
    <div style={styles.layoutContainer}>
      {/* Top row - Left | Front_Low | Right */}
      <div style={styles.row}>
        <div style={styles.cell}>
          <VideoFeed topic="left" />
          <div style={styles.label}>Left</div>
        </div>
        <div style={styles.cell}>
          <VideoFeed topic="front_low" />
          <div style={styles.label}>Front Low</div>
        </div>
        <div style={styles.cell}>
          <VideoFeed topic="right" />
          <div style={styles.label}>Right</div>
        </div>
      </div>

      {/* Bottom row - Fork cameras (Nav2/Costmap disabled) */}
      <div style={styles.row}>
        <div style={styles.cell}>
          {/* Costmap disabled - showing placeholder */}
          <div style={styles.placeholder}>Costmap Disabled</div>
          <div style={styles.label}>Local Costmap</div>
        </div>
        <div style={styles.cell}>
          <VideoFeed topic="fork" />
          <div style={styles.label}>Forks</div>
        </div>
        <div style={styles.cell}>
          {/* Map disabled - showing placeholder */}
          <div style={styles.placeholder}>Nav2 Map Disabled</div>
          <div style={styles.label}>Nav2 Map</div>
        </div>
      </div>
    </div>
  );
}

function PickAndPlaceLayout() {
  return (
    <div style={styles.layoutContainer}>
      {/* Top row - Right | Fork | Left */}
      <div style={styles.row}>
        <div style={styles.cell}>
          <VideoFeed topic="right" />
          <div style={styles.label}>Right</div>
        </div>
        <div style={styles.cell}>
          <VideoFeed topic="fork" />
          <div style={styles.label}>Fork</div>
        </div>
        <div style={styles.cell}>
          <VideoFeed topic="left" />
          <div style={styles.label}>Left</div>
        </div>
      </div>

      {/* Bottom row - Costmap disabled | Fork Low | Front_Low */}
      <div style={styles.row}>
        <div style={styles.cell}>
          {/* Costmap disabled - showing placeholder */}
          <div style={styles.placeholder}>Costmap Disabled</div>
          <div style={styles.label}>Local Costmap</div>
        </div>
        <div style={styles.cell}>
          <VideoFeed topic="fork" />
          <div style={styles.label}>Fork Low</div>
        </div>
        <div style={styles.cell}>
          <VideoFeed topic="front_low" />
          <div style={styles.label}>Front Low</div>
        </div>
      </div>
    </div>
  );
}

const GAP = 8;

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
    padding: GAP,
    gap: GAP,
    paddingBottom: 60, // Space for mode bar
  },
  row: {
    flex: 1,
    display: 'flex',
    gap: GAP,
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
