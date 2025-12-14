import { useEffect, useState, useRef, useCallback } from 'react';
import type { VideoTrack } from '@adamo-tech/core';
import { useAdamoContext } from '../context';

/**
 * Hook to subscribe to a video track by topic name
 *
 * @param topicName - The topic name to subscribe to (e.g., 'fork', 'front')
 * @returns The video track (if available) and a ref callback for the video element
 *
 * @example
 * ```tsx
 * function CameraView({ topic }: { topic: string }) {
 *   const { track, videoRef } = useVideoTrack(topic);
 *
 *   return (
 *     <div>
 *       {track ? (
 *         <video ref={videoRef} autoPlay playsInline muted />
 *       ) : (
 *         <p>Waiting for {topic}...</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useVideoTrack(topicName: string): {
  track: VideoTrack | null;
  videoRef: (element: HTMLVideoElement | null) => void;
} {
  const { client, connectionState } = useAdamoContext();
  const [track, setTrack] = useState<VideoTrack | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<VideoTrack | null>(null);

  // Keep trackRef in sync
  trackRef.current = track;

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

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      setTrack(null);
      return;
    }

    const unsubscribe = client.subscribe(topicName, (videoTrack) => {
      setTrack(videoTrack);

      // Attach to video element if already mounted
      if (videoElementRef.current && videoTrack.mediaStreamTrack) {
        const stream = new MediaStream([videoTrack.mediaStreamTrack]);
        videoElementRef.current.srcObject = stream;
      }
    });

    return () => {
      unsubscribe();
      setTrack(null);

      // Clean up video element
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = null;
      }
    };
  }, [client, connectionState, topicName]);

  // Re-attach stream when track changes and video element exists
  useEffect(() => {
    if (videoElementRef.current && track?.mediaStreamTrack) {
      const stream = new MediaStream([track.mediaStreamTrack]);
      videoElementRef.current.srcObject = stream;
    }
  }, [track]);

  return { track, videoRef };
}
