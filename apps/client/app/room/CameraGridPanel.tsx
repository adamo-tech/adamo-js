'use client';

import React from 'react';
import { ClickableVideoFeed } from './ClickableVideoFeed';
import type { PanelPosition, ResizeHandle } from './camera-layout';

type CameraGridPanelProps = {
  trackName: string;
  position: PanelPosition;
  editMode: boolean;
  isDragging: boolean;
  onDragStart: (trackName: string, e: React.PointerEvent) => void;
  onResizeStart: (trackName: string, handle: ResizeHandle, e: React.PointerEvent) => void;
  onRemove?: (trackName: string) => void;
  onRotate?: (trackName: string) => void;
};

const HANDLE_SIZE = 12;

const RESIZE_CURSORS: Record<ResizeHandle, string> = {
  'top-left': 'nwse-resize',
  top: 'ns-resize',
  'top-right': 'nesw-resize',
  left: 'ew-resize',
  right: 'ew-resize',
  'bottom-left': 'nesw-resize',
  bottom: 'ns-resize',
  'bottom-right': 'nwse-resize',
};

const ALL_HANDLES: ResizeHandle[] = [
  'top-left',
  'top',
  'top-right',
  'left',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right',
];

function ResizeHandleEl({
  handle,
  onPointerDown,
}: {
  handle: ResizeHandle;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const cursor = RESIZE_CURSORS[handle];
  const hs = HANDLE_SIZE;
  const half = hs / 2;

  let style: React.CSSProperties = {
    position: 'absolute',
    cursor,
    zIndex: 20,
  };

  switch (handle) {
    case 'top-left':
      style = { ...style, top: -half, left: -half, width: hs, height: hs };
      break;
    case 'top':
      style = { ...style, top: -half, left: hs, right: hs, height: hs };
      break;
    case 'top-right':
      style = { ...style, top: -half, right: -half, width: hs, height: hs };
      break;
    case 'left':
      style = { ...style, top: hs, bottom: hs, left: -half, width: hs };
      break;
    case 'right':
      style = { ...style, top: hs, bottom: hs, right: -half, width: hs };
      break;
    case 'bottom-left':
      style = { ...style, bottom: -half, left: -half, width: hs, height: hs };
      break;
    case 'bottom':
      style = { ...style, bottom: -half, left: hs, right: hs, height: hs };
      break;
    case 'bottom-right':
      style = { ...style, bottom: -half, right: -half, width: hs, height: hs };
      break;
  }

  const isCorner = handle.includes('-') || false;

  return (
    <div
      style={style}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown(e);
      }}
    >
      {isCorner && (
        <div
          className="absolute rounded-full bg-white/60 border border-white/80"
          style={{ width: hs, height: hs, top: 0, left: 0 }}
        />
      )}
    </div>
  );
}

const CameraGridPanel = React.memo(function CameraGridPanel({
  trackName,
  position,
  editMode,
  isDragging,
  onDragStart,
  onResizeStart,
  onRemove,
  onRotate,
}: CameraGridPanelProps) {
  const gridStyle: React.CSSProperties = {
    gridColumn: `${position.col + 1} / span ${position.colSpan}`,
    gridRow: `${position.row + 1} / span ${position.rowSpan}`,
    opacity: isDragging ? 0.3 : 1,
    transition: isDragging ? 'none' : 'opacity 150ms ease',
  };

  const videoStyle: React.CSSProperties | undefined = position.rotation
    ? { transform: `rotate(${position.rotation}deg)` }
    : undefined;

  return (
    <div
      className="group/panel relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#0a0a14]"
      style={{ ...gridStyle, minWidth: 0, minHeight: 0 }}
    >
      <ClickableVideoFeed topic={trackName} style={videoStyle} />

      {/* Track name label */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 pointer-events-none">
        <span className="text-[11px] font-mono text-white/80">{trackName}</span>
      </div>

      {/* Edit mode overlay */}
      {editMode && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#0a0a14]/20 cursor-move"
          onPointerDown={(e) => onDragStart(trackName, e)}
        >
          <div className="rounded-md bg-[#0a0a14]/70 backdrop-blur-sm px-3 py-1.5 border border-white/[0.1]">
            <span className="text-xs font-mono text-white/70">{trackName}</span>
          </div>

          {/* Action buttons */}
          <div
            className="absolute top-2 right-2 z-20 flex items-center gap-1"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              className="flex items-center justify-center w-6 h-6 rounded-md bg-[#0a0a14]/70 backdrop-blur-sm border border-white/[0.12] text-white/70 hover:text-rose-400 hover:border-rose-400/40 transition-colors"
              title="Remove from layout"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(trackName);
              }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              className="flex items-center justify-center w-6 h-6 rounded-md bg-[#0a0a14]/70 backdrop-blur-sm border border-white/[0.12] text-white/70 hover:text-white hover:border-white/[0.25] transition-colors"
              title="Rotate 90deg"
              onClick={(e) => {
                e.stopPropagation();
                onRotate?.(trackName);
              }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Resize handles */}
          {ALL_HANDLES.map((handle) => (
            <ResizeHandleEl
              key={handle}
              handle={handle}
              onPointerDown={(e) => onResizeStart(trackName, handle, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

CameraGridPanel.displayName = 'CameraGridPanel';

export { CameraGridPanel };
