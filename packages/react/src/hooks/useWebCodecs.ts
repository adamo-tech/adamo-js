import { useEffect, useState, useCallback, useRef } from 'react';
import type { DecodedVideoFrame } from '@adamo-tech/core';
import { isWebCodecsSupported } from '@adamo-tech/core';
import { useTeleoperateContext } from '../context';

/**
 * Hook for WebCodecs ultra-low-latency video decoding
 *
 * When enabled, video is decoded via a Worker for ~5-17ms decode latency,
 * significantly lower than the browser's built-in decoder.
 *
 * @returns WebCodecs state and controls
 *
 * @example
 * ```tsx
 * function UltraLowLatencyVideo() {
 *   const canvasRef = useRef<HTMLCanvasElement>(null);
 *   const { isSupported, enabled, enable, latestFrame } = useWebCodecs();
 *
 *   // Enable on mount
 *   useEffect(() => {
 *     if (isSupported && !enabled) {
 *       enable();
 *     }
 *   }, [isSupported, enabled, enable]);
 *
 *   // Draw frames to canvas
 *   useEffect(() => {
 *     if (latestFrame && canvasRef.current) {
 *       const ctx = canvasRef.current.getContext('2d');
 *       if (ctx) {
 *         ctx.drawImage(latestFrame.frame, 0, 0);
 *         latestFrame.frame.close();
 *       }
 *     }
 *   }, [latestFrame]);
 *
 *   if (!isSupported) {
 *     return <p>WebCodecs not supported in this browser</p>;
 *   }
 *
 *   return <canvas ref={canvasRef} width={1920} height={1080} />;
 * }
 * ```
 */
export function useWebCodecs(): {
  /** Whether WebCodecs is supported in this browser */
  isSupported: boolean;
  /** Whether WebCodecs decoding is currently enabled */
  enabled: boolean;
  /** Enable WebCodecs decoding */
  enable: () => void;
  /** Disable WebCodecs decoding */
  disable: () => void;
  /** Latest decoded video frame (must call frame.close() after use) */
  latestFrame: DecodedVideoFrame | null;
} {
  const { client, connectionState } = useTeleoperateContext();
  const [enabled, setEnabled] = useState(false);
  const [latestFrame, setLatestFrame] = useState<DecodedVideoFrame | null>(null);
  const frameRef = useRef<DecodedVideoFrame | null>(null);

  // Check browser support
  const isSupported = isWebCodecsSupported();

  // Enable WebCodecs
  const enable = useCallback(() => {
    if (client && !enabled) {
      client.enableWebCodecs();
      setEnabled(true);
    }
  }, [client, enabled]);

  // Disable WebCodecs
  const disable = useCallback(() => {
    if (client && enabled) {
      client.disableWebCodecs();
      setEnabled(false);
      setLatestFrame(null);
    }
  }, [client, enabled]);

  // Subscribe to decoded frames
  useEffect(() => {
    if (!client || !enabled || connectionState !== 'connected') {
      return;
    }

    const unsubscribe = client.onDecodedFrame((frame) => {
      // Close previous frame if not consumed
      if (frameRef.current) {
        try {
          frameRef.current.frame.close();
        } catch {
          // Frame may already be closed
        }
      }

      frameRef.current = frame;
      setLatestFrame(frame);
    });

    return () => {
      unsubscribe();
      // Clean up last frame
      if (frameRef.current) {
        try {
          frameRef.current.frame.close();
        } catch {
          // Frame may already be closed
        }
        frameRef.current = null;
      }
      setLatestFrame(null);
    };
  }, [client, enabled, connectionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        try {
          frameRef.current.frame.close();
        } catch {
          // Frame may already be closed
        }
      }
    };
  }, []);

  return {
    isSupported,
    enabled,
    enable,
    disable,
    latestFrame,
  };
}
