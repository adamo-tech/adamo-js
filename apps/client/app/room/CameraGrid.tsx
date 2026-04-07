'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragState, PanelPosition, ResizeHandle } from './camera-layout';
import { hashCameraNames, overlaps, pointerToGrid, resolveOverlaps } from './camera-layout';
import { useCameraLayout } from './CameraLayoutProvider';
import { CameraGridPanel } from './CameraGridPanel';
import { GridOverlay } from './GridOverlay';

type CameraGridProps = {
  cameras: string[];
  className?: string;
};

export function CameraGrid({ cameras, className }: CameraGridProps) {
  const ctx = useCameraLayout();
  const { activeLayout, editMode, adjustingGrid } = ctx;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [previewPos, setPreviewPos] = useState<PanelPosition | null>(null);
  const [resolvedPanels, setResolvedPanels] = useState<Record<string, PanelPosition> | null>(null);
  const resolvedRef = useRef<Record<string, PanelPosition> | null>(null);
  const rafRef = useRef(0);

  // Track names from camera topics
  const trackNames = useMemo(() => {
    return [...cameras].sort((a, b) => {
      if (a === 'main') return -1;
      if (b === 'main') return 1;
      return a.localeCompare(b);
    });
  }, [cameras]);

  // Key the layout store by camera set
  useEffect(() => {
    if (trackNames.length > 0) {
      ctx.setCameraKey(hashCameraNames(trackNames));
    }
  }, [trackNames]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-generate layout for brand-new stores
  useEffect(() => {
    if (trackNames.length === 0) return;
    if (activeLayout.id === '__empty') {
      ctx.createLayout('Default');
      return;
    }
    const panelCount = Object.keys(activeLayout.panels).length;
    if (panelCount === 0) {
      ctx.autoLayout(trackNames);
    }
  }, [trackNames.length, Object.keys(activeLayout.panels).length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate placed, hidden, and new cameras
  const { placedCameras, hiddenCameras } = useMemo(() => {
    const placedCameras: { trackName: string; position: PanelPosition }[] = [];
    const hiddenCameras: string[] = [];
    const newCameras: string[] = [];
    const hiddenSet = new Set(activeLayout.hiddenTracks ?? []);

    for (const name of trackNames) {
      if (activeLayout.panels[name]) {
        placedCameras.push({ trackName: name, position: activeLayout.panels[name] });
      } else if (hiddenSet.has(name)) {
        hiddenCameras.push(name);
      } else {
        newCameras.push(name);
      }
    }

    return { placedCameras, hiddenCameras, newCameras };
  }, [trackNames, activeLayout.panels, activeLayout.hiddenTracks]);

  // ── Drag (move) ─────────────────────────────────────────────

  const handleDragStart = useCallback(
    (trackName: string, e: React.PointerEvent) => {
      if (!editMode || !containerRef.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const grid = pointerToGrid(
        e.clientX,
        e.clientY,
        containerRef.current,
        activeLayout.gridCols,
        activeLayout.gridRows,
      );
      const panel = activeLayout.panels[trackName];
      if (!panel) return;

      setDragState({
        type: 'move',
        trackName,
        startCol: panel.col,
        startRow: panel.row,
        offsetCol: grid.col - panel.col,
        offsetRow: grid.row - panel.row,
      });
      setPreviewPos({ ...panel });
    },
    [editMode, activeLayout],
  );

  // ── Resize ──────────────────────────────────────────────────

  const handleResizeStart = useCallback(
    (trackName: string, handle: ResizeHandle, e: React.PointerEvent) => {
      if (!editMode || !containerRef.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const panel = activeLayout.panels[trackName];
      if (!panel) return;

      setDragState({
        type: 'resize',
        trackName,
        handle,
        startCol: panel.col,
        startRow: panel.row,
        startColSpan: panel.colSpan,
        startRowSpan: panel.rowSpan,
      });
      setPreviewPos({ ...panel });
    },
    [editMode, activeLayout],
  );

  // ── Pointer move / up (shared for drag + resize) ────────────

  useEffect(() => {
    if (!dragState || !containerRef.current) return;

    const container = containerRef.current;
    const { gridCols, gridRows } = activeLayout;

    const handlePointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        let newPos: PanelPosition | null = null;

        if (dragState.type === 'move') {
          const grid = pointerToGrid(e.clientX, e.clientY, container, gridCols, gridRows);
          const panel = activeLayout.panels[dragState.trackName];
          if (!panel) return;
          const newCol = Math.max(
            0,
            Math.min(gridCols - panel.colSpan, grid.col - dragState.offsetCol),
          );
          const newRow = Math.max(
            0,
            Math.min(gridRows - panel.rowSpan, grid.row - dragState.offsetRow),
          );
          newPos = {
            col: newCol,
            row: newRow,
            colSpan: panel.colSpan,
            rowSpan: panel.rowSpan,
          };
        } else if (dragState.type === 'resize') {
          const grid = pointerToGrid(e.clientX, e.clientY, container, gridCols, gridRows);
          const { handle, startCol, startRow, startColSpan, startRowSpan } = dragState;
          let col = startCol;
          let row = startRow;
          let colSpan = startColSpan;
          let rowSpan = startRowSpan;

          if (handle.includes('right')) {
            colSpan = Math.max(1, Math.min(gridCols - col, grid.col - col + 1));
          }
          if (handle.includes('left')) {
            const nc = Math.max(0, Math.min(grid.col, startCol + startColSpan - 1));
            colSpan = startCol + startColSpan - nc;
            col = nc;
          }
          if (handle.includes('bottom') || handle === 'bottom') {
            rowSpan = Math.max(1, Math.min(gridRows - row, grid.row - row + 1));
          }
          if (handle.includes('top') || handle === 'top') {
            const nr = Math.max(0, Math.min(grid.row, startRow + startRowSpan - 1));
            rowSpan = startRow + startRowSpan - nr;
            row = nr;
          }

          colSpan = Math.max(1, colSpan);
          rowSpan = Math.max(1, rowSpan);

          newPos = { col, row, colSpan, rowSpan };
        }

        if (newPos) {
          setPreviewPos(newPos);
          const resolved = resolveOverlaps(
            dragState.trackName,
            newPos,
            activeLayout.panels,
            gridCols,
            gridRows,
          );
          resolvedRef.current = resolved;
          setResolvedPanels(resolved);
        }
      });
    };

    const handlePointerUp = () => {
      cancelAnimationFrame(rafRef.current);
      const resolved = resolvedRef.current;
      if (resolved) {
        ctx.batchUpdatePanels(resolved);
      }
      setResolvedPanels(null);
      resolvedRef.current = null;
      setDragState(null);
      setPreviewPos(null);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, activeLayout, ctx]);

  const previewValid = resolvedPanels !== null || !dragState;

  // Add an unplaced camera to the layout
  const handleAddUnplaced = useCallback(
    (trackName: string) => {
      const { gridCols, gridRows, panels } = activeLayout;
      const existingPanels = Object.values(panels);

      const sizes = [
        [Math.floor(gridCols / 2), Math.floor(gridRows / 2)],
        [Math.floor(gridCols / 3), Math.floor(gridRows / 3)],
        [12, 8],
        [8, 6],
        [6, 4],
      ];

      for (const [w, h] of sizes) {
        if (w > gridCols || h > gridRows) continue;
        for (let r = 0; r <= gridRows - h; r++) {
          for (let c = 0; c <= gridCols - w; c++) {
            const candidate: PanelPosition = { col: c, row: r, colSpan: w, rowSpan: h };
            if (existingPanels.every((p) => !overlaps(candidate, p))) {
              ctx.resizePanel(trackName, candidate);
              return;
            }
          }
        }
      }

      // No free space — re-layout everything
      const allNames = [...Object.keys(panels), trackName];
      ctx.autoLayout(allNames);
    },
    [activeLayout, ctx],
  );

  // Auto-place new cameras
  const autoPlacedRef = useRef(new Set<string>());
  useEffect(() => {
    if (activeLayout.id === '__empty') return;
    if (Object.keys(activeLayout.panels).length === 0) return;

    const hiddenSet = new Set(activeLayout.hiddenTracks ?? []);
    const toPlace: string[] = [];
    for (const name of trackNames) {
      if (!activeLayout.panels[name] && !hiddenSet.has(name) && !autoPlacedRef.current.has(name)) {
        toPlace.push(name);
      }
    }
    if (toPlace.length === 0) return;

    for (const name of toPlace) autoPlacedRef.current.add(name);
    for (const name of toPlace) handleAddUnplaced(name);
  }, [trackNames, activeLayout.id, activeLayout.panels, activeLayout.hiddenTracks, handleAddUnplaced]);

  return (
    <div className={`flex flex-col min-h-0 ${className ?? ''}`}>
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${activeLayout.gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${activeLayout.gridRows}, minmax(0, 1fr))`,
          gap: `${activeLayout.gap}px`,
        }}
      >
        {/* Grid overlay (edit mode) */}
        <GridOverlay
          cols={activeLayout.gridCols}
          rows={activeLayout.gridRows}
          visible={editMode && (dragState !== null || adjustingGrid)}
        />

        {/* Ghost preview during drag/resize */}
        {dragState && previewPos && (
          <div
            className={`rounded-lg border-2 border-dashed ${
              previewValid
                ? 'border-white/30 bg-white/[0.04]'
                : 'border-red-500/40 bg-red-500/[0.06]'
            }`}
            style={{
              gridColumn: `${previewPos.col + 1} / span ${previewPos.colSpan}`,
              gridRow: `${previewPos.row + 1} / span ${previewPos.rowSpan}`,
              pointerEvents: 'none',
              zIndex: 15,
            }}
          />
        )}

        {/* Camera panels */}
        {placedCameras.map(({ trackName, position }) => {
          const effectivePosition =
            dragState && resolvedPanels && trackName !== dragState.trackName
              ? (resolvedPanels[trackName] ?? position)
              : position;

          return (
            <CameraGridPanel
              key={trackName}
              trackName={trackName}
              position={effectivePosition}
              editMode={editMode}
              isDragging={dragState?.trackName === trackName}
              onDragStart={handleDragStart}
              onResizeStart={handleResizeStart}
              onRemove={(name) => ctx.removePanel(name)}
              onRotate={(name) => ctx.rotatePanel(name)}
            />
          );
        })}

        {/* Hidden cameras (edit mode) */}
        {editMode && hiddenCameras.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 px-3 py-2 bg-[#050812]/80 backdrop-blur-sm border-t border-white/[0.08]">
            <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider shrink-0">
              Hidden
            </span>
            <div className="flex gap-2 flex-wrap">
              {hiddenCameras.map((trackName) => (
                <button
                  key={trackName}
                  onClick={() => {
                    ctx.unhideTrack(trackName);
                    handleAddUnplaced(trackName);
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-dashed border-white/[0.15] bg-white/[0.04] px-2.5 py-1.5 text-xs font-mono text-white/50 hover:border-white/[0.3] hover:text-white transition-colors"
                >
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {trackName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
