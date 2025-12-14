---
sidebar_position: 4
---

# GamepadController

Invisible component that enables gamepad input.

## Usage

```tsx
import { GamepadController } from '@adamo-tech/react';

// Basic - renders nothing, enables input
<GamepadController />

// With callbacks
<GamepadController
  onButtonDown={(btn) => console.log('Pressed:', btn)}
  onInput={(joy) => console.log('Axes:', joy.axes)}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `JoypadConfig` | Gamepad configuration |
| `onInput` | `(joy: JoyMessage) => void` | Continuous input (at autorepeat rate) |
| `onButtonDown` | `(buttonIndex: number) => void` | Button press (0→1) |
| `onButtonUp` | `(buttonIndex: number) => void` | Button release (1→0) |
| `onConnectionChange` | `(connected: boolean) => void` | Controller connect/disconnect |

## Multi-Controller

```tsx
<GamepadController config={{ deviceId: 0, topic: 'joy_driver' }} />
<GamepadController config={{ deviceId: 1, topic: 'joy_passenger' }} />
```

See [Multi-Controller Guide](/guides/multi-controller) for details.
