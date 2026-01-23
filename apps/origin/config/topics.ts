/**
 * ROS topic configuration for Origin app
 *
 * This config maps frontend topic names to ROS topic names.
 * The bridge must be configured with matching twist_topics entries.
 */

export const TOPICS = {
  /** Twist velocity commands */
  cmdVel: {
    name: 'twist',
    rosTopic: '/cmd_vel_teleop',
  },
} as const;

/**
 * Keyboard velocity increment per keypress (m/s and rad/s)
 * Each WASD/QE keypress adds/subtracts this amount
 */
export const VELOCITY_INCREMENT = 0.01;

/**
 * Camera topics for video feeds
 * These should match the track names in the bridge config
 */
export const CAMERA_TOPICS = ['front', 'left', 'right', 'back'] as const;

/**
 * Camera labels for display in the UI
 */
export const CAMERA_LABELS: Record<string, string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left',
  right: 'Right',
};

/**
 * Layout modes for the camera grid
 * Each mode defines a grid of camera topics
 */
export const LAYOUT_MODES = [
  {
    name: 'default',
    label: 'Default',
    grid: [
      ['front', 'back'],
      ['left', 'right'],
    ],
  },
] as const;
