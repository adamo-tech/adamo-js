# adamo-react

React component library for robot teleoperation. Built on top of `adamo-core`, providing declarative components for video feeds, gamepad input, and connection management.

Inspired by the declarative style of [react-three-fiber](https://github.com/pmndrs/react-three-fiber).

## Installation

```bash
npm install github:adamo-tech/adamo-react github:adamo-tech/adamo-core
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "@adamo/adamo-core": "github:adamo-tech/adamo-core",
    "@adamo/adamo-react": "github:adamo-tech/adamo-react"
  }
}
```

For a specific version, use a git tag:

```bash
npm install github:adamo-tech/adamo-react#v1.0.0 github:adamo-tech/adamo-core#v1.0.0
```

## Quick Start

```tsx
import {
  AdamoProvider,
  VideoFeed,
  GamepadController,
  HeartbeatMonitor,
  ConnectionStatus,
} from '@adamo/adamo-react';

function App() {
  return (
    <AdamoProvider
      config={{ serverIdentity: 'python-bot' }}
      autoConnect={{ url: 'wss://your-livekit-server.com', token }}
    >
      {/* Declarative controllers - just drop them in! */}
      <HeartbeatMonitor />
      <GamepadController onButtonDown={(i) => console.log('Button', i)} />

      {/* Video feeds */}
      <VideoFeed topic="front_camera" />
      <VideoFeed topic="rear_camera" />

      {/* Connection indicator */}
      <ConnectionStatus />
    </AdamoProvider>
  );
}
```

## Components

### AdamoProvider

Context provider that manages the Adamo client connection. Must wrap all other Adamo components.

```tsx
<AdamoProvider
  config={{
    serverIdentity: 'python-bot',
    adaptiveStream: true,
    dynacast: true,
    videoCodec: 'h264',
    playoutDelay: 0,
  }}
  autoConnect={{
    url: 'wss://livekit.example.com',
    token: 'your-jwt-token',
  }}
>
  {children}
</AdamoProvider>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `AdamoClientConfig` | Client configuration (see adamo-core) |
| `autoConnect` | `{ url: string; token: string }` | Auto-connect on mount |
| `children` | `ReactNode` | Child components |

---

### VideoFeed

Displays a video feed from a topic. Automatically subscribes to the topic and handles stream attachment.

```tsx
<VideoFeed topic="front_camera" />

{/* With options */}
<VideoFeed
  topic="front_camera"
  mirror={true}
  showLabel={true}
  label="Front View"
  onPlay={() => console.log('Playing')}
  onResize={(w, h) => console.log(`${w}x${h}`)}
  placeholder={<LoadingSpinner />}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `topic` | `string` | *required* | Topic name to subscribe to |
| `className` | `string` | - | CSS class for the container |
| `style` | `CSSProperties` | - | Inline styles |
| `mirror` | `boolean` | `false` | Mirror video horizontally |
| `showLabel` | `boolean` | `false` | Show topic label overlay |
| `label` | `string` | topic name | Custom label text |
| `onPlay` | `() => void` | - | Called when video starts playing |
| `onResize` | `(w, h) => void` | - | Called when video dimensions change |
| `placeholder` | `ReactNode` | "Waiting for {topic}..." | Loading placeholder |

---

### GamepadController

Enables gamepad input. Renders nothing - just enables functionality. Automatically sends joy data to the server.

```tsx
{/* Basic - just enable gamepad */}
<GamepadController />

{/* With edge-triggered button callbacks */}
<GamepadController
  onButtonDown={(index) => {
    if (index === 10) cycleCamera();  // Right bumper
  }}
  onButtonUp={(index) => {
    if (index === 6) stopAction();    // Left trigger
  }}
/>

{/* With continuous input monitoring */}
<GamepadController
  onInput={(joy) => {
    console.log('Axes:', joy.axes);
    updateSteeringUI(joy.axes[0]);
  }}
  onConnectionChange={(connected) => {
    setGamepadConnected(connected);
  }}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `JoypadConfig` | Joypad configuration (see adamo-core) |
| `onInput` | `(joy: JoyMessage) => void` | Continuous callback (fires at autorepeat rate) |
| `onButtonDown` | `(index: number) => void` | Edge-triggered: fires once on button press |
| `onButtonUp` | `(index: number) => void` | Edge-triggered: fires once on button release |
| `onConnectionChange` | `(connected: boolean) => void` | Gamepad connection state changed |

#### Button Edge Detection

The `onButtonDown` and `onButtonUp` callbacks provide **edge detection**, meaning they fire exactly once per button press/release cycle. This is ideal for toggle actions like switching camera views.

```tsx
// This fires ONCE when button 10 is pressed, not continuously
<GamepadController
  onButtonDown={(index) => {
    if (index === 10) setCurrentView((v) => (v + 1) % views.length);
  }}
/>
```

Compare this to `onInput` which fires continuously at the autorepeat rate (default 20Hz), useful for monitoring analog stick positions.

---

### HeartbeatMonitor

Enables heartbeat monitoring. Renders nothing - just enables functionality. Automatically sends heartbeat state to the server and monitors safety conditions.

```tsx
{/* Basic */}
<HeartbeatMonitor />

{/* With callbacks */}
<HeartbeatMonitor
  config={{
    interval: 500,
    latencyThreshold: 200,
  }}
  onStateChange={(state) => {
    if (state !== HeartbeatState.OK) {
      showSafetyWarning(state);
    }
  }}
  onLatencyChange={(ms) => {
    updateLatencyDisplay(ms);
  }}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `HeartbeatConfig` | Heartbeat configuration (see adamo-core) |
| `onStateChange` | `(state: HeartbeatState) => void` | Heartbeat state changed |
| `onLatencyChange` | `(ms: number) => void` | Latency measurement updated |

---

### ConnectionStatus

Displays the current connection state with a colored indicator.

```tsx
{/* Basic */}
<ConnectionStatus />

{/* Hide when connected */}
<ConnectionStatus hideWhenConnected />

{/* Custom labels and colors */}
<ConnectionStatus
  labels={{
    connected: 'Online',
    disconnected: 'Offline',
    connecting: 'Connecting...',
  }}
  colors={{
    connected: '#00ff00',
    disconnected: '#ff0000',
  }}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | CSS class |
| `style` | `CSSProperties` | - | Inline styles |
| `hideWhenConnected` | `boolean` | `false` | Hide component when connected |
| `labels` | `Partial<Record<ConnectionState, string>>` | Default labels | Custom state labels |
| `colors` | `Partial<Record<ConnectionState, string>>` | Default colors | Custom state colors |

---

## Hooks

For advanced use cases, hooks are available:

### useAdamo

Access the Adamo client and connection state.

```tsx
function MyComponent() {
  const { client, connectionState, availableTracks, connect, disconnect } = useAdamo();

  return (
    <div>
      <p>Status: {connectionState}</p>
      <p>Available tracks: {availableTracks.map(t => t.name).join(', ')}</p>
    </div>
  );
}
```

### useHeartbeat

Access heartbeat state and latency.

```tsx
function LatencyDisplay() {
  const { state, latency } = useHeartbeat();

  return (
    <div>
      <p>Safety: {HeartbeatState[state]}</p>
      <p>Latency: {latency.toFixed(0)}ms</p>
    </div>
  );
}
```

### useJoypad

Access gamepad state and input.

```tsx
function GamepadDisplay() {
  const { isConnected, lastInput, start, stop } = useJoypad();

  return (
    <div>
      <p>Gamepad: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {lastInput && (
        <p>Left stick X: {lastInput.axes[0].toFixed(2)}</p>
      )}
    </div>
  );
}
```

### useVideoTrack

Low-level hook for video track subscription.

```tsx
function CustomVideoPlayer({ topic }: { topic: string }) {
  const { track, videoRef } = useVideoTrack(topic);

  if (!track) return <p>Loading {topic}...</p>;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{ width: '100%' }}
    />
  );
}
```

---

## Example: Camera Layout with Gamepad Switching

```tsx
import { useState, useCallback } from 'react';
import {
  AdamoProvider,
  VideoFeed,
  GamepadController,
  HeartbeatMonitor,
} from '@adamo/adamo-react';

const TOPICS = ['front', 'rear', 'left', 'right'];

function CameraLayout() {
  const [mainIndex, setMainIndex] = useState(0);

  const handleButtonDown = useCallback((buttonIndex: number) => {
    // Right bumper (button 10) - next camera
    if (buttonIndex === 10) {
      setMainIndex((i) => (i + 1) % TOPICS.length);
    }
    // Left bumper (button 9) - previous camera
    if (buttonIndex === 9) {
      setMainIndex((i) => (i - 1 + TOPICS.length) % TOPICS.length);
    }
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <HeartbeatMonitor />
      <GamepadController onButtonDown={handleButtonDown} />

      {/* Sidebar thumbnails */}
      <div style={{ width: 200, display: 'flex', flexDirection: 'column' }}>
        {TOPICS.filter((_, i) => i !== mainIndex).map((topic) => (
          <div
            key={topic}
            onClick={() => setMainIndex(TOPICS.indexOf(topic))}
            style={{ flex: 1, cursor: 'pointer' }}
          >
            <VideoFeed topic={topic} />
          </div>
        ))}
      </div>

      {/* Main view */}
      <div style={{ flex: 1 }}>
        <VideoFeed topic={TOPICS[mainIndex]} showLabel />
      </div>
    </div>
  );
}

function App() {
  return (
    <AdamoProvider
      config={{ serverIdentity: 'python-bot' }}
      autoConnect={{ url: 'wss://livekit.example.com', token }}
    >
      <CameraLayout />
    </AdamoProvider>
  );
}
```

---

## TypeScript

All components and hooks are fully typed. Types are re-exported from `adamo-core` for convenience:

```tsx
import type {
  ConnectionState,
  HeartbeatState,
  HeartbeatConfig,
  JoypadConfig,
  JoyMessage,
  VideoTrack,
  AdamoClientConfig,
} from '@adamo/adamo-react';
```

---

## Compatibility

- React 18+
- Works with Next.js, Vite, Create React App
- Requires `@adamo/adamo-core` as a peer dependency

## License

MIT
