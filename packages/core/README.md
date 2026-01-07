# @adamo-tech/core

Core TypeScript library for robot teleoperation via WebRTC.

## Installation

```bash
pnpm add @adamo-tech/core
```

## Quick Start

```typescript
import { AdamoClient, HeartbeatState } from '@adamo-tech/core';

const client = new AdamoClient({ debug: true });

await client.connect({
  serverUrl: 'wss://your-server.com/ws/signal/room-id',
  roomId: 'room-id',
  token: 'your-jwt-token',
});

client.on('videoTrackReceived', (track) => {
  const video = document.getElementById('video') as HTMLVideoElement;
  video.srcObject = new MediaStream([track.mediaStreamTrack]);
});

client.sendControl({
  controller1: { axes: [0, 0, 0, 0], buttons: [0, 0, 0, 0] },
  timestamp: Date.now(),
});

client.sendHeartbeat(HeartbeatState.OK);
```

## AdamoClient

```typescript
// Connect
await client.connect({ serverUrl, roomId, token, iceServers });

// Video tracks
const track = client.getVideoTrack('front_camera');
const names = client.getTrackNames();

// Control
client.sendControl({ controller1: { axes, buttons }, timestamp });
client.sendHeartbeat(HeartbeatState.OK);

// Stats
client.networkStats;
client.trackStats.get('front_camera');
client.robotStats;

// Events
client.on('videoTrackReceived', (track) => {});
client.on('connectionStateChanged', (state) => {});
client.on('latencyBreakdownUpdated', (breakdown) => {});
```

## HeartbeatManager

```typescript
const heartbeat = new HeartbeatManager(client, {
  interval: 500,
  checkGamepad: true,
  checkWindowFocus: true,
});
heartbeat.start();
```

## JoypadManager

```typescript
const joypad = new JoypadManager(client, {
  deadzone: 0.05,
  autorepeatRate: 20,
  maxVideoStalenessMs: 100,
});
joypad.start();
```

## WebCodecs

Optional low-latency H.264 decoding:

```typescript
if (isWebCodecsSupported()) {
  const client = new AdamoClient({ useWebCodecs: true });
  client.on('decodedFrame', (frame) => {
    ctx.drawImage(frame.frame, 0, 0);
    frame.frame.close();
  });
}
```

## License

MIT
