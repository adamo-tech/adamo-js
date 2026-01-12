# Adamo

Robot teleoperation SDK using native WebRTC. Low-latency video streaming from robots with gamepad and VR controller input.

## Packages

| Package | Description |
|---------|-------------|
| `@adamo-tech/core` | TypeScript client library for WebRTC connection, control messaging, and safety monitoring |
| `@adamo-tech/react` | React components and hooks for building teleoperation UIs |

## Installation

```bash
npm install @adamo-tech/core
npm install @adamo-tech/react
```

## Quick Start

Complete app with authentication, room selection, and auto-detected video feeds:

```tsx
import {
  Teleoperate,
  AutoVideoLayout,
  useAuth,
  useRooms,
  useRoomConnection,
} from '@adamo-tech/react';

const API_URL = 'https://api.example.com';

function App() {
  const { isAuthenticated, session, login } = useAuth({ apiUrl: API_URL });
  const { rooms } = useRooms({ accessToken: session?.accessToken });
  const { signalingConfig, connectToRoom } = useRoomConnection({
    accessToken: session?.accessToken,
  });

  if (!isAuthenticated) {
    return <button onClick={() => login('user', 'pass')}>Login</button>;
  }

  if (signalingConfig) {
    return (
      <Teleoperate signaling={signalingConfig} autoConnect>
        <AutoVideoLayout />
      </Teleoperate>
    );
  }

  return (
    <ul>
      {rooms.map((room) => (
        <li key={room.id} onClick={() => connectToRoom(room.id)}>
          {room.name}
        </li>
      ))}
    </ul>
  );
}
```

### Adding Gamepad Control

```tsx
import { GamepadController, HeartbeatMonitor } from '@adamo-tech/react';

<Teleoperate signaling={signalingConfig} autoConnect>
  <HeartbeatMonitor />
  <GamepadController />
  <AutoVideoLayout />
</Teleoperate>
```

`HeartbeatMonitor` sends safety heartbeats - robot stops if connection is lost. `GamepadController` sends gamepad input to the robot.

## Features

**Video**
- Multi-camera support with named tracks
- WebCodecs for ultra-low-latency H.264 decoding
- Stereo video for VR headsets (top/bottom format)

**Control**
- Gamepad input with configurable deadzone
- VR/XR 6DOF tracking (head + controllers)
- Safety heartbeat with automatic stop on disconnect

**Navigation (Nav2)**
- Occupancy grid map display
- Robot pose from AMCL localization
- Click-to-navigate goal sending
- Local costmap visualization

**Monitoring**
- End-to-end latency breakdown (robot + network + client)
- Network stats (RTT, packet loss, jitter)
- Video freshness checks for safety interlocks

## React Components

| Component | Description |
|-----------|-------------|
| `Teleoperate` | Provider that manages WebRTC connection |
| `VideoFeed` | Video display with low-latency settings |
| `GamepadController` | Enables gamepad input (renders nothing) |
| `HeartbeatMonitor` | Enables safety monitoring (renders nothing) |
| `StatsOverlay` | Real-time latency/stats display |
| `AutoVideoLayout` | Auto-detect and display all video tracks |
| `XRTeleop` | WebXR stereo rendering for VR headsets |
| `MapViewer` | Nav2 map with click-to-navigate |

## Hooks

| Hook | Purpose |
|------|---------|
| `useAdamo()` | Access client, connection state, connect/disconnect |
| `useVideoTrack()` | Get video track by name |
| `useTopic()` | Subscribe to a topic streamed from the robot |
| `useTopics()` | Subscribe to multiple topics at once |
| `useXRTracking()` | Capture XR head/controller poses (requires entering VR) |
| `useNav()` | Map, robot pose, path, and goal sending |
| `useVelocity()` | Robot velocity state and movement detection |
| `useLatencyBreakdown()` | Full latency breakdown |
| `useAuth()` | Login, logout, session persistence |
| `useRooms()` | Fetch available rooms |
| `useRoomConnection()` | Get signaling config for a room |

## Monorepo Structure

```
packages/
  core/       - @adamo-tech/core
  react/      - @adamo-tech/react
apps/
  client/     - Next.js web app
```

## Development

```bash
pnpm install       # Install dependencies
pnpm build         # Build all packages
pnpm dev           # Run in dev mode
pnpm typecheck     # Type check all packages
```

