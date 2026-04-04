'use client';

import { useCallback, useRef, useState } from 'react';
import { VideoFeed, useJsonPublisher } from '@adamo-tech/react';

type VideoClickMessage = {
  track: string;
  u: number; // normalized x coordinate (0..1)
  v: number; // normalized y coordinate (0..1)
  stamp: number;
};

type ClickableVideoFeedProps = {
  topic: string;
  style?: React.CSSProperties;
};

/**
 * ClickableVideoFeed — wraps VideoFeed and publishes click coordinates.
 *
 * Publishes normalized (0..1) coords in video-intrinsic space (not DOM pixels)
 * on the "video_click" data channel topic, along with the track name.
 *
 * Shows a transient ripple at the click location.
 */
export function ClickableVideoFeed({ topic, style }: ClickableVideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const publish = useJsonPublisher<VideoClickMessage>('video_click');
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const rippleKeyRef = useRef(0);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Normalized coordinates in the container (DOM) space.
      // Note: this assumes the video fills the container with object-fit: cover/fill.
      // If the video uses object-fit: contain, these coords may need adjustment
      // for letterboxing on the backend side.
      const u = (e.clientX - rect.left) / rect.width;
      const v = (e.clientY - rect.top) / rect.height;

      publish({ track: topic, u, v, stamp: Date.now() });

      // Show ripple at click location
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      rippleKeyRef.current += 1;
      setRipple({ x: localX, y: localY, key: rippleKeyRef.current });
    },
    [publish, topic]
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="absolute inset-0 cursor-crosshair"
    >
      <VideoFeed topic={topic} style={style} />
      {ripple && (
        <Ripple
          key={ripple.key}
          x={ripple.x}
          y={ripple.y}
          onDone={() => setRipple(null)}
        />
      )}
    </div>
  );
}

function Ripple({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  return (
    <span
      onAnimationEnd={onDone}
      className="pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
      style={{
        left: x,
        top: y,
        animation: 'videoClickRipple 500ms ease-out forwards',
      }}
    />
  );
}
