# @adamo-tech/react

React components and hooks for robot teleoperation.

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
      signaling={{ serverUrl, roomId, token }}
      autoConnect
    >
      <HeartbeatMonitor />
      <GamepadController />
      <VideoFeed trackName="front_camera" />
    </Teleoperate>
  );
}
```

## Components

| Component | Description |
|-----------|-------------|
| `Teleoperate` | Provider that manages WebRTC connection |
| `VideoFeed` | Video display with low-latency settings |
| `GamepadController` | Enables gamepad input (renders nothing) |
| `HeartbeatMonitor` | Enables safety monitoring (renders nothing) |
| `StatsOverlay` | Real-time latency/stats display |
| `AutoVideoLayout` | Auto-detect and display all video tracks |
| `MultiModeLayout` | Multi-camera grid with mode switching |
| `XRTeleop` | WebXR stereo rendering for VR headsets |
| `ConnectionStatus` | Connection state indicator |
| `MapViewer` | Nav2 map with click-to-navigate |
| `CostmapViewer` | Local costmap visualization |

## XR/VR Teleoperation

For VR headset control with 6DOF tracking:

```tsx
import { Teleoperate, XRTeleop, StatsOverlay } from '@adamo-tech/react';

function VRApp() {
  return (
    <Teleoperate signaling={signalingConfig} autoConnect>
      <XRTeleop
        onEnterVR={() => console.log('Entered VR')}
        onExitVR={() => console.log('Exited VR')}
      />
      <StatsOverlay />
    </Teleoperate>
  );
}
```

### Stereo Video Format

The robot sends stereo video in **top/bottom format**:
- **Top half**: Left eye view
- **Bottom half**: Right eye view
- Typical resolution: 1920x2160 (1080p per eye, stacked)

The `XRTeleop` component splits this and renders each half to the corresponding eye with convergence adjustment.

### XR Data Sent to Robot

Every frame, head and controller poses are sent over the data channel:

```typescript
{
  head: {
    position: [x, y, z],           // meters, local-floor space
    quaternion: [w, x, y, z],      // rotation (w first)
  },
  controller1: {                   // right hand
    handedness: 'right',
    position: [x, y, z],
    quaternion: [w, x, y, z],
    buttons: [
      { pressed: true, value: 1.0 },   // trigger
      { pressed: false, value: 0.0 },  // grip
      // ... more buttons
    ],
    axes: [0.0, 0.0, 0.0, 0.0],    // thumbstick x, y, ...
  },
  controller2: { /* left hand */ },
  timestamp: number,
}
```

Coordinate system: WebXR `local-floor` reference space (Y-up, origin at floor level).

## Navigation (Nav2)

```tsx
import { MapViewer, useNav } from '@adamo-tech/react';

function NavPanel() {
  const { map, robotPose, path, sendGoal } = useNav();

  return (
    <MapViewer
      map={map}
      robotPose={robotPose}
      path={path}
      showRobot
      showPath
      onGoalClick={(goal) => sendGoal(goal)}
    />
  );
}
```

Data received from robot:
- **Map**: Occupancy grid from `/map` topic
- **Pose**: Robot position from AMCL `/amcl_pose`
- **Path**: Planned path from Nav2 planner
- **Costmap**: Local rolling window for obstacle avoidance

## Velocity & Safety

```tsx
import { useVelocity, MultiModeLayout } from '@adamo-tech/react';

function CameraGrid() {
  const { isMoving } = useVelocity();

  return (
    <MultiModeLayout
      modes={CAMERA_MODES}
      canSwitchMode={() => !isMoving}  // Block mode switch while moving
      blockedWarning="Stop robot first"
    />
  );
}
```

## Hooks

### Core Hooks

| Hook | Returns |
|------|---------|
| `useAdamo()` | `{ client, connectionState, connect, disconnect }` |
| `useVideoTrack(name?)` | `{ track, videoRef, availableTrackNames }` |
| `useHeartbeat()` | `{ state }` |
| `useJoypad()` | `{ isConnected, lastInput }` |
| `useWebCodecs()` | `{ enabled, enable, disable, latestFrame }` |

### Navigation Hooks

| Hook | Returns |
|------|---------|
| `useNav()` | `{ map, robotPose, path, sendGoal }` |
| `useCostmap()` | `{ costmap }` |
| `useVelocity()` | `{ velocityState, isMoving }` |

### Stats Hooks

| Hook | Returns |
|------|---------|
| `useLatencyBreakdown()` | Full latency breakdown (robot + network + client) |
| `useRobotStats()` | Robot-side encoder/pipeline latency |
| `useApplicationRtt()` | Ping/pong round-trip time |
| `useAdaptiveStream()` | `{ networkStats, trackStats }` |

## Auth & Room Management

```tsx
import {
  useAuth,
  useRooms,
  useRoomConnection,
  useGamepadNavigation,
} from '@adamo-tech/react';

function App() {
  const { isAuthenticated, session, login, logout } = useAuth();
  const { rooms } = useRooms({ accessToken: session?.accessToken });
  const { signalingConfig, connectToRoom } = useRoomConnection({
    accessToken: session?.accessToken,
  });
  const { selectedIndex } = useGamepadNavigation({
    items: rooms,
    onSelect: (room) => connectToRoom(room.id),
  });

  if (signalingConfig) {
    return (
      <Teleoperate signaling={signalingConfig} autoConnect>
        <VideoFeed />
      </Teleoperate>
    );
  }
  // ...
}
```

| Hook | Purpose |
|------|---------|
| `useAuth()` | Login, logout, session persistence |
| `useRooms()` | Fetch available rooms |
| `useRoomConnection()` | Get room token and signaling config |
| `useGamepadNavigation()` | D-pad navigation for menus |

## Multi-Camera Layouts

```tsx
const MODES = [
  {
    name: 'drive',
    label: 'Drive',
    grid: [
      ['left_camera', 'front_camera', 'right_camera'],
      [null, 'rear_camera', null],
    ],
  },
  {
    name: 'manipulation',
    label: 'Arm',
    grid: [
      ['arm_camera', 'gripper_camera'],
    ],
  },
];

<MultiModeLayout
  modes={MODES}
  modeButtons={{ prev: 4, next: 5 }}  // LB/RB to switch
  canSwitchMode={() => !isMoving}
/>
```

## License

MIT
