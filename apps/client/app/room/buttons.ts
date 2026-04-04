/**
 * Named button indices from @adamo-tech/core's ROS joypad mapping
 * (packages/core/src/joypad.ts). These are the indices passed to
 * GamepadController.onButtonDown, after W3C→ROS remapping.
 */
export const BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  BACK: 4,
  GUIDE: 5,
  START: 6,
  LEFT_STICK: 7,
  RIGHT_STICK: 8,
  LB: 9,
  RB: 10,
  DPAD_UP: 11,
  DPAD_DOWN: 12,
  DPAD_LEFT: 13,
  DPAD_RIGHT: 14,
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
