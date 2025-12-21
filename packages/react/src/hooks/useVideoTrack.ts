import { useEffect, useRef, useCallback, useMemo } from 'react';
import type { VideoTrack } from '@adamo-tech/core';
import { useTeleoperateContext } from '../context';

/**
 * Hook to access a video track and attach it to a video element
 *
 * @param trackName - Optional track name/topic (e.g., 'front_camera'). If not provided, returns the first available track.
 * @returns The video track (if available) and a ref callback for the video element
 *
 * @example
 * ```tsx
 * // Get the first available track
 * function CameraView() {
 *   const { track, videoRef } = useVideoTrack();
 *   return <video ref={videoRef} autoPlay playsInline muted />;
 * }
 *
 * // Get a specific track by name
 * function FrontCamera() {
 *   const { track, videoRef } = useVideoTrack('front_camera');
 *   return <video ref={videoRef} autoPlay playsInline muted />;
 * }
 * ```
 */
export function useVideoTrack(trackName?: string): {
  track: VideoTrack | null;
  videoRef: (element: HTMLVideoElement | null) => void;
  /** All available track names */
  availableTrackNames: string[];
} {
  const { videoTracks, videoTrack: firstTrack } = useTeleoperateContext();
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<VideoTrack | null>(null);

  // Get the requested track (by name or first track)
  const track = useMemo(() => {
    if (trackName) {
      return videoTracks.get(trackName) ?? null;
    }
    return firstTrack;
  }, [videoTracks, trackName, firstTrack]);

  // Keep trackRef in sync
  trackRef.current = track;

  // Get available track names
  const availableTrackNames = useMemo(() => Array.from(videoTracks.keys()), [videoTracks]);

  // Callback ref that attaches the stream when the video element is mounted
  const videoRef = useCallback((element: HTMLVideoElement | null) => {
    videoElementRef.current = element;

    if (element && trackRef.current?.mediaStreamTrack) {
      const stream = new MediaStream([trackRef.current.mediaStreamTrack]);
      element.srcObject = stream;

      // Wait for loadedmetadata before playing
      const handleLoadedMetadata = () => {
        element.play().catch((err) => {
          // Ignore AbortError from Strict Mode unmounts
          if (err.name !== 'AbortError') {
            console.error('Video play() failed:', err);
          }
        });
      };

      if (element.readyState >= 1) {
        handleLoadedMetadata();
      } else {
        element.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      }
    } else if (element) {
      element.srcObject = null;
    }
  }, []);

  // Re-attach stream when track changes and video element exists
  useEffect(() => {
    if (videoElementRef.current && track?.mediaStreamTrack) {
      const stream = new MediaStream([track.mediaStreamTrack]);
      videoElementRef.current.srcObject = stream;
    } else if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
  }, [track]);

  return { track, videoRef, availableTrackNames };
}
