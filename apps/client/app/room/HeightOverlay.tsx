'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useJsonStream, useJsonPublisher } from '@adamo-tech/react';

type ForkliftHeightState = {
  heights: Record<string, number>;
  current_height: number;
  fork_position_received: boolean;
};

type HeightCommand =
  | { stamp: number; cmd: 'save'; name: string }
  | { stamp: number; cmd: 'goto'; name: string }
  | { stamp: number; cmd: 'delete'; name: string };

type Direction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'delete';

export type HeightOverlayRef = {
  /** Dispatch a d-pad direction to the overlay (from gamepad events). */
  handleDpad: (dir: Direction) => void;
};

type HeightOverlayProps = {
  onClose: () => void;
};

/**
 * HeightOverlay - Modal for managing forklift height presets.
 *
 * Communicates with the server over LiveKit data channels:
 *   - subscribes to 'fork_height' for current state
 *   - publishes to 'height_command' for save/goto/delete
 *
 * Exposes a dpad dispatcher via the `onReady` callback so gamepad
 * events from a parent GamepadController can navigate the list.
 */
export function HeightOverlay({
  onClose,
  onReady,
}: HeightOverlayProps & { onReady?: (ref: HeightOverlayRef) => void }) {
  const { data: state } = useJsonStream<ForkliftHeightState>('fork_height');
  const publish = useJsonPublisher<HeightCommand>('height_command');

  const savedHeights = state?.heights;
  const currentHeight = state?.current_height ?? null;
  const forkPositionReceived = state?.fork_position_received ?? false;
  const noData = !state;
  const noForkSensor = state && !forkPositionReceived;

  const heightEntries = useMemo(
    () => Object.entries(savedHeights ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    [savedHeights]
  );
  const itemCount = 1 + heightEntries.length;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sentName, setSentName] = useState<string | null>(null);
  const sentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelectedIdx((prev) => Math.min(prev, Math.max(0, itemCount - 1)));
  }, [itemCount]);

  const sendCommand = useCallback(
    (cmd: Omit<HeightCommand, 'stamp'>) => {
      publish({ stamp: Date.now(), ...cmd } as HeightCommand);
    },
    [publish]
  );

  const flashSent = useCallback((name: string) => {
    setSentName(name);
    if (sentTimer.current) clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => setSentName(null), 600);
  }, []);

  const handleSaveCurrent = useCallback(() => {
    const name = `height_${heightEntries.length + 1}`;
    sendCommand({ cmd: 'save', name });
    flashSent('__save__');
  }, [heightEntries.length, sendCommand, flashSent]);

  const handleGoto = useCallback(
    (name: string) => {
      sendCommand({ cmd: 'goto', name });
      flashSent(name);
    },
    [sendCommand, flashSent]
  );

  const handleDelete = useCallback(
    (name: string) => {
      sendCommand({ cmd: 'delete', name });
    },
    [sendCommand]
  );

  const activateSelected = useCallback(() => {
    if (selectedIdx === 0) {
      handleSaveCurrent();
    } else {
      const entry = heightEntries[selectedIdx - 1];
      if (entry) handleGoto(entry[0]);
    }
  }, [selectedIdx, heightEntries, handleSaveCurrent, handleGoto]);

  // Expose d-pad dispatcher to parent via onReady callback
  useEffect(() => {
    if (!onReady) return;
    onReady({
      handleDpad: (dir) => {
        if (dir === 'up') {
          setSelectedIdx((prev) => Math.max(0, prev - 1));
        } else if (dir === 'down') {
          setSelectedIdx((prev) => Math.min(itemCount - 1, prev + 1));
        } else if (dir === 'confirm' || dir === 'right') {
          activateSelected();
        } else if (dir === 'delete' && selectedIdx > 0) {
          const entry = heightEntries[selectedIdx - 1];
          if (entry) handleDelete(entry[0]);
        }
      },
    });
  }, [onReady, itemCount, activateSelected, heightEntries, selectedIdx, handleDelete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (sentTimer.current) clearTimeout(sentTimer.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_75ms_ease-out]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-96 max-h-[60%] flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#151526]/95 to-[#0b0b14]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-[slideUp_100ms_cubic-bezier(0.16,1,0.3,1)]"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06]">
                <svg
                  className="h-4 w-4 text-white/50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7l4-4 4 4M8 17l4 4 4-4M12 3v18"
                  />
                </svg>
              </div>
              <div>
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                  Fork Height
                </span>
                <div className={`text-lg font-mono tabular-nums font-medium leading-tight ${noForkSensor ? 'text-amber-400' : 'text-white'}`}>
                  {noData ? '--' : noForkSensor ? '--' : `${currentHeight!.toFixed(2)} m`}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-all"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Warning when fork_position topic isn't publishing */}
        {(noData || noForkSensor) && (
          <div className="mx-3 mt-1 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <svg className="h-3.5 w-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-[11px] text-amber-400/90">
              {noData
                ? 'Waiting for height data from robot…'
                : '/fork_position topic not publishing — height sensor may be offline'}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2 px-2">
          {/* Save Current */}
          <button
            onClick={handleSaveCurrent}
            className={`flex w-full items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 ${
              selectedIdx === 0
                ? 'bg-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'text-white/45 hover:bg-white/[0.04] hover:text-white/65'
            } ${
              sentName === '__save__'
                ? '!bg-emerald-500/15 !text-emerald-300 !shadow-[inset_0_1px_0_rgba(52,211,153,0.1)]'
                : ''
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 ${
                selectedIdx === 0 ? 'bg-white/[0.08]' : 'bg-white/[0.04]'
              }`}
            >
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <span className="text-[13px] font-medium">Save Current Height</span>
          </button>

          {/* Saved heights */}
          {heightEntries.map(([name, value], i) => {
            const idx = i + 1;
            const isSelected = selectedIdx === idx;
            const isSent = sentName === name;
            return (
              <button
                key={name}
                onClick={() => handleGoto(name)}
                className={`group/entry flex w-full items-center justify-between px-3 py-3 rounded-xl text-left transition-all duration-150 ${
                  isSelected
                    ? 'bg-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-white/60 hover:bg-white/[0.04]'
                } ${
                  isSent
                    ? '!bg-sky-500/15 !text-sky-300 !shadow-[inset_0_1px_0_rgba(56,189,248,0.1)]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg font-mono text-[11px] tabular-nums transition-colors duration-150 ${
                      isSelected
                        ? 'bg-white/[0.08] text-white/70'
                        : 'bg-white/[0.04] text-white/30'
                    }`}
                  >
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                  <span className="text-[13px] truncate">{name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono tabular-nums text-white/30">
                    {value.toFixed(2)}m
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(name);
                    }}
                    className="flex items-center justify-center w-6 h-6 rounded-md text-white/0 group-hover/entry:text-white/20 hover:!text-red-400 hover:!bg-red-500/10 transition-all"
                    aria-label={`Delete ${name}`}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </button>
            );
          })}

          {heightEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03]">
                <svg
                  className="h-5 w-5 text-white/15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7l4-4 4 4M8 17l4 4 4-4M12 3v18"
                  />
                </svg>
              </div>
              <span className="text-[11px] text-white/20">No saved heights</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="px-4 py-2.5 flex items-center justify-center gap-5">
          <span className="flex items-center gap-1.5 text-[10px] text-white/20">
            <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border border-white/[0.08] bg-white/[0.04] text-[8px] font-mono">
              &#x25B2;
            </kbd>
            <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border border-white/[0.08] bg-white/[0.04] text-[8px] font-mono">
              &#x25BC;
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-white/20">
            <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded border border-white/[0.08] bg-white/[0.04] text-[8px] font-mono">
              A
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-white/20">
            <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded border border-white/[0.08] bg-white/[0.04] text-[8px] font-mono">
              X
            </kbd>
            delete
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-white/20">
            <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded border border-white/[0.08] bg-white/[0.04] text-[8px] font-mono">
              B
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
