'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useVelocity } from '@adamo-tech/react';
import { ClickableVideoFeed } from './ClickableVideoFeed';

type LayoutMode = {
  name: string;
  label: string;
  grid: (string | null)[][];
};

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
      ['back_top', 'fork', 'pallet_low'],
    ],
  },
  {
    name: 'pick_and_place',
    label: 'Pick and Place',
    grid: [
      ['right', 'fork', 'left'],
      ['back_top', 'pallet_low', 'fork_low'],
      [null, 'front_low', null],
    ],
  },
];

const CAMERA_LABELS: Record<string, string> = {
  left: 'Left',
  right: 'Right',
  front_low: 'Front Low',
  fork: 'Forks',
  fork_low: 'Fork Low',
  back_top: 'Back Top',
  pallet_low: 'Pallet Low',
};

type CameraLayoutProps = {
  /** Ref-like callback to expose the mode-switching API to the parent (for gamepad routing) */
  onReady?: (api: CameraLayoutApi) => void;
};

export type CameraLayoutApi = {
  /** Attempt to switch mode. Returns true if switched, false if blocked. */
  cycleMode: (direction: 'prev' | 'next') => boolean;
};

/**
 * CameraLayout - Hardcoded Travel / Pick and Place layouts for Cavalla forklift.
 *
 * Renders both modes via CSS show/hide to keep video streams mounted.
 * Uses ClickableVideoFeed for click-to-target via the video_click topic.
 * Exposes a cycleMode API so the parent can drive mode switching from its
 * single GamepadController (avoids mounting a duplicate JoypadManager).
 */
export function CameraLayout({ onReady }: CameraLayoutProps = {}) {
  const [modeIndex, setModeIndex] = useState(0);
  const [blockedWarning, setBlockedWarning] = useState(false);
  const { isMoving } = useVelocity();
  const isMovingRef = useRef(isMoving);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  isMovingRef.current = isMoving;

  const flashBlocked = useCallback(() => {
    setBlockedWarning(true);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => setBlockedWarning(false), 2000);
  }, []);

  // Stable callback — reads isMoving from a ref so its identity never changes.
  const cycleMode = useCallback(
    (direction: 'prev' | 'next') => {
      if (isMovingRef.current) {
        flashBlocked();
        return false;
      }
      setModeIndex((prev) => {
        if (direction === 'next') return (prev + 1) % MODES.length;
        return (prev - 1 + MODES.length) % MODES.length;
      });
      return true;
    },
    [flashBlocked]
  );

  useEffect(() => {
    onReady?.({ cycleMode });
  }, [onReady, cycleMode]);

  useEffect(() => {
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Render both layouts, toggle via display to keep video tracks mounted */}
      {MODES.map((mode, idx) => (
        <div
          key={mode.name}
          className="absolute inset-0 p-2 pb-14 flex flex-col gap-2"
          style={{ display: idx === modeIndex ? 'flex' : 'none' }}
        >
          {mode.grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex-1 flex gap-2 min-h-0">
              {row.map((topic, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="relative flex-1 rounded-xl overflow-hidden bg-navy-900/40 border border-white/[0.04]"
                >
                  {topic ? (
                    <>
                      <ClickableVideoFeed
                        topic={topic}
                        style={topic === 'fork_low' ? { transform: 'scale(-1)' } : undefined}
                      />
                      <div className="pointer-events-none absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-white/80 font-mono uppercase tracking-wider">
                        {CAMERA_LABELS[topic] || topic}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/10 text-xs">
                      --
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* Mode bar — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-navy-900/60 backdrop-blur-xl p-1">
          {MODES.map((m, i) => (
            <button
              key={m.name}
              onClick={() => {
                if (isMoving) {
                  flashBlocked();
                  return;
                }
                setModeIndex(i);
              }}
              className={`px-3.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                i === modeIndex
                  ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="ml-2 flex items-center gap-1.5 text-[9px] text-white/25">
          <kbd className="inline-flex items-center justify-center h-4 px-1 rounded border border-white/[0.08] bg-white/[0.04] font-mono text-[8px]">
            LB
          </kbd>
          <kbd className="inline-flex items-center justify-center h-4 px-1 rounded border border-white/[0.08] bg-white/[0.04] font-mono text-[8px]">
            RB
          </kbd>
        </div>
      </div>

      {/* Blocked warning */}
      {blockedWarning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-5 py-3 rounded-xl bg-red-500/90 backdrop-blur-sm text-white text-[13px] font-semibold shadow-[0_8px_32px_rgba(239,68,68,0.4)] animate-[slideUp_100ms_ease-out]">
          Cannot switch modes while moving
        </div>
      )}
    </div>
  );
}
