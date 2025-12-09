# adamo-core

Core JavaScript/TypeScript library for robot teleoperation via LiveKit. Abstracts WebRTC complexity and provides a simple API for video streaming, gamepad input, and heartbeat monitoring.

## Installation

```bash
npm install github:adamo-tech/adamo-core
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "@adamo/adamo-core": "github:adamo-tech/adamo-core"
  }
}
```

For a specific version, use a git tag:

```bash
npm install github:adamo-tech/adamo-core#v1.0.0
```

## Quick Start

```typescript
import { AdamoClient, HeartbeatManager, JoypadManager, HeartbeatState } from '@adamo/adamo-core';

// Create client
const client = new AdamoClient({
  serverIdentity: 'python-bot',
  playoutDelay: 0,  // Minimum latency
});

// Connect to LiveKit server
await client.connect('wss://your-livekit-server.com', token);

// Subscribe to video feeds
client.subscribe('front_camera', (track) => {
  const video = document.getElementById('video') as HTMLVideoElement;
  video.srcObject = new MediaStream([track.mediaStreamTrack!]);
});

// Start heartbeat monitoring
const heartbeat = new HeartbeatManager(client);
heartbeat.onStateChange((state) => {
  console.log('Safety state:', HeartbeatState[state]);
});
heartbeat.start();

// Start gamepad input
const joypad = new JoypadManager(client);
joypad.onInput((joy) => {
  console.log('Axes:', joy.axes, 'Buttons:', joy.buttons);
});
joypad.start();
```

## API Reference

### AdamoClient

Main client class for connecting to the teleoperation server.

#### Constructor

```typescript
new AdamoClient(config?: AdamoClientConfig)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `serverIdentity` | `string` | `'python-bot'` | Server participant identity to communicate with |
| `adaptiveStream` | `boolean` | `true` | Enable adaptive streaming for automatic quality adjustment |
| `dynacast` | `boolean` | `true` | Enable dynacast for bandwidth efficiency |
| `videoCodec` | `'h264' \| 'vp8' \| 'vp9' \| 'av1'` | `'h264'` | Video codec preference |
| `playoutDelay` | `number` | `0` | Playout delay in seconds (0 = minimum latency) |

#### Methods

##### `connect(url: string, token: string): Promise<void>`

Connect to the LiveKit server.

```typescript
await client.connect('wss://livekit.example.com', token);
```

##### `disconnect(): void`

Disconnect from the server.

```typescript
client.disconnect();
```

##### `subscribe(topicName: string, callback: (track: VideoTrack) => void): () => void`

Subscribe to a video topic. Returns an unsubscribe function.

```typescript
const unsubscribe = client.subscribe('front_camera', (track) => {
  videoElement.srcObject = new MediaStream([track.mediaStreamTrack!]);
});

// Later: unsubscribe
unsubscribe();
```

##### `getAvailableTracks(): VideoTrack[]`

Get all available video tracks from the server.

```typescript
const tracks = client.getAvailableTracks();
tracks.forEach(t => console.log(t.name));
```

##### `sendJoyData(axes: number[], buttons: number[]): Promise<void>`

Send joypad data to the server. Uses lossy (unreliable) transport for minimum latency.

```typescript
await client.sendJoyData(
  [0.5, -0.3, 0, 0],  // axes
  [0, 1, 0, 0, 0]     // buttons
);
```

##### `sendHeartbeat(state: number): Promise<void>`

Send heartbeat state to the server via RPC.

```typescript
await client.sendHeartbeat(HeartbeatState.OK);
```

##### `on(event, handler): () => void`

Add an event listener. Returns an unsubscribe function.

```typescript
const unsub = client.on('connectionStateChanged', (state) => {
  console.log('Connection:', state);
});
```

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connectionStateChanged` | `ConnectionState` | Connection state changed |
| `trackAvailable` | `VideoTrack` | New video track available |
| `trackRemoved` | `string` (trackName) | Track was removed |
| `trackSubscribed` | `VideoTrack` | Track subscription confirmed |
| `trackUnsubscribed` | `string` (trackName) | Track was unsubscribed |
| `heartbeatStateChanged` | `HeartbeatState` | Heartbeat state changed |
| `error` | `Error` | An error occurred |

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `connectionState` | `ConnectionState` | Current connection state |
| `liveKitRoom` | `Room` | Underlying LiveKit Room instance |
| `serverIdentity` | `string` | Server identity being communicated with |

---

### HeartbeatManager

Manages heartbeat monitoring and sending to the server. Automatically monitors:
- Gamepad connection status
- Window focus state
- Network latency

#### Constructor

```typescript
new HeartbeatManager(client: AdamoClient, config?: HeartbeatConfig)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `interval` | `number` | `500` | Heartbeat interval in ms |
| `latencyThreshold` | `number` | `200` | RTT threshold for HIGH_LATENCY state (ms) |
| `checkGamepad` | `boolean` | `true` | Whether to check gamepad connection |
| `checkWindowFocus` | `boolean` | `true` | Whether to check window focus |

#### Methods

##### `start(): void`

Start sending heartbeats.

##### `stop(): void`

Stop sending heartbeats.

##### `onStateChange(callback: (state: HeartbeatState) => void): () => void`

Register a callback for state changes.

```typescript
heartbeat.onStateChange((state) => {
  if (state !== HeartbeatState.OK) {
    showWarning(HeartbeatState[state]);
  }
});
```

##### `setLatency(latencyMs: number): void`

Manually set latency value (useful for external measurements).

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `state` | `HeartbeatState` | Current heartbeat state |
| `currentLatency` | `number` | Current measured latency in ms |

---

### JoypadManager

Manages gamepad input and sends to the server. Maps W3C Gamepad API to ROS `sensor_msgs/Joy` format.

#### Constructor

```typescript
new JoypadManager(client: AdamoClient, config?: JoypadConfig)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deviceId` | `number` | `0` | Which gamepad to use (0 = first) |
| `deviceName` | `string` | `undefined` | Filter by gamepad name |
| `deadzone` | `number` | `0.05` | Axis deadzone (5%) |
| `autorepeatRate` | `number` | `20` | Send rate in Hz (0 = only on change) |
| `stickyButtons` | `boolean` | `false` | Toggle mode for buttons |
| `coalesceIntervalMs` | `number` | `1` | Debounce interval in ms |

#### Methods

##### `start(): void`

Start polling gamepad and sending joy messages.

##### `stop(): void`

Stop polling and sending.

##### `onInput(callback: (msg: JoyMessage) => void): () => void`

Register a callback for joy input events.

```typescript
joypad.onInput((msg) => {
  console.log('Axes:', msg.axes);
  console.log('Buttons:', msg.buttons);
});
```

##### `getGamepad(): Gamepad | null`

Get the currently connected gamepad.

##### `isConnected(): boolean`

Check if a gamepad is connected.

---

### Types

#### ConnectionState

```typescript
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
```

#### HeartbeatState

```typescript
enum HeartbeatState {
  OK = 0,                      // All checks pass
  WINDOW_UNFOCUSED = 1,        // Browser window not focused
  HIGH_LATENCY = 2,            // Network RTT exceeds threshold
  CONTROLLER_DISCONNECTED = 3, // No gamepad detected
  HEARTBEAT_MISSING = 4,       // Server-side: heartbeats stopped
}
```

#### VideoTrack

```typescript
interface VideoTrack {
  name: string;                    // Track name (matches ROS topic)
  sid: string;                     // Track SID
  subscribed: boolean;             // Whether subscribed
  muted: boolean;                  // Whether muted
  dimensions?: {
    width: number;
    height: number;
  };
  mediaStreamTrack?: MediaStreamTrack;  // The underlying track
}
```

#### JoyMessage

ROS-compatible Joy message format:

```typescript
interface JoyMessage {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  axes: number[];     // Analog stick values [-1.0, 1.0]
  buttons: number[];  // Button states (0 or 1)
}
```

## License

MIT
