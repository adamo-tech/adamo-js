'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTeleoperateContext } from '../context';

export interface XRPose {
  position: [number, number, number];
  quaternion: [number, number, number, number]; // [w, x, y, z]
}

export interface XRControllerData {
  handedness: XRHandedness;
  position: [number, number, number];
  quaternion: [number, number, number, number];
  buttons: { pressed: boolean; value: number }[];
  axes: number[];
}

export interface XRTrackingData {
  head?: XRPose;
  controller1?: XRControllerData; // right hand
  controller2?: XRControllerData; // left hand
  timestamp: number;
}

export interface UseXRTrackingConfig {
  /** Whether to automatically send tracking data to robot */
  autoSend?: boolean;
  /** Callback when tracking data is updated */
  onTrackingUpdate?: (data: XRTrackingData) => void;
}

export interface UseXRTrackingReturn {
  /** Whether XR is supported */
  isSupported: boolean | null;
  /** Whether currently tracking */
  isTracking: boolean;
  /** Latest tracking data */
  trackingData: XRTrackingData | null;
  /** Start XR tracking session */
  startTracking: () => Promise<void>;
  /** Stop XR tracking session */
  stopTracking: () => void;
}

/**
 * Hook for capturing XR pose data without rendering
 *
 * Starts an immersive-vr session to capture head and controller poses,
 * sending them to the robot via the data channel.
 *
 * @example
 * ```tsx
 * function TrackingOnly() {
 *   const { isTracking, trackingData, startTracking, stopTracking } = useXRTracking();
 *
 *   return (
 *     <div>
 *       <button onClick={isTracking ? stopTracking : startTracking}>
 *         {isTracking ? 'Stop Tracking' : 'Start Tracking'}
 *       </button>
 *       {trackingData?.head && (
 *         <p>Head: {trackingData.head.position.join(', ')}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useXRTracking(config: UseXRTrackingConfig = {}): UseXRTrackingReturn {
  const { autoSend = true, onTrackingUpdate } = config;
  const { client, dataChannelOpen } = useTeleoperateContext();

  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<XRTrackingData | null>(null);

  const sessionRef = useRef<XRSession | null>(null);
  const inputSourcesRef = useRef<XRInputSource[]>([]);
  const refSpaceRef = useRef<XRReferenceSpace | null>(null);

  // Check XR support
  useEffect(() => {
    navigator.xr?.isSessionSupported('immersive-vr').then(setIsSupported);
  }, []);

  const stopTracking = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.end();
      sessionRef.current = null;
      refSpaceRef.current = null;
      inputSourcesRef.current = [];
      setIsTracking(false);
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (!navigator.xr || sessionRef.current) return;

    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
      });
      sessionRef.current = session;
      setIsTracking(true);

      session.addEventListener('end', () => {
        sessionRef.current = null;
        refSpaceRef.current = null;
        inputSourcesRef.current = [];
        setIsTracking(false);
      });

      session.addEventListener('inputsourceschange', () => {
        inputSourcesRef.current = Array.from(session.inputSources);
      });
      inputSourcesRef.current = Array.from(session.inputSources);

      const refSpace = await session.requestReferenceSpace('local-floor');
      refSpaceRef.current = refSpace;

      // Minimal WebGL context just to keep session alive
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2', { xrCompatible: true });
      if (gl) {
        const layer = new XRWebGLLayer(session, gl);
        await session.updateRenderState({ baseLayer: layer });
      }

      const onFrame = (_: number, frame: XRFrame) => {
        if (!sessionRef.current || !refSpaceRef.current) return;
        session.requestAnimationFrame(onFrame);

        const pose = frame.getViewerPose(refSpaceRef.current);
        if (!pose) return;

        const data: XRTrackingData = {
          timestamp: Date.now(),
        };

        // Head pose
        const headPos = pose.transform.position;
        const headRot = pose.transform.orientation;
        data.head = {
          position: [headPos.x, headPos.y, headPos.z],
          quaternion: [headRot.w, headRot.x, headRot.y, headRot.z],
        };

        // Controller poses
        for (const inputSource of inputSourcesRef.current) {
          if (inputSource.gripSpace) {
            const gripPose = frame.getPose(inputSource.gripSpace, refSpaceRef.current);
            if (gripPose) {
              const pos = gripPose.transform.position;
              const rot = gripPose.transform.orientation;
              const gamepad = inputSource.gamepad;

              const controllerData: XRControllerData = {
                handedness: inputSource.handedness,
                position: [pos.x, pos.y, pos.z],
                quaternion: [rot.w, rot.x, rot.y, rot.z],
                buttons: gamepad
                  ? gamepad.buttons.map((b) => ({ pressed: b.pressed, value: b.value }))
                  : [],
                axes: gamepad ? Array.from(gamepad.axes) : [],
              };

              if (inputSource.handedness === 'right') {
                data.controller1 = controllerData;
              } else if (inputSource.handedness === 'left') {
                data.controller2 = controllerData;
              }
            }
          }
        }

        setTrackingData(data);
        onTrackingUpdate?.(data);

        // Send to robot if enabled
        if (autoSend && client && dataChannelOpen) {
          client.sendControl(data as Parameters<typeof client.sendControl>[0]);
        }
      };

      session.requestAnimationFrame(onFrame);
    } catch (error) {
      console.error('[useXRTracking] Failed to start session:', error);
      throw error;
    }
  }, [autoSend, client, dataChannelOpen, onTrackingUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.end();
      }
    };
  }, []);

  return {
    isSupported,
    isTracking,
    trackingData,
    startTracking,
    stopTracking,
  };
}

export default useXRTracking;
