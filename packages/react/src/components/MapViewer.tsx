import React, { useEffect, useRef, useState, useCallback, CSSProperties } from 'react';
import type { MapData, RobotPose, NavPath, NavGoal } from '@adamo/adamo-core';

export interface MapViewerProps {
  /** Map data from Nav2 */
  map: MapData | null;
  /** Current robot pose */
  robotPose?: RobotPose | null;
  /** Navigation path */
  path?: NavPath | null;
  /** Whether to show the robot icon */
  showRobot?: boolean;
  /** Whether to show the navigation path */
  showPath?: boolean;
  /** Called when user clicks on the map to set a goal */
  onGoalClick?: (goal: NavGoal) => void;
  /** CSS class name for the container */
  className?: string;
  /** Inline styles for the container */
  style?: CSSProperties;
  /** Robot icon color */
  robotColor?: string;
  /** Path line color */
  pathColor?: string;
  /** Goal marker color */
  goalColor?: string;
}

/**
 * MapViewer - Canvas-based Nav2 map visualization
 *
 * Displays an occupancy grid map with robot position and navigation path.
 * Click on the map to send navigation goals.
 *
 * @example
 * ```tsx
 * function NavigationPanel() {
 *   const { map, robotPose, path, sendGoal } = useNav();
 *
 *   return (
 *     <MapViewer
 *       map={map}
 *       robotPose={robotPose}
 *       path={path}
 *       showRobot
 *       showPath
 *       onGoalClick={sendGoal}
 *     />
 *   );
 * }
 * ```
 */
export function MapViewer({
  map,
  robotPose,
  path,
  showRobot = true,
  showPath = true,
  onGoalClick,
  className,
  style,
  robotColor = '#00ff00',
  pathColor = '#0088ff',
  goalColor = '#ff4444',
}: MapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapImageDataRef = useRef<ImageData | null>(null);
  const [pendingGoal, setPendingGoal] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Convert occupancy grid to ImageData when map changes
  useEffect(() => {
    if (!map) {
      mapImageDataRef.current = null;
      return;
    }

    // Create ImageData from occupancy grid
    const imageData = new ImageData(map.width, map.height);
    const pixels = imageData.data;

    for (let i = 0; i < map.data.length; i++) {
      const value = map.data[i];
      const pixelIndex = i * 4;

      if (value === -1) {
        // Unknown - dark gray
        pixels[pixelIndex] = 128;     // R
        pixels[pixelIndex + 1] = 128; // G
        pixels[pixelIndex + 2] = 128; // B
        pixels[pixelIndex + 3] = 255; // A
      } else if (value === 0) {
        // Free - light gray/white
        pixels[pixelIndex] = 240;
        pixels[pixelIndex + 1] = 240;
        pixels[pixelIndex + 2] = 240;
        pixels[pixelIndex + 3] = 255;
      } else {
        // Occupied (100) - black
        pixels[pixelIndex] = 0;
        pixels[pixelIndex + 1] = 0;
        pixels[pixelIndex + 2] = 0;
        pixels[pixelIndex + 3] = 255;
      }
    }

    mapImageDataRef.current = imageData;
  }, [map]);

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

  // Convert map coordinates to canvas coordinates
  const mapToCanvas = useCallback(
    (mapX: number, mapY: number): { x: number; y: number } | null => {
      if (!map || !canvasSize.width || !canvasSize.height) return null;

      // Calculate scale to fit map in canvas while maintaining aspect ratio
      const scaleX = canvasSize.width / map.width;
      const scaleY = canvasSize.height / map.height;
      const scale = Math.min(scaleX, scaleY);

      // Center the map
      const offsetX = (canvasSize.width - map.width * scale) / 2;
      const offsetY = (canvasSize.height - map.height * scale) / 2;

      // Convert world coords to pixel coords
      // Map origin is bottom-left in ROS, but top-left in canvas
      const pixelX = (mapX - map.origin_x) / map.resolution;
      const pixelY = map.height - (mapY - map.origin_y) / map.resolution;

      return {
        x: offsetX + pixelX * scale,
        y: offsetY + pixelY * scale,
      };
    },
    [map, canvasSize]
  );

  // Convert canvas coordinates to map coordinates
  const canvasToMap = useCallback(
    (canvasX: number, canvasY: number): { x: number; y: number } | null => {
      if (!map || !canvasSize.width || !canvasSize.height) return null;

      // Calculate scale
      const scaleX = canvasSize.width / map.width;
      const scaleY = canvasSize.height / map.height;
      const scale = Math.min(scaleX, scaleY);

      // Center offset
      const offsetX = (canvasSize.width - map.width * scale) / 2;
      const offsetY = (canvasSize.height - map.height * scale) / 2;

      // Convert canvas coords to pixel coords
      const pixelX = (canvasX - offsetX) / scale;
      const pixelY = (canvasY - offsetY) / scale;

      // Convert pixel coords to world coords
      const mapX = pixelX * map.resolution + map.origin_x;
      const mapY = (map.height - pixelY) * map.resolution + map.origin_y;

      return { x: mapX, y: mapY };
    },
    [map, canvasSize]
  );

  // Draw the map
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw map from ImageData
    const mapImageData = mapImageDataRef.current;
    if (mapImageData && map) {
      // Calculate scale to fit
      const scaleX = canvasSize.width / map.width;
      const scaleY = canvasSize.height / map.height;
      const scale = Math.min(scaleX, scaleY);

      const drawWidth = map.width * scale;
      const drawHeight = map.height * scale;
      const offsetX = (canvasSize.width - drawWidth) / 2;
      const offsetY = (canvasSize.height - drawHeight) / 2;

      // Create temporary canvas for the map image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = map.width;
      tempCanvas.height = map.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(mapImageData, 0, 0);
        // Disable image smoothing for crisp voxel rendering
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);
      }
    }

    // Draw path
    if (showPath && path && path.poses.length > 1) {
      ctx.strokeStyle = pathColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      for (let i = 0; i < path.poses.length; i++) {
        const pos = mapToCanvas(path.poses[i].x, path.poses[i].y);
        if (!pos) continue;

        if (i === 0) {
          ctx.moveTo(pos.x, pos.y);
        } else {
          ctx.lineTo(pos.x, pos.y);
        }
      }
      ctx.stroke();
    }

    // Draw pending goal marker
    if (pendingGoal) {
      const goalPos = mapToCanvas(pendingGoal.x, pendingGoal.y);
      if (goalPos) {
        ctx.fillStyle = goalColor;
        ctx.beginPath();
        ctx.arc(goalPos.x, goalPos.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw X marker
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(goalPos.x - 4, goalPos.y - 4);
        ctx.lineTo(goalPos.x + 4, goalPos.y + 4);
        ctx.moveTo(goalPos.x + 4, goalPos.y - 4);
        ctx.lineTo(goalPos.x - 4, goalPos.y + 4);
        ctx.stroke();
      }
    }

    // Draw robot
    if (showRobot && robotPose) {
      const robotPos = mapToCanvas(robotPose.x, robotPose.y);
      if (robotPos) {
        const size = 12;
        const angle = robotPose.theta;

        ctx.save();
        ctx.translate(robotPos.x, robotPos.y);
        ctx.rotate(-angle + Math.PI / 2); // Adjust for canvas coordinate system

        // Draw arrow/triangle pointing in direction of travel
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.moveTo(0, -size); // Front tip
        ctx.lineTo(-size * 0.6, size * 0.6); // Back left
        ctx.lineTo(size * 0.6, size * 0.6); // Back right
        ctx.closePath();
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
    }
  }, [map, robotPose, path, showRobot, showPath, pendingGoal, canvasSize, mapToCanvas, robotColor, pathColor, goalColor]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // Handle click to set goal
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onGoalClick || !map) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const mapCoords = canvasToMap(canvasX, canvasY);
      if (!mapCoords) return;

      // Calculate theta to face the goal from current position
      let theta = 0;
      if (robotPose) {
        theta = Math.atan2(mapCoords.y - robotPose.y, mapCoords.x - robotPose.x);
      }

      const goal: NavGoal = {
        x: mapCoords.x,
        y: mapCoords.y,
        theta,
      };

      setPendingGoal(mapCoords);
      onGoalClick(goal);

      // Clear pending goal after a delay
      setTimeout(() => setPendingGoal(null), 3000);
    },
    [onGoalClick, map, canvasToMap, robotPose]
  );

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
    cursor: onGoalClick ? 'crosshair' : 'default',
  };

  if (!map) {
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
          Waiting for map data...
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
        onClick={handleClick}
      />
    </div>
  );
}
