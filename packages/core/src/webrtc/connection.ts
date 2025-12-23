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

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
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
        // Robot connected to the room
        this.log('Robot connected');
        this.peerConnected = true;
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
          // Create data channel when connected (if not already created via ondatachannel)
          if (!this.dataChannel) {
            this.createDataChannel();
          }
          break;
        case 'disconnected':
          this.setConnectionState('disconnected');
          break;
        case 'failed':
          this.setConnectionState('failed');
          this.attemptReconnect();
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

      // Create and set local description (our answer)
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);

      // Send answer to robot
      this.sendSignaling({
        type: 'answer',
        sdp: answer.sdp,
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

    try {
      if (candidate.candidate) {
        // Log received candidate type for debugging
        let candType = 'unknown';
        if (candidate.candidate.includes('typ host')) candType = 'host';
        else if (candidate.candidate.includes('typ srflx')) candType = 'srflx';
        else if (candidate.candidate.includes('typ relay')) candType = 'relay';
        this.log(`Received ICE candidate from robot (m-line ${candidate.sdpMLineIndex}, type=${candType}): ${candidate.candidate}`);

        await this.pc.addIceCandidate(candidate);
      }
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
}
