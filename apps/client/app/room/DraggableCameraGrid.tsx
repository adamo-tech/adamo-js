'use client';

import { useEffect, useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { VideoFeed } from '@adamo/adamo-react';
import './draggable-grid.css';

interface DraggableCameraGridProps {
  topics: string[];
}

interface VideoLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VideoLayouts {
  [topic: string]: VideoLayout;
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
const CASCADE_OFFSET = 30;

export function DraggableCameraGrid({ topics }: DraggableCameraGridProps) {
  const [layouts, setLayouts] = useState<VideoLayouts>({});
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate default position for a new video (cascading)
  const getDefaultPosition = useCallback((index: number): VideoLayout => {
    const offset = (index * CASCADE_OFFSET) % 200;
    return {
      x: 50 + offset,
      y: 50 + offset,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    };
  }, []);

  // Update layouts when topics change
  useEffect(() => {
    if (!mounted) return;

    // Load saved layouts from localStorage
    const savedLayouts = localStorage.getItem('videoLayouts');
    let newLayouts: VideoLayouts = {};

    if (savedLayouts) {
      try {
        const parsed = JSON.parse(savedLayouts) as VideoLayouts;
        // Keep layouts for existing topics
        topics.forEach((topic) => {
          if (parsed[topic]) {
            newLayouts[topic] = parsed[topic];
          }
        });
      } catch (e) {
        console.error('Failed to parse saved layouts:', e);
      }
    }

    // Add default layouts for new topics
    topics.forEach((topic, index) => {
      if (!newLayouts[topic]) {
        newLayouts[topic] = getDefaultPosition(index);
      }
    });

    setLayouts(newLayouts);
  }, [topics, mounted, getDefaultPosition]);

  // Save layouts to localStorage whenever they change
  useEffect(() => {
    if (!mounted || Object.keys(layouts).length === 0) return;
    localStorage.setItem('videoLayouts', JSON.stringify(layouts));
  }, [layouts, mounted]);

  // Handle drag stop
  const handleDragStop = useCallback((topic: string, d: { x: number; y: number }) => {
    setLayouts((prev) => ({
      ...prev,
      [topic]: {
        ...prev[topic],
        x: d.x,
        y: d.y,
      },
    }));
  }, []);

  // Handle resize stop
  const handleResizeStop = useCallback(
    (topic: string, ref: HTMLElement, position: { x: number; y: number }) => {
      setLayouts((prev) => ({
        ...prev,
        [topic]: {
          x: position.x,
          y: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        },
      }));
    },
    []
  );

  // Calculate z-index based on area (smaller = higher z-index = on top)
  const calculateZIndex = useCallback(
    (topic: string): number => {
      const layout = layouts[topic];
      if (!layout) return 1;

      const area = layout.width * layout.height;

      // Get all areas and sort them largest first
      const allAreas = Object.values(layouts)
        .map((l) => l.width * l.height)
        .sort((a, b) => b - a);

      // Find index: 0=largest, length-1=smallest
      const index = allAreas.indexOf(area);

      // Return z-index: index 0 (largest) gets z-index 1 (bottom)
      return index + 1;
    },
    [layouts]
  );

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || topics.length === 0) {
    return (
      <div style={{ height: 'calc(100vh - var(--lk-control-bar-height, 0px))' }}>
        <div className="flex items-center justify-center h-full text-gray-400">
          Waiting for camera feeds...
        </div>
      </div>
    );
  }

  return (
    <div className="floating-video-container">
      {topics.map((topic) => {
        const layout = layouts[topic];
        if (!layout) return null;

        return (
          <Rnd
            key={topic}
            position={{ x: layout.x, y: layout.y }}
            size={{ width: layout.width, height: layout.height }}
            onDragStop={(e, d) => handleDragStop(topic, d)}
            onResizeStop={(e, direction, ref, delta, position) => {
              handleResizeStop(topic, ref, position);
            }}
            minWidth={200}
            minHeight={150}
            bounds="parent"
            dragHandleClassName="video-drag-handle"
            style={{
              zIndex: calculateZIndex(topic),
            }}
            className="floating-video-tile"
            enableResizing={{
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }}
          >
            <div className="video-content">
              <div className="video-drag-handle">
                <div className="drag-indicator">
                  <span className="participant-name">{topic}</span>
                  <span className="drag-icon">⋮⋮</span>
                </div>
              </div>
              <div className="video-wrapper">
                <VideoFeed topic={topic} />
              </div>
            </div>
          </Rnd>
        );
      })}
    </div>
  );
}
