import React, { useEffect, useRef, useState, useCallback, CSSProperties } from 'react';
import type { CostmapData } from '@adamo/adamo-core';

export interface CostmapViewerProps {
  /** Costmap data */
  costmap: CostmapData | null;
  /** Whether to show the robot marker at center */
  showRobot?: boolean;
  /** CSS class name for the container */
  className?: string;
  /** Inline styles for the container */
  style?: CSSProperties;
  /** Robot icon color */
  robotColor?: string;
}

// Costmap cost values
const COST_FREE = 0;
const COST_INSCRIBED = 253;
const COST_LETHAL = 254;
const COST_NO_INFO = 255;

/**
 * CostmapViewer - Canvas-based local costmap visualization
 *
 * Displays a robot-centered rolling window costmap with cost gradients.
 * - Free space (0): Light gray
 * - Inflated costs (1-252): Blue gradient (lighter = lower cost)
 * - Inscribed (253): Orange
 * - Lethal (254): Red
 * - Unknown (255): Dark gray
 *
 * @example
 * ```tsx
 * function LocalCostmap() {
 *   const { costmap } = useCostmap();
 *
 *   return (
 *     <CostmapViewer
 *       costmap={costmap}
 *       showRobot
 *     />
 *   );
 * }
 * ```
 */
export function CostmapViewer({
  costmap,
  showRobot = true,
  className,
  style,
  robotColor = '#00ff00',
}: CostmapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Handle canvas resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    // Initial size
    setCanvasSize({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    return () => resizeObserver.disconnect();
  }, []);

  // Get color for a cost value (RViz-style colormap)
  const getCostColor = useCallback((cost: number): [number, number, number] => {
    if (cost === COST_FREE) {
      // Free space - light gray
      return [200, 200, 200];
    } else if (cost === COST_NO_INFO) {
      // Unknown - medium gray
      return [128, 128, 128];
    } else if (cost === COST_LETHAL) {
      // Lethal obstacle - dark red/maroon
      return [139, 0, 0];
    } else if (cost === COST_INSCRIBED) {
      // Inscribed - red
      return [255, 0, 0];
    } else {
      // Inflated cost (1-252) - RViz-style blue to purple/magenta gradient
      // Lower cost = blue, higher cost = purple/magenta
      const t = cost / 252;

      // Blue (low cost) -> Cyan -> Purple -> Magenta (high cost)
      let r, g, b;
      if (t < 0.33) {
        // Blue to cyan
        const localT = t / 0.33;
        r = 0;
        g = Math.round(255 * localT);
        b = 255;
      } else if (t < 0.66) {
        // Cyan to purple
        const localT = (t - 0.33) / 0.33;
        r = Math.round(128 * localT);
        g = Math.round(255 * (1 - localT));
        b = 255;
      } else {
        // Purple to magenta/red
        const localT = (t - 0.66) / 0.34;
        r = Math.round(128 + 127 * localT);
        g = 0;
        b = Math.round(255 * (1 - localT * 0.5));
      }
      return [r, g, b];
    }
  }, []);

  // Draw the costmap
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !costmap) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create ImageData from costmap
    const imageData = new ImageData(costmap.width, costmap.height);
    const pixels = imageData.data;

    for (let i = 0; i < costmap.data.length; i++) {
      const cost = costmap.data[i];
      const [r, g, b] = getCostColor(cost);
      const pixelIndex = i * 4;
      pixels[pixelIndex] = r;
      pixels[pixelIndex + 1] = g;
      pixels[pixelIndex + 2] = b;
      pixels[pixelIndex + 3] = 255;
    }

    // Calculate scale to fit
    const scaleX = canvasSize.width / costmap.width;
    const scaleY = canvasSize.height / costmap.height;
    const scale = Math.min(scaleX, scaleY);

    const drawWidth = costmap.width * scale;
    const drawHeight = costmap.height * scale;
    const offsetX = (canvasSize.width - drawWidth) / 2;
    const offsetY = (canvasSize.height - drawHeight) / 2;

    // Create temporary canvas for the costmap image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = costmap.width;
    tempCanvas.height = costmap.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(imageData, 0, 0);
      // Disable image smoothing for crisp voxel rendering
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);
    }

    // Draw robot at center as rectangle (forklift shape)
    if (showRobot) {
      const robotCanvasX = canvasSize.width / 2;
      const robotCanvasY = canvasSize.height / 2;
      const robotWidth = Math.max(8, scale * 4);
      const robotHeight = Math.max(12, scale * 6);

      ctx.save();
      ctx.translate(robotCanvasX, robotCanvasY);

      // Draw rectangle for robot body
      ctx.fillStyle = robotColor;
      ctx.fillRect(-robotWidth / 2, -robotHeight / 2, robotWidth, robotHeight);

      // Draw outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(-robotWidth / 2, -robotHeight / 2, robotWidth, robotHeight);

      // Draw direction indicator (line at front)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-robotWidth / 2 + 2, -robotHeight / 2 + 2);
      ctx.lineTo(robotWidth / 2 - 2, -robotHeight / 2 + 2);
      ctx.stroke();

      ctx.restore();
    }
  }, [costmap, canvasSize, showRobot, robotColor, getCostColor]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    ...style,
  };

  const canvasStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
  };

  if (!costmap) {
    return (
      <div ref={containerRef} style={containerStyle} className={className}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: '#666',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Waiting for costmap...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={canvasStyle}
      />
    </div>
  );
}
