'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { VideoTrack } from '@adamo-tech/core';
import { useTeleoperateContext } from '../context';
import { VideoFeed } from './VideoFeed';
import { XRTeleop } from './XRTeleop';

/**
 * Video track type - determines how the track is rendered
 */
export type VideoType = 'regular' | 'xr_stereo';

/**
 * Configuration for a single video track
 */
export interface TrackConfig {
  /** Display label for this track */
  label?: string;
  /** Video type - 'regular' for standard video, 'xr_stereo' for VR stereo */
  type?: VideoType;
  /** Whether to mirror the video horizontally */
  mirror?: boolean;
}

/**
 * Props for AutoVideoLayout component
 */
export interface AutoVideoLayoutProps {
  /**
   * Optional configuration mapping track names to their config.
   * If not provided, tracks will be auto-detected with type inferred from dimensions.
   *
   * @example
   * ```tsx
   * <AutoVideoLayout
   *   trackConfig={{
   *     zed_video: { type: 'xr_stereo', label: 'VR View' },
   *     front_camera: { type: 'regular', label: 'Front' },
   *   }}
   * />
   * ```
   */
  trackConfig?: Record<string, TrackConfig>;

  /**
   * Whether to auto-detect XR tracks based on video dimensions.
   * When true, tracks with height > width are assumed to be stereo (stacked vertically).
   * @default true
   */
  autoDetectXR?: boolean;

  /**
   * Callback when available tracks change
   */
  onTracksChange?: (trackNames: string[]) => void;

  /**
   * Custom render function for regular video feeds.
   * If not provided, uses default VideoFeed component.
   */
  renderVideoFeed?: (trackName: string, config: TrackConfig) => React.ReactNode;

  /**
   * Custom render function for XR video feeds.
   * If not provided, uses default XRTeleop component.
   */
  renderXRFeed?: (trackName: string, config: TrackConfig) => React.ReactNode;

  /**
   * Layout mode for multiple regular video feeds
   * - 'grid': Automatic grid layout (default)
   * - 'horizontal': Single row
   * - 'vertical': Single column
   * @default 'grid'
   */
  layout?: 'grid' | 'horizontal' | 'vertical';

  /**
   * Show track labels on video feeds
   * @default true
   */
  showLabels?: boolean;

  /**
   * Container className
   */
  className?: string;

  /**
   * Container style
   */
  style?: React.CSSProperties;
}

/**
 * Track with detected metadata
 */
interface DetectedTrack {
  name: string;
  type: VideoType;
  config: TrackConfig;
  track: VideoTrack | null;
}

/**
 * AutoVideoLayout - Automatic video feed detection and display
 *
 * Automatically detects available video tracks from the robot and renders them
 * as either XR stereo views or regular video feeds based on configuration or
 * auto-detection from video dimensions.
 *
 * @example Basic usage - auto-detect all tracks
 * ```tsx
 * <Teleoperate {...config}>
 *   <AutoVideoLayout />
 * </Teleoperate>
 * ```
 *
 * @example With explicit track configuration
 * ```tsx
 * <Teleoperate {...config}>
 *   <AutoVideoLayout
 *     trackConfig={{
 *       zed_video: { type: 'xr_stereo', label: 'VR View' },
 *       front_camera: { type: 'regular', label: 'Front Camera' },
 *       rear_camera: { type: 'regular', label: 'Rear', mirror: true },
 *     }}
 *   />
 * </Teleoperate>
 * ```
 *
 * @example With custom rendering
 * ```tsx
 * <AutoVideoLayout
 *   renderVideoFeed={(trackName, config) => (
 *     <div className="custom-video-container">
 *       <VideoFeed trackName={trackName} />
 *       <span>{config.label}</span>
 *     </div>
 *   )}
 * />
 * ```
 */
export function AutoVideoLayout({
  trackConfig,
  autoDetectXR = true,
  onTracksChange,
  renderVideoFeed,
  renderXRFeed,
  layout = 'grid',
  showLabels = true,
  className,
  style,
}: AutoVideoLayoutProps) {
  const { videoTracks } = useTeleoperateContext();

  // Track detected dimensions for auto-detection
  const [trackDimensions, setTrackDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});

  // Get available track names
  const availableTrackNames = useMemo(
    () => Array.from(videoTracks.keys()),
    [videoTracks]
  );

  // Notify when tracks change
  useEffect(() => {
    onTracksChange?.(availableTrackNames);
  }, [availableTrackNames, onTracksChange]);

  // Monitor track dimensions for auto-detection
  useEffect(() => {
    if (!autoDetectXR) return;

    const handleDimensionUpdate = (trackName: string, track: VideoTrack) => {
      const mediaTrack = track.mediaStreamTrack;
      const settings = mediaTrack.getSettings();

      if (settings.width && settings.height) {
        setTrackDimensions((prev) => ({
          ...prev,
          [trackName]: { width: settings.width!, height: settings.height! },
        }));
      }
    };

    // Check dimensions for all current tracks
    videoTracks.forEach((track, name) => {
      handleDimensionUpdate(name, track);
    });
  }, [videoTracks, autoDetectXR]);

  // Detect track type from dimensions
  const detectTrackType = useCallback(
    (trackName: string): VideoType => {
      // If explicit config provided, use it
      if (trackConfig?.[trackName]?.type) {
        return trackConfig[trackName].type!;
      }

      // Auto-detect from dimensions if enabled
      if (autoDetectXR) {
        const dims = trackDimensions[trackName];
        if (dims && dims.height > dims.width) {
          // Height > width suggests stereo stacked vertically (e.g., 1920x2160)
          return 'xr_stereo';
        }
      }

      // Default to regular
      return 'regular';
    },
    [trackConfig, autoDetectXR, trackDimensions]
  );

  // Build detected tracks with metadata
  const detectedTracks: DetectedTrack[] = useMemo(() => {
    return availableTrackNames.map((name) => ({
      name,
      type: detectTrackType(name),
      config: trackConfig?.[name] ?? {},
      track: videoTracks.get(name) ?? null,
    }));
  }, [availableTrackNames, detectTrackType, trackConfig, videoTracks]);

  // Separate XR and regular tracks
  const xrTracks = useMemo(
    () => detectedTracks.filter((t) => t.type === 'xr_stereo'),
    [detectedTracks]
  );
  const regularTracks = useMemo(
    () => detectedTracks.filter((t) => t.type === 'regular'),
    [detectedTracks]
  );

  // Calculate grid dimensions for regular tracks
  const gridStyle = useMemo((): React.CSSProperties => {
    const count = regularTracks.length;
    if (count === 0) return {};

    if (layout === 'horizontal') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: '8px',
      };
    }

    if (layout === 'vertical') {
      return {
        display: 'grid',
        gridTemplateRows: `repeat(${count}, 1fr)`,
        gap: '8px',
      };
    }

    // Auto grid
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gap: '8px',
    };
  }, [regularTracks.length, layout]);

  // Render a regular video feed
  const renderRegularFeed = (detected: DetectedTrack) => {
    if (renderVideoFeed) {
      return renderVideoFeed(detected.name, detected.config);
    }

    return (
      <div key={detected.name} style={cellStyle}>
        <VideoFeed
          trackName={detected.name}
          style={detected.config.mirror ? { transform: 'scaleX(-1)' } : undefined}
        />
        {showLabels && (
          <div style={labelStyle}>
            {detected.config.label ?? detected.name}
          </div>
        )}
      </div>
    );
  };

  // Render an XR video feed
  const renderXR = (detected: DetectedTrack) => {
    if (renderXRFeed) {
      return renderXRFeed(detected.name, detected.config);
    }

    return (
      <div key={detected.name} style={xrContainerStyle}>
        {showLabels && (
          <div style={xrLabelStyle}>
            {detected.config.label ?? `${detected.name} (XR)`}
          </div>
        )}
        <XRTeleop />
      </div>
    );
  };

  // Empty state
  if (detectedTracks.length === 0) {
    return (
      <div className={className} style={{ ...emptyStyle, ...style }}>
        <div style={emptyTextStyle}>Waiting for video tracks...</div>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      {/* XR tracks get full-width rendering at the top */}
      {xrTracks.map(renderXR)}

      {/* Regular tracks in a grid */}
      {regularTracks.length > 0 && (
        <div style={gridStyle}>{regularTracks.map(renderRegularFeed)}</div>
      )}
    </div>
  );
}

// Styles
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const cellStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '200px',
  backgroundColor: '#000',
  borderRadius: '8px',
  overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 8,
  left: 8,
  padding: '4px 8px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: '#fff',
  fontSize: 12,
  borderRadius: 4,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  pointerEvents: 'none',
};

const xrContainerStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#111',
  borderRadius: '8px',
  padding: '16px',
};

const xrLabelStyle: React.CSSProperties = {
  marginBottom: '8px',
  color: '#fff',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const emptyStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#111',
  borderRadius: '8px',
};

const emptyTextStyle: React.CSSProperties = {
  color: '#666',
  fontSize: 14,
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

export default AutoVideoLayout;
