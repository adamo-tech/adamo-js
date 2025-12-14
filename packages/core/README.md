# @adamo-tech/core

Core TypeScript library for robot teleoperation. Provides a simple API for video streaming, gamepad input, and heartbeat monitoring.

## Installation

```bash
pnpm add @adamo-tech/core
```

## Quick Start

```typescript
import { AdamoClient, HeartbeatManager, JoypadManager, HeartbeatState } from '@adamo-tech/core';

const client = new AdamoClient({
  serverIdentity: 'robot',
  playoutDelay: 0,
});

await client.connect('wss://your-server.com', token);

// Subscribe to video
client.subscribe('front_camera', (track) => {
  const video = document.getElementById('video') as HTMLVideoElement;
  video.srcObject = new MediaStream([track.mediaStreamTrack!]);
});

// Heartbeat monitoring
const heartbeat = new HeartbeatManager(client);
heartbeat.start();

// Gamepad input
const joypad = new JoypadManager(client);
joypad.start();
```

## Documentation

See [docs.adamohq.com](https://docs.adamohq.com) for full API documentation.

## License

MIT
