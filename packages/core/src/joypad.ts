import type { AdamoClient } from './client';
import type { JoypadConfig, JoyMessage, ControlMessage } from './types';

const DEFAULT_CONFIG: Required<JoypadConfig> = {
  deviceId: 0,
  deviceName: '',
  deadzone: 0.05,
  autorepeatRate: 100.0, // 100Hz for responsive control
  stickyButtons: false,
  coalesceIntervalMs: 0, // No coalescing for lowest latency
  maxVideoStalenessMs: 100,
  pollIntervalMs: 1, // 1ms high-frequency polling
  topic: '', // deprecated, unused
};

/**
 * W3C Gamepad to ROS Joy button mapping
 * Maps W3C gamepad button indices to ROS joy_node button indices
 */
const BUTTON_MAP: Record<number, number> = {
  0: 0, // A (CROSS) -> A
  1: 1, // B (CIRCLE) -> B
  2: 2, // X (SQUARE) -> X
  3: 3, // Y (TRIANGLE) -> Y
  8: 4, // Select/Back -> BACK
  12: 5, // Guide/Home -> GUIDE
  9: 6, // Start -> START
  10: 7, // Left Stick Click -> LEFTSTICK
  11: 8, // Right Stick Click -> RIGHTSTICK
  4: 9, // LB -> LEFTSHOULDER
  5: 10, // RB -> RIGHTSHOULDER
};

const EXPECTED_BUTTON_COUNT = 21;
const EXPECTED_AXIS_COUNT = 6;

/**
 * JoypadManager - Manages gamepad input and sends to the server
 *
 * Maps W3C Gamepad API to ROS sensor_msgs/Joy format compatible with joy_node.
 * Supports deadzone, autorepeat, sticky buttons, and coalescing.
 *
 * @example
 * ```ts
 * const joypad = new JoypadManager(client);
 *
 * joypad.onInput((msg) => {
 *   console.log('Joy input:', msg);
 * });
 *
 * joypad.start();
 * // ... later
 * joypad.stop();
 * ```
 */
export class JoypadManager {
  private client: AdamoClient;
  private config: Required<JoypadConfig>;
  private animationFrameId: number | null = null;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private previousState: number[] | null = null;
  private stickyButtonState: number[] = new Array(EXPECTED_BUTTON_COUNT).fill(0);
  private pendingState: { buttons: number[]; axes: number[] } | null = null;
  private coalesceTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastAutorepeatTime: number = 0;
  private inputCallbacks: Set<(msg: JoyMessage) => void> = new Set();
  private connectionCallbacks: Set<(connected: boolean, gamepad?: Gamepad) => void> = new Set();
  private gamepadConnectedHandler: ((e: GamepadEvent) => void) | null = null;
  private gamepadDisconnectedHandler: ((e: GamepadEvent) => void) | null = null;
  private knownGamepadId: string | null = null;

  constructor(client: AdamoClient, config: JoypadConfig = {}) {
    this.client = client;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start polling gamepad and sending joy messages
   */
  start(): void {
    if (this.animationFrameId || this.pollIntervalId) return;

    // Listen for gamepad connect/disconnect events
    // IMPORTANT: Chrome requires a button press before gamepad appears in getGamepads()
    this.gamepadConnectedHandler = (e: GamepadEvent) => {
      console.log(`[Joypad] Gamepad connected: "${e.gamepad.id}" (index ${e.gamepad.index})`);
      this.knownGamepadId = e.gamepad.id;
      this.connectionCallbacks.forEach((cb) => cb(true, e.gamepad));
    };
    this.gamepadDisconnectedHandler = (e: GamepadEvent) => {
      console.log(`[Joypad] Gamepad disconnected: "${e.gamepad.id}" (index ${e.gamepad.index})`);
      if (this.knownGamepadId === e.gamepad.id) {
        this.knownGamepadId = null;
      }
      this.connectionCallbacks.forEach((cb) => cb(false, e.gamepad));
    };
    window.addEventListener('gamepadconnected', this.gamepadConnectedHandler);
    window.addEventListener('gamepaddisconnected', this.gamepadDisconnectedHandler);

    // Check if gamepad already connected (Safari provides this immediately, Chrome requires button press)
    const existing = this.getGamepad();
    if (existing) {
      console.log(`[Joypad] Found existing gamepad: "${existing.id}"`);
      this.knownGamepadId = existing.id;
    } else {
      console.log('[Joypad] No gamepad detected yet. In Chrome, press a button on your controller.');
    }

    if (this.config.pollIntervalMs > 0) {
      // High-frequency polling with setInterval
      this.pollIntervalId = setInterval(this.pollGamepad, this.config.pollIntervalMs);
    } else {
      // Default: sync to display refresh with requestAnimationFrame
      this.pollGamepad();
    }
  }

  /**
   * Stop polling and sending
   */
  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    if (this.coalesceTimeout) {
      clearTimeout(this.coalesceTimeout);
      this.coalesceTimeout = null;
    }
    if (this.gamepadConnectedHandler) {
      window.removeEventListener('gamepadconnected', this.gamepadConnectedHandler);
      this.gamepadConnectedHandler = null;
    }
    if (this.gamepadDisconnectedHandler) {
      window.removeEventListener('gamepaddisconnected', this.gamepadDisconnectedHandler);
      this.gamepadDisconnectedHandler = null;
    }
  }

  /**
   * Register a callback for joy input events
   */
  onInput(callback: (msg: JoyMessage) => void): () => void {
    this.inputCallbacks.add(callback);
    return () => {
      this.inputCallbacks.delete(callback);
    };
  }

  /**
   * Register a callback for gamepad connection changes
   */
  onConnectionChange(callback: (connected: boolean, gamepad?: Gamepad) => void): () => void {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  /**
   * Get the currently connected gamepad (if any)
   */
  getGamepad(): Gamepad | null {
    const gamepads = navigator.getGamepads();

    if (this.config.deviceName) {
      return (
        Array.from(gamepads).find((gp) => gp?.id.includes(this.config.deviceName)) || null
      );
    }

    return gamepads[this.config.deviceId] || null;
  }

  /**
   * Check if a gamepad is connected
   */
  isConnected(): boolean {
    return this.getGamepad() !== null;
  }

  // Private methods

  private pollGamepad = async (): Promise<void> => {
    const gamepad = this.getGamepad();

    if (gamepad && this.client.connectionState === 'connected') {
      // Check video freshness before sending commands
      // If video is stale, operator is flying blind - don't send commands
      if (
        this.config.maxVideoStalenessMs > 0 &&
        !this.client.isVideoFresh(this.config.maxVideoStalenessMs)
      ) {
        // Video is stale - skip publishing but continue polling
        this.scheduleNextPoll();
        return;
      }

      const { buttons, axes } = this.mapToROSJoy(gamepad);

      const changed = this.hasStateChanged(buttons, axes);
      const now = Date.now();

      const shouldPublish =
        changed ||
        (this.config.autorepeatRate > 0 &&
          now - this.lastAutorepeatTime >= 1000 / this.config.autorepeatRate);

      if (shouldPublish) {
        if (changed) {
          // Coalesce rapid changes
          if (this.coalesceTimeout) clearTimeout(this.coalesceTimeout);

          this.pendingState = { buttons, axes };

          if (this.config.coalesceIntervalMs > 0) {
            this.coalesceTimeout = setTimeout(() => {
              if (this.pendingState) {
                this.publishJoyMessage(this.pendingState.buttons, this.pendingState.axes);
                this.pendingState = null;
              }
            }, this.config.coalesceIntervalMs);
          } else {
            this.publishJoyMessage(buttons, axes);
            this.pendingState = null;
          }
        } else {
          // Autorepeat
          this.publishJoyMessage(buttons, axes);
        }

        if (!changed) this.lastAutorepeatTime = now;
      }
    }

    this.scheduleNextPoll();
  };

  private scheduleNextPoll(): void {
    // Only schedule via rAF when not using interval mode
    if (this.config.pollIntervalMs === 0) {
      this.animationFrameId = requestAnimationFrame(this.pollGamepad);
    }
    // When using pollIntervalMs > 0, setInterval handles scheduling
  }

  private mapToROSJoy(gamepad: Gamepad): { buttons: number[]; axes: number[] } {
    const buttons = new Array(EXPECTED_BUTTON_COUNT).fill(0);
    const axes = new Array(EXPECTED_AXIS_COUNT).fill(0.0);

    // Map buttons
    for (let i = 0; i < gamepad.buttons.length; i++) {
      const rosIndex = BUTTON_MAP[i];
      if (rosIndex !== undefined) {
        if (this.config.stickyButtons) {
          if (gamepad.buttons[i].pressed && this.previousState && !this.previousState[rosIndex]) {
            this.stickyButtonState[rosIndex] = this.stickyButtonState[rosIndex] ? 0 : 1;
          }
          buttons[rosIndex] = this.stickyButtonState[rosIndex];
        } else {
          buttons[rosIndex] = gamepad.buttons[i].pressed ? 1 : 0;
        }
      }
    }

    // Handle D-Pad
    if (gamepad.buttons.length > 12) {
      buttons[11] = gamepad.buttons[12]?.pressed ? 1 : 0; // DPAD_UP
      buttons[12] = gamepad.buttons[13]?.pressed ? 1 : 0; // DPAD_DOWN
      buttons[13] = gamepad.buttons[14]?.pressed ? 1 : 0; // DPAD_LEFT
      buttons[14] = gamepad.buttons[15]?.pressed ? 1 : 0; // DPAD_RIGHT
    }

    // Some controllers use axes for D-pad
    if (gamepad.axes.length > 9) {
      const dpadX = gamepad.axes[9] || 0;
      const dpadY = gamepad.axes[10] || 0;
      if (dpadY < -0.5) buttons[11] = 1;
      if (dpadY > 0.5) buttons[12] = 1;
      if (dpadX < -0.5) buttons[13] = 1;
      if (dpadX > 0.5) buttons[14] = 1;
    }

    // Map axes
    if (gamepad.axes.length >= 4) {
      axes[0] = this.applyDeadzone(gamepad.axes[0]);
      axes[1] = this.applyDeadzone(gamepad.axes[1]);
      axes[2] = this.applyDeadzone(gamepad.axes[2]);
      axes[3] = this.applyDeadzone(gamepad.axes[3]);
    }

    // Triggers
    if (gamepad.buttons.length > 6) {
      axes[4] = gamepad.buttons[6]?.value || 0;
    }
    if (gamepad.buttons.length > 7) {
      axes[5] = gamepad.buttons[7]?.value || 0;
    }

    // Some controllers put triggers on axes
    if (gamepad.axes.length > 5 && axes[4] === 0 && axes[5] === 0) {
      const lt = gamepad.axes[4] || 0;
      const rt = gamepad.axes[5] || 0;
      axes[4] = (lt + 1) / 2;
      axes[5] = (rt + 1) / 2;
    }

    return { buttons, axes };
  }

  private applyDeadzone(value: number): number {
    if (Math.abs(value) < this.config.deadzone) return 0.0;
    return value;
  }

  private hasStateChanged(newButtons: number[], newAxes: number[]): boolean {
    if (!this.previousState) return true;

    const combined = [...newButtons, ...newAxes];
    for (let i = 0; i < combined.length; i++) {
      if (Math.abs(combined[i] - this.previousState[i]) > 0.001) {
        return true;
      }
    }
    return false;
  }

  private publishJoyMessage(buttons: number[], axes: number[]): void {
    const joyMessage: JoyMessage = {
      header: {
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1e6,
        },
        frame_id: 'joy',
      },
      axes,
      buttons,
    };

    // Notify callbacks
    this.inputCallbacks.forEach((cb) => cb(joyMessage));

    // Build control message with all connected gamepads
    const controlMessage: ControlMessage = {
      timestamp: Date.now(),
    };

    // Poll all gamepads and add to message
    const gamepads = navigator.getGamepads();
    let controllerIndex = 1;
    let connectedCount = 0;

    for (const gp of gamepads) {
      if (gp && gp.connected) {
        connectedCount++;
        const mapped = this.mapToROSJoy(gp);
        controlMessage[`controller${controllerIndex}` as `controller${number}`] = {
          axes: mapped.axes,
          buttons: mapped.buttons,
        };
        controllerIndex++;
      }
    }

    // Log when gamepad detection changes
    const totalGamepads = Array.from(gamepads).filter(g => g !== null).length;
    if (connectedCount === 0) {
      console.warn(`[Joypad] No connected gamepads found (${totalGamepads} detected, 0 connected)`);
    }

    const success = this.client.sendControl(controlMessage);
    if (success) {
      this.previousState = [...buttons, ...axes];
    } else {
      console.debug('Joy publish failed - data channel not open');
    }
  }
}
