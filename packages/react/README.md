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

The `XRTeleop` component:
- Renders stereo video (top/bottom format from ZED cameras)
- Sends head pose and controller position/rotation over data channel
- Supports Quest, Vive, Index controllers

Controller data sent to robot:
```typescript
{
  controller1: {
    axes: [],
    buttons: [trigger, grip, thumbstick, ...],
    position: [x, y, z],        // meters, room-relative
    quaternion: [w, x, y, z],   // rotation
    handedness: 'right',
  },
  controller2: { /* left hand */ },
  timestamp: number,
}
```

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
