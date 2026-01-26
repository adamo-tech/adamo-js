/**
 * WebRTC Connection
 *
 * Handles WebRTC signaling and peer connection management for robot teleoperation.
 * Ported from webxr-teleop-client PoC.
 */

import type {
  SignalingConfig,
  WebRTCConnectionState,
  WebRTCConnectionConfig,
  SignalingMessage,
  TrackMetadata,
} from './types';

/**
 * WebRTC connection class for robot teleoperation
 *
 * Manages:
 * - WebSocket signaling with the relay server
 * - RTCPeerConnection setup and ICE handling
 * - Data channel for control messages (unreliable/unordered for low latency)
 * - Video track reception
 *
 * @example
 * ```ts
 * const connection = new WebRTCConnection({
 *   signaling: { serverUrl: 'wss://relay.example.com', roomId: 'robot-1', token: 'jwt...' },
 *   onTrack: (track) => { videoEl.srcObject = new MediaStream([track]); },
 *   onDataChannelOpen: () => { console.log('Ready to send controls'); },
 * });
 *
 * await connection.connect();
 * connection.sendControl({ controller1: { axes: [0, 0], buttons: [0] } });
 * ```
 */
export class WebRTCConnection {
  private pc: RTCPeerConnection | null = null;
  private ws: WebSocket | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private config: WebRTCConnectionConfig;
  private _connectionState: WebRTCConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private peerConnected = false;
  /** Track metadata from offer (index → name mapping) */
  private _trackMetadata: TrackMetadata[] = [];
  /** Track count for fallback naming */
  private _trackCount = 0;
  /** Whether remote description has been set (for ICE candidate queuing) */
  private remoteDescriptionSet = false;
  /** Queue for ICE candidates that arrive before remote description is set */
  private pendingIceCandidates: { candidate: string; sdpMLineIndex: number }[] = [];
  /** Interval ID for jitter buffer enforcement loop */
  private jitterBufferIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: WebRTCConnectionConfig) {
    this.config = config;
  }

  /**
   * Get track name by index (from offer metadata)
   * Falls back to 'video_N' if not found
   */
  getTrackName(index: number): string {
    const meta = this._trackMetadata.find((t) => t.index === index);
    return meta?.name ?? `video_${index}`;
  }

  /**
   * Get next track name (called when tracks arrive)
   * Uses metadata if available, otherwise generates name
   */
  getNextTrackName(): string {
    const index = this._trackCount++;
    return this.getTrackName(index);
  }

  /**
   * Get all track metadata from the offer
   */
  get trackMetadata(): TrackMetadata[] {
    return [...this._trackMetadata];
  }

  /**
   * Get the current connection state
   */
  get connectionState(): WebRTCConnectionState {
    return this._connectionState;
  }

  /**
   * Send control data over the data channel
   * Returns false if the channel is not open
   */
  sendControl(data: object): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false;
    }
    try {
      this.dataChannel.send(JSON.stringify(data));
      return true;
    } catch (e) {
      this.log('Failed to send control data:', e);
      return false;
    }
  }

  /**
   * Check if the data channel is open and ready
   */
  isDataChannelOpen(): boolean {
    return this.dataChannel?.readyState === 'open';
  }

  /**
   * Force connect when robot is busy (another user connected).
   * Call this after receiving onRobotBusy callback to take over the connection.
   */
  forceConnect(): void {
    this.log('Sending force_connect to take over from existing user');
    this.sendSignaling({ type: 'force_connect' });
  }

  /**
   * Connect to signaling server and establish WebRTC connection
   */
  async connect(): Promise<void> {
    this.setConnectionState('connecting');
    this.reconnectAttempts = 0;

    // Use provided ICE servers or defaults
    const iceServers = this.config.signaling.iceServers || [
      { urls: 'stun:stun.l.google.com:19302' },
    ];
    this.log('Using ICE servers:', iceServers);

    // Create peer connection
    this.pc = new RTCPeerConnection({ iceServers });
    this.setupPeerConnectionHandlers();

    // Connect to signaling
    await this.connectSignaling();
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.cleanup();
    this.setConnectionState('disconnected');
  }

  /**
   * Get the RTCPeerConnection for advanced usage (e.g., attaching WebCodecs transform)
   */
  getPeerConnection(): RTCPeerConnection | null {
    return this.pc;
  }

  /**
   * Get WebRTC statistics
   */
  async getStats(): Promise<RTCStatsReport | null> {
    if (!this.pc) return null;
    return this.pc.getStats();
  }

  /**
   * Get all video receivers for WebCodecs integration
   */
  getVideoReceivers(): RTCRtpReceiver[] {
    if (!this.pc) return [];
    return this.pc.getReceivers().filter((r) => r.track?.kind === 'video');
  }

  private cleanup(): void {
    this.peerConnected = false;
    this.remoteDescriptionSet = false;
    this.pendingIceCandidates = [];

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    // Stop jitter buffer enforcement loop
    if (this.jitterBufferIntervalId) {
      clearInterval(this.jitterBufferIntervalId);
      this.jitterBufferIntervalId = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }

  private setConnectionState(state: WebRTCConnectionState): void {
    if (this._connectionState !== state) {
      this._connectionState = state;
      this.config.onConnectionStateChange?.(state);
    }
  }

  private async connectSignaling(): Promise<void> {
    const { serverUrl, roomId, token, websocketPath } = this.config.signaling;

    const base = serverUrl.replace(/\/$/, '');
    const path = websocketPath || `/ws/signal/${roomId}`;

    // Build URL and normalize token handling
    const url = new URL(path, base);

    // Move token from query string into subprotocol if present
    let wsToken = token;
    const queryToken = url.searchParams.get('token');
    if (!wsToken && queryToken) {
      wsToken = queryToken;
    }

    const wsUrl = url.toString();
    this.log('Connecting to signaling:', { wsUrl, subprotocol: wsToken ? '[token]' : 'none' });

    return new Promise((resolve, reject) => {
      // Pass token in subprotocol
      this.ws = new WebSocket(wsUrl, wsToken ? [wsToken] : []);

      this.ws.onopen = () => {
        this.log('Signaling connected, waiting for robot...');
        resolve();
      };

      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data) as SignalingMessage;
        await this.handleSignalingMessage(message);
      };

      this.ws.onerror = (event) => {
        this.log('Signaling error:', event);
        reject(new Error('Signaling connection failed (onerror)'));
      };

      this.ws.onclose = (event) => {
        this.log('Signaling disconnected', { code: event.code, reason: event.reason });

        // Don't reconnect if kicked by another client (4011) or robot busy (4012)
        if (event.code === 4011) {
          this.log('Another client connected - not reconnecting');
          this.setConnectionState('disconnected');
          this.config.onError?.(new Error('Another client connected to this robot'));
          return;
        }

        if (event.code === 4012) {
          this.log('Robot busy - another user is connected');
          this.setConnectionState('disconnected');
          this.config.onError?.(new Error('Another user is already connected to this robot'));
          return;
        }

        if (this._connectionState === 'connected' || this._connectionState === 'connecting') {
          // Attempt reconnection
          this.attemptReconnect();
        }

        // Surface early close (e.g., invalid token/room) to UI
        if (!this.peerConnected && this._connectionState === 'connecting') {
          this.config.onError?.(
            new Error(`Signaling closed code=${event.code} reason=${event.reason || 'unknown'}`)
          );
        }
      };
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached');
      this.setConnectionState('failed');
      this.config.onError?.(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionState('reconnecting');

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeoutId = setTimeout(async () => {
      try {
        this.cleanup();
        await this.connect();
      } catch (e) {
        this.log('Reconnection failed:', e);
        this.attemptReconnect();
      }
    }, delay);
  }

  private async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    const { type } = message;
    this.log('Received:', type);

    switch (type) {
      case 'peer_connected':
        // Robot connected to the room (or re-connected after we reconnected)
        this.log('Robot connected');
        this.peerConnected = true;
        // Reset WebRTC state to prepare for new offer
        // This handles the case where we reconnected and robot sends new offer
        this.resetPeerConnectionForRenegotiation();
        break;

      case 'preparing':
        // Robot is preparing the stream (pipeline initialization)
        this.log('Robot preparing stream...');
        break;

      case 'peer_disconnected':
        // Robot disconnected
        this.log('Robot disconnected');
        this.peerConnected = false;
        this.setConnectionState('disconnected');
        this.config.onDataChannelClose?.();
        break;

      case 'offer':
        // Robot sent an offer, we respond with answer
        // IMPORTANT: Clear any pending ICE candidates - they're from a previous session
        // and have wrong ICE credentials. Candidates must arrive AFTER the offer.
        if (this.pendingIceCandidates.length > 0) {
          this.log(`Clearing ${this.pendingIceCandidates.length} stale ICE candidates`);
          this.pendingIceCandidates = [];
        }
        // If peer connection is in failed state (ICE restart scenario), recreate it
        if (this.pc?.connectionState === 'failed' || this.pc?.iceConnectionState === 'failed') {
          this.log('Received offer while in failed state - resetting peer connection for ICE restart');
          this.resetPeerConnectionForRenegotiation();
        }
        // Store track metadata for naming tracks when they arrive
        if (message.tracks) {
          this._trackMetadata = message.tracks;
          this._trackCount = 0; // Reset counter for new offer
          this.log('Received track metadata:', message.tracks);
        }
        await this.handleOffer(message.sdp!);
        break;

      case 'candidate':
        // Robot sent an ICE candidate
        await this.handleIceCandidate({
          candidate: message.candidate!,
          sdpMLineIndex: message.sdpMLineIndex!,
        });
        break;

      case 'robot_busy':
        // Another user is connected - notify UI so they can choose to take over
        this.log('Robot busy - another user is connected');
        this.config.onRobotBusy?.();
        break;
    }
  }

  /**
   * Reset peer connection state to prepare for re-negotiation
   * Called when robot reconnects and will send a new offer
   */
  private resetPeerConnectionForRenegotiation(): void {
    // Clear ICE candidate queue - old candidates are invalid for new offer
    this.pendingIceCandidates = [];
    this.remoteDescriptionSet = false;
    this._trackCount = 0;
    this._trackMetadata = [];

    // Always recreate the peer connection for a fresh start
    // This ensures clean state for the new offer/answer exchange
    if (this.pc) {
      const state = this.pc.connectionState;
      const iceState = this.pc.iceConnectionState;
      this.log('Recreating peer connection for re-negotiation (state was:', state, ', ice:', iceState, ')');

      // Close old data channel
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }

      // Remove handlers from old PC before closing to prevent spurious state changes
      const oldPc = this.pc;
      oldPc.onconnectionstatechange = null;
      oldPc.oniceconnectionstatechange = null;
      oldPc.onicecandidate = null;
      oldPc.ontrack = null;
      oldPc.ondatachannel = null;

      // Close old peer connection
      oldPc.close();

      // Create new peer connection
      const iceServers = this.config.signaling.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
      ];
      this.pc = new RTCPeerConnection({ iceServers });
      this.setupPeerConnectionHandlers();
    }
  }

  private setupPeerConnectionHandlers(): void {
    if (!this.pc) return;

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Log candidate type for debugging ICE selection
        const candStr = event.candidate.candidate;
        let candType = 'unknown';
        if (candStr.includes('typ host')) candType = 'host';
        else if (candStr.includes('typ srflx')) candType = 'srflx';
        else if (candStr.includes('typ relay')) candType = 'relay';
        this.log(`Sending ICE candidate (m-line ${event.candidate.sdpMLineIndex}, type=${candType}): ${candStr}`);

        this.sendSignaling({
          type: 'candidate',
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
      } else {
        this.log('ICE gathering complete');
      }
    };

    this.pc.onicegatheringstatechange = () => {
      this.log('ICE gathering state:', this.pc?.iceGatheringState);
    };

    this.pc.oniceconnectionstatechange = () => {
      this.log('ICE connection state:', this.pc?.iceConnectionState);
      // Log selected candidate pair when connected
      if (this.pc?.iceConnectionState === 'connected') {
        this.logSelectedCandidatePair();
      }
    };

    this.pc.ontrack = (event) => {
      this.log('Got track:', event.track.kind);
      this.config.onTrack?.(event.track, event.streams);
    };

    this.pc.onconnectionstatechange = () => {
      const pcState = this.pc?.connectionState;
      this.log('Connection state:', pcState);

      switch (pcState) {
        case 'connected':
          this.setConnectionState('connected');
          this.reconnectAttempts = 0;
          // Data channel is created by the robot and received via ondatachannel
          // Start jitter buffer enforcement for smooth video playback
          this.startJitterBufferEnforcement();
          break;
        case 'disconnected':
          this.setConnectionState('disconnected');
          break;
        case 'failed':
          this.setConnectionState('failed');
          // Don't do full reconnect - keep signaling open and wait for robot's ICE restart offer
          this.log('ICE failed - waiting for robot to send ICE restart offer');
          break;
      }
    };

    // Also handle data channel from robot (in case they create one)
    this.pc.ondatachannel = (event) => {
      this.log('Received data channel:', event.channel.label);
      this.dataChannel = event.channel;
      this.setupDataChannelHandlers();
    };
  }

  private createDataChannel(): void {
    if (!this.pc || this.dataChannel) return;

    this.log('Creating data channel...');
    // Unreliable/unordered for low latency control
    this.dataChannel = this.pc.createDataChannel('control', {
      ordered: false,
      maxRetransmits: 0,
    });
    this.setupDataChannelHandlers();
  }

  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.log('Data channel opened');
      this.config.onDataChannelOpen?.();
    };

    this.dataChannel.onclose = () => {
      this.log('Data channel closed');
      this.config.onDataChannelClose?.();
    };

    this.dataChannel.onerror = (event) => {
      this.log('Data channel error:', event);
    };

    this.dataChannel.onmessage = (event) => {
      this.log('Data channel message:', event.data);
      try {
        const data = JSON.parse(event.data);
        this.config.onDataChannelMessage?.(data);
      } catch {
        this.config.onDataChannelMessage?.(event.data);
      }
    };
  }

  private async handleOffer(sdp: string): Promise<void> {
    if (!this.pc) return;

    try {
      // Set remote description (robot's offer)
      await this.pc.setRemoteDescription({ type: 'offer', sdp });
      this.remoteDescriptionSet = true;

      // Process any ICE candidates that arrived before the offer
      if (this.pendingIceCandidates.length > 0) {
        this.log(`Processing ${this.pendingIceCandidates.length} queued ICE candidates`);
        for (const candidate of this.pendingIceCandidates) {
          await this.addIceCandidate(candidate);
        }
        this.pendingIceCandidates = [];
      }

      // Create and set local description (our answer)
      const answer = await this.pc.createAnswer();

      // Apply SDP munging for low-latency playback before setting local description
      const mungedSdp = this.applyLowLatencySdpMunging(answer.sdp || '');
      const mungedAnswer = { ...answer, sdp: mungedSdp };

      await this.pc.setLocalDescription(mungedAnswer);

      // Send answer to robot
      this.sendSignaling({
        type: 'answer',
        sdp: mungedSdp,
      });

      this.log('Sent answer to robot');
    } catch (e) {
      this.log('Failed to handle offer:', e);
      this.config.onError?.(e as Error);
    }
  }

  private async handleIceCandidate(candidate: {
    candidate: string;
    sdpMLineIndex: number;
  }): Promise<void> {
    if (!this.pc) return;
    if (!candidate.candidate) return;

    // Log received candidate type for debugging
    let candType = 'unknown';
    if (candidate.candidate.includes('typ host')) candType = 'host';
    else if (candidate.candidate.includes('typ srflx')) candType = 'srflx';
    else if (candidate.candidate.includes('typ relay')) candType = 'relay';
    this.log(`Received ICE candidate from robot (m-line ${candidate.sdpMLineIndex}, type=${candType}): ${candidate.candidate}`);

    // Queue candidates if remote description not yet set
    if (!this.remoteDescriptionSet) {
      this.log('Queuing ICE candidate (remote description not set yet)');
      this.pendingIceCandidates.push(candidate);
      return;
    }

    await this.addIceCandidate(candidate);
  }

  private async addIceCandidate(candidate: {
    candidate: string;
    sdpMLineIndex: number;
  }): Promise<void> {
    if (!this.pc) return;

    try {
      await this.pc.addIceCandidate(candidate);
    } catch (e) {
      this.log('Failed to add ICE candidate:', e);
    }
  }

  private sendSignaling(message: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[WebRTC]', ...args);
    }
  }

  private async logSelectedCandidatePair(): Promise<void> {
    if (!this.pc) return;

    try {
      const stats = await this.pc.getStats();
      stats.forEach((report) => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          const localId = report.localCandidateId;
          const remoteId = report.remoteCandidateId;

          let localCandidate: RTCStatsReport | null = null;
          let remoteCandidate: RTCStatsReport | null = null;

          stats.forEach((r) => {
            if (r.id === localId) localCandidate = r as unknown as RTCStatsReport;
            if (r.id === remoteId) remoteCandidate = r as unknown as RTCStatsReport;
          });

          this.log('Selected ICE candidate pair:', {
            local: localCandidate
              ? {
                  type: (localCandidate as unknown as { candidateType: string }).candidateType,
                  address: (localCandidate as unknown as { address: string }).address,
                  port: (localCandidate as unknown as { port: number }).port,
                  protocol: (localCandidate as unknown as { protocol: string }).protocol,
                }
              : 'unknown',
            remote: remoteCandidate
              ? {
                  type: (remoteCandidate as unknown as { candidateType: string }).candidateType,
                  address: (remoteCandidate as unknown as { address: string }).address,
                  port: (remoteCandidate as unknown as { port: number }).port,
                  protocol: (remoteCandidate as unknown as { protocol: string }).protocol,
                }
              : 'unknown',
          });
        }
      });
    } catch (e) {
      this.log('Failed to get candidate pair stats:', e);
    }
  }

  /**
   * Apply SDP modifications for low-latency video playback.
   *
   * Modifications:
   * 1. sps-pps-idr-in-keyframe=1: Bundles SPS/PPS/IDR together in keyframes
   *    to reduce frame corruption and improve packet loss resilience
   * 2. minptime=10: Forces 10ms audio frames instead of default 20ms for lower latency
   * 3. stereo=1: Enables stereo audio for Opus codec
   */
  private applyLowLatencySdpMunging(sdp: string): string {
    let mungedSdp = sdp;

    // 1. Bundle SPS/PPS/IDR in keyframes for H.264 (improves packet loss resilience)
    // This ensures decoder always has the parameter sets it needs
    if (mungedSdp.includes('packetization-mode=')) {
      mungedSdp = mungedSdp.replace(
        /packetization-mode=/g,
        'sps-pps-idr-in-keyframe=1;packetization-mode='
      );
      this.log('SDP: Added sps-pps-idr-in-keyframe=1 for H.264');
    }

    // 2. Force 10ms audio frames for Opus (lower latency than default 20ms)
    if (mungedSdp.includes('useinbandfec=')) {
      mungedSdp = mungedSdp.replace(
        /useinbandfec=/g,
        'minptime=10;useinbandfec='
      );
      this.log('SDP: Added minptime=10 for Opus audio');
    }

    // 3. Enable stereo audio for Opus
    if (mungedSdp.includes('useinbandfec=') && !mungedSdp.includes('stereo=')) {
      mungedSdp = mungedSdp.replace(
        /useinbandfec=/g,
        'stereo=1;useinbandfec='
      );
      this.log('SDP: Added stereo=1 for Opus audio');
    }

    return mungedSdp;
  }

  /**
   * Start jitter buffer enforcement loop for smooth video playback.
   *
   * This continuously sets the jitter buffer target to 0 every 15ms to force
   * the browser to minimize buffering. Without this, browsers typically buffer
   * 50-200ms which causes choppy/delayed video.
   */
  private startJitterBufferEnforcement(): void {
    if (this.jitterBufferIntervalId) return;

    this.log('Starting jitter buffer enforcement loop');

    // Enforce minimum jitter buffer every 15ms
    this.jitterBufferIntervalId = setInterval(() => {
      if (!this.pc) return;

      for (const receiver of this.pc.getReceivers()) {
        if (receiver.track?.kind === 'video') {
          // RTCRtpReceiver has jitterBufferTarget in modern browsers
          // Setting to 0 forces minimum playout delay
          const recv = receiver as RTCRtpReceiver & {
            jitterBufferTarget?: number | null;
            jitterBufferDelayHint?: number;
            playoutDelayHint?: number;
          };

          // Try all available APIs for maximum browser compatibility
          if ('jitterBufferTarget' in recv) {
            recv.jitterBufferTarget = 0;
          }
          if ('jitterBufferDelayHint' in recv) {
            recv.jitterBufferDelayHint = 0;
          }
          if ('playoutDelayHint' in recv) {
            recv.playoutDelayHint = 0;
          }
        }
      }
    }, 15);
  }
}
