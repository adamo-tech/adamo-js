---
sidebar_position: 1
---

# React Components Overview

`@adamo-tech/react` provides React components and hooks for building teleoperation UIs.

## Installation

```bash
pnpm add @adamo-tech/react
```

## Component Types

### Provider
- **Teleoperate** - Context provider, wraps your app

### Visible Components
- **VideoFeed** - Displays a camera stream
- **StatsOverlay** - Latency and status display
- **MultiModeLayout** - Configurable camera grid with mode switching
- **ConnectionStatus** - Connection state indicator
- **MapViewer** - Nav2 map display
- **CostmapViewer** - Local costmap display

### Invisible Controllers
These render nothing but enable functionality:
- **HeartbeatMonitor** - Enables safety heartbeat
- **GamepadController** - Enables gamepad input

## Hooks

| Hook | Purpose |
|------|---------|
| `useAdamo` | Access client, connection state, tracks |
| `useVideoTrack` | Subscribe to a video track |
| `useJoypad` | Gamepad state and control |
| `useHeartbeat` | Safety state monitoring |
| `useAdaptiveStream` | Network and track statistics |
| `useVelocity` | Robot velocity state |
| `useNav` | Navigation data (map, pose, path) |
| `useCostmap` | Local costmap data |

## Basic Pattern

```tsx
import {
  Teleoperate,
  VideoFeed,
  GamepadController,
  HeartbeatMonitor,
  StatsOverlay,
} from '@adamo-tech/react';

function TeleoperationApp() {
  return (
    <Teleoperate
      config={{ serverIdentity: 'robot-01' }}
      autoConnect={{ url, token }}
    >
      {/* Invisible - enable functionality */}
      <HeartbeatMonitor />
      <GamepadController />

      {/* Visible UI */}
      <VideoFeed topic="front" />
      <StatsOverlay />
    </Teleoperate>
  );
}
```

## Re-exported Types

For convenience, core types are re-exported:

```tsx
import {
  HeartbeatState,
  StreamQuality,
  type ConnectionState,
  type JoypadConfig,
  type VideoTrack,
} from '@adamo-tech/react';
```
