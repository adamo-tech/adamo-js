import React, { useEffect, useRef, useCallback, CSSProperties } from 'react';
import { useVideoTrack } from '../hooks/useVideoTrack';

export interface VideoFeedProps {
  /** Track name/topic to display (e.g., 'front_camera'). If not specified, shows the first available track. */
  trackName?: string;
  /** @deprecated Use trackName instead */
  topic?: string;
  /** CSS class name for the video element */
  className?: string;
  /** Inline styles for the video element */
  style?: CSSProperties;
  /** Whether to mirror the video horizontally */
  mirror?: boolean;
  /** Called when the video starts playing */
  onPlay?: () => void;
  /** Called when the video dimensions change */
  onResize?: (width: number, height: number) => void;
  /** Custom placeholder to show while loading */
  placeholder?: React.ReactNode;
  /** Whether to show a label overlay */
  showLabel?: boolean;
  /** Custom label text (defaults to track name) */
  label?: string;
}

/**
 * VideoFeed - Declarative video feed component
 *
 * Displays the video feed from the robot. Drop this inside Teleoperate
 * to display video from the server.
 *
 * @example
 * ```tsx
 * // Display the first available video track
 * <Teleoperate signaling={...} autoConnect>
 *   <VideoFeed />
 * </Teleoperate>
 *
 * // Display a specific camera by name/topic
 * <Teleoperate signaling={...} autoConnect>
 *   <VideoFeed trackName="front_camera" showLabel />
 *   <VideoFeed trackName="rear_camera" showLabel />
 * </Teleoperate>
 * ```
 */
export function VideoFeed({
  trackName,
  topic, // deprecated alias
  className,
  style,
  mirror = false,
  onPlay,
  onResize,
  placeholder,
  showLabel = false,
  label,
}: VideoFeedProps) {
  // Support deprecated 'topic' prop
  const resolvedTrackName = trackName || topic;
  const { track, videoRef: setVideoRef } = useVideoTrack(resolvedTrackName);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Combined ref callback - must be before any conditional returns
  const videoRef = useCallback(
    (element: HTMLVideoElement | null) => {
      videoElementRef.current = element;
      if (element) {
        element.muted = true; // Ensure muted for autoplay

        // Low-latency optimizations
        // Disable default buffering behavior
        element.preload = 'none';

        // Hint to browser we want low latency (Chrome)
        if ('latencyHint' in element) {
          (element as unknown as { latencyHint: string }).latencyHint = 'interactive';
        }

        // Disable any picture-in-picture which can add processing
        if ('disablePictureInPicture' in element) {
          element.disablePictureInPicture = true;
        }

        // Disable remote playback (Chromecast etc) which adds latency
        if ('disableRemotePlayback' in element) {
          (element as unknown as { disableRemotePlayback: boolean }).disableRemotePlayback = true;
        }
      }
      setVideoRef(element);
    },
    [setVideoRef]
  );

  // Handle video events
  useEffect(() => {
    const video = videoElementRef.current;
    if (!video) return;

    const handlePlay = () => {
      onPlay?.();
    };

    const handleResize = () => {
      onResize?.(video.videoWidth, video.videoHeight);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('resize', handleResize);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('resize', handleResize);
    };
  }, [onPlay, onResize, track]);

  const videoStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: mirror ? 'scaleX(-1)' : undefined,
    ...style,
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  };

  const labelStyle: CSSProperties = {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: '4px 8px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    fontSize: '12px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    borderRadius: '4px',
    pointerEvents: 'none',
  };

  if (!track) {
    return (
      <div ref={containerRef} style={containerStyle} className={className}>
        {placeholder || (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              color: '#666',
              fontSize: '14px',
            }}
          >
            Waiting for video...
          </div>
        )}
      </div>
    );
  }

  // Default label to track name if not provided
  const displayLabel = label || track?.name;

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      <video ref={videoRef} autoPlay playsInline muted style={videoStyle} />
      {showLabel && displayLabel && <span style={labelStyle}>{displayLabel}</span>}
    </div>
  );
}

// Backwards compatibility alias
/** @deprecated Use VideoFeed instead */
export const CameraFeed = VideoFeed;
/** @deprecated Use VideoFeedProps instead */
export type CameraFeedProps = VideoFeedProps;
