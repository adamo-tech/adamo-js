'use client';

import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, LogOutIcon } from './icons';
import { StatusDot } from './StatusDot';

type RoomHeaderProps = {
  robotName: string;
  connectionState: string;
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLogout: () => void;
};

/**
 * RoomHeader — thin translucent bar at the top of the room view.
 * Shows robot name, connection status, and navigation (back to list, prev/next robot).
 */
export function RoomHeader({
  robotName,
  connectionState,
  hasPrev,
  hasNext,
  onBack,
  onPrev,
  onNext,
  onLogout,
}: RoomHeaderProps) {
  const connected = connectionState === 'connected';

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-9 flex items-center gap-2 px-3 bg-black/80 backdrop-blur-sm pointer-events-none">
      {/* Left cluster — back to list */}
      <button
        onClick={onBack}
        className="pointer-events-auto group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/40 hover:text-white/90 hover:bg-white/[0.06] transition-all"
        title="Back to robot list"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">All robots</span>
      </button>

      {/* Divider */}
      <div className="pointer-events-none h-4 w-px bg-white/[0.08]" />

      {/* Prev/next robot */}
      <div className="pointer-events-auto flex items-center rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex h-7 w-7 items-center justify-center rounded-l-lg text-white/40 hover:text-white/90 hover:bg-white/[0.06] disabled:text-white/15 disabled:hover:bg-transparent transition-all"
          title="Previous robot"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
        </button>
        <div className="h-4 w-px bg-white/[0.06]" />
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex h-7 w-7 items-center justify-center rounded-r-lg text-white/40 hover:text-white/90 hover:bg-white/[0.06] disabled:text-white/15 disabled:hover:bg-transparent transition-all"
          title="Next robot"
        >
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Robot name — center */}
      <div className="pointer-events-none flex items-center gap-2">
        <StatusDot tone={connected ? 'success' : 'warning'} pulse={connected} />
        <span className="text-[13px] font-medium text-white">{robotName}</span>
        {!connected && (
          <span className="text-[10px] text-amber-400/70 font-mono uppercase tracking-wider ml-1">
            {connectionState}
          </span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout */}
      <button
        onClick={onLogout}
        className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all"
        title="Sign out"
      >
        <LogOutIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
