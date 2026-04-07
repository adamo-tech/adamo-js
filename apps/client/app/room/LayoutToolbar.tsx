'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCameraLayout } from './CameraLayoutProvider';

type LayoutToolbarProps = {
  className?: string;
  trackNames?: string[];
};

export function LayoutToolbar({ className, trackNames }: LayoutToolbarProps) {
  const ctx = useCameraLayout();
  const { store, activeLayout, editMode, setEditMode } = ctx;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const layoutIds = Object.keys(store.layouts);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [dropdownOpen]);

  // Focus rename input
  useEffect(() => {
    if (renaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renaming]);

  const handleRenameSubmit = useCallback(() => {
    if (renameValue.trim() && renameValue.trim() !== activeLayout.name) {
      ctx.renameLayout(activeLayout.id, renameValue.trim());
    }
    setRenaming(false);
  }, [renameValue, activeLayout, ctx]);

  const handleNewLayout = useCallback(() => {
    ctx.createLayout('New Layout', activeLayout.id);
    setDropdownOpen(false);
  }, [ctx, activeLayout]);

  const handleDuplicate = useCallback(() => {
    ctx.duplicateLayout(activeLayout.id);
  }, [ctx, activeLayout]);

  const handleDelete = useCallback(() => {
    if (layoutIds.length <= 1) return;
    ctx.deleteLayout(activeLayout.id);
  }, [ctx, activeLayout, layoutIds]);

  const handleAutoLayout = useCallback(() => {
    if (trackNames && trackNames.length > 0) {
      ctx.autoLayout(trackNames);
    }
  }, [ctx, trackNames]);

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      {/* Layout selector dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          {renaming ? (
            <input
              ref={renameRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setRenaming(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent text-[11px] text-white outline-none w-24"
            />
          ) : (
            <span>{activeLayout.name}</span>
          )}
          <svg
            className={`h-3 w-3 text-white/30 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-full left-0 mb-1 min-w-[160px] rounded-lg border border-white/[0.06] bg-[#0f0f1a] shadow-lg backdrop-blur-md z-50 py-1">
            {layoutIds.map((id) => {
              const layout = store.layouts[id];
              const isActive = id === activeLayout.id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    ctx.switchLayout(id);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-[11px] transition-colors ${
                    isActive
                      ? 'text-white bg-white/[0.06]'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive ? (
                    <svg
                      className="h-3 w-3 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    <div className="w-3" />
                  )}
                  <span>{layout.name}</span>
                </button>
              );
            })}
            <div className="border-t border-white/[0.06] mt-1 pt-1">
              <button
                onClick={handleNewLayout}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-white/30 hover:text-white hover:bg-white/[0.04] transition-colors"
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
                New layout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit mode actions */}
      {editMode ? (
        <>
          <button
            onClick={() => {
              setRenameValue(activeLayout.name);
              setRenaming(true);
            }}
            className="rounded-md px-2 py-1.5 text-[11px] font-medium text-white/30 hover:text-white hover:bg-white/[0.04] transition-colors"
            title="Rename layout"
          >
            Rename
          </button>
          {trackNames && trackNames.length > 0 && (
            <button
              onClick={handleAutoLayout}
              className="rounded-md px-2 py-1.5 text-[11px] font-medium text-white/30 hover:text-white hover:bg-white/[0.04] transition-colors"
              title="Reset layout to show all streams"
            >
              Reset layout
            </button>
          )}
          {/* Grid fineness slider */}
          <div className="flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 mx-0.5">
            <span className="text-[10px] text-white/30 whitespace-nowrap">Grid</span>
            <input
              type="range"
              min={12}
              max={96}
              step={6}
              value={activeLayout.gridCols}
              onChange={(e) => {
                const cols = Number(e.target.value);
                const rows = Math.round((cols * 2) / 3);
                ctx.setGridSize(cols, rows);
              }}
              onPointerDown={() => ctx.setAdjustingGrid(true)}
              onPointerUp={() => ctx.setAdjustingGrid(false)}
              onPointerCancel={() => ctx.setAdjustingGrid(false)}
              className="w-16 h-1 accent-white/40 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-white/30 w-8">
              {activeLayout.gridCols}
            </span>
          </div>
          <button
            onClick={handleDuplicate}
            className="rounded-md px-2 py-1.5 text-[11px] font-medium text-white/30 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            Duplicate
          </button>
          {layoutIds.length > 1 && (
            <button
              onClick={handleDelete}
              className="rounded-md px-2 py-1.5 text-[11px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => setEditMode(false)}
            className="rounded-md bg-white/[0.1] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/[0.15] transition-colors"
          >
            Done
          </button>
        </>
      ) : (
        <button
          onClick={() => setEditMode(true)}
          className="rounded-md bg-white/[0.06] border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-white/60 hover:bg-white/[0.1] hover:text-white transition-colors"
        >
          Edit
        </button>
      )}
    </div>
  );
}
