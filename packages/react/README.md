# @adamo-tech/react

React components for robot teleoperation. Declarative video feeds, gamepad input, and connection management.

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
      config={{ serverIdentity: 'robot' }}
      autoConnect={{ url: 'wss://your-server.com', token }}
    >
      <HeartbeatMonitor />
      <GamepadController />
      <VideoFeed topic="front_camera" />
    </Teleoperate>
  );
}
```

## Documentation

See [docs.adamohq.com](https://docs.adamohq.com) for full documentation.

## License

MIT
