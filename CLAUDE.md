# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adamo is a robot teleoperation system built on LiveKit WebRTC. It provides low-latency video streaming from robots and sends gamepad control data back to them.

## Monorepo Structure

```
packages/
  core/       - @adamo-tech/core: Core TypeScript client library (AdamoClient, HeartbeatManager, JoypadManager)
  react/      - @adamo-tech/react: React components and hooks for teleoperation UI
apps/
  client/     - Next.js 16 web app for controlling robots
```

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages (runs in dependency order)
pnpm build

# Run all packages in dev mode (parallel)
pnpm dev

# Type check all packages
pnpm typecheck

# Clean build outputs
pnpm clean

# Run only the Next.js client
pnpm --filter @adamo/client dev

# Build only core library
pnpm --filter @adamo-tech/core build
```

## Architecture

### Core Library (`@adamo-tech/core`)

The `AdamoClient` class wraps LiveKit's `Room` to provide:
- Video track subscription by topic name (maps to ROS camera topics)
- Joy data sending via lossy data channel for minimum latency
- Heartbeat RPC for safety monitoring
- Nav2 integration (map, costmap, pose, path data via data channels)
- WebRTC stats collection for adaptive streaming

Key classes:
- `AdamoClient`: Main connection and messaging (client.ts)
- `HeartbeatManager`: Safety state monitoring - window focus, latency, gamepad (heartbeat.ts)
- `JoypadManager`: Gamepad polling and ROS Joy message formatting (joypad.ts)

### React Library (`@adamo-tech/react`)

Declarative components following react-three-fiber style:

```tsx
<AdamoProvider config={{ serverIdentity: 'python-bot' }} autoConnect={{ url, token }}>
  <HeartbeatMonitor />           {/* Invisible - enables safety monitoring */}
  <GamepadController />          {/* Invisible - enables gamepad input */}
  <VideoFeed topic="front_camera" />
</AdamoProvider>
```

Key patterns:
- `AdamoProvider` creates and manages the AdamoClient instance
- Components like `HeartbeatMonitor` and `GamepadController` render nothing but enable functionality
- Hooks (`useAdamo`, `useHeartbeat`, `useJoypad`, `useVideoTrack`) for custom implementations

### Client App (`@adamo/client`)

Next.js 16 app with:
- Authentication flow storing tokens in sessionStorage
- Room selection with gamepad D-pad navigation
- Draggable/resizable camera grid using react-rnd
- LiveKit token generation via `/api/token` route

## Key Types

```typescript
// Safety states sent to robot
enum HeartbeatState {
  OK = 0,
  WINDOW_UNFOCUSED = 1,
  HIGH_LATENCY = 2,
  CONTROLLER_DISCONNECTED = 3,
  HEARTBEAT_MISSING = 4,  // Server-side only
}

// Video codec options
videoCodec: 'h264' | 'vp8' | 'vp9' | 'av1'

// Playback latency control
playoutDelay: number  // Negative for minimum buffering (e.g., -0.1)
```

## Server Communication

- **Video**: LiveKit tracks named by ROS topic (e.g., "front_camera", "fork")
- **Joy data**: Lossy data channel, topic "joy", ROS `sensor_msgs/Joy` format
- **Heartbeat**: RPC method "heartbeat" to server identity (default: "python-bot")
- **Nav data**: Data channels "nav/map", "nav/position", "nav/path", "nav/costmap"
- **Stats**: Server sends encoder stats on "stats/encoder" topic
