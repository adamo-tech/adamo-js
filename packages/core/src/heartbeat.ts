import type { AdamoClient } from './client';
import { HeartbeatState, HeartbeatConfig } from './types';

const DEFAULT_CONFIG: Required<HeartbeatConfig> = {
  interval: 500,
  checkGamepad: true,
  checkWindowFocus: true,
};

/**
 * HeartbeatManager - Manages heartbeat monitoring and sending to the server
 *
 * Automatically monitors client health including:
 * - Gamepad connection status
 * - Window focus state
 *
 * @example
 * ```ts
 * const heartbeat = new HeartbeatManager(client);
 *
 * heartbeat.onStateChange((state) => {
 *   console.log('Heartbeat state:', HeartbeatState[state]);
 * });
 *
 * heartbeat.start();
 * // ... later
 * heartbeat.stop();
 * ```
 */
export class HeartbeatManager {
  private client: AdamoClient;
  private config: Required<HeartbeatConfig>;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentState: HeartbeatState = HeartbeatState.OK;
  private stateChangeCallbacks: Set<(state: HeartbeatState) => void> = new Set();

  constructor(client: AdamoClient, config: HeartbeatConfig = {}) {
    this.client = client;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the current heartbeat state
   */
  get state(): HeartbeatState {
    return this.currentState;
  }

  /**
   * Start sending heartbeats
   */
  start(): void {
    if (this.intervalId) return;

    // Send initial heartbeat
    this.sendHeartbeat();

    // Start heartbeat interval
    this.intervalId = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.interval);
  }

  /**
   * Stop sending heartbeats
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Register a callback for state changes
   */
  onStateChange(callback: (state: HeartbeatState) => void): () => void {
    this.stateChangeCallbacks.add(callback);
    return () => {
      this.stateChangeCallbacks.delete(callback);
    };
  }

  // Private methods

  private sendHeartbeat(): void {
    const state = this.getCurrentState();

    // Notify if state changed
    if (state !== this.currentState) {
      this.currentState = state;
      this.stateChangeCallbacks.forEach((cb) => cb(state));
    }

    // Send heartbeat via data channel (fire-and-forget)
    const success = this.client.sendHeartbeat(state);
    if (!success) {
      // Data channel not ready - this is expected during connection setup
      console.debug('Heartbeat failed - data channel not open');
    }
  }

  private getCurrentState(): HeartbeatState {
    // Check for controller disconnection (highest priority)
    if (this.config.checkGamepad) {
      const gamepads = navigator.getGamepads();
      const hasController = Array.from(gamepads).some((gp) => gp !== null && gp.connected);
      if (!hasController) {
        return HeartbeatState.CONTROLLER_DISCONNECTED;
      }
    }

    // Check for window focus (second priority)
    if (this.config.checkWindowFocus && typeof document !== 'undefined' && !document.hasFocus()) {
      return HeartbeatState.WINDOW_UNFOCUSED;
    }

    return HeartbeatState.OK;
  }
}
