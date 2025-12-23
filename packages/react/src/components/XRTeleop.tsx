'use client';

/**
 * XR Teleop - WebXR Stereo Rendering Component
 *
 * Handles XR session management and stereo rendering for VR teleoperation.
 * Uses HTMLVideoElement for lowest latency path to XR compositor.
 * Renders top/bottom stereo format from ZED camera.
 *
 * Must be used within a <Teleoperate> provider.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useTeleoperateContext } from '../context';

export interface XRTeleopProps {
  /** Called when entering VR */
  onEnterVR?: () => void;
  /** Called when exiting VR */
  onExitVR?: () => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Additional class name for the container */
  className?: string;
}

export function XRTeleop({
  onEnterVR,
  onExitVR,
  onError,
  className,
}: XRTeleopProps) {
  const { client, connectionState, videoTrack, dataChannelOpen } = useTeleoperateContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<XRSession | null>(null);
  const inputSourcesRef = useRef<XRInputSource[]>([]);

  const [inVR, setInVR] = useState(false);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);

  // Check XR support
  useEffect(() => {
    navigator.xr?.isSessionSupported('immersive-vr').then(setXrSupported);
  }, []);

  // Attach video track to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoTrack) return;

    video.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
    video.play().catch(console.error);
  }, [videoTrack]);

  const enterVR = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const gl = canvas.getContext('webgl2', { xrCompatible: true }) as WebGL2RenderingContext;

    const session = await navigator.xr!.requestSession('immersive-vr', {
      requiredFeatures: ['local-floor'],
    });
    sessionRef.current = session;
    setInVR(true);
    onEnterVR?.();

    session.addEventListener('end', () => {
      setInVR(false);
      sessionRef.current = null;
      inputSourcesRef.current = [];
      onExitVR?.();
    });

    // Track input sources (controllers)
    session.addEventListener('inputsourceschange', (event: XRInputSourcesChangeEvent) => {
      console.log('[XRTeleop] Input sources changed:', event.added.length, 'added,', event.removed.length, 'removed');
      inputSourcesRef.current = Array.from(session.inputSources);
    });
    inputSourcesRef.current = Array.from(session.inputSources);

    const refSpace = await session.requestReferenceSpace('local-floor');
    const layer = new XRWebGLLayer(session, gl);
    await session.updateRenderState({ baseLayer: layer });

    // Stereo shader for top/bottom stereo input
    // Top half = left eye, bottom half = right eye
    // Convergence offset shifts focal plane (positive = further away)
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, `#version 300 es
      in vec2 p;
      out vec2 uv;
      out float screenY;  // For letterbox detection
      uniform float yOff;  // 0.0 for left eye, 0.5 for right eye
      void main() {
        gl_Position = vec4(p, 0, 1);

        // Convergence: left eye negative, right eye positive
        float convergence = (yOff < 0.25) ? -0.1 : 0.1;

        // Screen Y position (0 at bottom, 1 at top)
        screenY = (p.y + 1.0) * 0.5;

        // ZED: 1280x720 (1.777 aspect), Quest: ~1680x1760 (~0.954 aspect)
        // Image takes 0.954/1.777 = 0.537 of viewport height
        float imageHeight = 0.537;
        float margin = (1.0 - imageHeight) * 0.5;  // ~0.23

        // Map screenY from [margin, 1-margin] to texture V [0, 0.5]
        float normalizedY = (screenY - margin) / imageHeight;
        float v = yOff + (1.0 - normalizedY) * 0.5;

        float u = (p.x + 1.0) * 0.5 + convergence;
        uv = vec2(u, v);
      }`);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, `#version 300 es
      precision highp float;
      in vec2 uv;
      in float screenY;
      out vec4 c;
      uniform sampler2D t;
      void main() {
        // Letterbox: black bars at top and bottom
        float imageHeight = 0.537;
        float margin = (1.0 - imageHeight) * 0.5;
        if (screenY < margin || screenY > (1.0 - margin)) {
          c = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          c = texture(t, uv);
        }
      }`);
    gl.compileShader(fs);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const yOffLoc = gl.getUniformLocation(prog, 'yOff');

    // Track latest video frame (updated async by video callback)
    let latestPresentedFrame = 0;
    let lastUploadedFrame = 0;

    const onVideoFrame = (_: number, meta: VideoFrameCallbackMetadata) => {
      if (!sessionRef.current) return;
      latestPresentedFrame = meta.presentedFrames;
      video.requestVideoFrameCallback(onVideoFrame);
    };
    video.requestVideoFrameCallback(onVideoFrame);

    // XR render loop - texture upload synchronized here to prevent eye mismatch
    const onXRFrame = (_: number, frame: XRFrame) => {
      if (!sessionRef.current) return;
      session.requestAnimationFrame(onXRFrame);

      // Upload texture BEFORE rendering either eye to ensure both see same frame
      // No gl.finish() - GPU command queue naturally serializes operations
      if (latestPresentedFrame !== lastUploadedFrame) {
        lastUploadedFrame = latestPresentedFrame;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }

      const pose = frame.getViewerPose(refSpace);
      if (!pose) return;

      // Capture and send controller input
      if (client && dataChannelOpen) {
        const controllerData: Record<string, unknown> = {};

        // Add head tracking data from viewer pose
        const headPos = pose.transform.position;
        const headRot = pose.transform.orientation;
        controllerData.head = {
          position: [headPos.x, headPos.y, headPos.z],
          quaternion: [headRot.w, headRot.x, headRot.y, headRot.z],
        };

        for (const inputSource of inputSourcesRef.current) {
          if (inputSource.gripSpace) {
            const gripPose = frame.getPose(inputSource.gripSpace, refSpace);
            if (gripPose) {
              const pos = gripPose.transform.position;
              const rot = gripPose.transform.orientation;
              const gamepad = inputSource.gamepad;

              // Build controller data in lerobot format
              const key = inputSource.handedness === 'right' ? 'controller1' : 'controller2';
              controllerData[key] = {
                handedness: inputSource.handedness,
                position: [pos.x, pos.y, pos.z],
                quaternion: [rot.w, rot.x, rot.y, rot.z],
                inputType: 'controller',
                // Map gamepad buttons - index 0 is trigger, index 1 is grip
                buttons: gamepad ? gamepad.buttons.map((b: GamepadButton) => ({
                  pressed: b.pressed,
                  value: b.value
                })) : [],
                // Include axes for thumbstick if needed later
                axes: gamepad ? Array.from(gamepad.axes) : []
              };
            }
          }
        }

        // Send tracking data (always have at least head pose)
        controllerData.timestamp = Date.now();
        client.sendControl(controllerData as unknown as Parameters<typeof client.sendControl>[0]);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
      gl.useProgram(prog);  // Must be active to set uniforms

      for (const view of pose.views) {
        const vp = layer.getViewport(view)!;
        gl.viewport(vp.x, vp.y, vp.width, vp.height);
        // Left eye = top half (yOff=0.0), Right eye = bottom half (yOff=0.5)
        // Convergence is now derived from yOff inside the shader
        gl.uniform1f(yOffLoc, view.eye === 'left' ? 0.0 : 0.5);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    session.requestAnimationFrame(onXRFrame);
  }, [client, dataChannelOpen, onEnterVR, onExitVR]);

  return (
    <div className={className}>
      {/* Video preview with VR button overlay */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full max-h-[60vh] bg-black rounded-lg"
          playsInline
          muted
          autoPlay
        />

        {/* Enter VR button - always visible */}
        <button
          onClick={enterVR}
          style={{ zIndex: 9999, position: 'absolute', top: '16px', right: '16px' }}
          className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded font-medium transition-colors shadow-lg"
        >
          Enter VR
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {/* Status indicators */}
      <div className="flex gap-4 items-center flex-wrap mt-4">
        <span className={`text-sm ${connectionState === 'connected' ? 'text-white' : 'text-neutral-500'}`}>
          Video: {connectionState}
        </span>
        <span className={`text-sm ${dataChannelOpen ? 'text-white' : 'text-neutral-500'}`}>
          Control: {dataChannelOpen ? 'connected' : 'waiting'}
        </span>
        <span className={`text-sm ${xrSupported ? 'text-white' : 'text-neutral-500'}`}>
          XR: {xrSupported === null ? 'checking' : xrSupported ? 'supported' : 'not supported'}
        </span>
      </div>
    </div>
  );
}

export default XRTeleop;
