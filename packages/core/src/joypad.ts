import type { AdamoClient } from './client';
import type { JoypadConfig, JoyMessage } from './types';

const DEFAULT_CONFIG: Required<JoypadConfig> = {
  deviceId: 0,
  deviceName: '',
  deadzone: 0.05,
  autorepeatRate: 20.0,
  stickyButtons: false,
  coalesceIntervalMs: 1,
  maxVideoStalenessMs: 300,
  topic: 'joy',
};

// Standard Gamepad button mapping (W3C / Xbox controller)
// https://w3c.github.io/gamepad/#remapping
//  0: A          4: LB         8: Back       12: DPad Up
//  1: B          5: RB         9: Start      13: DPad Down
//  2: X          6: LT         10: L3        14: DPad Left
//  3: Y          7: RT         11: R3        15: DPad Right
//                                            16: Xbox/Guide
const EXPECTED_BUTTON_COUNT = 17;
const EXPECTED_AXIS_COUNT = 6;

/**
 * JoypadManager - Manages gamepad input and sends to the server
 *
 * Maps W3C Gamepad API with 1:1 button passthrough (indices 0-16).
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
  private previousState: number[] | null = null;
  private stickyButtonState: number[] = new Array(EXPECTED_BUTTON_COUNT).fill(0);
  private pendingState: { buttons: number[]; axes: number[] } | null = null;
  private coalesceTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastAutorepeatTime: number = 0;
  private inputCallbacks: Set<(msg: JoyMessage) => void> = new Set();

  constructor(client: AdamoClient, config: JoypadConfig = {}) {
    this.client = client;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start polling gamepad and sending joy messages
   */
  start(): void {
    if (this.animationFrameId) return;

    this.pollGamepad();
  }

  /**
   * Stop polling and sending
   */
  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.coalesceTimeout) {
      clearTimeout(this.coalesceTimeout);
      this.coalesceTimeout = null;
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
        this.animationFrameId = requestAnimationFrame(this.pollGamepad);
        return;
      }

      const { buttons, axes } = this.mapToJoy(gamepad);

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

    this.animationFrameId = requestAnimationFrame(this.pollGamepad);
  };

  private mapToJoy(gamepad: Gamepad): { buttons: number[]; axes: number[] } {
    const buttons = new Array(EXPECTED_BUTTON_COUNT).fill(0);
    const axes = new Array(EXPECTED_AXIS_COUNT).fill(0.0);

    // Standard mapping: button indices pass through 1:1
    const count = Math.min(gamepad.buttons.length, EXPECTED_BUTTON_COUNT);
    for (let i = 0; i < count; i++) {
      if (this.config.stickyButtons) {
        if (gamepad.buttons[i].pressed && this.previousState && !this.previousState[i]) {
          this.stickyButtonState[i] = this.stickyButtonState[i] ? 0 : 1;
        }
        buttons[i] = this.stickyButtonState[i];
      } else {
        buttons[i] = gamepad.buttons[i].pressed ? 1 : 0;
      }
    }

    // Fallback: some non-standard controllers report D-pad as axes[9]/axes[10]
    if (gamepad.axes.length > 9 && !buttons[12] && !buttons[13] && !buttons[14] && !buttons[15]) {
      const dpadX = gamepad.axes[9] || 0;
      const dpadY = gamepad.axes[10] || 0;
      if (dpadY < -0.5) buttons[12] = 1; // Up
      if (dpadY > 0.5) buttons[13] = 1;  // Down
      if (dpadX < -0.5) buttons[14] = 1; // Left
      if (dpadX > 0.5) buttons[15] = 1;  // Right
    }

    // Axes 0-3: thumbsticks (standard mapping)
    if (gamepad.axes.length >= 4) {
      axes[0] = this.applyDeadzone(gamepad.axes[0]);
      axes[1] = this.applyDeadzone(gamepad.axes[1]);
      axes[2] = this.applyDeadzone(gamepad.axes[2]);
      axes[3] = this.applyDeadzone(gamepad.axes[3]);
    }

    // Axes 4-5: trigger analog values from standard buttons 6/7 (LT/RT)
    if (gamepad.buttons.length > 6) {
      axes[4] = gamepad.buttons[6]?.value || 0;
    }
    if (gamepad.buttons.length > 7) {
      axes[5] = gamepad.buttons[7]?.value || 0;
    }

    // Fallback: some non-standard controllers report triggers as axes[4]/axes[5]
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

  private async publishJoyMessage(buttons: number[], axes: number[]): Promise<void> {
    const joyMessage: JoyMessage = {
      header: {
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1e6,
        },
        frame_id: this.config.topic,
      },
      axes,
      buttons,
    };

    // Notify callbacks
    this.inputCallbacks.forEach((cb) => cb(joyMessage));

    try {
      await this.client.sendJoyData(axes, buttons, this.config.topic);
      this.previousState = [...buttons, ...axes];
    } catch (error) {
      console.error('Joy publish failed:', error);
    }
  }
}
