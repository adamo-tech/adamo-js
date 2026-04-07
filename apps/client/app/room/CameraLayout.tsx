'use client';

import { useCallback, useEffect, useRef } from 'react';
import { CameraLayoutProvider, useCameraLayout } from './CameraLayoutProvider';
import { CameraGrid } from './CameraGrid';
import { LayoutToolbar } from './LayoutToolbar';

export type CameraLayoutApi = {
  /** Cycle to the next or previous saved layout. */
  cycleLayout: (direction: 'prev' | 'next') => void;
};

type CameraLayoutProps = {
  trackNames: string[];
  roomId?: string;
  accessToken?: string;
  onReady?: (api: CameraLayoutApi) => void;
};

export function CameraLayout({ trackNames, roomId, accessToken, onReady }: CameraLayoutProps) {
  return (
    <CameraLayoutProvider roomId={roomId} accessToken={accessToken}>
      <CameraLayoutInner trackNames={trackNames} onReady={onReady} />
    </CameraLayoutProvider>
  );
}

function CameraLayoutInner({ trackNames, onReady }: CameraLayoutProps) {
  const ctx = useCameraLayout();
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const cycleLayout = useCallback((direction: 'prev' | 'next') => {
    const { store, activeLayout, switchLayout } = ctxRef.current;
    const ids = Object.keys(store.layouts);
    if (ids.length <= 1) return;
    const currentIdx = ids.indexOf(activeLayout.id);
    const newIdx =
      direction === 'next'
        ? (currentIdx + 1) % ids.length
        : (currentIdx - 1 + ids.length) % ids.length;
    switchLayout(ids[newIdx]);
  }, []);

  useEffect(() => {
    onReady?.({ cycleLayout });
  }, [onReady, cycleLayout]);

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Camera grid fills available space */}
      <div className="flex-1 min-h-0 p-2 pb-14">
        <CameraGrid cameras={trackNames} className="h-full" />
      </div>

      {/* Toolbar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center px-2 py-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-[#0a0a14]/60 backdrop-blur-xl p-1">
          <LayoutToolbar trackNames={trackNames} />
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
    </div>
  );
}
