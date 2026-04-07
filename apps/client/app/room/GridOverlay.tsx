'use client';

type GridOverlayProps = {
  cols: number;
  rows: number;
  visible: boolean;
};

/**
 * Lightweight background-only grid overlay shown during drag/resize.
 */
export function GridOverlay({ cols, rows, visible }: GridOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), ' +
          'linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: `calc(100% / ${cols}) calc(100% / ${rows})`,
        backgroundPosition: '0 0',
        zIndex: 10,
      }}
    />
  );
}
