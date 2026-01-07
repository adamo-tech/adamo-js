'use client';

import { useEffect, useMemo } from 'react';
import { useTeleoperateContext } from '../context';
import { VideoFeed } from './VideoFeed';

/**
 * Configuration for a single video track
 */
export interface TrackConfig {
  /** Display label for this track */
  label?: string;
  /** Whether to mirror the video horizontally */
  mirror?: boolean;
}

/**
 * Video track type (for backwards compatibility)
 */
export type VideoType = 'regular' | 'xr_stereo';

/**
 * Props for AutoVideoLayout component
 */
export interface AutoVideoLayoutProps {
  /**
   * Optional configuration mapping track names to their config.
   *
   * @example
   * ```tsx
   * <AutoVideoLayout
   *   trackConfig={{
   *     front_camera: { label: 'Front' },
   *     rear_camera: { label: 'Rear', mirror: true },
   *   }}
   * />
   * ```
   */
  trackConfig?: Record<string, TrackConfig>;

  /**
   * Callback when available tracks change
   */
  onTracksChange?: (trackNames: string[]) => void;

  /**
   * Custom render function for video feeds.
   * If not provided, uses default VideoFeed component.
   */
  renderVideoFeed?: (trackName: string, config: TrackConfig) => React.ReactNode;

  /**
   * Layout mode for video feeds
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
 * AutoVideoLayout - Automatic video feed detection and display
 *
 * Automatically detects available video tracks and displays them in a grid.
 *
 * @example Basic usage
 * ```tsx
 * <Teleoperate {...config}>
 *   <AutoVideoLayout />
 * </Teleoperate>
 * ```
 *
 * @example With labels
 * ```tsx
 * <AutoVideoLayout
 *   trackConfig={{
 *     front_camera: { label: 'Front Camera' },
 *     rear_camera: { label: 'Rear', mirror: true },
 *   }}
 * />
 * ```
 */
export function AutoVideoLayout({
  trackConfig,
  onTracksChange,
  renderVideoFeed,
  layout = 'grid',
  showLabels = true,
  className,
  style,
}: AutoVideoLayoutProps) {
  const { videoTracks } = useTeleoperateContext();

  const trackNames = useMemo(
    () => Array.from(videoTracks.keys()),
    [videoTracks]
  );

  useEffect(() => {
    onTracksChange?.(trackNames);
  }, [trackNames, onTracksChange]);

  const gridStyle = useMemo((): React.CSSProperties => {
    const count = trackNames.length;
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

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gap: '8px',
    };
  }, [trackNames.length, layout]);

  if (trackNames.length === 0) {
    return (
      <div className={className} style={{ ...emptyStyle, ...style }}>
        <div style={emptyTextStyle}>Waiting for video tracks...</div>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...gridStyle, ...style }}>
      {trackNames.map((name) => {
        const config = trackConfig?.[name] ?? {};

        if (renderVideoFeed) {
          return renderVideoFeed(name, config);
        }

        return (
          <div key={name} style={cellStyle}>
            <VideoFeed
              trackName={name}
              style={config.mirror ? { transform: 'scaleX(-1)' } : undefined}
            />
            {showLabels && (
              <div style={labelStyle}>{config.label ?? name}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
