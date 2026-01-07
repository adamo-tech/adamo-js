# @adamo-tech/react

React components and hooks for robot teleoperation.

## Installation

```bash
pnpm add @adamo-tech/react @adamo-tech/core
```

## Quick Start

```tsx
import {
  Teleoperate,
  VideoFeed,
  GamepadController,
  HeartbeatMonitor,
} from '@adamo-tech/react';

function App() {
  return (
    <Teleoperate
      signaling={{ serverUrl, roomId, token }}
      autoConnect
    >
      <HeartbeatMonitor />
      <GamepadController />
      <VideoFeed trackName="front_camera" />
    </Teleoperate>
  );
}
```

## Components

| Component | Description |
|-----------|-------------|
| `Teleoperate` | Provider that manages WebRTC connection |
| `VideoFeed` | Video display with low-latency settings |
| `GamepadController` | Enables gamepad input (renders nothing) |
| `HeartbeatMonitor` | Enables safety monitoring (renders nothing) |
| `StatsOverlay` | Real-time latency/stats display |
| `AutoVideoLayout` | Auto-detect and display all video tracks |
| `MultiModeLayout` | Multi-camera grid with mode switching |
| `XRTeleop` | WebXR stereo rendering |
| `ConnectionStatus` | Connection state indicator |
| `MapViewer` | Nav2 map visualization |

## Hooks

| Hook | Returns |
|------|---------|
| `useAdamo()` | `{ client, connectionState, connect, disconnect }` |
| `useVideoTrack(name?)` | `{ track, videoRef, availableTrackNames }` |
| `useHeartbeat()` | `{ state }` |
| `useJoypad()` | `{ isConnected, lastInput }` |
| `useLatencyBreakdown()` | Latency breakdown object |
| `useNav()` | `{ map, robotPose, path, sendGoal }` |
| `useVelocity()` | `{ velocityState, isMoving }` |

## Auth & Room Management

```tsx
import {
  useAuth,
  useRooms,
  useRoomConnection,
  useGamepadNavigation,
} from '@adamo-tech/react';

function App() {
  const { isAuthenticated, session, login, logout } = useAuth();
  const { rooms } = useRooms({ accessToken: session?.accessToken });
  const { signalingConfig, connectToRoom, disconnect } = useRoomConnection({
    accessToken: session?.accessToken,
  });
  const { selectedIndex } = useGamepadNavigation({
    items: rooms,
    onSelect: (room) => connectToRoom(room.id),
  });

  if (signalingConfig) {
    return (
      <Teleoperate signaling={signalingConfig} autoConnect>
        <VideoFeed />
      </Teleoperate>
    );
  }

  // Render login or room selection...
}
```

| Hook | Purpose |
|------|---------|
| `useAuth()` | Login, logout, session persistence |
| `useRooms()` | Fetch available rooms |
| `useRoomConnection()` | Get room token and signaling config |
| `useGamepadNavigation()` | D-pad navigation for menus |

## License

MIT
