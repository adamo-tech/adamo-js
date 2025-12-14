---
sidebar_position: 1
---

# Video Streaming

Stream video from your robot with just a few lines of React.

## Minimal Example

```tsx
import { Teleoperate, VideoFeed } from '@adamo/adamo-react';

function App() {
  return (
    <Teleoperate
      config={{ serverIdentity: 'robot-01' }}
      autoConnect={{
        url: 'wss://your-server.com',
        token: 'your-access-token'
      }}
    >
      <VideoFeed topic="front_camera" />
    </Teleoperate>
  );
}

export default App;
```

That's it. The `VideoFeed` component automatically:
- Subscribes to the video track
- Handles connection/reconnection
- Applies low-latency optimizations
- Shows a loading state while waiting for video

## Full App: Single Camera

Here's a complete React app with a single camera feed:

```tsx
// App.tsx
import { Teleoperate, VideoFeed } from '@adamo/adamo-react';

function App() {
  const serverUrl = 'wss://your-server.com';
  const token = 'your-access-token'; // Get this from your auth flow

  return (
    <Teleoperate
      config={{
        serverIdentity: 'robot-01',
        videoCodec: 'h264',
        playoutDelay: -0.1, // Minimum buffering for lowest latency
      }}
      autoConnect={{ url: serverUrl, token }}
    >
      <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
        <VideoFeed topic="front_camera" />
      </div>
    </Teleoperate>
  );
}

export default App;
```

## Full App: Multiple Cameras

A more realistic setup with multiple camera feeds:

```tsx
// App.tsx
import { Teleoperate, VideoFeed, StatsOverlay } from '@adamo/adamo-react';

function App() {
  const serverUrl = 'wss://your-server.com';
  const token = 'your-access-token';

  return (
    <Teleoperate
      config={{
        serverIdentity: 'robot-01',
        videoCodec: 'h264',
        playoutDelay: -0.1,
      }}
      autoConnect={{ url: serverUrl, token }}
    >
      <div style={styles.container}>
        {/* Main view */}
        <div style={styles.mainFeed}>
          <VideoFeed topic="front_camera" />
        </div>

        {/* Picture-in-picture views */}
        <div style={styles.pipContainer}>
          <div style={styles.pip}>
            <VideoFeed topic="left_camera" showLabel label="Left" />
          </div>
          <div style={styles.pip}>
            <VideoFeed topic="right_camera" showLabel label="Right" />
          </div>
          <div style={styles.pip}>
            <VideoFeed topic="rear_camera" showLabel label="Rear" />
          </div>
        </div>

        {/* Latency stats overlay */}
        <StatsOverlay position="bottom-left" />
      </div>
    </Teleoperate>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: '#000',
    position: 'relative' as const,
  },
  mainFeed: {
    width: '100%',
    height: '100%',
  },
  pipContainer: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  pip: {
    width: 240,
    height: 135,
    borderRadius: 8,
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.2)',
  },
};

export default App;
```

## Full App: With Gamepad Control

Add gamepad input for teleoperation:

```tsx
// App.tsx
import {
  Teleoperate,
  VideoFeed,
  GamepadController,
  HeartbeatMonitor,
  StatsOverlay,
} from '@adamo/adamo-react';

function App() {
  const serverUrl = 'wss://your-server.com';
  const token = 'your-access-token';

  return (
    <Teleoperate
      config={{
        serverIdentity: 'robot-01',
        videoCodec: 'h264',
        playoutDelay: -0.1,
      }}
      autoConnect={{ url: serverUrl, token }}
    >
      {/* These render nothing but enable functionality */}
      <HeartbeatMonitor />
      <GamepadController />

      {/* Your UI */}
      <div style={styles.container}>
        <div style={styles.grid}>
          <VideoFeed topic="left_camera" showLabel />
          <VideoFeed topic="front_camera" showLabel />
          <VideoFeed topic="right_camera" showLabel />
        </div>
        <StatsOverlay position="bottom-left" />
      </div>
    </Teleoperate>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: '#000',
    position: 'relative' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    padding: 8,
    height: '100%',
  },
};

export default App;
```

## VideoFeed Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `topic` | `string` | required | Topic name matching the robot's video track |
| `showLabel` | `boolean` | `false` | Show topic name overlay |
| `label` | `string` | topic | Custom label text |
| `mirror` | `boolean` | `false` | Mirror the video horizontally |
| `placeholder` | `ReactNode` | - | Custom loading state |
| `onPlay` | `() => void` | - | Called when video starts |
| `onResize` | `(w, h) => void` | - | Called when dimensions change |
| `className` | `string` | - | CSS class for the video element |
| `style` | `CSSProperties` | - | Inline styles |

## Using the Hook Directly

For custom video implementations:

```tsx
import { useVideoTrack } from '@adamo/adamo-react';

function CustomPlayer({ topic }: { topic: string }) {
  const { track, videoRef } = useVideoTrack(topic);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
```
