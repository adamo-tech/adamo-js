# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adamo is a robot teleoperation system using native WebRTC. It provides low-latency video streaming from robots and sends gamepad control data back to them via WebRTC data channels.

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

The `AdamoClient` class manages native WebRTC connections:
- Video track reception (multi-track support with track names from server)
- Control data sending via unreliable data channel for minimum latency
- Heartbeat monitoring for safety
- WebCodecs support for ultra-low-latency video decoding
- WebRTC stats collection

Key classes:
- `AdamoClient`: Main connection and messaging (client.ts)
- `WebRTCConnection`: Low-level WebRTC/signaling handling (webrtc/connection.ts)
- `HeartbeatManager`: Safety state monitoring - window focus, latency, gamepad (heartbeat.ts)
- `JoypadManager`: Gamepad polling and ROS Joy message formatting (joypad.ts)

### React Library (`@adamo-tech/react`)

Declarative components following react-three-fiber style:

```tsx
<Teleoperate
  config={{ debug: true }}
  signaling={{ serverUrl, roomId, token, iceServers }}
  autoConnect
>
  <HeartbeatMonitor />           {/* Invisible - enables safety monitoring */}
  <GamepadController />          {/* Invisible - enables gamepad input */}
  <VideoFeed trackName="front_camera" />
</Teleoperate>
```

Key patterns:
- `Teleoperate` creates and manages the AdamoClient instance
- Components like `HeartbeatMonitor` and `GamepadController` render nothing but enable functionality
- Hooks (`useAdamo`, `useHeartbeat`, `useJoypad`, `useVideoTrack`) for custom implementations

### Client App (`@adamo/client`)

Next.js 16 app with:
- Authentication flow storing tokens in sessionStorage
- Room selection with gamepad D-pad navigation
- Draggable/resizable camera grid using react-rnd
- WebRTC signaling via backend WebSocket

## Key Types

```typescript
// Signaling configuration
interface SignalingConfig {
  serverUrl: string;      // WebSocket signaling URL
  roomId: string;         // Room identifier
  token?: string;         // Auth token (via subprotocol)
  iceServers?: RTCIceServer[];
}

// Safety states sent to robot
enum HeartbeatState {
  OK = 0,
  WINDOW_UNFOCUSED = 1,
  HIGH_LATENCY = 2,
  CONTROLLER_DISCONNECTED = 3,
  HEARTBEAT_MISSING = 4,  // Server-side only
}

// Control message format
interface ControlMessage {
  controller1?: { axes: number[]; buttons: number[]; position?: [x,y,z]; quaternion?: [w,x,y,z] };
  controller2?: { ... };
  timestamp: number;
}
```

## Server Communication

- **Signaling**: WebSocket at `/ws/signal/{room_id}` with token via subprotocol
- **Video**: WebRTC tracks with names from offer metadata (e.g., "front_camera")
- **Control data**: Unreliable data channel "control", JSON messages
- **Heartbeat**: Sent via data channel as `{ type: "heartbeat", state: 0, timestamp: ... }`
