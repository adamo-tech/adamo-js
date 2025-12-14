---
sidebar_position: 2
---

# Gamepad Input

Adamo maps the W3C Gamepad API to ROS `sensor_msgs/Joy` format.

## Basic Usage

```tsx
import { GamepadController } from '@adamo/adamo-react';

// Enable gamepad input with defaults
<GamepadController />
```

This automatically:
- Polls connected gamepads at 60fps
- Maps buttons and axes to ROS format
- Sends joy messages at 20Hz (or on change)

## Configuration

```tsx
<GamepadController
  config={{
    deviceId: 0,           // First gamepad
    deadzone: 0.1,         // 10% deadzone
    autorepeatRate: 30,    // 30Hz continuous
    stickyButtons: false,  // Toggle mode off
  }}
/>
```

## Button Mapping

| W3C Index | ROS Index | Button |
|-----------|-----------|--------|
| 0 | 0 | A (Cross) |
| 1 | 1 | B (Circle) |
| 2 | 2 | X (Square) |
| 3 | 3 | Y (Triangle) |
| 4 | 9 | LB (L1) |
| 5 | 10 | RB (R1) |
| 8 | 4 | Back/Select |
| 9 | 6 | Start |
| 10 | 7 | Left Stick Click |
| 11 | 8 | Right Stick Click |
| 12 | 5 | Guide/Home |
| 12-15 | 11-14 | D-Pad |

## Axis Mapping

| ROS Index | Axis |
|-----------|------|
| 0 | Left Stick X |
| 1 | Left Stick Y |
| 2 | Right Stick X |
| 3 | Right Stick Y |
| 4 | Left Trigger (0-1) |
| 5 | Right Trigger (0-1) |

## Detecting Button Presses

```tsx
<GamepadController
  onButtonDown={(buttonIndex) => {
    if (buttonIndex === 10) {
      // RB pressed - switch camera
      nextCamera();
    }
  }}
  onButtonUp={(buttonIndex) => {
    if (buttonIndex === 9) {
      // LB released
    }
  }}
/>
```

## Continuous Input Monitoring

```tsx
<GamepadController
  onInput={(joy) => {
    console.log('Axes:', joy.axes);
    console.log('Buttons:', joy.buttons);
  }}
/>
```

## Safety: Video Staleness Check

By default, gamepad commands are blocked when video feeds freeze:

```tsx
config={{
  maxVideoStalenessMs: 100, // Block if no frames for 100ms
}}

// Disable this check (not recommended)
config={{
  maxVideoStalenessMs: 0,
}}
```

This prevents "flying blind" when network issues cause video to freeze.

## Using the Hook

For programmatic access:

```tsx
import { useJoypad } from '@adamo/adamo-react';

function GamepadStatus() {
  const { isConnected, lastInput, start, stop } = useJoypad();

  return (
    <div>
      <p>Controller: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {lastInput && (
        <p>Left Stick: ({lastInput.axes[0].toFixed(2)}, {lastInput.axes[1].toFixed(2)})</p>
      )}
    </div>
  );
}
```
