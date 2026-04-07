/** Position & size of a single camera panel within the grid. */
export type PanelPosition = {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  rotation?: number;
};

/** A named layout: maps track names to grid positions. */
export type CameraLayout = {
  id: string;
  name: string;
  gridCols: number;
  gridRows: number;
  gap: number;
  panels: Record<string, PanelPosition>;
  hiddenTracks?: string[];
};

/** The complete persisted store. */
export type LayoutStore = {
  version: 1;
  activeLayoutId: string;
  layouts: Record<string, CameraLayout>;
};

/** Which edge/corner the user is dragging for resize. */
export type ResizeHandle =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

/** Current drag/resize interaction state. */
export type DragState =
  | {
      type: 'move';
      trackName: string;
      startCol: number;
      startRow: number;
      offsetCol: number;
      offsetRow: number;
    }
  | {
      type: 'resize';
      trackName: string;
      handle: ResizeHandle;
      startCol: number;
      startRow: number;
      startColSpan: number;
      startRowSpan: number;
    };

/** Check whether two panel positions overlap. */
export function overlaps(a: PanelPosition, b: PanelPosition): boolean {
  return !(
    a.col + a.colSpan <= b.col ||
    b.col + b.colSpan <= a.col ||
    a.row + a.rowSpan <= b.row ||
    b.row + b.rowSpan <= a.row
  );
}

/** Convert pointer coordinates to grid cell, accounting for CSS grid gap. */
export function pointerToGrid(
  clientX: number,
  clientY: number,
  container: HTMLElement,
  gridCols: number,
  gridRows: number,
): { col: number; row: number } {
  const rect = container.getBoundingClientRect();
  const cs = getComputedStyle(container);
  const gapX = parseFloat(cs.columnGap) || 0;
  const gapY = parseFloat(cs.rowGap) || 0;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const stepX = (rect.width + gapX) / gridCols;
  const stepY = (rect.height + gapY) / gridRows;
  return {
    col: Math.max(0, Math.min(gridCols - 1, Math.floor(x / stepX))),
    row: Math.max(0, Math.min(gridRows - 1, Math.floor(y / stepY))),
  };
}

/** Generate an auto-layout for N track names on a 48x32 grid. */
export function generateAutoLayout(trackNames: string[]): Record<string, PanelPosition> {
  const panels: Record<string, PanelPosition> = {};
  const n = trackNames.length;
  if (n === 0) return panels;

  const oC = 0;
  const oR = 0;
  const uC = 48;
  const uR = 32;

  if (n === 1) {
    panels[trackNames[0]] = { col: oC, row: oR, colSpan: uC, rowSpan: uR };
  } else if (n === 2) {
    const half = uC / 2;
    panels[trackNames[0]] = { col: oC, row: oR, colSpan: half, rowSpan: uR };
    panels[trackNames[1]] = { col: oC + half, row: oR, colSpan: half, rowSpan: uR };
  } else if (n === 3) {
    const bigW = Math.round(uC * 0.65);
    const sideW = uC - bigW;
    const halfR = uR / 2;
    panels[trackNames[0]] = { col: oC, row: oR, colSpan: bigW, rowSpan: uR };
    panels[trackNames[1]] = { col: oC + bigW, row: oR, colSpan: sideW, rowSpan: halfR };
    panels[trackNames[2]] = { col: oC + bigW, row: oR + halfR, colSpan: sideW, rowSpan: halfR };
  } else if (n === 4) {
    const halfC = uC / 2;
    const halfR = uR / 2;
    panels[trackNames[0]] = { col: oC, row: oR, colSpan: halfC, rowSpan: halfR };
    panels[trackNames[1]] = { col: oC + halfC, row: oR, colSpan: halfC, rowSpan: halfR };
    panels[trackNames[2]] = { col: oC, row: oR + halfR, colSpan: halfC, rowSpan: halfR };
    panels[trackNames[3]] = { col: oC + halfC, row: oR + halfR, colSpan: halfC, rowSpan: halfR };
  } else {
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const cellCols = Math.floor(uC / cols);
    const cellRows = Math.floor(uR / rows);
    trackNames.forEach((name, i) => {
      panels[name] = {
        col: oC + (i % cols) * cellCols,
        row: oR + Math.floor(i / cols) * cellRows,
        colSpan: cellCols,
        rowSpan: cellRows,
      };
    });
  }

  return panels;
}

/** Minimum panel dimension in grid cells. */
const MIN_PANEL_SPAN = 2;

/**
 * Given a panel being moved/resized to `newPos`, resolve all overlaps with
 * other panels by swapping, pushing, shrinking, or relocating them.
 * Returns the full adjusted panels map, or null if overlaps can't be resolved.
 */
export function resolveOverlaps(
  movingTrack: string,
  newPos: PanelPosition,
  panels: Record<string, PanelPosition>,
  gridCols: number,
  gridRows: number,
): Record<string, PanelPosition> | null {
  const result: Record<string, PanelPosition> = {};
  for (const [name, pos] of Object.entries(panels)) {
    result[name] = name === movingTrack ? { ...newPos } : { ...pos };
  }

  const originalPos = panels[movingTrack];
  if (originalPos) {
    const overlappers: string[] = [];
    for (const [name, pos] of Object.entries(result)) {
      if (name === movingTrack) continue;
      if (overlaps(result[movingTrack], pos)) overlappers.push(name);
    }

    if (overlappers.length === 1) {
      const other = overlappers[0];
      const otherPos = result[other];
      const ox1 = Math.max(newPos.col, otherPos.col);
      const oy1 = Math.max(newPos.row, otherPos.row);
      const ox2 = Math.min(newPos.col + newPos.colSpan, otherPos.col + otherPos.colSpan);
      const oy2 = Math.min(newPos.row + newPos.rowSpan, otherPos.row + otherPos.rowSpan);
      const overlapArea = Math.max(0, ox2 - ox1) * Math.max(0, oy2 - oy1);
      const otherArea = otherPos.colSpan * otherPos.rowSpan;
      if (overlapArea >= otherArea * 0.5) {
        result[other] = {
          ...result[other],
          col: originalPos.col,
          row: originalPos.row,
          colSpan: originalPos.colSpan,
          rowSpan: originalPos.rowSpan,
        };
        const names = Object.keys(result);
        let valid = true;
        for (let i = 0; i < names.length && valid; i++) {
          for (let j = i + 1; j < names.length && valid; j++) {
            if (overlaps(result[names[i]], result[names[j]])) valid = false;
          }
        }
        if (valid) return result;
        result[other] = { ...panels[other] };
      }
    }
  }

  const adjusted = new Set<string>([movingTrack]);
  const maxIter = Object.keys(panels).length * 2 + 2;

  for (let iter = 0; iter < maxIter; iter++) {
    let anyOverlap = false;

    for (const name of Object.keys(result)) {
      if (adjusted.has(name)) continue;

      for (const adjName of adjusted) {
        if (!overlaps(result[name], result[adjName])) continue;

        anyOverlap = true;
        const pushed = pushPanel(result[name], result[adjName], gridCols, gridRows);
        if (!pushed) return null;
        result[name] = { ...result[name], ...pushed };
        adjusted.add(name);
        break;
      }
    }

    if (!anyOverlap) break;
  }

  const names = Object.keys(result);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (overlaps(result[names[i]], result[names[j]])) {
        return null;
      }
    }
  }

  return result;
}

function pushPanel(
  panel: PanelPosition,
  encroacher: PanelPosition,
  gridCols: number,
  gridRows: number,
): PanelPosition | null {
  const options: PanelPosition[] = [];
  const pRight = panel.col + panel.colSpan;
  const pBottom = panel.row + panel.rowSpan;
  const eRight = encroacher.col + encroacher.colSpan;
  const eBottom = encroacher.row + encroacher.rowSpan;

  if (eRight > panel.col && eRight < pRight) {
    const colSpan = pRight - eRight;
    if (colSpan >= MIN_PANEL_SPAN) {
      options.push({ col: eRight, row: panel.row, colSpan, rowSpan: panel.rowSpan });
    }
  }
  if (encroacher.col > panel.col && encroacher.col < pRight) {
    const colSpan = encroacher.col - panel.col;
    if (colSpan >= MIN_PANEL_SPAN) {
      options.push({ col: panel.col, row: panel.row, colSpan, rowSpan: panel.rowSpan });
    }
  }
  if (eRight < gridCols) {
    const col = eRight;
    const colSpan = Math.min(panel.colSpan, gridCols - col);
    if (colSpan >= MIN_PANEL_SPAN) {
      const c: PanelPosition = { col, row: panel.row, colSpan, rowSpan: panel.rowSpan };
      if (!overlaps(c, encroacher)) options.push(c);
    }
  }
  if (encroacher.col > 0) {
    const endCol = encroacher.col;
    const col = Math.max(0, endCol - panel.colSpan);
    const colSpan = endCol - col;
    if (colSpan >= MIN_PANEL_SPAN) {
      const c: PanelPosition = { col, row: panel.row, colSpan, rowSpan: panel.rowSpan };
      if (!overlaps(c, encroacher)) options.push(c);
    }
  }
  if (eBottom > panel.row && eBottom < pBottom) {
    const rowSpan = pBottom - eBottom;
    if (rowSpan >= MIN_PANEL_SPAN) {
      options.push({ col: panel.col, row: eBottom, colSpan: panel.colSpan, rowSpan });
    }
  }
  if (encroacher.row > panel.row && encroacher.row < pBottom) {
    const rowSpan = encroacher.row - panel.row;
    if (rowSpan >= MIN_PANEL_SPAN) {
      options.push({ col: panel.col, row: panel.row, colSpan: panel.colSpan, rowSpan });
    }
  }
  if (eBottom < gridRows) {
    const row = eBottom;
    const rowSpan = Math.min(panel.rowSpan, gridRows - row);
    if (rowSpan >= MIN_PANEL_SPAN) {
      const c: PanelPosition = { col: panel.col, row, colSpan: panel.colSpan, rowSpan };
      if (!overlaps(c, encroacher)) options.push(c);
    }
  }
  if (encroacher.row > 0) {
    const endRow = encroacher.row;
    const row = Math.max(0, endRow - panel.rowSpan);
    const rowSpan = endRow - row;
    if (rowSpan >= MIN_PANEL_SPAN) {
      const c: PanelPosition = { col: panel.col, row, colSpan: panel.colSpan, rowSpan };
      if (!overlaps(c, encroacher)) options.push(c);
    }
  }

  if (options.length === 0) return null;
  options.sort((a, b) => b.colSpan * b.rowSpan - a.colSpan * a.rowSpan);
  return options[0];
}

/** Simple hash of sorted camera names, used as a storage key. */
export function hashCameraNames(names: string[]): string {
  const str = [...names].sort().join('\0');
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

/** Default empty store. */
export function createDefaultStore(): LayoutStore {
  return {
    version: 1,
    activeLayoutId: '',
    layouts: {},
  };
}
