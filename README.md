# Adamo

Robot teleoperation SDK using native WebRTC. Low-latency video streaming from robots with gamepad and VR controller input.

## Packages

| Package | Description |
|---------|-------------|
| `@adamo-tech/core` | TypeScript client library for WebRTC connection, control messaging, and safety monitoring |
| `@adamo-tech/react` | React components and hooks for building teleoperation UIs |

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

