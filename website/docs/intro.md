---
sidebar_position: 1
slug: /
---

# Introduction

**Adamo** is a TypeScript SDK for low-latency robot teleoperation over WebRTC.

- **Video Streaming** - Subscribe to camera feeds by topic name
- **Gamepad Input** - Send ROS-compatible joystick commands with < 20ms latency
- **Safety Monitoring** - Heartbeat system with automatic safety states
- **Adaptive Quality** - WebRTC stats collection for quality adaptation

## Architecture

```
┌─────────────────┐     WebRTC      ┌─────────────────┐
│   Browser       │◄───────────────►│   Robot         │
│                 │                 │                 │
│  @adamo/core    │                 │  Python Server  │
│  @adamo/react   │                 │  (ROS Bridge)   │
└─────────────────┘                 └─────────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| `@adamo/adamo-core` | Core TypeScript client - framework agnostic |
| `@adamo/adamo-react` | React components and hooks |

## Quick Example

```tsx
import { Teleoperate, VideoFeed, GamepadController } from '@adamo/adamo-react';

function App() {
  return (
    <Teleoperate
      config={{ serverIdentity: 'robot-01' }}
      autoConnect={{ url: 'wss://your-server.com', token }}
    >
      <VideoFeed topic="front_camera" />
      <GamepadController />
    </Teleoperate>
  );
}
```

## Key Features

### Low Latency Video
- Aggressive jitter buffer optimization (Selkies-style)
- H.264 hardware acceleration
- Configurable playout delay

### Gamepad to ROS
- W3C Gamepad API → `sensor_msgs/Joy` mapping
- Deadzone, autorepeat, sticky buttons
- **Multi-controller support** with configurable topics

### Safety System
- Window focus detection
- Latency monitoring
- Controller connection status
- Video staleness checks (blocks commands when video freezes)
