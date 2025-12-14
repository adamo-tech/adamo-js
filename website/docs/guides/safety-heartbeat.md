---
sidebar_position: 4
---

# Safety & Heartbeat

Adamo includes a heartbeat system for safety monitoring during teleoperation.

## HeartbeatState

The system monitors several conditions and reports the worst state:

| State | Value | Description |
|-------|-------|-------------|
| `OK` | 0 | All checks pass |
| `WINDOW_UNFOCUSED` | 1 | Browser tab is not active |
| `HIGH_LATENCY` | 2 | Network RTT exceeds threshold |
| `CONTROLLER_DISCONNECTED` | 3 | No gamepad detected |
| `HEARTBEAT_MISSING` | 4 | Server-side only - client stopped sending |

## Enabling Heartbeat

```tsx
import { HeartbeatMonitor } from '@adamo/adamo-react';

function App() {
  return (
    <Teleoperate config={...} autoConnect={...}>
      <HeartbeatMonitor />  {/* Renders nothing, enables monitoring */}
      <VideoFeed topic="camera" />
    </Teleoperate>
  );
}
```

## Reading State

```tsx
import { useHeartbeat, HeartbeatState } from '@adamo/adamo-react';

function SafetyIndicator() {
  const { state } = useHeartbeat();

  const labels = {
    [HeartbeatState.OK]: '✅ OK',
    [HeartbeatState.WINDOW_UNFOCUSED]: '⚠️ Tab Unfocused',
    [HeartbeatState.HIGH_LATENCY]: '🔴 High Latency',
    [HeartbeatState.CONTROLLER_DISCONNECTED]: '🎮 No Controller',
    [HeartbeatState.HEARTBEAT_MISSING]: '❌ Heartbeat Lost',
  };

  return <div>{labels[state]}</div>;
}
```

## Robot-Side Handling

The robot should implement safety behavior based on heartbeat state:

```python
# ROS 2 example
import time
import json

class SafetyMonitor:
    def __init__(self, connection):
        self.last_heartbeat = time.time()
        self.state = 0  # OK

        # Register heartbeat handler
        connection.register_rpc_method(
            'heartbeat', self.handle_heartbeat
        )

    async def handle_heartbeat(self, data):
        payload = json.loads(data.payload)
        self.state = payload['state']
        self.last_heartbeat = time.time()

        # Return acknowledgment
        return json.dumps({'received': True})

    def check_safety(self):
        # Check for missing heartbeat
        if time.time() - self.last_heartbeat > 1.0:
            self.state = 4  # HEARTBEAT_MISSING

        # Implement safety behavior
        if self.state != 0:
            self.slow_down()
        if self.state >= 3:
            self.stop()
```

## Video Staleness Safety

The gamepad manager includes a safety feature that blocks commands when video freezes:

```tsx
<GamepadController
  config={{
    maxVideoStalenessMs: 100, // Default: block if no frames for 100ms
  }}
/>
```

This prevents operators from "flying blind" when network issues cause video to freeze while commands still get through.

### How It Works

1. SDK tracks when each video track receives decoded frames
2. Before sending each joy message, checks if majority of tracks are fresh
3. If video is stale, commands are silently dropped
4. When video recovers, commands resume automatically

### Disabling (Not Recommended)

```tsx
config={{
  maxVideoStalenessMs: 0, // Disable staleness check
}}
```

## Using with StatsOverlay

The `StatsOverlay` component shows safety state along with latency metrics:

```tsx
import { StatsOverlay } from '@adamo/adamo-react';

<StatsOverlay position="bottom-left" />
```

This displays:
- Current heartbeat state
- Gamepad connection status
- End-to-end latency breakdown
- Network statistics
