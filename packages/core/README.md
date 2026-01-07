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
```

## Data Channel Communication

All control data flows over an unreliable WebRTC data channel for minimum latency.

### Sending Control Data

```typescript
// Gamepad input
client.sendControl({
  controller1: {
    axes: [leftX, leftY, rightX, rightY],  // -1 to 1
    buttons: [0, 1, 0, 0, ...],             // 0 or 1
  },
  timestamp: Date.now(),
});

// XR/VR controller with 6DOF tracking
client.sendControl({
  controller1: {
    axes: [],
    buttons: [trigger, grip, ...],
    position: [x, y, z],                    // meters
    quaternion: [w, x, y, z],               // rotation
    handedness: 'right',
  },
  controller2: {
    // left hand...
  },
  timestamp: Date.now(),
});

// Safety heartbeat
client.sendHeartbeat(HeartbeatState.OK);
```

### Receiving Robot Data

```typescript
// Navigation data (Nav2)
client.on('mapData', (map) => {
  // Occupancy grid: -1=unknown, 0=free, 100=occupied
  console.log(map.width, map.height, map.resolution);
  console.log(map.data); // Uint8Array
});

client.on('robotPose', (pose) => {
  console.log(pose.x, pose.y, pose.theta); // AMCL localization
});

client.on('navPath', (path) => {
  console.log(path.poses); // Array of {x, y}
});

client.on('costmapData', (costmap) => {
  // Local rolling window around robot
  console.log(costmap.robot_x, costmap.robot_y);
});

// Velocity state (from /odom)
client.on('velocityStateChanged', (vel) => {
  console.log(vel.linearX, vel.linearY, vel.angularZ);
  console.log(vel.isMoving); // true if any velocity > threshold
});

// Encoder/pipeline stats from robot
client.on('robotStatsUpdated', (stats) => {
  console.log(stats.encoderLatencyMs);
  console.log(stats.captureLatencyMs);
  console.log(stats.pipelineLatencyMs);
});
```

### Navigation Goals

```typescript
// Send Nav2 goal (map frame coordinates)
await client.sendNavGoal({
  x: 1.0,
  y: 2.0,
  theta: Math.PI / 2,  // radians
});
```

## Video Tracks

```typescript
// Multi-camera support
const tracks = client.getVideoTracks();
const frontCamera = client.getVideoTrack('front_camera');
const names = client.getTrackNames(); // ['front_camera', 'arm_camera', ...]

// Video freshness check (for safety interlocks)
if (!client.isVideoFresh(100)) {
  // Video stale > 100ms, block commands
}

client.on('videoTrackReceived', (track) => {
  console.log(track.name, track.dimensions);
});
```

## Latency Monitoring

```typescript
client.on('latencyBreakdownUpdated', (breakdown) => {
  // Robot side
  breakdown.encoderLatency;   // Capture + encode
  breakdown.captureLatency;   // Camera internal
  breakdown.pipelineLatency;  // GStreamer processing

  // Network
  breakdown.applicationRtt;   // Ping/pong round trip

  // Client side
  breakdown.jitterBufferDelay;
  breakdown.decodeTime;

  // Total
  breakdown.totalLatency;
});

// Network stats
client.on('networkStatsUpdated', (stats) => {
  stats.rtt;
  stats.packetLoss;
  stats.jitter;
});
```

## Safety Managers

### HeartbeatManager

```typescript
const heartbeat = new HeartbeatManager(client, {
  interval: 500,
  checkGamepad: true,
  checkWindowFocus: true,
});

heartbeat.on('stateChanged', (state) => {
  // HeartbeatState.OK
  // HeartbeatState.WINDOW_UNFOCUSED
  // HeartbeatState.CONTROLLER_DISCONNECTED
  // HeartbeatState.HIGH_LATENCY
});

heartbeat.start();
```

### JoypadManager

```typescript
const joypad = new JoypadManager(client, {
  deadzone: 0.05,
  autorepeatRate: 20,
  maxVideoStalenessMs: 100,  // Block if video stale
});

joypad.on('input', (joy) => {
  console.log(joy.axes, joy.buttons);
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

## Types

```typescript
interface ControlMessage {
  controller1?: ControllerState;
  controller2?: ControllerState;
  timestamp: number;
}

interface ControllerState {
  axes: number[];
  buttons: number[];
  position?: [x, y, z];
  quaternion?: [w, x, y, z];
  handedness?: 'left' | 'right';
}

interface MapData {
  width: number;
  height: number;
  resolution: number;  // meters per cell
  origin_x: number;
  origin_y: number;
  data: number[];      // -1=unknown, 0=free, 100=occupied
}

interface RobotPose {
  x: number;
  y: number;
  theta: number;
  timestamp: number;
}

interface VelocityState {
  linearX: number;
  linearY: number;
  angularZ: number;
  isMoving: boolean;
  timestamp: number;
}
```

## License

MIT
