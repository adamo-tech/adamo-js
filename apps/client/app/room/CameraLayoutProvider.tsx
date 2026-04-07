'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CameraLayout, LayoutStore, PanelPosition } from './camera-layout';
import { generateAutoLayout } from './camera-layout';
import { useLayoutStore, seedLayoutStore } from './useLayoutStore';

export type CameraLayoutContextValue = {
  store: LayoutStore;
  activeLayout: CameraLayout;
  editMode: boolean;
  setEditMode: (on: boolean) => void;
  setCameraKey: (key: string) => void; // no-op, kept for compat
  switchLayout: (id: string) => void;
  createLayout: (name: string, basedOn?: string) => string;
  renameLayout: (id: string, name: string) => void;
  deleteLayout: (id: string) => void;
  duplicateLayout: (id: string) => void;
  movePanel: (trackName: string, col: number, row: number) => void;
  resizePanel: (trackName: string, pos: Partial<PanelPosition>) => void;
  removePanel: (trackName: string) => void;
  batchUpdatePanels: (updates: Record<string, PanelPosition>) => void;
  rotatePanel: (trackName: string) => void;
  autoLayout: (trackNames: string[]) => void;
  unhideTrack: (trackName: string) => void;
  setGridSize: (cols: number, rows: number) => void;
  adjustingGrid: boolean;
  setAdjustingGrid: (on: boolean) => void;
};

const EMPTY_LAYOUT: CameraLayout = {
  id: '__empty',
  name: 'Default',
  gridCols: 48,
  gridRows: 32,
  gap: 4,
  panels: {},
};

const CameraLayoutContext = createContext<CameraLayoutContextValue | null>(null);

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type CameraLayoutProviderProps = {
  roomId?: string;
  accessToken?: string;
  children: React.ReactNode;
};

export function CameraLayoutProvider({ roomId, accessToken, children }: CameraLayoutProviderProps) {
  const [store, updateStore] = useLayoutStore();
  const setCameraKey = useCallback(() => {}, []); // no-op, kept for CameraGrid compat
  const [editMode, setEditMode] = useState(false);
  const [adjustingGrid, setAdjustingGrid] = useState(false);

  // ── API sync ──────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storeRef = useRef(store);
  storeRef.current = store;
  const loadedRef = useRef(false);

  const authHeaders = useMemo(() => {
    if (!accessToken) return undefined;
    return { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  }, [accessToken]);

  // Load layouts from API once on mount
  useEffect(() => {
    if (!roomId || !authHeaders || loadedRef.current) return;
    loadedRef.current = true;

    fetch(`${API_URL}/rooms/${roomId}/layouts`, { headers: authHeaders })
      .then((r) => r.ok ? r.json() : null)
      .then((cfg) => {
        if (!cfg) return;
        if (cfg.layouts && Object.keys(cfg.layouts).length > 0) {
          seedLayoutStore(cfg as LayoutStore);
        }
      })
      .catch(() => { /* API unreachable — localStorage still works */ });
  }, [roomId, authHeaders]);

  // Debounced save to API on every store change
  useEffect(() => {
    if (!roomId || !authHeaders) return;
    const isInitial = Object.keys(store.layouts).length === 0;
    if (isInitial) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`${API_URL}/rooms/${roomId}/layouts`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ config: storeRef.current }),
      }).catch(() => { /* API unreachable — localStorage still works */ });
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [store, roomId, authHeaders]);

  const activeLayout = useMemo(() => {
    if (store.activeLayoutId && store.layouts[store.activeLayoutId]) {
      return store.layouts[store.activeLayoutId];
    }
    const ids = Object.keys(store.layouts);
    if (ids.length > 0) return store.layouts[ids[0]];
    return EMPTY_LAYOUT;
  }, [store]);

  const updateActiveLayout = useCallback(
    (fn: (prev: CameraLayout) => CameraLayout) => {
      updateStore((prev) => {
        const layout = prev.layouts[prev.activeLayoutId];
        if (!layout) return prev;
        const updated = fn(layout);
        return {
          ...prev,
          layouts: { ...prev.layouts, [layout.id]: updated },
        };
      });
    },
    [updateStore],
  );

  const switchLayout = useCallback(
    (id: string) => {
      updateStore((prev) => ({ ...prev, activeLayoutId: id }));
    },
    [updateStore],
  );

  const createLayout = useCallback(
    (name: string, basedOn?: string): string => {
      const id = genId();
      updateStore((prev) => {
        const base = basedOn && prev.layouts[basedOn] ? prev.layouts[basedOn] : undefined;
        const layout: CameraLayout = {
          id,
          name,
          gridCols: base?.gridCols ?? 48,
          gridRows: base?.gridRows ?? 32,
          gap: base?.gap ?? 4,
          panels: base ? { ...base.panels } : {},
          ...(base?.hiddenTracks?.length ? { hiddenTracks: [...base.hiddenTracks] } : {}),
        };
        return {
          ...prev,
          activeLayoutId: id,
          layouts: { ...prev.layouts, [id]: layout },
        };
      });
      return id;
    },
    [updateStore],
  );

  const renameLayout = useCallback(
    (id: string, name: string) => {
      updateStore((prev) => {
        const layout = prev.layouts[id];
        if (!layout) return prev;
        return {
          ...prev,
          layouts: { ...prev.layouts, [id]: { ...layout, name } },
        };
      });
    },
    [updateStore],
  );

  const deleteLayout = useCallback(
    (id: string) => {
      updateStore((prev) => {
        const ids = Object.keys(prev.layouts);
        if (ids.length <= 1) return prev;
        const { [id]: _, ...rest } = prev.layouts;
        const newActiveId =
          prev.activeLayoutId === id ? Object.keys(rest)[0] : prev.activeLayoutId;
        return { ...prev, activeLayoutId: newActiveId, layouts: rest };
      });
    },
    [updateStore],
  );

  const duplicateLayout = useCallback(
    (id: string) => {
      updateStore((prev) => {
        const source = prev.layouts[id];
        if (!source) return prev;
        const newId = genId();
        const dup: CameraLayout = {
          ...source,
          id: newId,
          name: `${source.name} (copy)`,
          panels: { ...source.panels },
          ...(source.hiddenTracks?.length ? { hiddenTracks: [...source.hiddenTracks] } : {}),
        };
        return {
          ...prev,
          activeLayoutId: newId,
          layouts: { ...prev.layouts, [newId]: dup },
        };
      });
    },
    [updateStore],
  );

  const movePanel = useCallback(
    (trackName: string, col: number, row: number) => {
      updateActiveLayout((prev) => ({
        ...prev,
        panels: {
          ...prev.panels,
          [trackName]: { ...prev.panels[trackName], col, row },
        },
      }));
    },
    [updateActiveLayout],
  );

  const resizePanel = useCallback(
    (trackName: string, pos: Partial<PanelPosition>) => {
      updateActiveLayout((prev) => ({
        ...prev,
        panels: {
          ...prev.panels,
          [trackName]: { ...prev.panels[trackName], ...pos },
        },
      }));
    },
    [updateActiveLayout],
  );

  const removePanel = useCallback(
    (trackName: string) => {
      updateActiveLayout((prev) => {
        const { [trackName]: _, ...rest } = prev.panels;
        const hiddenTracks = prev.hiddenTracks ?? [];
        return {
          ...prev,
          panels: rest,
          ...(!hiddenTracks.includes(trackName)
            ? { hiddenTracks: [...hiddenTracks, trackName] }
            : {}),
        };
      });
    },
    [updateActiveLayout],
  );

  const unhideTrack = useCallback(
    (trackName: string) => {
      updateActiveLayout((prev) => {
        const hiddenTracks = prev.hiddenTracks?.filter((t) => t !== trackName);
        return { ...prev, hiddenTracks: hiddenTracks?.length ? hiddenTracks : undefined };
      });
    },
    [updateActiveLayout],
  );

  const batchUpdatePanels = useCallback(
    (updates: Record<string, PanelPosition>) => {
      updateActiveLayout((prev) => ({
        ...prev,
        panels: { ...prev.panels, ...updates },
      }));
    },
    [updateActiveLayout],
  );

  const rotatePanel = useCallback(
    (trackName: string) => {
      updateActiveLayout((prev) => {
        const panel = prev.panels[trackName];
        if (!panel) return prev;
        const current = panel.rotation ?? 0;
        const next = (current + 90) % 360;
        return {
          ...prev,
          panels: {
            ...prev.panels,
            [trackName]: { ...panel, rotation: next || undefined },
          },
        };
      });
    },
    [updateActiveLayout],
  );

  const autoLayoutFn = useCallback(
    (trackNames: string[]) => {
      const panels = generateAutoLayout(trackNames);
      updateActiveLayout((prev) => ({
        ...prev,
        panels,
        hiddenTracks: undefined,
      }));
    },
    [updateActiveLayout],
  );

  const setGridSize = useCallback(
    (cols: number, rows: number) => {
      updateActiveLayout((prev) => {
        const panels: Record<string, PanelPosition> = {};
        for (const [name, p] of Object.entries(prev.panels)) {
          const colSpan = Math.max(1, Math.min(p.colSpan, cols));
          const rowSpan = Math.max(1, Math.min(p.rowSpan, rows));
          const col = Math.max(0, Math.min(p.col, cols - colSpan));
          const row = Math.max(0, Math.min(p.row, rows - rowSpan));
          panels[name] = { col, row, colSpan, rowSpan };
        }
        return { ...prev, gridCols: cols, gridRows: rows, panels };
      });
    },
    [updateActiveLayout],
  );

  const value = useMemo<CameraLayoutContextValue>(
    () => ({
      store,
      activeLayout,
      editMode,
      setEditMode,
      setCameraKey,
      switchLayout,
      createLayout,
      renameLayout,
      deleteLayout,
      duplicateLayout,
      movePanel,
      resizePanel,
      removePanel,
      batchUpdatePanels,
      rotatePanel,
      autoLayout: autoLayoutFn,
      unhideTrack,
      setGridSize,
      adjustingGrid,
      setAdjustingGrid,
    }),
    [
      store,
      activeLayout,
      editMode,
      adjustingGrid,
      switchLayout,
      createLayout,
      renameLayout,
      deleteLayout,
      duplicateLayout,
      movePanel,
      resizePanel,
      removePanel,
      batchUpdatePanels,
      rotatePanel,
      autoLayoutFn,
      unhideTrack,
      setGridSize,
    ],
  );

  return (
    <CameraLayoutContext.Provider value={value}>{children}</CameraLayoutContext.Provider>
  );
}

export function useCameraLayout(): CameraLayoutContextValue {
  const ctx = useContext(CameraLayoutContext);
  if (!ctx) throw new Error('useCameraLayout must be used within CameraLayoutProvider');
  return ctx;
}
