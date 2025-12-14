---
sidebar_position: 2
---

# Getting Started

## Installation

```bash
# Core library (framework agnostic)
pnpm add @adamo-tech/core

# React bindings
pnpm add @adamo-tech/react
```

## Basic Setup

### 1. Wrap your app with Teleoperate

```tsx
import { Teleoperate } from '@adamo-tech/react';

function App() {
  return (
    <Teleoperate
      config={{
        serverIdentity: 'python-bot', // Robot's participant identity
        videoCodec: 'h264',
        playoutDelay: -0.1, // Minimum buffering
      }}
      autoConnect={{
        url: 'wss://your-server.com',
        token: accessToken,
      }}
    >
      <TeleoperationUI />
    </Teleoperate>
  );
}
```

### 2. Display video feeds

```tsx
import { VideoFeed } from '@adamo-tech/react';

function TeleoperationUI() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <VideoFeed topic="front_camera" />
      <VideoFeed topic="rear_camera" />
    </div>
  );
}
```

### 3. Enable gamepad input

```tsx
import { GamepadController, HeartbeatMonitor } from '@adamo-tech/react';

function TeleoperationUI() {
  return (
    <>
      {/* These render nothing but enable functionality */}
      <HeartbeatMonitor />
      <GamepadController />

      {/* Your video feeds */}
      <VideoFeed topic="front_camera" />
    </>
  );
}
```

## Configuration Options

### AdamoClientConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `serverIdentity` | `string` | `'python-bot'` | Robot's participant identity |
| `videoCodec` | `'h264' \| 'vp8' \| 'vp9' \| 'av1'` | `'h264'` | Video codec preference |
| `playoutDelay` | `number` | `-0.1` | Jitter buffer size. Negative = minimum latency |
| `adaptiveStream` | `boolean` | `true` | Enable adaptive quality |
| `dynacast` | `boolean` | `true` | Only send video when subscribed |

### JoypadConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deviceId` | `number` | `0` | Gamepad index (0 = first) |
| `deviceName` | `string` | - | Filter by name (e.g., 'Xbox') |
| `topic` | `string` | `'joy'` | ROS topic name |
| `deadzone` | `number` | `0.05` | Axis deadzone (5%) |
| `autorepeatRate` | `number` | `20` | Hz for continuous input |
| `maxVideoStalenessMs` | `number` | `100` | Block commands if video stale |

## Next Steps

- [Video Streaming Guide](/guides/video-streaming)
- [Gamepad Input Guide](/guides/gamepad-input)
- [Multi-Controller Setup](/guides/multi-controller)
- [API Reference](/api)
