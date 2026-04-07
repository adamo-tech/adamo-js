/**
 * W3C standard gamepad button indices (1:1 passthrough).
 * These are the indices passed to GamepadController.onButtonDown.
 */
export const BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  LEFT_STICK: 10,
  RIGHT_STICK: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
  GUIDE: 16,
} as const;

/**
 * W3C standard-mapping gamepad button indices (raw from navigator.getGamepads()).
 * Used by the pre-connection gamepad polling on the room selector screen.
 */
export const W3C_BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
} as const;
